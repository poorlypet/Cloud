# Clean plates for parallax scenes: assets/<ID>-bg.jpg is the plate with its cut-out subject painted out, so a cut that
# slides over it (parallax) never reveals a second copy of the subject underneath.   python3 mkbg.py N02 N04 N08 C07
import cv2, numpy as np, json, sys
A = 'assets'
meta = json.load(open(f'{A}/meta.json'))
for c in sys.argv[1:]:
    pl = cv2.imread(f'{A}/{c}.jpg'); H, W = pl.shape[:2]
    x, y, w, h = meta[c]['cut'] if 'cut' in meta.get(c, {}) else json.loads(open(f'{A}/cuts.js').read().split('=', 1)[1].rstrip(';\n'))[c]
    cut = cv2.imread(f'{A}/{c}-cut.png', cv2.IMREAD_UNCHANGED)
    if cut.shape[1] != w or cut.shape[0] != h: cut = cv2.resize(cut, (w, h), interpolation=cv2.INTER_AREA)
    m = np.zeros((H, W), np.uint8); m[y:y + h, x:x + w] = (cut[..., 3] > 12).astype(np.uint8) * 255
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    # fill at half resolution (smoother, faster), then lay the paper/brush texture of the surroundings back over the hole
    sm, mm = cv2.resize(pl, (W // 2, H // 2), interpolation=cv2.INTER_AREA), cv2.resize(m, (W // 2, H // 2), interpolation=cv2.INTER_NEAREST)
    f = cv2.resize(cv2.inpaint(sm, mm, 9, cv2.INPAINT_TELEA), (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    hi = pl.astype(np.float32) - cv2.GaussianBlur(pl, (0, 0), 3).astype(np.float32)
    ok = (cv2.dilate(m, np.ones((31, 31), np.uint8)) == 0).astype(np.float32)[..., None]   # texture only from outside the subject
    tex, got = np.zeros_like(hi), np.zeros_like(ok)   # first clean source per pixel (an average would flatten the grain)
    for dy, dx in [(0, 360), (0, -360), (360, 0), (-360, 0), (260, 260), (-260, -260), (260, -260), (-260, 260), (0, 720), (0, -720), (720, 0), (-720, 0)]:
        take = np.roll(ok, (dy, dx), (0, 1)) * (1 - got); tex += np.roll(hi * ok, (dy, dx), (0, 1)) * take; got += take
    tex *= .8
    k = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 3)[..., None]
    out = pl.astype(np.float32) * (1 - k) + (f + tex) * k
    cv2.imwrite(f'{A}/{c}-bg.jpg', np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92]); print(c, 'bg', int(m.sum() / 255), 'px filled')
