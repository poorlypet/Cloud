# Set every Cloud7 and Nordog product to ACTIVE and make sure it is on the Online Store.
import json, sys, os
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S)
from gql import gql
PUB = 'gid://shopify/Publication/550919111046'
ids = list(json.load(open(f'{S}/c7/state_all.json'))['products'].values()) + list(json.load(open(f'{S}/nd/state.json'))['products'].values())
ok = 0
for pid in ids:
    try:
        e = gql('mutation($p:ProductInput!){productUpdate(input:$p){userErrors{message}}}', {'p': {'id': pid, 'status': 'ACTIVE'}})['productUpdate']['userErrors']
        e += gql('mutation($id:ID!,$i:[PublicationInput!]!){publishablePublish(id:$id,input:$i){userErrors{message}}}', {'id': pid, 'i': [{'publicationId': PUB}]})['publishablePublish']['userErrors']
        if e: print('ERR', pid, e, flush=True)
        else: ok += 1
    except Exception as x:
        print('FAILED', pid, str(x)[:120], flush=True)
print('active', ok, 'of', len(ids), flush=True)
