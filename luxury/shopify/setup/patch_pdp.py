# Product page: option A (classic gallery, sections on the right) for every product, plus
# option I's editorial story (lifestyle photos with features, film as a full-width break) when a product has them.
import re
T = '/home/user/Cloud/luxury/theme/'
p = T + 'sections/main-product.liquid'; s = open(p).read()

# 1. thumbnails under the main photo (desktop); the photo row itself stays for phones and the viewer
gg_end = s.index('</div></div></div><div class="zi gi i8">')
if 'ga-th' not in s:
    thumbs = ('{%- if product.media.size > 1 -%}<div class="ga-th" role="list" aria-label="Photos">{%- for media in product.media -%}'
              '<button type="button" class="ga-t{% if forloop.first %} on{% endif %}" data-i="{{ forloop.index0 }}" aria-label="Show photo {{ forloop.index }}">'
              '{{ media.preview_image | image_url: width: 240 | image_tag: alt: "", loading: "lazy" }}</button>{%- endfor -%}</div>{%- endif -%}')
    s = s[:gg_end] + '</div>' + thumbs + s[gg_end + len('</div>'):]
s = s.replace('<button type="button" class="gt" data-lb="{{ forloop.index0 }}" aria-label="Open photo {{ forloop.index }} of {{ product.media.size }}">',
              '<button type="button" class="gt{% if forloop.first %} on{% endif %}" data-lb="{{ forloop.index0 }}" aria-label="Open photo {{ forloop.index }} of {{ product.media.size }}">')

# 2. the information as fold-out sections on the right, not tabs
a = s.index('<div class="ztw zt-seg zrow t7">')
b = s.index('{%- if product.metafields.custom.details')
tail = '</div></div></div>'            # closes the tabs block, the info column and the top row
assert s[b - len(tail) - len('</div>'):b].endswith(tail)
old_tabs = s[a:b - len(tail)]
panels = re.findall(r'<div class="ztp" role="tabpanel"(?: hidden)?>(.*?)</div>(?=<div class="ztp"|$)', old_tabs[old_tabs.index('<div class="ztp"'):], re.S)
assert len(panels) == 4, len(panels)
desc, size, deliv, mats = panels
acc = ('<div class="t7 acc7">'
       f'<details open data-t7="0"><summary>Description</summary><div class="acb rte">{desc}</div></details>'
       f'<details data-t7="1"><summary>Size guide</summary><div class="acb">{size}</div></details>'
       f'<details data-t7="3"><summary>Materials &amp; care</summary><div class="acb">{mats}</div></details>'
       f'<details data-t7="2"><summary>Delivery &amp; returns</summary><div class="acb">{deliv}</div></details>'
       '</div>')
s = s[:a] + acc + s[b - len(tail):]
s = s.replace('<p class="zdel">Free UK delivery over £75 · Free 14-day returns</p>', '<p class="zdel">Free UK delivery over £100 · Free 14-day returns</p>')

# 3. option I: the story, only when the product has a film or lifestyle photos
old_life = re.search(r'\{%- assign life = product\.metafields\.custom\.lifestyle\.value -%\}.*?\{%- endif -%\}(?=<section class="zsec zin zrl">)', s, re.S)
story = '''{%- liquid
  assign life = product.metafields.custom.lifestyle.value
  assign pf = product.metafields.custom.film.value
  assign fts = product.metafields.custom.features.value
-%}{%- if life != blank or pf -%}<section class="zsec zin pst">
  <div class="zhd"><span class="zkick">The details</span><h2 class="zh2">{{ product.title | split: ',' | first }}</h2></div>
  {%- if life.size > 0 -%}<div class="pst-r">{{ life[0] | image_url: width: 1600 | image_tag: loading: 'lazy', alt: product.title, sizes: '(max-width: 800px) 100vw, 50vw' }}<div><h3>{{ fts[0] | default: product.title }}</h3>{%- if fts[1] -%}<p>{{ fts[1] }}</p>{%- endif -%}{%- if fts[2] -%}<p>{{ fts[2] }}</p>{%- endif -%}</div></div>{%- endif -%}
  {%- if pf -%}<div class="pst-film">{{ pf | video_tag: autoplay: true, loop: true, muted: true, playsinline: true, controls: false, image_size: '1920x' }}</div>{%- endif -%}
  {%- if life.size > 1 -%}<div class="pst-r rev">{{ life[1] | image_url: width: 1600 | image_tag: loading: 'lazy', alt: product.title, sizes: '(max-width: 800px) 100vw, 50vw' }}<div><h3>{{ fts[3] | default: fts[0] | default: product.title }}</h3>{%- if fts[4] -%}<p>{{ fts[4] }}</p>{%- endif -%}{%- if fts[5] -%}<p>{{ fts[5] }}</p>{%- endif -%}</div></div>{%- endif -%}
  {%- if life.size > 2 -%}<div class="pst-more">{%- for im in life offset: 2 limit: 4 -%}{{ im | image_url: width: 1000 | image_tag: loading: 'lazy', alt: product.title }}{%- endfor -%}</div>{%- endif -%}
</section>{%- endif -%}'''
if old_life:
    s = s[:old_life.start()] + story + s[old_life.end():]

# 4. the brand panel shows one of the product's own photos, never a stand-in film
s = re.sub(r'<div class="ph2">\{%- assign pf = product\.metafields\.custom\.film\.value -%\}.*?\{%- endif -%\}</div>',
           '<div class="ph2">{%- assign bp = product.media[1] | default: product.media[0] -%}{%- if bp -%}{{ bp.preview_image | image_url: width: 1400 | image_tag: loading: "lazy", alt: product.vendor }}{%- endif -%}</div>', s, count=1, flags=re.S)

css = '''<style>
@media (min-width:1081px){
  .p8 .gg .gt{display:none}
  .p8 .gg .gt.on{display:block}
  .p8 .gg{display:block!important}
  .p8 .gg .gt.on img{width:100%;aspect-ratio:1;object-fit:cover}
}
.ga-th{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin-top:8px}
.ga-t{padding:0;border:0;background:#EAEAEB;aspect-ratio:1;overflow:hidden;cursor:pointer;outline:1px solid transparent;outline-offset:-1px}
.ga-t img{width:100%;height:100%;object-fit:cover}
.ga-t.on{outline-color:var(--ink)}
@media (max-width:1080px){.ga-th{display:none}}
.acc7{margin-top:24px;border-top:1px solid #E4E4E0}
.acc7 details{border-bottom:1px solid #E4E4E0}
.acc7 summary{list-style:none;display:flex;justify-content:space-between;align-items:center;padding:17px 0;font:600 11.5px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
.acc7 summary::-webkit-details-marker{display:none}
.acc7 summary::after{content:"+";font:300 20px/1 var(--sans)}
.acc7 details[open] summary::after{content:"\\2013"}
.acb{padding:0 0 20px;font-size:14.5px;line-height:1.7;color:var(--ink2)}
.acb ul{padding-left:18px;margin:10px 0 0}
.acb p{margin:0 0 10px}
.acb .zsz{overflow-x:auto}
.acb table{width:100%;border-collapse:collapse;font-size:13px}
.acb th,.acb td{padding:9px 8px;border-bottom:1px solid #E4E4E0;text-align:left;white-space:nowrap}
.acb th{font:600 10.5px/1.3 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--ink2);background:#F4F4F2}
.acb tr.hit td{background:#EEF0E6;font-weight:600}
.pst .zhd{margin-bottom:8px}
.pst-r{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,80px);align-items:center;margin-top:clamp(28px,4vw,56px)}
.pst-r img{width:100%;aspect-ratio:4/3;object-fit:cover;background:#EAEAEB}
.pst-r.rev img{order:2}
.pst-r h3{font:500 clamp(26px,2.4vw,36px)/1.15 var(--display);margin:0 0 14px}
.pst-r p{font-size:15.5px;line-height:1.7;color:var(--ink2);margin:0 0 8px;max-width:52ch}
.pst-film{margin-top:clamp(28px,4vw,56px);aspect-ratio:21/9;overflow:hidden;background:#111}
.pst-film video{width:100%;height:100%;object-fit:cover;display:block}
.pst-more{display:grid;grid-template-columns:repeat(auto-fit,minmax(0,1fr));gap:12px;margin-top:clamp(28px,4vw,56px)}
.pst-more img{width:100%;aspect-ratio:4/5;object-fit:cover}
@media (max-width:800px){.pst-r{grid-template-columns:1fr}.pst-r.rev img{order:0}.pst-film{aspect-ratio:4/3}.pst-more{grid-template-columns:1fr 1fr}}
</style>
'''
if '.acc7{' not in s:
    s = s.replace('{% schema %}', css + '{% schema %}', 1)
open(p, 'w').write(s)
print('ok', 'acc7' in s, 'pst-r' in s, 'ga-th' in s, 'lfx-g' in s)
