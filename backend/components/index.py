import json
import os
import hmac
import psycopg2


CATEGORIES = {
    'cpu': 'components_cpu',
    'motherboard': 'components_motherboard',
    'ram': 'components_ram',
    'gpu': 'components_gpu',
    'ssd': 'components_ssd',
    'cooler': 'components_cooler',
    'psu': 'components_psu',
    'case': 'components_case',
}


def check_password(event: dict) -> bool:
    headers = event.get('headers', {}) or {}
    password = headers.get('X-Admin-Password') or headers.get('x-admin-password') or ''
    valid_passwords = [os.environ.get('ADMIN_PASSWORD', ''), os.environ.get('CATALOG_PASSWORD', '')]
    return any(p and hmac.compare_digest(password, p) for p in valid_passwords)


def fetch_all(cur, include_inactive: bool):
    result = {}
    for key, table in CATEGORIES.items():
        where = '' if include_inactive else 'WHERE active = true'
        if key == 'case':
            cur.execute(f'SELECT id, name, price, image_url, brand, color, active FROM {table} {where} ORDER BY price')
            rows = cur.fetchall()
            case_ids = [r[0] for r in rows]
            gallery_map = {}
            if case_ids:
                cur.execute('SELECT case_id, image_url FROM components_case_images WHERE case_id = ANY(%s) ORDER BY case_id, sort_order', (case_ids,))
                for cid, img in cur.fetchall():
                    gallery_map.setdefault(cid, []).append(img)
            result[key] = [
                {
                    'id': r[0], 'name': r[1], 'price': r[2], 'image': r[3],
                    'brand': r[4], 'color': r[5], 'active': r[6], 'gallery': gallery_map.get(r[0], []),
                }
                for r in rows
            ]
        else:
            cur.execute(f'SELECT id, name, price, active FROM {table} {where} ORDER BY price')
            result[key] = [{'id': r[0], 'name': r[1], 'price': r[2], 'active': r[3]} for r in cur.fetchall()]
    return result


def handler(event: dict, context) -> dict:
    """Возвращает и редактирует комплектующие (справочник цен) по категориям для калькулятора и CRM."""
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
        include_inactive = params.get('all') == '1' and check_password(event)
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        result = fetch_all(cur, include_inactive)
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps(result, ensure_ascii=False),
        }

    if not check_password(event):
        return {
            'statusCode': 401,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неверный пароль'}),
        }

    body = json.loads(event.get('body') or '{}')
    category = body.get('category')
    if category not in CATEGORIES:
        return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'Неизвестная категория'})}
    table = CATEGORIES[category]

    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    try:
        if method == 'POST':
            name = body.get('name', '')
            price = body.get('price', 0)
            if category == 'case':
                cur.execute(
                    f'INSERT INTO {table} (name, price, image_url, brand, color, active) VALUES (%s, %s, %s, %s, %s, true) RETURNING id',
                    (name, price, body.get('image'), body.get('brand'), body.get('color')),
                )
            else:
                cur.execute(
                    f'INSERT INTO {table} (name, price, active) VALUES (%s, %s, true) RETURNING id',
                    (name, price),
                )
            new_id = cur.fetchone()[0]
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'id': new_id}),
            }

        if method == 'PUT':
            item_id = body.get('id')
            if not item_id:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'id обязателен'})}
            fields = ['name', 'price', 'active'] + (['image_url', 'brand', 'color'] if category == 'case' else [])
            body_keys = {'image_url': 'image'}
            updates = []
            values = []
            for f in fields:
                src_key = body_keys.get(f, f)
                if src_key in body:
                    updates.append(f'{f} = %s')
                    values.append(body[src_key])
            if not updates:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'Нет полей для обновления'})}
            values.append(item_id)
            cur.execute(f'UPDATE {table} SET {", ".join(updates)} WHERE id = %s', values)
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
            }

        if method == 'DELETE':
            item_id = body.get('id')
            if not item_id:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'id обязателен'})}
            cur.execute(f'UPDATE {table} SET active = false WHERE id = %s', (item_id,))
            conn.commit()
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
    finally:
        cur.close()
        conn.close()
