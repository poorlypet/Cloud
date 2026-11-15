# Strict, fresh audit of every active product: description, materials & care, size guide covering every sold size with real measurements.
import json, re, sys, os, collections, html as H
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S)
from gql import gql
Q = '''query($a:String){products(first:100,after:$a,query:"status:active"){pageInfo{hasNextPage endCursor}nodes{id handle title vendor productType descriptionHtml
 options{name optionValues{name}}
 sg:metafield(namespace:"custom",key:"size_guide"){value} mc:metafield(namespace:"custom",key:"materials_care"){value}
 src:metafield(namespace:"custom",key:"product_upload_source_url"){value}}}}'''
P, a = [], None
while True:
    r = gql(Q, {'a': a})
    if not r: continue
    r = r['products']; P += r['nodes']
    if not r['pageInfo']['hasNextPage']: break
    a = r['pageInfo']['endCursor']
json.dump(P, open(f'{S}/fresh_products.json', 'w'))
def text(h): return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', h or ''))).strip()
iss = collections.defaultdict(list)
for p in P:
    d = text(p['descriptionHtml'])
    if len(d) < 120: iss['desc'].append(p['handle'])
    mc = (p['mc'] or {}).get('value') or ''
    lines = [l for l in mc.split('\n') if l.strip() and l.strip() not in ('Materials', 'Care')]
    if len(lines) < 2 or 'Materials' not in mc: iss['materials'].append(p['handle'])
    sizes = next((o['optionValues'] for o in p['options'] if o['name'].lower() == 'size'), None)
    sg = (p['sg'] or {}).get('value') or ''
    if sizes:
        names = [v['name'] for v in sizes]
        rows = {l.split('|')[0].strip(): l for l in sg.split('\n')[1:] if '|' in l}
        miss = [n for n in names if n not in rows]
        if not sg: iss['no size guide'].append(p['handle'])
        elif miss: iss['size rows missing'].append(f"{p['handle']} missing {miss}")
        bad = [n for n, l in rows.items() if n in names and not re.search(r'\d', l.split('|', 1)[1])]
        if bad: iss['size rows without numbers'].append(f"{p['handle']} {bad}")
    else:
        # one-size items still need their dimensions somewhere
        if not sg and not re.search(r'\d+\s*(x|×)\s*\d+|\d+\s*(cm|ml|g|kg|mm)\b', d + ' ' + mc, re.I): iss['no dimensions (one size)'].append(p['handle'])
for k, v in iss.items():
    vend = collections.Counter(next(p['vendor'] for p in P if p['handle'] == x.split(' ')[0]) for x in v)
    print(f'{k}: {len(v)}  {dict(vend)}')
json.dump(iss, open(f'{S}/strict_issues.json', 'w'), indent=1)
print('products', len(P))
