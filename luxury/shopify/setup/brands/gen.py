# Shared importer for Shopify-based dog brands. A brand module supplies items(): one dict per product to create, with
# p (source product), handle, title, colour, base (family name), variants, images, sizes (list of (variant, size name)),
# hw (dict variant id -> hardware or None), desc, mat, care, chart, tags, ptype, src_url.
import json, os, re, sys, html as H
SCR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(SCR, 'c7')); sys.path.insert(0, SCR)
RATE = 0.8356                                   # EUR to GBP, 14 Nov 2026
def gbp(eur): return f'{max(1, round(float(eur) * RATE)):.2f}'
RANK = ['XXXS', 'XXS', 'XS', 'XS–S', 'S', 'S/M', 'S–M', 'M', 'M/L', 'M–L', 'L', 'XL', 'XL–XXL', 'XXL', '3XL']

def setup(brand_dir):
    os.environ['STATE'] = f'{brand_dir}/state.json'
    if not os.path.exists(os.environ['STATE']): json.dump({'products': {}, 'files': {}}, open(os.environ['STATE'], 'w'))
    import upload, photos
    return upload, photos

def lines_of(x):
    x = re.sub(r'<br\s*/?>', '\n', x or ''); x = re.sub(r'</(p|li|h\d|div|tr)>', '\n', x)
    t = H.unescape(re.sub(r'<[^>]+>', ' ', x)).replace('\xa0', ' ')
    return [re.sub(r'\s+', ' ', l).strip() for l in t.split('\n') if l.strip()]

def summary(text, words=40):
    out = ''
    for s in re.split(r'(?<=[.!?])\s+', re.sub(r'\s+', ' ', text).strip()):
        if re.search(r'(?i)wash|°c|tumble|detergent|free shipping|discount|% off|sale|click|shop now', s): continue
        if len((out + ' ' + s).split()) > words and out: break
        out = (out + ' ' + s).strip()
    return out

def size_key(n): return RANK.index(n) if n in RANK else 99

def split_by_option(p, opt_names):
    """one entry per value of the first matching option (colour etc.), with its variants and images"""
    ci = next((i for i, o in enumerate(p['options']) if o['name'].lower() in opt_names), None)
    if ci is None or len(p['options'][ci]['values']) < 2: return [(None, p['variants'], p['images'], ci)]
    out = []
    for val in p['options'][ci]['values']:
        vs = [v for v in p['variants'] if v[f'option{ci + 1}'] == val]
        if not any(v['available'] for v in vs): continue
        ids = {v['id'] for v in vs}
        imgs = [im for im in p['images'] if set(im.get('variant_ids') or []) & ids]
        feat = [v.get('featured_image') for v in vs if v.get('featured_image')]
        if not imgs and feat:
            fid = {f['id'] for f in feat}; imgs = [im for im in p['images'] if im['id'] in fid]
        if imgs:   # add the images that follow the colour's own photo until the next colour's photo
            order = [im['id'] for im in p['images']]; start = order.index(imgs[0]['id'])
            other = {im['id'] for v in p['variants'] if v.get('featured_image') and v[f'option{ci + 1}'] != val for im in [v['featured_image']]}
            extra = []
            for im in p['images'][start + 1:]:
                if im['id'] in other: break
                extra.append(im)
            imgs = imgs + [im for im in extra if im not in imgs]
        out.append((val, vs, imgs or p['images'], ci))
    return out

def process_photos(upload, photos, d, images):
    os.makedirs(d, exist_ok=True); mf = f'{d}/m.json'
    if os.path.exists(mf): return json.load(open(mf))
    rec = []
    for i, im in enumerate(images[:12]):
        img = photos.fetch(im['src'])
        if img is None: continue
        name = im['src'].split('/')[-1].split('?')[0]
        kind = 'studio' if photos.is_studio(img, name) else ('detail' if photos.plain_share(img) >= .12 else 'life')
        out = photos.tone_crop(img) if kind != 'life' else photos.lifestyle(img)
        fn = f'{d}/{i:02d}-{kind}.jpg'; out.save(fn, quality=88, optimize=True, progressive=True)
        rec.append({'file': fn, 'kind': kind, 'src': name})
    if rec and not any(m['kind'] != 'life' for m in rec):
        img = photos.fetch(images[0]['src']); photos.tone_crop(img).save(rec[0]['file'], quality=88); rec[0]['kind'] = 'studio'
    json.dump(rec, open(mf, 'w'), indent=1)
    return rec

def swatch_image(path, out):
    from PIL import Image
    from collections import Counter
    im = Image.open(path).convert('RGB').resize((120, 120))
    px = [p for p in im.getdata() if not (min(p) > 200 and max(p) - min(p) < 18)]
    if not px: return None
    q = Counter((r // 24 * 24 + 12, g // 24 * 24 + 12, b // 24 * 24 + 12) for r, g, b in px).most_common(1)[0][0]
    Image.new('RGB', (80, 80), q).save(out); return out

def create(upload, photos, brand_dir, vendor, it):
    ST = upload.ST; h = it['handle']
    if h in ST['products']: return
    man = process_photos(upload, photos, f'{brand_dir}/processed/{h}', it['images'])
    gal = [m for m in man if m['kind'] in ('studio', 'detail')]; life = [m for m in man if m['kind'] == 'life']
    files = [{'originalSource': upload.staged(m['file']), 'contentType': 'IMAGE', 'alt': it['title']} for m in gal]
    life_ids = [x for x in (upload.file_from(m['file'], 'IMAGE', it['title']) for m in life) if x]
    mf = [{'namespace': 'custom', 'key': 'source_handle', 'type': 'single_line_text_field', 'value': it['p']['handle']},
          {'namespace': 'custom', 'key': 'product_upload_source_url', 'type': 'url', 'value': it['src_url']}]
    mc = (['Materials'] + it['mat'] if it.get('mat') else []) + (['Care'] + it['care'] if it.get('care') else [])
    if mc: mf.append({'namespace': 'custom', 'key': 'materials_care', 'type': 'multi_line_text_field', 'value': '\n'.join(mc)})
    if it.get('chart'): mf.append({'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': it['chart']})
    if it.get('features'): mf.append({'namespace': 'custom', 'key': 'features', 'type': 'list.single_line_text_field', 'value': json.dumps(it['features'][:5])})
    if it.get('colour'): mf.append({'namespace': 'custom', 'key': 'colour', 'type': 'single_line_text_field', 'value': it['colour']})
    if life_ids: mf.append({'namespace': 'custom', 'key': 'lifestyle', 'type': 'list.file_reference', 'value': json.dumps(life_ids)})
    if gal:
        sw = swatch_image(gal[0]['file'], f'{brand_dir}/sw_{abs(hash(h)) % 10**8}.png')
        if sw:
            sid = upload.file_from(sw, 'IMAGE', (it.get('colour') or '') + ' swatch')
            if sid: mf.append({'namespace': 'custom', 'key': 'swatch', 'type': 'file_reference', 'value': sid})
    # variants: size x hardware, one per combination, smallest size first
    rows, seen = [], set()
    for v in it['variants']:
        s = it['size_of'](v) if it.get('size_of') else None
        hw = it['hw_of'](v) if it.get('hw_of') else None
        k = (s, hw)
        if k in seen: continue
        seen.add(k); rows.append((v, s, hw))
    rows.sort(key=lambda r: (size_key(r[1]) if r[1] else 0, r[1] or '', r[2] or ''))
    has_s = any(r[1] for r in rows); has_h = len({r[2] for r in rows if r[2]}) > 1
    def var(v, s, hw):
        d = {'price': gbp(v['price']), 'inventoryPolicy': 'DENY',
             'inventoryItem': {'tracked': True, 'measurement': {'weight': {'value': float(v.get('grams') or 0), 'unit': 'GRAMS'}}},
             'inventoryQuantities': [{'locationId': upload.LOC, 'name': 'available', 'quantity': 10 if v['available'] else 0}]}
        if v.get('sku'): d['inventoryItem']['sku'] = v['sku']
        if v.get('compare_at_price') and float(v['compare_at_price']) > float(v['price']): d['compareAtPrice'] = gbp(v['compare_at_price'])
        ov = []
        if has_s: ov.append({'optionName': 'Size', 'name': s or 'One size'})
        if has_h: ov.append({'optionName': 'Hardware', 'name': hw})
        d['optionValues'] = ov or [{'optionName': 'Title', 'name': 'Default Title'}]
        return d
    if not has_s and not has_h: rows = rows[:1]
    opts = []
    if has_s: opts.append({'name': 'Size', 'values': [{'name': n} for n in dict.fromkeys(r[1] or 'One size' for r in rows)]})
    if has_h: opts.append({'name': 'Hardware', 'values': [{'name': n} for n in dict.fromkeys(r[2] for r in rows)]})
    if not opts: opts = [{'name': 'Title', 'values': [{'name': 'Default Title'}]}]
    inp = {'title': it['title'], 'handle': h, 'descriptionHtml': f"<p>{H.escape(it['desc'])}</p>" if it.get('desc') else '', 'vendor': vendor,
           'productType': it.get('ptype') or 'Accessories', 'tags': it.get('tags') or ['gifts'], 'status': 'DRAFT', 'productOptions': opts,
           'variants': [var(*r) for r in rows], 'files': files, 'metafields': mf}
    d = upload.g('mutation($i:ProductSetInput!){productSet(input:$i,synchronous:true){product{id} userErrors{field message}}}', {'i': inp})['productSet']
    if d['userErrors']: print('ERR', h, d['userErrors'][:3], flush=True); return
    pid = d['product']['id']
    upload.g('mutation($id:ID!,$p:[PublicationInput!]!){publishablePublish(id:$id,input:$p){userErrors{message}}}', {'id': pid, 'p': [{'publicationId': upload.PUB}]})
    ST['products'][h] = pid; json.dump(ST, open(os.environ['STATE'], 'w'), indent=1)
    print('created', h, len(files), 'photos', len(life_ids), 'lifestyle', 'chart' if it.get('chart') else '-', flush=True)

def link(upload, its):
    fam = {}
    for it in its: fam.setdefault(it['base'].lower(), []).append(it['handle'])
    for it in its:
        pid = upload.ST['products'].get(it['handle']); sib = [upload.ST['products'][x] for x in fam[it['base'].lower()] if x in upload.ST['products']]
        if pid and len(sib) > 1:
            upload.g('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}',
                     {'m': [{'ownerId': pid, 'namespace': 'custom', 'key': 'colour_siblings', 'type': 'list.product_reference', 'value': json.dumps(sib)}]})

def tags_for(t):
    t = t.lower(); tg = set()
    if re.search(r'leash|lead\b|leine', t): tg |= {'walking', 'leads'}
    if re.search(r'collar|necklace', t): tg |= {'walking', 'collars'}
    if 'harness' in t: tg |= {'walking', 'harnesses'}
    if re.search(r'treat bag|treat pouch', t): tg |= {'walking', 'treat-pouches'}
    if re.search(r'waste bag|poop|poo bag', t): tg |= {'walking', 'poop-bag-holders'}
    if re.search(r'\bbed\b|cushion|pillow', t): tg.add('beds')
    if re.search(r'blanket|duvet', t): tg |= {'beds', 'blankets-and-cushions'}
    if re.search(r'\bcover\b', t): tg |= {'beds', 'covers'}
    if re.search(r'bowl|tray', t): tg |= {'dining', 'bowls'}
    if 'toy' in t: tg.add('play')
    if re.search(r'jacket|coat|raincoat|sweater|jumper|pullover|shirt|vest|suit|bandana', t): tg |= {'coats', 'standard-fit'}
    if re.search(r'carrier|shopper|car seat|travel', t): tg |= {'travel', 'carriers'}
    if re.search(r'shampoo|spray|brush|perfume|grooming', t): tg |= {'dining', 'care', 'grooming'}
    return sorted(tg or {'gifts'})

def ptype_for(t):
    t = t.lower()
    for k, v in [('harness', 'Dog harness'), ('necklace', 'Dog collar'), ('collar', 'Dog collar'), ('extension', 'Dog leash'), ('leash', 'Dog leash'),
                 ('treat bag', 'Treat bag'), ('waste bag', 'Poop bag holder'), ('poop', 'Poop bag holder'), ('cover', 'Bed cover'), ('blanket', 'Dog blanket'),
                 ('bed', 'Dog bed'), ('cushion', 'Dog bed'), ('bowl', 'Dog bowl'), ('tray', 'Dog bowl'), ('toy', 'Dog toy'), ('raincoat', 'Dog coat'),
                 ('jacket', 'Dog coat'), ('coat', 'Dog coat'), ('sweater', 'Dog jumper'), ('pullover', 'Dog jumper'), ('bandana', 'Dog accessory'),
                 ('shopper', 'Dog bag'), ('carrier', 'Dog bag'), ('car seat', 'Dog car seat')]:
        if k in t: return v
    return 'Accessories'

def fetch_page_text(url):
    import urllib.request
    s = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read().decode('utf-8', 'ignore')
    s2 = re.sub(r'(?s)<(script|style|svg).*?</\1>', '', s)
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', s2)))
