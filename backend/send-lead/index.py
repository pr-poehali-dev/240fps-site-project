import json
import os
import urllib.request
import urllib.parse
import urllib.error


def handler(event: dict, context) -> dict:
    """Отправляет заявку клиента (звонок, заказ сборки, конфигуратор) в чат владельца в мессенджере MAX через Bot API."""
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

    bot_token = os.environ.get('MAX_BOT_TOKEN', '')
    chat_id = os.environ.get('MAX_CHAT_ID', '')

    if not bot_token or not chat_id:
        return {
            'statusCode': 500,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': False, 'error': 'MAX не настроен'}),
        }

    url = f'https://platform-api.max.ru/messages?chat_id={urllib.parse.quote(chat_id)}'
    data = json.dumps({'text': text}).encode()

    last_error = None
    for attempt in range(3):
        req = urllib.request.Request(
            url,
            data=data,
            method='POST',
            headers={'Authorization': bot_token, 'Content-Type': 'application/json'},
        )
        try:
            with urllib.request.urlopen(req, timeout=8) as resp:
                if 200 <= resp.status < 300:
                    return {
                        'statusCode': 200,
                        'headers': {**cors, 'Content-Type': 'application/json'},
                        'body': json.dumps({'ok': True}),
                    }
                print(f'MAX API unexpected status: {resp.status}')
                last_error = 'MAX API отклонил запрос'
                break
        except urllib.error.HTTPError as e:
            err_body = e.read().decode()
            print(f'MAX HTTPError {e.code}: {err_body}')
            last_error = 'Не удалось отправить сообщение в MAX'
            break
        except Exception as e:
            print(f'MAX send exception (attempt {attempt + 1}): {repr(e)}')
            last_error = 'Не удалось отправить сообщение в MAX'
            continue

    return {
        'statusCode': 502,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': False, 'error': last_error}),
    }