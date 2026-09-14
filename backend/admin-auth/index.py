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

    accounts = [
        {
            'login': os.environ.get('ADMIN_LOGIN', ''),
            'password': os.environ.get('ADMIN_PASSWORD', ''),
            'role': 'admin',
        },
        {
            'login': os.environ.get('ADMIN2_LOGIN', ''),
            'password': os.environ.get('ADMIN2_PASSWORD', ''),
            'role': 'admin',
        },
        {
            'login': os.environ.get('CATALOG_LOGIN', ''),
            'password': os.environ.get('CATALOG_PASSWORD', ''),
            'role': 'catalog',
        },
        # Учётная запись «Тюмень» отключена вместе с закрытием раздела CRM.
        # Чтобы вернуть — раскомментируйте блок ниже.
        # {
        #     'login': os.environ.get('TUMEN_LOGIN', ''),
        #     'password': os.environ.get('TUMEN_PASSWORD', ''),
        #     'role': 'tyumen',
        # },
    ]

    for acc in accounts:
        if not acc['login']:
            continue
        # Сравниваем в байтах: иначе логин с русскими буквами роняет функцию
        login_ok = hmac.compare_digest(login.encode('utf-8'), acc['login'].encode('utf-8'))
        password_ok = hmac.compare_digest(password.encode('utf-8'), acc['password'].encode('utf-8'))
        if login_ok and password_ok:
            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'role': acc['role']}),
            }

    return {
        'statusCode': 401,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({'ok': False, 'error': 'Неверный логин или пароль'}),
    }