# Brott "<NAME> TEXTURE" listings: real print name from Brott's own product URL, product type in the title, then join the Textura print families.
import json, re, sys, os, collections
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S); sys.path.insert(0, f'{S}/c7')
from gql import gql
Q = '''query($a:String){products(first:100,after:$a,query:"vendor:'Brott Barcelona'"){pageInfo{hasNextPage endCursor}nodes{id handle title productType
 options{name optionValues{name}} sib:metafield(namespace:"custom",key:"colour_siblings"){value} sw:metafield(namespace:"custom",key:"swatch"){value}
 src:metafield(namespace:"custom",key:"product_upload_source_url"){value}}}}'''
ALL, a = [], None
while True:
    r = gql(Q, {'a': a})['products']; ALL += r['nodes']
    if not r['pageInfo']['hasNextPage']: break
    a = r['pageInfo']['endCursor']
def kind(p):
    vals = [v['name'] for o in p['options'] for v in o['optionValues']]
    if p['productType'] == 'Dog harness': return 'dog harness'
    if p['productType'] == 'Dog leash': return 'dog leash'
    if any(v.startswith('Martingale') for v in vals) and not any(v in ('XS', 'S', 'M', 'L') for v in vals): return 'martingale collar'
    if any(v in ('Piccolo', 'Whippet', 'Greyhound') for v in vals): return 'greyhound martingale collar'
    return 'dog collar'
ren = {}
for p in ALL:
    if not re.search(r'(?i)\btexture$', p['title'].strip()): continue
    slug = ((p['src'] or {}).get('value') or '').rstrip('/').split('/')[-1]
    m = re.search(r'textura-([a-z]+)', slug)
    if not m: print('NO NAME', p['title'], slug); continue
    name = m.group(1).title()
    ren[p['id']] = f'Textura {name} {kind(p)}'
# duplicate new titles: keep both apart by type is already done; report any clash
cnt = collections.Counter(ren.values())
for pid, t in ren.items():
    old = next(p['title'] for p in ALL if p['id'] == pid)
    print(f'{old!r:28} -> {t}' + ('   CLASH' if cnt[t] > 1 else ''))
if sys.argv[1:] != ['go']: sys.exit()
UPD = 'mutation($p:ProductUpdateInput!){productUpdate(product:$p){product{handle}userErrors{message}}}'
for pid, t in ren.items():
    if cnt[t] > 1: continue
    h = 'brott-' + re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')
    r = gql(UPD, {'p': {'id': pid, 'title': t, 'handle': h, 'redirectNewHandle': True}})['productUpdate']
    if r['userErrors']: print('ERR', t, r['userErrors'])
    for p in ALL:
        if p['id'] == pid: p['title'] = t; p['new'] = True
# families: "Textura <Name> <rest>" -> base "Textura <rest>", colour <Name>
fam = collections.defaultdict(list)
for p in ALL:
    m = re.match(r'^Textura (\S+) (.+)$', p['title'].strip())
    if m: fam['textura ' + m.group(2).lower()].append((p, m.group(1)))
_argv = sys.argv; sys.argv = ['x', '__none__']
import link_rest
sys.argv = _argv
SET = 'mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}'
for base, ps in fam.items():
    if len(ps) < 2: continue
    ids = [p['id'] for p, _ in ps]
    for p, c in ps:
        mf = [{'ownerId': p['id'], 'namespace': 'custom', 'key': 'colour', 'type': 'single_line_text_field', 'value': c},
              {'ownerId': p['id'], 'namespace': 'custom', 'key': 'colour_siblings', 'type': 'list.product_reference', 'value': json.dumps(ids)}]
        if not p.get('sw'):
            try:
                sid = link_rest.swatch(p['id'])
                if sid: mf.append({'ownerId': p['id'], 'namespace': 'custom', 'key': 'swatch', 'type': 'file_reference', 'value': sid})
            except Exception as e: print('swatch fail', p['title'], str(e)[:60])
        e = gql(SET, {'m': mf})['metafieldsSet']['userErrors']
        if e: print('ERR', p['title'], e)
    print(base, len(ps), flush=True)
