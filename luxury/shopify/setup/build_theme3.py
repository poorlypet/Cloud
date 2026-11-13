from build_theme import *
def nosvg_safe(h): return h

# ---------------- homepage ----------------
p='signed-off/homepage.html'
section('home',liveify(conv(main_of(p)),['sale','new-in']),'Homepage',head_styles(p))
tpl('index',[('home','home')])

# ---------------- collection ----------------
p='signed-off/collection.html'
m=conv(main_of(p))
i=m.index('<header class="cq-head">'); j=m.index('<div class="cx-bar">')
head='''{%- liquid
  assign parent = nil
  assign is_sub = false
  for l in linklists['main-menu'].links
    if l.object.handle == collection.handle
      assign parent = l
    else
      for c in l.links
        if c.object.handle == collection.handle
          assign parent = l
          assign is_sub = true
        endif
      endfor
    endif
  endfor
-%}
<header class="cq-head">{%- if is_sub -%}<a class="cq-back" href="{{ parent.url }}">{{ parent.title }}</a>{%- endif -%}<h1>{{ collection.title }}</h1>{%- if collection.description != blank -%}<div class="cq-txt">{{ collection.description }}</div>{%- endif -%}</header>
{%- if parent and is_sub == false and parent.links.size > 0 -%}<nav class="ct2 cq-c" aria-label="{{ collection.title | escape }}"><a href="{{ collection.url }}" aria-current="page">All {{ collection.title | downcase }}</a>{%- for c in parent.links -%}<span>·</span><a href="{{ c.url }}">{{ c.title }}</a>{%- endfor -%}</nav>{%- endif -%}
'''
m=m[:i]+head+m[j:]
g=m.index('<div class="cx-grid">'); ge=m.index('<div class="cx-more">'); me=block_end(m,ge)
grid='''{%- paginate collection.products by 48 -%}<div class="cx-grid">{%- for product in collection.products -%}{%- render 'card', product: product -%}{%- else -%}<p class="cx-empty" style="grid-column:1/-1;text-align:center;padding:48px 0;color:var(--ink2)">Nothing here yet. New pieces are on their way.</p>{%- endfor -%}</div>
<div class="cx-more"><p>Showing {{ paginate.current_offset | plus: collection.products.size }} of {{ collection.products_count }} products</p><div class="prog"><i style="width:{% if collection.products_count > 0 %}{{ paginate.current_offset | plus: collection.products.size | times: 100 | divided_by: collection.products_count }}{% else %}100{% endif %}%"></i></div>{%- if paginate.next -%}<a class="btn-o" href="{{ paginate.next.url }}" style="margin-top:16px">Load more</a>{%- endif -%}</div>{%- endpaginate -%}'''
m=m[:g]+grid+m[me:]
section('main-collection',m,'Collection',head_styles(p))
tpl('collection',[('main','main-collection')])
# brand collections (e.g. Cloud7) use the signed-off brand page
p='signed-off/brand.html'
b=conv(main_of(p))
b=re.sub(r'<h1([^>]*)>.*?</h1>',r'<h1\1>{{ collection.title }}</h1>',b,count=1,flags=re.S)
b=liveify(b,['__coll__']).replace("collections['__coll__'].products","collection.products")
section('main-brand',b,'Brand',head_styles(p))
tpl('collection.brand',[('main','main-brand')])
tpl('list-collections',[('main','main-list-collections')])
W('sections/main-list-collections.liquid','''<div class="v9 cbw cq cq3"><header class="cq-head"><h1>Shop</h1></header>
<nav class="ct2 cq-c" aria-label="Collections">{%- for link in linklists['main-menu'].links -%}{%- unless forloop.first -%}<span>·</span>{%- endunless -%}<a href="{{ link.url }}">{{ link.title }}</a>{%- endfor -%}</nav>
<div class="cx-grid" style="margin-top:28px">{%- for product in collections['bestsellers'].products limit: 12 -%}{%- render 'card', product: product -%}{%- endfor -%}</div></div>
{% schema %}{"name":"Collections list"}{% endschema %}''')

# ---------------- product ----------------
p='signed-off/product.html'
m=conv(main_of(p))
m=re.sub(r'<div class="px zp p8"[^>]*>','<div class="px zp p8" data-name="{{ product.title | escape }}" data-price="{{ product.price | divided_by: 100 }}" data-handle="{{ product.handle }}">',m,count=1)
GALL='''{%- if product.media.size > 0 -%}{%- for media in product.media -%}<button type="button" class="gt" data-lb="{{ forloop.index0 }}" aria-label="Open photo {{ forloop.index }} of {{ product.media.size }}">{{ media.preview_image | image_url: width: 1400 | image_tag: alt: product.title, loading: 'lazy' }}</button>{%- endfor -%}{%- else -%}{%- for i in (1..4) -%}<button type="button" class="gt" data-lb="{{ forloop.index0 }}" aria-label="Photo {{ forloop.index }}"><img src="'''+BLANK+'''" alt="" class="ah-blank"></button>{%- endfor -%}{%- endif -%}'''
gi=m.index('<div class="gg">')+len('<div class="gg">'); ge=block_end(m,m.index('<div class="gg">'))-6
m=m[:gi]+GALL+m[ge:]
m=re.sub(r'<a href="\{\{ routes.collections_url \}\}/coats">Coats</a><span>/</span><span aria-current="page">[^<]*</span>',
 '{%- if product.collections.first -%}<a href="{{ product.collections.first.url }}">{{ product.collections.first.title }}</a><span>/</span>{%- endif -%}<span aria-current="page">{{ product.title }}</span>',m)
m=re.sub(r'<h1>[^<]*</h1>','<h1>{{ product.title }}</h1>',m,count=1)
m=re.sub(r'<div class="price">.*?</div>','''<div class="price" data-ah-price>{%- assign v = product.selected_or_first_available_variant -%}{%- if v.compare_at_price > v.price -%}<b style="font-weight:500">{{ v.price | money_without_trailing_zeros }}</b><s>{{ v.compare_at_price | money_without_trailing_zeros }}</s><span class="ptag">−{{ v.compare_at_price | minus: v.price | times: 100 | divided_by: v.compare_at_price }}%</span>{%- else -%}<b style="font-weight:500">{{ v.price | money_without_trailing_zeros }}</b>{%- endif -%}</div>''',m,count=1,flags=re.S)
m=m.replace('Spread the cost: 3 interest-free payments of £35 with','Spread the cost: 3 interest-free payments of {{ product.price | divided_by: 3 | money }} with').replace('Spread the cost: 3 × £35 with','Spread the cost: 3 × {{ product.price | divided_by: 3 | money }} with')
m=re.sub(r'<div class="crow">.*?</div></div>','''{%- assign colour_opt = product.options_by_name['Colour'] -%}{%- if colour_opt -%}<div class="crow"><div class="zlbl"><span>Colour: <b data-colname>{{ colour_opt.selected_value | default: colour_opt.values.first }}</b></span></div><div class="sws">{%- for v in colour_opt.values -%}<button type="button" data-c="{{ v | escape }}" aria-label="{{ v | escape }}" aria-pressed="{% if v == colour_opt.selected_value or forloop.first and colour_opt.selected_value == blank %}true{% else %}false{% endif %}" style="background:{% render 'swatch', name: v %}"></button>{%- endfor -%}</div></div>{%- endif -%}''',m,count=1,flags=re.S)
m=re.sub(r'<div class="szs">.*?</div>','''<div class="szs">{%- for v in product.options_by_name['Size'].values -%}<button type="button" data-s="{{ v | escape }}" aria-pressed="false">{{ v }}</button>{%- endfor -%}</div>''',m,count=1,flags=re.S)
sdd_i=m.index('<div class="sdd">'); sdd_e=block_end(m,sdd_i)
m=m[:sdd_i]+"{%- if product.options_by_name['Size'] -%}"+m[sdd_i:sdd_e]+"{%- endif -%}"+m[sdd_e:]
m=m.replace('<div class="lrow">',"{%- if product.options_by_name['Size'] -%}<div class=\"lrow\">",1)
lr=m.index('<div class="lrow">'); lre=block_end(m,lr); m=m[:lre]+'{%- endif -%}'+m[lre:]
m=m.replace('<p class="zdel">Free UK delivery over £100 · Free 14-day returns</p>','<p class="zdel">Free UK delivery over £75 · Free 14-day returns</p>')
# tab panels
panels=[mm.start() for mm in re.finditer(r'<div class="ztp" role="tabpanel"',m)]
def panel_bounds(k): s0=panels[k]; return s0,block_end(m,s0)
P0='''<div class="ztp" role="tabpanel">{{ product.description }}{%- if product.metafields.custom.features.value != blank -%}<ul>{%- for f in product.metafields.custom.features.value -%}<li>{{ f }}</li>{%- endfor -%}</ul>{%- endif -%}</div>'''
P1='''<div class="ztp" role="tabpanel" hidden>{%- assign sg = product.metafields.custom.size_guide.value -%}{%- if sg != blank -%}{%- assign rows = sg | newline_to_br | split: '<br />' -%}<div class="t7-sz"><div class="zsz"><table>{%- for r in rows -%}{%- assign cells = r | strip | split: '|' -%}{%- if forloop.first -%}<thead><tr>{%- for c in cells -%}<th>{{ c | strip }}</th>{%- endfor -%}</tr></thead><tbody>{%- else -%}<tr data-s="{{ cells.first | strip }}">{%- for c in cells -%}<td>{{ c | strip }}</td>{%- endfor -%}</tr>{%- endif -%}{%- endfor -%}</tbody></table></div><p><b>Back length:</b> base of the neck to the base of the tail. <b>Chest:</b> widest part, behind the front legs. <b>Neck:</b> where a collar sits.</p><p>Between sizes? Choose the larger.</p></div>{%- else -%}<p>Each piece is made to the sizes shown when you choose a size. Between sizes? Choose the larger, or <a href="/pages/contact">ask us</a> and we&rsquo;ll help.</p>{%- endif -%}</div>'''
P2='''<div class="ztp" role="tabpanel" hidden><p>Free UK standard delivery on orders over £75, otherwise £4.95. Order by 2pm on a working day and it leaves us the same day.</p><p style="margin-top:8px">Free UK returns within 14 days of delivery. <a href="/pages/delivery">Delivery</a> &middot; <a href="/pages/returns">Returns</a></p></div>'''
P3='''<div class="ztp" role="tabpanel" hidden>{%- assign mc = product.metafields.custom.materials_care.value -%}{%- if mc != blank -%}<ul>{%- assign lines = mc | newline_to_br | split: '<br />' -%}{%- for l in lines -%}<li>{{ l | strip }}</li>{%- endfor -%}</ul>{%- else -%}<p>Care details for this piece are on the label. Questions? <a href="/pages/contact">Ask us</a>.</p>{%- endif -%}</div>'''
a0,_=panel_bounds(0); _,e3=panel_bounds(3)
m=m[:a0]+P0+P1+P2+P3+m[e3:]
# details from the product.metafields.custom.details metaobjects
di=m.index('<div class="yd3-g">'); de=block_end(m,di)
m=m[:di]+'''<div class="yd3-g">{%- for d in product.metafields.custom.details.value -%}<div data-metaobject="product_detail"><span class="im">{%- if d.image.value -%}{{ d.image.value | image_url: width: 900 | image_tag: loading: 'lazy' }}{%- else -%}<img src="'''+BLANK+'''" alt="" class="ah-blank">{%- endif -%}</span><em>{{ forloop.index | prepend: '0' | slice: -2, 2 }}</em><h3>{{ d.title.value }}</h3><p>{{ d.text.value }}</p></div>{%- endfor -%}</div>'''+m[de:]
m=m.replace('<section class="zsec zin yd3 d8" data-source="product.metafields.custom.details">','{%- if product.metafields.custom.details.value != blank -%}<section class="zsec zin yd3 d8">',1)
ye=m.index('</section>',m.index('yd3 d8'))+10; m=m[:ye]+'{%- endif -%}'+m[ye:]
m=m.replace('<h2 class="zh2">Cloud7</h2>','<h2 class="zh2">{{ product.vendor }}</h2>')
m=m.replace('Cloud7 is a Berlin label making coats, beds and accessories for dogs. Every piece is designed to be worn every day and kept for years.','{%- if product.vendor == "Cloud7" -%}Cloud7 is a Berlin label making coats, beds and accessories for dogs. Every piece is designed to be worn every day and kept for years.{%- else -%}Made by makers we know and trust, and lived with at home before it reaches you.{%- endif -%}')
m=m.replace('<a class="zlink" href="#">Shop Cloud7</a>','<a class="zlink" href="{{ product.vendor | url_for_vendor }}">Shop {{ product.vendor }}</a>')
m=liveify(m,['__rel__']).replace("{%- for product in collections['__rel__'].products limit: 4 -%}{%- render 'card', product: product -%}{%- endfor -%}",
  "{%- assign rel = product.collections.first -%}{%- for item in rel.products limit: 5 -%}{%- unless item.id == product.id -%}{%- render 'card', product: item -%}{%- endunless -%}{%- endfor -%}")
m+='\n<script type="application/json" id="ah-product">{{ product | json }}</script>'
section('main-product',m,'Product',head_styles(p))
tpl('product',[('main','main-product')])

# ---------------- cart ----------------
p='signed-off/basket.html'
m=conv(main_of(p))
m=m.replace('<span data-count>(3)</span>','<span data-count>({{ cart.item_count }})</span>')
li=m.index('<div class="v9-lines">'); le=block_end(m,li)
LINE='''<div class="v9-lines">{%- for item in cart.items -%}<div class="v9-line" data-key="{{ item.key }}" data-price="{{ item.final_price | divided_by: 100 }}"><a class="im" href="{{ item.url }}">{%- if item.image -%}{{ item.image | image_url: width: 300 | image_tag: alt: item.product.title }}{%- else -%}<img src="'''+BLANK+'''" alt="{{ item.product.title | escape }}" class="ah-blank">{%- endif -%}</a><div class="tx"><span class="br">{{ item.vendor }}</span><a class="n" href="{{ item.url }}">{{ item.product.title }}</a>{%- unless item.product.has_only_default_variant -%}<span class="v">{%- for o in item.options_with_values -%}{%- if o.name == 'Size' -%}Size {% endif -%}{{ o.value }}{%- unless forloop.last %} · {% endunless -%}{%- endfor -%}</span>{%- endunless -%}{%- if item.variant.inventory_management and item.variant.inventory_quantity < 3 and item.variant.inventory_quantity > 0 -%}<span class="note">Only {{ item.variant.inventory_quantity }} left</span>{%- endif -%}<div class="ctl"><div class="v9-q"><button type="button" data-qd="-1" aria-label="One fewer">−</button><span>{{ item.quantity }}</span><button type="button" data-qd="1" aria-label="One more">+</button></div><button type="button" class="rm" data-rm>Remove</button></div></div><span class="lp" data-lp>{{ item.final_line_price | money_without_trailing_zeros }}</span></div>{%- endfor -%}</div>'''
m=m[:li]+LINE+m[le:]
m=m.replace('<div class="v9-empty" hidden>','<div class="v9-empty"{% if cart.item_count > 0 %} hidden{% endif %}>')
m=m.replace('<dd data-sub>£290</dd>','<dd data-sub>{{ cart.items_subtotal_price | money_without_trailing_zeros }}</dd>')
m=m.replace('<dd data-ship>Free</dd>','<dd data-ship>{% if cart.total_price >= 7500 %}Free{% else %}Calculated at checkout{% endif %}</dd>')
m=m.replace('<b data-total>£290</b>','<b data-total>{{ cart.total_price | money_without_trailing_zeros }}</b>')
m=m.replace('<span data-third>£96.67</span>','<span data-third>{{ cart.total_price | divided_by: 3 | money }}</span>')
m=m.replace('<a class="btn-k v9-co" href="#">Checkout securely</a>','<form action="{{ routes.cart_url }}" method="post"><button type="submit" name="checkout" class="btn-k v9-co" style="width:100%">Checkout securely</button></form>')
m=m.replace('<div class="v9-bkg">','{%- if cart.item_count == 0 -%}<style>.v9-th,.v9-sum{display:none}</style>{%- endif -%}<div class="v9-bkg">',1)
m=liveify(m,['bestsellers'])
section('main-cart',m,'Basket',head_styles(p),('r48',))
tpl('cart',[('main','main-cart')])

# ---------------- search ----------------
p='signed-off/search.html'; pn='signed-off/search-none.html'
m=conv(main_of(p)); n=conv(main_of(pn))
m=m.replace('Results for <i>&ldquo;coat&rdquo;</i>','{%- if search.performed -%}Results for <i>&ldquo;{{ search.terms | escape }}&rdquo;</i>{%- else -%}Search{%- endif -%}')
m=re.sub(r'<form class="sx-f" role="search" data-sform>.*?</form>','<form class="sx-f" role="search" action="{{ routes.search_url }}" method="get"><input type="search" name="q" value="{{ search.terms | escape }}" aria-label="Search again"><input type="hidden" name="type" value="product"><button type="submit">Search again</button></form>',m,count=1,flags=re.S)
TRY=re.search(r'<nav class="cx-sub nr-try".*?</nav>',n,flags=re.S).group(0).replace('href="{{ routes.search_url }}"','href="#"')
TRY=re.sub(r'<a href="#">([^<]+)</a>',lambda mm:f'<a href="{{{{ routes.search_url }}}}?q={mm.group(1).replace(" ","+")}&type=product">{mm.group(1)}</a>',TRY)
sub_i=m.index('<nav class="cx-sub"'); sub_e=m.index('</nav>',sub_i)+6
m=m[:sub_i]+TRY+m[sub_e:]
bar_i=m.index('<div class="cx-bar">'); g=m.index('<div class="cx-grid'); me=block_end(m,m.index('<div class="cx-more">'))
NONE=n[n.index('<div class="nr-none">'):]
NONE=NONE[:block_end(NONE,NONE.index('<div class="nr-like">'))]
NONE=NONE.replace('&ldquo;tartan&rdquo;','&ldquo;{{ search.terms | escape }}&rdquo;')
NONE=liveify(NONE,['bestsellers'])
RES=m[bar_i:g]+'''{%- paginate search.results by 48 -%}<div class="cx-grid">{%- for item in search.results -%}{%- if item.object_type == 'product' -%}{%- render 'card', product: item -%}{%- endif -%}{%- endfor -%}</div><div class="cx-more"><p>Showing {{ search.results.size }} of {{ search.results_count }} results</p>{%- if paginate.next -%}<a class="btn-o" href="{{ paginate.next.url }}" style="margin-top:16px">Load more</a>{%- endif -%}</div>{%- endpaginate -%}'''
m=m[:bar_i]+'{%- if search.performed and search.results_count > 0 -%}'+RES+'{%- else -%}'+NONE+'{%- endif -%}'+m[me:]
section('main-search',m,'Search',head_styles(p),('r48',))
tpl('search',[('main','main-search')])

# ---------------- static pages ----------------
STATIC=[('page.help','signed-off/help.html','Help'),('page.delivery','signed-off/delivery.html','Delivery'),('page.returns','signed-off/returns.html','Returns'),
 ('page.faqs','signed-off/faqs.html','FAQs'),('page.story','signed-off/story.html','Our story'),('page.reviews','signed-off/reviews.html','Reviews'),
 ('page.track-order','pages/track3.html','Track an order'),('page.brands','pages/brands3.html','Brands'),('page.happy-dogs','pages/happy3.html','Happy dogs'),
 ('page.privacy','pages/privacy.html','Privacy policy'),('page.terms','pages/terms.html','Terms'),('page.cookies','pages/cookies.html','Cookie policy'),('page.accessibility','pages/accessibility.html','Accessibility'),
 ('404','signed-off/404.html','Page not found')]
for name,src,title in STATIC:
    sec='page-'+name.split('.')[-1] if name!='404' else 'main-404'
    h=conv(main_of(src)); h=liveify(h,['bestsellers'])
    section(sec,h,title,head_styles(src))
    tpl(name,[('main',sec)])
# contact: the signed-off design with Shopify's contact form
src='signed-off/contact.html'; h=conv(main_of(src))
h=re.sub(r'<form\b[^>]*>','{%- form "contact", class: "v9-form ah-contact" -%}{%- if form.posted_successfully? -%}<p class="ah-ok">Thank you. A real person will reply within one working day.</p>{%- endif -%}{{ form.errors | default_errors }}',h,count=1)
h=h.replace('</form>','{%- endform -%}',1)
for a,b in [('name="name"','name="contact[name]"'),('name="email"','name="contact[email]"'),('name="order"','name="contact[order]"'),('name="topic"','name="contact[topic]"'),('name="message"','name="contact[body]"')]: h=h.replace(a,b)
section('page-contact',h,'Contact',head_styles(src))
tpl('page.contact',[('main','page-contact')])
# any other page: help-page styling with the page's own content
W('sections/main-page.liquid','''<div class="dw lg"><header class="dw-hero"><div class="dw-w"><nav class="dz-crumb" aria-label="Breadcrumb"><a href="{{ routes.root_url }}">Home</a><span>/</span><span aria-current="page">{{ page.title }}</span></nav><h1>{{ page.title }}</h1></div></header>
<div class="dw-body dw-w" style="grid-template-columns:minmax(0,1fr)"><div class="dw-main rte">{{ page.content }}</div></div></div>
{% schema %}{"name":"Page"}{% endschema %}''')
tpl('page',[('main','main-page')])
print('part3 ok')
