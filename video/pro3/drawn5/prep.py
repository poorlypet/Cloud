# Prepare one dog: aligned photo, drawing, traced pen lines, cut-out poses.
import sys, json, numpy as np, cv2
from PIL import Image
from skimage.morphology import skeletonize
sys.path.insert(0, '../drawn/tools'); from cutout import trace

AL = json.load(open('align.json'))

def lines_from(img, maxw=6, minlen=34):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    bh = cv2.morphologyEx(g, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    m = (bh > 40).astype(np.uint8)
    dist = cv2.distanceTransform(m, cv2.DIST_L2, 3)
    sk = skeletonize(m > 0) & (dist <= maxw)
    return [p for p in trace(sk, dist) if p['n'] >= minlen]

def cut_white(src, out):
    im = np.array(Image.open(src).convert('RGB')); H, W = im.shape[:2]
    mn, mx = im.min(2).astype(int), im.max(2).astype(int)
    bg = ((mn > 236) & (mx - mn < 16)).astype(np.uint8)
    ff = np.where(bg > 0, 0, 255).astype(np.uint8); mask = np.zeros((H+2, W+2), np.uint8)
    for x in range(0, W, 8):
        for y in (0, H-1):
            if ff[y, x] == 0: cv2.floodFill(ff, mask, (x, y), 128)
    for y in range(0, H, 8):
        for x in (0, W-1):
            if ff[y, x] == 0: cv2.floodFill(ff, mask, (x, y), 128)
    dog = (ff != 128).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(dog, 8)
    keep = np.zeros_like(dog)
    big = st[1:, cv2.CC_STAT_AREA].max()
    for k in range(1, n):
        if st[k, cv2.CC_STAT_AREA] > big * 0.02: keep[lab == k] = 1   # keep the dog plus detached bits like a tail
    cnts, _ = cv2.findContours(keep, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    full = np.zeros_like(keep); cv2.drawContours(full, cnts, -1, 1, -1)
    alpha = cv2.GaussianBlur(full.astype(np.float32) * 255, (3, 3), 0)
    x, y, w, h = cv2.boundingRect(full); p = 10
    x0, y0, x1, y1 = max(0, x-p), max(0, y-p), min(W, x+w+p), min(H, y+h+p)
    Image.fromarray(np.dstack([im, alpha.astype(np.uint8)])[y0:y1, x0:x1]).save(out)
    return [int(x1-x0), int(y1-y0)]

def prep(d, poses):
    t = cv2.imread(f'raw/{d}-toon.png'); H, W = t.shape[:2]
    p = cv2.resize(cv2.imread(f'{d}-photo.jpg'), (W, H), interpolation=cv2.INTER_CUBIC)
    M = np.array(AL[d]['M'], np.float32)
    pa = cv2.warpAffine(p, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    cv2.imwrite(f'{d}/photo.jpg', pa, [cv2.IMWRITE_JPEG_QUALITY, 92])
    cv2.imwrite(f'{d}/toon.jpg', t, [cv2.IMWRITE_JPEG_QUALITY, 93])
    L = lines_from(t)
    meta = {'w': W, 'h': H, 'paths': [{'d': q['d'], 'w': q['w']} for q in L], 'poses': {}}
    for name in poses: meta['poses'][name] = cut_white(f'raw/{d}-{name}.png', f'{d}/{name}.png')
    open(f'{d}/assets.js', 'w').write('window.A=' + json.dumps(meta) + ';')
    print(d, W, H, 'paths', len(L), meta['poses'])

import os
for d, poses in [('lab', ['side', 'sit']), ('pointer', ['white', 'sit']), ('cockapoo', ['worried', 'sleep']), ('staffy', ['white', 'sit']), ('golden', ['side', 'sit'])]:
    os.makedirs(d, exist_ok=True); prep(d, poses)
