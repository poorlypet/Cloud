# Prepare new v2 plates: raw/<ID>.png (Canva export, 944x1680) -> assets/<ID>.jpg (1888x3360) and,
# when asked, a subject cut-out assets/<ID>-cut.png lifted from its own plate. Updates assets/meta.json.
#   python3 prep2.py N01 N02:cut N03 ...
import cv2, numpy as np, json, os, sys
from PIL import Image
A, R = 'assets', 'raw'
meta = json.load(open(f'{A}/meta.json'))
def up2(im):
    l = cv2.resize(im, None, fx=2, fy=2, interpolation=cv2.INTER_LANCZOS4)
    bl = cv2.GaussianBlur(l, (0, 0), 1.2); return cv2.addWeighted(l, 1.45, bl, -0.45, 0)
ses = None
for arg in sys.argv[1:]:
    c, want_cut = arg.split(':')[0], arg.endswith(':cut')
    src = cv2.imread(f'{R}/{c}.png')
    if src.shape[1] != 944: src = cv2.resize(src, (944, 1680), interpolation=cv2.INTER_AREA)   # normalise to 9:16
    u = up2(src); cv2.imwrite(f'{A}/{c}.jpg', u, [cv2.IMWRITE_JPEG_QUALITY, 92]); meta[c] = {'w': u.shape[1], 'h': u.shape[0]}
    if want_cut:
        if ses is None:
            from rembg import new_session, remove
            ses = new_session('isnet-general-use')
        im = Image.open(f'{A}/{c}.jpg').convert('RGB')
        m = np.array(remove(im, session=ses, only_mask=True)).astype(np.float32) / 255
        n, lab, st, _ = cv2.connectedComponentsWithStats((m > 0.5).astype(np.uint8), 8)
        if n >= 2:
            k = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); keep = cv2.morphologyEx((lab == k).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
            al = np.clip((cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 2.2) - 0.15) / 0.7, 0, 1)
            x, y, w, h = cv2.boundingRect(keep); x, y = max(0, x - 8), max(0, y - 8); w, h = min(im.width - x, w + 16), min(im.height - y, h + 16)
            Image.fromarray(np.dstack([np.array(im), (al * 255).astype(np.uint8)])[y:y + h, x:x + w]).save(f'{A}/{c}-cut.png', optimize=True)
            meta[c]['cut'] = [int(x), int(y), int(w), int(h)]
    print(c, meta[c])
json.dump(meta, open(f'{A}/meta.json', 'w'), indent=1)
open(f'{A}/cuts.js', 'w').write('window.CUTS = ' + json.dumps({k: v['cut'] for k, v in meta.items() if isinstance(v, dict) and 'cut' in v}) + ';\n')
