# Every bed, harness, collar, lead and coat: does the size guide have a row for each size it is sold in?
import json, sys, re, os
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S)
from gql import gql
Q = '''query($c:String){products(first:100,after:$c,query:"vendor:Cloud7 OR vendor:Nordog OR vendor:Tadazhi OR vendor:'Molly and Stitch'"){pageInfo{hasNextPage endCursor}
 nodes{id handle title vendor productType tags options{name values} sg:metafield(namespace:"custom",key:"size_guide"){value}}}}'''
KIND = re.compile(r'(?i)bed|cushion|harness|collar|lead|leash|coat|jacket|parka|jumper|sweater|raincoat|pullover|hoodie|vest|clothing|mat\b|blanket|duvet')
out, c = [], None
while True:
    d = gql(Q, {'c': c})['products']
    for p in d['nodes']:
        txt = ' '.join([p['title'], p['productType'] or ''] + p['tags'])
        if not KIND.search(txt): continue
        sizes = next((o['values'] for o in p['options'] if o['name'].lower() == 'size'), None)
        sg = (p['sg'] or {}).get('value') or ''
        rows = [l.split('|')[0].strip() for l in sg.split('\n')[1:] if l.strip()]
        if sizes:
            missing = [s for s in sizes if s not in rows and not any(s in re.split(r'\s*[–/-]\s*', r) for r in rows)]
            if not sg or missing: out.append({'id': p['id'], 'h': p['handle'], 'v': p['vendor'], 't': p['title'], 'sizes': sizes, 'rows': rows, 'missing': missing})
        elif not sg: out.append({'id': p['id'], 'h': p['handle'], 'v': p['vendor'], 't': p['title'], 'sizes': None, 'rows': rows, 'missing': ['(no guide)']})
    if not d['pageInfo']['hasNextPage']: break
    c = d['pageInfo']['endCursor']
json.dump(out, open(f'{S}/audit_sizes.json', 'w'), indent=1)
from collections import Counter
print(len(out), 'products with gaps', Counter(o['v'] for o in out))
for o in out[:400]: print(o['v'][:8], '|', o['t'][:55], '| sizes', o['sizes'], '| rows', o['rows'][:10])
