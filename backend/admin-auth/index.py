import json
import os
import hmac
import hashlib


def handler(event: dict, context) -> dict:
    """Проверяет логин и пароль для доступа к странице статистики."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    login = body.get('login', '')
    password = body.get('password', '')

    valid_login = os.environ.get('ADMIN_LOGIN', '')
    valid_password = os.environ.get('ADMIN_PASSWORD', '')

    login_ok = hmac.compare_digest(login, valid_login)
    password_ok = hmac.compare_digest(password, valid_password)

    if login_ok and password_ok:
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
        }

    return {
        'statusCode': 401,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': False, 'error': 'Неверный логин или пароль'}),
    }
