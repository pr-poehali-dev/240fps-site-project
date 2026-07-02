import json
import os
import csv
import io
import re
import urllib.parse
import psycopg2


TABLES = {
    'cpu': 'components_cpu',
    'gpu': 'components_gpu',
    'motherboard': 'components_motherboard',
    'ram': 'components_ram',
    'ssd': 'components_ssd',
    'psu': 'components_psu',
    'case': 'components_case',
    'cooler': 'components_cooler',
}

EXCLUDE_KEYWORDS = [
    'монитор', 'monitor', 'контроллер', 'controller', 'контролер',
    'разветвитель', 'вентилятор', 'prism', 'райзер', 'riser',
    'lovingcool ap', 'ocypus', 'splitter', 'hub'
]


def normalize(text: str) -> str:
    return re.sub(r'[\s\-_]+', ' ', text.lower().strip())


def extract_keywords(name: str) -> list:
    n = normalize(name)
    keywords = []
    patterns = [
        r'rtx\s*\d+\s*(?:ti)?\s*(?:\d+gb)?',
        r'rx\s*\d+\s*(?:xt)?',
        r'ryzen\s*\d+\s*[\w\d]+',
        r'r[5-9]\s+[\w\d]+',
        r'intel\s+core\s+i\d[-\s]\d+\w*',
        r'i[3-9][-\s]\d+\w*',
        r'ddr[45]\s*\d+\s*(?:gb)?',
        r'\d+\s*(?:gb|tb)\s*(?:nvme|sata|m\.?2)?',
        r'b\d{3}[a-z]+',
        r'h\d{3}[a-z]+',
        r'z\d{3}[a-z]+',
        r'a\d{3}[a-z]+',
        r'\d+w',
    ]
    for p in patterns:
        matches = re.findall(p, n)
        keywords.extend(matches)
    words = n.split()
    for w in words:
        if len(w) >= 4:
            keywords.append(w)
    return list(set(keywords))


def score_match(stock_name: str, db_name: str) -> int:
    sn = normalize(stock_name)
    dn = normalize(db_name)
    score = 0
    sk = extract_keywords(sn)
    dk = extract_keywords(dn)
    for kw in sk:
        if kw in dn:
            score += len(kw)
    for kw in dk:
        if kw in sn:
            score += len(kw)
    swords = set(sn.split())
    dwords = set(dn.split())
    common = swords & dwords
    score += sum(len(w) for w in common if len(w) >= 3)
    return score


def handler(event: dict, context) -> dict:
    """Принимает CSV-файл из 1С, сопоставляет товары с БД и обновляет наличие."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    body = json.loads(event.get('body') or '{}')
    csv_content = body.get('csv_content', '')

    if not csv_content:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'csv_content is required'}),
        }

    reader = csv.reader(io.StringIO(csv_content), delimiter='\t')
    rows = list(reader)

    if not rows:
        reader = csv.reader(io.StringIO(csv_content), delimiter=',')
        rows = list(reader)

    stock_names = []
    for row in rows:
        if not row:
            continue
        name_col = None
        for cell in row:
            cell = cell.strip()
            if len(cell) > 5 and not cell.replace(',', '').replace('.', '').replace(' ', '').isdigit():
                if cell.lower() not in ('товар', 'наименование', 'название', 'name', '№', 'номер'):
                    name_col = cell
                    break
        if name_col:
            skip = False
            for ex in EXCLUDE_KEYWORDS:
                if ex in name_col.lower():
                    skip = True
                    break
            if not skip:
                stock_names.append(name_col)

    dsn = os.environ['DATABASE_URL']
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()

    db_items = {}
    for key, table in TABLES.items():
        cur.execute(f'SELECT id, name FROM {table}')
        for row in cur.fetchall():
            db_items[row[0]] = {'id': row[0], 'name': row[1], 'table': table, 'category': key}

    for table in TABLES.values():
        cur.execute(f'UPDATE {table} SET in_stock = false')

    matched = []
    unmatched = []

    for stock_name in stock_names:
        best_id = None
        best_score = 0
        best_db_name = ''

        for item in db_items.values():
            s = score_match(stock_name, item['name'])
            if s > best_score:
                best_score = s
                best_id = item['id']
                best_db_name = item['name']
                best_table = item['table']

        if best_id and best_score >= 6:
            cur.execute(f'UPDATE {best_table} SET in_stock = true WHERE id = %s', (best_id,))
            matched.append({'stock': stock_name, 'db': best_db_name, 'score': best_score})
        else:
            unmatched.append(stock_name)

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
        },
        'body': json.dumps({
            'success': True,
            'matched': len(matched),
            'unmatched': len(unmatched),
            'details': matched,
            'not_found': unmatched,
        }, ensure_ascii=False),
    }
