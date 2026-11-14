# Size charts written into the Cloud7 page itself (beds, accessories): read them and add them where a product has none.
import json, gzip, re, os, sys, html as H
D = os.path.dirname(os.path.abspath(__file__))
os.environ['STATE'] = f'{D}/state_all.json'
sys.path.insert(0, D)
import upload

def cell(x): return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', x)).replace('\xa0', ' ')).strip()

def native(h):
    f = f'{D}/html/{h}.html.gz'
    if not os.path.exists(f): return None, []
    s = gzip.open(f).read().decode('utf-8', 'ignore')
    i = s.find('size-chart-drawer')
    if i < 0: return None, []
    seg = s[i:s.find('</dialog>', i)]
    rows = []
    for tr in re.findall(r'<tr[^>]*>(.*?)</tr>', seg, re.S):
        cs = [cell(c) for c in re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', tr, re.S)]
        if any(cs): rows.append(cs)
    notes = [cell(p) for p in re.findall(r'<p[^>]*>(.*?)</p>', seg, re.S)]
    notes = [n for n in notes if n and len(n) > 3]
    if len(rows) < 2: return None, notes
    w = max(len(r) for r in rows)
    rows = [r + [''] * (w - len(r)) for r in rows]
    return '\n'.join(' | '.join(r) for r in rows), notes

if __name__ == '__main__':
    st = json.load(open(f'{D}/state_all.json'))
    added = 0
    for h, pid in st['products'].items():
        has = upload.g('query($id:ID!){product(id:$id){a:metafield(namespace:"custom",key:"size_guide"){id} b:metafield(namespace:"custom",key:"size_note"){value}}}', {'id': pid})['product']
        table, notes = native(h)
        mf = []
        if not has['a'] and table:
            mf.append({'ownerId': pid, 'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': table})
        if notes:
            old = (has['b'] or {}).get('value', '') if has['b'] else ''
            new = '\n'.join([x for x in [old] + notes if x and x not in old])
            if new != old: mf.append({'ownerId': pid, 'namespace': 'custom', 'key': 'size_note', 'type': 'multi_line_text_field', 'value': new})
        if mf:
            e = upload.g('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}', {'m': mf})['metafieldsSet']['userErrors']
            if e: print(h, e)
            if any(m['key'] == 'size_guide' for m in mf): added += 1
    print('charts added from pages', added)
    left = 0
    for h, pid in st['products'].items():
        if len(upload.P[h]['variants']) < 2: continue
        a = upload.g('query($id:ID!){product(id:$id){metafield(namespace:"custom",key:"size_guide"){id}}}', {'id': pid})['product']['metafield']
        if not a: left += 1; print('  still none:', h)
    print('sized products still without a chart', left)
