p = '/home/user/Cloud/luxury/theme/sections/main-product.liquid'
s = open(p).read()
old_start = '<div class="sdd"><button type="button" class="sdd-b" aria-expanded="false" aria-haspopup="listbox"><span>Size: <b data-sizename>Choose a size</b></span><i class="sdd-c" aria-hidden="true"></i></button><div class="sdd-p" hidden><div class="szs">'
old_end_marker = '{%- endfor -%}</div></div></div>{%- endif -%}<p class="stock"'
assert old_start in s
a = s.index(old_start)
b = s.index(old_end_marker, a)
loop = s[a + len(old_start):b]          # the size buttons loop
new = ('<div class="szw"><div class="szw-h"><span>Size: <b data-sizename>Choose a size</b></span></div>'
       '<div class="szs szb" role="group" aria-label="Size">' + loop + '{%- endfor -%}</div></div>{%- endif -%}<p class="stock"')
s = s[:a] + new + s[b + len(old_end_marker):]
css = '''<style>
.szw{padding:16px 0 4px;border-top:1px solid #ECECE8}
.szw-h{font-size:13.5px;margin-bottom:12px}
.szw-h b{font-weight:600}
.szs.szb{display:flex;flex-wrap:wrap;gap:8px}
.szs.szb button{min-width:52px;height:44px;padding:0 14px;border:1px solid transparent;border-radius:3px;background:#F3F3F1;color:var(--ink);font:500 13px/1 var(--sans);letter-spacing:.04em;cursor:pointer;transition:background .2s,border-color .2s,color .2s}
.szs.szb button:hover{background:#ECECE8}
.szs.szb button[aria-pressed="true"]{background:#fff;border-color:var(--ink);box-shadow:inset 0 0 0 .5px var(--ink)}
.szs.szb button[data-oos]{background:#F8F8F6;color:#B4B4AE;text-decoration:line-through;text-decoration-color:#C9C9C3;cursor:not-allowed}
.szs.szb button:focus-visible{outline:2px solid var(--olive,#5E6B3A);outline-offset:2px}
</style>
'''
if '.szs.szb{' not in s:
    s = s.replace('{% schema %}', css + '{% schema %}', 1)
open(p, 'w').write(s)
print('ok', 'sdd-b' in s)
