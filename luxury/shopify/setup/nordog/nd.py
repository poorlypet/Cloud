# Nordog: in-stock products as drafts, one product per colour, linked as colours of each other.
# Description, features, size guide, materials and care come from the product description.
import json, os, re, sys, html as H, io
D = os.path.dirname(os.path.abspath(__file__))
C7 = os.path.join(os.path.dirname(D), 'c7')
os.environ['STATE'] = f'{D}/state.json'
sys.path.insert(0, C7)
import upload, photos
from PIL import Image
G = upload.g
RATE = 0.83559                          # EUR to GBP, 13 Nov 2026
P = json.load(open(f'{D}/products.json'))
LOC, PUB = upload.LOC, upload.PUB
ST = upload.ST
def save(): json.dump(ST, open(os.environ['STATE'], 'w'), indent=1)

def gbp(eur): return f'{max(1, round(float(eur) * RATE)):.2f}'

SIZE = {'Small': 'S', 'Small/medium': 'S/M', 'Medium': 'M', 'Large': 'L', 'X-Large': 'XL', 'Extra large': 'XL'}
def size_name(x): return SIZE.get(x.strip(), x.strip())

def txt(x): return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', x))).strip()

def split_body(html):
    """description (no size guide), features, size guide lines, materials and care lines"""
    h = re.sub(r'<meta[^>]*>', '', html or '')
    m = re.search(r'(?is)<(p|h\d|strong|b)[^>]*>\s*(?:<[^>]+>\s*)*size\s*guide.*', h)
    size_html = h[m.start():] if m else ''
    desc_html = h[:m.start()] if m else h
    feats = [txt(li) for li in re.findall(r'<li[^>]*>(.*?)</li>', desc_html, re.S)]
    feats = [f for f in feats if f and len(f) < 220]
    mat_words = r'(?i)\b(made (?:of|from)|material|leather|silicone|polyester|cotton|wool|nylon|ceramic|stoneware|steel|bamboo|rubber|memory foam|wash|dishwasher|clean|fabric|martindale|foam|fleece|food-grade)\b'
    mats = [f for f in feats if re.search(mat_words, f)]
    feats = [f for f in feats if f not in mats] or feats
    for p in re.findall(r'<p[^>]*>(.*?)</p>', desc_html, re.S):
        t = txt(p)
        if re.match(r'(?i)^(the )?(cover|mattress|zip|leather strap|material|fabric|filling|care|washing)\b', t) and len(t) < 260: mats.append(t)
    size_lines = []
    if size_html:
        s = re.sub(r'<br\b[^>]*>|<b\b[^>]*>|</p>|</li>|</strong>(?=\s*<ul)', '\n', size_html)
        s = re.sub(r'<li[^>]*>', '\n· ', s)
        for line in txt(re.sub(r'\n', ' ¶ ', s)).split('¶'):
            line = line.strip(' ·')
            if line and not re.match(r'(?i)^size\s*guide', line): size_lines.append(line)
    desc = re.sub(r'<p>\s*(&nbsp;|\s)*\s*</p>', '', desc_html)
    desc = re.sub(r'\s(class|style|data-[\w-]+|id)="[^"]*"', '', desc).strip()
    return desc, feats[:10], size_lines, mats

def size_table(size_lines, sizes):
    """'Small:' then measurements, or 'S: 25-30 cm' on one line, into Size | Measurements"""
    rows, cur = [], None
    for l in size_lines:
        m = re.match(r'(?i)^(xs|s|m|l|xl|small|medium|large|small/medium|s/m|m/l|x-?large)\s*[:\-]\s*(.*)$', l)
        if m:
            cur = [size_name(m.group(1).capitalize() if len(m.group(1)) > 2 else m.group(1).upper()), m.group(2).strip()]
            rows.append(cur)
        elif cur is not None:
            cur[1] = (cur[1] + '; ' + l).strip('; ')
    rows = [r for r in rows if r[1]]
    if not rows: return None
    return 'Size | Measurements\n' + '\n'.join(f'{r[0]} | {r[1]}' for r in rows)

# ---------- colours and families ----------
COLOUR_WORDS = set('grass teddy corduroy dark light black white grey gray anthracite graphite olive forrest forest beige cappuccino latte ocean flamingo choco chocolate yellow orange taupe purple russo pink green blush sand sun blue navy mocca mocha cognac nougat brown camel rose red plaid salt pepper and & cream sage mint coral'.split())
def colour_of(p):
    m = re.search(r'\(([^)]+)\)\s*$', p['title'])
    if m: return re.sub(r'\s*,\s*', ' ', m.group(1)).strip().title()
    w = p['title'].split(); out = []
    while w and w[-1].lower().strip(',') in COLOUR_WORDS: out.insert(0, w.pop())
    if out and not (len(out) == 1 and out[0] in ('&', 'and')): return ' '.join(out)
    for o in p['options']:
        if o['name'].lower() in ('color', 'colour') and len(o['values']) == 1: return o['values'][0]
    return None

def base_of(p):
    c = colour_of(p); t = p['title'].strip()
    if re.search(r'\([^)]+\)\s*$', t): return re.sub(r'\s*\([^)]+\)\s*$', '', t).strip(' -')
    if c and t.lower().endswith(c.lower()): t = t[:-len(c)].strip(' ,-')
    return t

def items():
    """one record per product colour; a product with several colours becomes several"""
    out = []
    for p in P:
        if not any(v['available'] for v in p['variants']): continue
        names = [o['name'] for o in p['options']]
        ci = next((i for i, n in enumerate(names) if n.lower() in ('color', 'colour')), None)
        cols = p['options'][ci]['values'] if ci is not None else [None]
        for c in cols:
            vs = [v for v in p['variants'] if ci is None or v[f'option{ci + 1}'] == c]
            if not any(v['available'] for v in vs): continue
            colour = colour_of(p) if len(cols) == 1 else (c or colour_of(p))
            base = base_of(p) if (ci is None or len(cols) == 1) else p['title'].strip()
            handle = p['handle'] if len(cols) == 1 else f"{p['handle']}-{re.sub(r'[^a-z0-9]+', '-', (c or '').lower()).strip('-')}"
            ids = {v['id'] for v in vs}
            imgs = [im for im in p['images'] if not im.get('variant_ids') or set(im['variant_ids']) & ids] or p['images']
            out.append({'p': p, 'handle': handle, 'colour': colour, 'base': base, 'variants': vs, 'images': imgs,
                        'size_idx': next((i for i, n in enumerate(names) if n.lower() == 'size'), None)})
    fam = {}
    for it in out: fam.setdefault(re.sub(r'\s+', ' ', it['base'].lower()), []).append(it['handle'])
    for it in out: it['family'] = fam[re.sub(r'\s+', ' ', it['base'].lower())]
    return out

TAGS = {'dog toy': ['play'], 'dog bed': ['beds'], 'dog cushion': ['beds'], 'placemat': ['dining', 'placemats'], 'dog harness': ['walking', 'harnesses'],
        'dog bowl': ['dining', 'bowls'], 'dog collar': ['walking', 'collars'], 'poop bag holder': ['walking', 'poop-bag-holders'],
        'treat bag': ['walking', 'treat-pouches'], 'dog brush': ['dining', 'care', 'grooming', 'brushes'], 'dog jacket': ['coats'],
        'dog bag': ['travel', 'carriers'], 'grooming mat': ['dining', 'care', 'grooming'], 'dog bath brush': ['dining', 'care', 'grooming', 'brushes'],
        'scissor set': ['dining', 'care', 'grooming'], 'dog clipper': ['dining', 'care', 'grooming']}
def tags_for(it):
    t = it['p']['title'].lower(); tg = set(TAGS.get(it['p']['product_type'].strip().lower(), []))
    if 'leash' in t or 'lead' in t: tg |= {'walking', 'leads'}
    if 'collar' in t: tg |= {'walking', 'collars'}
    if 'harness' in t: tg |= {'walking', 'harnesses'}
    if 'leather' in t and tg & {'collars', 'leads', 'harnesses'}: tg.add('leather')
    if 'bed' in t: tg.add('beds')
    if 'blanket' in t: tg |= {'beds', 'blankets-and-cushions'}
    if 'bowl' in t: tg |= {'dining', 'bowls'}
    if 'toy' in t: tg.add('play')
    if 'jacket' in t or 'coat' in t: tg |= {'coats', 'standard-fit'}
    return sorted(tg or {'gifts'})

def swatch_image(path):
    """a small swatch in the product's own main colour"""
    im = Image.open(path).convert('RGB').resize((120, 120))
    px = [p for p in im.getdata() if not (abs(p[0] - 234) < 14 and abs(p[1] - 234) < 14 and abs(p[2] - 235) < 14)]
    if not px: return None
    from collections import Counter
    q = Counter((r // 24 * 24 + 12, g // 24 * 24 + 12, b // 24 * 24 + 12) for r, g, b in px).most_common(1)[0][0]
    out = f'{D}/sw_{abs(hash(path)) % 10**8}.png'
    Image.new('RGB', (80, 80), q).save(out)
    return out

def process_photos(it):
    d = f'{D}/processed/{it["handle"]}'; os.makedirs(d, exist_ok=True)
    mf = f'{d}/m.json'
    if os.path.exists(mf): return json.load(open(mf))
    rec = []
    for i, im in enumerate(it['images']):
        img = photos.fetch(im['src'])
        if img is None: continue
        name = im['src'].split('/')[-1].split('?')[0]
        kind = 'studio' if photos.is_studio(img, name) else ('detail' if photos.plain_share(img) >= .12 else 'life')
        out = photos.tone(img) if kind != 'life' else photos.lifestyle(img)
        fn = f'{d}/{i:02d}-{kind}.jpg'; out.save(fn, quality=88, optimize=True, progressive=True)
        rec.append({'file': fn, 'kind': kind, 'src': name})
    json.dump(rec, open(mf, 'w'), indent=1)
    return rec

def create(it):
    h = it['handle']
    if h in ST['products']: return
    p = it['p']; man = process_photos(it)
    gal = [m for m in man if m['kind'] in ('studio', 'detail')]
    life = [m for m in man if m['kind'] == 'life']
    title = f"{it['base']}, {it['colour']}" if it['colour'] and it['colour'].lower() not in it['base'].lower() else p['title']
    files = [{'originalSource': upload.staged(m['file']), 'contentType': 'IMAGE', 'alt': title} for m in gal]
    life_ids = [x for x in (upload.file_from(m['file'], 'IMAGE', title) for m in life) if x]
    desc, feats, size_lines, mats = split_body(p['body_html'])
    sizes = [size_name(v[f"option{it['size_idx'] + 1}"]) for v in it['variants']] if it['size_idx'] is not None else []
    chart = size_table(size_lines, sizes) if size_lines else None
    mf = [{'namespace': 'custom', 'key': 'source_handle', 'type': 'single_line_text_field', 'value': p['handle']},
          {'namespace': 'custom', 'key': 'product_upload_source_url', 'type': 'url', 'value': f"https://nor-dog.com/products/{p['handle']}"}]
    if feats: mf.append({'namespace': 'custom', 'key': 'features', 'type': 'list.single_line_text_field', 'value': json.dumps(feats)})
    if mats: mf.append({'namespace': 'custom', 'key': 'materials_care', 'type': 'multi_line_text_field', 'value': '\n'.join(['Materials'] + mats)})
    if chart: mf.append({'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': chart})
    elif size_lines: mf.append({'namespace': 'custom', 'key': 'size_note', 'type': 'multi_line_text_field', 'value': '\n'.join(size_lines)})
    if it['colour']: mf.append({'namespace': 'custom', 'key': 'colour', 'type': 'single_line_text_field', 'value': it['colour']})
    if life_ids: mf.append({'namespace': 'custom', 'key': 'lifestyle', 'type': 'list.file_reference', 'value': json.dumps(life_ids)})
    if gal:
        sw = swatch_image(gal[0]['file'])
        if sw:
            sid = upload.file_from(sw, 'IMAGE', (it['colour'] or '') + ' swatch')
            if sid: mf.append({'namespace': 'custom', 'key': 'swatch', 'type': 'file_reference', 'value': sid})
    def var(v):
        d = {'price': gbp(v['price']), 'inventoryPolicy': 'DENY',
             'inventoryItem': {'tracked': True, 'measurement': {'weight': {'value': float(v.get('grams') or 0), 'unit': 'GRAMS'}}},
             'inventoryQuantities': [{'locationId': LOC, 'name': 'available', 'quantity': 10 if v['available'] else 0}]}
        if v.get('sku'): d['inventoryItem']['sku'] = v['sku']
        if v.get('compare_at_price') and float(v['compare_at_price']) > float(v['price']): d['compareAtPrice'] = gbp(v['compare_at_price'])
        d['optionValues'] = [{'optionName': 'Size', 'name': size_name(v[f"option{it['size_idx'] + 1}"])}] if it['size_idx'] is not None else [{'optionName': 'Title', 'name': 'Default Title'}]
        return d
    vs = it['variants']
    opts = [{'name': 'Size', 'values': [{'name': s} for s in dict.fromkeys(sizes)]}] if it['size_idx'] is not None else [{'name': 'Title', 'values': [{'name': 'Default Title'}]}]
    inp = {'title': title, 'handle': h, 'descriptionHtml': desc, 'vendor': 'Nordog', 'productType': p['product_type'].strip() or 'Accessories',
           'tags': tags_for(it), 'status': 'DRAFT', 'productOptions': opts, 'variants': [var(v) for v in vs], 'files': files, 'metafields': mf}
    d = G('mutation($i:ProductSetInput!){productSet(input:$i,synchronous:true){product{id} userErrors{field message}}}', {'i': inp})['productSet']
    if d['userErrors']: print('ERR', h, d['userErrors'][:3], flush=True); return
    pid = d['product']['id']
    G('mutation($id:ID!,$p:[PublicationInput!]!){publishablePublish(id:$id,input:$p){userErrors{message}}}', {'id': pid, 'p': [{'publicationId': PUB}]})
    ST['products'][h] = pid; save()
    print('created', h, len(files), 'photos', len(life_ids), 'lifestyle', 'chart' if chart else ('note' if size_lines else '-'), flush=True)

def link(its):
    for it in its:
        pid = ST['products'].get(it['handle'])
        sib = [ST['products'][x] for x in it['family'] if x in ST['products']]
        if pid and len(sib) > 1:
            G('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}',
              {'m': [{'ownerId': pid, 'namespace': 'custom', 'key': 'colour_siblings', 'type': 'list.product_reference', 'value': json.dumps(sib)}]})

if __name__ == '__main__':
    its = items()
    if len(sys.argv) > 1 and sys.argv[1] == 'plan':
        from collections import Counter
        print(len(its), 'products to make;', sum(1 for i in its if len(i['family']) > 1), 'in colour families')
        for it in its[:25]: print(' ', it['handle'], '|', it['base'], '|', it['colour'], '| family', len(it['family']))
        sys.exit()
    sel = set(sys.argv[1:])
    todo = [i for i in its if not sel or i['handle'] in sel]
    for it in todo:
        try: create(it)
        except Exception as e: print('FAILED', it['handle'], str(e)[:200], flush=True)
    link(its)
    print('done', len([i for i in its if i['handle'] in ST['products']]), 'of', len(its))
