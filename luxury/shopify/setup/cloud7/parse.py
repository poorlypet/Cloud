# Read every downloaded Cloud7 product page into one tidy record per product.
import json, gzip, re, os, html as H
D = os.path.dirname(os.path.abspath(__file__))
P = {p['handle']: p for p in json.load(open(f'{D}/products_en.json'))}

def txt(x):
    x = re.sub(r'<br\s*/?>', '\n', x)
    x = re.sub(r'<[^>]+>', ' ', x)
    x = H.unescape(x).replace('\xa0', ' ')
    return re.sub(r'[ \t]+', ' ', x).strip()

def accordion(main, title):
    i = main.find('>' + title)
    if i < 0:
        i = main.find(title)
        if i < 0: return ''
    a = main.find('accordion__content', i)
    j = main.find('</details>', i)
    if a < 0 or a > j: return ''
    return main[main.find('>', a) + 1:j]

def options(main, label):
    """the chosen value and the sibling links for a 'colour:' or 'Fit:' selector"""
    i = main.find(f'radio__legend__option-name">{label}')
    if i < 0: return None, []
    end = main.find('</fieldset>', i)
    seg = main[i:end]
    cur = re.search(r'data-option-value>([^<]+)<', seg)
    sibs = []
    for m in re.finditer(r'<div class="swatches[^"]*"\s+data-tooltip="([^"]*)"(?:\s+style="--swatch: url\(([^)]+)\);")?\s*>\s*<a class="swatch__link" data-swatch-link href="/en-gb/products/([^"]+)"', seg):
        sw = m.group(2)
        sibs.append({'name': H.unescape(m.group(1)), 'handle': m.group(3), 'swatch': ('https:' + sw if sw and sw.startswith('//') else sw)})
    own_sw = re.search(r'<span class="swatches[^"]*"\s+data-tooltip="[^"]*"\s*(?:style="--swatch: url\(([^)]+)\);")?', seg)
    return (H.unescape(cur.group(1)).strip() if cur else None), sibs, (own_sw.group(1) if own_sw and own_sw.group(1) else None)

def parse(handle):
    f = f'{D}/html/{handle}.html.gz'
    if not os.path.exists(f): return None
    h = gzip.open(f).read().decode('utf-8', 'ignore')
    secs = re.split(r'(?=<div id="shopify-section-)', h)
    main = next((s for s in secs if re.match(r'<div id="shopify-section-[^"]+__main"', s)), '')
    main = re.sub(r'<svg.*?</svg>', '', main, flags=re.S)
    out = {'handle': handle}
    # colour and fit, with links to the other colours and fits
    c = options(main, 'colour:')
    out['colour'], out['colour_sibs'] = (c[0], c[1]) if c[0] else (None, [])
    out['own_swatch'] = ('https:' + c[2] if c[0] and c[2] and c[2].startswith('//') else (c[2] if c[0] else None))
    f_ = options(main, 'Fit:')
    out['fit'], out['fit_sibs'] = (f_[0], f_[1]) if f_[0] else (None, [])
    # highlights: intro, bullet points and sizing notes
    hl = accordion(main, 'Highlights / Features')
    out['features'] = [txt(li) for li in re.findall(r'<li[^>]*>(.*?)</li>', hl, re.S) if txt(li)]
    paras = [txt(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', hl, re.S) if txt(p)]
    out['intro'] = [p for p in paras if not re.match(r'(?i)(sizing note|size information|size info|note)\b', p)]
    out['size_note'] = [re.sub(r'(?i)^(sizing note|size information|size info|note)\s*:?\s*', '', p) for p in paras if re.match(r'(?i)(sizing note|size information|size info)', p)]
    # materials and care: find the accordion whose title mentions material, read it line by line
    mc_html = ''
    for m in re.finditer(r'<summary[^>]*>(.*?)</summary>(.*?)</details>', main, re.S):
        if 'material' in txt(m.group(1)).lower():
            mc_html = m.group(2); break
    lines = [txt(x) for x in re.split(r'<br\s*/?>|</p>|</li>|\n', mc_html)]
    lines = [l for l in lines if l]
    LBL = r'(?:Materials?|Outer (?:fabric|material)|Lining|Filling|Padding|Leather|Hardware|Webbing|Cover|Inner (?:fabric|cushion)|Fabric|Insole|Coating|Membrane|Care(?: instructions?)?|Washing|Drying|Cleaning|Ironing|Storage|Note|Tip)'
    lines = [x.strip() for l in lines for x in re.split(r'(?<!outer)(?<!inner)(?<!care)\s+(?=' + LBL + r'\s*:)', l, flags=re.I) if x.strip()]
    mat, care, mode = [], [], 'mat'
    for l in lines:
        head = re.match(r'(?i)^(materials?|care( instructions?)?)\s*:\s*(.*)$', l)
        if re.match(r'(?i)^(washing|drying|cleaning|ironing|storage)\s*:', l): mode = 'care'
        if head:
            mode = 'mat' if head.group(1).lower().startswith('material') else 'care'
            rest = head.group(3).strip()
            if not rest: continue
            l = rest
        for part in re.split(r'\s+/\s+', l):
            part = part.strip()
            if part: (mat if mode == 'mat' else care).append(part)
    out['materials'], out['care'] = mat, care
    # product films (desktop and phone)
    vids = []
    for s in secs:
        sid = re.match(r'<div id="shopify-section-([^"]+)"', s)
        if not sid or 'video' not in sid.group(1): continue
        for vm in re.finditer(r'<video-background class="(desktop|mobile)".*?poster="([^"]+)".*?<source src="([^"]+\.mp4)[^"]*"', s, re.S):
            vids.append({'kind': vm.group(1), 'poster': 'https:' + H.unescape(vm.group(2)).split('&width')[0], 'src': 'https:' + vm.group(3)})
    out['films'] = vids
    return out

if __name__ == '__main__':
    R = {}
    for hd in P:
        r = parse(hd)
        if r: R[hd] = r
    json.dump(R, open(f'{D}/parsed.json', 'w'), indent=1)
    print(len(R), 'parsed')
