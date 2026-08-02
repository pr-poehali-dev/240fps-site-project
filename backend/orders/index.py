import json
import os
import hmac
import psycopg2


ORDERS_TABLE = 't_p288352_240fps_site_project.orders'
ITEMS_TABLE = 't_p288352_240fps_site_project.order_items'
SETTINGS_TABLE = 't_p288352_240fps_site_project.app_settings'

ORDER_FIELDS = ['city', 'customer_name', 'customer_phone', 'final_date', 'total_price', 'assembly_cost', 'parts_cost_price', 'sort_order', 'order_number', 'comment']
ITEM_FIELDS = ['component_name', 'price', 'cost_price', 'availability', 'delivery_date', 'sort_order', 'received', 'category']


def get_role(event: dict):
    headers = event.get('headers', {}) or {}
    password = headers.get('X-Admin-Password') or headers.get('x-admin-password') or ''
    accounts = [
        (os.environ.get('ADMIN_PASSWORD', ''), 'admin'),
        (os.environ.get('CATALOG_PASSWORD', ''), 'catalog'),
        (os.environ.get('TUMEN_PASSWORD', ''), 'tyumen'),
    ]
    for pwd, role in accounts:
        if pwd and hmac.compare_digest(password, pwd):
            return role
    return None


ROLE_CITY = {'tyumen': 'Тюмень'}


def order_to_dict(row):
    return {
        'id': row[0],
        'city': row[1],
        'customer_name': row[2],
        'customer_phone': row[3],
        'final_date': row[4].isoformat() if row[4] else None,
        'total_price': row[5],
        'assembly_cost': row[6],
        'status': row[7],
        'sort_order': row[8],
        'created_at': row[9].isoformat() if row[9] else None,
        'parts_cost_price': row[10],
        'warranty_number': row[11],
        'warranty_url': row[12],
        'order_number': row[13],
        'comment': row[14],
        'issued_at': row[15].isoformat() if row[15] else None,
    }


def item_to_dict(row):
    return {
        'id': row[0],
        'order_id': row[1],
        'component_name': row[2],
        'price': row[3],
        'cost_price': row[4],
        'availability': row[5],
        'delivery_date': row[6].isoformat() if row[6] else None,
        'sort_order': row[7],
        'received': row[8],
        'category': row[9],
    }


def insert_item(cur, order_id, item, sort_order):
    cur.execute(
        f'INSERT INTO {ITEMS_TABLE} (order_id, component_name, price, cost_price, availability, delivery_date, sort_order, received, category) '
        f'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
        (
            order_id, item.get('component_name', ''), item.get('price', 0), item.get('cost_price', 0),
            item.get('availability', 'in_stock'), item.get('delivery_date'), sort_order,
            item.get('received', False), item.get('category'),
        )
    )


def handler(event: dict, context) -> dict:
    """CRM управление заказами на сборку ПК: списки заказов по городам, комплектующие в заказе, приёмка на склад, выдача ПК."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
        'Access-Control-Max-Age': '86400',
    }

    method = event.get('httpMethod')

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    role = get_role(event)
    if not role:
        return {
            'statusCode': 401,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Неверный пароль'}),
        }
    allowed_city = ROLE_CITY.get(role)

    dsn = os.environ['DATABASE_URL']
    params = event.get('queryStringParameters') or {}
    resource = params.get('resource', 'orders')

    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    def order_city(order_id):
        cur.execute(f'SELECT city FROM {ORDERS_TABLE} WHERE id = %s', (order_id,))
        r = cur.fetchone()
        return r[0] if r else None

    def item_order_city(item_id):
        cur.execute(f'SELECT o.city FROM {ITEMS_TABLE} i JOIN {ORDERS_TABLE} o ON o.id = i.order_id WHERE i.id = %s', (item_id,))
        r = cur.fetchone()
        return r[0] if r else None

    forbidden = {
        'statusCode': 403,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'error': 'Нет доступа к этому городу'}),
    }

    try:
        if method == 'GET' and resource == 'settings':
            cur.execute(f'SELECT value FROM {SETTINGS_TABLE} WHERE key = %s', ('issued_reset_at',))
            row = cur.fetchone()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'issued_reset_at': row[0] if row else None}),
            }

        if method == 'GET':
            status = params.get('status', 'active')
            query = f'SELECT id, city, customer_name, customer_phone, final_date, total_price, assembly_cost, status, sort_order, created_at, parts_cost_price, warranty_number, warranty_url, order_number, comment, issued_at ' \
                    f'FROM {ORDERS_TABLE} WHERE status = %s'
            query_params = [status]
            if status == 'issued':
                cur.execute(f'SELECT value FROM {SETTINGS_TABLE} WHERE key = %s', ('issued_reset_at',))
                reset_row = cur.fetchone()
                if reset_row and reset_row[0]:
                    query += ' AND issued_at >= %s'
                    query_params.append(reset_row[0])
            if allowed_city:
                query += ' AND city = %s'
                query_params.append(allowed_city)
            query += ' ORDER BY issued_at DESC, city, sort_order, id' if status == 'issued' else ' ORDER BY city, sort_order, id'
            cur.execute(query, query_params)
            orders = [order_to_dict(r) for r in cur.fetchall()]
            order_ids = [o['id'] for o in orders]
            items_by_order = {}
            if order_ids:
                ids_str = ','.join(str(i) for i in order_ids)
                cur.execute(
                    f'SELECT id, order_id, component_name, price, cost_price, availability, delivery_date, sort_order, received, category '
                    f'FROM {ITEMS_TABLE} WHERE order_id IN ({ids_str}) ORDER BY order_id, sort_order, id'
                )
                for r in cur.fetchall():
                    d = item_to_dict(r)
                    items_by_order.setdefault(d['order_id'], []).append(d)
            for o in orders:
                o['items'] = items_by_order.get(o['id'], [])
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps(orders, ensure_ascii=False),
            }

        body = json.loads(event.get('body') or '{}')

        if method == 'PUT' and resource == 'settings':
            if allowed_city:
                return forbidden
            key = body.get('key')
            value = body.get('value')
            if not key:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'key обязателен'})}
            cur.execute(
                f'INSERT INTO {SETTINGS_TABLE} (key, value) VALUES (%s, %s) '
                f'ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
                (key, value)
            )
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
            }

        if method == 'POST' and resource == 'orders':
            if allowed_city and body.get('city', '') != allowed_city:
                return forbidden
            cur.execute(f'SELECT COALESCE(MAX(sort_order), 0) + 1 FROM {ORDERS_TABLE} WHERE city = %s', (body.get('city', ''),))
            sort_order = cur.fetchone()[0]
            cur.execute(
                f'INSERT INTO {ORDERS_TABLE} (city, customer_name, customer_phone, final_date, total_price, assembly_cost, parts_cost_price, sort_order, order_number, comment) '
                f'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id',
                (
                    body.get('city', ''), body.get('customer_name', ''), body.get('customer_phone', ''),
                    body.get('final_date'), body.get('total_price', 0), body.get('assembly_cost', 0),
                    body.get('parts_cost_price', 0), sort_order, body.get('order_number'), body.get('comment', ''),
                )
            )
            new_id = cur.fetchone()[0]

            items = body.get('items') or []
            for idx, item in enumerate(items):
                insert_item(cur, new_id, item, idx)

            conn.commit()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'id': new_id}),
            }

        if method == 'POST' and resource == 'items':
            order_id = body.get('order_id')
            if allowed_city and order_city(order_id) != allowed_city:
                return forbidden
            cur.execute(f'SELECT COALESCE(MAX(sort_order), 0) + 1 FROM {ITEMS_TABLE} WHERE order_id = %s', (order_id,))
            sort_order = cur.fetchone()[0]
            insert_item(cur, order_id, body, sort_order)
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
            }

        if method == 'PUT' and resource == 'orders':
            order_id = body.get('id')
            if not order_id:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'id обязателен'})}
            if allowed_city and (order_city(order_id) != allowed_city or body.get('city', allowed_city) != allowed_city):
                return forbidden
            updates = []
            values = []
            for f in ORDER_FIELDS:
                if f in body:
                    updates.append(f'{f} = %s')
                    values.append(body[f])
            if body.get('issue') is True:
                updates.append("status = 'issued'")
                updates.append('issued_at = NOW()')
            if not updates:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'Нет полей для обновления'})}
            updates.append('updated_at = NOW()')
            values.append(order_id)
            cur.execute(f'UPDATE {ORDERS_TABLE} SET {", ".join(updates)} WHERE id = %s', values)
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
            }

        if method == 'PUT' and resource == 'items':
            item_id = body.get('id')
            if not item_id:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'id обязателен'})}
            if allowed_city and item_order_city(item_id) != allowed_city:
                return forbidden
            updates = []
            values = []
            for f in ITEM_FIELDS:
                if f in body:
                    updates.append(f'{f} = %s')
                    values.append(body[f])
            if not updates:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'Нет полей для обновления'})}
            values.append(item_id)
            cur.execute(f'UPDATE {ITEMS_TABLE} SET {", ".join(updates)} WHERE id = %s', values)
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
            }

        if method == 'DELETE' and resource == 'orders':
            order_id = body.get('id')
            if not order_id:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'id обязателен'})}
            if allowed_city and order_city(order_id) != allowed_city:
                return forbidden
            cur.execute(f'DELETE FROM {ITEMS_TABLE} WHERE order_id = %s', (order_id,))
            cur.execute(f'DELETE FROM {ORDERS_TABLE} WHERE id = %s', (order_id,))
            conn.commit()
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
            }

        if method == 'DELETE' and resource == 'items':
            item_id = body.get('id')
            if not item_id:
                return {'statusCode': 400, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'id обязателен'})}
            if allowed_city and item_order_city(item_id) != allowed_city:
                return forbidden
            cur.execute(f'DELETE FROM {ITEMS_TABLE} WHERE id = %s', (item_id,))
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