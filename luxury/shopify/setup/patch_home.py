T = '/home/user/Cloud/luxury/theme/'
p = T + 'sections/home.liquid'; s = open(p).read()
i = s.index('<section class="bd2"'); b = s.index('</section>', i) + len('</section>')
row = '''
  <section class="sp cs lbp" aria-label="Shop for long backs">
    <div class="sp-h"><h2>Made for long backs</h2><a class="all" href="/collections/dachshund">Shop all <svg class="a" viewBox="0 0 16 10"><path d="M0 5h15M11 1l4 4-4 4"/></svg></a></div>
    <div class="cs-w">
      <button type="button" class="cs-a prev" aria-label="Previous pieces" hidden><svg viewBox="0 0 8 14" aria-hidden="true"><path d="M7 1L1 7l6 6"/></svg></button>
      <div class="cs-r" tabindex="0" aria-label="Pieces for long backs, scroll sideways">
        {%- assign lb_n = 0 -%}
        {%- for product in collections['dachshund'].products limit: 6 -%}{%- render 'card', product: product -%}{%- assign lb_n = lb_n | plus: 1 -%}{%- endfor -%}
        {%- for product in collections['whippet-and-greyhound'].products limit: 6 -%}{%- render 'card', product: product -%}{%- assign lb_n = lb_n | plus: 1 -%}{%- endfor -%}
        {%- if lb_n == 0 -%}{%- for i in (1..6) -%}<div class="pcd lbp-ph" aria-hidden="true"><span class="im"></span><span class="l1"></span><span class="l2"></span></div>{%- endfor -%}{%- endif -%}
      </div>
      <button type="button" class="cs-a next" aria-label="More pieces"><svg viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6"/></svg></button>
    </div>
  </section>
<style>
  .lbp .cs-r{grid-auto-columns:calc((100vw - 2 * var(--gut,24px) - 40px) / 4.3);gap:16px}
  .lbp .cs-r > *{scroll-snap-align:start;min-width:0}
  .lbp .cs-a{top:38%}
  .lbp-ph .im{display:block;aspect-ratio:1;background:#EDEDEB}
  .lbp-ph .l1,.lbp-ph .l2{display:block;height:12px;background:#F2F2EF;margin-top:14px;width:70%}
  .lbp-ph .l2{width:30%;margin-top:8px}
  @media (max-width:800px){.lbp .cs-r{grid-auto-columns:62vw}}
</style>'''
if 'class="sp cs lbp"' not in s:
    s = s[:b] + row + s[b:]
open(p, 'w').write(s)
print('ok')
