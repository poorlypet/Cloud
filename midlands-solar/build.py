#!/usr/bin/env python3
"""Builds the static Midlands Solar site into this folder.

Every page shares one header, footer and call-to-action, so they live here
once. Run:  python3 build.py
"""
import os, html

ROOT = os.path.dirname(os.path.abspath(__file__))
PHONE = "0800 654 6343"
PHONE_HREF = "tel:08006546343"
MOBILE = "07599 965 786"
EMAIL = "enquiries@midlandssolar.co.uk"
FORM_ENDPOINT = ""   # e.g. a Formspree URL; empty = forms show a "not connected" notice

NAV = [("work.html", "Recent work"), ("products.html", "Products"), ("funding.html", "Funding"),
       ("finance.html", "Finance"), ("commercial.html", "Business"), ("about.html", "About"), ("contact.html", "Contact")]


def head(title, desc, p="", noindex=False):
    return f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
{'<meta name="robots" content="noindex,nofollow">' if noindex else ''}
<link rel="icon" href="{p}assets/img/sun-mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,500..900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{p}assets/css/site.css">
</head>
<body>
"""


def header(active="", p="", solid=False):
    cur = ' aria-current="page"'
    links = "".join(f'<a href="{p}{h}"{cur if h == active else ""}>{t}</a>' for h, t in NAV)
    drawer = "".join(f'<a href="{p}{h}">{t}</a>' for h, t in NAV)
    return f"""<header class="site-head"{' data-solid' if solid else ''}>
  <div class="wrap">
    <a class="logo" href="{p}index.html" aria-label="Midlands Solar Installations home">
      <img class="lt" src="{p}assets/img/logo-light.png" alt="Midlands Solar Installations Ltd" width="900" height="429">
      <img class="dk" src="{p}assets/img/logo-dark.png" alt="" width="900" height="429">
    </a>
    <nav aria-label="Main">{links}</nav>
    <a class="tel" href="{PHONE_HREF}">{PHONE}</a>
    <a class="btn sm" href="{p}quote/index.html">Get my solar quote</a>
    <button class="burger" aria-label="Menu" aria-expanded="false"></button>
  </div>
</header>
<div class="drawer">{drawer}<a class="btn" href="{p}quote/index.html">Get my solar quote <i>&rarr;</i></a></div>
"""


def pcbar(p="", light=False, label="Get my quote"):
    return f"""<form class="pc{' on-light' if light else ''}" data-quote="{p}quote/index.html" novalidate>
  <label class="sr" for="pc{id(label) % 9999}">Your postcode</label>
  <input id="pc{id(label) % 9999}" name="postcode" autocomplete="postal-code" placeholder="Enter your postcode" maxlength="9">
  <button class="btn" type="submit"><span>{label}</span> <i>&rarr;</i></button>
</form>"""


PC_NOTE = """<ul class="pc-note"><li>Free, no obligation</li><li>No home visit needed for a quote</li><li>0% VAT on home solar</li></ul>"""


def cta(p="", h="See your roof with solar on it.", sub="Enter your postcode. We measure your roof from above, place the panels and show your price in about a minute."):
    return f"""<section class="section tight"><div class="wrap">
  <div class="cta" data-reveal>
    <img class="sun" src="{p}assets/img/sun-mark.png" alt="">
    <span class="eyebrow" style="color:#C9C9C4">Free solar quote</span>
    <h2>{h}</h2>
    <p class="lede" style="color:#C9C9C4">{sub}</p>
    {pcbar(p)}
    {PC_NOTE}
  </div>
</div></section>
"""


def footer(p=""):
    return f"""<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <img src="{p}assets/img/logo-light.png" alt="Midlands Solar Installations Ltd" width="900" height="429">
        <p>Solar panels, battery storage and EV charging for homes, businesses and farms across the Midlands.</p>
      </div>
      <div><h4>Solar</h4><ul>
        <li><a href="{p}quote/index.html">Solar quote</a></li><li><a href="{p}products.html">Products we fit</a></li>
        <li><a href="{p}work.html">Recent work and reviews</a></li><li><a href="{p}funding.html">Government funding</a></li>
        <li><a href="{p}finance.html">Finance options</a></li></ul></div>
      <div><h4>Business</h4><ul>
        <li><a href="{p}commercial.html">Commercial solar</a></li><li><a href="{p}agricultural.html">Agricultural solar</a></li>
        <li><a href="{p}about.html">About us</a></li><li><a href="{p}contact.html">Contact us</a></li></ul></div>
      <div><h4>Talk to us</h4><ul>
        <li><a href="{PHONE_HREF}">{PHONE}</a></li><li><a href="tel:{MOBILE.replace(' ', '')}">{MOBILE}</a></li>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li></ul></div>
    </div>
    <div class="foot-base"><span>&copy; 2026 Midlands Solar Installations Ltd. All rights reserved.</span><span>Serving the Midlands and surrounding areas</span></div>
  </div>
</footer>
<script src="{p}assets/js/site.js"></script>
</body>
</html>
"""


def phero(eyebrow, h1, lede, bg=None, p=""):
    if bg:
        return f"""<section class="phero photo"><div class="bg" data-parallax="50" style="background-image:url({p}assets/img/{bg})"></div>
  <div class="wrap"><span class="eyebrow fade-in" style="animation-delay:.1s">{eyebrow}</span><h1>{words(h1)}</h1><p class="lede fade-in">{lede}</p></div></section>
"""
    return f"""<section class="phero"><img class="sun" src="{p}assets/img/sun-mark.png" alt="">
  <div class="wrap"><span class="eyebrow fade-in" style="animation-delay:.1s">{eyebrow}</span><h1>{words(h1)}</h1><p class="lede fade-in">{lede}</p></div></section>
"""


def words(text):
    """Wrap each word so the headline rises in word by word. *word* = orange."""
    out, i = [], 0
    for w in text.split(" "):
        cls = ""
        if w.startswith("*"):
            w, cls = w.strip("*"), ' class="o"'
        out.append(f'<span class="word"><span{cls} style="animation-delay:{i * 60}ms">{w}</span></span>')
        i += 1
    return " ".join(out)


def quote(text, name, where):
    ini = "".join(x[0] for x in name.replace(".", "").split())
    return f"""<blockquote class="quote" data-reveal><div class="stars" aria-label="5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
  <p>&ldquo;{text}&rdquo;</p><footer><span class="av">{ini}</span><span><b>{name}</b>{where}</span></footer></blockquote>"""


REVIEWS = [
    ("The installation was quick, tidy and hassle-free. We're already seeing the benefits on our energy bills.", "Emily R.", "Homeowner, Birmingham"),
    ("From quote to completion, everything was simple. The system looks great and performs even better.", "James M.", "Homeowner, Solihull"),
    ("A brilliant team to work with. Professional, knowledgeable and always on hand to help.", "David L.", "Business owner, Coventry"),
    ("Solar has transformed the way we power our farm. It's efficient, reliable and future-proof.", "Tom P.", "Farmer, Warwickshire"),
]

FAQ_HOME = [
    ("How much do solar panels cost?", "It depends on your roof, how many panels fit and whether you add a battery. The online quote measures your actual roof and shows a rough cost in about a minute. We then confirm a fixed price on a short call."),
    ("How long does installation take?", "Most home systems are fitted in one to two days. We handle the scaffolding, the electrical work and the paperwork for your network operator."),
    ("Do I need planning permission?", "Most home solar counts as permitted development, so no application is needed. Listed buildings, conservation areas and flats can be different. We check this for you before any work starts."),
    ("Is a battery worth adding?", "A battery stores the power you make in the day so you can use it in the evening, which usually raises your savings. The quote shows the figures with and without one so you can compare."),
    ("What if my roof isn't suitable?", "We'll tell you straight. The quote looks at the direction, size and shading of your roof. If solar won't pay back on your home, we'd rather say so than sell you a system that underperforms."),
]


def faq(items):
    return '<div class="faq">' + "".join(f"<details data-reveal><summary>{q}</summary><p>{a}</p></details>" for q, a in items) + "</div>"


def fig(img, title, sub, p=""):
    return f'<figure><img src="{p}assets/img/{img}" alt="{html.escape(title)}, {html.escape(sub)}" loading="lazy"><figcaption>{title}<small>{sub}</small></figcaption></figure>'


HOW_SVG = """<svg viewBox="0 0 600 600" role="img" aria-label="Illustration: a roof seen from above, outlined, then filled with solar panels">
  <rect width="600" height="600" fill="#0D0D0D"/>
  <g transform="rotate(-14 300 300)">
    <g fill="#1B1B1B"><rect x="-80" y="96" width="760" height="54"/><rect x="-80" y="452" width="760" height="54"/></g>
    <g fill="#232323"><rect x="24" y="190" width="120" height="220" rx="4"/><rect x="456" y="190" width="120" height="220" rx="4"/></g>
    <rect x="170" y="190" width="260" height="220" rx="4" fill="#2E2E2E"/>
    <rect x="170" y="300" width="260" height="110" fill="#383838"/>
    <line x1="170" y1="300" x2="430" y2="300" stroke="#151515" stroke-width="4"/>
    <g class="st-flux"><rect x="170" y="300" width="260" height="110" fill="url(#fx)" opacity=".55"/></g>
    <g class="st-outline"><path d="M170 190h260v220h-260z" fill="none" stroke="#fff" stroke-width="3.5" stroke-linejoin="round"/></g>
    <g class="st-panels" fill="#0D0D0D" stroke="#F26727" stroke-width="2.5">
      <rect style="--i:0" x="186" y="312" width="54" height="40" rx="2"/><rect style="--i:1" x="244" y="312" width="54" height="40" rx="2"/>
      <rect style="--i:2" x="302" y="312" width="54" height="40" rx="2"/><rect style="--i:3" x="360" y="312" width="54" height="40" rx="2"/>
      <rect style="--i:4" x="186" y="356" width="54" height="40" rx="2"/><rect style="--i:5" x="244" y="356" width="54" height="40" rx="2"/>
      <rect style="--i:6" x="302" y="356" width="54" height="40" rx="2"/><rect style="--i:7" x="360" y="356" width="54" height="40" rx="2"/>
    </g>
  </g>
  <g class="st-pin"><circle class="ping" cx="300" cy="300" r="16" fill="none" stroke="#F26727" stroke-width="2"/><circle cx="300" cy="300" r="11" fill="#F26727" stroke="#fff" stroke-width="3"/></g>
  <g class="st-price"><rect x="150" y="486" width="300" height="74" rx="37" fill="#fff"/>
    <circle cx="190" cy="523" r="19" fill="#F26727"/><path d="M181 523l6 6 12-13" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="222" y="518" font-family="Archivo,Arial" font-weight="800" font-size="19" fill="#0D0D0D">Your price, on screen</text>
    <text x="222" y="541" font-family="Inter,Arial" font-size="14" fill="#666663">Book a call to lock it in</text></g>
  <defs><linearGradient id="fx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F26727"/><stop offset="1" stop-color="#FFD166"/></linearGradient></defs>
</svg>"""


def write(name, content):
    path = os.path.join(ROOT, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("built", name)


# ------------------------------------------------------------------ HOME
def home():
    rail = "".join([
        fig("home-1.jpg", "Rooftop solar", "The Glades"), fig("home-drone-1.jpg", "Solar across two roof faces", "Snowdon Way"),
        fig("bat-ecoflow-1.jpg", "EcoFlow battery storage", "Snowdon Way"), fig("home-3.jpg", "All-black panels", "The Glades"),
        fig("com-1.jpg", "Commercial roof array", "Midlands"), fig("home-4.jpg", "Solar on a hipped roof", "Snowdon Way"),
        fig("bat-sunsynk.jpg", "Sunsynk inverter and batteries", "Midlands"), fig("home-2.jpg", "Rooftop solar", "The Glades"),
    ])
    body = f"""
<section class="hero">
  <div class="hero-media" data-parallax="-60">
    <img class="kb" src="assets/img/home-drone-1.jpg" alt="Solar panels on a house roof, seen from a drone, with the estate behind">
  </div>
  <div class="wrap">
    <span class="eyebrow fade-in" style="animation-delay:.1s">Solar installers for the Midlands</span>
    <h1 style="margin-top:18px">{words("See solar on *your* *roof.* Priced in a minute.")}</h1>
    <p class="lede fade-in">Enter your postcode. We measure your roof from above, place the panels and show your price. No home visit, no sales call first.</p>
    <div class="fade-in" style="animation-delay:.75s">{pcbar()}{PC_NOTE}</div>
    <div class="hero-proof fade-in" style="animation-delay:.95s">
      <div><b>4.9/5</b><span>Customer rating</span></div>
      <div><b>10+ years</b><span>Fitting solar</span></div>
      <div><b>MCS</b><span>Certified installer</span></div>
      <div><b>25 years</b><span>Product warranty</span></div>
    </div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div>
  {''.join(f'<span>{a}</span>' for a in ['Birmingham','Coventry','Leicester','Nottingham','Derby','Northampton','Rugby','Stoke-on-Trent','Worcester','Lincoln'] * 2)}
</div></div>

<section class="section"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">The solar quote</span>
    <h2>Your roof, measured <span class="o">from above.</span></h2>
    <p class="lede">Most solar quotes start with a salesperson in your living room. Ours starts with your postcode and takes about a minute.</p></div>
  <div class="how">
    <div class="how-stage" data-step="1">{HOW_SVG}</div>
    <div class="how-steps">
      <div class="how-step on" data-step="1"><span class="n">STEP 1</span><h3>Enter your postcode</h3><p>Pick your address and drop the pin on your roof. That's all we need from you to start.</p></div>
      <div class="how-step" data-step="2"><span class="n">STEP 2</span><h3>We map your roof</h3><p>Satellite data measures each side of your roof: its size, its angle, which way it faces and how much sun it gets through the year.</p></div>
      <div class="how-step" data-step="3"><span class="n">STEP 3</span><h3>Panels go where the sun is</h3><p>You see the panels on your own roof. Add or remove them, pick a side, and choose whether to add a battery.</p></div>
      <div class="how-step" data-step="4"><span class="n">STEP 4</span><h3>See your price, then talk to us</h3><p>You get a rough cost and your likely savings straight away. Book a short call and we confirm a fixed price.</p>
        <a class="btn" href="quote/index.html" style="margin-top:10px;align-self:flex-start">Start my quote <i>&rarr;</i></a></div>
    </div>
  </div>
</div></section>

<section class="section stone" style="padding-inline:0">
  <div class="wrap"><div class="head split" data-reveal>
    <div style="display:grid;gap:18px"><span class="eyebrow">Recent work</span><h2>Fitted by us, across the Midlands.</h2></div>
    <p style="justify-self:end"><a class="tlink" href="work.html">See all work and reviews <i>&rarr;</i></a></p></div></div>
  <div class="rail" data-reveal>{rail}</div>
</section>

<section class="section"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">What we fit</span><h2>The whole system, from one team.</h2></div>
  <div class="grid-3">
    <a class="tile" href="products.html#panels" data-reveal style="--d:0"><div class="ph"><img src="assets/img/home-2.jpg" alt="All-black solar panels on a house roof" loading="lazy"></div>
      <div class="tx"><h3>Solar panels</h3><p>All-black, high-efficiency panels laid out to suit your roof and the way you use power.</p><span class="go">Panels <i>&rarr;</i></span></div></a>
    <a class="tile" href="products.html#batteries" data-reveal style="--d:1"><div class="ph"><img src="assets/img/bat-ecoflow-1.jpg" alt="Battery storage unit installed in a garage" loading="lazy"></div>
      <div class="tx"><h3>Battery storage</h3><p>Keep the power you make in the day and use it in the evening, when electricity costs most.</p><span class="go">Batteries <i>&rarr;</i></span></div></a>
    <a class="tile" href="products.html#inverters" data-reveal style="--d:2"><div class="ph"><img src="assets/img/inv-fox.jpg" alt="Solar inverter installed on a wall" loading="lazy"></div>
      <div class="tx"><h3>Inverters and EV chargers</h3><p>The kit that runs the system, an app to watch it working, and a charger for the car if you want one.</p><span class="go">More kit <i>&rarr;</i></span></div></a>
  </div>
</div></section>

<section class="section on-dark"><div class="wrap">
  <div class="split">
    <div class="txt" data-reveal><span class="eyebrow">Why Midlands Solar</span>
      <h2>One local team, from first call to switch-on.</h2>
      <p>We design it, fit it and look after it. No subcontracted sales team and no call centre: the people who quote your job are the people who answer the phone afterwards.</p>
      <ul class="ticks"><li>MCS-certified, so your system qualifies for export payments</li><li>Based in the Midlands, working across the region every week</li><li>Clear advice on what your roof can and can't do</li><li>Aftercare, servicing and upgrades from the same team</li></ul>
      <p><a class="tlink" href="about.html">About us <i>&rarr;</i></a></p></div>
    <div class="shot" data-reveal="img"><img src="assets/img/home-5.jpg" alt="Solar panels on a brick house seen from above" loading="lazy" data-parallax="30"><span class="cap">The Glades</span></div>
  </div>
</div>
<div class="wrap" style="margin-top:clamp(48px,6vw,88px)"><div class="stats">
  <div><b data-count="4.9" data-suf="/5">4.9/5</b><span>Average customer rating</span></div>
  <div><b data-count="10" data-suf="+">10+</b><span>Years fitting solar</span></div>
  <div><b data-count="25">25</b><span>Year product warranty</span></div>
  <div><b data-count="0" data-suf="%">0%</b><span>VAT on home solar and batteries</span></div>
</div></div></section>

<section class="section"><div class="wrap">
  <div class="head split" data-reveal><div style="display:grid;gap:18px"><span class="eyebrow">Reviews</span><h2>What customers say.</h2></div>
    <p style="justify-self:end"><a class="tlink" href="work.html#reviews">More reviews <i>&rarr;</i></a></p></div>
  <div class="grid-3">{''.join(quote(*r) for r in REVIEWS[:3])}</div>
</div></section>

<section class="section stone"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">Paying for it</span><h2>Funding and finance, explained plainly.</h2></div>
  <div class="grid-2">
    <a class="card line" href="funding.html" data-reveal style="text-decoration:none"><span class="tag">Government funding</span><h3>0% VAT, export payments and grants</h3>
      <p>Home solar is VAT-free until March 2027, and your supplier pays you for power you send back to the grid. Some households also qualify for grants.</p><span class="tlink" style="justify-self:start">See what's available <i>&rarr;</i></span></a>
    <a class="card line" href="finance.html" data-reveal style="--d:1;text-decoration:none"><span class="tag">Finance options</span><h3>Pay in one go, or spread the cost</h3>
      <p>Pay outright or pay monthly. We show how the monthly cost compares with what the system should save you, so you can decide with real numbers.</p><span class="tlink" style="justify-self:start">Ways to pay <i>&rarr;</i></span></a>
  </div>
</div></section>

<section class="section"><div class="wrap">
  <div class="split rev">
    <div class="shot wide" data-reveal="img"><img src="assets/img/com-2.jpg" alt="Solar panels along both sides of a large pitched roof" loading="lazy" data-parallax="30"></div>
    <div class="txt" data-reveal><span class="eyebrow">For business</span><h2>Bigger roofs, bigger savings.</h2>
      <p>We also fit solar for offices, warehouses, schools and farms. Larger systems are designed around your daytime usage and priced after a site survey.</p>
      <p style="display:flex;gap:24px;flex-wrap:wrap"><a class="tlink" href="commercial.html">Commercial solar <i>&rarr;</i></a><a class="tlink" href="agricultural.html">Agricultural solar <i>&rarr;</i></a></p></div>
  </div>
</div></section>
{cta()}"""
    write("index.html", head("Midlands Solar Installations | Solar panels and batteries across the Midlands",
          "See solar panels on your own roof and get a price in about a minute. MCS-certified solar and battery installers covering the Midlands.") + header() + body + footer())


# ------------------------------------------------------------------ ADS LANDING
def landing():
    body = f"""
<header class="lp-head"><div class="wrap"><img src="assets/img/logo-light.png" alt="Midlands Solar Installations Ltd" width="900" height="429"><a href="{PHONE_HREF}">{PHONE}</a></div></header>
<section class="hero" style="min-height:min(92vh,820px)">
  <div class="hero-media" data-parallax="-50"><img src="assets/img/home-drone-1.jpg" alt=""></div>
  <div class="wrap">
    <span class="eyebrow fade-in" style="animation-delay:.1s">Free online solar quote</span>
    <h1 style="margin-top:18px">{words("Solar for your home, *priced* *in* *a* *minute.*")}</h1>
    <p class="lede fade-in">Enter your postcode to see panels on your own roof, what they'd cost and what they'd save. No home visit and no obligation.</p>
    <div class="fade-in" style="animation-delay:.75s">{pcbar(label="See my price")}{PC_NOTE}</div>
  </div>
</section>

<section class="section tight"><div class="wrap">
  <div class="grid-3">
    <div class="card" data-reveal><span class="num">01</span><h3>Your real roof</h3><p>Measured from satellite data: size, direction, angle and how much sun each side gets.</p></div>
    <div class="card" data-reveal style="--d:1"><span class="num">02</span><h3>Your real numbers</h3><p>A rough cost, your yearly saving and how long it takes to pay back, with or without a battery.</p></div>
    <div class="card" data-reveal style="--d:2"><span class="num">03</span><h3>Your decision</h3><p>Like what you see? Book a short call and we confirm a fixed price. If not, nothing else happens.</p></div>
  </div>
</div></section>

<section class="section stone" style="padding-inline:0">
  <div class="wrap"><div class="head" data-reveal><span class="eyebrow">Recent work</span><h2>Homes we've fitted this year.</h2></div></div>
  <div class="rail" data-reveal>{''.join([fig("home-1.jpg","Rooftop solar","The Glades"),fig("home-4.jpg","Solar on a hipped roof","Snowdon Way"),fig("bat-ecoflow-1.jpg","EcoFlow battery storage","Snowdon Way"),fig("home-3.jpg","All-black panels","The Glades"),fig("home-drone-2.jpg","Solar across two roof faces","Snowdon Way"),fig("bat-sunsynk.jpg","Sunsynk inverter and batteries","Midlands")])}</div>
</section>

<section class="section"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">Reviews</span><h2>What customers say.</h2></div>
  <div class="grid-3">{''.join(quote(*r) for r in REVIEWS[:3])}</div>
</div></section>

<section class="section stone"><div class="wrap" style="max-width:920px">
  <div class="head" data-reveal><span class="eyebrow">Common questions</span><h2>Before you start.</h2></div>
  {faq(FAQ_HOME)}
</div></section>
{cta(h="Ready when you are.", sub="It takes about a minute, and you'll see your own roof with panels on it.")}
<div class="sticky-cta"><a class="btn" href="quote/index.html">Get my solar quote <i>&rarr;</i></a></div>
<footer class="site-foot" style="padding-block:28px"><div class="wrap"><div class="foot-base" style="margin:0;border:0;padding:0"><span>&copy; 2026 Midlands Solar Installations Ltd</span><span><a href="{PHONE_HREF}">{PHONE}</a> &middot; <a href="mailto:{EMAIL}">{EMAIL}</a></span></div></div></footer>
<script src="assets/js/site.js"></script></body></html>"""
    write("get-quote.html", head("Free online solar quote | Midlands Solar Installations",
          "See solar panels on your own roof and get a price in about a minute.", noindex=True) + body)


# ------------------------------------------------------------------ ABOUT
def about():
    counties = ["West Midlands", "Warwickshire", "Worcestershire", "Staffordshire", "Shropshire", "Herefordshire", "Derbyshire", "Nottinghamshire", "Leicestershire", "Rutland", "Northamptonshire", "Lincolnshire"]
    body = phero("About us", "Renewable energy, *done* *properly.*", "Midlands Solar was set up to make switching to solar simpler, clearer and more dependable for homes and businesses across the region.") + f"""
<section class="section"><div class="wrap"><div class="split">
  <div class="txt" data-reveal><span class="eyebrow">Our story</span><h2>A local team, built on trust.</h2>
    <p>We started Midlands Solar because buying solar was harder than it should be: pushy sales visits, vague numbers and installers you never heard from again.</p>
    <p>We do it differently. You get straight advice about what your roof can do, a system designed around how you use electricity, and the same Midlands-based team for the install and everything after it.</p>
    <p><a class="btn dark" href="quote/index.html">Get my solar quote <i>&rarr;</i></a></p></div>
  <div class="shot" data-reveal="img"><img src="assets/img/home-drone-2.jpg" alt="Solar panels on a house roof with the estate behind" loading="lazy" data-parallax="30"><span class="cap">Snowdon Way</span></div>
</div></div></section>

<section class="section stone"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">What we stand for</span><h2>A better way to buy solar.</h2></div>
  <div class="grid-3">
    <div class="card line" data-reveal><span class="num">01</span><h3>Honest advice</h3><p>Recommendations based on your property, your usage and your goals. If solar won't pay back for you, we'll say so.</p></div>
    <div class="card line" data-reveal style="--d:1"><span class="num">02</span><h3>Careful installs</h3><p>Tidy cable runs, properly fixed panels and a system set up to perform for decades, not just on handover day.</p></div>
    <div class="card line" data-reveal style="--d:2"><span class="num">03</span><h3>Local support</h3><p>Aftercare, servicing and upgrades from a team based in the Midlands, on the end of the phone when you need us.</p></div>
  </div>
</div></section>

<section class="section on-dark"><div class="wrap">
  <div class="stats" style="margin-bottom:clamp(48px,6vw,88px)">
    <div><b data-count="10" data-suf="+">10+</b><span>Years of experience</span></div>
    <div><b data-count="4.9" data-suf="/5">4.9/5</b><span>Average customer rating</span></div>
    <div><b data-count="12">12</b><span>Counties covered</span></div>
    <div><b>MCS</b><span>Certified installer</span></div>
  </div>
  <div class="head" data-reveal><span class="eyebrow">Where we work</span><h2>Across the Midlands.</h2>
    <p class="lede">Homes, businesses and farms in and around Birmingham, Coventry, Leicester, Nottingham, Derby, Northampton, Rugby, Stoke-on-Trent, Worcester and Lincoln.</p></div>
  <div class="areas" data-reveal>{''.join(f'<span>{c}</span>' for c in counties)}</div>
</div></section>
{cta()}"""
    write("about.html", head("About us | Midlands Solar Installations", "A Midlands-based team fitting solar panels and batteries for homes, businesses and farms.") + header("about.html") + body + footer())


# ------------------------------------------------------------------ WORK & REVIEWS
def work():
    items = [
        ("home-1.jpg", "home", "Rooftop solar", "The Glades"), ("bat-ecoflow-1.jpg", "battery", "EcoFlow battery storage", "Snowdon Way"),
        ("home-drone-1.jpg", "home", "Solar across two roof faces", "Snowdon Way"), ("com-1.jpg", "commercial", "Commercial roof array", "Midlands"),
        ("home-3.jpg", "home", "All-black panels", "The Glades"), ("bat-sunsynk.jpg", "battery", "Sunsynk inverter and batteries", "Midlands"),
        ("com-2.jpg", "commercial", "Solar on both sides of a pitched roof", "Midlands"), ("home-4.jpg", "home", "Solar on a hipped roof", "Snowdon Way"),
        ("bat-fox.jpg", "battery", "Fox ESS inverter and batteries", "Midlands"), ("home-2.jpg", "home", "Rooftop solar", "The Glades"),
        ("com-3.jpg", "commercial", "Flat roof array", "Midlands"), ("bat-ecoflow-2.jpg", "battery", "EcoFlow battery storage", "Fatherless Barn"),
        ("home-5.jpg", "home", "Solar on a rear roof", "The Glades"), ("bat-growatt.jpg", "battery", "Growatt inverter and batteries", "Midlands"),
        ("com-5.jpg", "commercial", "Commercial roof array", "Midlands"), ("home-6.jpg", "home", "Rooftop solar", "Snowdon Way"),
        ("bat-sigen.jpg", "battery", "Sigenergy battery storage", "Ingeside"), ("com-4.jpg", "commercial", "Flat roof install in progress", "Midlands"),
        ("bat-outdoor.jpg", "battery", "Outdoor inverter and battery", "Saxon Road"), ("bat-hanchu.jpg", "battery", "Hanchu inverter and battery", "Midlands"),
    ]
    figs = "".join(f'<figure data-cat="{c}" data-reveal><img src="assets/img/{i}" alt="{html.escape(t)}, {html.escape(s)}" loading="lazy"><figcaption>{t}<small>{s}</small></figcaption></figure>' for i, c, t, s in items)
    body = phero("Recent work and reviews", "Real roofs. *Real* *installs.*", "Every photo here is a system we designed and fitted. No stock images.", bg="home-3.jpg") + f"""
<section class="section"><div class="wrap">
  <div class="chips"><button class="on" data-f="all">All work</button><button data-f="home">Homes</button><button data-f="battery">Batteries and inverters</button><button data-f="commercial">Commercial</button></div>
  <div class="gallery">{figs}</div>
</div></section>

<section class="section stone" id="reviews"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">Reviews</span><h2>What customers say.</h2>
    <p class="lede">Rated 4.9 out of 5 by our customers.</p></div>
  <div class="grid-2">{''.join(quote(*r) for r in REVIEWS)}</div>
</div></section>
{cta(h="Want yours to look like this?", sub="Enter your postcode and see panels on your own roof in about a minute.")}"""
    write("work.html", head("Recent work and reviews | Midlands Solar Installations", "Photos of recent solar panel and battery installations across the Midlands, and what our customers say.") + header("work.html") + body + footer())


# ------------------------------------------------------------------ FUNDING
def funding():
    body = phero("Government funding", "Help with the cost *of* *solar.*", "There's no single solar grant for everyone, but most homes get some help. Here's what's available and who it's for.") + f"""
<section class="section"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">For every home</span><h2>Support you get automatically.</h2></div>
  <div class="grid-2">
    <div class="card" data-reveal><span class="tag">Everyone</span><div class="big">0% VAT</div><h3>No VAT on home solar and batteries</h3>
      <p>Solar panels and battery storage fitted to homes are zero-rated for VAT until 31 March 2027. It's already built into our prices, so there's nothing to claim.</p></div>
    <div class="card" data-reveal style="--d:1"><span class="tag">Everyone with an MCS install</span><div class="big">SEG</div><h3>Get paid for the power you export</h3>
      <p>Under the Smart Export Guarantee, energy suppliers pay you for electricity you send back to the grid. You need an MCS-certified installation and a smart meter. Rates vary by supplier, so it's worth comparing tariffs.</p></div>
  </div>
</div></section>

<section class="section stone"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">For some households</span><h2>Grants, if you qualify.</h2>
    <p class="lede">These schemes are aimed at lower-income households and homes that are expensive to heat. Rules, budgets and closing dates change, so we check what's open for your address before you commit to anything.</p></div>
  <div class="grid-2">
    <div class="card line" data-reveal><span class="tag">Income and EPC based</span><h3>Warm Homes: Local Grant</h3>
      <p>Funding for energy upgrades, which can include solar panels, for eligible households in England. It's delivered through participating local councils, and eligibility depends on household income and your home's energy rating.</p></div>
    <div class="card line" data-reveal style="--d:1"><span class="tag">Benefits and income based</span><h3>Energy supplier schemes</h3>
      <p>Larger energy suppliers have funded home upgrades for eligible households under the Energy Company Obligation. What's covered and who qualifies has changed over time, so ask us what applies now.</p></div>
  </div>
  <p class="note" style="margin-top:28px" data-reveal>This page is a guide, not financial advice. Government schemes change and some depend on your council. We'll confirm exactly what you can claim when we quote.</p>
</div></section>

<section class="section"><div class="wrap" style="max-width:920px">
  <div class="head" data-reveal><span class="eyebrow">Questions</span><h2>Funding, answered.</h2></div>
  {faq([
    ("Is there a free solar panel scheme?", "Not for everyone. Fully funded solar is limited to households that meet income, benefits or energy-rating rules under specific schemes. Most customers pay for their system and benefit from 0% VAT and export payments."),
    ("Do I have to apply for 0% VAT?", "No. It applies automatically to solar panels and batteries fitted to homes, and it's already reflected in the price we quote."),
    ("How do I get Smart Export Guarantee payments?", "After your install you receive an MCS certificate. You choose an export tariff from a supplier, send them the certificate, and they pay you for the power your smart meter records going back to the grid."),
    ("Can you check what I qualify for?", "Yes. Tell us your postcode and a little about your household when you enquire, and we'll tell you which schemes are open to you."),
  ])}
</div></section>
{cta(h="Start with your price.", sub="See what solar would cost for your roof, then we'll tell you what funding applies.")}"""
    write("funding.html", head("Government funding for solar panels | Midlands Solar Installations", "0% VAT, Smart Export Guarantee payments and grants for solar panels: what's available and who qualifies.") + header("funding.html") + body + footer())


# ------------------------------------------------------------------ FINANCE
def finance():
    body = phero("Finance options", "Pay your way.", "Solar is a long-term saving. Pay in one go or spread the cost: we show you the figures for both so you can choose.") + f"""
<section class="section"><div class="wrap">
  <div class="grid-3">
    <div class="card" data-reveal><span class="num">OPTION 1</span><h3>Pay in full</h3><p>The lowest overall cost. A deposit secures your install date, with the balance due once the system is fitted and working.</p></div>
    <div class="card" data-reveal style="--d:1"><span class="num">OPTION 2</span><h3>Spread the cost</h3><p>Pay monthly instead of all at once. Ask us for a personal illustration showing the monthly payment next to your expected monthly saving.</p></div>
    <div class="card" data-reveal style="--d:2"><span class="num">OPTION 3</span><h3>Grants and funding</h3><p>Some households qualify for help with the cost. We check what's open for your address.</p><a class="tlink" href="funding.html" style="justify-self:start">Government funding <i>&rarr;</i></a></div>
  </div>
  <p class="note" style="margin-top:28px" data-reveal>Finance is subject to status and affordability checks. Terms apply. Speak to us for full details before you decide.</p>
</div></section>

<section class="section on-dark"><div class="wrap"><div class="split">
  <div class="txt" data-reveal><span class="eyebrow">How it adds up</span><h2>Savings first, then the cost.</h2>
    <p>Solar pays you back in two ways: you buy less electricity, and your supplier pays you for what you export. The online quote estimates both for your roof.</p>
    <ul class="ticks"><li>Yearly saving on your electricity bill</li><li>Yearly income from exported power</li><li>How many years the system takes to pay for itself</li><li>The same figures with a battery added</li></ul>
    <p><a class="btn" href="quote/index.html">See my numbers <i>&rarr;</i></a></p></div>
  <div class="shot" data-reveal="img"><img src="assets/img/bat-ecoflow-2.jpg" alt="Battery storage system installed on an outside wall" loading="lazy" data-parallax="30"><span class="cap">Battery storage, Fatherless Barn</span></div>
</div></div></section>

<section class="section"><div class="wrap" style="max-width:920px">
  <div class="head" data-reveal><span class="eyebrow">Questions</span><h2>Paying for solar.</h2></div>
  {faq([
    ("When do I pay?", "If you pay in full, a deposit secures your install date and the balance is due once the system is installed and commissioned. If you spread the cost, your agreement sets out the payment dates."),
    ("Will the savings cover a monthly payment?", "It depends on your roof, your usage and the term you choose. We show the expected monthly saving next to the monthly payment so you can compare them directly."),
    ("Does a battery change the numbers?", "Usually, yes. A battery costs more up front but lets you use more of your own power, which raises the saving. The quote shows both versions."),
  ])}
</div></section>
{cta()}"""
    write("finance.html", head("Finance options for solar | Midlands Solar Installations", "Ways to pay for solar panels and batteries: pay in full or spread the cost.") + header("finance.html") + body + footer())


# ------------------------------------------------------------------ PRODUCTS
def products():
    body = phero("Products we fit", "Good kit, *fitted* *properly.*", "We choose equipment we'd put on our own homes, and match it to your roof and how you use power.", bg="home-2.jpg") + f"""
<section class="section" id="panels"><div class="wrap"><div class="split">
  <div class="shot" data-reveal="img"><img src="assets/img/home-1.jpg" alt="All-black solar panels on a tiled roof" loading="lazy" data-parallax="30"><span class="cap">The Glades</span></div>
  <div class="txt" data-reveal><span class="eyebrow">Solar panels</span><h2>All-black panels that look right on a house.</h2>
    <p>High-efficiency monocrystalline panels with black frames and black backing, so the array reads as one clean block on your roof.</p>
    <ul class="ticks"><li>Laid out around your roof's shape, vents and windows</li><li>Fixed to the rafters, with the roof made good around every bracket</li><li>Product warranties of 25 years, with longer options available</li></ul></div>
</div></div></section>

<section class="section stone" id="batteries"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">Battery storage</span><h2>Use your own power after dark.</h2>
    <p class="lede">A battery stores what your panels make in the day. You can also charge it on cheap overnight electricity in winter. These are systems we've fitted recently.</p></div>
  <div class="grid-3">
    <div class="tile" data-reveal><div class="ph"><img src="assets/img/bat-ecoflow-3.jpg" alt="EcoFlow battery stack in a garage" loading="lazy"></div><div class="tx"><h3>EcoFlow</h3><p>A slim, stackable battery tower. Add modules to raise capacity later.</p></div></div>
    <div class="tile" data-reveal style="--d:1"><div class="ph"><img src="assets/img/bat-fox.jpg" alt="Fox ESS inverter and batteries on a wall" loading="lazy"></div><div class="tx"><h3>Fox ESS</h3><p>Wall-mounted inverter and battery packs that suit garages and utility rooms.</p></div></div>
    <div class="tile" data-reveal style="--d:2"><div class="ph"><img src="assets/img/bat-sunsynk.jpg" alt="Sunsynk inverter above two batteries" loading="lazy"></div><div class="tx"><h3>Sunsynk</h3><p>A hybrid inverter with floor-standing batteries and backup power options.</p></div></div>
    <div class="tile" data-reveal><div class="ph"><img src="assets/img/bat-sigen.jpg" alt="Sigenergy battery unit" loading="lazy"></div><div class="tx"><h3>Sigenergy</h3><p>An all-in-one unit that combines the inverter and battery in a single cabinet.</p></div></div>
    <div class="tile" data-reveal style="--d:1"><div class="ph"><img src="assets/img/bat-growatt.jpg" alt="Growatt inverter and batteries" loading="lazy"></div><div class="tx"><h3>Growatt</h3><p>A widely used inverter and battery pairing with a clear monitoring app.</p></div></div>
    <div class="tile" data-reveal style="--d:2"><div class="ph"><img src="assets/img/bat-hanchu.jpg" alt="Hanchu inverter and battery" loading="lazy"></div><div class="tx"><h3>Hanchu</h3><p>Compact wall-mounted storage for homes with less space to spare.</p></div></div>
  </div>
</div></section>

<section class="section" id="inverters"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">The rest of the system</span><h2>Inverters, monitoring and EV chargers.</h2></div>
  <div class="grid-3">
    <div class="card" data-reveal><span class="num">INVERTER</span><h3>The part that does the work</h3><p>The inverter turns the panels' output into power your home can use. We size it to your array and leave room for a battery if you might add one.</p></div>
    <div class="card" data-reveal style="--d:1"><span class="num">MONITORING</span><h3>Watch it working</h3><p>An app on your phone shows what you're generating, using, storing and exporting, live and over time.</p></div>
    <div class="card" data-reveal style="--d:2"><span class="num">EV CHARGER</span><h3>Charge the car on sunshine</h3><p>Add a home charger that can use your spare solar power before it goes to the grid.</p></div>
  </div>
</div></section>
{cta(h="See what fits your roof.", sub="The quote shows how many panels your roof takes and what a battery would add.")}"""
    write("products.html", head("Solar panels, batteries and inverters we fit | Midlands Solar Installations", "The solar panels, battery storage, inverters and EV chargers Midlands Solar installs.") + header("products.html") + body + footer())


# ------------------------------------------------------------------ COMMERCIAL / AGRICULTURAL
def biz(name, file, eyebrow, h1, lede, bg, intro_h, intro, points, uses, other):
    body = phero(eyebrow, h1, lede, bg=bg) + f"""
<section class="section"><div class="wrap"><div class="split">
  <div class="txt" data-reveal><span class="eyebrow">{eyebrow}</span><h2>{intro_h}</h2><p>{intro}</p>
    <ul class="ticks">{''.join(f'<li>{x}</li>' for x in points)}</ul>
    <p style="display:flex;gap:14px;flex-wrap:wrap"><a class="btn dark" href="contact.html">Request a site survey <i>&rarr;</i></a><a class="btn ghost" href="{PHONE_HREF}">Call {PHONE}</a></p></div>
  <div class="shot" data-reveal="img"><img src="assets/img/com-3.jpg" alt="Rows of solar panels on a large flat roof" loading="lazy" data-parallax="30"></div>
</div></div></section>
<section class="section stone"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">Where it works</span><h2>Built around how you use power.</h2></div>
  <div class="grid-3">{''.join(f'<div class="card line" data-reveal style="--d:{i}"><span class="num">0{i+1}</span><h3>{t}</h3><p>{d}</p></div>' for i,(t,d) in enumerate(uses))}</div>
</div></section>
<section class="section on-dark"><div class="wrap">
  <div class="head" data-reveal><span class="eyebrow">How a project runs</span><h2>Survey, design, install, support.</h2></div>
  <div class="grid-2">
    <div class="card dark" data-reveal><span class="num">01</span><h3>Site survey</h3><p>We look at the roof or land, the structure, your supply and your half-hourly usage.</p></div>
    <div class="card dark" data-reveal style="--d:1"><span class="num">02</span><h3>Design and proposal</h3><p>A system sized to your daytime demand, with expected generation, savings and payback set out clearly.</p></div>
    <div class="card dark" data-reveal><span class="num">03</span><h3>Installation</h3><p>Planned around your operations, including the grid connection application to your network operator.</p></div>
    <div class="card dark" data-reveal style="--d:1"><span class="num">04</span><h3>Monitoring and maintenance</h3><p>Ongoing monitoring, servicing and cleaning to keep the system performing.</p></div>
  </div>
  <p style="margin-top:36px" data-reveal><a class="tlink" href="{other[0]}">{other[1]} <i>&rarr;</i></a></p>
</div></section>
<section class="section tight"><div class="wrap"><div class="cta" data-reveal><img class="sun" src="assets/img/sun-mark.png" alt="">
  <span class="eyebrow" style="color:#C9C9C4">{name}</span><h2>Let's look at your site.</h2>
  <p class="lede" style="color:#C9C9C4">Larger systems are priced after a survey. Tell us about your building and we'll arrange a visit.</p>
  <p style="display:flex;gap:14px;flex-wrap:wrap"><a class="btn" href="contact.html">Request a site survey <i>&rarr;</i></a><a class="btn ghost" href="{PHONE_HREF}">Call {PHONE}</a></p></div></div></section>"""
    write(file, head(f"{name} | Midlands Solar Installations", lede) + header("commercial.html") + body + footer())


# ------------------------------------------------------------------ CONTACT
def contact():
    ep = f' data-endpoint="{FORM_ENDPOINT}"' if FORM_ENDPOINT else ""
    body = phero("Contact us", "Talk to *the* *team.*", "Ask a question, check we cover your area, or book a survey. For a home solar price, the online quote is the quickest route.") + f"""
<section class="section"><div class="wrap"><div class="split" style="align-items:start">
  <div class="contact-list" data-reveal>
    <div><span>Freephone</span><a href="{PHONE_HREF}">{PHONE}</a></div>
    <div><span>Mobile</span><a href="tel:{MOBILE.replace(' ', '')}">{MOBILE}</a></div>
    <div><span>Email</span><a href="mailto:{EMAIL}" style="font-size:clamp(18px,1.9vw,26px)">{EMAIL}</a></div>
    <div><span>Area</span><p class="lede" style="font-size:17px">Homes, businesses and farms across the Midlands and surrounding areas.</p></div>
    <div class="card" style="margin-top:8px"><h3>Want a price for your home?</h3><p>Skip the form. See panels on your roof and a rough cost in about a minute.</p>{pcbar(light=True)}</div>
  </div>
  <form class="form card line" data-reveal style="--d:1"{ep} novalidate>
    <h3>Send us a message</h3>
    <div class="row"><label>Name<input name="name" autocomplete="name" required></label><label>Phone<input name="phone" type="tel" autocomplete="tel" required></label></div>
    <div class="row"><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Postcode<input name="postcode" autocomplete="postal-code"></label></div>
    <label>What are you interested in?<select name="interest"><option>Solar panels for my home</option><option>Solar panels and battery storage</option><option>Battery storage only</option><option>Commercial solar</option><option>Agricultural solar</option><option>EV charger</option><option>Servicing or an upgrade</option></select></label>
    <label>Message<textarea name="message" placeholder="Anything we should know?"></textarea></label>
    <button class="btn dark" type="submit">Send message <i>&rarr;</i></button>
    <p class="msg" hidden role="status"></p>
  </form>
</div></div></section>"""
    write("contact.html", head("Contact us | Midlands Solar Installations", "Contact Midlands Solar Installations by phone, email or message.") + header("contact.html") + body + footer())


if __name__ == "__main__":
    home(); landing(); about(); work(); funding(); finance(); products(); contact()
    biz("Commercial solar", "commercial.html", "Commercial solar", "Cut your site's *energy* *bill.*",
        "Solar for offices, warehouses, factories, schools and retail units across the Midlands.", "com-1.jpg",
        "Lower running costs, fixed for decades.",
        "Businesses use most of their electricity in daylight, which is exactly when solar produces it. A well-sized system cuts what you buy from the grid and protects you from price rises.",
        ["Designed around your half-hourly usage data", "Pitched, flat and metal-clad roofs", "Grid connection applications handled for you", "Battery storage and EV charging where they pay back"],
        [("Offices and retail", "Daytime demand from lighting, IT and air conditioning lines up well with solar output."), ("Warehouses and factories", "Large, unshaded roofs and steady daytime loads make for strong returns."), ("Schools and public buildings", "Lower bills and a visible commitment to cutting carbon.")],
        ("agricultural.html", "Looking for agricultural solar?"))
    biz("Agricultural solar", "agricultural.html", "Agricultural solar", "Power the farm *from* *the* *barn* *roof.*",
        "Solar for farms, rural buildings and high-usage agricultural sites across the Midlands.", "com-2.jpg",
        "Put your biggest roofs to work.",
        "Barns, grain stores and livestock buildings offer large roofs with little shading. Solar cuts the cost of running refrigeration, ventilation, drying and pumping.",
        ["Systems sized to seasonal and daily demand", "Suitable for steel, fibre-cement and tiled roofs", "Three-phase supplies and larger grid connections", "Battery storage to cover early mornings and evenings"],
        [("Dairy and livestock", "Milking, cooling and ventilation run every day, so generated power is used on site."), ("Arable and storage", "Grain drying and cold stores draw heavily in summer, when output is highest."), ("Diversified sites", "Farm shops, workshops and holiday lets all share the same supply and savings.")],
        ("commercial.html", "Looking for commercial solar?"))
