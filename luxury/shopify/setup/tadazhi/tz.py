# Tadazhi: in-stock products as drafts, one product per colour (as Tadazhi sells them), linked as colours of each other.
# Short description, size table (from the size options and "Fit & sizes"), materials and care, all from Tadazhi's own text.
import json, os, re, sys, html as H
D = os.path.dirname(os.path.abspath(__file__))
C7 = os.path.join(os.path.dirname(D), 'c7')
os.environ['STATE'] = f'{D}/state.json'
sys.path.insert(0, C7)
import upload, photos
from PIL import Image
G = upload.g
RATE = 0.8356 / 7.4605                 # DKK to GBP via EUR, 14 Nov 2026
P = json.load(open(f'{D}/p1.json'))['products']
LOC, PUB = upload.LOC, upload.PUB
ST = upload.ST
def save(): json.dump(ST, open(os.environ['STATE'], 'w'), indent=1)
def gbp(dkk): return f'{max(1, round(float(dkk) * RATE)):.2f}'
SKIP = re.compile(r'copy|not-applicable|archive|no-straps|non-organic|gift-card|sample', re.I)
COLOURS = ['sandy brown', 'autumn yellow', 'nordic blue', 'nude', 'orange', 'natural', 'cognac', 'mocca', 'dark sand', 'light brown', 'warm grey', 'warm red', 'faded blue', 'mellow green', 'storm blue', 'green sand', 'gray brown', 'grey brown',
           'classic striped', 'beige', 'sand', 'rose', 'powder', 'creme', 'cream', 'grey', 'gray', 'blue', 'green', 'red', 'black', 'brown', 'olive']

def lines_of(x):
    x = re.sub(r'<br\s*/?>', '\n', x or ''); x = re.sub(r'</(p|li|h\d|div)>', '\n', x)
    t = H.unescape(re.sub(r'<[^>]+>', ' ', x)).replace('\xa0', ' ')
    out = []
    for l in t.split('\n'):
        l = re.sub(r'\s+', ' ', l).strip()
        if l: out.append(l)
    # join "Label:" lines with the value on the next line
    j = []
    for l in out:
        if j and re.match(r'^[A-Za-z][^:]{0,40}:$', j[-1]) and not re.match(r'^[A-Za-z][^:]{0,40}:$', l): j[-1] = j[-1] + ' ' + l
        else: j.append(l)
    return j

HEAD = re.compile(r'(?i)^(fit\s*&\s*sizes?|sizes?|materials?\s*&\s*care|materials?|care|colou?r|consciously crafted|great fit.*|warmth.*|details?)$')
def sections(ls):
    sec, cur = {'intro': []}, 'intro'
    for l in ls:
        if HEAD.match(l): cur = l.lower(); sec.setdefault(cur, []); continue
        sec.setdefault(cur, []).append(l)
    return sec

def summary(ls):
    prose = [l for l in ls if len(l) > 50 and ':' not in l[:30] and not re.match(r'(?i)(the bag is similar|all our products|made with love|consciously|the colou?r may fade)', l)]
    text = ' '.join(prose[:2])
    sents = re.split(r'(?<=[.!?])\s+', text)
    out = ''
    for s in sents:
        if re.search(r'(?i)wash|°c|tumble|detergent|laundry|vacuum|iron at', s): continue
        if len((out + ' ' + s).split()) > 42 and out: break
        out = (out + ' ' + s).strip()
    return out

MATK = re.compile(r'(?i)^(materials?|fabrics?|filling|cover|removable cover|duvet(, dog blanket)?|mattress|bag|inner( pillow)?|lining|outer|straps?|buckles?|handle)\s*:\s*(.+)$')
def mat_care(ls, sec):
    mat, care = [], []
    for l in ls:
        m = MATK.match(l)
        if m: mat.append((m.group(1).capitalize() + ': ' if m.group(1).lower() not in ('material', 'materials', 'fabric', 'fabrics') else '') + m.group(m.lastindex).strip().rstrip('.'))
        elif re.match(r'(?i)^\d+%', l) and len(l) < 120: mat.append(l.rstrip('.'))
        c = re.match(r'(?i)^care( instructions)?\s*:\s*(.+)$', l)
        if c: care += [s.strip().rstrip('.') for s in re.split(r'(?<=\.)\s+', c.group(2)) if s.strip()]
    for k in sec:
        if k.startswith('materials') and not mat:
            for l in sec[k]:
                if re.search(r'(?i)wash|clean|dry|iron|vacuum|zip', l): care += [s.strip().rstrip('.') for s in re.split(r'(?<=\.)\s+', l) if s.strip()]
                elif len(l) < 140 and not re.match(r'(?i)^(materials|care)$', l): mat.append(l.rstrip('.'))
        if k == 'care' and not care:
            for l in sec[k]: care += [s.strip().rstrip('.') for s in re.split(r'(?<=\.)\s+', l) if s.strip()]
    care = [c for c in care if len(c) > 3][:5]
    return list(dict.fromkeys(mat))[:5], care

ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL']
BACK = {25: 'XXS', 27: 'XXS', 30: 'XS', 35: 'S', 40: 'M', 45: 'L', 50: 'XL', 55: 'XXL', 60: '3XL'}
def size_info(p, ls):
    """letter size names for each option value, and a size table"""
    si = next((i for i, o in enumerate(p['options']) if o['name'].lower().startswith('size')), None)
    if si is None: return None, {}, None
    vals = p['options'][si]['values']
    name, rows = {}, []
    text = ' '.join(ls)
    for k, v in enumerate(vals):
        m = re.search(r'(?i)back\s*len[gh]+t?h?\s*(\d+)', v) or (re.fullmatch(r'\s*(\d+)\s*', v) if 'back' in p['options'][si]['name'].lower() else None)
        if m:
            cm = int(m.group(1)); nm = BACK.get(cm, f'{cm} cm'); name[v] = nm
            extra = [f'{a.strip()}' for a in re.findall(rf'(?i)size {cm}\s*:\s*([\d.,]+\s*[–-]\s*[\d.,]+\s*cm|[\d.,]+\s*cm)', text)]
            rows.append([nm, f'{cm} cm'] + extra); continue
        m = re.match(r'(?i)\s*(XXS|XS|S|M|L|XL|XXL)\s*:\s*(.*)', v)
        if m:
            nm = m.group(1).upper(); name[v] = nm
            w = re.search(rf'(?i)\b{nm}\s*:\s*width\s*([\d.,]+\s*cm)', text)
            rows.append([nm] + ([w.group(1)] if w else []) + [re.sub(r'(?i)chest\s*|from\s*', '', m.group(2)).strip().replace(' - ', '–').replace('-', '–')]); continue
        m = re.search(r'(\d+\s*x\s*\d+(?:\s*x\s*\d+)?)', v)
        if m:
            dims = re.sub(r'\s*x\s*', ' × ', m.group(1)) + ' cm'
            lab = re.search(rf'(?<![A-Z])(XS|S|M|L|XL):(?:ø|dia)?{re.escape(re.sub(r"\s+", "", m.group(1)))}', re.sub(r'\s+', '', text))
            nm = lab.group(1).upper() if lab else None
            name[v] = nm; rows.append([nm, ('Ø ' if 'dia' in v.lower() or 'ø' in v.lower() else '') + dims]); continue
        name[v] = v.strip(); rows.append([v.strip(), ''])
    # fill unlabeled dimension sizes in order
    if any(r[0] is None for r in rows):
        lab = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'] if len(rows) <= 5 else ORDER
        if all(r[0] is None for r in rows):
            area = lambda r: eval('*'.join(re.findall(r'[\d.]+', r[1])[:2]) or '0')
            for k, r in enumerate(sorted(rows, key=area)): r[0] = lab[k] if k < len(lab) else f'Size {k + 1}'
        prev = -1
        for r in rows:
            if r[0] is None:
                r[0] = lab[prev + 1] if prev + 1 < len(lab) else f'Size {rows.index(r) + 1}'
            prev = lab.index(r[0]) if r[0] in lab else prev + 1
        for v in vals:
            if name[v] is None: name[v] = rows[vals.index(v)][0]
    # suitability by weight ("Size S is suitable for ... up to 15 kgs")
    for r in rows:
        w = re.search(rf'(?i)size {r[0]} is suitable for[^.]*?up to (\d+)\s*kg', text)
        if w: r.append(f'up to {w.group(1)} kg')
    if not rows: return si, name, None
    RK = ORDER + ['3XL']
    rows.sort(key=lambda r: RK.index(r[0]) if r[0] in RK else 99)
    n = max(len(r) for r in rows)
    first = rows[0][1] if len(rows[0]) > 1 else ''
    if re.search(r'Ø|×', first): hdr = ['Size', 'Dimensions']
    elif any('back' in v.lower() for v in vals) or 'back' in p['options'][si]['name'].lower():
        hdr = ['Size', 'Back length'] + (['Body belt'] if re.search(r'(?i)body belt', text) else []) + (['Head opening'] if re.search(r'(?i)head opening', text) else [])
    elif re.search(r'\d\s*(x|×)\s*\d|\bH\s*\d', ' '.join(r[1] for r in rows if len(r) > 1)): hdr = ['Size', 'Dimensions']
    else: hdr = ['Size'] + (['Width'] if any(len(r) > 2 for r in rows) else []) + (['Neck'] if 'collar' in p['title'].lower() else ['Chest'])
    if any('kg' in c for r in rows for c in r): hdr = hdr[:n - 1] + ['Suits']
    hdr = (hdr + [''] * n)[:n]
    tbl = [' | '.join(hdr)] + [' | '.join((r + [''] * n)[:n]) for r in rows]
    return si, name, '\n'.join(tbl)

def one_size_table(ls):
    for l in ls:
        m = re.match(r'(?i)^(size[^:]{0,40}|dimensions?)\s*:\s*(.+)$', l)
        if m and re.search(r'\d', m.group(2)):
            v = re.sub(r'(?i)\b(XS|S|M|L|XL)\s*:\s*', '', m.group(2)).strip().rstrip('.')
            v = re.sub(r'(\d)\s*x\s*(\d)', r'\1 × \2', v); v = re.sub(r'(\d)\s*x\s*(\d)', r'\1 × \2', v)
            if 'cm' not in v and re.search(r'\d', v): v += ' cm'
            lab = 'Dimensions' if '(' not in m.group(1) else 'Dimensions ' + re.search(r'\(([^)]*)\)', m.group(1)).group(0)
            return f'Measurement | Size\n{lab} | {v}'
    for l in ls:
        m = re.search(r'(?i)(?:^|:\s*|size\s*)(?:(XS|S|M|L|XL)\s*:\s*)?((?:ø|Ø)?\s*\d+[.,]?\d*\s*[x×]\s*\d+[.,]?\d*(?:\s*[x×]\s*\d+[.,]?\d*)?)\s*(cms?)?', l)
        if m and not re.match(r'(?i)(cover|material|fabric)', l):
            v = re.sub(r'\s*[x×]\s*', ' × ', m.group(2).strip()) + ' cm'
            return f'Measurement | Size\nDimensions | {v}'
        m = re.search(r'(?i)one size\s*(\d+\s*cm)', l)
        if m: return f'Measurement | Size\nLength | {m.group(1)}'
    for l in ls:
        m = re.search(r'(?i)width\s*([\d.,]+\s*cm)[^.]*?length[^.]*?(\d+\s*[–-]\s*\d+\s*cm)', l)
        if m: return f'Measurement | Size\nWidth | {m.group(1)}\nLength | {m.group(2).replace("-", "–")}'
    return None

def colour_of(p, ls):
    t = p['title'].lower()
    tc = next((x for x in COLOURS if re.search(rf'\b{x}\b', t)), None)
    if tc: return tc.title()
    c = next((re.sub(r'(?i)^colou?r\s*:\s*', '', l).rstrip('.') for l in ls if re.match(r'(?i)^colou?r\s*:\s*\S', l)), None)
    if not c:
        sec = sections(ls); c = next(iter(sec.get('colour', []) + sec.get('color', [])), None)
        c = c.rstrip('.') if c and len(c) < 30 else None
    if not c:
        t = p['title'].lower()
        c = next((x for x in COLOURS if re.search(rf'\b{x}\b', t)), None)
    return c.strip().title() if c else None

def base_of(p, colour):
    t = re.sub(r'(?i)\b(organic|and washable|size s,? m and l|- .*)$', '', p['title']).strip(' -,')
    if colour:
        for w in [colour] + colour.split():
            t = re.sub(rf'(?i)\b{re.escape(w)}\b', '', t)
    t = re.sub(r'(?i)\b(check(ed|ered)?|chequered)\b', 'Check', t)
    return re.sub(r'\s+', ' ', t).strip(' -,')

def items():
    out = []
    for p in P:
        if SKIP.search(p['handle']) or not any(v['available'] for v in p['variants']): continue
        ls = lines_of(p['body_html'])
        col = colour_of(p, ls)
        out.append({'p': p, 'handle': 'tadazhi-' + p['handle'], 'ls': ls, 'colour': col, 'base': base_of(p, col)})
    fam = {}
    for it in out: fam.setdefault(it['base'].lower(), []).append(it['handle'])
    for it in out: it['family'] = fam[it['base'].lower()]
    return out

def tags_for(p):
    t = (p['title'] + ' ' + p['product_type']).lower(); tg = set()
    if re.search(r'leash|lead', t): tg |= {'walking', 'leads'}
    if 'collar' in t: tg |= {'walking', 'collars'}
    if 'harness' in t: tg |= {'walking', 'harnesses'}
    if re.search(r'treat bag', t): tg |= {'walking', 'treat-pouches'}
    if re.search(r'waste bag|poo', t): tg |= {'walking', 'poop-bag-holders'}
    if re.search(r'\bbed\b|cushion|tobine|poespas|donut', t): tg.add('beds')
    if re.search(r'duvet|blanket', t): tg |= {'beds', 'blankets-and-cushions'}
    if 'cover' in t: tg |= {'beds', 'covers'}
    if 'bowl' in t: tg |= {'dining', 'bowls'}
    if 'toy' in t: tg.add('play')
    if re.search(r'jacket|coat|raincoat|sweater|jumper', t): tg |= {'coats', 'standard-fit'}
    if re.search(r'rio|carrier|dog bag|tote|cross body', t): tg |= {'travel', 'carriers'}
    if re.search(r'basket|storage', t): tg |= {'gifts', 'home'}
    return sorted(tg or {'gifts'})

def ptype(p):
    t = p['title'].lower()
    for k, v in [('harness', 'Dog harness'), ('collar', 'Dog collar'), ('leash', 'Dog leash'), ('treat bag', 'Treat bag'), ('waste bag', 'Poop bag holder'),
                 ('cover', 'Bed cover'), ('duvet', 'Dog blanket'), ('blanket', 'Dog blanket'), ('donut', 'Dog bed'), ('tobine', 'Dog bed'), ('poespas', 'Dog bed'),
                 ('bed', 'Dog bed'), ('bowl', 'Dog bowl'), ('toy', 'Dog toy'), ('raincoat', 'Dog coat'), ('jacket', 'Dog coat'), ('sweater', 'Dog jumper'),
                 ('rio', 'Dog bag'), ('tote', 'Tote bag'), ('basket', 'Storage basket'), ('cross body', 'Accessories')]:
        if k in t: return v
    return 'Accessories'

def process_photos(it):
    d = f'{D}/processed/{it["handle"]}'; os.makedirs(d, exist_ok=True)
    mf = f'{d}/m.json'
    if os.path.exists(mf): return json.load(open(mf))
    rec = []
    for i, im in enumerate(it['p']['images']):
        img = photos.fetch(im['src'])
        if img is None: continue
        name = im['src'].split('/')[-1].split('?')[0]
        kind = 'studio' if photos.is_studio(img, name) else ('detail' if photos.plain_share(img) >= .12 else 'life')
        out = photos.crop_square(img) if kind != 'life' else photos.lifestyle(img)
        fn = f'{d}/{i:02d}-{kind}.jpg'; out.save(fn, quality=88, optimize=True, progressive=True)
        rec.append({'file': fn, 'kind': kind, 'src': name})
    if rec and not any(m['kind'] != 'life' for m in rec):   # every product needs at least one gallery photo
        img = photos.fetch(it['p']['images'][0]['src']); photos.crop_square(img).save(rec[0]['file'], quality=88); rec[0]['kind'] = 'studio'
    json.dump(rec, open(mf, 'w'), indent=1)
    return rec

def swatch_image(path):
    im = Image.open(path).convert('RGB').resize((120, 120))
    px = [p for p in im.getdata() if not (min(p) > 205 and max(p) - min(p) < 18)]
    if not px: return None
    from collections import Counter
    q = Counter((r // 24 * 24 + 12, g // 24 * 24 + 12, b // 24 * 24 + 12) for r, g, b in px).most_common(1)[0][0]
    out = f'{D}/sw_{abs(hash(path)) % 10**8}.png'
    Image.new('RGB', (80, 80), q).save(out)
    return out

def create(it):
    h = it['handle']
    if h in ST['products']: return
    p, ls = it['p'], it['ls']
    man = process_photos(it)
    gal = [m for m in man if m['kind'] in ('studio', 'detail')]
    life = [m for m in man if m['kind'] == 'life']
    title = f"{it['base']}, {it['colour']}" if it['colour'] else p['title']
    files = [{'originalSource': upload.staged(m['file']), 'contentType': 'IMAGE', 'alt': title} for m in gal]
    life_ids = [x for x in (upload.file_from(m['file'], 'IMAGE', title) for m in life) if x]
    sec = sections(ls)
    desc = summary(ls) or summary(sec.get('intro', []))
    mat, care = mat_care(ls, sec)
    si, names, chart = size_info(p, ls)
    if si is None: chart = one_size_table(ls)
    j = ' '.join(ls)
    if re.search(r'(?i)collar.*leash set|leash set', p['title']) and 'Adjustable length' in j:
        cw = re.findall(r'Width:\s*([\d.,]+\s*cm)', j); al = re.findall(r'Adjustable length:\s*([\d.,]+\s*[–-]\s*[\d.,]+\s*cm)', j); kg = re.search(r'up to (\d+)\s*kg', j)
        if len(cw) > 1 and len(al) > 1:
            chart = f'Measurement | Collar | Leash\nWidth | {cw[0]} | {cw[1]}\nLength | {al[0]} | {al[1]}' + (f'\nSuitable for | dogs up to {kg.group(1)} kg | dogs up to {kg.group(1)} kg' if kg else '')
    if not mat:
        if re.search(r'(?i)leather', j): mat = ['Leather' + (', handmade in Spain' if 'Spain' in j else '')]
        elif re.search(r'(?i)organic cotton canvas', j): mat = ['Organic cotton canvas']
        elif re.search(r'(?i)organic cotton', j): mat = ['Organic cotton']
        elif re.search(r'(?i)\bcotton\b', j): mat = ['Cotton']
    mf = [{'namespace': 'custom', 'key': 'source_handle', 'type': 'single_line_text_field', 'value': p['handle']},
          {'namespace': 'custom', 'key': 'product_upload_source_url', 'type': 'url', 'value': f"https://tadazhi.com/products/{p['handle']}"}]
    mc = (['Materials'] + mat if mat else []) + (['Care'] + care if care else [])
    if mc: mf.append({'namespace': 'custom', 'key': 'materials_care', 'type': 'multi_line_text_field', 'value': '\n'.join(mc)})
    if chart: mf.append({'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': chart})
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
        d['optionValues'] = [{'optionName': 'Size', 'name': names[v[f'option{si + 1}']]}] if si is not None else [{'optionName': 'Title', 'name': 'Default Title'}]
        return d
    vs = p['variants']
    if si is not None:
        seen, keep = set(), []
        for v in vs:                       # two values mapping to one letter: keep the first
            n = names[v[f'option{si + 1}']]
            if n not in seen: seen.add(n); keep.append(v)
        RANK = ORDER + ['3XL']
        vs = sorted(keep, key=lambda v: RANK.index(names[v[f'option{si + 1}']]) if names[v[f'option{si + 1}']] in RANK else 99)
        opts = [{'name': 'Size', 'values': [{'name': names[v[f'option{si + 1}']]} for v in vs]}]
    else:
        vs = vs[:1]; opts = [{'name': 'Title', 'values': [{'name': 'Default Title'}]}]
    inp = {'title': title, 'handle': h, 'descriptionHtml': f'<p>{H.escape(desc)}</p>' if desc else '', 'vendor': 'Tadazhi', 'productType': ptype(p),
           'tags': tags_for(p), 'status': 'DRAFT', 'productOptions': opts, 'variants': [var(v) for v in vs], 'files': files, 'metafields': mf}
    d = G('mutation($i:ProductSetInput!){productSet(input:$i,synchronous:true){product{id} userErrors{field message}}}', {'i': inp})['productSet']
    if d['userErrors']: print('ERR', h, d['userErrors'][:3], flush=True); return
    pid = d['product']['id']
    G('mutation($id:ID!,$p:[PublicationInput!]!){publishablePublish(id:$id,input:$p){userErrors{message}}}', {'id': pid, 'p': [{'publicationId': PUB}]})
    ST['products'][h] = pid; save()
    print('created', h, len(files), 'photos', len(life_ids), 'lifestyle', 'chart' if chart else '-', flush=True)

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
        print(len(its), 'products;', sum(1 for i in its if len(i['family']) > 1), 'in colour families')
        for it in its:
            si, names, chart = size_info(it['p'], it['ls'])
            if si is None: chart = one_size_table(it['ls'])
            sec = sections(it['ls']); mat, care = mat_care(it['ls'], sec)
            print('##', it['handle'], '|', it['base'], '|', it['colour'], '| fam', len(it['family']), '| £' + gbp(it['p']['variants'][0]['price']))
            print('   D:', summary(it['ls']))
            print('   S:', (chart or 'NONE').replace('\n', ' / '))
            print('   M:', mat, 'C:', care[:2])
        sys.exit()
    sel = set(sys.argv[1:])
    todo = [i for i in its if not sel or i['handle'] in sel]
    for it in todo:
        try: create(it)
        except Exception as e: print('FAILED', it['handle'], str(e)[:200], flush=True)
    link(its)
    print('done', len([i for i in its if i['handle'] in ST['products']]), 'of', len(its))
