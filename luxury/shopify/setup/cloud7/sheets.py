# Contact sheets of every gallery photo, one row per product, for checking by eye.
import json, os, glob
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__))
st = json.load(open(f'{D}/state_all.json'))['products']
hs = sorted(st)
T, COLS, PER = 120, 8, 26
os.makedirs(f'{D}/sheets', exist_ok=True)
for n in range(0, len(hs), PER):
    chunk = hs[n:n + PER]
    sheet = Image.new('RGB', (230 + COLS * (T + 4), len(chunk) * (T + 6)), 'white')
    d = ImageDraw.Draw(sheet)
    for r, h in enumerate(chunk):
        y = r * (T + 6)
        d.text((4, y + 4), f'{n + r + 1}. {h[:34]}', fill=(0, 0, 0))
        man = json.load(open(f'{D}/processed/{h}/m.json'))
        gal = [m for m in man if m['kind'] in ('studio', 'detail')]
        for c, m in enumerate(gal[:COLS]):
            im = Image.open(m['file']); im.thumbnail((T, T))
            sheet.paste(im, (230 + c * (T + 4), y))
    sheet.save(f'{D}/sheets/s{n // PER + 1:02d}.jpg', quality=82)
print(len(glob.glob(f'{D}/sheets/*.jpg')), 'sheets')
