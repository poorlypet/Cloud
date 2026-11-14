p = '/home/user/Cloud/luxury/theme/sections/main-product.liquid'; s = open(p).read()
a = s.find("{%- if product.metafields.custom.details.value != blank -%}")
b = s.find('<dialog class="zlb"')
seg = s[a:b]
r0 = seg.find('<div class="zsec"><section class="rv tpw soft"')
r1 = seg.find('{%- assign vh = product.vendor | handleize -%}')
reviews = seg[r0:r1]
assert r0 > 0 and r1 > r0
NEW = r'''{%- liquid
  assign mf = product.metafields.custom
  assign life = mf.lifestyle.value
  assign pf = mf.film.value
  assign base = product.title | split: ',' | first | strip
  assign vh = product.vendor | handleize
  assign vcol = collections[vh]
  assign bh = 'brand-' | append: vh
  assign films = shop.metafields.custom.ah_media.value.films
  assign stills = shop.metafields.custom.ah_media.value.stills
  assign mycol = mf.colour.value | default: ''
  case product.vendor
    when 'Cloud7'
      assign tagline = 'Made in Berlin for dogs who live in their coats. Built to be worn every day and kept for years.'
    when 'Nordog'
      assign tagline = 'Calm Scandinavian design from Denmark: beds, harnesses and toys made to blend into your home.'
    when 'Tadazhi'
      assign tagline = 'Danish design in organic cotton and recycled materials. Timeless, minimal and made to last.'
    when 'Molly and Stitch'
      assign tagline = 'Leather collars, leads and harnesses, handmade in Austria with solid brass and steel.'
    when 'Pintu'
      assign tagline = 'Designed in Vienna. Vegetable-tanned leather and Mallorcan textiles, made by hand.'
    when 'BDEBRUNO'
      assign tagline = 'Handmade in Spain, with fabrics chosen collection by collection and a wardrobe of matching pieces.'
    when 'Brott Barcelona'
      assign tagline = 'Every piece made to order in their own Barcelona workshop. Bold prints, built for real walks.'
    when 'PAIKKA'
      assign tagline = 'Finnish dogwear for long, wet, dark seasons. Reflective, weatherproof and made to move.'
    else
      assign tagline = 'Made by people who care how things are made, and chosen because we would use it ourselves.'
  endcase
-%}
{%- if life != blank or pf -%}
<section class="pd-lg zin" aria-label="In real life">
  <div class="zhd"><div><span class="zkick">In real life</span><h2 class="zh2">{{ base }}</h2></div></div>
  <div class="pd-lg-g{% if pf %} has-v{% endif %}">
    {%- if pf -%}<figure class="pd-lg-v">{{ pf | video_tag: autoplay: true, loop: true, muted: true, playsinline: true, controls: false, image_size: '1600x' }}</figure>{%- endif -%}
    {%- for im in life limit: 7 -%}<figure>{{ im | image_url: width: 1200 | image_tag: loading: 'lazy', alt: product.title, sizes: '(max-width: 800px) 50vw, 25vw' }}</figure>{%- endfor -%}
  </div>
</section>
{%- endif -%}
{%- if vcol and vcol.products_count > 1 -%}
<section class="zsec zin zrl zmore"><div class="zhd"><h2 class="zh2">More from {{ product.vendor }}</h2><a class="zlink" href="{{ vcol.url }}">Shop all {{ product.vendor }}</a></div><div class="g4">{%- assign shown = 0 -%}{%- for item in vcol.products -%}{%- assign ib = item.title | split: ',' | first | strip -%}{%- if item.id != product.id and ib != base -%}{%- render 'card', product: item -%}{%- assign shown = shown | plus: 1 -%}{%- endif -%}{%- if shown >= 4 -%}{%- break -%}{%- endif -%}{%- endfor -%}</div></section>
{%- endif -%}
<section class="pd-bb zin" aria-label="{{ product.vendor }}">
  <div class="pd-bb-in">
    {%- if films[bh] -%}{%- assign bfn = bh | append: '.mp4' -%}{%- render 'ah-vid', f: bfn -%}
    {%- elsif stills[bh] -%}<img src="{{ stills[bh] }}" alt="{{ product.vendor }}" loading="lazy">
    {%- elsif life != blank -%}{%- for im in life limit: 1 -%}{{ im | image_url: width: 2000 | image_tag: loading: 'lazy', alt: product.vendor }}{%- endfor -%}
    {%- else -%}{{ product.featured_image | image_url: width: 2000 | image_tag: loading: 'lazy', alt: product.vendor }}{%- endif -%}
    <div class="pd-bb-t"><span class="zkick">The brand</span><h2>{{ product.vendor }}</h2><p>{{ tagline }}</p>{%- if vcol -%}<a href="{{ vcol.url }}" class="pd-bb-a">Shop {{ product.vendor }}</a>{%- endif -%}</div>
  </div>
</section>
{%- capture gw -%}{%- assign shown = 0 -%}{%- assign seen = '|' -%}
  {%- if vcol and mycol != '' -%}{%- for item in vcol.products -%}{%- assign ib = item.title | split: ',' | first | strip -%}{%- assign key = '|' | append: ib | append: '|' -%}{%- if item.id != product.id and ib != base and item.metafields.custom.colour.value == mycol and seen contains key == false -%}{%- render 'card', product: item -%}{%- assign seen = seen | append: ib | append: '|' -%}{%- assign shown = shown | plus: 1 -%}{%- endif -%}{%- if shown >= 4 -%}{%- break -%}{%- endif -%}{%- endfor -%}{%- endif -%}
  {%- if shown < 4 and vcol -%}{%- for item in vcol.products -%}{%- assign ib = item.title | split: ',' | first | strip -%}{%- assign key = '|' | append: ib | append: '|' -%}{%- if item.id != product.id and ib != base and item.product_type != product.product_type and seen contains key == false -%}{%- render 'card', product: item -%}{%- assign seen = seen | append: ib | append: '|' -%}{%- assign shown = shown | plus: 1 -%}{%- endif -%}{%- if shown >= 4 -%}{%- break -%}{%- endif -%}{%- endfor -%}{%- endif -%}
  {%- if shown < 4 -%}{%- assign rel = product.collections.first -%}{%- for item in rel.products -%}{%- assign ib = item.title | split: ',' | first | strip -%}{%- if item.id != product.id and ib != base and item.vendor != product.vendor -%}{%- render 'card', product: item -%}{%- assign shown = shown | plus: 1 -%}{%- endif -%}{%- if shown >= 4 -%}{%- break -%}{%- endif -%}{%- endfor -%}{%- endif -%}
{%- endcapture -%}
{%- if shown > 0 -%}<section class="zsec zin zrl pd-gw"><div class="zhd"><h2 class="zh2">Goes well with</h2></div><div class="g4">{{ gw }}</div></section>{%- endif -%}
''' + reviews + '</div>' + r'''
<style>
.pd-lg{margin-top:clamp(48px,6vw,96px)}
.pd-lg-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.pd-lg-g figure{margin:0;overflow:hidden;background:#EAEAEB;aspect-ratio:4/5}
.pd-lg-g img,.pd-lg-g video{width:100%;height:100%;object-fit:cover;display:block}
.pd-lg-g.has-v .pd-lg-v{grid-column:span 2;grid-row:span 2;aspect-ratio:auto}
@media (max-width:800px){.pd-lg-g{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.pd-lg-g.has-v .pd-lg-v{grid-column:span 2;grid-row:auto;aspect-ratio:4/5}}
.pd-bb{margin-top:clamp(48px,6vw,96px)}
.pd-bb-in{position:relative;overflow:hidden;border-radius:6px;aspect-ratio:21/9;background:#2E3322}
.pd-bb-in>img,.pd-bb-in video,.pd-bb-in .ah-vid,.pd-bb-in picture{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pd-bb-in::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(20,22,16,.62) 0%,rgba(20,22,16,.25) 55%,rgba(20,22,16,0) 100%)}
.pd-bb-t{position:absolute;left:clamp(24px,5vw,72px);bottom:clamp(24px,5vw,64px);z-index:2;max-width:460px;color:#fff}
.pd-bb-t .zkick{color:rgba(255,255,255,.8)}
.pd-bb-t h2{font:400 clamp(34px,4vw,60px)/1.02 var(--display);margin:8px 0 12px;color:#fff}
.pd-bb-t p{font-size:15px;line-height:1.6;margin:0 0 20px;color:rgba(255,255,255,.92)}
.pd-bb-a{display:inline-block;padding:13px 26px;background:#fff;color:var(--ink);font:600 11.5px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;text-decoration:none;border-radius:3px}
@media (max-width:800px){.pd-bb-in{aspect-ratio:4/5}.pd-bb-in::after{background:linear-gradient(0deg,rgba(20,22,16,.7) 0%,rgba(20,22,16,0) 70%)}}
.pd-gw{margin-top:clamp(48px,6vw,96px)}
</style>
'''
s = s[:a] + NEW + s[b:]
open(p, 'w').write(s)
print('ok', len(s))
