# Gallery photos that were padded with grey bars but aren't on a plain studio background: crop them square instead and swap them on the product.
import json, os, sys
brand, part, parts = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
C7 = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(os.path.dirname(C7), brand)
os.environ['STATE'] = f'{B}/state_all.json' if brand == 'c7' else f'{B}/state.json'
sys.path.insert(0, C7)
import upload, photos
from PIL import Image
prods = json.load(open(f'{B}/products_en.json' if brand == 'c7' else f'{B}/products.json'))
SRC = {im['src'].split('/')[-1].split('?')[0]: im['src'] for p in prods for im in p['images']}
done_f = f'{B}/square_{part}.done'
done = set(open(done_f).read().split()) if os.path.exists(done_f) else set()

def padded(fn):
    im = Image.open(fn).convert('RGB'); w, h = im.size
    def flat(box):
        px = list(im.crop(box).resize((40, 4)).getdata())
        return all(abs(p[0] - 234) <= 2 and abs(p[1] - 234) <= 2 and abs(p[2] - 235) <= 2 for p in px)
    return (flat((0, 0, 6, h)) and flat((w - 6, 0, w, h))) or (flat((0, 0, w, 6)) and flat((0, h - 6, w, h)))

hs = sorted(upload.ST['products'])[part::parts]
for h in hs:
    if h in done: continue
    try:
        mf = f'{B}/processed/{h}/m.json'
        if not os.path.exists(mf): continue
        man = json.load(open(mf)); changed = 0
        for m in man:
            if m['kind'] not in ('studio', 'detail') or not padded(m['file']): continue
            src = SRC.get(m['src'])
            im = photos.fetch(src) if src else None
            if im is None: continue
            out = photos.tone(im, m["kind"])
            # tone() now crops anything not on a plain background; only count it if the bars are gone
            out.save(m['file'] + '.new.jpg', quality=88, optimize=True, progressive=True)
            if not padded(m['file'] + '.new.jpg'):
                os.replace(m['file'] + '.new.jpg', m['file']); changed += 1
            else:
                os.remove(m['file'] + '.new.jpg')
        if changed:
            pid = upload.ST['products'][h]
            q = upload.g('query($id:ID!){product(id:$id){title media(first:50){nodes{id}}}}', {'id': pid})['product']
            gal = [m for m in man if m['kind'] in ('studio', 'detail')]
            new = [{'originalSource': upload.staged(m['file']), 'mediaContentType': 'IMAGE', 'alt': q['title']} for m in gal]
            old = [o['id'] for o in q['media']['nodes']]
            if old: upload.g('mutation($p:ID!,$m:[ID!]!){productDeleteMedia(productId:$p,mediaIds:$m){userErrors{message}}}', {'p': pid, 'm': old})
            e = upload.g('mutation($p:ID!,$m:[CreateMediaInput!]!){productCreateMedia(productId:$p,media:$m){mediaUserErrors{message}}}', {'p': pid, 'm': new})['productCreateMedia']['mediaUserErrors']
            if e: print('media error', h, e[:2], flush=True)
            print('squared', h, changed, flush=True)
        open(done_f, 'a').write(h + '\n')
    except Exception as e:
        print('FAILED', h, str(e)[:160], flush=True)
print('square done', part, flush=True)
