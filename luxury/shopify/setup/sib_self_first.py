# Families over 50: Shopify renders the first 50 references only, so each product's list starts with itself.
import json, sys, os
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S)
from gql import gql
Q = '''query($a:String){products(first:100,after:$a,query:"status:active"){pageInfo{hasNextPage endCursor}nodes{id
 sib:metafield(namespace:"custom",key:"colour_siblings"){value}}}}'''
big, a = [], None
while True:
    r = gql(Q, {'a': a})['products']
    for p in r['nodes']:
        ids = json.loads((p['sib'] or {}).get('value') or '[]')
        if len(ids) > 50 and ids[0] != p['id']: big.append({'ownerId': p['id'], 'namespace': 'custom', 'key': 'colour_siblings', 'type': 'list.product_reference', 'value': json.dumps([p['id']] + [i for i in ids if i != p['id']])})
    if not r['pageInfo']['hasNextPage']: break
    a = r['pageInfo']['endCursor']
for i in range(0, len(big), 25):
    print(gql('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}', {'m': big[i:i + 25]})['metafieldsSet']['userErrors'])
print('reordered', len(big))
