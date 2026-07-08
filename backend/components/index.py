import json
import os
import urllib.parse
import pg8000.native


def handler(event: dict, context) -> dict:
    """Возвращает все комплектующие из БД по категориям для калькулятора сборки."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    p = urllib.parse.urlparse(dsn)
    con = pg8000.native.Connection(
        user=p.username,
        password=p.password,
        host=p.hostname,
        port=p.port or 5432,
        database=p.path.lstrip('/'),
    )

    categories = {
        'cpu': 'components_cpu',
        'motherboard': 'components_motherboard',
        'ram': 'components_ram',
        'gpu': 'components_gpu',
        'ssd': 'components_ssd',
        'cooler': 'components_cooler',
        'psu': 'components_psu',
        'case': 'components_case',
    }

    result = {}
    for key, table in categories.items():
        if key == 'case':
            rows = con.run(f'SELECT id, name, price, image_url, brand, color FROM {table} WHERE active = true ORDER BY price')
            case_ids = [r[0] for r in rows]
            gallery_map = {}
            if case_ids:
                ids_str = ','.join(str(i) for i in case_ids)
                gallery_rows = con.run(f'SELECT case_id, image_url FROM components_case_images WHERE case_id IN ({ids_str}) ORDER BY case_id, sort_order')
                for cid, img in gallery_rows:
                    gallery_map.setdefault(cid, []).append(img)
            result[key] = [
                {
                    'id': r[0], 'name': r[1], 'price': r[2], 'image': r[3],
                    'brand': r[4], 'color': r[5], 'gallery': gallery_map.get(r[0], []),
                }
                for r in rows
            ]
        else:
            rows = con.run(f'SELECT id, name, price FROM {table} WHERE active = true ORDER BY price')
            result[key] = [{'id': r[0], 'name': r[1], 'price': r[2]} for r in rows]

    con.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps(result, ensure_ascii=False),
    }