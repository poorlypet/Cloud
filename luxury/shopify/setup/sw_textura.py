# Photo swatches for every Brott product in a colour family that has no swatch yet (prints can't be named colours).
import json, sys, os
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S); sys.path.insert(0, f'{S}/c7')
from gql import gql
sys.argv = ['x', '__none__']
import link_rest
Q = '''query($a:String){products(first:100,after:$a,query:"vendor:'Brott Barcelona' status:active"){pageInfo{hasNextPage endCursor}nodes{id title
 sib:metafield(namespace:"custom",key:"colour_siblings"){value} sw:metafield(namespace:"custom",key:"swatch"){value}}}}'''
todo, a = [], None
while True:
    r = gql(Q, {'a': a})['products']
    todo += [p for p in r['nodes'] if p['sib']]
    if not r['pageInfo']['hasNextPage']: break
    a = r['pageInfo']['endCursor']
print('to do', len(todo), flush=True)
SET = 'mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}'
n = 0
for p in todo:
    try:
        sid = link_rest.swatch(p['id'])
        if sid:
            gql(SET, {'m': [{'ownerId': p['id'], 'namespace': 'custom', 'key': 'swatch', 'type': 'file_reference', 'value': sid}]}); n += 1
    except Exception as e: print('fail', p['title'], str(e)[:60], flush=True)
    if n % 25 == 0: print(n, flush=True)
print('done', n)
