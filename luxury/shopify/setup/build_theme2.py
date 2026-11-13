from build_theme import *

# ---------------- layout ----------------
css_tags=lambda xs:''.join(f"  {{{{ '{c}.css' | asset_url | stylesheet_tag }}}}\n" for c in xs)
js_tags=lambda xs:''.join(f"  <script src=\"{{{{ '{j}.js' | asset_url }}}}\" defer></script>\n" for j in xs)
LINKS={}
for h,t,slug,top,f in C.COLLS:
    LINKS.setdefault(C.txt(t).lower(),f'/collections/{h}')
    LINKS.setdefault(C.txt(t).lower().replace(' collection',''),f'/collections/{h}')
for k,v in {'shop all new in':'/collections/new-in','sale':'/collections/sale','winter sale':'/collections/sale','clothing':'/collections/coats','sleeping':'/collections/beds','gift cards':'/collections/gifts',
            'help':'/pages/help','contact us':'/pages/contact','delivery':'/pages/delivery','returns':'/pages/returns','track an order':'/pages/track-order','size guide':'/pages/faqs',
            'our story':'/pages/our-story','brands we stock':'/pages/brands','account':'/account','bestsellers':'/collections/bestsellers','new in':'/collections/new-in',
            'toys':'/collections/cat-toys','bowls':'/collections/bowls','collars':'/collections/collars','blankets & cushions':'/collections/blankets-and-cushions'}.items(): LINKS[k]=v
W('layout/theme.liquid',f'''<!doctype html>
<html lang="{{{{ request.locale.iso_code }}}}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#111111">
  <link rel="canonical" href="{{{{ canonical_url }}}}">
  <title>{{{{ page_title }}}}{{% if current_page != 1 %}} &middot; Page {{{{ current_page }}}}{{% endif %}}{{% unless page_title contains shop.name %}} &middot; {{{{ shop.name }}}}{{% endunless %}}</title>
  {{% if page_description %}}<meta name="description" content="{{{{ page_description | escape }}}}">{{% endif %}}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Jost:wght@400;500;600;700&display=swap" rel="stylesheet">
  {{%- if template.name == 'index' -%}}
{css_tags(BASE_CSS)}  {{%- else -%}}
{css_tags(ALL_CSS)}  {{%- endif -%}}
  <style>.ah-blank{{background:#EDEDEB}} .shopify-section{{display:contents}}</style>
  {{{{ content_for_header }}}}
</head>
<body data-layout="lib" data-basket="1" class="has-over{{% unless template.name == 'index' or template.suffix == 'brand' %}} solid{{% endunless %}} t-{{{{ template.name }}}}">
  {{% section 'header' %}}
  <main>
    {{{{ content_for_layout }}}}
  </main>
  {{% section 'footer' %}}
  <script>
    window.AH = {{
      links: {json.dumps(LINKS)},
      blank: "{BLANK}",
      count: {{{{ cart.item_count }}}},
      money: {{{{ shop.money_format | json }}}},
      routes: {{ cart: "{{{{ routes.cart_url }}}}", add: "{{{{ routes.cart_add_url }}}}.js", change: "{{{{ routes.cart_change_url }}}}.js", search: "{{{{ routes.search_url }}}}", account: "{{{{ routes.account_url }}}}" }}
    }};
  </script>
  {{%- if template.name == 'index' -%}}
{js_tags(BASE_JS)}  {{%- else -%}}
{js_tags(ALL_JS)}  {{%- endif -%}}
  <script src="{{{{ 'ah-store.js' | asset_url }}}}" defer></script>
</body>
</html>
''')

# ---------------- header ----------------
home=R('signed-off/homepage.html')
hdr=home[home.index('<header'):home.index('</header>')+9]
hdr=hdr.replace('<header class="hdr clear">','<header class="hdr{% if template.name == \'index\' or template.suffix == \'brand\' %} clear{% endif %}">')
hdr=hdr.replace('href="homepage.html"','href="{{ routes.root_url }}"').replace('href="help.html"','href="/pages/help"')
hdr=hdr.replace('Complimentary UK delivery over £100<a href="#">Winter Sale: up to 30% off</a>','{{ section.settings.announce }}<a href="{{ section.settings.announce_link }}">{{ section.settings.announce_link_text }}</a>')
hdr=hdr.replace('<span class="n" data-count></span>','<span class="n" data-count>{% if cart.item_count > 0 %}{{ cart.item_count }}{% endif %}</span>')
W('sections/header.liquid',hdr+'''
{% schema %}
{"name":"Header","settings":[
 {"type":"text","id":"announce","label":"Announcement","default":"Complimentary UK delivery over £100"},
 {"type":"text","id":"announce_link_text","label":"Announcement link text","default":"Winter Sale: up to 30% off"},
 {"type":"url","id":"announce_link","label":"Announcement link"}]}
{% endschema %}
''')

# ---------------- footer ----------------
ft=home[home.index('<footer'):home.index('</footer>')+9]
def menu_ul(handle): return '<ul>{%- for link in linklists["'+handle+'"].links -%}<li><a href="{{ link.url }}">{{ link.title }}</a></li>{%- endfor -%}</ul>'
ft=re.sub(r'<div><h5>Shop</h5><ul>.*?</ul></div>','<div><h5>Shop</h5>'+menu_ul('footer-shop')+'</div>',ft,flags=re.S)
ft=re.sub(r'<div><h5>Help</h5><ul>.*?</ul></div>','<div><h5>Help</h5>'+menu_ul('footer-help')+'</div>',ft,flags=re.S)
ft=re.sub(r'<div><h5>About</h5><ul>.*?</ul></div>','<div><h5>About</h5>'+menu_ul('footer-about')+'</div>',ft,flags=re.S)
ft=re.sub(r'<div class="legal">.*?</div>','<div class="legal">{%- for link in linklists["footer-legal"].links -%}<a href="{{ link.url }}">{{ link.title }}</a>{%- endfor -%}</div>',ft,flags=re.S)
ft=re.sub(r'<form class="f line" novalidate>.*?</form>',
 '''{%- form 'customer', class: 'f line' -%}<input type="hidden" name="contact[tags]" value="newsletter"><input id="em5" type="email" name="contact[email]" placeholder="Your email address" aria-label="Email address" autocomplete="email" required><button type="submit">Sign up</button>{%- if form.posted_successfully? -%}<p class="ah-ok">Thank you. Your code is on its way.</p>{%- endif -%}{%- endform -%}''',ft,flags=re.S)
ft=re.sub(r'src="\.\./media/pay/([^"]+)"',lambda m:'src="{{ \''+m.group(1)+'\' | asset_url }}"',ft)
ft=ft.replace('&copy; 2026 Axel &amp; Hound','&copy; {{ "now" | date: "%Y" }} Axel &amp; Hound')
W('sections/footer.liquid',ft+'\n{% schema %}\n{"name":"Footer"}\n{% endschema %}\n')

# ---------------- product card ----------------
CASES=''.join(f"{{%- when '{k}' -%}}{v}" for k,v in C.COLOURS.items())
W('snippets/swatch.liquid',"{%- case name -%}"+CASES+"{%- else -%}#C9C5BD{%- endcase -%}")
W('snippets/card.liquid',f'''{{%- liquid
  assign colour_opt = product.options_by_name['Colour']
  assign size_opt = product.options_by_name['Size']
  assign on_sale = false
  if product.compare_at_price > product.price
    assign on_sale = true
  endif
  assign fit = 'standard'
  if product.tags contains 'dachshund'
    assign fit = 'dachshund'
  elsif product.tags contains 'whippet-and-greyhound'
    assign fit = 'whippet'
  endif
  assign ctype = 'all'
  if product.tags contains 'raincoats'
    assign ctype = 'raincoats'
  elsif product.tags contains 'knitwear'
    assign ctype = 'knitwear'
  elsif product.tags contains 'quilted' or product.tags contains 'whippet-and-greyhound'
    assign ctype = 'winter'
  endif
-%}}
<div class="pcd" data-price="{{{{ product.price | divided_by: 100 }}}}" data-sale="{{% if on_sale %}}1{{% else %}}0{{% endif %}}" data-size="{{% if size_opt %}}{{{{ size_opt.values | join: ' ' | downcase }}}}{{% else %}}one{{% endif %}}" data-colour="{{%- if colour_opt -%}}{{%- for v in colour_opt.values -%}}{{{{ v | replace: ' ', '-' }}}} {{%- endfor -%}}{{%- endif -%}}" data-fit="{{{{ fit }}}}" data-type="{{{{ ctype }}}}">
  <a class="im" href="{{{{ product.url }}}}">
    {{%- if product.featured_image -%}}{{{{ product.featured_image | image_url: width: 900 | image_tag: loading: 'lazy', alt: product.title, sizes: '(max-width: 640px) 50vw, 25vw' }}}}{{%- else -%}}<img src="{BLANK}" alt="{{{{ product.title | escape }}}}" loading="lazy" class="ah-blank">{{%- endif -%}}
    {{%- if on_sale -%}}<span class="tag">Sale</span>{{%- endif -%}}
  </a>
  <span class="br">{{{{ product.vendor }}}}</span>
  <a class="pn" href="{{{{ product.url }}}}">{{{{ product.title }}}}</a>
  <span class="pr">{{%- if on_sale -%}}<b>{{{{ product.price | money_without_trailing_zeros }}}}</b><s>{{{{ product.compare_at_price | money_without_trailing_zeros }}}}</s>{{%- else -%}}<b style="font-weight:400">{{%- if product.price_varies -%}}From {{% endif -%}}{{{{ product.price | money_without_trailing_zeros }}}}</b>{{%- endif -%}}</span>
  {{%- if colour_opt -%}}
  <div class="sw">{{%- for v in colour_opt.values limit: 3 -%}}<button type="button" data-c="{{{{ v | escape }}}}" aria-label="{{{{ v | escape }}}}" aria-pressed="{{% if forloop.first %}}true{{% else %}}false{{% endif %}}" style="background:{{% render 'swatch', name: v %}}"></button>{{%- endfor -%}}{{%- if colour_opt.values.size > 3 -%}}<span class="more">+{{{{ colour_opt.values.size | minus: 3 }}}}</span>{{%- endif -%}}<span class="cn">{{{{ colour_opt.values.first }}}}</span></div>
  {{%- endif -%}}
</div>''')
print('part2 ok')
