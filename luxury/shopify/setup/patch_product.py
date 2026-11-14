import re
T = '/home/user/Cloud/luxury/theme/'
p = T + 'sections/main-product.liquid'; s = open(p).read()

# 1. colour and fit: each colour and each fit is its own product, linked by metafields
colour_old = "{%- assign colour_opt = product.options_by_name['Colour'] -%}"
colour_new = '''{%- assign mf = product.metafields.custom -%}{%- if mf.colour != blank and mf.colour_siblings.value != blank -%}<div class="crow"><div class="zlbl"><span>Colour: <b>{{ mf.colour.value }}</b></span></div><div class="sws ah-sibs">{%- for sib in mf.colour_siblings.value -%}{%- assign sw = sib.metafields.custom.swatch.value -%}<a href="{{ sib.url }}" aria-label="{{ sib.metafields.custom.colour.value | escape }}" title="{{ sib.metafields.custom.colour.value | escape }}"{% if sib.id == product.id %} aria-current="true"{% endif %} style="{% if sw %}background:url({{ sw | image_url: width: 80 }}) center/cover{% else %}background:{% render 'swatch', name: sib.metafields.custom.colour.value %}{% endif %}"></a>{%- endfor -%}</div></div>{%- endif -%}{%- if mf.fit != blank and mf.fit_siblings.value != blank -%}<div class="crow"><div class="zlbl"><span>Fit: <b>{{ mf.fit.value }}</b></span></div><div class="ah-fits">{%- for sib in mf.fit_siblings.value -%}<a href="{{ sib.url }}"{% if sib.id == product.id %} aria-current="true"{% endif %}>{{ sib.metafields.custom.fit.value }}</a>{%- endfor -%}</div></div>{%- endif -%}''' + colour_old
if 'ah-sibs' not in s:
    assert colour_old in s
    s = s.replace(colour_old, colour_new, 1)

# 2. size note under the size chart
s = s.replace("<p>Between sizes? Choose the larger.</p></div>",
              "{%- if product.metafields.custom.size_note != blank -%}<p>{{ product.metafields.custom.size_note.value | newline_to_br }}</p>{%- else -%}<p>Between sizes? Choose the larger.</p>{%- endif -%}</div>", 1)

# 3. delivery threshold matches the rest of the site
s = s.replace("Free UK standard delivery on orders over £75, otherwise £4.95.", "Free UK standard delivery on orders over £100.")

# 4. the product's own film beside the brand story
s = s.replace("<div class=\"ph2\">{%- render 'ah-vid', f: 'product-film.mp4' -%}</div>",
              "<div class=\"ph2\">{%- assign pf = product.metafields.custom.film.value -%}{%- if pf -%}{{ pf | video_tag: autoplay: true, loop: true, muted: true, playsinline: true, controls: false, image_size: '1200x' }}{%- else -%}{%- render 'ah-vid', f: 'product-film.mp4' -%}{%- endif -%}</div>", 1)

# 5. lifestyle photos at the bottom, before "You might also like"
life = '''{%- assign life = product.metafields.custom.lifestyle.value -%}{%- if life != blank -%}<section class="zsec zin lfx"><div class="zhd"><h2 class="zh2">In real life</h2></div><div class="lfx-g n{{ life.size | at_most: 4 }}">{%- for im in life limit: 6 -%}<figure>{{ im | image_url: width: 1400 | image_tag: loading: 'lazy', sizes: '(max-width: 800px) 100vw, 50vw', alt: product.title }}</figure>{%- endfor -%}</div></section>{%- endif -%}'''
anchor = '<section class="zsec zin zrl">'
if 'lfx-g' not in s:
    s = s.replace(anchor, life + anchor, 1)

# 6. the full size chart inside "Find my fit"
s = s.replace('<p class="fm7-e" role="alert"></p>', '<p class="fm7-e" role="alert"></p><div class="fm7-chart" data-fm-chart></div>', 1)

css = '''<style>
.ah-sibs{display:flex;flex-wrap:wrap;gap:10px}
.ah-sibs a{display:block;width:30px;height:30px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12);outline:1px solid transparent;outline-offset:3px;transition:outline-color .2s}
.ah-sibs a:hover{outline-color:#B9B9B3}
.ah-sibs a[aria-current]{outline-color:var(--ink)}
.ah-fits{display:flex;flex-wrap:wrap;gap:8px}
.ah-fits a{padding:10px 16px;border:1px solid #D6D6D0;font:500 12px/1 var(--sans);letter-spacing:.08em;color:var(--ink);text-decoration:none}
.ah-fits a[aria-current]{border-color:var(--ink);box-shadow:inset 0 0 0 1px var(--ink)}
.lfx-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.lfx-g.n3 figure:first-child{grid-column:1/-1}
.lfx-g figure{margin:0;overflow:hidden;background:#EDEDEB}
.lfx-g img{display:block;width:100%;height:100%;object-fit:cover;aspect-ratio:4/5}
.lfx-g.n3 figure:first-child img{aspect-ratio:16/9}
.lfx-g.n1{grid-template-columns:1fr}
.lfx-g.n1 img{aspect-ratio:16/9}
.fm7-chart{margin-top:22px}
.fm7-chart table{width:100%;border-collapse:collapse;font-size:13px}
.fm7-chart th,.fm7-chart td{padding:8px 6px;border-bottom:1px solid #E4E4E0;text-align:left}
.fm7-chart th{font:600 10.5px/1.3 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--ink2)}
.fm7-chart tr.hit td{background:#EEF0E6;font-weight:600}
.fm7-chart p{font-size:12.5px;color:var(--ink2);margin:10px 0 0}
@media (max-width:800px){.lfx-g{grid-template-columns:1fr}.lfx-g img,.lfx-g.n3 figure:first-child img{aspect-ratio:4/5}}
</style>
'''
if '.ah-sibs{' not in s:
    s = s.replace('{% schema %}', css + '{% schema %}', 1)
open(p, 'w').write(s)
print('ah-sibs' in s, 'lfx-g' in s, 'fm7-chart' in s, 'custom.film' in s)

# 7. Find my fit reads the real chart from the size tab, and shows it in the dialog
p = T + 'assets/r37.js'; j = open(p).read()
old = '  var S = [["XS", 30, 40, 46], ["S", 35, 46, 52], ["M", 40, 52, 58], ["L", 45, 58, 64], ["XL", 50, 64, 70]];'
new = '''  var S = [["XS", 30, 40, 46], ["S", 35, 46, 52], ["M", 40, 52, 58], ["L", 45, 58, 64], ["XL", 50, 64, 70]];
  /* the product's own size chart, when it has one: [size, back max, -, chest max] */
  (function () {
    var t = document.querySelector(".zsz table"); if (!t) return;
    var hs = [].map.call(t.querySelectorAll("thead th"), function (th) { return th.textContent.toLowerCase(); });
    var bi = hs.findIndex(function (h) { return /back/.test(h); }), ci = hs.findIndex(function (h) { return /chest|brust/.test(h); });
    if (bi < 0 && ci < 0) return;
    function top(txt) { var n = (txt || "").match(/[0-9]+(?:[.,][0-9]+)?/g); return n ? parseFloat(n[n.length - 1].replace(",", ".")) : NaN; }
    var rows = [].map.call(t.querySelectorAll("tbody tr"), function (tr) {
      var c = tr.querySelectorAll("td");
      return [tr.getAttribute("data-s"), bi >= 0 ? top(c[bi] && c[bi].textContent) : 999, 0, ci >= 0 ? top(c[ci] && c[ci].textContent) : 999];
    }).filter(function (r) { return r[0]; });
    if (rows.length) { S = rows; window.AH_SIZES = rows; }
  })();'''
if 'AH_SIZES' not in j:
    assert old in j
    j = j.replace(old, new, 1)
# the too-big check uses the chart's largest size
j = j.replace('if (b > 55 || c > 75) { e.textContent = "That is bigger than this coat’s largest size. Have a look at our Large and Giant collections."; return; }',
              'var L = S[S.length - 1]; if (b > L[1] + 2 || c > L[3] + 2) { e.textContent = "That is bigger than the largest size of this piece. Have a look at our Large and Giant collections."; return; }')
# show the chart inside the dialog each time it opens
j = j.replace('$$("[data-fm]").forEach(function (b) { b.addEventListener("click", function () { reset(); d.showModal(); var i = $("input", f); if (i) i.focus(); }); });',
              '$$("[data-fm]").forEach(function (b) { b.addEventListener("click", function () { reset(); var ch = $("[data-fm-chart]", d), src = document.querySelector(".t7-sz"); if (ch && src && !ch.firstChild) ch.innerHTML = src.innerHTML; d.showModal(); var i = $("input", f); if (i) i.focus(); }); });')
j = j.replace('$$(".zsz tr[data-s]").forEach(function (tr) { tr.classList.toggle("hit", tr.dataset.s === pick); });',
              '$$(".zsz tr[data-s], .fm7-chart tr[data-s]").forEach(function (tr) { tr.classList.toggle("hit", tr.dataset.s === pick); });')
open(p, 'w').write(j)
print('AH_SIZES' in j, 'data-fm-chart' in j)
