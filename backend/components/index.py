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

PRODUCTS_TABLE = 't_p288352_240fps_site_project.products'

LINK_FIELD = {
    'cpu': 'cpu_id',
    'gpu': 'gpu_id',
    'ram': 'ram_id',
    'ssd': 'ssd_id',
    'motherboard': 'motherboard_id',
    'cooler': 'cooler_id',
    'psu': 'psu_id',
    'case': 'case_id',
}

COMPONENT_TABLE_BY_LINK = {
    'cpu_id': 'components_cpu',
    'gpu_id': 'components_gpu',
    'ram_id': 'components_ram',
    'ssd_id': 'components_ssd',
    'motherboard_id': 'components_motherboard',
    'cooler_id': 'components_cooler',
    'psu_id': 'components_psu',
    'case_id': 'components_case',
}


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


def recalc_products_using(cur, category: str, component_id: int):
    """Пересчитывает цену всех сборок в каталоге, которые используют изменённую комплектующую и считают цену автоматически."""
    link_field = LINK_FIELD.get(category)
    if not link_field:
        return
    cur.execute(
        f'SELECT id, cpu_id, gpu_id, ram_id, ssd_id, motherboard_id, cooler_id, psu_id, case_id '
        f'FROM {PRODUCTS_TABLE} WHERE auto_price = true AND {link_field} = %s',
        (component_id,),
    )
    products = cur.fetchall()
    if not products:
        return
    link_fields = ['cpu_id', 'gpu_id', 'ram_id', 'ssd_id', 'motherboard_id', 'cooler_id', 'psu_id', 'case_id']
    for row in products:
        product_id = row[0]
        links = dict(zip(link_fields, row[1:9]))
        total = 0
        for field, comp_id in links.items():
            if not comp_id:
                continue
            comp_table = f"t_p288352_240fps_site_project.{COMPONENT_TABLE_BY_LINK[field]}"
            cur.execute(f'SELECT price FROM {comp_table} WHERE id = %s', (comp_id,))
            comp_row = cur.fetchone()
            if comp_row:
                total += comp_row[0]
        new_price = total + calc_assembly_fee(total)
        cur.execute(f'UPDATE {PRODUCTS_TABLE} SET price = %s, updated_at = NOW() WHERE id = %s', (new_price, product_id))


def check_password(event: dict) -> bool:
    headers = event.get('headers', {}) or {}
    password = headers.get('X-Admin-Password') or headers.get('x-admin-password') or ''
    valid_passwords = [os.environ.get('ADMIN_PASSWORD', ''), os.environ.get('ADMIN2_PASSWORD', ''), os.environ.get('CATALOG_PASSWORD', '')]
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
        elif key == 'cpu' or key == 'motherboard':
            cur.execute(f'SELECT id, name, price, active, socket FROM {table} {where} ORDER BY price')
            result[key] = [{'id': r[0], 'name': r[1], 'price': r[2], 'active': r[3], 'socket': r[4]} for r in cur.fetchall()]
        elif key == 'ram':
            cur.execute(f'SELECT id, name, price, active, ram_type FROM {table} {where} ORDER BY price')
            result[key] = [{'id': r[0], 'name': r[1], 'price': r[2], 'active': r[3], 'ram_type': r[4]} for r in cur.fetchall()]
        elif key == 'psu':
            cur.execute(f'SELECT id, name, price, active, power_tier FROM {table} {where} ORDER BY price')
            result[key] = [{'id': r[0], 'name': r[1], 'price': r[2], 'active': r[3], 'power_tier': r[4]} for r in cur.fetchall()]
        elif key == 'gpu':
            cur.execute(f'SELECT id, name, price, active, min_power_tier FROM {table} {where} ORDER BY price')
            result[key] = [{'id': r[0], 'name': r[1], 'price': r[2], 'active': r[3], 'min_power_tier': r[4]} for r in cur.fetchall()]
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
            elif category in ('cpu', 'motherboard'):
                cur.execute(
                    f'INSERT INTO {table} (name, price, active, socket) VALUES (%s, %s, true, %s) RETURNING id',
                    (name, price, body.get('socket')),
                )
            elif category == 'ram':
                cur.execute(
                    f'INSERT INTO {table} (name, price, active, ram_type) VALUES (%s, %s, true, %s) RETURNING id',
                    (name, price, body.get('ram_type')),
                )
            elif category == 'psu':
                cur.execute(
                    f'INSERT INTO {table} (name, price, active, power_tier) VALUES (%s, %s, true, %s) RETURNING id',
                    (name, price, body.get('power_tier')),
                )
            elif category == 'gpu':
                cur.execute(
                    f'INSERT INTO {table} (name, price, active, min_power_tier) VALUES (%s, %s, true, %s) RETURNING id',
                    (name, price, body.get('min_power_tier')),
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
            extra_fields = []
            if category == 'case':
                extra_fields = ['image_url', 'brand', 'color']
            elif category in ('cpu', 'motherboard'):
                extra_fields = ['socket']
            elif category == 'ram':
                extra_fields = ['ram_type']
            elif category == 'psu':
                extra_fields = ['power_tier']
            elif category == 'gpu':
                extra_fields = ['min_power_tier']
            fields = ['name', 'price', 'active'] + extra_fields
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
            if 'price' in body:
                recalc_products_using(cur, category, item_id)
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