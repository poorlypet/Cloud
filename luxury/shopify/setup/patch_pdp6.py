import re
T = '/home/user/Cloud/luxury/theme/'
p = T + 'sections/main-product.liquid'; s = open(p).read()

# materials: "Materials" and "Care" as small headings, the rest as bullets
old = "{%- for l in lines -%}<li>{{ l | strip }}</li>{%- endfor -%}"
new = "{%- for l in lines -%}{%- assign t = l | strip -%}{%- if t == 'Materials' or t == 'Care' -%}</ul><h4 class=\"mch\">{{ t }}</h4><ul>{%- elsif t != blank -%}<li>{{ t }}</li>{%- endif -%}{%- endfor -%}"
assert old in s, 'materials loop not found'
s = s.replace(old, new)

# no arrows on the main photo
s = re.sub(r'<button type="button" class="ga-a prev".*?</button><button type="button" class="ga-a next".*?</button>', '', s, count=1, flags=re.S)

# size buttons: available ones read clearly as available
s = re.sub(r'\.szs\.szb button\{.*?\}\n\.szs\.szb button:hover\{.*?\}\n\.szs\.szb button\[aria-pressed="true"\]\{.*?\}\n\.szs\.szb button\[data-oos\]\{.*?\}\n\.szs\.szb button:focus-visible\{.*?\}',
'''.szs.szb button{min-width:54px;height:46px;padding:0 16px;border:1px solid #D9D9D4;border-radius:4px;background:#fff;color:var(--ink);font:500 13px/1 var(--sans);letter-spacing:.04em;cursor:pointer;outline:none;transition:border-color .2s,background .2s,color .2s}
.szs.szb button:hover{border-color:#8E8E87}
.szs.szb button[aria-pressed="true"]{border-color:var(--ink);background:#F7F7F4;box-shadow:inset 0 0 0 1px var(--ink)}
.szs.szb button[data-oos]{border-style:dashed;border-color:#E2E2DD;background:#fff;color:#B9B9B3;text-decoration:line-through;text-decoration-color:#CFCFC9;cursor:not-allowed}
.szs.szb button:focus-visible{box-shadow:0 0 0 2px #fff,0 0 0 4px var(--olive,#5E6B3A)}''', s, count=1, flags=re.S)
s = s.replace('{% schema %}', '<style>.mch{font:600 10.5px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--ink);margin:18px 0 8px}.ztp ul:empty{display:none}.ztp .mch:first-child,.ztp ul:empty + .mch{margin-top:4px}</style>\n{% schema %}', 1) if '.mch{' not in s else s
open(p, 'w').write(s)
print('arrows gone', 'ga-a prev' not in s, 'sizes', 'border-style:dashed' in s)

# the "3 ×" price follows the chosen size
p = T + 'assets/ah-store.js'; j = open(p).read()
old = '        if (v && price) price.innerHTML ='
new = '''        if (v) $$(".p3l, .p3m").forEach(function (el) { el.innerHTML = el.innerHTML.replace(/£[0-9][0-9,]*(?:\\.[0-9]{2})?/, money(Math.round(v.price / 3))); });
        if (v && price) price.innerHTML ='''
if '.p3l, .p3m' not in j:
    assert old in j
    j = j.replace(old, new, 1)
open(p, 'w').write(j)
print('p3', '.p3l, .p3m' in j)
