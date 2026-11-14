import re
p = '/home/user/Cloud/luxury/theme/sections/main-product.liquid'
s = open(p).read()
btns = ('<button type="button" class="ga-a prev" aria-label="Previous photo"><svg viewBox="0 0 10 18" aria-hidden="true"><path d="M9 1L1 9l8 8"/></svg></button>'
        '<button type="button" class="ga-a next" aria-label="Next photo"><svg viewBox="0 0 10 18" aria-hidden="true"><path d="M1 1l8 8-8 8"/></svg></button>')
if 'class="ga-a prev"' not in s:
    s = s.replace('<div class="gg-w">', '<div class="gg-w">' + btns, 1)
# quiet look: no circle, a thin chevron that shows on hover
s = re.sub(r'  \.ga-a\{display:grid;place-items:center;position:absolute;.*?\n', '  .ga-a{display:grid;place-items:center;position:absolute;top:50%;z-index:3;width:44px!important;height:64px!important;min-width:0!important;min-height:0!important;padding:0!important;margin:-32px 0 0!important;border:0;background:none!important;box-shadow:none!important;cursor:pointer;opacity:0;transition:opacity .3s}\n', s, count=1)
s = s.replace('  .ga-a:hover{background:#fff}\n', '  .gg-w:hover .ga-a{opacity:.45}\n  .gg-w .ga-a:hover,.ga-a:focus-visible{opacity:.9}\n')
s = s.replace('  .gg-w:hover .ga-a,.ga-a:focus-visible{opacity:1}\n', '')
s = s.replace('  .ga-a svg{width:7px;height:12px;fill:none;stroke:#161616;stroke-width:1.4}', '  .ga-a svg{width:10px;height:18px;fill:none;stroke:#161616;stroke-width:1}')
s = s.replace('  .ga-a.prev{left:16px}.ga-a.next{right:16px}', '  .ga-a.prev{left:6px}.ga-a.next{right:6px}')
open(p, 'w').write(s)
print('buttons', 'class="ga-a prev"' in s, 'quiet', 'background:none!important' in s, 'hover', '.gg-w:hover .ga-a{opacity:.45}' in s)
