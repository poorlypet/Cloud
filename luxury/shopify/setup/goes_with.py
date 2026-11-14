# custom.goes_with: up to 4 items that pair with each product (same brand first, same colour/print first, complementary categories).
import json, re, sys, os
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S)
from gql import gql as _g
import time
def gql(q, v=None):
    for i in range(8):
        try:
            r = _g(q, v)
            if r: return r
        except Exception as e: print('retry', str(e)[:80])
        time.sleep(3 + i * 3)
    raise SystemExit('gave up')
A = json.load(open(f'{S}/all_products.json'))
def cat(t):
    t = t.lower()
    for k, v in [('harness', 'harness'), ('collar', 'collar'), ('necklace', 'collar'), ('leash', 'lead'), ('lead', 'lead'), ('extension', 'lead'),
                 ('treat', 'treatbag'), ('poop', 'poo'), ('waste bag', 'poo'), ('cover', 'cover'), ('blanket', 'blanket'), ('placemat', 'mat'),
                 ('bowl', 'bowl'), ('feeding', 'bowl'), ('bed', 'bed'), ('cushion', 'bed'), ('mat', 'bed'), ('toy', 'toy'), ('rope', 'toy'),
                 ('coat', 'coat'), ('jacket', 'coat'), ('vest', 'coat'), ('suit', 'coat'), ('sweater', 'coat'), ('jumper', 'coat'), ('pullover', 'coat'),
                 ('shirt', 'coat'), ('carrier', 'bag'), ('bag', 'bag'), ('car seat', 'bag'), ('bandana', 'acc'), ('key ring', 'acc')]:
        if k in t: return v
    return 'other'
PAIR = {'harness': ['lead', 'poo', 'treatbag', 'collar'], 'collar': ['lead', 'poo', 'harness', 'treatbag'], 'lead': ['collar', 'harness', 'poo', 'treatbag'],
        'coat': ['harness', 'lead', 'collar', 'poo'], 'bed': ['blanket', 'toy', 'bowl', 'cover'], 'cover': ['bed', 'blanket', 'toy'],
        'blanket': ['bed', 'toy', 'bowl'], 'toy': ['bed', 'toy', 'bowl', 'blanket'], 'bowl': ['mat', 'bed', 'toy', 'treatbag'], 'mat': ['bowl', 'bed', 'toy'],
        'poo': ['lead', 'treatbag', 'collar', 'harness'], 'treatbag': ['lead', 'poo', 'collar'], 'bag': ['blanket', 'bowl', 'lead', 'toy'],
        'acc': ['collar', 'lead', 'harness'], 'other': ['lead', 'toy', 'bowl', 'bed']}
for p in A:
    p['cat'] = cat(p['title']); p['c'] = ((p['col'] or {}).get('value') or '').lower()
    p['fam'] = frozenset(json.loads((p['sib'] or {}).get('value') or '[]')) or frozenset([p['id']])
    p['words'] = set(re.findall(r'[a-zà-ÿ]{4,}', p['title'].lower()))
def score(p, q):
    s = 10 if q['vendor'] == p['vendor'] else 0
    if p['c'] and q['c'] == p['c']: s += 8
    elif p['c'] and p['c'] in q['title'].lower(): s += 6
    s += 2 * len(p['words'] & q['words'] - {'with', 'dog', 'dogs'})
    return s
SET = 'mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}'
buf = []; n = 0
for p in A:
    pick, fams = [], {p['fam']}
    for want in PAIR[p['cat']] * 2:
        if len(pick) >= 4: break
        cs = [q for q in A if q['cat'] == want and q['fam'] not in fams and q['id'] not in p['fam']]
        if not cs: continue
        q = max(cs, key=lambda q: score(p, q))
        pick.append(q['id']); fams.add(q['fam'])
    if not pick: continue
    buf.append({'ownerId': p['id'], 'namespace': 'custom', 'key': 'goes_with', 'type': 'list.product_reference', 'value': json.dumps(pick)})
    if len(buf) == 25 or p is A[-1]:
        for t in range(6):
            r = gql(SET, {'m': buf}); e = (r.get('metafieldsSet') or {}).get('userErrors') if r.get('metafieldsSet') else ['throttled']
            if not e: break
            time.sleep(10)
        if e: print('ERR', e[:2])
        n += len(buf); buf = []
if buf: gql(SET, {'m': buf}); n += len(buf)
print('set', n)
