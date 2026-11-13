# Read Content > Files, tidy the names Shopify gave them, and store a name -> URL map on the shop
# (metafield custom.ah_media, JSON) that the theme reads. Run again after every upload.
import re, json, sys
sys.path.insert(0, '/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
from gql import gql

Q = '''query($c:String){files(first:250,after:$c){nodes{__typename id fileStatus createdAt
  ... on MediaImage{image{url width height}}
  ... on Video{filename preview{image{url}} sources{url width height format mimeType}}
} pageInfo{hasNextPage endCursor}}}'''

def all_files():
    cur = None; out = []
    while True:
        d = gql(Q, {'c': cur})['files']
        out += d['nodes']
        if not d['pageInfo']['hasNextPage']: return out
        cur = d['pageInfo']['endCursor']

def clean(raw):
    """'home-hero.mp4.mp4' -> 'home-hero', 'menu-dining_jpg.png' -> 'menu-dining', 'brand-nordog.mp.mp4' -> 'brand-nordog'"""
    n = raw.lower().strip()
    n = re.sub(r'\.(png|jpe?g|webp|mp4|mov|m4v)$', '', n)
    n = re.sub(r'[._](png|jpe?g|webp|mp4|mov|mp)$', '', n)
    n = re.sub(r'[._](png|jpe?g|webp|mp4|mov|mp)$', '', n)
    return n.strip()

def build():
    films, stills, pool = {}, {}, []
    raw = []
    for f in all_files():
        if f['fileStatus'] != 'READY': continue
        if f['__typename'] == 'Video':
            srcs = [s for s in (f.get('sources') or []) if (s.get('format') == 'mp4' or 'mp4' in (s.get('mimeType') or ''))]
            if not srcs: continue
            fit = [s for s in srcs if (s.get('width') or 0) <= 1920 and (s.get('height') or 0) <= 1920] or srcs
            best = max(fit, key=lambda s: (s.get('width') or 0) * (s.get('height') or 0))
            name = clean(f.get('filename') or '')
            poster = ((f.get('preview') or {}).get('image') or {}).get('url')
            raw.append((f.get('filename'), name, 'film'))
            if name.startswith('collection'):
                pool.append({'u': best['url'], 'p': poster})
            else:
                films[name] = {'u': best['url'], 'p': poster}
        elif f['__typename'] == 'MediaImage' and f.get('image'):
            u = f['image']['url']
            name = clean(u.split('?')[0].rsplit('/', 1)[-1])
            raw.append((u.split('?')[0].rsplit('/', 1)[-1], name, 'photo'))
            stills[name] = u
    # a brand that only has a still uses it as the banner until its film arrives
    return {'films': films, 'stills': stills, 'pool': pool}, raw

if __name__ == '__main__':
    m, raw = build()
    for r in sorted(raw): print(r)
    shop = gql('{shop{id}}')['shop']['id']
    r = gql('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{field message}}}',
            {'m': [{'ownerId': shop, 'namespace': 'custom', 'key': 'ah_media', 'type': 'json', 'value': json.dumps(m)}]})
    print('saved', len(m['films']), 'films,', len(m['stills']), 'stills,', len(m['pool']), 'collection films', r['metafieldsSet']['userErrors'])
    json.dump(m, open('/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad/media_map.json', 'w'), indent=1)
