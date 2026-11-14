# PINTU (Vienna): dog products only. Colours become separate linked products; brass / stainless steel (or gold / silver) is the Hardware choice.
import json, os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.dirname(D))
import gen
upload, photos = gen.setup(D)
SITE = 'https://www.pintu-design.com/en/products/'
P = json.load(open(f'{D}/p1.json'))['products']
SKIP = re.compile(r'(?i)cap\b|shirt|munich|vienna|massage|gift card|pintu bag|display cone|fin de semana|^pintu dog tag')

NECK = 'Size | Neck | Width | Suits'
T = {
 'necklace': 'Size | Neck\nXXS | 21–25 cm\nXS | 26–30 cm\nS | 31–35 cm\nM | 36–40 cm\nL | 41–45 cm\nXL | 46–50 cm',
 'lumas adjustable': 'Size | Length | Width\nS | 220 cm | 1.1 cm\nL | 220 cm | 1.5 cm',
 'lumas': 'Size | Length | Width\nS | 150 cm | 1.1 cm\nL | 150 cm | 1.5 cm',
 'flynn': 'Size | Neck + chest | Strap width | Suits\nXXS | 65–74 cm | 1.5 cm | Miniature Dachshund, Maltese\nXS | 77–86 cm | 1.9 cm | Jack Russell, Miniature Schnauzer\nS | 89–98 cm | 1.9 cm | Beagle, Cocker Spaniel\nM | 101–110 cm | 2.4 cm | Border Collie, Australian Shepherd\nL | 113–125 cm | 2.4 cm | Golden Retriever, Labrador\nXL | 127–139 cm | 3.1 cm | German Shepherd, larger Labrador\nXXL | 141–153 cm | 3.1 cm | Bernese Mountain Dog, Rottweiler',
 'monte': NECK + '\nXS | 25–31 cm | 1.5 cm | Toy Poodle, Maltese, Pomeranian\nS | 30–36 cm | 1.9 cm | Dachshund, Jack Russell\nM | 35–41 cm | 2.4 cm | Beagle, Cocker Spaniel\nL | 40–46 cm | 2.4 cm | Border Collie, Australian Shepherd\nXL | 45–51 cm | 3.1 cm | Labrador, Golden Retriever\nXXL | 50–56 cm | 3.1 cm | German Shepherd, Boxer',
 'porthos': NECK + '\nXS | 21–27 cm | 1.5 cm | Chihuahua, Yorkshire Terrier\nS | 26–34 cm | 1.5 cm | Toy Poodle, Maltese, Pomeranian\nM | 33–41 cm | 1.9 cm | Dachshund, Jack Russell\nL | 40–48 cm | 2.4 cm | Border Collie, Australian Shepherd\nXL | 47–55 cm | 2.4 cm | Labrador, Golden Retriever',
 'bosque': NECK + '\nS | up to 40 cm | 2 cm | Dachshund, Jack Russell\nM | up to 50 cm | 3 cm | Border Collie, Australian Shepherd\nL | up to 60 cm | 3 cm | Labrador, Golden Retriever',
 'viento': NECK + '\nXS | 22–28 cm | 1.5 / 4 cm | Italian Greyhound (smaller build)\nS | 26–32 cm | 1.5 / 4 cm | Italian Greyhound\nM | 30–36 cm | 1.9 / 5 cm | Whippet (smaller build)\nL | 38–44 cm | 2.4 / 6 cm | Whippet, Greyhound (slender neck)',
 'cashmere': 'Size | Neck | Chest | Back length | Weight\nXXS | 18–24 cm | up to 35 cm | 28 cm | 1.5–3 kg\nXS | 22–28 cm | up to 40 cm | 34 cm | 3–6 kg\nS | 26–32 cm | up to 45 cm | 41 cm | 5–10 kg\nM | 30–36 cm | up to 50 cm | 46 cm | 10–15 kg\nL | 34–40 cm | up to 55 cm | 51 cm | 15–20 kg\nXL | 38–44 cm | up to 65 cm | 56 cm | 20–30 kg\nXXL | 42–48 cm | up to 80 cm | 64 cm | 25–35 kg',
 'collar alma': NECK + '\nXS | 20–34 cm | 1.5 cm | Toy Poodle, Maltese, Pomeranian\nS | 28–42 cm | 1.5 cm | Dachshund, Jack Russell\nM | 28–42 cm | 2.5 cm | Beagle, Cocker Spaniel\nL | 38–50 cm | 2.5 cm | Border Collie, Australian Shepherd\nXL | 41–61 cm | 2.5 cm | Labrador, Golden Retriever',
 'leash alma': 'Size | Length | Width\nS | 240 cm (adjustable) | 1.5 cm\nL | 240 cm (adjustable) | 2.5 cm',
 'dulces': 'Size | Outside | Inside\nS | 70 × 55 cm | 45 × 30 cm\nM | 85 × 70 cm | 60 × 45 cm\nL | 100 × 85 cm | 75 × 60 cm',
 'dog bowl': 'Size | Diameter | Height\nS | Ø 16 cm | 5 cm\nL | Ø 20 cm | 8 cm',
 'extension': 'Size | Length per side | Width\nS | 50 cm | 1.1 cm\nL | 50 cm | 1.5 cm',
}
SZ = {'Small': 'S', 'Large': 'L', 'Medium': 'M'}
HWN = {'Stainless Steel': 'Steel', 'Brass': 'Brass', 'Gold': 'Gold', 'Silver': 'Silver'}

PAGES = f'{D}/pages.json'
PG = json.load(open(PAGES)) if os.path.exists(PAGES) else {}
def details(h):
    if h not in PG:
        t = gen.fetch_page_text(SITE + h)
        i = t.find('Description DETAILS'); j = t.find('Approximately 2-6 business days', i)
        PG[h] = t[i + len('Description DETAILS SIZE & FIT Product care Shipping & returns'):j] if i >= 0 and j > i else ''
        json.dump(PG, open(PAGES, 'w'))
    return PG[h]

def parse(p):
    body = ' '.join(gen.lines_of(p['body_html'])); det = details(p['handle'])
    rest = det.replace(body.strip(), '') if body.strip() and body.strip() in det else det
    rest = re.sub(r'^.*?Shipping & returns\s*', '', rest) if 'Shipping & returns' in rest[:120] else rest
    sents = [s.strip() for s in re.split(r'(?<=[.!])\s+', rest) if s.strip()]
    mat = [s.rstrip('.') for s in sents if re.search(r'(?i)leather|marble|wool|cashmere|cotton|brass|steel|wood|beads|pearl|textile|fabric|handcrafted|handmade|made in|made from', s)
           and not re.search(r'(?i)wash|clean|dryer|cm\b|available in|choose|refer to|size', s)][:4]
    care = [s.rstrip('.') for s in sents if re.search(r'(?i)wash|clean|dryer|dry |conditioner|olive oil|dishwasher|bleach|iron|rain|patina', s)][:4]
    mat = [re.sub(r'^.*?returns\s+', '', m) for m in mat]; care = [re.sub(r'^.*?returns\s+', '', c) for c in care]
    return gen.summary(body or rest), mat, care

def chart_for(p):
    t = p['title'].lower()
    for k, v in T.items():
        if k in t: return v
    det = details(p['handle'])
    m = re.search(r'(\d+\s*[×x]\s*\d+(?:\s*[×x]\s*\d+)?)\s*cm', det)
    if m: return 'Measurement | Size\nDimensions | ' + re.sub(r'\s*[×x]\s*', ' × ', m.group(1)) + ' cm'
    for rx, lab in [(r'(?i)adjustable (\d+ cm)', 'Length (adjustable)'), (r'(?i)(\d+ cm) in length', 'Length'), (r'(?i)approximately (\d+ cm) in diameter', 'Diameter'),
                    (r'(?i)(\d+\s*ml)\b', 'Contents')]:
        m = re.search(rx, det)
        if m: return f'Measurement | Size\n{lab} | {m.group(1)}'
    m = re.search(r'Width - (\d+ cm) Height - (\d+ cm) Depth - ([\d,]+ cm)', det)
    if m: return f'Measurement | Size\nWidth | {m.group(1)}\nDepth | {m.group(2)}\nHeight | {m.group(3).replace(",", ".")}'
    return 'Measurement | Size\nSize | One size'

def items():
    out = []
    for p in P:
        if SKIP.search(p['title']) or not any(v['available'] for v in p['variants']): continue
        base = re.sub(r'\s*-\s*[^-]+$', '', p['title']).strip() if ' - ' in p['title'] else p['title'].strip()
        own = re.sub(r'^.*\s-\s+', '', p['title']).strip() if ' - ' in p['title'] else None
        si = next((i for i, o in enumerate(p['options']) if o['name'] == 'Size'), None)
        hi = next((i for i, o in enumerate(p['options']) if o['name'] in ('Hardware', 'Finishing')), None)
        desc, mat, care = parse(p); chart = chart_for(p)
        for val, vs, imgs, ci in gen.split_by_option(p, ('color', 'pillow', 'logo color', 'inside color')):
            colour = (val or own or '').replace('/', ' & ').strip() or None
            if own and val and own.lower() not in val.lower(): colour = f'{own} – {val.replace("/", " & ")}'
            title = f'{base}, {colour}' if colour else base
            slug = re.sub(r'[^a-z0-9]+', '-', (base + ' ' + (colour or '')).lower()).strip('-')
            out.append({'p': p, 'handle': 'pintu-' + slug, 'title': title, 'colour': colour, 'base': base, 'variants': vs, 'images': imgs,
                        'size_of': (lambda v, si=si: SZ.get(v[f'option{si + 1}'], v[f'option{si + 1}'])) if si is not None else None,
                        'hw_of': (lambda v, hi=hi: HWN.get(v[f'option{hi + 1}'], v[f'option{hi + 1}'])) if hi is not None else None,
                        'desc': desc, 'mat': mat, 'care': care, 'chart': chart, 'tags': gen.tags_for(p['title'] + ' ' + p['product_type']),
                        'ptype': gen.ptype_for(p['title']), 'src_url': SITE + p['handle']})
    return out

if __name__ == '__main__':
    its = items()
    if sys.argv[1:] == ['plan']:
        print(len(its), 'products')
        for it in its: print('##', it['handle'], '|', it['title'], '| £' + gen.gbp(it['variants'][0]['price']), '|', len(it['images']), 'img'); print('   D:', it['desc'][:150]); print('   S:', (it['chart'] or 'NONE').replace('\n', ' / ')[:160]); print('   M:', it['mat'][:3], 'C:', it['care'][:2])
        sys.exit()
    sel = set(sys.argv[1:])
    for it in its:
        if sel and it['handle'] not in sel: continue
        try: gen.create(upload, photos, D, 'Pintu', it)
        except Exception as e: print('FAILED', it['handle'], str(e)[:200], flush=True)
    gen.link(upload, its)
    print('done', len([i for i in its if i['handle'] in upload.ST['products']]), 'of', len(its))
