p = '/home/user/Cloud/luxury/theme/sections/main-product.liquid'
s = open(p).read()
# one closing tag too many after the fold-out sections
i = s.index('<div class="t7 acc7">')
j = s.index('</details></div>', i) + len('</details></div>')
assert s[j:j + 18] == '</div></div></div>', s[j:j + 30]
s = s[:j] + '</div></div>' + s[j + 18:]
# lifestyle photos are files: use their preview image
for k in ('0', '1'):
    s = s.replace("{{ life[%s] | image_url: width: 1600 | image_tag: loading: 'lazy', alt: product.title, sizes: '(max-width: 800px) 100vw, 50vw' }}" % k,
                  "{%%- if life[%s].preview_image -%%}{{ life[%s].preview_image | image_url: width: 1600 | image_tag: loading: 'lazy', alt: product.title, sizes: '(max-width: 800px) 100vw, 50vw' }}{%%- endif -%%}" % (k, k))
s = s.replace("{%- for im in life offset: 2 limit: 4 -%}{{ im | image_url: width: 1000 | image_tag: loading: 'lazy', alt: product.title }}{%- endfor -%}",
              "{%- for im in life offset: 2 limit: 4 -%}{%- if im.preview_image -%}{{ im.preview_image | image_url: width: 1000 | image_tag: loading: 'lazy', alt: product.title }}{%- endif -%}{%- endfor -%}")
open(p, 'w').write(s)
print(s.count('life[0].preview_image'), s.count('im.preview_image'))
