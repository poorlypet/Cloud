"""Builds the Shopify theme (luxury/theme) from the signed-off pages."""
import os, re, json, shutil, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Cloud/62aaa6c4-b051-5a25-88a3-78a45df60f03/scratchpad')
import catalog as C
L='/home/user/Cloud/luxury'; T=L+'/theme'
for d in ['layout','templates','templates/customers','sections','snippets','assets','config','locales']:
    os.makedirs(f'{T}/{d}',exist_ok=True)
def W(p,s): open(f'{T}/{p}','w').write(s)
def R(p): return open(f'{L}/{p}').read()
BLANK="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23EDEDEB'/%3E%3C/svg%3E"

# ---------------- assets ----------------
BASE_CSS=['r3','r4','r5','r7','r12','r13','r16','r22','r23','r26','r27','r28','r31','r39','r49']
ALL_CSS=['r3','r4','r5','r7','r12','r13','r16','r22','r23','r26','r27','r28','r31','r32','r33','r35','r36','r37','r38','r39','r40','r48','r41','r42','r43','r34','r49']
BASE_JS=['r5','r26','r28','r30','r13']
ALL_JS=['r5','r26','r28','r30','r32','r35','r37','r40','r13','r41','r42','r47','r46','r44','r48']
for c in ALL_CSS:
    s=R(f'css/{c}.css')
    s=re.sub(r'url\((["\']?)\.\./(media|img)/([^)"\']+)\1\)',lambda m:f'url("{BLANK}")',s)
    W(f'assets/{c}.css',s)
for j in ALL_JS: W(f'assets/{j}.js',R(f'js/{j}.js'))
for f in os.listdir(L+'/media/pay'): shutil.copy(f'{L}/media/pay/{f}',f'{T}/assets/{f}')

# ---------------- links and media ----------------
PAGEH={'help':'help','delivery':'delivery','returns':'returns','faqs':'faqs','story':'our-story','reviews':'reviews','contact':'contact'}
def url_for(h):
    h=h.split('#')[0]; base=os.path.basename(h); name=base[:-5] if base.endswith('.html') else base
    if base in C.FILE2H: return f'{{{{ routes.collections_url }}}}/{C.FILE2H[base]}'
    if name=='homepage': return '{{ routes.root_url }}'
    if name=='collection': return '{{ routes.collections_url }}/coats'
    if name=='product': return '{{ routes.collections_url }}/all'
    if name=='basket': return '{{ routes.cart_url }}'
    if name in ('search','search-none'): return '{{ routes.search_url }}'
    if name in PAGEH: return f'/pages/{PAGEH[name]}'
    if name.startswith('track'): return '/pages/track-order'
    if name.startswith('acs'): return '{{ routes.account_url }}'
    if name.startswith('brands'): return '/pages/brands'
    if name.startswith('happy'): return '/pages/happy-dogs'
    m={'privacy':'privacy-policy','terms':'terms-and-conditions','cookies':'cookie-policy','accessibility':'accessibility'}
    if name in m: return f'/pages/{m[name]}'
    return None
def conv(h):
    def fix(mo):
        u=mo.group(2)
        if u.startswith(('#','http','mailto:','tel:','{{')): return mo.group(0)
        if u.endswith('.html') or '.html#' in u:
            n=url_for(u); frag=('#'+u.split('#')[1]) if '#' in u else ''
            return f'{mo.group(1)}="{n+frag if n else "#"}"'
        return mo.group(0)
    h=re.sub(r'(href)="([^"]*)"',fix,h)
    # payment logos stay, everything else is a blank frame until real media is added
    h=re.sub(r'src="\.\./media/pay/([^"]+)"',lambda m:'src="{{ \''+m.group(1)+'\' | asset_url }}"',h)
    h=re.sub(r'<video\b[^>]*>.*?</video>',f'<img src="{BLANK}" alt="" class="ah-blank">',h,flags=re.S)
    h=re.sub(r'(<img\b[^>]*?\s)src="\.\./(?:img|media)/[^"]*"',lambda m:m.group(1)+f'src="{BLANK}"',h)
    h=re.sub(r'(poster|data-img)="\.\./[^"]*"',lambda m:f'{m.group(1)}="{BLANK}"',h)
    h=re.sub(r"data-images='[^']*'","",h)
    h=re.sub(r'url\((["\']?)\.\./(?:img|media)/[^)]*\)',f'url("{BLANK}")',h)
    return h
def main_of(path):
    s=R(path); return s[s.index('<main>')+6:s.index('</main>')]
def head_styles(path):
    s=R(path); h=s[:s.index('<body')]
    return ''.join(re.findall(r'<style>.*?</style>',h,flags=re.S))
def body_class(path):
    m=re.search(r'<body([^>]*)>',R(path)); a=m.group(1)
    c=re.search(r'class="([^"]*)"',a); return c.group(1) if c else ''

# replace runs of prototype product cards with live products from a collection
def block_end(s,i):
    depth=0; j=i
    for m in re.finditer(r'<div\b|</div>',s[i:]):
        depth+=1 if m.group(0)=='<div' else -1
        if depth==0: return i+m.end()
    return len(s)
def liveify(h,colls):
    out=''; pos=0; k=0
    while True:
        i=h.find('<div class="pcd"',pos)
        if i<0: out+=h[pos:]; break
        out+=h[pos:i]; n=0; j=i
        while h.startswith('<div class="pcd"',j):
            j=block_end(h,j); n+=1
        coll=colls[min(k,len(colls)-1)]; k+=1
        out+=f"{{%- for product in collections['{coll}'].products limit: {n} -%}}{{%- render 'card', product: product -%}}{{%- endfor -%}}"
        pos=j
    return out
def section(name,html,title,styles='',extra_css=(),extra_js=()):
    css=''.join(f"{{{{ '{c}.css' | asset_url | stylesheet_tag }}}}\n" for c in extra_css)
    js=''.join(f"<script src=\"{{{{ '{j}.js' | asset_url }}}}\" defer></script>\n" for j in extra_js)
    W(f'sections/{name}.liquid',css+styles+'\n'+html+'\n'+js+'\n{% schema %}\n'+json.dumps({'name':title[:25],'tag':'div','class':'ah-sec'},indent=2)+'\n{% endschema %}\n')
def tpl(name,sections,layout=None):
    d={'sections':{k:{'type':v} for k,v in sections},'order':[k for k,v in sections]}
    if layout is not None: d['layout']=layout
    W(f'templates/{name}.json',json.dumps(d,indent=2))
