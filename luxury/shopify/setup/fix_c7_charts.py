# Converted Cloud7 products: size guide rows = the measurements of the Cloud7 size actually sold under each letter.
import os, sys, json, re
os.environ['STATE'] = 'c7/state_all.json'; sys.path.insert(0, 'c7'); sys.path.insert(0, '.')
import upload
from gql import gql
L = json.load(open('c7/sizes_log.json'))
SET = 'mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}'
ok, bad = 0, []
for h, info in L.items():
    pid = upload.ST['products'].get(h)
    orig = upload.chart_for(h)
    if not pid or not orig: bad.append((h, 'no original chart')); continue
    lines = [l for l in orig.split('\n') if l.strip()]
    rows = {l.split('|')[0].strip(): l for l in lines[1:]}
    out = [lines[0]]
    for letter, n in sorted(info['kept'].items(), key=lambda kv: kv[1]):
        r = rows.get(str(n))
        if not r: bad.append((h, f'no row {n}')); continue
        out.append(' | '.join([letter] + [c.strip() for c in r.split('|')[1:]]))
    if len(out) - 1 != len(info['kept']): continue
    e = gql(SET, {'m': [{'ownerId': pid, 'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': '\n'.join(out)}]})['metafieldsSet']['userErrors']
    if e: bad.append((h, e))
    else: ok += 1
print('rebuilt', ok, 'of', len(L)); print(bad[:20])
