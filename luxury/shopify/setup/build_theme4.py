from build_theme import *

def acc(path):
    h=conv(main_of(path)).replace(' data-acform','')
    return h
NAV='''<nav class="ss-pnav" aria-label="Account"><a href="{{ routes.account_url }}"{% if template.name == 'customers/account' %} aria-current="page"{% endif %}>Overview</a><a href="{{ routes.account_url }}#orders">Orders</a><a href="{{ routes.account_addresses_url }}"{% if template.name == 'customers/addresses' %} aria-current="page"{% endif %}>Addresses</a><a href="{{ routes.account_logout_url }}">Sign out</a></nav>'''
def fix_nav(h): return re.sub(r'<nav class="ss-pnav".*?</nav>',NAV,h,count=1,flags=re.S)
ERR='{{ form.errors | default_errors }}'
# login (with the forgotten-password form on the same page, as Shopify expects)
h=acc('pages/acs-signin.html')
h=re.sub(r'<form\b[^>]*>',"{%- form 'customer_login', class: 'v9-form ac-form', novalidate: 'novalidate' -%}"+ERR,h,count=1).replace('</form>','{%- endform -%}',1)
h=h.replace('name="email"','name="customer[email]"').replace('name="password"','name="customer[password]"')
h=re.sub(r'<a class="ac-forgot" href="[^"]*">','<a class="ac-forgot" href="#recover">',h)
f=acc('pages/acs-forgot.html')
fi=f.index('<div class="card">'); fe=block_end(f,fi); card=f[fi:fe]
card=re.sub(r'<form\b[^>]*>',"{%- form 'recover_customer_password', class: 'v9-form ac-form' -%}"+ERR+"{%- if form.posted_successfully? -%}<p class=\"ah-ok\">We&rsquo;ve emailed you a link to reset your password.</p>{%- endif -%}",card,count=1).replace('</form>','{%- endform -%}',1)
card=card.replace('name="email"','name="email"').replace('href="{{ routes.account_url }}"','href="#login"')
h=h.replace('<section class="ss-auth">','<section class="ss-auth" id="login">',1)
h=h.replace('</section></div>','</section><section class="ss-auth" id="recover">'+card+'</section></div>',1)
h+='<style>#recover{display:none}#recover:target{display:block}#recover:target ~ #login,#login:has(~ #recover:target){display:none}</style>'
section('main-login',h,'Sign in'); tpl('customers/login',[('main','main-login')])
# register
h=acc('pages/acs-register.html')
h=re.sub(r'<form\b[^>]*>',"{%- form 'create_customer', class: 'v9-form ac-form' -%}"+ERR,h,count=1).replace('</form>','{%- endform -%}',1)
for a,b in [('name="first"','name="customer[first_name]"'),('name="last"','name="customer[last_name]"'),('name="email"','name="customer[email]"'),('name="password"','name="customer[password]"'),('name="news"','name="customer[accepts_marketing]"')]: h=h.replace(a,b)
section('main-register',h,'Create account'); tpl('customers/register',[('main','main-register')])
# reset and activate
for nm,frm,title in [('reset_password','reset_customer_password','Reset password'),('activate_account','activate_customer_password','Activate account')]:
    h=acc('pages/acs-reset.html')
    h=re.sub(r'<form\b[^>]*>',f"{{%- form '{frm}', class: 'v9-form ac-form' -%}}"+ERR,h,count=1).replace('</form>','{%- endform -%}',1)
    h=h.replace('name="password"','name="customer[password]"').replace('name="confirm"','name="customer[password_confirmation]"')
    if nm=='activate_account': h=h.replace('Reset your password','Activate your account').replace('Choose a new password for your account.','Choose a password to finish setting up your account.').replace('>Reset password<','>Activate account<')
    section('main-'+nm.replace('_','-'),h,title); tpl('customers/'+nm,[('main','main-'+nm.replace('_','-'))])
# account overview: orders and default address
h=fix_nav(acc('pages/acs-overview.html'))
h=re.sub(r'Hello, <i>[^<]*</i>','Hello, <i>{{ customer.first_name | default: "there" }}</i>',h)
oi=h.index('<div class="ac-orders">'); oe=block_end(h,oi)
ORD='''<div class="ac-orders" id="orders">{%- paginate customer.orders by 20 -%}{%- for order in customer.orders -%}<a class="ac-o" href="{{ order.customer_url }}"><span class="im">{%- if order.line_items.first.image -%}{{ order.line_items.first.image | image_url: width: 200 | image_tag }}{%- else -%}<img src="'''+BLANK+'''" alt="" class="ah-blank">{%- endif -%}</span><span class="n"><b>{{ order.name }}</b><em>{{ order.created_at | date: '%-d %b %Y' }} · {{ order.item_count }} {{ order.item_count | pluralize: 'item', 'items' }}</em></span><span class="s">{{ order.fulfillment_status_label }}</span><span class="p">{{ order.total_price | money_without_trailing_zeros }}</span><span class="zlink">View</span></a>{%- else -%}<p class="ss-lead">You haven&rsquo;t placed any orders yet.</p>{%- endfor -%}{%- endpaginate -%}</div>'''
h=h[:oi]+ORD+h[oe:]
if '<div class="ss-addr">' in h:
    ai=h.index('<div class="ss-addr">'); ae=block_end(h,ai)
    h=h[:ai]+'''<div class="ss-addr">{%- if customer.default_address -%}<div class="a def"><span class="ss-kick">Default</span><p>{{ customer.default_address | format_address }}</p><div class="ac-ln"><a href="{{ routes.account_addresses_url }}">Manage addresses</a></div></div>{%- else -%}<p class="ss-lead"><a href="{{ routes.account_addresses_url }}">Add an address</a></p>{%- endif -%}</div>'''+h[ae:]
section('main-account',h,'Account'); tpl('customers/account',[('main','main-account')])
# a single order
h=fix_nav(acc('pages/acs-order.html'))
h=re.sub(r'<span>Order #AH1042</span>','<span>Order {{ order.name }}</span>',h)
h=re.sub(r'<h1 class="ss-h1">Order #AH1042</h1>','<h1 class="ss-h1">Order {{ order.name }}</h1>',h)
h=re.sub(r'<p class=ss-lead>Placed [^<]*</p>','<p class=ss-lead>Placed {{ order.created_at | date: "%-d %B %Y" }} · {{ order.total_price | money_without_trailing_zeros }}</p>',h)
h=re.sub(r'<span class="ss-kick">Royal Mail[^<]*</span><h3 class="ss-h3">[^<]*</h3>','<span class="ss-kick">{%- for f in order.fulfillments -%}{{ f.tracking_company }} {{ f.tracking_number }}{%- endfor -%}</span><h3 class="ss-h3">{{ order.fulfillment_status_label }}</h3>',h)
h=re.sub(r'<ol class="tk-bar".*?</ol>','',h,flags=re.S)
ii=h.index('<div class="tk-items">'); ie=block_end(h,ii)
h=h[:ii]+'''<div class="tk-items">{%- for li in order.line_items -%}<div class="it"><span class="im">{%- if li.image -%}{{ li.image | image_url: width: 200 | image_tag }}{%- else -%}<img src="'''+BLANK+'''" alt="" class="ah-blank">{%- endif -%}</span><span><b>{{ li.product.title | default: li.title }}</b><em>{{ li.variant_title }} · Qty {{ li.quantity }}</em></span><span class="p">{{ li.final_line_price | money_without_trailing_zeros }}</span></div>{%- endfor -%}</div>'''+h[ie:]
h=re.sub(r'<a class="btn-k" href="[^"]*">Track parcel</a>','{%- for f in order.fulfillments -%}{%- if f.tracking_url -%}<a class="btn-k" href="{{ f.tracking_url }}">Track parcel</a>{%- endif -%}{%- endfor -%}',h)
section('main-order',h,'Order'); tpl('customers/order',[('main','main-order')])
# addresses
h=fix_nav(acc('pages/acs-addresses.html'))
ai=h.index('<div class="ss-addr">'); ae=block_end(h,ai)
h=h[:ai]+'''<div class="ss-addr">{%- for address in customer.addresses -%}<div class="a{% if address == customer.default_address %} def{% endif %}"><span class="ss-kick">{%- if address == customer.default_address -%}Default{%- else -%}Address{%- endif -%}</span><p>{{ address | format_address }}</p><div class="ac-ln"><a href="{{ routes.account_addresses_url }}?edit={{ address.id }}#new">Edit</a>{%- form 'customer_address', address, style: 'display:inline' -%}<input type="hidden" name="_method" value="delete"><button type="submit" class="zlink" style="background:none;border:0;padding:0;cursor:pointer">Remove</button>{%- endform -%}</div></div>{%- endfor -%}</div>'''+h[ae:]
fi=h.index('<form'); fe=h.index('</form>',fi)+7
FORM='''{%- form 'customer_address', customer.new_address, class: 'v9-form ac-form', id: 'new' -%}'''+ERR+'''<div class="two"><label class="f"><span>First name</span><input class="v9-in" name="address[first_name]" required></label><label class="f"><span>Last name</span><input class="v9-in" name="address[last_name]" required></label></div><label class="f"><span>Address line 1</span><input class="v9-in" name="address[address1]" autocomplete="address-line1" required></label><label class="f"><span>Address line 2 (optional)</span><input class="v9-in" name="address[address2]" autocomplete="address-line2"></label><div class="two"><label class="f"><span>Town or city</span><input class="v9-in" name="address[city]" required></label><label class="f"><span>Postcode</span><input class="v9-in" name="address[zip]" required></label></div><input type="hidden" name="address[country]" value="United Kingdom"><label class="f"><span>Phone (optional)</span><input class="v9-in" type="tel" name="address[phone]"></label><label class="ac-check"><input type="checkbox" name="address[default]" value="1"><span>Make this my default address</span></label><button type="submit" class="btn-k">Save address</button>{%- endform -%}'''
h=h[:fi]+FORM+h[fe:]
section('main-addresses',h,'Addresses'); tpl('customers/addresses',[('main','main-addresses')])

# gift card (a standalone page)
W('templates/gift_card.liquid','''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Your {{ gift_card.initial_value | money_without_trailing_zeros }} gift card · {{ shop.name }}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500&family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
<style>body{margin:0;font-family:Jost,Helvetica,Arial,sans-serif;color:#111;background:#fff;text-align:center;padding:48px 20px}.w{max-width:520px;margin:0 auto}.logo{font-family:"Cormorant Garamond",Georgia,serif;font-size:32px}.card{background:#111;color:#fff;padding:48px 20px;margin:32px 0}.card .v{font-family:"Cormorant Garamond",Georgia,serif;font-size:64px;line-height:1;margin:16px 0}.k{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#bbb}.code{border:1px dashed #111;padding:18px;font-family:"Cormorant Garamond",Georgia,serif;font-size:28px;letter-spacing:3px;margin-top:20px}.btn{display:inline-block;margin-top:24px;background:#111;color:#fff;padding:16px 32px;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none}p{color:#5c5c5c;line-height:1.7}</style>{{ content_for_header }}</head>
<body><div class="w"><div class="logo">Axel &amp; Hound</div><div class="card"><div class="k">Gift card</div><div class="v">{{ gift_card.balance | money_without_trailing_zeros }}</div>{%- if gift_card.expired -%}<div class="k">Expired</div>{%- endif -%}</div>
<p>Use this code at checkout.</p><div class="code">{{ gift_card.code | format_code }}</div><a class="btn" href="{{ shop.url }}">Start shopping</a></div></body></html>''')

# password page while the store is closed
W('layout/password.liquid','''<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{ shop.name }}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Jost:wght@400;500;600&display=swap" rel="stylesheet">
<style>body{margin:0;font-family:Jost,Helvetica,Arial,sans-serif;color:#111;background:#fff}.pw{min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px}.logo{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(48px,8vw,104px);line-height:1}.pw p{color:#5c5c5c;font-size:16px;line-height:1.7;max-width:460px;margin:18px auto 0}.pw i{font-family:"Cormorant Garamond",Georgia,serif;font-size:22px;color:#111}form{display:flex;gap:8px;max-width:440px;width:100%;margin:28px auto 0}input{flex:1;min-width:0;height:48px;border:1px solid #cfcfcf;padding:0 14px;font:inherit}button{height:48px;padding:0 22px;background:#111;color:#fff;border:0;font-size:11.5px;font-weight:600;letter-spacing:2px;text-transform:uppercase;cursor:pointer}.own{margin-top:40px;font-size:12px}.own a{color:#5c5c5c}</style>
{{ content_for_header }}</head><body>{{ content_for_layout }}</body></html>''')
W('sections/main-password.liquid','''<div class="pw"><div class="logo">Axel &amp; Hound</div><p><i>Beautiful things for dogs, and the homes they share.</i></p><p>{{ shop.password_message | default: "We&rsquo;re opening soon. Leave your email and we&rsquo;ll tell you first, with 10% off your first order." }}</p>
{%- form 'customer' -%}<input type="hidden" name="contact[tags]" value="newsletter,prelaunch"><input type="email" name="contact[email]" placeholder="Your email address" aria-label="Email address" required><button type="submit">Notify me</button>{%- endform -%}
{%- if form.posted_successfully? -%}<p>Thank you. We&rsquo;ll be in touch.</p>{%- endif -%}
<details class="own"><summary>Store owner? Enter the password</summary>{%- form 'storefront_password' -%}<input type="password" name="password" placeholder="Password" aria-label="Password"><button type="submit">Enter</button>{%- endform -%}</details></div>
{% schema %}{"name":"Password"}{% endschema %}''')
W('templates/password.json',json.dumps({'layout':'password','sections':{'main':{'type':'main-password'}},'order':['main']},indent=2))

# journal (blog) basics in the help-page style
W('sections/main-blog.liquid','''<div class="dw"><header class="dw-hero"><div class="dw-w"><h1>{{ blog.title }}</h1></div></header><div class="dw-w" style="padding-top:40px;padding-bottom:72px">{%- paginate blog.articles by 12 -%}<div class="cx-grid">{%- for article in blog.articles -%}<a class="pcd" href="{{ article.url }}"><span class="im">{%- if article.image -%}{{ article.image | image_url: width: 900 | image_tag: loading: 'lazy' }}{%- else -%}<img src="'''+BLANK+'''" alt="" class="ah-blank">{%- endif -%}</span><span class="br">{{ article.published_at | date: '%-d %B %Y' }}</span><span class="pn">{{ article.title }}</span></a>{%- endfor -%}</div>{%- endpaginate -%}</div></div>
{% schema %}{"name":"Journal"}{% endschema %}''')
W('sections/main-article.liquid','''<article class="dw"><header class="dw-hero"><div class="dw-w"><nav class="dz-crumb"><a href="{{ blog.url }}">{{ blog.title }}</a></nav><h1>{{ article.title }}</h1><p>{{ article.published_at | date: '%-d %B %Y' }}</p></div></header><div class="dw-body dw-w" style="grid-template-columns:minmax(0,1fr)"><div class="dw-main rte">{{ article.content }}</div></div></article>
{% schema %}{"name":"Article"}{% endschema %}''')
tpl('blog',[('main','main-blog')]); tpl('article',[('main','main-article')])

# ---------------- config and locales ----------------
W('config/settings_schema.json',json.dumps([{'name':'theme_info','theme_name':'Axel & Hound','theme_version':'1.0.0','theme_author':'Axel & Hound','theme_documentation_url':'https://www.axelandhound.com','theme_support_url':'https://www.axelandhound.com/pages/contact'}],indent=2))
W('config/settings_data.json',json.dumps({'current':{}},indent=2))
W('locales/en.default.json',json.dumps({'general':{'password_page':{'login_form_heading':'Enter store using password'}}},indent=2))
print('part4 ok')
