import json
import os
import base64
import hmac
import uuid
import psycopg2
import boto3


TABLE = 't_p288352_240fps_site_project.products'

FIELDS = ['name', 'brand', 'cpu_brand', 'cpu', 'gpu', 'ram', 'storage', 'price', 'fps', 'tag', 'active', 'sort_order']


def row_to_dict(row, cols):
    return dict(zip(cols, row))


def check_password(event: dict) -> bool:
    headers = event.get('headers', {}) or {}
    password = headers.get('X-Admin-Password') or headers.get('x-admin-password') or ''
    valid_password = os.environ.get('ADMIN_PASSWORD', '')
    return hmac.compare_digest(password, valid_password)


def upload_image(file_base64: str, content_type: str) -> str:
    ext = 'jpg'
    if 'png' in content_type:
        ext = 'png'
    elif 'webp' in content_type:
        ext = 'webp'
    file_data = base64.b64decode(file_base64)
    file_key = f'products/{uuid.uuid4()}.{ext}'
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=file_key, Body=file_data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"


def handler(event: dict, context) -> dict:
    """Управление каталогом сборок ПК: список, создание, редактирование, удаление и загрузка фото."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
        'Access-Control-Max-Age': '86400',
    }

    method = event.get('httpMethod')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    dsn = os.environ['DATABASE_URL']

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        is_admin = check_password(event)
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        if is_admin and params.get('all') == '1':
            cur.execute(f'SELECT id, name, brand, cpu_brand, cpu, gpu, ram, storage, price, fps, tag, img, imgs, active, sort_order FROM {TABLE} ORDER BY sort_order')
        else:
            cur.execute(f'SELECT id, name, brand, cpu_brand, cpu, gpu, ram, storage, price, fps, tag, img, imgs, active, sort_order FROM {TABLE} WHERE active = true ORDER BY sort_order')
        cols = ['id', 'name', 'brand', 'cpu_brand', 'cpu', 'gpu', 'ram', 'storage', 'price', 'fps', 'tag', 'img', 'imgs', 'active', 'sort_order']
        rows = [row_to_dict(r, cols) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps(rows, ensure_ascii=False),
        }

    if not check_password(event):
        return {
            'statusCode': 401,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неверный пароль'}),
        }

    body = json.loads(event.get('body') or '{}')

    if method == 'POST':
        img = body.get('img', '')
        if body.get('file_base64'):
            img = upload_image(body['file_base64'], body.get('content_type', 'image/jpeg'))

        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute(f'SELECT COALESCE(MAX(sort_order), 0) + 1 FROM {TABLE}')
        sort_order = cur.fetchone()[0]
        cur.execute(
            f'INSERT INTO {TABLE} (name, brand, cpu_brand, cpu, gpu, ram, storage, price, fps, tag, img, imgs, sort_order) '
            f'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id',
            (
                body.get('name', ''), body.get('brand', 'NVIDIA'), body.get('cpu_brand', 'Intel'),
                body.get('cpu', ''), body.get('gpu', ''), body.get('ram', 16), body.get('storage', 500),
                body.get('price', 0), body.get('fps', ''), body.get('tag'), img, [img] if img else [], sort_order,
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'id': new_id, 'img': img}),
        }

    if method == 'PUT':
        product_id = body.get('id')
        if not product_id:
            return {
                'statusCode': 400,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'id обязателен'}),
            }

        updates = []
        values = []
        for f in FIELDS:
            if f in body:
                updates.append(f'{f} = %s')
                values.append(body[f])

        img_url = None
        if body.get('file_base64'):
            img_url = upload_image(body['file_base64'], body.get('content_type', 'image/jpeg'))
            updates.append('img = %s')
            values.append(img_url)
            updates.append('imgs = %s')
            values.append([img_url])
        elif 'img' in body:
            updates.append('img = %s')
            values.append(body['img'])

        if not updates:
            return {
                'statusCode': 400,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Нет полей для обновления'}),
            }

        updates.append('updated_at = NOW()')
        values.append(product_id)

        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute(f'UPDATE {TABLE} SET {", ".join(updates)} WHERE id = %s', values)
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'img': img_url}),
        }

    if method == 'DELETE':
        product_id = body.get('id')
        if not product_id:
            return {
                'statusCode': 400,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'id обязателен'}),
            }
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute(f'DELETE FROM {TABLE} WHERE id = %s', (product_id,))
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
        }

    return {
        'statusCode': 405,
        'headers': cors,
        'body': json.dumps({'error': 'Метод не поддерживается'}),
    }
