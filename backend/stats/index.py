import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Возвращает статистику посещений: по дням, устройствам, ОС, браузерам и уникальные посетители."""
    cors = {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    dsn = os.environ['DATABASE_URL']
    con = psycopg2.connect(dsn)
    cur = con.cursor()

    # Посещения по дням (последние 30 дней)
    cur.execute("""
        SELECT DATE(visited_at) as day, COUNT(*) as visits, COUNT(DISTINCT session_id) as unique_visitors
        FROM t_p288352_240fps_site_project.visits
        WHERE visited_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(visited_at)
        ORDER BY day ASC
    """)
    by_day = [{'date': str(r[0]), 'visits': r[1], 'unique': r[2]} for r in cur.fetchall()]

    # По устройствам
    cur.execute("""
        SELECT device, COUNT(*) as cnt
        FROM t_p288352_240fps_site_project.visits
        WHERE visited_at >= NOW() - INTERVAL '30 days'
        GROUP BY device ORDER BY cnt DESC
    """)
    by_device = [{'device': r[0] or 'unknown', 'count': r[1]} for r in cur.fetchall()]

    # По ОС
    cur.execute("""
        SELECT os, COUNT(*) as cnt
        FROM t_p288352_240fps_site_project.visits
        WHERE visited_at >= NOW() - INTERVAL '30 days'
        GROUP BY os ORDER BY cnt DESC
    """)
    by_os = [{'os': r[0] or 'unknown', 'count': r[1]} for r in cur.fetchall()]

    # По браузерам
    cur.execute("""
        SELECT browser, COUNT(*) as cnt
        FROM t_p288352_240fps_site_project.visits
        WHERE visited_at >= NOW() - INTERVAL '30 days'
        GROUP BY browser ORDER BY cnt DESC
    """)
    by_browser = [{'browser': r[0] or 'unknown', 'count': r[1]} for r in cur.fetchall()]

    # По страницам
    cur.execute("""
        SELECT page, COUNT(*) as cnt
        FROM t_p288352_240fps_site_project.visits
        WHERE visited_at >= NOW() - INTERVAL '30 days'
        GROUP BY page ORDER BY cnt DESC LIMIT 10
    """)
    by_page = [{'page': r[0], 'count': r[1]} for r in cur.fetchall()]

    # Общие цифры
    cur.execute("""
        SELECT COUNT(*) as total, COUNT(DISTINCT session_id) as unique_total
        FROM t_p288352_240fps_site_project.visits
        WHERE visited_at >= NOW() - INTERVAL '30 days'
    """)
    row = cur.fetchone()
    totals = {'visits': row[0], 'unique': row[1]}

    cur.close()
    con.close()

    return {
        'statusCode': 200,
        'headers': {**cors, 'Content-Type': 'application/json'},
        'body': json.dumps({
            'totals': totals,
            'by_day': by_day,
            'by_device': by_device,
            'by_os': by_os,
            'by_browser': by_browser,
            'by_page': by_page,
        }, ensure_ascii=False, default=str),
    }
