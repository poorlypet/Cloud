# One tab per brand. Each product: a row with its name and a link to the supplier's page, then one row per variant
# with RRP, cost price (blank) and Axel price (blank, set by hand).
import json, os, sys
S = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, S)
from gql import gql
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

BRANDS = [('Cloud7', f'{S}/c7/state_all.json'), ('Nordog', f'{S}/nd/state.json')]
INK, OLIVE, SOFT, FILL, LINE = '2E3322', '4F5A31', 'EEF0E6', 'F6F6F3', 'DADAD3'
Q = '''query($id:ID!){product(id:$id){title src:metafield(namespace:"custom",key:"product_upload_source_url"){value}
  variants(first:100){nodes{title price sku}}}}'''
wb = Workbook(); wb.remove(wb.active)
for brand, sf in BRANDS:
    st = json.load(open(sf))['products']
    prods = []
    for h, pid in st.items():
        p = gql(Q, {'id': pid})['product']
        if p: prods.append(p)
    prods.sort(key=lambda p: p['title'])
    ws = wb.create_sheet(brand)
    ws['A1'] = f'{brand} pricing'; ws['A1'].font = Font(bold=True, size=14, color=INK)
    ws['A2'] = 'RRP is the supplier\'s price today' + (' (converted from euros at 0.8356, rounded to whole pounds)' if brand == 'Nordog' else '') + '. Fill in the green columns.'
    ws['A2'].font = Font(italic=True, color='5E5F58')
    ws['A3'] = 'Euro to pound rate'; ws['B3'] = 0.8356; ws['B3'].number_format = '0.0000'
    ship = {'Cloud7': (40, 4), 'Nordog': (30, 3)}[brand]
    ws['A4'] = 'Shipping per item (€)'; ws['B4'] = ship[1]; ws['B4'].number_format = '€#,##0.00'
    ws['C4'] = f'An order costs €{ship[0]} to ship; this is each item\'s share, assuming about {ship[0] // ship[1]} items per order.'; ws['C4'].font = Font(italic=True, color='8A8A84')
    for k in ('B3', 'B4'): ws[k].fill = PatternFill('solid', fgColor=SOFT); ws[k].font = Font(bold=True, color=OLIVE)
    ws['C3'] = 'Change these and the landed cost column updates.'; ws['C3'].font = Font(italic=True, color='8A8A84')
    ws.append([])
    ws.append(['Product / variant', 'Supplier link', 'RRP (£)', 'Cost price (€ inc VAT)', 'Landed cost (£, inc shipping)', 'Axel price (£)'])
    for c in ws[6]:
        c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor=INK); c.alignment = Alignment(vertical='center')
    r = 7; thin = Border(top=Side(style='thin', color=LINE))
    for p in prods:
        a = ws.cell(row=r, column=1, value=p['title']); a.font = Font(bold=True, color=INK)
        url = (p['src'] or {}).get('value')
        if url:
            l = ws.cell(row=r, column=2, value='View on supplier site'); l.hyperlink = url; l.font = Font(color=OLIVE, underline='single')
        for col in range(1, 7):
            ws.cell(row=r, column=col).fill = PatternFill('solid', fgColor=FILL); ws.cell(row=r, column=col).border = thin
        r += 1
        for v in p['variants']['nodes']:
            name = v['title'] if v['title'] != 'Default Title' else 'One size'
            ws.cell(row=r, column=1, value='    ' + name).font = Font(color='3A3B35')
            c = ws.cell(row=r, column=3, value=float(v['price'])); c.number_format = '£#,##0.00'
            for col in (4, 6):
                x = ws.cell(row=r, column=col); x.fill = PatternFill('solid', fgColor=SOFT); x.number_format = '€#,##0.00' if col == 4 else '£#,##0.00'
            g = ws.cell(row=r, column=5, value=f'=IF(D{r}="","",ROUND((D{r}+$B$4)*$B$3,2))'); g.number_format = '£#,##0.00'
            r += 1
    for col, w in zip('ABCDEF', (56, 22, 12, 20, 26, 15)): ws.column_dimensions[col].width = w
    ws.freeze_panes = 'A7'
    print(brand, len(prods), 'products', r - 7 - len(prods), 'variants')
out = '/home/user/Cloud/luxury/shopify/axel-pricing.xlsx'
wb.save(out); print(out)
