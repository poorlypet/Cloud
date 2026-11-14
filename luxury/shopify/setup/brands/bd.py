# BDEBRUNO (Madrid): handmade in Spain. Fabric / colour = colour family; size charts per product line from bdebruno.com.
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(D))
import gen
upload, photos = gen.setup(D)
SITE = 'https://bdebruno.com/en/products/'
P = json.load(open(f'{D}/p1.json'))['products']
SKIP = re.compile(r'(?i)gift card|tarjeta regalo|rituals')
TR = [(r'^Impermeable\b', 'Raincoat'), (r'^Porta-bolsas\b', 'Poop Bag Holder'), (r'^Manta (.*?) para Perros$', r'Blanket \1'), (r'^Manta\b', 'Blanket'),
      (r'^Funda Nuck\b', 'Nuck Cover'), (r'^Cama Nuck\b', 'Nuck Bed'), (r'^Correa\b', 'Leash'), (r'^Arnés Chest\b', 'Chest Harness'), (r'^Arnés Wrap\b', 'Wrap Harness'),
      (r'^Arnés\b', 'Harness'), (r'^Collar\b', 'Collar')]
LINES = ['Martingale Collar', 'Click Collar', 'Chest Harness', 'Simple Harness', 'Wrap Harness', 'H Harness', 'Poop Bag Holder', 'Treat Bag', 'Nuck Bed', 'Nuck Cover',
         'Basic Bed', 'Basic Cover', 'Premium Bed', 'Premium Tahoe', 'Tahoe Cover', 'Verona Cover', 'Cupcake Bed', 'Cupcake Cover', 'Roll-Bed', 'Carrier Bag',
         'Convertible Carrier', 'Car Seat', 'Duo Leash', 'Leash', 'Bandana', 'Jumper', 'Raincoat', 'Blanket']
C = {
 'raincoat': 'Size | Neck | Chest | Back length\nXS | up to 30 cm | 35–45 cm | 30 cm\nS | up to 35 cm | 46–55 cm | 35 cm\nM | up to 38 cm | 56–65 cm | 40 cm\nL | up to 42 cm | 66–75 cm | 45 cm\nXL | up to 45 cm | 76–85 cm | 50 cm\nXXL | up to 48 cm | 86–95 cm | 55 cm\n3XL | up to 52 cm | 96–100 cm | 60 cm\nMini Dachshund | up to 28 cm | 42–44 cm | 33 cm\nStandard Dachshund | up to 30 cm | 44–46 cm | 38 cm',
 'jumper': 'Size | Back length | Neck | Chest | Weight\nXS | 30–36 cm | 16–33 cm | 46 cm | 3–6 kg\nS | 36–42 cm | 18–38 cm | 52 cm | 5–6 kg\nM | 42–48 cm | 20–46 cm | 59 cm | 6–11 kg\nL | 48–55 cm | 22–51 cm | 66 cm | 11–14 kg\nXL | 55–62 cm | 28–56 cm | 73 cm | 14–19 kg\nXXL | 62–72 cm | 30–61 cm | 80 cm | 19–27 kg',
 'blanket': 'Size | Dimensions\nS | 70 × 70 cm\nL | 70 × 100 cm',
 'nuck': 'Size | Inner cushion | Overall\nS | 40 × 60 cm | 60 × 80 cm\nM | 60 × 80 cm | 80 × 100 cm',
 'verona': 'Size | Inner cushion | Overall\nS | 40 × 60 cm | 60 × 80 cm\nM | 60 × 80 cm | 80 × 100 cm',
 'basic': 'Size | Dimensions\nS | 40 × 60 × 10 cm\nM | 60 × 80 × 10 cm\nL | 80 × 100 × 10 cm\nXL | 80 × 120 × 10 cm',
 'premium': 'Size | Dimensions\nS | 40 × 60 × 10 cm\nM | 60 × 80 × 10 cm\nL | 80 × 100 × 10 cm\nXL | 80 × 120 × 10 cm',
 'tahoe': 'Size | Dimensions\nS | 40 × 60 × 10 cm\nM | 60 × 80 × 10 cm\nL | 80 × 100 × 10 cm\nXL | 80 × 120 × 10 cm',
 'cupcake': 'Size | Diameter | Height\nS | Ø 62 cm | 27 cm\nM | Ø 86 cm | 30 cm',
 'roll-bed': 'Size | Dimensions\nS | 60 × 80 cm\nM | 65 × 95 cm',
 'martingale': 'Size | Width | Neck\nXS | 2.5 cm | up to 30 cm\nS | 4 cm | 25–40 cm\nM | 5 cm | 30–45 cm\nL | 5 cm | 40–70 cm\nXL | 5 cm | 50–80 cm (estimate)',
 'click collar': 'Size | Width | Neck\nToy | 1.5 cm | 15–25 cm\nXS | 2 cm | 15–30 cm\nS | 2 cm | 22–40 cm\nM | 2.5 cm | 28–50 cm\nL | 3 cm | 33–60 cm\nXL | 4 cm | 46–80 cm',
 'simple harness': 'Size | Width | Chest\nToy | 1.5 cm | 25–39 cm\nXS | 1.5 cm | 25–39 cm\nS | 2 cm | 30–49 cm\nM | 2.5 cm | 40–59 cm\nL | 2.5 cm | 50–79 cm\nXL | 3 cm | 60–100 cm',
 'h harness': 'Size | Width | Chest\nS | 1.5 cm | up to 49 cm\nM | 2 cm | 40–70 cm\nL | 2.5 cm | 50–90 cm',
 'chest harness': 'Size | Width | Chest\nXS | 1.5 cm | 25–35 cm\nS | 1.5 cm | 35–48 cm\nM | 2 cm | 47–54 cm\nL | 2 cm | 55–77 cm',
 'wrap harness': 'Size | Chest\nToy | 30–33 cm\nXS | 34–38 cm\nS | 39–43 cm\nM | 44–49 cm',
 'leash': 'Size | Width | Length\nToy | 1.5 cm | 1.2 m\nS | 1.5 cm | 1.2 m\nM | 2.5 cm | 1.2 m\nL | 3 cm | 0.6 m\nMulti-position | 2.5 cm | 2 m',
 'bandana': 'Size | Neck\nS | up to 30 cm\nM | up to 65 cm\nL | up to 90 cm',
 'carrier bag': 'Measurement | Size\nDimensions | 45 × 20 × 30 cm',
 'car seat': 'Measurement | Size\nLength | 46 cm\nWidth | 42 cm',
}
def chart_for(line):
    l = line.lower()
    if 'duo leash' in l: return None
    for k, v in C.items():
        if k in l: return v
    return None

def size_name(v):
    s = re.sub(r'\(.*?\)', '', v).strip()
    if s.lower() == 'sizes': return 'S'
    s = re.sub(r'(?i)^(size|talla)\s*', '', s).strip(); s = re.sub(r'(?i)\s*size$', '', s).strip()
    s = {'TOY': 'Toy', 'Multiposition': 'Multi-position', 'Multiposición': 'Multi-position', 'Multi-position': 'Multi-position', '2XL': 'XXL',
         'Teckel Mini': 'Mini Dachshund', 'Teckel Estándar': 'Standard Dachshund', 'Small': 'S', 'Big': 'L', 'One Size': '', 'M Ondulina': 'M'}.get(s, s)
    return s or None
gen.RANK[:0] = ['Toy']; gen.RANK += ['Mini Dachshund', 'Standard Dachshund', 'Multi-position']

PAGES = f'{D}/pages.json'
PG = json.load(open(PAGES)) if os.path.exists(PAGES) else {}
def page(h):
    if h not in PG:
        PG[h] = gen.fetch_page_text(SITE + h); json.dump(PG, open(PAGES, 'w'))
    return PG[h]

def eng(t, a, b):
    i = t.find(a)
    if i < 0: return ''
    j = min([x for x in (t.find(e, i + len(a)) for e in b) if x > 0] or [i + 700])
    return t[i + len(a):j].strip()

def materials(t, fabric):
    sp = eng(t, 'Materiales', ['Benefits', 'Care and Washing', 'Our Promise']) or eng(t, 'Materials', ['Benefits', 'Care and Washing', 'Our Promise'])
    out = [f'{fabric} fabric'] if fabric else []
    s = sp.lower()
    if 'borreguito' in s or 'sherpa' in s: out.append('Soft sherpa fleece lining')
    if 'acero inoxidable' in s or 'stainless' in s: out.append(('Silver-tone ' if 'platead' in s or 'silver' in s else '') + 'stainless steel hardware')
    if 'latón' in s or 'brass' in s: out.append('Brass hardware')
    if 'algodón' in s or 'cotton' in s: out.append('Cotton')
    if 'lino' in s or 'linen' in s: out.append('Linen')
    if 'piel' in s or 'cuero' in s or 'leather' in s: out.append('Leather details')
    if 'impermeable' in s or 'waterproof' in s: out.append('Waterproof outer')
    out.append('Handmade in Spain')
    return list(dict.fromkeys(out))

def items():
    out = []
    for p in P:
        if SKIP.search(p['title']) or not any(v['available'] for v in p['variants']): continue
        title = p['title'].strip()
        for rx, rep in TR: title = re.sub(rx, rep, title)
        if re.search(r'(?i)\bblanket\b', title) and not title.startswith('Blanket'): title = 'Blanket ' + re.sub(r'(?i)\s*dog blanket|\s*blanket', '', title).strip()
        line = next((L for L in LINES if title.startswith(L)), ' '.join(title.split()[:2]))
        fabric = title[len(line):].strip() if title.startswith(line) else ''
        t = page(p['handle'])
        ben = [s.strip().rstrip('.') for s in re.split(r'(?<=\.)\s+', eng(t, 'Benefits', ['Care and Washing', 'Our Promise', 'Our team'])) if len(s.strip()) > 12][:4]
        care = [s.strip().rstrip('.') for s in re.split(r'(?<=\.)\s+', eng(t, 'Care and Washing', ['Our Promise', 'Our team', 'Benefits'])) if len(s.strip()) > 8][:4]
        si = next((i for i, o in enumerate(p['options']) if o['name'] in ('Size', 'Talla')), None)
        for val, vs, imgs, ci in gen.split_by_option(p, ('color',)):
            colour = ' '.join(x for x in [fabric, val] if x and x.lower() not in (fabric or '').lower()) or fabric or val
            ttl = f'{line}, {colour}' if colour else line
            desc = f'{line} in {colour or "a signature BDEBRUNO fabric"}, handmade in Spain.' + (' ' + '. '.join(ben[:2]) + '.' if ben else '')
            slug = re.sub(r'[^a-z0-9]+', '-', (line + ' ' + (colour or '')).lower()).strip('-')
            out.append({'p': p, 'handle': 'bdebruno-' + slug, 'title': ttl, 'colour': colour, 'base': line, 'variants': vs, 'images': imgs,
                        'size_of': (lambda v, si=si: size_name(v[f'option{si + 1}'])) if si is not None else None, 'hw_of': None,
                        'desc': desc, 'features': ben, 'mat': materials(t, fabric), 'care': care, 'chart': chart_for(line),
                        'tags': gen.tags_for(line + ' ' + p['product_type']), 'ptype': gen.ptype_for(line + ' ' + p['product_type']), 'src_url': SITE + p['handle']})
    return out

if __name__ == '__main__':
    its = items()
    if sys.argv[1:] == ['plan']:
        print(len(its), 'products')
        for it in its:
            sz = sorted({it['size_of'](v) or '-' for v in it['variants']}) if it['size_of'] else []
            print('##', it['handle'], '|', it['title'], '| £' + gen.gbp(it['variants'][0]['price']), '| sizes', sz, '|', len(it['images']), 'img')
            print('   D:', it['desc'][:160]); print('   S:', (it['chart'] or 'NONE').replace('\n', ' / ')[:140]); print('   M:', it['mat'], 'C:', it['care'][:1])
        sys.exit()
    sel = set(sys.argv[1:])
    for it in its:
        if sel and it['handle'] not in sel: continue
        try: gen.create(upload, photos, D, 'BDEBRUNO', it)
        except Exception as e: print('FAILED', it['handle'], str(e)[:200], flush=True)
    gen.link(upload, its)
    print('done', len([i for i in its if i['handle'] in upload.ST['products']]), 'of', len(its))
