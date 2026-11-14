# The uploader reuses a file already sent under the same path, so later swatch re-cuts never reached the store.
# Send every current local swatch under a fresh name and point the product at it.
import glob, os, re, sys, shutil, json
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S); sys.path.insert(0, f'{S}/c7')
from gql import gql
import upload
SET = 'mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}'
jobs = []
for f in glob.glob(f'{S}/swr_*.jpg'):
    m = re.match(r'swr_(\d+)\.jpg$', os.path.basename(f))
    if m: jobs.append((f'gid://shopify/Product/{m.group(1)}', f))
for f in glob.glob(f'{S}/swm_*.jpg'):
    h = os.path.basename(f)[4:-4]
    r = gql('query($h:String!){productByHandle(handle:$h){id}}', {'h': h})['productByHandle']
    if r: jobs.append((r['id'], f))
os.makedirs(f'{S}/swv5', exist_ok=True)
n = 0
for pid, f in jobs:
    g = f'{S}/swv5/sw5_{pid.split("/")[-1]}.jpg'
    shutil.copy(f, g)
    try:
        fid = upload.file_from(g, 'IMAGE', 'swatch')
        e = gql(SET, {'m': [{'ownerId': pid, 'namespace': 'custom', 'key': 'swatch', 'type': 'file_reference', 'value': fid}]})['metafieldsSet']['userErrors']
        if e: print('ERR', pid, e)
        n += 1
    except Exception as ex: print('fail', pid, str(ex)[:80], flush=True)
    if n % 50 == 0: print(n, flush=True)
print('done', n, 'of', len(jobs))
