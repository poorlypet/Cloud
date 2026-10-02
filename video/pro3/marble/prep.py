# Prepare the Marble film plates: upscale, align the gouache twin to the photo, cut-outs, stroke masks, gobo.
import cv2, numpy as np, json, os
from PIL import Image
from rembg import new_session, remove
A = 'assets'; R = 'raw'
os.makedirs(A, exist_ok=True)
meta = {}
def up2(im):
    l = cv2.resize(im, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
    bl = cv2.GaussianBlur(l, (0, 0), 1.2); return cv2.addWeighted(l, 1.45, bl, -0.45, 0)

# --- the real photo at registration frame R (x 1236-2663 of the full image) ---
full = cv2.imread('src/marble.jpg'); Rx0, Rw, Rh = 1236, 1427, 2537
photoR = full[0:Rh, Rx0:Rx0 + Rw]
cv2.imwrite(f'{A}/photoR.jpg', photoR, [cv2.IMWRITE_JPEG_QUALITY, 93])
cut = np.array(Image.open(f'{A}/photo-cut.png'))[0:Rh, Rx0:Rx0 + Rw]
a = cut[..., 3]; ys, xs = np.nonzero(a > 8); bx0, by0, bx1, by1 = xs.min() - 6, ys.min() - 6, xs.max() + 6, ys.max() + 6
Image.fromarray(cut[by0:by1, bx0:bx1]).save(f'{A}/photoR-cut.png', optimize=True)
meta['photoR'] = {'w': Rw, 'h': Rh, 'cut': [int(bx0), int(by0), int(bx1 - bx0), int(by1 - by0)]}
os.remove(f'{A}/photo-cut.png')

# --- choose and align the gouache twin to the photo window (ECC affine) ---
pr_small = cv2.resize(photoR, (944, 1680), interpolation=cv2.INTER_AREA)
g1 = cv2.GaussianBlur(cv2.cvtColor(pr_small, cv2.COLOR_BGR2GRAY), (0, 0), 7).astype(np.float32)
best = None
for k in ['C01a', 'C01b']:
    t = cv2.imread(f'{R}/{k}.png'); g2 = cv2.GaussianBlur(cv2.cvtColor(t, cv2.COLOR_BGR2GRAY), (0, 0), 7).astype(np.float32)
    M = np.eye(2, 3, dtype=np.float32)
    try: cc, M = cv2.findTransformECC(g1[::2, ::2], g2[::2, ::2], M, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), None, 5)
    except cv2.error: cc = -1
    M[:, 2] *= 2; print(k, 'cc', round(cc, 3), np.round(M, 3).tolist())
    if best is None or cc > best[0]: best = (cc, k, M, t)
cc, k, M, t = best
twin = cv2.warpAffine(t, M, (944, 1680), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)
cv2.imwrite(f'{R}/C01.png', twin); meta['C01'] = {'take': k, 'cc': float(cc)}

# --- upscale plates ---
plates = {'C01': f'{R}/C01.png', **{c: f'{R}/{c}.png' for c in ['C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10']}}
for c, p in plates.items():
    u = up2(cv2.imread(p)); cv2.imwrite(f'{A}/{c}.jpg', u, [cv2.IMWRITE_JPEG_QUALITY, 92]); meta.setdefault(c, {}).update({'w': u.shape[1], 'h': u.shape[0]})

# --- subject cut-outs for depth (Marble / each dog lifted from its own plate) ---
ses = new_session('isnet-general-use')
for c in ['C01', 'C02', 'C05', 'C07', 'C08', 'C09', 'C10']:
    im = Image.open(f'{A}/{c}.jpg').convert('RGB')
    m = np.array(remove(im, session=ses, only_mask=True)).astype(np.float32) / 255
    core = (m > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(core, 8)
    if n < 2: continue
    kk = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); keep = (lab == kk).astype(np.uint8)
    keep = cv2.morphologyEx(keep, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    al = np.clip((cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 2.2) - 0.15) / 0.7, 0, 1)
    x, y, w, h = cv2.boundingRect(keep); x, y = max(0, x - 8), max(0, y - 8); w, h = min(im.width - x, w + 16), min(im.height - y, h + 16)
    rgba = np.dstack([np.array(im), (al * 255).astype(np.uint8)])[y:y + h, x:x + w]
    Image.fromarray(rgba).save(f'{A}/{c}-cut.png', optimize=True); meta[c]['cut'] = [int(x), int(y), int(w), int(h)]
    print(c, 'cut', x, y, w, h)

# --- brush-stroke masks from C11: three bands, paint = reveal ---
s = cv2.cvtColor(cv2.imread(f'{R}/C11.png'), cv2.COLOR_BGR2GRAY).astype(np.float32)
paint = np.clip((200 - s) / 120, 0, 1)                 # dark paint -> 1
rows = paint.mean(1); H = len(rows)
bands = []; inb = False
for yy, v in enumerate(rows):
    if v > 0.25 and not inb: inb, y0 = True, yy
    if v <= 0.25 and inb: inb = False; bands.append((y0, yy))
print('stroke bands', bands)
for i, (y0, y1) in enumerate(bands[:3]):
    pad = 40; b = paint[max(0, y0 - pad):min(H, y1 + pad)]
    b = cv2.resize(b, (1300, int(b.shape[0] * 1300 / b.shape[1])), interpolation=cv2.INTER_CUBIC)   # stretched a little wider than frame
    Image.fromarray((np.clip(b, 0, 1) * 255).astype(np.uint8), 'L').save(f'{A}/stroke{i + 1}.png'); meta[f'stroke{i + 1}'] = list(b.shape[::-1])

# --- gobo light pattern from C12 ---
g = cv2.cvtColor(cv2.imread(f'{R}/C12.png'), cv2.COLOR_BGR2GRAY).astype(np.float32)
g = np.clip((g - np.percentile(g, 8)) / (np.percentile(g, 97) - np.percentile(g, 8)), 0, 1)
cv2.imwrite(f'{A}/gobo.jpg', (g * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 88])
json.dump(meta, open(f'{A}/meta.json', 'w'), indent=1); print(json.dumps(meta))
