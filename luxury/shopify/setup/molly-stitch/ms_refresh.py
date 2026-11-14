# Mark listed images as skip, then re-upload gallery and lifestyle for the affected Molly and Stitch products.
import json, os, sys
os.environ['STATE'] = 'ms/state.json'; sys.path.insert(0, 'c7')
import upload
hits = json.load(open(sys.argv[1])); by = {}
for mf, src in hits: by.setdefault(mf, set()).add(src)
n = 0
for mf, srcs in by.items():
    h = mf.split('/')[-2]; man = json.load(open(mf))
    for m in man:
        if m['src'] in srcs: m['kind'] = 'skip'
    json.dump(man, open(mf, 'w'), indent=1)
    pid = upload.ST['products'].get(h)
    if not pid: continue
    q = upload.g('query($id:ID!){product(id:$id){title media(first:50){nodes{id}}}}', {'id': pid})['product']
    gal = [m for m in man if m['kind'] in ('studio', 'detail')]; life = [m for m in man if m['kind'] == 'life']
    new = [{'originalSource': upload.staged(m['file']), 'mediaContentType': 'IMAGE', 'alt': q['title']} for m in gal]
    upload.g('mutation($p:ID!,$m:[ID!]!){productDeleteMedia(productId:$p,mediaIds:$m){userErrors{message}}}', {'p': pid, 'm': [o['id'] for o in q['media']['nodes']]})
    if new: upload.g('mutation($p:ID!,$m:[CreateMediaInput!]!){productCreateMedia(productId:$p,media:$m){mediaUserErrors{message}}}', {'p': pid, 'm': new})
    ids = [x for x in (upload.file_from(m['file'], 'IMAGE', q['title']) for m in life) if x]
    if ids: upload.g('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}', {'m': [{'ownerId': pid, 'namespace': 'custom', 'key': 'lifestyle', 'type': 'list.file_reference', 'value': json.dumps(ids)}]})
    else: upload.g('mutation($m:[MetafieldIdentifierInput!]!){metafieldsDelete(metafields:$m){userErrors{message}}}', {'m': [{'ownerId': pid, 'namespace': 'custom', 'key': 'lifestyle'}]})
    n += 1
print('refreshed', n)
