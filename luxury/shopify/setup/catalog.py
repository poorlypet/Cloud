# Shared catalogue data for the store setup and the theme (collections, handles, products)
import re
G='/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad/genpages.py'
_s=open(G).read()
ns={'cards_for':lambda k:[], 'mix':lambda *a,**k:[], 'CARDS':[], 'QC':[], '_re':re}
exec(_s[_s.index('CATS9=['):_s.index('def slugify')],ns)
exec(_s[_s.index('CTEXT={'):_s.index('def CTX(slug)')],ns)
exec("I_='../img/'; M_='../media/'\n"+_s[_s.index('PRODS={'):_s.index('def cards_for')],ns)
exec(_s[_s.index("C={'Dark Olive'"):_s.index('def card(i,p)')],ns)
CATS9=ns['CATS9']; CTEXT=ns['CTEXT']; PRODS=ns['PRODS']; P=ns['P']; COLOURS=ns['C']
def slugify(s): return re.sub(r'[^a-z0-9]+','-',re.sub(r'&amp;','and',s.lower()).replace('é','e')).strip('-')
def txt(s): return s.replace('&amp;','&').replace('&rsquo;','’')
# collection handles: a category's main page uses the category slug; sub-pages use their own name
TOPH={'sale':'sale','new':'new-in','beds':'beds','walking':'walking','coats':'coats','dining':'dining','care':'care','play':'play','travel':'travel','cats':'cats','gifts':'gifts'}
COLLS=[]   # (handle, title, cat_slug, is_top, file)
seen=set()
for slug,title,intro,fn,subs in CATS9:
    for k,sname in enumerate(subs):
        file=f'c-{slug}-{slugify(sname)}.html' if len(subs)>1 else f'c-{slug}.html'
        has_all=subs[0].lower().startswith(('all','new in','winter')) or len(subs)==1
        top=(k==0 and has_all)
        h=TOPH[slug] if top else slugify(sname)
        if h in seen: h=f'{slug}-{h}'
        seen.add(h)
        COLLS.append((h, title if top else txt(sname), slug, top, file))
FILE2H={c[4]:c[0] for c in COLLS}
