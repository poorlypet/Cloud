# Colour families for products still without siblings: same brand, same title up to the last words, which name the colour/print.
# Each product gets a swatch cut from its own photo (the densest patch of product, background ignored).
import json, re, sys, os, io, urllib.request, collections
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S); sys.path.insert(0, f'{S}/c7')
from gql import gql
A = json.load(open(f'{S}/all_products.json'))
def nsib(p): return len(json.loads((p['sib'] or {}).get('value') or '[]'))
nc = [p for p in A if nsib(p) < 2]
TYPE = re.compile(r'(?i)\b(bed|beds|collar|harness|leash|lead|coat|cover|duvet|bandana|sweater|blanket|cushion|bowl|carrier|bag|toy)\b')
NOT = re.compile(r'(?i)shampoo|conditioner|pizzle|chew|oil|paste|scissor|clipper|brush|detangler|bottle|poop bags')
def words(t): return re.sub(r'[,.]', ' ', t).split()
groups = collections.defaultdict(set)
by = collections.defaultdict(list)
for p in nc:
    if not NOT.search(p['title']): by[p['vendor']].append(p)
for v, ps in by.items():
    for i, a in enumerate(ps):
        wa = [w.lower() for w in words(a['title'])]
        for b in ps[i + 1:]:
            wb = [w.lower() for w in words(b['title'])]
            k = 0
            while k < min(len(wa), len(wb)) and wa[k] == wb[k]: k += 1
            base = ' '.join(wa[:k])
            if k >= 2 and k < len(wa) and k < len(wb) and TYPE.search(base) and len(wa) - k <= 4 and len(wb) - k <= 4:
                groups[(v, base)].update([a['id'], b['id']])
# keep the most specific base per product
best = {}
for (v, base), ids in groups.items():
    for i in ids:
        if i not in best or len(base) > len(best[i][1]): best[i] = (v, base)
fam = collections.defaultdict(list)
P = {p['id']: p for p in A}
for i, k in best.items(): fam[k].append(P[i])
KEEP = {'dog round bed', 'greyhound 3-point harness', 'roll bed', 'roll bed furry', 'roll bed furry soft', 'dog bed sleepy deluxe', 'dog collar madeira',
        'dog collar mauerpark', 'dog harness madeira', 'dog leash riverside park', 'resc7ue tote bag', 'dog bandana check'}
fam = {k: v for k, v in fam.items() if len(v) > 1 and (k[1] in KEEP or (k[0] == 'Tadazhi' and k[1] == 'dog collar'))}
def colour_of(p, base):
    w = words(p['title']); n = len(base.split())
    c = re.sub(r'(?i)\s*dog bed$', '', ' '.join(w[n:])).strip(' ,-')
    return c[:1].upper() + c[1:] if c.isupper() is False else c.title()
if sys.argv[1:] == ['plan']:
    for (v, base), ps in sorted(fam.items()): print(v, '|', base, '|', [colour_of(p, base) for p in ps])
    print(len(fam), 'families', sum(len(x) for x in fam.values()), 'products'); sys.exit()
import upload
from PIL import Image
import numpy as np
def swatch(pid):
    r = gql('query($i:ID!){product(id:$i){media(first:5){nodes{preview{image{url}}}}}}', {'i': pid})
    urls = [n['preview']['image']['url'] for n in r['product']['media']['nodes'] if (n.get('preview') or {}).get('image')]
    if not urls: return None
    bg = np.array([234, 234, 235]); cand = []
    for url in urls:   # the studio shot: the photo with most plain background
        im0 = Image.open(io.BytesIO(urllib.request.urlopen(url + ('&' if '?' in url else '?') + 'width=600', timeout=60).read())).convert('RGB')
        a0 = np.asarray(im0).astype(int); m0 = (np.abs(a0 - bg).sum(2) > 40)
        cand.append((1 - m0.mean(), im0, m0))
    _, im, m = max(cand, key=lambda c: c[0])
    hsv = np.asarray(im.convert('HSV')).astype(float) / 255
    col = m & (hsv[..., 1] > 0.2) & (hsv[..., 2] > 0.18)   # the coloured part, so black buckles and leather trim don't win
    if col.mean() > 0.012: m = col
    m = m.astype(float)
    h, w = m.shape; s = max(24, min(h, w) // 7)
    ii = m.cumsum(0).cumsum(1)
    best, bx, by_ = -1, w // 2, h // 2
    for y in range(0, h - s, 6):
        for x in range(0, w - s, 6):
            t = ii[y + s - 1, x + s - 1] - (ii[y - 1, x + s - 1] if y else 0) - (ii[y + s - 1, x - 1] if x else 0) + (ii[y - 1, x - 1] if x and y else 0)
            if t > best: best, bx, by_ = t, x, y
    out = f'{S}/swr_{pid.split("/")[-1]}.jpg'
    im.crop((bx, by_, bx + s, by_ + s)).resize((120, 120)).save(out, quality=88)
    return upload.file_from(out, 'IMAGE', 'swatch')
SET = 'mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}'
n = 0
ONLY = sys.argv[1:]
for (v, base), ps in fam.items():
    if ONLY and base not in ONLY: continue
    ids = [p['id'] for p in ps]
    for p in ps:
        mf = [{'ownerId': p['id'], 'namespace': 'custom', 'key': 'colour', 'type': 'single_line_text_field', 'value': colour_of(p, base)},
              {'ownerId': p['id'], 'namespace': 'custom', 'key': 'colour_siblings', 'type': 'list.product_reference', 'value': json.dumps(ids)}]
        try:
            sid = swatch(p['id'])
            if sid: mf.append({'ownerId': p['id'], 'namespace': 'custom', 'key': 'swatch', 'type': 'file_reference', 'value': sid})
        except Exception as e: print('swatch fail', p['title'], str(e)[:80])
        e = gql(SET, {'m': mf})['metafieldsSet']['userErrors']
        if e: print('ERR', p['title'], e)
        n += 1
    print(v, base, len(ps), flush=True)
print('linked', n)
