#!/usr/bin/env python3
"""Builds the Shopify theme from the website. Run:  python3 shopify.py

Output: shopify-theme/ (the theme folder) and midlands-solar-theme.zip (upload
this in Shopify admin > Online Store > Themes > Add theme > Upload zip file).

How the site maps onto Shopify:
  index.html            -> templates/index.liquid          (the home page)
  about.html etc.       -> templates/page.<name>.liquid    (create a Page and pick this template)
  get-quote.html        -> templates/page.get-quote.liquid (ads landing page, own slim header)
  quote/                -> templates/page.solar-quote.liquid (the live quote tool, own layout)
  nav / footer          -> layout/theme.liquid + snippets
  contact forms         -> Shopify's built-in contact form, so they email the store owner
  assets/img, video,... -> assets/ (Shopify keeps theme assets in one flat folder)

The page wording still lives in site.py: change it there, then run this again."""
import importlib.util, json, os, re, shutil, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "shopify-theme")
ZIP = os.path.join(HERE, "midlands-solar-theme.zip")

spec = importlib.util.spec_from_file_location("mssite", os.path.join(HERE, "site.py"))  # "site" alone is a Python built-in
S = importlib.util.module_from_spec(spec); spec.loader.exec_module(S)

QUOTE_URL = "/pages/solar-quote"
# page file -> (Shopify page handle, page title). Pages must be created with these handles.
PAGES = {"about.html": ("about", "About us"), "work.html": ("work", "Recent work and reviews"), "funding.html": ("funding", "Government funding"),
         "finance.html": ("finance", "Finance options"), "products.html": ("products", "Products"), "commercial.html": ("commercial", "Commercial solar"),
         "agricultural.html": ("agricultural", "Agricultural solar"), "contact.html": ("contact", "Contact us"), "get-quote.html": ("get-quote", "Free online solar quote")}
PAGES["complaints.html"] = ("complaints", "Complaints")
for g in S.GRANTS:
    PAGES[g["file"]] = (g["file"][:-5], g["name"])

# ------------------------------------------------------------------ contact form (Shopify's own)
def form(kind):
    def f(label, name, typ="text", ac="", req=True):
        return (f'<label>{label}<input name="contact[{name}]" type="{typ}"' + (f' autocomplete="{ac}"' if ac else "") + (" required" if req else "") + "></label>")
    rows = f'<div class="row">{f("Name", "name", ac="name")}{f("Phone", "phone", "tel", "tel")}</div>'
    rows += f'<div class="row">{f("Email", "email", "email", "email")}{f("Postcode", "Postcode", ac="postal-code", req=(kind == "callback"))}</div>'
    if kind == "callback":
        rows += '<label>Best time to call<select name="contact[Best time to call]"><option>Any time</option><option>Morning</option><option>Afternoon</option><option>Evening</option></select></label>'
        button = "Call me back"
    else:
        if kind == "survey":
            rows += (f'<div class="row">{f("Business or farm name", "Business", req=False)}<label>Type of site<select name="contact[Type of site]">'
                     '<option>Commercial building</option><option>Farm or rural building</option><option>Other</option></select></label></div>')
            button = "Request a site survey"
        else:
            rows += ('<label>What are you interested in?<select name="contact[Interested in]"><option>Solar panels for my home</option><option>Solar panels and battery storage</option>'
                     '<option>Battery storage only</option><option>Commercial solar</option><option>Agricultural solar</option><option>Servicing or an upgrade</option></select></label>')
            button = "Send message"
        rows += '<label>Message<textarea name="contact[body]"></textarea></label>'
    return ("{% form 'contact', class: 'form' %}"
            "{% if form.posted_successfully? %}<p class=\"msg\" role=\"status\"><strong>Thanks.</strong> We've got your message and will be in touch shortly.</p>{% endif %}"
            "{% if form.errors %}<p class=\"msg\" role=\"alert\">Please check your email address and try again.</p>{% endif %}"
            f'<input type="hidden" name="contact[Form]" value="{kind}">{rows}'
            f'<button class="btn" type="submit">{button} <i>→</i></button>' "{% endform %}")
S.form = form

# ------------------------------------------------------------------ collect the pages site.py builds
bodies = {}
S.page = lambda file, title, desc, body, active="", landing=False: bodies.__setitem__(file, (title, desc, body))
S.build_all()

def liquify(h):
    """Point asset references and page links at their Shopify locations."""
    h = re.sub(r'(src|poster)="(?:\.\./)?assets/(?:img|video)/([^"]+)"', lambda m: f'{m.group(1)}="{{{{ \'{m.group(2).replace("products/", "product-")}\' | asset_url }}}}"', h)
    h = h.replace('href="quote/index.html"', f'href="{QUOTE_URL}"')
    h = re.sub(r'href="(?:\.\./)?index\.html"', 'href="/"', h)
    def link(m):
        handle = PAGES.get(m.group(1) + ".html", (m.group(1),))[0]
        return f'href="/pages/{handle}{m.group(2) or ""}"'
    return re.sub(r'href="([a-z0-9-]+)\.html(#[a-z0-9-]+)?"', link, h)

def write(rel, text):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(text)

if os.path.isdir(OUT):
    shutil.rmtree(OUT)

# ------------------------------------------------------------------ assets (flat)
os.makedirs(os.path.join(OUT, "assets"))
for folder in ("assets/img", "assets/video", "assets/fonts"):
    for f in sorted(os.listdir(os.path.join(HERE, folder))):
        if f.endswith((".jpg", ".png", ".mp4", ".woff2")) and not re.match(r"(design|mosaic)-\d", f):
            shutil.copy(os.path.join(HERE, folder, f), os.path.join(OUT, "assets", f))
prod_dir = os.path.join(HERE, "assets/img/products")
if os.path.isdir(prod_dir):
    for f in os.listdir(prod_dir):
        shutil.copy(os.path.join(prod_dir, f), os.path.join(OUT, "assets", "product-" + f))
shutil.copy(os.path.join(HERE, "assets/css/ms.css"), os.path.join(OUT, "assets/ms.css"))
shutil.copy(os.path.join(HERE, "assets/js/ms.js"), os.path.join(OUT, "assets/ms.js"))
shutil.copy(os.path.join(HERE, "quote/solar.css"), os.path.join(OUT, "assets/solar.css"))
shutil.copy(os.path.join(HERE, "quote/solar.js"), os.path.join(OUT, "assets/solar.js"))
shutil.copy(os.path.join(HERE, "quote/config.js"), os.path.join(OUT, "assets/solar-config.js"))

FONTS = "".join(f"@font-face{{font-family:'{fam}';src:url('{{{{ '{slug}-{w}.woff2' | asset_url }}}}') format('woff2');font-weight:{w};font-style:normal;font-display:swap}}"
                for fam, slug, ws in (("Clash Display", "clash-display", (500, 600, 700)), ("Satoshi", "satoshi", (400, 500, 700))) for w in ws)
HEAD = '''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ page_title }}{% unless page_title contains shop.name %} | {{ shop.name }}{% endunless %}</title>
{% if page_description %}<meta name="description" content="{{ page_description | escape }}">{% endif %}
<link rel="canonical" href="{{ canonical_url }}">
<link rel="icon" href="{{ 'sun-mark.png' | asset_url }}">
<style>''' + FONTS + '''</style>
'''
SCRIPTS = '''<script>window.MS_BASE = {{ 'ms.js' | asset_url | split: 'ms.js' | first | json }}; window.MS_QUOTE = "''' + QUOTE_URL + '''";</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
{{ 'ms.js' | asset_url | script_tag }}
'''
LOADER = '''<div class="cursor" id="cursor"></div>
<div class="loader" id="loader"><div><img src="{{ 'sun-mark.png' | asset_url }}" alt=""><span id="loadN">000</span></div></div>
'''
PHONE = f'<a class="tel" href="{S.PHONE_HREF}">{S.PHONE}</a>'
CTA = f'<a class="btn" href="{QUOTE_URL}">Get my quote <i>→</i></a>'
nav_items = [(PAGES[h][0], t) for h, t in S.NAV]
links = "".join("<li><a href=\"/pages/%s\"{%% if page.handle == '%s' %%} aria-current=\"page\"{%% endif %%}>%s</a></li>" % (h, h, t) for h, t in nav_items)

write("snippets/ms-nav.liquid", f'''<header class="nav" id="nav"><a class="logo" href="/" aria-label="Midlands Solar home"><img src="{{{{ 'logo-light.png' | asset_url }}}}" alt="Midlands Solar"></a>
<ul>{links}</ul>{PHONE}{CTA}<button class="burger" id="burger" aria-label="Menu"></button></header>
<nav class="menu" id="menu">{"".join(f'<a href="/pages/{h}">{t}</a>' for h, t in nav_items)}{CTA}{PHONE}</nav>
''')
write("snippets/ms-footer.liquid", f'''<footer class="foot"><div class="foot-cols">
<div><img src="{{{{ 'logo-light.png' | asset_url }}}}" alt="Midlands Solar"><p>Solar panels and battery storage for homes, businesses and farms across the Midlands.</p></div>
<div><h4>Solar</h4><ul><li><a href="{QUOTE_URL}">Get my quote</a></li><li><a href="/pages/products">Products</a></li><li><a href="/pages/work">Our work</a></li><li><a href="/pages/commercial">Commercial</a></li><li><a href="/pages/agricultural">Agricultural</a></li></ul></div>
<div><h4>Paying</h4><ul><li><a href="/pages/funding">Government funding</a></li><li><a href="/pages/finance">Finance options</a></li><li><a href="/pages/about">About us</a></li></ul></div>
<div><h4>Talk to us</h4><ul><li><a href="{S.PHONE_HREF}">{S.PHONE}</a></li><li><a href="{S.MOBILE_HREF}">{S.MOBILE}</a></li><li><a href="mailto:{S.EMAIL}">{S.EMAIL}</a></li><li><a href="/pages/contact">Contact us</a></li></ul></div>
</div><div class="foot-word" aria-hidden="true">Midlands Solar</div><div class="foot-base"><span>© Midlands Solar Installations Ltd</span><span><a href="/pages/complaints">Complaints</a> · MCS certified installer</span></div></footer>
''')

# ------------------------------------------------------------------ layouts
write("layout/theme.liquid", f'''<!doctype html>
<html lang="{{{{ request.locale.iso_code | default: 'en-GB' }}}}">
<head>
{HEAD}{{{{ 'ms.css' | asset_url | stylesheet_tag }}}}
{{{{ content_for_header }}}}
</head>
<body class="template-{{{{ template.name }}}}">
{LOADER}{{% render 'ms-nav' %}}
<main id="top">
{{{{ content_for_layout }}}}
</main>
{{% render 'ms-footer' %}}
{SCRIPTS}</body>
</html>
''')
# ads landing page: logo and phone only, no menu, kept out of search engines
write("layout/landing.liquid", f'''<!doctype html>
<html lang="en-GB">
<head>
{HEAD}<meta name="robots" content="noindex,nofollow">
{{{{ 'ms.css' | asset_url | stylesheet_tag }}}}
{{{{ content_for_header }}}}
</head>
<body class="template-landing">
{LOADER}<header class="nav min" id="nav"><a class="logo" href="#top"><img src="{{{{ 'logo-light.png' | asset_url }}}}" alt="Midlands Solar"></a>{PHONE}</header>
<main id="top">
{{{{ content_for_layout }}}}
</main>
<footer class="foot"><div class="foot-base" style="margin:0"><span>© Midlands Solar Installations Ltd · MCS certified installer · <a href="/pages/complaints">Complaints</a></span><span><a href="{S.PHONE_HREF}">{S.PHONE}</a> · <a href="mailto:{S.EMAIL}">{S.EMAIL}</a></span></div></footer>
{SCRIPTS}</body>
</html>
''')
# the quote tool is a full-screen app with its own styles and scripts
write("layout/quote.liquid", f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Solar quote | {{{{ shop.name }}}}</title>
<link rel="icon" href="{{{{ 'sun-mark.png' | asset_url }}}}">
<style>{FONTS}</style>
{{{{ 'solar.css' | asset_url | stylesheet_tag }}}}
{{{{ content_for_header }}}}
</head>
<body>
{{{{ content_for_layout }}}}
{{{{ 'solar-config.js' | asset_url | script_tag }}}}
<script>
  // Theme-specific settings layered over solar-config.js
  (function (C) {{
    C.heroPhoto = {{{{ 'home-drone-1.jpg' | asset_url | json }}}};
    C.bookCallPhoto = {{{{ 'home-1.jpg' | asset_url | json }}}};
    C.leadEndpoint = "shopify";   // bookings go through the store's contact form, so they arrive by email
    {{% assign fn = settings.functions_site | default: '' | remove: ' ' %}}{{% if fn != '' %}}{{% assign fn = fn | append: '/.netlify/functions/' | replace: '//.netlify', '/.netlify' %}}{{% endif %}}
    C.aiEndpoint = {{% if fn != '' %}}{{{{ fn | append: 'map-house' | json }}}}{{% else %}}""{{% endif %}};       // AI roof mapping
    C.bookingEndpoint = {{% if fn != '' %}}{{{{ fn | append: 'slots' | json }}}}{{% else %}}""{{% endif %}};  // taken call slots
    {{% if settings.google_key != blank %}}C.googleApiKey = {{{{ settings.google_key | json }}}};{{% endif %}}
    {{% if settings.ideal_key != blank %}}C.idealPostcodesKey = {{{{ settings.ideal_key | json }}}};{{% endif %}}
  }})(window.SOLAR_CONFIG);
</script>
{{{{ 'solar.js' | asset_url | script_tag }}}}
</body>
</html>
''')
write("layout/password.liquid", f'''<!doctype html>
<html lang="en-GB">
<head>
{HEAD}{{{{ 'ms.css' | asset_url | stylesheet_tag }}}}
{{{{ content_for_header }}}}
</head>
<body>
<main>{{{{ content_for_layout }}}}</main>
</body>
</html>
''')

# ------------------------------------------------------------------ templates
write("templates/index.liquid", liquify(bodies["index.html"][2]) + "\n")
for file, (handle, title) in PAGES.items():
    layout = "{% layout 'landing' %}\n" if file == "get-quote.html" else ""
    write(f"templates/page.{handle}.liquid", layout + liquify(bodies[file][2]) + "\n")

q = open(os.path.join(HERE, "quote/index.html")).read()
q = q[q.index("<body>") + 6:q.index('<script src="config.js">')]
# A real Shopify contact form, filled in and submitted by the quote tool when a call is booked,
# so the booking passes Shopify's spam check and arrives in the store's inbox.
BOOKING_FORM = ("{% form 'contact', id: 'shopifyBooking', style: 'display:none' %}"
                '<input type="hidden" name="return_to" value="/pages/solar-quote?booked=1">{% endform %}')
write("templates/page.solar-quote.liquid", "{% layout 'quote' %}\n" + liquify(q).strip() + "\n" + BOOKING_FORM + "\n")

PLAIN = '''<section class="scr {skin}" style="min-height:70svh">
  <p class="lab"><i></i>{label}</p>
  <h1 style="font-size:clamp(38px,5vw,84px);line-height:1;margin-bottom:24px">{title}</h1>
  <div class="sub" style="max-width:70ch">{content}</div>
</section>
'''
write("templates/page.liquid", PLAIN.format(skin="blk", label="Midlands Solar", title="{{ page.title }}", content="{{ page.content }}"))
write("templates/404.liquid", PLAIN.format(skin="blk", label="Page not found", title="That page isn't here.",
      content=f'<p>It may have moved.</p><p style="margin-top:24px"><a class="btn" href="/">Back to the home page <i>→</i></a></p>'))
# This is a lead-generation site, not a shop. These keep Shopify's standard addresses from showing an error.
for name, title, content in [
        ("product", "{{ product.title }}", "{{ product.description }}"), ("collection", "{{ collection.title }}", "{{ collection.description }}"),
        ("list-collections", "Products", f'<p>See what we fit on the <a class="tl" href="/pages/products">products page</a>.</p>'),
        ("cart", "Nothing to buy online", f'<p>We price every system to the roof. <a class="tl" href="{QUOTE_URL}">Get your quote</a>.</p>'),
        ("search", "Search", '<form action="{{ routes.search_url }}" method="get" class="pc" style="margin-bottom:24px"><input name="q" value="{{ search.terms | escape }}" placeholder="Search"><button class="btn" type="submit">Search</button></form>'
                             '{% if search.performed %}{% for item in search.results %}<p><a class="tl" href="{{ item.url }}">{{ item.title }}</a></p>{% else %}<p>No results.</p>{% endfor %}{% endif %}'),
        ("blog", "{{ blog.title }}", '{% for article in blog.articles %}<p><a class="tl" href="{{ article.url }}">{{ article.title }}</a></p>{% endfor %}'),
        ("article", "{{ article.title }}", "{{ article.content }}")]:
    write(f"templates/{name}.liquid", PLAIN.format(skin="blk", label="Midlands Solar", title=title, content=content))
write("templates/password.liquid", '''{% layout 'password' %}
<section class="scr end blk"><h2>Opening soon.</h2><p>{{ shop.password_message | default: 'Our new website is on its way.' }}</p>
{% form 'storefront_password', class: 'pc' %}<input type="password" name="password" placeholder="Password" autocomplete="current-password"><button class="btn" type="submit">Enter</button>{% endform %}
</section>
''')
write("templates/gift_card.liquid", "{% layout none %}<!doctype html><title>Gift card</title><p>{{ gift_card.code | format_code }}</p>\n")

# ------------------------------------------------------------------ config and locales
write("config/settings_schema.json", json.dumps([
    {"name": "theme_info", "theme_name": "Midlands Solar", "theme_version": "1.0.0", "theme_author": "Midlands Solar",
     "theme_documentation_url": "https://www.midlandssolar.co.uk", "theme_support_url": "https://www.midlandssolar.co.uk"},
    {"name": "Solar quote tool", "settings": [
        {"type": "paragraph", "content": "Leave the two keys blank to use the ones built into the theme."},
        {"type": "text", "id": "google_key", "label": "Google Maps / Solar API key"},
        {"type": "text", "id": "ideal_key", "label": "Ideal Postcodes key"},
        {"type": "text", "id": "functions_site", "label": "Netlify site address", "info": "e.g. https://midlands-solar.netlify.app. Runs the AI roof mapping and remembers booked call slots. Blank = both off."}]}], indent=2) + "\n")
write("config/settings_data.json", json.dumps({"current": {}}, indent=2) + "\n")
write("locales/en.default.json", "{}\n")
for d in ("sections", "snippets"):
    os.makedirs(os.path.join(OUT, d), exist_ok=True)
write("sections/placeholder.liquid", "{% comment %}This theme's pages are built as templates; no editable sections yet.{% endcomment %}\n")

# ------------------------------------------------------------------ zip
if os.path.exists(ZIP):
    os.remove(ZIP)
with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, fs in os.walk(OUT):
        for f in sorted(fs):
            p = os.path.join(root, f)
            z.write(p, os.path.relpath(p, OUT), compress_type=zipfile.ZIP_STORED if f.endswith((".mp4", ".jpg", ".png", ".woff2")) else zipfile.ZIP_DEFLATED)
n = sum(len(fs) for _, _, fs in os.walk(OUT))
print(f"theme: {n} files, zip {os.path.getsize(ZIP) / 1048576:.1f} MB")
print("pages to create (handle -> template):")
for file, (handle, title) in PAGES.items():
    print(f"  {handle:34} page.{handle}   ({title})")
print(f"  {'solar-quote':34} page.solar-quote   (Solar quote)")
