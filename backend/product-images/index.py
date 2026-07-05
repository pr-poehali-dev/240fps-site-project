import json
import os
import base64
import hmac
import uuid
import psycopg2
import boto3


def handler(event: dict, context) -> dict:
    """Возвращает и обновляет фото товаров каталога. GET — список фото, POST — загрузка нового фото (требует пароль админа)."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
        'Access-Control-Max-Age': '86400',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    dsn = os.environ['DATABASE_URL']

    if event.get('httpMethod') == 'GET':
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute('SELECT product_id, name, img FROM t_p288352_240fps_site_project.product_images ORDER BY product_id')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        result = [{'product_id': r[0], 'name': r[1], 'img': r[2]} for r in rows]
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps(result, ensure_ascii=False),
        }

    if event.get('httpMethod') == 'POST':
        headers = event.get('headers', {}) or {}
        password = headers.get('X-Admin-Password') or headers.get('x-admin-password') or ''
        valid_password = os.environ.get('ADMIN_PASSWORD', '')

        if not hmac.compare_digest(password, valid_password):
            return {
                'statusCode': 401,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Неверный пароль'}),
            }

        body = json.loads(event.get('body') or '{}')
        product_id = body.get('product_id')
        file_base64 = body.get('file_base64', '')
        content_type = body.get('content_type', 'image/jpeg')

        if not product_id or not file_base64:
            return {
                'statusCode': 400,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'product_id и file_base64 обязательны'}),
            }

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

        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"

        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        cur.execute(
            'UPDATE t_p288352_240fps_site_project.product_images SET img = %s, updated_at = NOW() WHERE product_id = %s',
            (cdn_url, product_id)
        )
        conn.commit()
        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'img': cdn_url}),
        }

    return {
        'statusCode': 405,
        'headers': cors,
        'body': json.dumps({'error': 'Метод не поддерживается'}),
    }
