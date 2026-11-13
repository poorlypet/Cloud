# Give every blank media slot in the first theme a fixed file name (idempotent).
import re,json,sys
T='/home/user/Cloud/luxury/theme/'
BL=r'<img\b[^>]*?src="data:image/svg\+xml[^"]*EDEDEB[^"]*"[^>]*>'
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def label_after(s,i):
    m=re.search(r'class="(?:n-serif|cap)">([^<]+)|<b>([^<]+)</b>',s[i:i+700])
    return slug(m.group(1) or m.group(2)) if m else 'x'
def img(f,cls='',eager=False,sizes=None):
    a=f"{{%- render 'ah-img', f: '{f}'" + (f", cls: '{cls}'" if cls else '') + (", eager: true" if eager else '') + (f", sizes: '{sizes}'" if sizes else '') + " -%}"
    return a
def vid(f,hover=False): return f"{{%- render 'ah-vid', f: '{f}'" + (", hover: true" if hover else '') + " -%}"
def apply(fn,plan):
    p=T+fn; s=open(p).read(); out=''; pos=0; k=0
    for m in re.finditer(BL,s):
        r=plan(k,s,m.end()); k+=1
        if r is None: continue
        out+=s[pos:m.start()]+r; pos=m.end()
    out+=s[pos:]; open(p,'w').write(out); print(fn,k,'blanks')
def home(k,s,e):
    if k==0: return vid('home-hero.mp4')
    if 1<=k<=6: return img(f'home-category-{label_after(s,e)}.jpg',sizes='(max-width: 640px) 50vw, 17vw')
    if k==7: return vid('home-cloud7.mp4')
    if 8<=k<=13: return img(f'home-size-{label_after(s,e)}.jpg',sizes='(max-width: 640px) 50vw, 17vw')
    if k==14: return vid('home-new-puppy.mp4')
    if k in (15,16): return img(f'home-{label_after(s,e)}.jpg',sizes='(max-width: 800px) 100vw, 50vw')
    if 17<=k<=20: return vid(f'home-happy-dog-{label_after(s,e)}.mp4',hover=True)
apply('sections/home.liquid',home)
apply('sections/main-product.liquid',lambda k,s,e: vid('product-film.mp4') if k==3 else None)
hd=[0]
def happy(k,s,e): return vid(f'happy-dogs-{k+1:02d}-{label_after(s,e)}.mp4')
apply('sections/page-happy-dogs.liquid',happy)
def track(k,s,e):
    if k==0: return img('track-order-hero.jpg',eager=True)
    if k>=3: return img(f'track-order-tile-{label_after(s,e)}.jpg',sizes='(max-width: 800px) 100vw, 33vw')
apply('sections/page-track-order.liquid',track)
# brand hero: collection image first, else brand-<handle>.jpg from Files
p=T+'sections/main-brand.liquid'; s=open(p).read()
s=re.sub(r"\{%- else -%\}"+BL+r"\{%- endif -%\}",
  "{%- else -%}{%- assign bf = 'brand-' | append: collection.handle | append: '.jpg' -%}{%- render 'ah-img', f: bf, eager: true -%}{%- endif -%}",s,count=1)
open(p,'w').write(s)
# story placeholders: drop a named photo or film inside each grey frame
p=T+'sections/page-story.liquid'; s=open(p).read()
names=iter(['story-hero.mp4']+[None]*6+['story-workshops.jpg','story-close.mp4'])
def st(m):
    n=next(names); tail=m.group(0)
    if '{%- render' in s[m.end():m.end()+10]: return tail
    if n is None:
        lab=label_after(s,m.end()); n=f'story-collect-{lab}.jpg'
    r=vid(n) if n.endswith('.mp4') else img(n,cls='sy-fill')
    return tail+r
s=re.sub(r'<div class="sy-ph[^"]*">',st,s)
if '.sy-ph > video' not in s:
    s+='\n<style>.sy-ph > video,.sy-ph > img[data-ah]{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.sy-ph > img[data-ah]:not(.ah-blank) ~ span,.sy-ph > img.ah-blank{display:none}</style>\n'
open(p,'w').write(s)
print('story done')
