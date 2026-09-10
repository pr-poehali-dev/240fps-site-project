import json
import os
import urllib.request
import urllib.parse
import urllib.error
import psycopg2

LEADS_TABLE = 't_p288352_240fps_site_project.leads'


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

    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = urllib.parse.urlencode({'chat_id': chat_id, 'text': text}).encode()
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    try:
        status, resp_text = _post(url, data, headers)
        if json.loads(resp_text).get('ok'):
            return True
        print(f'Telegram API error: {resp_text}')
    except urllib.error.HTTPError as e:
        print(f'Telegram HTTPError {e.code}: {e.read().decode()}')
    except Exception as e:
        print(f'Telegram exception: {repr(e)}')
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
