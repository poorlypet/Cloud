# One workbook, one tab per brand: product name, link, RRP, cost price (blank), Axel sale price (RRP less a discount set at the top).
import json, os, sys
S = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, S)
from gql import gql
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

BRANDS = [('Cloud7', f'{S}/c7/state_all.json'), ('Nordog', f'{S}/nd/state.json')]
OLIVE_DD, OLIVE, SOFT = '2E3322', '4F5A31', 'EEF0E6'
wb = Workbook(); wb.remove(wb.active)
for brand, sf in BRANDS:
    if not os.path.exists(sf): continue
    st = json.load(open(sf))['products']
    rows = []
    for h, pid in st.items():
        p = gql('query($id:ID!){product(id:$id){title priceRangeV2{minVariantPrice{amount} maxVariantPrice{amount}}}}', {'id': pid})['product']
        if not p: continue
        lo = float(p['priceRangeV2']['minVariantPrice']['amount']); hi = float(p['priceRangeV2']['maxVariantPrice']['amount'])
        rows.append((p['title'], f"https://admin.shopify.com/store/7jqyv0-ad/products/{pid.split('/')[-1]}", lo, hi))
    rows.sort()
    ws = wb.create_sheet(brand)
    ws['A1'] = f'{brand} pricing'; ws['A1'].font = Font(bold=True, size=14)
    ws['A2'] = 'Axel discount on RRP'; ws['A2'].font = Font(bold=True)
    ws['B2'] = 0.10; ws['B2'].number_format = '0%'; ws['B2'].fill = PatternFill('solid', fgColor=SOFT); ws['B2'].font = Font(bold=True, color=OLIVE)
    ws['C2'] = 'Change this and every Axel sale price below updates. You can also type over any single price.'
    ws['C2'].font = Font(italic=True, color='5E5F58')
    hdr = ['Product name', 'Product link', 'RRP (£)', 'Cost price (£)', 'Axel sale price (£)']
    ws.append([]); ws.append(hdr)
    for c in ws[4]:
        c.font = Font(bold=True, color='FFFFFF'); c.fill = PatternFill('solid', fgColor=OLIVE_DD); c.alignment = Alignment(vertical='center')
    for i, (name, link, lo, hi) in enumerate(rows, start=5):
        ws.cell(row=i, column=1, value=name)
        c = ws.cell(row=i, column=2, value='Open in Shopify'); c.hyperlink = link; c.font = Font(color=OLIVE, underline='single')
        r = ws.cell(row=i, column=3, value=lo); r.number_format = '£#,##0.00'
        if hi != lo: ws.cell(row=i, column=6, value=f'Sizes go up to £{hi:,.2f}').font = Font(italic=True, color='8A8A84')
        cp = ws.cell(row=i, column=4); cp.fill = PatternFill('solid', fgColor=SOFT); cp.number_format = '£#,##0.00'
        ax = ws.cell(row=i, column=5, value=f'=ROUND(C{i}*(1-$B$2),0)'); ax.number_format = '£#,##0.00'; ax.font = Font(bold=True)
    for col, w in zip('ABCDEF', (54, 18, 12, 16, 20, 24)): ws.column_dimensions[col].width = w
    ws.freeze_panes = 'A5'
    print(brand, len(rows), 'rows')
out = '/home/user/Cloud/luxury/shopify/axel-pricing.xlsx'
wb.save(out); print(out)
