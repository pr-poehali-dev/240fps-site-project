import os
import re
import datetime
import psycopg2

TABLE = 't_p288352_240fps_site_project.products'
SITE = 'https://240fps.ru'

RU_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
}


def build_slug(name: str) -> str:
    s = ''.join(RU_MAP.get(ch, ch) for ch in name.lower())
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def esc(text: str) -> str:
    return (text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                .replace('"', '&quot;').replace("'", '&apos;'))


def handler(event: dict, context) -> dict:
    """Отдаёт карту сайта sitemap.xml со всеми страницами сборок — список берётся из базы, поэтому новые сборки попадают в карту автоматически."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    today = datetime.date.today().isoformat()

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(f"SELECT name, img FROM {TABLE} WHERE active IS NOT FALSE ORDER BY price")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
        f'  <url>\n    <loc>{SITE}/</loc>\n    <lastmod>{today}</lastmod>\n'
        f'    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>',
        f'  <url>\n    <loc>{SITE}/calculator</loc>\n    <lastmod>{today}</lastmod>\n'
        f'    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>',
    ]

    for name, img in rows:
        slug = build_slug(name or '')
        if not slug:
            continue
        image_tag = ''
        if img and str(img).startswith('http'):
            image_tag = (
                f'\n    <image:image>'
                f'\n      <image:loc>{esc(str(img))}</image:loc>'
                f'\n      <image:title>{esc(name)} — игровой компьютер</image:title>'
                f'\n    </image:image>'
            )
        parts.append(
            f'  <url>\n    <loc>{SITE}/build/{slug}</loc>\n    <lastmod>{today}</lastmod>\n'
            f'    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>{image_tag}\n  </url>'
        )

    parts.append('</urlset>')
    xml = '\n'.join(parts) + '\n'

    return {
        'statusCode': 200,
        'headers': {
            **cors,
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
        'body': xml,
    }
