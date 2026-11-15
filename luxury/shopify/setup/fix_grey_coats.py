# Brott greyhound coats: back length and chest per size, from Brott's own size guide (brottdog.com/en/pages/guia-de-tallas).
import json, sys, os
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S)
from gql import gql
G = {'P-': ('Italian Greyhound (Piccolo), smaller', 32, '32–40'), 'P': ('Italian Greyhound (Piccolo)', 36, '40–52'), 'P+': ('Italian Greyhound (Piccolo), larger', 40, '44–56'),
     'W': ('Whippet', 50, '48–60'), 'W+': ('Whippet, larger', 55, '52–64'), 'G-': ('Greyhound / Galgo, smaller', 60, '58–68'),
     'G': ('Greyhound / Galgo', 68, '66–76'), 'G+': ('Greyhound / Galgo, larger', 74, '70–82')}
I = json.load(open(f'{S}/strict_issues.json'))['size rows without numbers']
P = {p['handle']: p for p in json.load(open(f'{S}/fresh_products.json'))}
for x in I:
    h = x.split(' ')[0]; p = P[h]
    sizes = [v['name'] for o in p['options'] if o['name'] == 'Size' for v in o['optionValues']]
    rows = ['Size | Back length | Chest | Suits'] + [f'{s} | {G[s][1]} cm | {G[s][2]} cm | {G[s][0]}' for s in sizes]
    e = gql('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}',
            {'m': [{'ownerId': p['id'], 'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': '\n'.join(rows)}]})['metafieldsSet']['userErrors']
    print(h, len(sizes), e)
