# Nordog: every gallery photo cropped square (no padding), swapped onto the product.
import json, os, sys
part, parts = int(sys.argv[1]), int(sys.argv[2])
C7 = os.path.dirname(os.path.abspath(__file__)); B = os.path.join(os.path.dirname(C7), sys.argv[3])
os.environ['STATE'] = f'{B}/state.json'; sys.path.insert(0, C7)
import upload, photos
prods = json.load(open(f'{B}/products.json'))['products'] if os.path.exists(f'{B}/products.json') else json.load(open(f'{B}/p1.json'))['products']
SRC = {im['src'].split('/')[-1].split('?')[0]: im['src'] for p in prods for im in p['images']}
done_f = f'{B}/tone_{part}.done'; done = set(open(done_f).read().split()) if os.path.exists(done_f) else set()
for h, pid in sorted(upload.ST['products'].items())[part::parts]:
    if h in done: continue
    try:
        mf = f'{B}/processed/{h}/m.json'
        if not os.path.exists(mf): continue
        man = json.load(open(mf))
        gal = [m for m in man if m['kind'] in ('studio', 'detail')]
        for m in gal:
            im = photos.fetch(SRC[m['src']]) if m['src'] in SRC else None
            if im is not None: photos.tone_crop(im).save(m['file'], quality=88, optimize=True, progressive=True)
        q = upload.g('query($id:ID!){product(id:$id){title media(first:50){nodes{id}}}}', {'id': pid})['product']
        new = [{'originalSource': upload.staged(m['file']), 'mediaContentType': 'IMAGE', 'alt': q['title']} for m in gal]
        old = [o['id'] for o in q['media']['nodes']]
        if old: upload.g('mutation($p:ID!,$m:[ID!]!){productDeleteMedia(productId:$p,mediaIds:$m){userErrors{message}}}', {'p': pid, 'm': old})
        e = upload.g('mutation($p:ID!,$m:[CreateMediaInput!]!){productCreateMedia(productId:$p,media:$m){mediaUserErrors{message}}}', {'p': pid, 'm': new})['productCreateMedia']['mediaUserErrors']
        open(done_f, 'a').write(h + '\n'); print('cropped', h, len(new), e[:1] if e else '', flush=True)
    except Exception as ex:
        print('FAILED', h, str(ex)[:150], flush=True)
print('crop done', part, flush=True)
