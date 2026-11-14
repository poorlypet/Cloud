# Make the pilot products live for a moment, screenshot one, then put them all back to draft.
import json, os, sys, subprocess
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(D))
from gql import gql
ST = json.load(open(f'{D}/state.json'))
hs = json.load(open(f'{D}/pilot.json'))
ids = [ST['products'][h] for h in hs if h in ST['products']]
M = 'mutation($p:ProductInput!){productUpdate(input:$p){product{status} userErrors{message}}}'
try:
    for i in ids: gql(M, {'p': {'id': i, 'status': 'ACTIVE'}})
    print(subprocess.run(['node', f'{D}/pp.js'], capture_output=True, text=True, timeout=400).stdout[-3000:])
finally:
    for i in ids: gql(M, {'p': {'id': i, 'status': 'DRAFT'}})
    print('back to draft:', all(gql('query($id:ID!){product(id:$id){status}}', {'id': i})['product']['status'] == 'DRAFT' for i in ids))
