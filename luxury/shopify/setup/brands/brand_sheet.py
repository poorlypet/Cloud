# Contact sheet of a brand's gallery photos, plus images repeated on 3+ products (likely packaging or graphics).
import json, glob, sys, random
from collections import Counter
from PIL import Image
b = sys.argv[1]
allm = [(mf, m) for mf in glob.glob(f'{b}/processed/*/m.json') for m in json.load(open(mf))]
gal = [m['file'] for _, m in allm if m['kind'] in ('studio', 'detail')]
random.seed(4); pick = random.sample(gal, min(40, len(gal)))
s = Image.new('RGB', (10 * 150, 4 * 150), 'white')
for i, f in enumerate(pick): s.paste(Image.open(f).resize((146, 146)), ((i % 10) * 150, (i // 10) * 150))
s.save(f'{b}_sheet.jpg')
c = Counter(m['src'] for _, m in allm); common = [k for k, n in c.items() if n >= 3]
where = {m['src']: m['file'] for _, m in allm}
if common:
    s = Image.new('RGB', (10 * 150, ((len(common) + 9) // 10) * 150), 'white')
    for i, k in enumerate(common[:60]): s.paste(Image.open(where[k]).resize((146, 146)), ((i % 10) * 150, (i // 10) * 150))
    s.save(f'{b}_common.jpg')
json.dump(common, open(f'{b}_common.json', 'w'))
print(len(gal), 'gallery photos;', len(common), 'repeated on 3+ products')
