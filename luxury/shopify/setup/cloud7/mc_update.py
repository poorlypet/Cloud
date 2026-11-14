import json, os, sys, re
D = os.path.dirname(os.path.abspath(__file__))
os.environ['STATE'] = f'{D}/state_all.json'
sys.path.insert(0, D)
import upload
R = json.load(open(f'{D}/parsed.json'))
tidy = lambda x: re.sub(r'\s+,', ',', re.sub(r'\s{2,}', ' ', x)).strip()
n = 0; batch = []
for h, pid in upload.ST['products'].items():
    r = R[h]; mc = []
    if r['materials']: mc += ['Materials'] + [tidy(x) for x in r['materials']]
    if r['care']: mc += ['Care'] + [tidy(x) for x in r['care']]
    if not mc: continue
    batch.append({'ownerId': pid, 'namespace': 'custom', 'key': 'materials_care', 'type': 'multi_line_text_field', 'value': '\n'.join(mc)})
    if len(batch) == 25:
        e = upload.g('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}', {'m': batch})['metafieldsSet']['userErrors']
        n += len(batch); batch = []
        if e: print(e)
if batch:
    upload.g('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}', {'m': batch}); n += len(batch)
print('updated', n)
