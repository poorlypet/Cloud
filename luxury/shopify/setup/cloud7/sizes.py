# Number sizes become letter sizes, two Cloud7 sizes per letter. The larger Cloud7 size of each pair is kept
# (that's the one to order and stock); the size chart shows the pair's combined range.
import json, os, sys, re
D = os.path.dirname(os.path.abspath(__file__))
os.environ['STATE'] = f'{D}/state_all.json'
sys.path.insert(0, D)
import upload
G = upload.g
LETTER = {1: 'XXS', 2: 'XXS', 3: 'XS', 4: 'XS', 5: 'S', 6: 'S', 7: 'M', 8: 'M', 9: 'L', 10: 'L', 11: 'XL', 12: 'XL'}
ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL']
LOG = f'{D}/sizes_log.json'
log = json.load(open(LOG)) if os.path.exists(LOG) else {}

def merge_cells(a, b):
    """'2 - 4' and '3 - 6' become '2 - 6'"""
    na = [float(x.replace(',', '.')) for x in re.findall(r'\d+(?:[.,]\d+)?', a)]
    nb = [float(x.replace(',', '.')) for x in re.findall(r'\d+(?:[.,]\d+)?', b)]
    if not na or not nb or 'x' in a.lower(): return b or a
    lo, hi = min(na + nb), max(na + nb)
    f = lambda v: str(int(v)) if v == int(v) else str(v)
    return f'{f(lo)} - {f(hi)}' if lo != hi else f(lo)

def new_chart(text):
    rows = [r.split(' | ') for r in text.split('\n') if r.strip()]
    head, body = rows[0], rows[1:]
    groups = {}
    for r in body:
        try: n = int(r[0].strip())
        except ValueError: return None
        L = LETTER.get(n)
        if not L: return None
        if L in groups:
            groups[L] = [L] + [merge_cells(x, y) for x, y in zip(groups[L][1:], r[1:])]
        else:
            groups[L] = [L] + r[1:]
    return '\n'.join(' | '.join(r) for r in [head] + [groups[k] for k in ORDER if k in groups])

def convert(h, pid):
    if h in log: return 'already'
    p = G('''query($id:ID!){product(id:$id){options{id name optionValues{id name}}
      variants(first:100){nodes{id selectedOptions{name value}}}
      metafield(namespace:"custom",key:"size_guide"){value}}}''', {'id': pid})['product']
    opt = next((o for o in p['options'] if o['name'] == 'Size'), None)
    if not opt: return 'no size option'
    names = [v['name'] for v in opt['optionValues']]
    if not all(re.fullmatch(r'\d{1,2}', n) for n in names): return 'not numbered'
    nums = sorted(int(n) for n in names)
    keep = {}
    for n in nums: keep[LETTER[n]] = max(keep.get(LETTER[n], 0), n)
    keep_nums = set(keep.values())
    drop_vars = [v['id'] for v in p['variants']['nodes'] if int(next(o['value'] for o in v['selectedOptions'] if o['name'] == 'Size')) not in keep_nums]
    if drop_vars:
        e = G('mutation($p:ID!,$v:[ID!]!){productVariantsBulkDelete(productId:$p,variantsIds:$v){userErrors{message}}}', {'p': pid, 'v': drop_vars})['productVariantsBulkDelete']['userErrors']
        if e: return f'delete error {e}'
    ren = [{'id': v['id'], 'name': LETTER[int(v['name'])]} for v in opt['optionValues'] if int(v['name']) in keep_nums]
    gone = [v['id'] for v in opt['optionValues'] if int(v['name']) not in keep_nums]
    inp = {'productId': pid, 'option': {'id': opt['id']}, 'optionValuesToUpdate': ren}
    if gone: inp['optionValuesToDelete'] = gone
    e = G('''mutation($productId:ID!,$option:OptionUpdateInput!,$optionValuesToUpdate:[OptionValueUpdateInput!],$optionValuesToDelete:[ID!]){
      productOptionUpdate(productId:$productId,option:$option,optionValuesToUpdate:$optionValuesToUpdate,optionValuesToDelete:$optionValuesToDelete){userErrors{field message}}}''', inp)['productOptionUpdate']['userErrors']
    if e: return f'rename error {e}'
    ch = (p.get('metafield') or {}).get('value')
    if ch:
        nc = new_chart(ch)
        if nc:
            G('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}',
              {'m': [{'ownerId': pid, 'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': nc}]})
    log[h] = {'kept': {k: v for k, v in keep.items()}, 'dropped': sorted(set(nums) - keep_nums)}
    json.dump(log, open(LOG, 'w'), indent=1)
    return 'ok ' + ', '.join(f'{k}={v}' for k, v in sorted(keep.items(), key=lambda kv: ORDER.index(kv[0])))

if __name__ == '__main__':
    st = json.load(open(f'{D}/state_all.json'))['products']
    hs = sys.argv[1:] or list(st)
    for h in hs:
        try: print(h, convert(h, st[h]), flush=True)
        except Exception as ex: print(h, 'FAILED', str(ex)[:160], flush=True)
