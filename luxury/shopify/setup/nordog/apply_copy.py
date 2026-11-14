# Short description + key points + size table + materials & care from copy.json, onto every Nordog draft.
import json, re, html, hashlib, sys, os
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, S)
from gql import gql
D = os.path.dirname(os.path.abspath(__file__))
P = {p['handle']: p for p in json.load(open(f'{D}/products.json'))}
ST = json.load(open(f'{D}/state.json'))['products']
C = json.load(open(f'{D}/copy.json'))
def t(x): return re.sub(r'\n\s*\n+', '\n', html.unescape(re.sub(r'<[^>]+>', '\n', x or ''))).strip()
def src(h): return P.get(h) or next((p for k, p in sorted(P.items(), key=lambda kv: -len(kv[0])) if h.startswith(k)), None)
SET = 'mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{field message}}}'
DEL = 'mutation($m:[MetafieldIdentifierInput!]!){metafieldsDelete(metafields:$m){userErrors{message}}}'
UPD = 'mutation($p:ProductInput!){productUpdate(input:$p){userErrors{message}}}'
missing = []
for h, pid in ST.items():
    s = src(h)
    k = hashlib.md5(re.sub(r'\W', '', t(s['body_html']).lower()).encode()).hexdigest()[:8] if s else None
    c = C.get(k)
    if not c: missing.append((h, k)); continue
    e = gql(UPD, {'p': {'id': pid, 'descriptionHtml': f"<p>{html.escape(c['d'])}</p>"}})['productUpdate']['userErrors']
    mf = [{'ownerId': pid, 'namespace': 'custom', 'key': 'features', 'type': 'list.single_line_text_field', 'value': json.dumps(c['f'])}]
    mc = (['Materials'] + c['m'] if c.get('m') else []) + (['Care'] + c['c'] if c.get('c') else [])
    if mc: mf.append({'ownerId': pid, 'namespace': 'custom', 'key': 'materials_care', 'type': 'multi_line_text_field', 'value': '\n'.join(mc)})
    if c.get('s'): mf.append({'ownerId': pid, 'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': c['s']})
    e += gql(SET, {'m': mf})['metafieldsSet']['userErrors']
    dels = [{'ownerId': pid, 'namespace': 'custom', 'key': 'size_note'}]
    if not mc: dels.append({'ownerId': pid, 'namespace': 'custom', 'key': 'materials_care'})
    gql(DEL, {'m': dels})
    print('ok' if not e else f'ERR {e}', h, 'chart' if c.get('s') else '-', flush=True)
print('missing', missing)
