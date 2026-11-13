T = '/home/user/Cloud/luxury/theme/'
p = T + 'sections/main-collection.liquid'; s = open(p).read()
a = s.index('<header class="cq-head">'); b = s.index('<div class="cx-bar">')
B = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23EDEDEB'/%3E%3C/svg%3E"
new = '''{%- liquid
  assign pool = shop.metafields.custom.ah_media.value.pool
  assign ps = pool.size | default: 0
  if ps > 0
    assign i0 = collection.id | modulo: ps
    assign hv = pool[i0]
  endif
  assign stills = shop.metafields.custom.ah_media.value.stills
  if parent
    assign ph = parent.object.handle
  else
    assign ph = collection.handle
  endif
  assign cat_pics = 'menu-,home-category-,story-collect-' | split: ','
-%}
<section class="cq-hero">
  {%- if hv -%}<video autoplay muted loop playsinline preload="metadata" poster="{{ hv.p }}" data-ah="{{ cf }}-hero.mp4"><source src="{{ hv.u }}" type="video/mp4"></video>
  {%- elsif collection.image -%}{{ collection.image | image_url: width: 2400 | image_tag: loading: 'eager', alt: '' }}
  {%- else -%}<img src="''' + B + '''" alt="" class="ah-blank">{%- endif -%}
  <div class="cq-hero-tx">
    {%- if is_sub -%}<a class="cq-hk" href="{{ parent.url }}">{{ parent.title }}</a>{%- else -%}<span class="cq-hk">Shop</span>{%- endif -%}
    <h1>{{ collection.title }}</h1>
    {%- if collection.description != blank -%}<p>{{ collection.description | strip_html | truncatewords: 40 }}</p>{%- endif -%}
  </div>
</section>
{%- if parent and parent.links.size > 0 -%}
<section class="cq-subs cs" aria-label="{{ parent.title | escape }} categories">
  <div class="cs-w">
    <button type="button" class="cs-a prev" aria-label="Previous categories" hidden><svg viewBox="0 0 8 14" aria-hidden="true"><path d="M7 1L1 7l6 6"/></svg></button>
    <div class="cs-r" tabindex="0" aria-label="Categories, scroll sideways">
      {%- liquid
        assign k0 = 'home-category-' | append: ph
        assign u0 = stills[k0]
      -%}
      <a class="cs-t" href="{{ parent.url }}"{% unless is_sub %} aria-current="page"{% endunless %}>
        {%- if u0 != blank -%}<img src="{{ u0 }}&width=700" alt="" loading="lazy">{%- else -%}<img src="''' + B + '''" alt="" class="ah-blank">{%- endif -%}
        <span class="cs-l">All {{ parent.title | downcase }}</span></a>
      {%- for c in parent.links -%}
        {%- liquid
          assign sc = c.object
          assign tk = 'collection-tile-' | append: sc.handle
          assign tu = stills[tk]
          if tu == blank and sc.image
            assign tu = sc.image | image_url: width: 700
          endif
          if tu == blank
            assign pi = forloop.index | modulo: 3
            assign fk = cat_pics[pi] | append: ph
            assign tu = stills[fk]
          endif
        -%}
        <a class="cs-t" href="{{ c.url }}"{% if sc.handle == collection.handle %} aria-current="page"{% endif %} data-ah="{{ tk }}.jpg">
          {%- if tu != blank -%}<img src="{{ tu }}{% unless tu contains 'width=' %}&width=700{% endunless %}" alt="" loading="lazy">{%- else -%}<img src="''' + B + '''" alt="" class="ah-blank">{%- endif -%}
          <span class="cs-l">{{ c.title }}</span></a>
      {%- endfor -%}
    </div>
    <button type="button" class="cs-a next" aria-label="More categories"><svg viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg></button>
  </div>
</section>
{%- endif -%}
<style>
  .cq-hero{position:relative;width:100vw;margin-left:calc(50% - 50vw);height:min(62svh,600px);overflow:hidden;background:#1a1a18;color:#fff}
  .cq-hero video,.cq-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .cq-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.55),rgba(0,0,0,0) 60%);pointer-events:none}
  .cq-hero-tx{position:absolute;left:var(--gut);right:var(--gut);bottom:clamp(28px,4vw,56px);z-index:1;max-width:620px}
  .cq-hk{display:block;font:600 11.5px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.8);margin-bottom:14px;text-decoration:none}
  a.cq-hk:hover{color:#fff}
  .cq-hero h1{font:500 clamp(44px,5.4vw,80px)/1 var(--display);margin:0;color:#fff}
  .cq-hero-tx p{margin:14px 0 0;font-size:15.5px;line-height:1.65;color:rgba(255,255,255,.9)}
  .cq-subs{margin-top:clamp(28px,3vw,44px)}
  .cq-subs .cs-w{margin-top:0}
  .cq-subs .cs-r{grid-auto-columns:calc((100vw - 2 * var(--gut,24px) - 60px) / 6.3)}
  .cq-subs .cs-t[aria-current] .cs-l{text-decoration:underline;text-underline-offset:5px}
  .cq-subs .cs-t[aria-current]{outline:2px solid var(--ink);outline-offset:-2px}
  .cq-subs + .cx-bar,.cq-hero + .cx-bar{margin-top:clamp(24px,3vw,40px)}
  @media (max-width:800px){.cq-hero{height:min(70svh,520px)}.cq-subs .cs-r{grid-auto-columns:42vw}}
</style>
<script>
document.querySelectorAll('.cq-subs .cs-w').forEach(function(w){if(w.dataset.on)return;w.dataset.on=1;
var r=w.querySelector('.cs-r'),p=w.querySelector('.prev'),n=w.querySelector('.next');
function step(){var t=r.querySelector('.cs-t');return t?(t.getBoundingClientRect().width+10)*2:300}
function upd(){p.hidden=r.scrollLeft<8;n.hidden=r.scrollLeft+r.clientWidth>=r.scrollWidth-8}
p.addEventListener('click',function(){r.scrollBy({left:-step(),behavior:'smooth'})});
n.addEventListener('click',function(){r.scrollBy({left:step(),behavior:'smooth'})});
r.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
var cur=r.querySelector('[aria-current]');if(cur&&cur.offsetLeft>r.clientWidth*.6)r.scrollLeft=cur.offsetLeft-20;});
</script>
'''
s = s[:a] + new + s[b:]
# in-grid films: different picks from the hero
s = s.replace("assign i1 = collection.id | modulo: ps", "assign i1 = collection.id | plus: 1 | modulo: ps")
s = s.replace("assign i2 = collection.id | plus: 3 | modulo: ps", "assign i2 = collection.id | plus: 4 | modulo: ps")
open(p, 'w').write(s)
print('ok', s.count('cq-hero'))
