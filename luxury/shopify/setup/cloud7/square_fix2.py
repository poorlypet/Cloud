# Nordog photos still padded after square_fix: re-make them (crop when the product fits, otherwise pad in the photo's own background) and drop size-chart graphics.
import json, os, sys
C7 = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(os.path.dirname(C7), 'nd')
os.environ['STATE'] = f'{B}/state.json'; sys.path.insert(0, C7)
import upload, photos
from PIL import Image
prods = json.load(open(f'{B}/products.json'))
SRC = {im['src'].split('/')[-1].split('?')[0]: im['src'] for p in prods for im in p['images']}
pad = set(json.load(open(os.path.join(os.path.dirname(C7), 'nd_padded.json'))))
def chart(fn):
    g = Image.open(fn).convert('L').resize((64, 64)); px = list(g.getdata())
    return sum(p > 245 for p in px) > 0.55 * len(px) and sum(p < 120 for p in px) > 10
for h, pid in upload.ST['products'].items():
    mf = f'{B}/processed/{h}/m.json'
    if not os.path.exists(mf): continue
    man = json.load(open(mf)); ch = 0
    for m in man:
        if m.get('dropped') == 1: m['dropped'] = 2; ch += 1; continue
        if m['file'] not in pad or m['kind'] not in ('studio', 'detail'): continue
        im = photos.fetch(SRC[m['src']]) if m['src'] in SRC else None
        if im is None: continue
        photos.tone(im, m['kind']).save(m['file'], quality=88, optimize=True, progressive=True); ch += 1
    if not ch: continue
    json.dump(man, open(mf, 'w'), indent=1)
    q = upload.g('query($id:ID!){product(id:$id){title media(first:50){nodes{id}}}}', {'id': pid})['product']
    gal = [m for m in man if m['kind'] in ('studio', 'detail')]
    new = [{'originalSource': upload.staged(m['file']), 'mediaContentType': 'IMAGE', 'alt': q['title']} for m in gal]
    old = [o['id'] for o in q['media']['nodes']]
    if old: upload.g('mutation($p:ID!,$m:[ID!]!){productDeleteMedia(productId:$p,mediaIds:$m){userErrors{message}}}', {'p': pid, 'm': old})
    e = upload.g('mutation($p:ID!,$m:[CreateMediaInput!]!){productCreateMedia(productId:$p,media:$m){mediaUserErrors{message}}}', {'p': pid, 'm': new})['productCreateMedia']['mediaUserErrors']
    print('redone', h, ch, e[:1] if e else '', flush=True)
print('fix2 done')
