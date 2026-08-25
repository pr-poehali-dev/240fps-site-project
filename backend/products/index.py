import json
import os
import base64
import hmac
import uuid
import psycopg2
import boto3


TABLE = 't_p288352_240fps_site_project.products'

FIELDS = ['name', 'brand', 'cpu_brand', 'ram', 'storage', 'fps', 'tag', 'active', 'sort_order', 'auto_price']
LINK_FIELDS = ['cpu_id', 'gpu_id', 'ram_id', 'ssd_id', 'motherboard_id', 'cooler_id', 'psu_id', 'case_id']

COMPONENT_TABLES = {
    'cpu_id': 't_p288352_240fps_site_project.components_cpu',
    'gpu_id': 't_p288352_240fps_site_project.components_gpu',
    'ram_id': 't_p288352_240fps_site_project.components_ram',
    'ssd_id': 't_p288352_240fps_site_project.components_ssd',
    'motherboard_id': 't_p288352_240fps_site_project.components_motherboard',
    'cooler_id': 't_p288352_240fps_site_project.components_cooler',
    'psu_id': 't_p288352_240fps_site_project.components_psu',
    'case_id': 't_p288352_240fps_site_project.components_case',
}

SELECT_COLS = [
    'id', 'name', 'brand', 'cpu_brand', 'cpu', 'gpu', 'ram', 'storage', 'price', 'fps', 'tag',
    'img', 'imgs', 'active', 'sort_order', 'cpu_id', 'gpu_id', 'ram_id', 'ssd_id',
    'motherboard_id', 'cooler_id', 'psu_id', 'case_id', 'auto_price',
]


def row_to_dict(row, cols):
    return dict(zip(cols, row))


def check_password(event: dict) -> bool:
    headers = event.get('headers', {}) or {}
    password = headers.get('X-Admin-Password') or headers.get('x-admin-password') or ''
    valid_passwords = [os.environ.get('ADMIN_PASSWORD', ''), os.environ.get('ADMIN2_PASSWORD', ''), os.environ.get('CATALOG_PASSWORD', '')]
    return any(p and hmac.compare_digest(password, p) for p in valid_passwords)


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


def calc_assembly_fee(parts_total: int) -> int:
    """Плата за сборку — та же формула, что и в калькуляторе на сайте (src/lib/pcParts.ts)."""
    if parts_total == 0:
        return 0
    if parts_total >= 300000:
        return 10000
    if parts_total >= 200000:
        return 7000
    if parts_total > 150000:
        return 6000
    return 5000


def compute_auto_price(cur, link_values: dict):
    """Считает цену из связанных комплектующих + плата за сборку (единая формула с калькулятором)."""
    total = 0
    for field, comp_table in COMPONENT_TABLES.items():
        comp_id = link_values.get(field)
        if not comp_id:
            continue
        cur.execute(f'SELECT price FROM {comp_table} WHERE id = %s', (comp_id,))
        row = cur.fetchone()
        if row:
            total += row[0]
    return total + calc_assembly_fee(total)


def get_component_names(cur, link_values: dict):
    """Возвращает {cpu_id_field: name} для проставления текстовых cpu/gpu полей."""
    names = {}
    for field in ('cpu_id', 'gpu_id'):
        comp_id = link_values.get(field)
        if not comp_id:
            continue
        table = COMPONENT_TABLES[field]
        cur.execute(f'SELECT name FROM {table} WHERE id = %s', (comp_id,))
        row = cur.fetchone()
        if row:
            names[field] = row[0]
    return names


def handler(event: dict, context) -> dict:
    """Управление каталогом сборок ПК: список, создание, редактирование, удаление, загрузка фото и автопересчёт цены из связанных комплектующих."""
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
        cols_str = ', '.join(SELECT_COLS)
        if is_admin and params.get('all') == '1':
            cur.execute(f'SELECT {cols_str} FROM {TABLE} ORDER BY sort_order')
        else:
            cur.execute(f'SELECT {cols_str} FROM {TABLE} WHERE active = true ORDER BY sort_order')
        rows = [row_to_dict(r, SELECT_COLS) for r in cur.fetchall()]
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
        photos = body.get('photos') or []
        imgs = []
        for p in photos[:5]:
            imgs.append(upload_image(p.get('file_base64', ''), p.get('content_type', 'image/jpeg')))

        if not imgs and body.get('file_base64'):
            imgs = [upload_image(body['file_base64'], body.get('content_type', 'image/jpeg'))]

        img = imgs[0] if imgs else body.get('img', '')

        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        link_values = {f: body.get(f) for f in LINK_FIELDS}
        auto_price = body.get('auto_price', True)
        comp_names = get_component_names(cur, link_values)
        price = compute_auto_price(cur, link_values) if auto_price else body.get('price', 0)

        cur.execute(f'SELECT COALESCE(MAX(sort_order), 0) + 1 FROM {TABLE}')
        sort_order = cur.fetchone()[0]
        cur.execute(
            f'INSERT INTO {TABLE} (name, brand, cpu_brand, cpu, gpu, ram, storage, price, fps, tag, img, imgs, sort_order, '
            f'cpu_id, gpu_id, ram_id, ssd_id, motherboard_id, cooler_id, psu_id, case_id, auto_price) '
            f'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id',
            (
                body.get('name', ''), body.get('brand', 'NVIDIA'), body.get('cpu_brand', 'Intel'),
                comp_names.get('cpu_id', body.get('cpu', '')), comp_names.get('gpu_id', body.get('gpu', '')),
                body.get('ram', 16), body.get('storage', 500),
                price, body.get('fps', ''), body.get('tag'), img, imgs, sort_order,
                link_values.get('cpu_id'), link_values.get('gpu_id'), link_values.get('ram_id'), link_values.get('ssd_id'),
                link_values.get('motherboard_id'), link_values.get('cooler_id'), link_values.get('psu_id'), link_values.get('case_id'),
                auto_price,
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'id': new_id, 'img': img, 'imgs': imgs, 'price': price}),
        }

    if method == 'PUT':
        product_id = body.get('id')
        if not product_id:
            return {
                'statusCode': 400,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'id обязателен'}),
            }

        conn = psycopg2.connect(dsn)
        cur = conn.cursor()

        updates = []
        values = []
        for f in FIELDS:
            if f in body:
                updates.append(f'{f} = %s')
                values.append(body[f])

        link_touched = any(f in body for f in LINK_FIELDS)
        if link_touched:
            for f in LINK_FIELDS:
                if f in body:
                    updates.append(f'{f} = %s')
                    values.append(body[f])

        should_recalc = body.get('auto_price', True) and link_touched
        if should_recalc:
            cur.execute(f'SELECT cpu_id, gpu_id, ram_id, ssd_id, motherboard_id, cooler_id, psu_id, case_id FROM {TABLE} WHERE id = %s', (product_id,))
            row = cur.fetchone()
            if row:
                current_links = dict(zip(LINK_FIELDS, row[:8]))
                for f in LINK_FIELDS:
                    if f in body:
                        current_links[f] = body[f]
                new_price = compute_auto_price(cur, current_links)
                updates.append('price = %s')
                values.append(new_price)
                comp_names = get_component_names(cur, current_links)
                if 'cpu_id' in comp_names:
                    updates.append('cpu = %s')
                    values.append(comp_names['cpu_id'])
                if 'gpu_id' in comp_names:
                    updates.append('gpu = %s')
                    values.append(comp_names['gpu_id'])
        elif 'price' in body:
            updates.append('price = %s')
            values.append(body['price'])

        final_imgs = None

        if 'imgs' in body or 'new_photos' in body:
            final_imgs = list(body.get('imgs') or [])
            new_photos = body.get('new_photos') or []
            for p in new_photos:
                if len(final_imgs) >= 5:
                    break
                final_imgs.append(upload_image(p.get('file_base64', ''), p.get('content_type', 'image/jpeg')))
            final_imgs = final_imgs[:5]
            updates.append('imgs = %s')
            values.append(final_imgs)
            updates.append('img = %s')
            values.append(final_imgs[0] if final_imgs else '')
        elif body.get('file_base64'):
            img_url = upload_image(body['file_base64'], body.get('content_type', 'image/jpeg'))
            final_imgs = [img_url]
            updates.append('img = %s')
            values.append(img_url)
            updates.append('imgs = %s')
            values.append(final_imgs)
        elif 'img' in body:
            updates.append('img = %s')
            values.append(body['img'])

        if not updates:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Нет полей для обновления'}),
            }

        updates.append('updated_at = NOW()')
        values.append(product_id)

        cur.execute(f'UPDATE {TABLE} SET {", ".join(updates)} WHERE id = %s', values)
        conn.commit()
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'imgs': final_imgs}),
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