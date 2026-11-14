p = '/home/user/Cloud/luxury/theme/snippets/card.liquid'; s = open(p).read()
a = s.find('  <div class="csw" role="list" aria-label="Colours">'); b = s.find('{%- elsif colour_opt', a)
assert a > 0 and b > a
NEW = '''  <div class="csw" role="list" aria-label="Colours">{%- assign shownc = 0 -%}{%- for pass in (1..2) -%}{%- for sib in sibs -%}{%- if pass == 1 and sib.id != product.id -%}{%- continue -%}{%- endif -%}{%- if pass == 2 and sib.id == product.id -%}{%- continue -%}{%- endif -%}{%- if shownc >= 5 -%}{%- break -%}{%- endif -%}{%- assign sw = sib.metafields.custom.swatch.value -%}<a role="listitem" href="{{ sib.url }}" title="{{ sib.metafields.custom.colour.value | escape }}" aria-label="{{ sib.metafields.custom.colour.value | escape }}"{% if sib.id == product.id %} aria-current="true"{% endif %}{% if sib.featured_image %} data-img="{{ sib.featured_image | image_url: width: 900 }}"{% endif %} style="{% if sw %}background:url({{ sw | image_url: width: 60 }}) center/cover{% else %}background:{% render 'swatch', name: sib.metafields.custom.colour.value %}{% endif %}"></a>{%- assign shownc = shownc | plus: 1 -%}{%- endfor -%}{%- endfor -%}{%- if sibs.size > 5 -%}<a class="csw-more" href="{{ product.url }}">+{{ sibs.size | minus: 5 }}</a>{%- endif -%}</div>
  '''
s = s[:a] + NEW + s[b:]
open(p, 'w').write(s); print('ok')
