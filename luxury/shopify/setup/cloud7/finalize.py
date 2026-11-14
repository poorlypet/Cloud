# After the batches: merge their records, link colours and fits, add late size charts, write the price sheet.
import json, os, sys, glob
D = os.path.dirname(os.path.abspath(__file__))
os.environ['STATE'] = f'{D}/state_all.json'
merged = {'products': {}, 'files': {}}
for f in sorted(glob.glob(f'{D}/state_*.json')):
    if f.endswith('state_all.json'): continue
    s = json.load(open(f))
    merged['products'].update(s.get('products', {})); merged['files'].update(s.get('files', {}))
base = json.load(open(f'{D}/state.json'))
merged['files'] = {**base.get('files', {}), **merged['files']}
json.dump(merged, open(f'{D}/state_all.json', 'w'), indent=1)
sys.path.insert(0, D)
import upload
hs = list(merged['products'])
print('products', len(hs))
if 'nolink' not in sys.argv:
    upload.link(hs); print('linked')
if 'charts' in sys.argv:
    # size charts that arrived after a product was made
    from gql import gql
    added = 0
    for h in hs:
        pid = merged['products'][h]
        has = upload.g('query($id:ID!){product(id:$id){metafield(namespace:"custom",key:"size_guide"){id}}}', {'id': pid})['product']['metafield']
        if has: continue
        ch = upload.chart_for(h)
        if ch:
            upload.g('mutation($m:[MetafieldsSetInput!]!){metafieldsSet(metafields:$m){userErrors{message}}}',
                     {'m': [{'ownerId': pid, 'namespace': 'custom', 'key': 'size_guide', 'type': 'multi_line_text_field', 'value': ch}]})
            added += 1
    print('late charts added', added)
if 'sheet' in sys.argv:
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill, Alignment
    from openpyxl.utils import get_column_letter
    wb = Workbook(); ws = wb.active; ws.title = 'Cloud7'
    ws.append(['Product name', 'Product price (£)', 'Product link', 'Cost price (£)'])
    rows = []
    for h in hs:
        p = upload.P[h]
        prices = sorted({float(v['price']) for v in p['variants']})
        price = f'{prices[0]:.2f}' if len(prices) == 1 else f'{prices[0]:.2f} to {prices[-1]:.2f}'
        pid = merged['products'][h].split('/')[-1]
        rows.append((upload.title_for(p, upload.R[h]), price, f'https://admin.shopify.com/store/7jqyv0-ad/products/{pid}'))
    for name, price, link in sorted(rows):
        ws.append([name, price, link, None])
        c = ws.cell(row=ws.max_row, column=3); c.hyperlink = link; c.font = Font(color='4F5A31', underline='single')
    for c in ws[1]:
        c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor='2E3322'); c.alignment = Alignment(vertical='center')
    for col, w in zip('ABCD', (52, 20, 62, 16)): ws.column_dimensions[col].width = w
    for r in ws.iter_rows(min_row=2, min_col=4, max_col=4):
        for c in r: c.fill = PatternFill('solid', fgColor='EEF0E6'); c.number_format = '£#,##0.00'
    ws.freeze_panes = 'A2'
    out = '/home/user/Cloud/luxury/shopify/cloud7-cost-prices.xlsx'
    wb.save(out); print('sheet', out, len(rows), 'rows')
