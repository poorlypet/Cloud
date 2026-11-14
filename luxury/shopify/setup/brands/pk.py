# PAIKKA (Finland): dog clothing, beds and walking gear. Back-length sizes become letters (one letter per size, nothing dropped);
# every size guide comes from the product's own page (converted from inches to cm).
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(D))
import gen
upload, photos = gen.setup(D)
SITE = 'https://paikka.pet/products/'
P = json.load(open(f'{D}/p1.json'))['products']
TB = json.load(open(f'{D}/tables.json')) if os.path.exists(f'{D}/tables.json') else {}
BACK = {'20': 'XXXS', '25': 'XXS', '30': 'XS', '35': 'S', '40': 'M', '45': 'L', '50': 'XL', '55': 'XXL', '60': 'XXXL', '65': '4XL', '70': '5XL', '80': '6XL', '90': '7XL'}
gen.RANK[:] = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', '6XL', '7XL']
SHOE = {str(i): x for i, x in enumerate(['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL'], 1)}

def skip(p):
    t = p['title'] + ' ' + p['product_type']
    return bool(re.search(r'(?i)human|gift', t)) or (p['product_type'] == '' and re.match(r'(?i)(sweater|t-shirt)', p['title']))

def cm(x):
    def one(n): v = float(n) * 2.54; return f'{round(v * 2) / 2:g}'
    x = x.replace('"', '').strip()
    m = re.match(r'([\d.]+)\s*-\s*([\d.]+)$', x)
    if m: return f'{one(m.group(1))}–{one(m.group(2))} cm'
    m = re.match(r'([\d.]+)$', x)
    return f'{one(m.group(1))} cm' if m else x

def size_name(p, v):
    v = v.strip()
    if v in BACK: return BACK[v]
    if 'shoe' in p['title'].lower() and v in SHOE: return SHOE[v]
    m = re.match(r'(XXS|XS|S|M|L|XL|XXL)\s*-', v)
    if m: return m.group(1)
    if re.match(r'(?i)one size', v): return None
    return v

def line_key(p):
    t = re.sub(r'\s+SS25$', '', p['title']).lower()
    for k in ['visibility raincoat lite', 'visibility raincoat', 'reflective shell jacket', 'sherpa shirt', 'furry knit sweater', 'winter jacket kuura', 'winter suit',
              'visibility winter jacket', 'quilted sherpa jacket', 'seawool shirt', 'recovery raincoat', 'raincoat 2.0', 'cool vest', 'rain suit', 'drying coat', 'dog shoes']:
        if t.startswith(k): return k
    return p['product_type'].lower() or t
BYLINE = {}
for _p in P:
    _t = (TB.get(_p['handle']) or {}).get('tabs') or []
    if _t: BYLINE.setdefault(line_key(_p), _t)
LINE_FALLBACK = {'visibility raincoat lite': 'visibility raincoat', 'reflective shell jacket': 'visibility raincoat', 'raincoat 2.0': 'visibility raincoat',
                 'recovery raincoat': 'visibility raincoat', 'rain suit': 'winter suit', 'drying coat': 'visibility raincoat', 'seawool shirt': 'sherpa shirt',
                 'quilted sherpa jacket': 'visibility winter jacket', 'winter jacket kuura': 'visibility winter jacket'}

def chart(p):
    tabs = (TB.get(p['handle']) or {}).get('tabs') or BYLINE.get(line_key(p)) or BYLINE.get(LINE_FALLBACK.get(line_key(p), ''), []) or []
    raw = next((t for t in tabs if re.search(r'(?i)size', t)), None)
    if raw:
        cells = [c.strip() for c in raw.split('\n') if c.strip()]
        hdr = []
        while cells and not re.fullmatch(r'(\d+|XXXS|XXS|XS|S|M|L|XL|XXL|XXXL|\d+\s*x\s*\d+.*)', cells[0]): hdr.append(cells.pop(0))
        n = len(hdr)
        if n >= 2 and cells:
            rows = [cells[i:i + n] for i in range(0, len(cells), n)]
            out = [' | '.join(['Size'] + [h for h in hdr[1:]])]
            for r in rows:
                if len(r) < n: continue
                s = size_name(p, r[0]) or r[0]
                out.append(' | '.join([s] + [cm(c) for c in r[1:]]))
            if len(out) > 1: return '\n'.join(out)
    # sizes written into the option itself
    vals = next((o['values'] for o in p['options'] if o['name'] == 'Size'), [])
    t = p['title'].lower()
    if 'glow' in t and 'collar' in t:
        return 'Size | Width | Neck\n' + '\n'.join(f"{l} | {v.split('x')[0].replace(',', '.')} cm | {v.split('x')[1].replace('cm', '').strip()} cm" for l, v in zip(['S', 'M', 'L', 'XL'], vals))
    if 'leash' in t and vals and 'x' in vals[0]:
        if 'lignify' in t: return 'Size | Length | Width\n' + '\n'.join(f"{v.split(' - ')[0]} | {v.split(' - ')[1].split('x')[0].strip()} cm | {v.split('x')[1].strip()}" for v in vals)
        return 'Size | Width | Length\n' + '\n'.join(f"{l} | {v.split('x')[0].replace(',', '.')} cm | {v.split('x')[1]}" for l, v in zip(['S', 'M', 'L'], vals))
    if 'lignify' in t and 'collar' in t:
        return 'Size | Neck\n' + '\n'.join(f"{v.split(' - ')[0].strip()} | {v.split(' - ')[1].replace(' ', '').replace('cm', ' cm')}" for v in vals)
    if 'bed' in t and vals: return 'Size | Dimensions\n' + '\n'.join(f"{l} | {v.replace('x', ' × ')} cm" for l, v in zip(['M', 'L'], vals))
    if 'towel' in t and vals: return f"Measurement | Size\nDimensions | {vals[0].replace('x', ' × ').replace('cm', ' cm')}"
    return None

def bed_size(p, v):
    vals = next((o['values'] for o in p['options'] if o['name'] == 'Size'), [])
    t = p['title'].lower()
    if 'bed' in t: return ['M', 'L'][vals.index(v)]
    if 'glow' in t and 'collar' in t: return ['S', 'M', 'L', 'XL'][vals.index(v)]
    if 'leash' in t and 'lignify' not in t: return ['S', 'M', 'L'][vals.index(v)]
    if 'lignify' in t: return v.split(' - ')[0].strip()
    if 'towel' in t: return None
    return size_name(p, v)

def items():
    out = []
    for p in P:
        if skip(p) or not any(v['available'] for v in p['variants']): continue
        lines = gen.lines_of(p['body_html']); body = ' '.join(lines)
        desc = gen.summary(body) or f"{p['title']} by PAIKKA, designed in Finland."
        mat = [l.rstrip('.') for l in lines if re.search(r'(?i)%|seawool|recycled|ripstop|polyester|polyamide|wool|cotton|fleece|membrane|reflective', l) and len(l) < 120][:4] or ['Designed in Finland']
        care = [l.rstrip('.') for l in lines if re.search(r'(?i)wash|tumble|dry clean|iron', l) and len(l) < 140][:3]
        title = re.sub(r'\s+SS25$', '', p['title']).strip()
        si = next((i for i, o in enumerate(p['options']) if o['name'] == 'Size'), None)
        ch = chart(p)
        if ch and si is not None:   # sold sizes the table doesn't list: the size number is the back length
            rows = [l.split('|')[0].strip() for l in ch.split('\n')[1:]]; ncol = ch.split('\n')[0].count('|')
            inv = {v: k for k, v in BACK.items()}
            for val in p['options'][si]['values']:
                L = BACK.get(val.strip())
                if L and L not in rows and 'back' in ch.split('\n')[0].lower():
                    ch += '\n' + ' | '.join([L, f'{val.strip()} cm'] + ['–'] * (ncol - 1))
        out.append({'p': p, 'handle': 'paikka-' + re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-'), 'title': title, 'colour': None, 'base': title,
                    'variants': p['variants'], 'images': p['images'],
                    'size_of': (lambda v, si=si, p=p: bed_size(p, v[f'option{si + 1}'])) if si is not None else None, 'hw_of': None,
                    'desc': desc, 'mat': mat, 'care': care, 'chart': ch, 'tags': gen.tags_for(title + ' ' + p['product_type']),
                    'ptype': gen.ptype_for(title + ' ' + p['product_type']), 'src_url': SITE + p['handle']})
    return out

if __name__ == '__main__':
    its = items()
    if sys.argv[1:] == ['plan']:
        print(len(its), 'products'); bad = 0
        for it in its:
            sz = [it['size_of'](v) for v in it['variants']] if it['size_of'] else []
            sz = [s for s in dict.fromkeys(sz) if s]
            rows = [l.split('|')[0].strip() for l in (it['chart'] or '').split('\n')[1:]]
            miss = [s for s in sz if s not in rows]
            if miss or (sz and not it['chart']): bad += 1; print('MISS', it['handle'], sz, rows)
        print('mismatch', bad)
        for it in its[:6]: print('##', it['title'], '|', (it['chart'] or '').replace('\n', ' / ')[:200])
        sys.exit()
    sel = set(sys.argv[1:])
    for it in its:
        if sel and it['handle'] not in sel: continue
        try: gen.create(upload, photos, D, 'PAIKKA', it)
        except Exception as e: print('FAILED', it['handle'], str(e)[:200], flush=True)
    print('done', len([i for i in its if i['handle'] in upload.ST['products']]), 'of', len(its))
