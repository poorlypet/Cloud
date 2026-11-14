# Mauerpark collars: swatch from the rope (top of the collar in the studio shot), not the black leather buckle strap.
import sys, os, io, urllib.request
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S); sys.path.insert(0, f'{S}/c7')
from gql import gql
import upload
from PIL import Image
for h in ['dog-collar-mauerpark-grass', 'dog-collar-mauerpark-olive', 'dog-collar-mauerpark-zigzag-blue']:
    r = gql('query($h:String!){productByHandle(handle:$h){id featuredMedia{preview{image{url}}}}}', {'h': h})['productByHandle']
    if not r: print('missing', h); continue
    im = Image.open(io.BytesIO(urllib.request.urlopen(r['featuredMedia']['preview']['image']['url'] + '&width=500', timeout=60).read())).convert('RGB')
    out = f'{S}/swm_{h}.jpg'
    im.crop((230, 158, 266, 194)).resize((120, 120)).save(out, quality=88)
    fid = upload.file_from(out, 'IMAGE', 'swatch')
    e = gql('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}',
            {'m': [{'ownerId': r['id'], 'namespace': 'custom', 'key': 'swatch', 'type': 'file_reference', 'value': fid}]})['metafieldsSet']['userErrors']
    print(h, e)
