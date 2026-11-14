# one batch: photos then upload, product by product
import json, sys, os
os.environ['STATE'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), f'state_{sys.argv[1]}.json')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import photos, upload
hs = json.load(open(sys.argv[2]))
for h in hs:
    try:
        photos.run([h]); upload.create(h)
    except Exception as e:
        print('FAILED', h, str(e)[:200], flush=True)
print('chunk done', sys.argv[1], flush=True)
