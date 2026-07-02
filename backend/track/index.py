import json
import os
import urllib.parse
import re
import psycopg2


def parse_device(ua: str) -> tuple[str, str, str]:
    ua_lower = ua.lower()

    if 'mobile' in ua_lower or 'android' in ua_lower and 'mobile' in ua_lower:
        device = 'mobile'
    elif 'tablet' in ua_lower or ('android' in ua_lower and 'mobile' not in ua_lower):
        device = 'tablet'
    else:
        device = 'desktop'

    if 'windows' in ua_lower:
        os_name = 'Windows'
    elif 'android' in ua_lower:
        os_name = 'Android'
    elif 'iphone' in ua_lower or 'ipad' in ua_lower:
        os_name = 'iOS'
    elif 'mac os' in ua_lower or 'macos' in ua_lower:
        os_name = 'macOS'
    elif 'linux' in ua_lower:
        os_name = 'Linux'
    else:
        os_name = 'Other'

    if 'yabrowser' in ua_lower:
        browser = 'Yandex'
    elif 'opr' in ua_lower or 'opera' in ua_lower:
        browser = 'Opera'
    elif 'edg' in ua_lower:
        browser = 'Edge'
    elif 'chrome' in ua_lower:
        browser = 'Chrome'
    elif 'firefox' in ua_lower:
        browser = 'Firefox'
    elif 'safari' in ua_lower:
        browser = 'Safari'
    else:
        browser = 'Other'

    return device, os_name, browser


def handler(event: dict, context) -> dict:
    """Записывает визит посетителя сайта для статистики."""
    cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    session_id = body.get('session_id', '')
    page = body.get('page', '/')
    referrer = body.get('referrer', '')

    headers = event.get('headers', {}) or {}
    ua = headers.get('User-Agent') or headers.get('user-agent') or ''
    ip = (event.get('requestContext', {}) or {}).get('identity', {}).get('sourceIp') or headers.get('X-Forwarded-For', '').split(',')[0].strip()

    device, os_name, browser = parse_device(ua)

    dsn = os.environ['DATABASE_URL']
    con = psycopg2.connect(dsn)
    cur = con.cursor()

    cur.execute(
        "INSERT INTO t_p288352_240fps_site_project.visits (session_id, page, device, os, browser, ip, referrer, user_agent) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
        (session_id, page, device, os_name, browser, ip, referrer, ua[:500] if ua else '')
    )

    con.commit()
    cur.close()
    con.close()

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
    }
