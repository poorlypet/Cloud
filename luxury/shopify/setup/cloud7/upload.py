# Create Cloud7 products in Shopify as drafts: sizes (sold-out sizes kept at zero), photos,
# film, lifestyle photos, swatch, size chart, features, materials and care, then link colours and fits.
import json, os, re, sys, time, html as H, mimetypes, requests
D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(D))
from gql import gql
LOC = 'gid://shopify/Location/130063040902'
PUB = 'gid://shopify/Publication/550919111046'
P = {p['handle']: p for p in json.load(open(f'{D}/products_en.json'))}
R = json.load(open(f'{D}/parsed.json'))
FAM = json.load(open(f'{D}/families.json'))
CH = json.load(open(f'{D}/charts.json')) if os.path.exists(f'{D}/charts.json') else {}
class _Man(dict):
    def get(self, h, d=None):
        f = f'{D}/processed/{h}/m.json'
        return json.load(open(f)) if os.path.exists(f) else d
MAN = _Man()
STATE_F = os.environ.get('STATE', f'{D}/state.json')
if os.path.exists(STATE_F): ST = json.load(open(STATE_F))
else:
    base = json.load(open(f'{D}/state.json')) if os.path.exists(f'{D}/state.json') else {'files': {}}
    ST = {'products': {}, 'files': dict(base.get('files', {}))}
def save(): json.dump(ST, open(STATE_F, 'w'), indent=1)

def g(q, v=None, tries=5):
    for a in range(tries):
        try:
            d = gql(q, v)
            if d is not None: return d
        except Exception as e:
            print('  retry', str(e)[:120])
        time.sleep(3 * (a + 1))
    raise RuntimeError('graphql failed')

# ---------- files ----------
def staged(path, resource='IMAGE'):
    size = os.path.getsize(path); mime = mimetypes.guess_type(path)[0] or ('video/mp4' if resource == 'VIDEO' else 'image/jpeg')
    t = g('mutation($i:[StagedUploadInput!]!){stagedUploadsCreate(input:$i){stagedTargets{url resourceUrl parameters{name value}} userErrors{message}}}',
          {'i': [{'resource': resource, 'filename': os.path.basename(path), 'mimeType': mime, 'httpMethod': 'POST', 'fileSize': str(size)}]})['stagedUploadsCreate']['stagedTargets'][0]
    for a in range(5):
        try:
            with open(path, 'rb') as fh:
                r = requests.post(t['url'], data={p['name']: p['value'] for p in t['parameters']}, files={'file': (os.path.basename(path), fh, mime)}, timeout=180)
            if r.status_code in (200, 201, 204): return t['resourceUrl']
        except Exception as e:
            print('  upload retry', str(e)[:100])
        time.sleep(4 * (a + 1))
    raise RuntimeError('upload failed ' + path)

def file_from(src, kind, alt=''):
    """a file in Content > Files made from a URL or a local path; kept once and reused"""
    key = kind + ':' + src
    if key in ST['files']: return ST['files'][key]
    if kind == 'VIDEO' and not os.path.exists(src):
        tmp = f'{D}/tmp_film.mp4'
        with requests.get(src, headers={'User-Agent': 'Mozilla/5.0'}, stream=True, timeout=300) as rq:
            rq.raise_for_status()
            with open(tmp, 'wb') as fh:
                for chunk in rq.iter_content(1 << 20): fh.write(chunk)
        origin = staged(tmp, 'VIDEO'); os.remove(tmp)
    else:
        origin = staged(src) if os.path.exists(src) else src
    d = g('mutation($f:[FileCreateInput!]!){fileCreate(files:$f){files{id} userErrors{field message}}}',
          {'f': [{'originalSource': origin, 'contentType': kind, 'alt': alt}]})['fileCreate']
    if d['userErrors']: print('  file error', d['userErrors']); return None
    fid = d['files'][0]['id']; ST['files'][key] = fid; save(); return fid

# ---------- words ----------
TYPE = {'Gassi gehen': 'Walking', 'Hundebekleidung': 'Coats', 'Dog Clothing': 'Coats', 'Zubehör': 'Accessories', 'Schlafen': 'Beds', 'Sleep': 'Beds',
        'Transport': 'Travel', 'On the Go': 'Travel', 'Training material': 'Walking'}
def tags_for(p, r):
    t = p['title'].lower(); tg = set()
    def has(*w): return any(x in t for x in w)
    if has('raincoat', 'rain coat', 'rain jacket'): tg |= {'coats', 'raincoats'}
    elif has('sweater', 'jumper', 'pullover', 'knit', 'hoodie'): tg |= {'coats', 'knitwear'}
    elif has('bathrobe', 'drying coat', 'towel coat'): tg |= {'coats', 'bathrobes'}
    elif has('snood', 'scarf', 'loop'): tg |= {'coats', 'snoods'}
    elif has('coat', 'jacket', 'parka', 'vest', 'gilet', 'body warmer'): tg |= {'coats'}
    if 'coats' in tg and has('alaska', 'puffer', 'quilt', 'padded', 'down'): tg.add('quilted')
    if 'coats' in tg and has('tweed'): tg.add('tweed')
    fit = (r.get('fit') or '').lower()
    if 'dachshund' in t or 'dachshund' in fit: tg.add('dachshund')
    if 'french bulldog' in t or 'bulldog' in fit: tg.add('french-bulldog')
    if has('sighthound', 'greyhound', 'whippet') or 'sighthound' in fit: tg.add('whippet-and-greyhound')
    if 'coats' in tg and not tg & {'dachshund', 'french-bulldog', 'whippet-and-greyhound'}: tg.add('standard-fit')
    if has('bed', 'cushion', 'mattress', 'donut', 'nest', 'cave'): tg.add('beds')
    if has('donut', 'round'): tg.add('round-beds')
    if has('orthop'): tg.add('orthopaedic-beds')
    if has('sofa'): tg.add('sofa-beds')
    if has('crate mat', 'mat ') and 'beds' in tg: tg.add('crate-mats')
    if has('cover') and 'beds' in tg: tg.add('replacement-covers')
    if has('blanket', 'throw'): tg |= {'beds', 'blankets-and-cushions'}
    if has('collar'): tg |= {'walking', 'collars'}
    if has('leash', 'lead'): tg |= {'walking', 'leads'}
    if has('harness'): tg |= {'walking', 'harnesses'}
    if has('poop', 'bag dispenser', 'waste bag'): tg |= {'walking', 'poop-bag-holders'}
    if has('treat bag', 'treat pouch', 'goodie bag', 'belt bag', 'snack bag'): tg |= {'walking', 'treat-pouches'}
    if has('leather') and tg & {'collars', 'leads', 'harnesses'}: tg.add('leather')
    if has('rope') and 'walking' in tg: tg.add('rope')
    if has('bowl'): tg |= {'dining', 'bowls'}
    if has('placemat', 'feeding mat'): tg |= {'dining', 'placemats'}
    if has('treat', 'snack', 'crouton', 'chew') and not tg: tg |= {'dining'}
    if has('carrier', 'transport bag', 'travel bag', 'tote'): tg |= {'travel', 'carriers'}
    if has('car seat', 'car bed', 'seat cover'): tg |= {'travel', 'car-seats'}
    if has('travel bed'): tg |= {'travel', 'travel-beds'}
    if has('toy', 'ball', 'plush'): tg.add('play')
    if has('brush', 'comb', 'shampoo', 'grooming'): tg |= {'dining', 'care', 'grooming'}
    if 'FW26' in p['tags'] or 'F/W 26' in ' '.join(p['tags']): tg.add('new-in')
    if not tg:
        tg.add({'Walking': 'walking', 'Coats': 'coats', 'Beds': 'beds', 'Travel': 'travel'}.get(TYPE.get(p['product_type'], ''), 'gifts'))
    return sorted(tg)

def clean_html(h):
    h = re.sub(r'\s(class|style|data-[\w-]+|id)="[^"]*"', '', h or '')
    h = re.sub(r'<(span|div)[^>]*>|</(span|div)>', '', h)
    h = re.sub(r'<p>\s*(&nbsp;)?\s*</p>', '', h)
    return h.strip()

def title_for(p, r):
    t = p['title'].strip(); c = (r.get('colour') or '').strip()
    if c and t.lower().endswith(c.lower()):
        return t[:-len(c)].rstrip(' ,-') + ', ' + t[-len(c):]
    return t

DE = {'größe': 'Size', 'gewicht (kg)': 'Weight (kg)', 'rückenlänge (cm)': 'Back length (cm)', 'brustumfang (cm)': 'Chest (cm)',
      'halsumfang (cm)': 'Neck (cm)', 'brustlänge (cm)': 'Chest length (cm)', 'länge (cm)': 'Length (cm)', 'breite (cm)': 'Width (cm)',
      'höhe (cm)': 'Height (cm)', 'innenmaß (cm)': 'Inside (cm)', 'außenmaß (cm)': 'Outside (cm)', 'umfang (cm)': 'Girth (cm)', 'bauchumfang (cm)': 'Belly (cm)'}
GENERIC = set('dog dogs coat coats dachshund french bulldog frbulldog sighthound greyhound whippet regular for the and with in of'.split())
def model_key(x):
    t = P[x]['title'].lower(); c = (R[x].get('colour') or '').lower()
    if c and t.endswith(c): t = t[:-len(c)]
    return ' '.join(w for w in re.findall(r'[a-z0-9]+', t) if w not in GENERIC)
def chart_for(h):
    root, fit = FAM.get(h), R[h].get('fit') or '-'
    rep = next((x for x in CH if CH[x] and FAM.get(x) == root and (R[x].get('fit') or '-') == fit), None)
    if not rep:
        k = model_key(h)
        rep = next((x for x in CH if CH[x] and (R[x].get('fit') or '-') == fit and model_key(x) == k), None)
    if not rep or not CH[rep]: return None
    s = CH[rep][0]
    rows = [[str(c.get('value', '')).strip() for c in row] for t in s['tables'].values() for row in t['data']]
    if len(rows) < 2: return None
    rows[0] = [DE.get(x.lower(), x) for x in rows[0]]
    return '\n'.join(' | '.join(r) for r in rows)

SW = {}
for x in R.values():
    for s in x['colour_sibs']:
        if s.get('swatch'): SW.setdefault(s['handle'], s['swatch'])

def create(h):
    if h in ST['products']: return ST['products'][h]
    p, r = P[h], R[h]
    man = MAN.get(h, [])
    gallery = [m for m in man if m['kind'] in ('studio', 'detail')]
    life = [m for m in man if m not in gallery]
    files = [{'originalSource': staged(m['file']), 'contentType': 'IMAGE', 'alt': title_for(p, r)} for m in gallery]
    life_ids = [x for x in (file_from(m['file'], 'IMAGE', title_for(p, r)) for m in life) if x]
    film = next((f for f in r['films'] if f['kind'] == 'desktop'), None) or (r['films'][0] if r['films'] else None)
    film_id = file_from(film['src'], 'VIDEO', title_for(p, r) + ' film') if film else None
    sw = SW.get(h)
    sw_id = file_from(re.sub(r'width=\d+', 'width=160', sw), 'IMAGE', (r.get('colour') or '') + ' swatch') if sw else None
    mf = [{'namespace': 'custom', 'key': 'source_handle', 'type': 'single_line_text_field', 'value': h},
          {'namespace': 'custom', 'key': 'product_upload_source_url', 'type': 'url', 'value': f'https://cloud7.de/en-gb/products/{h}'}]
    if r['features']: mf.append({'namespace': 'custom', 'key': 'features', 'type': 'list.single_line_text_field', 'value': json.dumps(r['features'][:12])})
    mc = []
    if r['materials']: mc += ['Materials'] + r['materials']
    if r['care']: mc += ['Care'] + r['care']
    if mc: mf.append({'namespace': 'custom', 'key': 'materials_care', 'type': 'multi_line_text_field', 'value': '\n'.join(mc)})
    ch = chart_for(h)
    if ch: mf.append({'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': ch})
    if r['size_note']: mf.append({'namespace': 'custom', 'key': 'size_note', 'type': 'multi_line_text_field', 'value': '\n'.join(r['size_note'])})
    if r.get('colour'): mf.append({'namespace': 'custom', 'key': 'colour', 'type': 'single_line_text_field', 'value': r['colour']})
    if r.get('fit'): mf.append({'namespace': 'custom', 'key': 'fit', 'type': 'single_line_text_field', 'value': r['fit']})
    if film_id: mf.append({'namespace': 'custom', 'key': 'film', 'type': 'file_reference', 'value': film_id})
    if life_ids: mf.append({'namespace': 'custom', 'key': 'lifestyle', 'type': 'list.file_reference', 'value': json.dumps(life_ids)})
    if sw_id: mf.append({'namespace': 'custom', 'key': 'swatch', 'type': 'file_reference', 'value': sw_id})
    vs = p['variants']
    single = len(vs) == 1 and vs[0]['title'] in ('Default Title', 'Default')
    def var(v):
        d = {'price': v['price'], 'inventoryPolicy': 'DENY',
             'inventoryItem': {'tracked': True, 'sku': v.get('sku') or None,
                               'measurement': {'weight': {'value': float(v.get('grams') or 0), 'unit': 'GRAMS'}}},
             'inventoryQuantities': [{'locationId': LOC, 'name': 'available', 'quantity': 10 if v['available'] else 0}]}
        if v.get('compare_at_price') and float(v['compare_at_price']) > float(v['price']): d['compareAtPrice'] = v['compare_at_price']
        if not d['inventoryItem']['sku']: d['inventoryItem'].pop('sku')
        d['optionValues'] = [{'optionName': 'Title' if single else 'Size', 'name': 'Default Title' if single else v['title']}]
        return d
    inp = {'title': title_for(p, r), 'handle': h, 'descriptionHtml': clean_html(p['body_html']), 'vendor': 'Cloud7',
           'productType': TYPE.get(p['product_type'], p['product_type']), 'tags': tags_for(p, r), 'status': 'DRAFT',
           'productOptions': [{'name': 'Title' if single else 'Size', 'values': [{'name': 'Default Title'}] if single else [{'name': v['title']} for v in vs]}],
           'variants': [var(v) for v in vs], 'files': files, 'metafields': mf}
    d = g('mutation($i:ProductSetInput!){productSet(input:$i,synchronous:true){product{id handle} userErrors{field message code}}}', {'i': inp})['productSet']
    if d['userErrors']:
        print('  ERR', h, d['userErrors'][:3]); return None
    pid = d['product']['id']
    g('mutation($id:ID!,$p:[PublicationInput!]!){publishablePublish(id:$id,input:$p){userErrors{message}}}', {'id': pid, 'p': [{'publicationId': PUB}]})
    ST['products'][h] = pid; save()
    print('created', h, len(files), 'photos', len(life_ids), 'lifestyle', 'film' if film_id else '', 'chart' if ch else 'NO CHART', flush=True)
    return pid

def link(hs):
    """each product points at every colour and every fit in its family, itself included"""
    for h in hs:
        pid = ST['products'].get(h)
        if not pid: continue
        r = R[h]; mf = []
        cs = [h] + [s['handle'] for s in r['colour_sibs']]
        fs = [h] + [s['handle'] for s in r['fit_sibs']]
        cids = [ST['products'][x] for x in cs if x in ST['products']]
        fids = [ST['products'][x] for x in fs if x in ST['products']]
        if len(cids) > 1: mf.append({'ownerId': pid, 'namespace': 'custom', 'key': 'colour_siblings', 'type': 'list.product_reference', 'value': json.dumps(cids)})
        if len(fids) > 1: mf.append({'ownerId': pid, 'namespace': 'custom', 'key': 'fit_siblings', 'type': 'list.product_reference', 'value': json.dumps(fids)})
        if mf:
            e = g('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}', {'m': mf})['metafieldsSet']['userErrors']
            if e: print('  link error', h, e)

def top_up(hs):
    for h in hs:
        pid = ST['products'].get(h)
        if not pid: continue
        r = R[h]; mf = []
        film = next((f for f in r['films'] if f['kind'] == 'desktop'), None) or (r['films'][0] if r['films'] else None)
        fid = file_from(film['src'], 'VIDEO', title_for(P[h], r) + ' film') if film else None
        if fid: mf.append({'ownerId': pid, 'namespace': 'custom', 'key': 'film', 'type': 'file_reference', 'value': fid})
        ch = chart_for(h)
        if ch: mf.append({'ownerId': pid, 'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': ch})
        if mf:
            e = g('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}', {'m': mf})['metafieldsSet']['userErrors']
        print('topped up', h, 'film' if fid else '-', 'chart' if ch else 'NO CHART', flush=True)

if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[2] == 'topup':
        top_up(json.load(open(sys.argv[1]))); sys.exit()
    hs = json.load(open(sys.argv[1]))
    for h in hs:
        try: create(h)
        except Exception as e: print('  FAILED', h, str(e)[:200], flush=True)
    link(hs)
    print('done', len([h for h in hs if h in ST['products']]), 'of', len(hs))
