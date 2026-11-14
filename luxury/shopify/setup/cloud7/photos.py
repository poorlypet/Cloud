# Product photos: studio shots get the site grey and a soft shadow, lifestyle shots are kept as they are.
import json, os, io, sys, re, time, urllib.request
from PIL import Image, ImageFilter, ImageStat
D = os.path.dirname(os.path.abspath(__file__))
OUT = f'{D}/processed'
GREY = (234, 234, 235)          # the grey behind product cards on the site
CANVAS = 2048

def fetch(u):
    u = u.split('?')[0] + '?width=2000'
    for a in range(4):
        try:
            return Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}), timeout=90).read())).convert('RGB')
        except Exception:
            time.sleep(3 * (a + 1))
    return None

def is_studio(im, name):
    """plain, light, even background round the edges = a studio shot"""
    if re.search(r'(?i)on[-_]?grey|freisteller|packshot', name): return True
    s = im.resize((200, int(200 * im.height / im.width)))
    w, h = s.size; b = max(4, int(min(w, h) * .04))
    strips = [s.crop((0, 0, w, b)), s.crop((0, h - b, w, h)), s.crop((0, 0, b, h)), s.crop((w - b, 0, w, h))]
    lum = [ImageStat.Stat(x.convert('L')) for x in strips]
    sat = [ImageStat.Stat(x.convert('HSV').split()[1]) for x in strips]
    even = sum(1 for L in lum if L.stddev[0] < 9) >= 3
    light = sum(L.mean[0] for L in lum) / 4 > 170
    pale = sum(S.mean[0] for S in sat) / 4 < 40
    return even and light and pale

def plain_share(im):
    """how much of the photo is pale studio background: close-ups have some, outdoor scenes have almost none"""
    s = im.resize((160, int(160 * im.height / im.width))).convert('HSV')
    px = list(s.getdata())
    return sum(1 for h, sat, v in px if v > 200 and sat < 22) / len(px)

_session = None
def cutout(im):
    global _session
    from rembg import remove, new_session
    if _session is None: _session = new_session('isnet-general-use')
    return remove(im, session=_session, post_process_mask=True)

def studio(im):
    cut = cutout(im)
    a = cut.split()[3]
    a = a.point(lambda v: 0 if v < 12 else v)                 # drop faint specks
    box = a.getbbox()
    if not box: return None
    cut = cut.crop(box); a = a.crop(box)
    cw, ch = cut.size
    scale = min(CANVAS * .84 / cw, CANVAS * .74 / ch)
    cut = cut.resize((max(1, int(cw * scale)), max(1, int(ch * scale))), Image.LANCZOS)
    a = cut.split()[3]
    cw, ch = cut.size
    x = (CANVAS - cw) // 2
    y = (CANVAS - ch) // 2 + int(CANVAS * .02)                     # centred, a touch low so the shadow has room
    bg = Image.new('RGB', (CANVAS, CANVAS), GREY)
    # soft shadow: a wide blurred ellipse at the base, plus a tighter contact shadow
    sh = Image.new('L', (CANVAS, CANVAS), 0)
    from PIL import ImageDraw
    d = ImageDraw.Draw(sh)
    base = y + ch
    d.ellipse((x + cw * .08, base - ch * .035, x + cw * .92, base + ch * .035), fill=70)
    sh = sh.filter(ImageFilter.GaussianBlur(CANVAS * .022))
    sh2 = Image.new('L', (CANVAS, CANVAS), 0)
    ImageDraw.Draw(sh2).ellipse((x + cw * .2, base - ch * .012, x + cw * .8, base + ch * .012), fill=80)
    sh2 = sh2.filter(ImageFilter.GaussianBlur(CANVAS * .007))
    dark = Image.new('RGB', (CANVAS, CANVAS), (120, 118, 112))
    bg.paste(dark, mask=Image.eval(Image.merge('L', [sh]), lambda v: v))
    bg.paste(dark, mask=sh2)
    bg.paste(cut, (x, y), a)
    return bg

def lifestyle(im):
    im = im.copy(); im.thumbnail((2000, 2000), Image.LANCZOS); return im

def run(handles):
    P = {p['handle']: p for p in json.load(open(f'{D}/products_en.json'))}
    for h in handles:
        mf = f'{OUT}/{h}/m.json'
        if os.path.exists(mf): continue
        os.makedirs(f'{OUT}/{h}', exist_ok=True)
        rec = []
        for i, img in enumerate(P[h]['images']):
            name = img['src'].split('/')[-1].split('?')[0]
            im = fetch(img['src'])
            if im is None: continue
            kind = 'studio' if is_studio(im, name) else ('detail' if plain_share(im) >= .12 else 'life')
            out = studio(im) if kind == 'studio' else lifestyle(im)
            if out is None: kind, out = 'life', lifestyle(im)
            fn = f'{OUT}/{h}/{i:02d}-{kind}.jpg'
            out.save(fn, quality=88, optimize=True, progressive=True)
            rec.append({'file': fn, 'kind': kind, 'src': name})
        json.dump(rec, open(mf, 'w'), indent=1)
        print(h, [r['kind'] for r in rec], flush=True)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    run(json.load(open(sys.argv[1])) if len(sys.argv) > 1 and sys.argv[1].endswith('.json') else sys.argv[1:])

def tone(im):
    """No cutting out: shift the colours so the studio background becomes the site grey, then square it up."""
    import statistics
    s = im.convert('RGB')
    w, h = s.size; b = max(4, int(min(w, h) * .03))
    px = []
    for box in ((0, 0, w, b), (0, h - b, w, h), (0, 0, b, h), (w - b, 0, w, h)):
        px += list(s.crop(box).resize((60, 6)).getdata())
    bg = [statistics.median(p[c] for p in px) for c in range(3)]
    f = [GREY[c] / max(bg[c], 1) for c in range(3)]
    lut = []
    for c in range(3): lut += [min(255, int(round(v * f[c]))) for v in range(256)]
    s = s.point(lut)
    side = max(s.size)
    sq = Image.new('RGB', (side, side), GREY)
    sq.paste(s, ((side - s.width) // 2, (side - s.height) // 2))
    if side != CANVAS: sq = sq.resize((CANVAS, CANVAS), Image.LANCZOS)
    return sq
