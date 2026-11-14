# Make every product in a brand's state file ACTIVE and published to the Online Store.
import json, sys, os
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S)
from gql import gql
PUB = 'gid://shopify/Publication/550919111046'
ids = list(json.load(open(f'{S}/{sys.argv[1]}/state.json'))['products'].values()); ok = 0
for pid in ids:
    for a in range(3):
        try:
            e = gql('mutation($p:ProductInput!){productUpdate(input:$p){userErrors{message}}}', {'p': {'id': pid, 'status': 'ACTIVE'}})['productUpdate']['userErrors']
            e += gql('mutation($id:ID!,$i:[PublicationInput!]!){publishablePublish(id:$id,input:$i){userErrors{message}}}', {'id': pid, 'i': [{'publicationId': PUB}]})['publishablePublish']['userErrors']
            if not e: ok += 1
            else: print(e)
            break
        except Exception as x: print('retry', str(x)[:60])
print(sys.argv[1], 'active', ok, 'of', len(ids))
