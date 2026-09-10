import json
import os
import socket
import ssl
import http.client
import urllib.request
import urllib.parse
import urllib.error
import psycopg2

LEADS_TABLE = 't_p288352_240fps_site_project.leads'

# Часть IP api.telegram.org недоступна из облака (DNS отдаёт заблокированный адрес),
# поэтому перебираем известные рабочие адреса, а DNS используем как запасной вариант.
TELEGRAM_KNOWN_IPS = [
    '149.154.167.220',
    '149.154.167.197',
    '149.154.167.198',
    '149.154.167.199',
]


def telegram_ips() -> list:
    ips = list(TELEGRAM_KNOWN_IPS)
    try:
        for res in socket.getaddrinfo('api.telegram.org', 443, socket.AF_INET):
            ip = res[4][0]
            if ip not in ips:
                ips.append(ip)
    except Exception as e:
        print(f'Telegram DNS failed: {repr(e)}')
    return ips

_orig_getaddrinfo = socket.getaddrinfo


def _ipv4_only_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)


socket.getaddrinfo = _ipv4_only_getaddrinfo


def _post(url: str, data: bytes, headers: dict) -> tuple:
    req = urllib.request.Request(url, data=data, method='POST', headers=headers)
    with urllib.request.urlopen(req, timeout=4) as resp:
        return resp.status, resp.read().decode()


def send_via_max(text: str) -> bool:
    bot_token = os.environ.get('MAX_BOT_TOKEN', '')
    chat_id = os.environ.get('MAX_CHAT_ID', '')
    if not bot_token or not chat_id:
        print('MAX skipped: not configured')
        return False

    url = f'https://platform-api.max.ru/messages?chat_id={urllib.parse.quote(chat_id)}'
    data = json.dumps({'text': text}).encode()
    headers = {'Authorization': bot_token, 'Content-Type': 'application/json'}

    try:
        status, _ = _post(url, data, headers)
        if 200 <= status < 300:
            return True
        print(f'MAX unexpected status: {status}')
    except urllib.error.HTTPError as e:
        print(f'MAX HTTPError {e.code}: {e.read().decode()}')
    except Exception as e:
        print(f'MAX exception: {repr(e)}')
    return False


def send_via_telegram(text: str) -> bool:
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not bot_token or not chat_id:
        print('Telegram skipped: not configured')
        return False

    data = urllib.parse.urlencode({'chat_id': chat_id, 'text': text}).encode()
    path = f'/bot{bot_token}/sendMessage'

    ctx = ssl.create_default_context()

    for ip in telegram_ips():
        try:
            raw_sock = socket.create_connection((ip, 443), timeout=5)
            tls_sock = ctx.wrap_socket(raw_sock, server_hostname='api.telegram.org')
            conn = http.client.HTTPSConnection('api.telegram.org', 443, timeout=5)
            conn.sock = tls_sock
            conn.request(
                'POST', path, body=data,
                headers={
                    'Host': 'api.telegram.org',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': str(len(data)),
                },
            )
            resp_text = conn.getresponse().read().decode()
            conn.close()
            if json.loads(resp_text).get('ok'):
                print(f'Telegram delivered via {ip}')
                return True
            print(f'Telegram API error via {ip}: {resp_text}')
            return False
        except Exception as e:
            print(f'Telegram {ip} failed: {repr(e)}')
            continue

    print('Telegram: all endpoints unreachable')
    return False


def save_lead(text: str, delivered: bool, channel: str) -> bool:
    dsn = os.environ.get('DATABASE_URL', '')
    if not dsn:
        print('DB skipped: DATABASE_URL not set')
        return False
    try:
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        safe_text = text.replace("'", "''")
        safe_channel = channel.replace("'", "''")
        cur.execute(
            f"INSERT INTO {LEADS_TABLE} (text, delivered, channel) "
            f"VALUES ('{safe_text}', {'TRUE' if delivered else 'FALSE'}, '{safe_channel}')"
        )
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f'DB save exception: {repr(e)}')
        return False


def handler(event: dict, context) -> dict:
    """Принимает заявку клиента (звонок, заказ сборки, конфигуратор), сохраняет её в базу и отправляет владельцу в MAX или Telegram."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    if event.get('httpMethod') != 'POST':
        return {
            'statusCode': 405,
            'headers': cors,
            'body': json.dumps({'error': 'Метод не поддерживается'}),
        }

    body = json.loads(event.get('body') or '{}')
    text = body.get('text', '')

    if not text.strip():
        return {
            'statusCode': 400,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': False, 'error': 'Пустое сообщение'}),
        }

    channel = 'none'
    if send_via_max(text):
        channel = 'max'
    elif send_via_telegram(text):
        channel = 'telegram'

    delivered = channel != 'none'
    saved = save_lead(text, delivered, channel)

    if delivered or saved:
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'channel': channel, 'saved': saved}),
        }

    return {
        'statusCode': 502,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': False, 'error': 'Не удалось принять заявку'}),
    }