# Brott Barcelona: handmade to order in Manresa. Collars keep only the collar (matching leads are separate products).
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(D))
import gen
upload, photos = gen.setup(D)
SITE = 'https://brottdog.com/en/products/'
P = json.load(open(f'{D}/p1.json'))['products']
SKIP = re.compile(r'(?i)^solid black greyhound collar$|gift card|tarjeta regalo|wall art|print\b(?! dog)|manifest|lámina|decorative|^dog manifest')

COLLAR = 'Size | Width | Neck\nXXS | 1.2 cm | 16–25 cm\nXS | 1.5 cm | 16–25 cm\nS | 2 cm | 22–34 cm\nM | 2.5 cm | 28–48 cm\nL | 4 cm | 35–56 cm\nXL | 4 cm | 46–79 cm\nXXL | 5 cm | 60–90 cm'
MART = 'Size | Width | Neck\nPiccolo | 4 cm | 20–26 cm\nWhippet | 4 cm | 25–37 cm\nGreyhound | 5 cm | 30–44 cm\nXL | 5 cm | 40–64 cm'
HARN = 'Size | Width | Chest\nXXS | 1.2 cm | 27–39 cm\nXS | 1.5 cm | 30–44 cm (estimate)\nS | 1.5 cm | 32–48 cm\nM | 2 cm | 37–60 cm\nL | 2.5 cm | 50–77 cm\nXL | 2.5 cm | 60–100 cm'
HH = 'Size | Width | Neck | Chest | Back strap\nXXS | 1.2 cm | 17–29 cm | 22–39 cm | 6.5 cm\nS | 1.5 cm | 20–35 cm | 33–61 cm | 10 cm\nM | 2 cm | 34–56 cm | 43–76 cm | 15 cm\nL | 2.5 cm | 42–73 cm | 49–85 cm | 18 cm\nXL | 2.5 cm | 52–91 cm | 56–103 cm | 23 cm'
G3 = 'Size | Width | Chest | Waist\nPiccolo | 1.5 cm | 36–65 cm | 25–41 cm\nWhippet | 2 cm | 50–84 cm | 37–59 cm\nGreyhound | 2.5 cm | 56–96 cm | 44–70 cm'
LEASH = 'Size | Width | Length\nXXS | 1.2 cm | 120 cm\nXS | 1.5 cm | 120 cm\nS | 2 cm | 120 cm\nM | 2.5 cm | 120 cm\nMulti-position | 2.5 cm | adjustable to 210 cm\nMulti-position XS | 1.5 cm | adjustable to 210 cm\nMulti-position S | 2 cm | adjustable to 210 cm'
ROLL = 'Size | Rolled | Open\nS | 15 × 40 cm | 40 × 60 cm\nM | 20 × 60 cm | 60 × 80 cm\nL | 20 × 75 cm | 75 × 110 cm'
ROUND = 'Size | Diameter | Height | Suits\nXS | Ø 50 cm | 12 cm | under 5 kg\nS | Ø 70 cm | 17 cm | 5–10 kg\nM | Ø 90 cm | 20 cm | 10–25 kg\nL | Ø 110 cm | 25 cm | over 25 kg'
SOFT = 'Size | Chest\nXS | 27–39 cm (estimate)\nS | 32–48 cm (estimate)\nM | 37–60 cm (estimate)'
COAT = 'Size | Suits\nP- | Smaller Italian Greyhound (Piccolo)\nP | Italian Greyhound (Piccolo)\nP+ | Larger Italian Greyhound (Piccolo)\nW | Whippet\nW+ | Larger Whippet\nG- | Smaller Greyhound / Galgo\nG | Greyhound / Galgo\nG+ | Larger Greyhound / Galgo'
ID = 'Size | Neck\nID S | 22–34 cm\nID M | 28–48 cm\nID L | 35–56 cm'

def line_of(t):
    t = t.lower()
    if re.search(r'3-point|three-point|greyhound harness|harness for greyhound', t): return 'Greyhound Harness', G3
    if 'soft body' in t: return 'Soft Body Harness', SOFT
    if re.search(r'\bh (dog )?harness|h harness', t): return 'H Harness', HH
    if 'harness' in t or 'arnés' in t: return 'Dog Harness', HARN
    if 'id collar' in t: return 'ID Collar', ID
    if re.search(r'martingale|greyhound collar|collar galgo', t): return 'Greyhound Martingale Collar', MART
    if 'collar' in t: return 'Dog Collar', COLLAR
    if re.search(r'leash|correa', t): return 'Dog Leash', LEASH
    if 'roll bed' in t: return 'Roll Bed', ROLL
    if re.search(r'square|rectangular', t) and 'bed' in t: return 'Square Bed', None
    if 'round bed' in t: return 'Round Bed', ROUND
    if re.search(r'coat|abrigo', t): return 'Greyhound Coat', COAT
    return None, None

def eng_title(t):
    t = t.strip()
    m = re.match(r'(?i)^(Arnés perro|Collar perro|Correa perro|Collar Galgo) Essence (.+?)\s+(gold|silver)$', t)
    if m:
        kind = {'arnés perro': 'Dog Harness', 'collar perro': 'Dog Collar', 'correa perro': 'Dog Leash', 'collar galgo': 'Greyhound Collar'}[m.group(1).lower()]
        return f'Essence {kind}', f'{m.group(2).title()}, {m.group(3).title()}'
    return t, None

def size_name(v, mixed=False):
    s = v.strip()
    if re.search(r'(?i)martingale|^MG\s*-|italian greyhound', s) and mixed:
        core = re.sub(r'(?i)martingale( collar)?( for)?|MG\s*-\s*|\(.*?\)', '', s).strip()
        core = {'Italian Greyhound': 'Piccolo', 'Galgo': 'Greyhound'}.get(core, core) or 'XL'
        return 'Martingale ' + core
    if mixed and s in ('Greyhound', 'Whippet', 'Piccolo', 'Italian Greyhound'): return 'Martingale ' + {'Italian Greyhound': 'Piccolo'}.get(s, s)
    s = re.sub(r'(?i)\s*\(without nylon[)=]?', '', s); s = re.sub(r'(?i)\s*\(.*?\)', '', s).strip()
    s = {'XW': 'XS'}.get(s, s)
    s = re.sub(r'(?i)^size\s+(greyhound|whippet|piccolo)\s+', '', s)
    s = re.sub(r'(?i)\s*martingale collar$', '', s); s = re.sub(r'(?i)^MG - ', '', s); s = re.sub(r'(?i)\s*leash$|^leash\s*', '', s)
    s = {'Galgo': 'Greyhound', 'Italian Greyhound': 'Piccolo', 'MG-XL': 'XL', 'MG -XL': 'XL', 'XL martingale': 'XL', 'P - Piccolo': 'Piccolo', 'W - Whippet': 'Whippet', 'G - Greyhound': 'Greyhound', 'XL (all kinds of dogs)': 'XL',
         'multi-position': 'Multi-position', 'multiposition': 'Multi-position', 'Multi-position': 'Multi-position', 'multiposición': 'Multi-position',
         'multiposición XS': 'Multi-position XS', 'multiposición S': 'Multi-position S', 'Multiposition': 'Multi-position'}.get(s, s)
    return s
gen.RANK[:0] = ['ID S', 'ID M', 'ID L', 'Piccolo', 'P+', 'Whippet', 'W', 'W+', 'Greyhound', 'G-', 'G', 'G+']
gen.RANK += ['Martingale Piccolo', 'Martingale Whippet', 'Martingale Greyhound', 'Martingale XL', 'Multi-position XS', 'Multi-position S', 'Multi-position']

def parse(p):
    lines = gen.lines_of(p['body_html']); text = ' '.join(lines)
    lab = {}
    for i, l in enumerate(lines[:-1]):
        if l in ('Print', 'Fabric', 'Base', 'Buckle', 'Snap hook', 'Made', 'Care', 'Outer', 'Lining', 'Closure', 'Attachment', 'Filling', 'System'): lab[l] = lines[i + 1]
    prose = [l for l in lines if len(l) > 60 and not re.search(r'(?i)responsible production|we take care|every piece is made to order|planet', l)]
    desc = gen.summary(' '.join(prose[:2])) if prose else ''
    mat = [f'{k}: {v}' for k, v in lab.items() if k in ('Fabric', 'Base', 'Buckle', 'Snap hook', 'Outer', 'Lining', 'Filling')]
    if not mat:
        if re.search(r'(?i)nylon', text): mat.append('High-strength nylon webbing with sewn fabric')
        if re.search(r'(?i)aluminium|aluminum', text): mat.append('Polished cast aluminium buckle with safety lock')
        if re.search(r'(?i)recycl|PET|botellas', text): mat.append('Recycled materials')
        if re.search(r'(?i)piel|simula la piel|vegan', text + p['title']): mat = ['Vegan leather made from recycled PET bottles', 'Matte gold or silver metal-alloy buckle']
    mat.append('Handmade to order in Barcelona')
    care = [lab['Care']] if 'Care' in lab else [s.strip().rstrip('.') for s in re.split(r'(?<=\.)\s+', text) if re.search(r'(?i)wash|lav', s)][:2]
    if p['title'].lower().startswith(('arnés', 'collar perro', 'correa perro', 'collar galgo')) and not desc:
        desc = 'Handmade to order in Barcelona from a soft vegan leather made from recycled PET bottles, with a matte gold or silver buckle.'
    return desc, list(dict.fromkeys(mat)), care

def items():
    out = []
    for p in P:
        if SKIP.search(p['title']) or not any(v['available'] for v in p['variants']): continue
        if p['product_type'] in ('Lámina decorativa', 'Tarjeta regalo'): continue
        base_t, colour = eng_title(p['title'])
        line, chart = line_of(p['title'] + ' ' + p['product_type'])
        desc, mat, care = parse(p)
        opts = [o['name'].lower() for o in p['options']]
        si = next((i for i, o in enumerate(opts) if re.search(r'size|talla', o) and 'leash' not in o and o not in ('talla',) or (o == 'talla')), None)
        li = next((i for i, o in enumerate(opts) if 'leash size' in o and i != si), None)
        ti = next((i for i, o in enumerate(opts) if 'id tag' in o), None)
        vs = p['variants']
        if li is not None:   # collar only, no leash bundle
            vs = [v for v in vs if re.search(r'(?i)only collar|collar only|solo collar', v[f'option{li + 1}'])] or vs
        if ti is not None: vs = [v for v in vs if v[f'option{ti + 1}'].lower().startswith('yes')] or vs
        if si is not None: vs = [v for v in vs if not re.search(r'(?i)only leash|training', v[f'option{si + 1}'])]
        if si is not None and any(re.search(r'(?i)leash', v[f'option{si + 1}']) for v in vs) and not re.search(r'(?i)leash|correa', p['title']): continue   # broken listing
        if re.search(r'(?i)dog coat', p['title']) and 'greyhound' not in p['title'].lower(): continue   # no published sizes
        mixed = False
        if si is not None and line in ('Dog Collar', 'Greyhound Martingale Collar'):
            raw = [v[f'option{si + 1}'] for v in vs]
            mixed = any(re.search(r'(?i)martingale|^MG|greyhound|whippet|piccolo', r) for r in raw) and any(re.fullmatch(r'\s*(XXS|XS|S|M|L|XL|XXL)\b.*', r) for r in raw)
            if mixed: chart = COLLAR + '\n' + '\n'.join('Martingale ' + l for l in MART.split('\n')[1:])
        if 'square' in p['title'].lower() or 'rectangular' in p['title'].lower():
            pg = gen.fetch_page_text(SITE + p['handle'])
            rows = re.findall(r'\b(S|M|L|XL) - Outer ([\d ×x]+cm) · Inner ([\d ×x]+cm) For ([^.]+?)(?:,| between| from)?\s*([\d]+(?: to | and |–)[\d]+ kg|over [\d]+ kg|under [\d]+ kg)?', pg)
            if rows: chart = 'Size | Outer | Inner | Suits\n' + '\n'.join(f'{a} | {b.strip()} | {c.strip()} | {(e or d).strip()}' for a, b, c, d, e in rows)
        title = f'{base_t}, {colour}' if colour else base_t
        title = re.sub(r'\s+', ' ', title).strip()
        fam = base_t if colour else title
        slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
        out.append({'p': p, 'handle': 'brott-' + slug, 'title': title, 'colour': colour, 'base': fam, 'variants': vs, 'images': p['images'],
                    'size_of': (lambda v, si=si, mixed=mixed: size_name(v[f'option{si + 1}'], mixed)) if si is not None else None, 'hw_of': None,
                    'desc': desc, 'mat': mat, 'care': care, 'chart': chart, 'tags': gen.tags_for(title + ' ' + (line or '')),
                    'ptype': gen.ptype_for((line or '') + ' ' + title), 'src_url': SITE + p['handle']})
    return out

if __name__ == '__main__':
    its = items()
    if sys.argv[1:] == ['plan']:
        print(len(its), 'products')
        bad = 0
        for it in its:
            sz = sorted({it['size_of'](v) for v in it['variants']}) if it['size_of'] else []
            rows = [l.split('|')[0].strip() for l in (it['chart'] or '').split('\n')[1:]]
            miss = [s for s in sz if s not in rows]
            if miss or (sz and not it['chart']): bad += 1; print('MISS', it['handle'], sz, rows)
        print('mismatch', bad)
        for it in its[:15]: print('##', it['title'], '| £' + gen.gbp(it['variants'][0]['price']), '|', it['desc'][:120], '|', it['mat'][:2])
        sys.exit()
    sel = set(sys.argv[1:])
    for it in its:
        if sel and it['handle'] not in sel: continue
        try: gen.create(upload, photos, D, 'Brott Barcelona', it)
        except Exception as e: print('FAILED', it['handle'], str(e)[:200], flush=True)
    gen.link(upload, its)
    print('done', len([i for i in its if i['handle'] in upload.ST['products']]), 'of', len(its))
