import json
import os
import urllib.request
import urllib.parse


def handler(event: dict, context) -> dict:
    """Отправляет заявку клиента (звонок, заказ сборки, конфигуратор) в Telegram чат владельца через Bot API."""
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

    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')

    if not bot_token or not chat_id:
        return {
            'statusCode': 500,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': False, 'error': 'Telegram не настроен'}),
        }

    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
    }).encode()

    req = urllib.request.Request(url, data=data, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            resp_body = json.loads(resp.read().decode())
            if not resp_body.get('ok'):
                return {
                    'statusCode': 502,
                    'headers': {**cors, 'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': False, 'error': 'Telegram API отклонил запрос'}),
                }
    except Exception:
        return {
            'statusCode': 502,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': False, 'error': 'Не удалось отправить сообщение в Telegram'}),
        }

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': True}),
    }
