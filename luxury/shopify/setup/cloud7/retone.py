# Re-make the studio photos centred and swap them onto the existing drafts.
import json, os, sys
D = os.path.dirname(os.path.abspath(__file__))
os.environ['STATE'] = f'{D}/state_all.json'
sys.path.insert(0, D)
import photos, upload
P = upload.P
done_f = f'{D}/tone2_{sys.argv[1]}.done'
done = set(open(done_f).read().split()) if os.path.exists(done_f) else set()
for h in json.load(open(sys.argv[2])):
    if h in done: continue
    try:
        man = json.load(open(f'{D}/processed/{h}/m.json'))
        for m in man:
            if m['kind'] not in ('studio', 'detail'): continue
            img = next(i for i in P[h]['images'] if i['src'].split('/')[-1].split('?')[0] == m['src'])
            im = photos.fetch(img['src'])
            out = photos.tone(im) if im else None
            if out: out.save(m['file'], quality=88, optimize=True, progressive=True)
        pid = upload.ST['products'][h]
        gal = [m for m in man if m['kind'] in ('studio', 'detail')]
        old = upload.g('query($id:ID!){product(id:$id){media(first:50){nodes{id}}}}', {'id': pid})['product']['media']['nodes']
        new = [{'originalSource': upload.staged(m['file']), 'mediaContentType': 'IMAGE', 'alt': upload.title_for(P[h], upload.R[h])} for m in gal]
        if old:
            upload.g('mutation($p:ID!,$m:[ID!]!){productDeleteMedia(productId:$p,mediaIds:$m){userErrors{message}}}', {'p': pid, 'm': [o['id'] for o in old]})
        if new:
            e = upload.g('mutation($p:ID!,$m:[CreateMediaInput!]!){productCreateMedia(productId:$p,media:$m){mediaUserErrors{message}}}', {'p': pid, 'm': new})['productCreateMedia']['mediaUserErrors']
            if e: print('media error', h, e[:2], flush=True)
        open(done_f, 'a').write(h + '\n'); print('reshot', h, len(new), flush=True)
    except Exception as e:
        print('FAILED', h, str(e)[:160], flush=True)
print('reshoot done', sys.argv[1], flush=True)
