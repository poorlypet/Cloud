import re
p = '/home/user/Cloud/luxury/theme/sections/main-product.liquid'
s = open(p).read()

# 1. tabs again (same content, same order as before)
a = s.index('<div class="t7 acc7">')
b = s.index('</details></div>', a) + len('</details></div>')
blk = s[a:b]
def body(k):
    m = re.search(r'<details[^>]*data-t7="%s"[^>]*><summary>.*?</summary><div class="acb[^"]*">(.*?)</div></details>' % k, blk, re.S)
    return m.group(1)
d0, d1, d2, d3 = body(0), body(1), body(2), body(3)
tabs = ('<div class="ztw zt-seg zrow t7"><div class="ztabs" role="tablist">'
        '<button type="button" role="tab" data-t7="0" aria-selected="true" tabindex="0">Description</button>'
        '<button type="button" role="tab" data-t7="1" aria-selected="false" tabindex="-1">Size guide</button>'
        '<button type="button" role="tab" data-t7="2" aria-selected="false" tabindex="-1">Delivery &amp; returns</button>'
        '<button type="button" role="tab" data-t7="3" aria-selected="false" tabindex="-1">Materials &amp; care</button></div>'
        f'<div class="ztp" role="tabpanel">{d0}</div><div class="ztp" role="tabpanel" hidden>{d1}</div>'
        f'<div class="ztp" role="tabpanel" hidden>{d2}</div><div class="ztp" role="tabpanel" hidden>{d3}</div></div>')
s = s[:a] + tabs + s[b:]

# 2. cm / inch switch above every size chart
s = s.replace('<div class="t7-sz"><div class="zsz">', '<div class="t7-sz"><div class="unit" role="group" aria-label="Units"><button type="button" data-unit="cm" aria-pressed="true">cm</button><button type="button" data-unit="in" aria-pressed="false">inches</button></div><div class="zsz">', 1)

# 3. brand panel: the brand's own film, otherwise a photo of the product
s = re.sub(r'<div class="ph2">\{%- assign bp = product\.media\[1\].*?\{%- endif -%\}</div>',
           '''<div class="ph2">{%- assign bh = 'brand-' | append: product.vendor | handleize -%}{%- assign bfilm = shop.metafields.custom.ah_media.value.films[bh] -%}{%- if bfilm -%}{%- assign bfn = bh | append: '.mp4' -%}{%- render 'ah-vid', f: bfn -%}{%- else -%}{%- assign bp = product.media[1] | default: product.media[0] -%}{%- if bp -%}{{ bp.preview_image | image_url: width: 1400 | image_tag: loading: "lazy", alt: product.vendor }}{%- endif -%}{%- endif -%}</div>''',
           s, count=1, flags=re.S)

# 4. quiet arrows on the main photo (desktop)
s = s.replace('<div class="gg">', '<div class="gg-w"><button type="button" class="ga-a prev" aria-label="Previous photo"><svg viewBox="0 0 8 14" aria-hidden="true"><path d="M7 1L1 7l6 6"/></svg></button><button type="button" class="ga-a next" aria-label="Next photo"><svg viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg></button><div class="gg">', 1)
i = s.index('<div class="gg-w">'); j = s.index('{%- if product.media.size > 1 -%}<div class="ga-th"', i)
s = s[:j] + '</div>' + s[j:]

css = '''<style>
.unit{display:inline-flex;border:1px solid #D6D6D0;margin:0 0 14px}
.unit button{border:0;background:none;padding:7px 14px;font:600 10.5px/1 var(--sans);letter-spacing:.12em;text-transform:uppercase;color:var(--ink2);cursor:pointer}
.unit button[aria-pressed="true"]{background:var(--ink);color:#fff}
.fm7-chart .unit{margin-bottom:10px}
.gg-w{position:relative}
.ga-a{display:none}
@media (min-width:1081px){
  .ga-a{display:grid;place-items:center;position:absolute;top:50%;z-index:3;width:40px;height:40px;margin-top:-20px;border:0;border-radius:50%;background:rgba(255,255,255,.7);cursor:pointer;opacity:0;transition:opacity .25s,background .25s}
  .gg-w:hover .ga-a,.ga-a:focus-visible{opacity:1}
  .ga-a:hover{background:#fff}
  .ga-a.prev{left:16px}.ga-a.next{right:16px}
  .ga-a svg{width:7px;height:12px;fill:none;stroke:#161616;stroke-width:1.4}
}
</style>
<script>
(function(){
  /* arrows step through the photos */
  function go(d){
    var ts=[].slice.call(document.querySelectorAll(".ga-t")); if(!ts.length) return;
    var i=ts.findIndex(function(t){return t.classList.contains("on")}); i=(i+d+ts.length)%ts.length; ts[i].click();
  }
  document.addEventListener("click",function(e){var a=e.target.closest(".ga-a"); if(!a) return; e.preventDefault(); e.stopPropagation(); go(a.classList.contains("next")?1:-1);},true);
  /* centimetres or inches, in the size tab and in Find my fit */
  function conv(root,unit){
    root.querySelectorAll("table").forEach(function(t){
      var hs=[].slice.call(t.querySelectorAll("thead th")), cols=[];
      hs.forEach(function(th,k){ if(!th.dataset.cm) th.dataset.cm=th.textContent; var cm=/\\(cm\\)|cm\\b|length|chest|neck|girth|surface|dimension|mattress|width|height|belly|outer|inside/i.test(th.dataset.cm) && !/kg|weight/i.test(th.dataset.cm); if(cm) cols.push(k); th.textContent = cm && unit==="in" ? th.dataset.cm.replace(/\\(cm\\)/i,"(in)").replace(/\\bcm\\b/i,"in") : th.dataset.cm; });
      t.querySelectorAll("tbody tr").forEach(function(tr){ var c=tr.querySelectorAll("td"); cols.forEach(function(k){ var td=c[k]; if(!td) return; if(!td.dataset.cm) td.dataset.cm=td.textContent; td.textContent = unit==="in" ? td.dataset.cm.replace(/\\d+(?:[.,]\\d+)?/g,function(n){return (parseFloat(n.replace(",","."))/2.54).toFixed(1).replace(/\\.0$/,"")}) : td.dataset.cm; }); });
    });
    root.querySelectorAll("[data-unit]").forEach(function(b){b.setAttribute("aria-pressed", b.dataset.unit===unit?"true":"false")});
  }
  document.addEventListener("click",function(e){var b=e.target.closest("[data-unit]"); if(!b) return; var u=b.dataset.unit; document.querySelectorAll(".t7-sz, .fm7-chart").forEach(function(r){conv(r,u)});});
})();
</script>
'''
if '.unit{' not in s:
    s = s.replace('{% schema %}', css + '{% schema %}', 1)
open(p, 'w').write(s)
print('tabs' , 'role="tablist"' in s, 'unit', 'data-unit' in s, 'film', "films[bh]" in s, 'arrows', 'ga-a prev' in s)
