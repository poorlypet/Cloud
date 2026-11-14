import re
p = '/home/user/Cloud/luxury/theme/sections/main-product.liquid'
s = open(p).read()
a = s.index('<section class="zsec zin pst">')
b = s.index('</section>', a) + len('</section>')
new = '''<section class="zsec zin pst">
  <div class="zhd"><span class="zkick">The details</span><h2 class="zh2">{{ product.title | split: ',' | first }}</h2></div>
  {%- assign shown_film = false -%}
  {%- for im in life limit: 2 -%}
    {%- if forloop.index == 1 -%}{%- assign h = fts[0] | default: product.title -%}{%- assign p1 = fts[1] -%}{%- assign p2 = fts[2] -%}{%- else -%}{%- assign h = fts[3] | default: fts[0] | default: product.title -%}{%- assign p1 = fts[4] -%}{%- assign p2 = fts[5] -%}{%- endif -%}
    <div class="pst-r{% if forloop.index == 2 %} rev{% endif %}">{{ im | image_url: width: 1600 | image_tag: loading: 'lazy', alt: product.title, sizes: '(max-width: 800px) 100vw, 50vw' }}<div><h3>{{ h }}</h3>{%- if p1 -%}<p>{{ p1 }}</p>{%- endif -%}{%- if p2 -%}<p>{{ p2 }}</p>{%- endif -%}</div></div>
    {%- if forloop.index == 1 and pf -%}<div class="pst-film">{{ pf | video_tag: autoplay: true, loop: true, muted: true, playsinline: true, controls: false, image_size: '1920x' }}</div>{%- assign shown_film = true -%}{%- endif -%}
  {%- endfor -%}
  {%- if pf and shown_film == false -%}<div class="pst-film">{{ pf | video_tag: autoplay: true, loop: true, muted: true, playsinline: true, controls: false, image_size: '1920x' }}</div>{%- endif -%}
  {%- if life.size > 2 -%}<div class="pst-more">{%- for im in life offset: 2 limit: 4 -%}{{ im | image_url: width: 1000 | image_tag: loading: 'lazy', alt: product.title }}{%- endfor -%}</div>{%- endif -%}
</section>'''
s = s[:a] + new + s[b:]
open(p, 'w').write(s)
print('ok')
