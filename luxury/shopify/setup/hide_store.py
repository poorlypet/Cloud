import sys
sys.path.insert(0, '/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
from gql import gql
PUB = 'gid://shopify/Publication/550919111046'
HIDE = lambda it: any(k in (it.get('url') or '').lower() for k in ('/collections/cats', 'for-cats', 'cat-', '/pages/happy-dogs', '/collections/dventotto', '/pages/brands', '/pages/our-story'))
F = 'id title type url resourceId tags'
menus = gql('{menus(first:30){nodes{id title handle items{%s items{%s items{%s}}}}}}' % (F, F, F))['menus']['nodes']
def keep(items):
    out = []
    for it in items:
        if HIDE(it):
            print('  drop', it['title'], it['url']); continue
        d = {'id': it['id'], 'title': it['title'], 'type': it['type'], 'url': it['url'], 'items': keep(it.get('items') or [])}
        if it.get('resourceId'): d['resourceId'] = it['resourceId']
        if it.get('tags'): d['tags'] = it['tags']
        out.append(d)
    return out
def count(items): return sum(1 + count(i.get('items') or []) for i in items)
for m in menus:
    k = keep(m['items'])
    if count(k) == count(m['items']): continue
    print('menu', m['handle'])
    r = gql('mutation($id:ID!,$t:String!,$h:String,$i:[MenuItemUpdateInput!]!){menuUpdate(id:$id,title:$t,handle:$h,items:$i){userErrors{message}}}',
            {'id': m['id'], 't': m['title'], 'h': m['handle'], 'i': k})['menuUpdate']
    print('  ', r['userErrors'])
# take the collections and page off the shop (they stay in admin, ready to republish)
cols = {}
cur = None
while True:
    d = gql('query($c:String){collections(first:250,after:$c){nodes{id handle} pageInfo{hasNextPage endCursor}}}', {'c': cur})['collections']
    cols.update({n['handle']: n['id'] for n in d['nodes']})
    if not d['pageInfo']['hasNextPage']: break
    cur = d['pageInfo']['endCursor']
hide = [h for h in cols if h == 'cats' or h == 'dventotto' or 'cat-' in h or h.endswith('-for-cats') or h.startswith('cat')]
for h in hide:
    r = gql('mutation($id:ID!,$p:[PublicationInput!]!){publishableUnpublish(id:$id,input:$p){userErrors{message}}}', {'id': cols[h], 'p': [{'publicationId': PUB}]})
    print('unpublished collection', h, r['publishableUnpublish']['userErrors'])
pg = [n for n in gql('{pages(first:100){nodes{id handle}}}')['pages']['nodes'] if n['handle'] in ('happy-dogs', 'brands', 'our-story')]
for n in pg:
    r = gql('mutation($id:ID!,$p:PageUpdateInput!){pageUpdate(id:$id,page:$p){userErrors{message}}}', {'id': n['id'], 'p': {'isPublished': False}})
    print('unpublished page', n['handle'], r['pageUpdate']['userErrors'])
