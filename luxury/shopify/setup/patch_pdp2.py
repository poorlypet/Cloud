T = '/home/user/Cloud/luxury/theme/'
p = T + 'sections/main-product.liquid'; s = open(p).read()
old = '<div class="szs szb" role="group" aria-label="Size">'
assert s.count(old) == 1
s = s.replace(old, "{%- assign szl = false -%}{%- for v in product.options_by_name['Size'].values -%}{%- if v.size > 4 -%}{%- assign szl = true -%}{%- endif -%}{%- endfor -%}" + '<div class="szs szb{% if szl %} szl{% endif %}" role="group" aria-label="Size">')
open(p, 'w').write(s)
c = T + 'assets/ah-pv.css'; s = open(c).read()
if '.szs.szl' not in s:
    s += '''
/* long size names (Martingale Piccolo, 50 x 70 cm): wider buttons that wrap their label */
.szs.szb.szl,.p8.pv2 .szs.szb.szl{grid-template-columns:repeat(auto-fill,minmax(128px,1fr))!important}
.szs.szb.szl button{height:auto!important;min-height:50px;padding:8px 10px;line-height:1.25;white-space:normal}
/* an odd last photo spans the full width, so the grid never leaves a hole */
.pv3 .pvg3 .pv-c:nth-last-child(1 of .pv-c):nth-child(odd of .pv-c){grid-column:span 2;aspect-ratio:2/1}
/* big colour families: two rows, then "Show all" */
.ah-sibs.clip{max-height:88px;overflow:hidden}
.sib-more{margin-top:10px;font:500 12.5px/1 var(--sans);text-decoration:underline;text-underline-offset:3px;background:none;border:0;padding:0;cursor:pointer;color:var(--ink)}
'''
open(c, 'w').write(s)
j = T + 'assets/ah-store.js'; s = open(j).read()
if '__sibclip' not in s:
    s += '''
/* big colour families on the product page: show two rows, current colour kept visible, "Show all N" opens the rest */
(function(){if(window.__sibclip)return;window.__sibclip=1;
function run(){var w=document.querySelector('.ah-sibs');if(!w)return;var a=w.querySelectorAll('a');if(a.length<=20)return;
var cur=w.querySelector('[aria-current]');if(cur)w.insertBefore(cur,w.firstChild);
w.classList.add('clip');var b=document.createElement('button');b.type='button';b.className='sib-more';b.textContent='Show all '+a.length;
b.addEventListener('click',function(){var o=w.classList.toggle('clip');b.textContent=o?'Show all '+a.length:'Show fewer'});
w.parentNode.appendChild(b)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run()})();
'''
open(j, 'w').write(s)
print('ok')
