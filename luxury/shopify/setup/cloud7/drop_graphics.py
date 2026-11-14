# Take Cloud7's German feature graphics out of the galleries.
import json, os, sys, re
D = os.path.dirname(os.path.abspath(__file__))
os.environ['STATE'] = f'{D}/state_all.json'
sys.path.insert(0, D)
import upload
BAD = re.compile(r'(?i)usp|_ger\b|_ger\.|infographic|_de_|-de\.|_de\.')
for h, pid in upload.ST['products'].items():
    mf = f'{D}/processed/{h}/m.json'
    if not os.path.exists(mf): continue
    man = json.load(open(mf))
    if not any(BAD.search(m['src']) for m in man): continue
    for m in man:
        if BAD.search(m['src']): m['kind'] = 'skip'
    json.dump(man, open(mf, 'w'), indent=1)
    gal = [m for m in man if m['kind'] in ('studio', 'detail')]
    old = upload.g('query($id:ID!){product(id:$id){media(first:50){nodes{id}}}}', {'id': pid})['product']['media']['nodes']
    new = [{'originalSource': upload.staged(m['file']), 'mediaContentType': 'IMAGE', 'alt': upload.title_for(upload.P[h], upload.R[h])} for m in gal]
    if old: upload.g('mutation($p:ID!,$m:[ID!]!){productDeleteMedia(productId:$p,mediaIds:$m){userErrors{message}}}', {'p': pid, 'm': [o['id'] for o in old]})
    upload.g('mutation($p:ID!,$m:[CreateMediaInput!]!){productCreateMedia(productId:$p,media:$m){mediaUserErrors{message}}}', {'p': pid, 'm': new})
    print('cleaned', h, len(new), 'photos', flush=True)
