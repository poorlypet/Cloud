#!/usr/bin/env python3
"""Builds the Midlands Solar website into this folder. Run:  python3 site.py

Every page is a stack of "screens": blocks that each fit one viewport. The
builders below (phero, split, cols, tiles, strip, voices, faq, formscr, end…)
each return one screen; the page functions at the bottom put them in order.
Styles are in assets/css/ms.css and behaviour in assets/js/ms.js.
The quote tool lives in quote/ and is not built here."""
import os, html

ROOT = os.path.dirname(os.path.abspath(__file__))
PHONE, PHONE_HREF = "0800 654 6343", "tel:08006546343"
MOBILE, MOBILE_HREF = "07599 965 786", "tel:07599965786"
EMAIL = "enquiries@midlandssolar.co.uk"
FORM_ENDPOINT = ""  # e.g. a Formspree URL. Empty = forms tell the visitor to call instead.

NAV = [("products.html", "Products"), ("work.html", "Our work"), ("funding.html", "Funding"), ("finance.html", "Finance"),
       ("commercial.html", "Business"), ("about.html", "About"), ("contact.html", "Contact")]
AREAS = ["Birmingham", "Coventry", "Leicester", "Nottingham", "Derby", "Northampton", "Rugby", "Stoke-on-Trent", "Worcester", "Lincoln"]
REVIEWS = [
    ("The installation was quick, tidy and hassle-free. We're already seeing the benefits on our energy bills.", "Emily R.", "Homeowner, Birmingham"),
    ("From quote to completion, everything was simple. The system looks great and performs even better.", "James M.", "Homeowner, Solihull"),
    ("A brilliant team to work with. Professional, knowledgeable and always on hand to help.", "David L.", "Business owner, Coventry"),
    ("Solar has transformed the way we power our farm. It's efficient, reliable and future-proof.", "Tom P.", "Farmer, Warwickshire"),
]
WHY = [
    ("MCS certified", "The standard you need to be paid for power you send back to the grid."),
    ("25-year panel warranty", "Your panels are covered for the long run."),
    ("10+ years fitting solar", "More than a decade of roofs across the region."),
    ("Rated 4.9 out of 5", "From the customers we've fitted for."),
]
FAQ_HOME = [
    ("How much do solar panels cost?", "It depends on your roof, how many panels fit and whether you add a battery. The online quote measures your actual roof and shows a rough cost in about a minute. We then confirm a fixed price on a short call."),
    ("How long does installation take?", "Most home systems are fitted in one to two days. We handle the scaffolding, the electrical work and the paperwork for your network operator."),
    ("Do I need planning permission?", "Most home solar counts as permitted development, so no application is needed. Listed buildings, conservation areas and flats can be different. We check this for you before any work starts."),
    ("Is a battery worth adding?", "A battery stores the power you make in the day so you can use it in the evening, which usually raises your savings. The quote shows the figures with and without one."),
    ("What if my roof isn't suitable?", "We'll tell you straight. If solar won't pay back on your home, we'd rather say so than sell you a system that underperforms."),
]

# ------------------------------------------------------------------ small pieces
_n = 0
def uid():
    global _n
    _n += 1
    return _n

def lab(t): return f'<p class="lab"><i></i>{t}</p>'
def img(name, alt=""): return f'<img src="assets/img/{name}" alt="{html.escape(alt)}" loading="lazy">'
def vid(name, auto=False):
    return (f'<video src="assets/video/{name}.mp4" poster="assets/video/{name}.jpg" muted loop playsinline '
            + ("autoplay" if auto else 'data-v preload="none"') + "></video>")
def tl(href, text): return f'<a class="tl" href="{href}">{text} <i>→</i></a>'
def btn(href, text): return f'<a class="btn" href="{href}">{text} <i>→</i></a>'

def pc(label="Show my roof", hin=False):
    i = uid()
    return (f'<form class="pc" data-pc{" data-hin" if hin else ""}><label class="sr" for="pc{i}">Postcode</label>'
            f'<input id="pc{i}" name="postcode" placeholder="Your postcode" autocomplete="postal-code" required>'
            f'<button class="btn" type="submit"><span>{label}</span> <i>→</i></button></form>')

def head(label, h2, right=""):
    return f'{lab(label)}<div class="head"><h2 data-rise>{h2}</h2>{right}</div>'

def sub(t): return f'<p class="sub">{t}</p>'

# ------------------------------------------------------------------ screens
def hero(h1, lede, label="Show my roof"):
    """Home / landing hero: moving wall of job photos and clips behind the headline."""
    return f'''<section class="hero" data-hero>
  <div class="hero-bg" id="mosaic" aria-hidden="true"></div><div class="hero-shade"></div>
  <div class="hero-in"><h1>{h1}</h1><p data-hin>{lede}</p>{pc(label, hin=True)}</div>
  <div class="hero-foot" data-hin><span>MCS certified</span><span>Rated 4.9 out of 5</span><span>25-year panel warranty</span></div>
</section>'''

def phero(label, h1, lede, media, extra=""):
    """Inner page hero: full-screen photo or clip with the page title over it."""
    return (f'<section class="scr phero" data-hero><div class="media" data-film>{media}</div>'
            f'<div>{lab(label)}<h1>{h1}</h1><p class="sub" data-hin>{lede}</p>{extra}</div></section>')

def say():
    nums = ('<div class="nums"><div><b data-count="4.9" data-d="1">4.9</b><span>out of 5 from our customers</span></div>'
            '<div><b data-count="10" data-s="+">10+</b><span>years fitting solar</span></div>'
            '<div><b data-count="25">25</b><span>year panel warranty</span></div></div>')
    return (f'<section class="scr say bone">{lab("Midlands Solar")}<p class="big" data-words>We fit solar panels and batteries for homes, businesses and farms '
            f'across the Midlands. You see your roof, your panels and your price before anyone picks up the phone.</p>{nums}</section>')

def demo():
    caps = [("Enter your postcode", "Pick your address and drop a pin on your roof."),
            ("See panels on your roof", "We measure your roof from satellite images and lay the panels out."),
            ("Get your price", "A full price on screen, with and without a battery.")]
    ch = "".join(f'<div class="cap{" on" if i == 0 else ""}"><b>STEP {i+1} OF 3</b><h3>{t}</h3><p class="sub">{s}</p></div>' for i, (t, s) in enumerate(caps))
    roof = ('<div class="roof"><img src="assets/img/home-5.jpg" alt="A roof we fitted with solar panels" data-r="img">'
            '<svg viewBox="0 0 1275 1700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
            '<polygon data-r="roof" points="690,418 1272,1040 2,1022" fill="rgba(242,103,39,.14)" stroke="#fff" stroke-width="6" stroke-linejoin="round"/>'
            '<g data-r="panels" fill="rgba(242,103,39,.5)" stroke="#F26727" stroke-width="6" stroke-linejoin="round">'
            '<polygon points="517,641 801,655 797,800 507,786"/><polygon points="357,778 648,795 640,957 330,938"/><polygon points="652,795 948,815 950,980 641,957"/></g></svg>'
            '<div class="roof-chip" data-r="chip"><i></i>Your home</div>'
            '<div class="roof-price" data-r="price"><div><span>Roof space used</span><b style="--f:72%"></b></div><div><span>Bill covered</span><b style="--f:58%"></b></div>'
            '<div class="o"><span>Your price</span><b style="--f:100%"></b></div></div></div>')
    return (f'<section class="scr split blk" data-demo><div class="split-txt">{lab("Online quote")}<h2>Postcode to price<br>in about a minute.</h2>'
            f'<div class="caps">{ch}</div><div class="bar"><i></i></div></div>{roof}</section>')

def tiles():
    fit = [("Solar panels", "All-black panels that sit flat and neat on your roof.", "products.html#panels", "home-2.jpg"),
           ("Battery storage", "Store the power you make in the day and use it at night.", "products.html#batteries", "bat-ecoflow-3.jpg"),
           ("Commercial", "Warehouses, offices and units that use power all day.", "commercial.html", "com-1.jpg"),
           ("Farms", "Barns and farm buildings put to work.", "agricultural.html", "com-3.jpg")]
    t = "".join(f'<a href="{h}">{img(p, n)}<i>↗</i><div><h3>{n}</h3><p>{s}</p></div></a>' for n, s, h, p in fit)
    return f'<section class="scr flush blk" style="padding-bottom:0">{head("What we fit", "Panels, batteries and more.", tl("products.html", "All products"))}<div class="tiles">{t}</div></section>'

def fig(media, title, small="", wide=False):
    return f'<figure{" class=wide" if wide else ""}>{media}<figcaption>{title}' + (f"<span>{small}</span>" if small else "") + "</figcaption></figure>"

def strip(skin, label, h2, figs, right="", sid=""):
    """A row of photos and clips that travels sideways (pinned on desktop, swiped on phones)."""
    return (f'<section class="scr flush work {skin}"{f" id={sid}" if sid else ""} data-xpin>{head(label, h2, right)}'
            f'<div class="track" data-track>{"".join(figs)}</div></section>')

HOME_STRIP = [fig(vid("fly-glades-1"), "Roof install", "Drone film"), fig(img("home-drone-1.jpg", "Solar panels on a house from above"), "Home solar", "From above", True),
              fig(img("home-1.jpg", "Solar panels on a house roof"), "Home solar", "All-black panels"), fig(vid("orbit-2"), "Home solar", "Drone film", True),
              fig(img("bat-ecoflow-1.jpg", "Battery fitted in a home"), "Battery storage", "EcoFlow"), fig(vid("fly-snowdon-1"), "Roof install", "Drone film"),
              fig(vid("commercial"), "Commercial roof", "Drone film", True), fig(img("bat-sigen.jpg", "Battery fitted outside a home"), "Battery storage", "Sigenergy"),
              fig(img("home-4.jpg", "Solar panels on a house roof"), "Home solar", "Finished roof")]

def split(skin, label, h2, body, media, rev=False, sid=""):
    return (f'<section class="scr split {skin}{" rev" if rev else ""}"{f" id={sid}" if sid else ""}><div class="media" data-wipe>{media}</div>'
            f'<div class="split-txt">{lab(label)}<h2 data-rise>{h2}</h2>{body}</div></section>')

def ticks(items): return '<ul class="ticks">' + "".join(f"<li>{x}</li>" for x in items) + "</ul>"

def about_block(skin="blk"):
    pts = '<div class="pts">' + "".join(f"<div><h3>{t}</h3><p>{s}</p></div>" for t, s in WHY) + "</div>"
    return split(skin, "About us", "A Midlands installer,<br>start to finish.",
                 sub("We design, fit and look after solar panels and battery storage for homes, businesses and farms.") + pts + tl("about.html", "More about us"),
                 vid("fly-glades-2"))

def cols(skin, label, h2, items, right="", note="", sid=""):
    """A heading over 2-4 short columns. items: dicts with k (small kicker), big, h, p, media, link."""
    out = ""
    for it in items:
        out += ("<div data-up>" + (f'<div class="media">{it["media"]}</div>' if it.get("media") else "") + (f'<b>{it["k"]}</b>' if it.get("k") else "")
                + (f'<div class="big">{it["big"]}</div>' if it.get("big") else "") + f'<h3>{it["h"]}</h3><p>{it["p"]}</p>' + (it.get("link") or "") + "</div>")
    return (f'<section class="scr {skin}"{f" id={sid}" if sid else ""}>{head(label, h2, right)}<div class="cols" style="--n:{len(items)}">{out}</div>'
            + (f'<p class="note">{note}</p>' if note else "") + "</section>")

def voices(skin="bone"):
    qs = "".join(f'<blockquote{" class=on" if i == 0 else ""}><p>“{q}”</p><footer><b>{n}</b> · {w}</footer></blockquote>' for i, (q, n, w) in enumerate(REVIEWS))
    return (f'<section class="scr voices {skin}" id="reviews" data-voices>{lab("Reviews")}<div><div class="stage">{qs}</div>'
            '<div class="ctl"><button data-prev aria-label="Previous review">←</button><button data-next aria-label="Next review">→</button><span data-vn>1 / 4</span></div></div></section>')

def pay():
    return ('<section class="scr pay blk"><a href="funding.html"><p class="lab"><i></i>Government funding</p><div><h3>Could you get it part-paid?</h3>'
            '<p>Some homes qualify for grants, and home solar is 0% VAT. We check what applies to you.</p></div><i>↗</i></a>'
            '<a href="finance.html"><p class="lab"><i></i>Finance</p><div><h3>Spread the cost monthly.</h3>'
            '<p>Pay over time and let the savings on your bill do some of the work.</p></div><i>↗</i></a></section>')

def faq(skin, label, h2, items):
    d = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in items)
    return f'<section class="scr {skin}">{head(label, h2)}<div class="faq">{d}</div></section>'

def form(kind):
    ep = f' data-endpoint="{FORM_ENDPOINT}"' if FORM_ENDPOINT else ""
    def f(label, name, typ="text", ac="", req=True):
        return f'<label>{label}<input name="{name}" type="{typ}"' + (f' autocomplete="{ac}"' if ac else "") + (" required" if req else "") + "></label>"
    rows = f'<div class="row">{f("Name", "name", ac="name")}{f("Phone", "phone", "tel", "tel")}</div>'
    if kind == "callback":
        rows += (f'<div class="row">{f("Postcode", "postcode", ac="postal-code")}<label>Best time to call<select name="time"><option>Any time</option><option>Morning</option>'
                 '<option>Afternoon</option><option>Evening</option></select></label></div>')
        button = "Call me back"
    else:
        rows += f'<div class="row">{f("Email", "email", "email", "email")}{f("Postcode", "postcode", ac="postal-code", req=False)}</div>'
        if kind == "survey":
            rows += f'<div class="row">{f("Business or farm name", "business", req=False)}<label>Type of site<select name="site"><option>Commercial building</option><option>Farm or rural building</option><option>Other</option></select></label></div>'
            button = "Request a site survey"
        else:
            rows += ('<label>What are you interested in?<select name="interest"><option>Solar panels for my home</option><option>Solar panels and battery storage</option>'
                     '<option>Battery storage only</option><option>Commercial solar</option><option>Agricultural solar</option><option>Servicing or an upgrade</option></select></label>')
            button = "Send message"
        rows += '<label>Message<textarea name="message"></textarea></label>'
    return (f'<form class="form" data-form{ep} novalidate><input type="hidden" name="form" value="{kind}">{rows}'
            f'<button class="btn" type="submit">{button} <i>→</i></button><p class="msg" role="status" hidden></p></form>')

def formscr(skin, label, h2, text, kind="contact", tag="h2"):
    lines = (f'<div class="lines"><a href="{PHONE_HREF}"><span>Freephone</span>{PHONE}</a><a href="{MOBILE_HREF}"><span>Mobile</span>{MOBILE}</a>'
             f'<a href="mailto:{EMAIL}"><span>Email</span>{EMAIL}</a></div>')
    return (f'<section class="scr formscr {skin}" id="contact"><div>{lab(label)}<{tag} class="h2" data-rise>{h2}</{tag}>{sub(text)}{lines}</div>{form(kind)}</section>')

def end(h2="Let's get you<br>on solar.", p="Get a price online in about a minute, or speak to us."):
    return (f'<section class="scr end blk"><div class="sun" id="sun"></div><h2 data-rise>{h2}</h2><p>{p}</p>{pc()}'
            f'<a class="call" href="{PHONE_HREF}">or call {PHONE}</a></section>')

# ------------------------------------------------------------------ page shell
def page(file, title, desc, body, active="", landing=False):
    links = "".join(f'<li><a href="{h}"{" aria-current=page" if h == active else ""}>{t}</a></li>' for h, t in NAV)
    cta = btn("quote/index.html", "Get my quote")
    if landing:
        nav = f'<header class="nav min" id="nav"><a class="logo" href="#top"><img src="assets/img/logo-light.png" alt="Midlands Solar"></a><a class="tel" href="{PHONE_HREF}">{PHONE}</a></header>'
        foot = (f'<footer class="foot"><div class="foot-base" style="margin:0"><span>© Midlands Solar Installations Ltd · MCS certified installer</span>'
                f'<span><a href="{PHONE_HREF}">{PHONE}</a> · <a href="mailto:{EMAIL}">{EMAIL}</a></span></div></footer>')
    else:
        nav = (f'<header class="nav" id="nav"><a class="logo" href="index.html" aria-label="Midlands Solar home"><img src="assets/img/logo-light.png" alt="Midlands Solar"></a>'
               f'<ul>{links}</ul><a class="tel" href="{PHONE_HREF}">{PHONE}</a>{cta}<button class="burger" id="burger" aria-label="Menu"></button></header>'
               f'<nav class="menu" id="menu">' + "".join(f'<a href="{h}">{t}</a>' for h, t in NAV) + f'{cta}<a class="tel" href="{PHONE_HREF}">{PHONE}</a></nav>')
        foot = f'''<footer class="foot"><div class="foot-cols">
<div><img src="assets/img/logo-light.png" alt="Midlands Solar"><p>Solar panels and battery storage for homes, businesses and farms across the Midlands.</p></div>
<div><h4>Solar</h4><ul><li><a href="quote/index.html">Get my quote</a></li><li><a href="products.html">Products</a></li><li><a href="work.html">Our work</a></li><li><a href="commercial.html">Commercial</a></li><li><a href="agricultural.html">Agricultural</a></li></ul></div>
<div><h4>Paying</h4><ul><li><a href="funding.html">Government funding</a></li><li><a href="finance.html">Finance options</a></li><li><a href="about.html">About us</a></li></ul></div>
<div><h4>Talk to us</h4><ul><li><a href="{PHONE_HREF}">{PHONE}</a></li><li><a href="{MOBILE_HREF}">{MOBILE}</a></li><li><a href="mailto:{EMAIL}">{EMAIL}</a></li><li><a href="contact.html">Contact us</a></li></ul></div>
</div><div class="foot-word" aria-hidden="true">Midlands Solar</div><div class="foot-base"><span>© Midlands Solar Installations Ltd</span><span>MCS certified installer</span></div></footer>'''
    doc = f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
{'<meta name="robots" content="noindex,nofollow">' if landing else ''}
<link rel="icon" href="assets/img/sun-mark.png">
<link rel="stylesheet" href="assets/fonts/fonts.css">
<link rel="stylesheet" href="assets/css/ms.css">
</head>
<body>
<div class="cursor" id="cursor"></div>
<div class="loader" id="loader"><div><img src="assets/img/sun-mark.png" alt=""><span id="loadN">000</span></div></div>
{nav}
<main id="top">
{body}
</main>
{foot}
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="assets/js/ms.js"></script>
</body>
</html>
'''
    open(os.path.join(ROOT, file), "w").write(doc)

def h1(*lines): return "".join(f'<span class="ln"><span>{l}</span></span>' for l in lines)

# ------------------------------------------------------------------ pages
def home():
    body = "\n".join([
        hero(h1("See solar", "on <em>your</em> roof."), "Solar panels and batteries, fitted across the Midlands. Enter your postcode for a price in about a minute."),
        say(), demo(), tiles(),
        strip("bone", "Recent work", "Fitted by us.", HOME_STRIP, tl("work.html", "See all our work")),
        about_block(), voices(), pay(),
        formscr("bone", "Contact us", "Rather talk<br>to someone?", "Leave your details and we'll call you back, or ring us now."),
        end()])
    page("index.html", "Solar panels and batteries across the Midlands | Midlands Solar Installations",
         "Solar panels and battery storage fitted across the Midlands. See panels on your own roof and get a price online in about a minute.", body)

def landing():
    body = "\n".join([
        hero(h1("Solar for your home,", "<em>priced in a minute.</em>"), "Enter your postcode to see panels on your own roof, what they'd cost and what they'd save. No home visit, no obligation.", "See my price"),
        cols("bone", "How it works", "Three things you get.", [
            {"k": "01", "h": "Your real roof", "p": "Measured from satellite data: size, direction, angle and how much sun each side gets."},
            {"k": "02", "h": "Your real numbers", "p": "A rough cost, your yearly saving and how long it takes to pay back, with or without a battery."},
            {"k": "03", "h": "Your decision", "p": "Like what you see? Book a short call and we confirm a fixed price. If not, nothing else happens."}],
            btn("quote/index.html", "Get my quote")),
        strip("blk", "Recent work", "Homes we've fitted.", HOME_STRIP),
        voices(), faq("blk", "Common questions", "Before you start.", FAQ_HOME),
        formscr("bone", "Prefer a call?", "We'll ring<br>you back.", "Leave your number and we'll call when it suits you.", "callback"),
        end("Ready when<br>you are.", "It takes about a minute, and you'll see your own roof with panels on it.")])
    page("get-quote.html", "Free online solar quote | Midlands Solar Installations", "See solar panels on your own roof and get a price in about a minute.", body, landing=True)

def about():
    towns = " <i>·</i> ".join(AREAS)
    nums = ('<div class="nums"><div><b data-count="10" data-s="+">10+</b><span>years fitting solar</span></div>'
            '<div><b data-count="4.9" data-d="1">4.9</b><span>out of 5 from our customers</span></div><div><b>MCS</b><span>certified installer</span></div></div>')
    body = "\n".join([
        phero("About us", h1("Renewable energy,", "<em>done properly.</em>"), "Midlands Solar was set up to make switching to solar simpler, clearer and more dependable for homes and businesses across the region.", vid("wide-snowdon-1", True)),
        split("bone", "Our story", "A local team,<br>built on trust.",
              sub("We started Midlands Solar because buying solar was harder than it should be: pushy sales visits, vague numbers and installers you never heard from again.")
              + sub("We do it differently. Straight advice about what your roof can do, a system designed around how you use electricity, and the same Midlands team for the install and everything after it.")
              + f'<div class="btns">{btn("quote/index.html", "Get my quote")}</div>', vid("fly-snowdon-2")),
        cols("blk", "What we stand for", "A better way to buy solar.", [
            {"k": "01", "h": "Honest advice", "p": "Recommendations based on your property, your usage and your goals. If solar won't pay back for you, we'll say so."},
            {"k": "02", "h": "Careful installs", "p": "Tidy cable runs, properly fixed panels and a system set up to perform for decades, not just on handover day."},
            {"k": "03", "h": "Local support", "p": "Aftercare, servicing and upgrades from a team based in the Midlands, on the end of the phone when you need us."}]),
        f'<section class="scr bone">{lab("Where we work")}<p class="towns" data-up>{towns} <i>·</i> and everywhere between.</p>{nums}</section>',
        voices("blk"),
        formscr("bone", "Contact us", "Talk to<br>the team.", "Ask a question, check we cover your area, or book a survey."),
        end()])
    page("about.html", "About us | Midlands Solar Installations", "A Midlands-based team fitting solar panels and batteries for homes, businesses and farms.", body, "about.html")

def work():
    homes = [fig(vid("fly-glades-1"), "Roof install", "Drone film"), fig(img("home-drone-1.jpg", "Solar across two roof faces"), "Solar across two roof faces", "", True),
             fig(img("home-1.jpg", "Rooftop solar"), "Rooftop solar"), fig(img("home-3.jpg", "All-black panels"), "All-black panels"), fig(vid("orbit-2"), "From above", "Drone film", True),
             fig(img("home-4.jpg", "Solar on a hipped roof"), "Solar on a hipped roof"), fig(img("home-2.jpg", "Rooftop solar"), "Rooftop solar"), fig(vid("fly-snowdon-1"), "Roof install", "Drone film"),
             fig(img("home-5.jpg", "Solar on a rear roof"), "Solar on a rear roof"), fig(img("home-6.jpg", "Rooftop solar"), "Rooftop solar")]
    bats = [fig(img(f, t), t) for f, t in [("bat-ecoflow-1.jpg", "EcoFlow battery storage"), ("bat-sunsynk.jpg", "Sunsynk inverter and batteries"), ("bat-fox.jpg", "Fox ESS inverter and batteries"),
            ("bat-ecoflow-2.jpg", "EcoFlow battery storage"), ("bat-growatt.jpg", "Growatt inverter and batteries"), ("bat-sigen.jpg", "Sigenergy battery storage"),
            ("bat-outdoor.jpg", "Outdoor inverter and battery"), ("bat-hanchu.jpg", "Hanchu inverter and battery"), ("bat-ecoflow-3.jpg", "EcoFlow battery storage")]]
    coms = [fig(vid("commercial"), "Commercial roof", "Drone film", True), fig(img("com-1.jpg", "Commercial roof array"), "Commercial roof array", "", True),
            fig(img("com-2.jpg", "Solar on both sides of a pitched roof"), "Both sides of a pitched roof", "", True), fig(img("com-3.jpg", "Flat roof array"), "Flat roof array", "", True),
            fig(img("com-5.jpg", "Commercial roof array"), "Commercial roof array", "", True), fig(img("com-4.jpg", "Flat roof install in progress"), "Install in progress", "", True)]
    body = "\n".join([
        phero("Recent work and reviews", h1("Real roofs.", "<em>Real installs.</em>"), "Every photo and film here is a system we designed and fitted. No stock images.", vid("hero-orbit", True)),
        strip("bone", "Homes", "Solar on homes.", homes), strip("blk", "Batteries and inverters", "Storage we've fitted.", bats),
        strip("bone", "Commercial", "Bigger roofs.", coms, tl("commercial.html", "Commercial solar")),
        voices("blk"),
        end("Want yours to<br>look like this?", "Enter your postcode and see panels on your own roof in about a minute.")])
    page("work.html", "Recent work and reviews | Midlands Solar Installations", "Photos and drone films of recent solar panel and battery installations across the Midlands, and what our customers say.", body, "work.html")

# ------------------------------------------------------------------ funding and grants
# One entry per scheme. Each gets a card on the funding page and its own page.
# Check these against GOV.UK before going live: schemes open, close and change.
GRANTS = [
    {"file": "grant-0-vat.html", "tag": "Every home", "big": "0% VAT", "name": "0% VAT on solar and batteries",
     "short": "No VAT on solar panels or battery storage fitted to your home. Already in our prices.",
     "lede": "Solar panels and battery storage fitted to homes are zero-rated for VAT. You don't apply for it: it comes off the price automatically.",
     "facts": [("Who gets it", "Every home"), ("What you save", "The full 20% VAT"), ("Runs until", "31 March 2027")],
     "how": [("We quote without VAT", "Every home price we give you already has the VAT taken off."), ("We fit your system", "The zero rate covers the equipment and the installation together."),
             ("Nothing to claim", "There are no forms and nothing to send to HMRC.")],
     "who_h": "Who it covers.", "who_p": "The zero rate applies to energy-saving materials installed in residential property.",
     "who": ["Solar panels fitted to your home", "Battery storage, with solar or added on its own", "Homes in England, Scotland and Wales", "The rate is due to go to 5% from April 2027"],
     "faq": [("Do I have to apply?", "No. We simply charge 0% VAT on the invoice."), ("Does it cover a battery on its own?", "Yes. Since February 2024 batteries are zero-rated whether or not they are fitted with solar panels."),
             ("What happens after March 2027?", "Under current rules the rate rises to 5%, so installs completed before then avoid that cost.")]},
    {"file": "grant-smart-export-guarantee.html", "tag": "Every MCS install", "big": "SEG", "name": "Smart Export Guarantee",
     "short": "Your energy supplier pays you for the spare power you send back to the grid.",
     "lede": "When your panels make more than you're using, the spare power goes to the grid. Under the Smart Export Guarantee an energy supplier pays you for every unit.",
     "facts": [("Who gets it", "Any home with an MCS install"), ("What you get", "Paid per unit exported"), ("Paid by", "Your chosen supplier")],
     "how": [("We fit and certify", "After the install you receive an MCS certificate for your system."), ("You pick a tariff", "Compare export tariffs and apply to the supplier you choose. It doesn't have to be your own supplier."),
             ("You get paid", "Your smart meter records what you export and the supplier pays you for it.")],
     "who_h": "What you need.", "who_p": "Most homes we fit qualify straight away.",
     "who": ["An MCS-certified installation (ours are)", "A smart meter that records exports every half hour", "A system of up to 5MW, which covers every home", "Rates differ between suppliers, so it pays to compare"],
     "faq": [("How much will I be paid?", "It depends on the tariff. Suppliers set their own rates, and some pay much more than others, especially to their own customers."),
             ("Do I have to switch supplier?", "No. You can keep your current supplier for the power you buy and use a different one for export."),
             ("Is a battery still worth it?", "Usually. A battery lets you use more of your own power, which is worth more per unit than exporting it. The quote shows both.")]},
    {"file": "grant-warm-homes-loans.html", "tag": "Most homeowners", "big": "Loans", "name": "Warm Homes Plan loans",
     "short": "Government-backed, lower-cost loans for solar panels and batteries.",
     "lede": "The government's Warm Homes Plan includes government-backed loans, at reduced interest, to help homeowners pay for solar panels and battery storage.",
     "facts": [("Who it's for", "Homeowners who don't qualify for a grant"), ("What it is", "A reduced-rate loan"), ("Offered through", "Participating lenders")],
     "how": [("Get your price", "Start with a quote so you know what your system costs."), ("We check what's open", "The loans are offered through participating lenders. We'll tell you what is available when you enquire."),
             ("Apply to the lender", "The lender carries out its own checks and sets the terms.")],
     "who_h": "Who it's aimed at.", "who_p": "The loans are for households that can't get a grant but would rather not pay in one go.",
     "who": ["Owner-occupiers, and private landlords", "Solar panels, battery storage and heat pumps", "Subject to the lender's own checks", "Details are still being rolled out, so ask us for the latest"],
     "faq": [("Is it free money?", "No. It is a loan that you repay, at a lower interest rate than a normal loan because the government subsidises it."),
             ("Is it open now?", "The scheme is being introduced in stages through participating lenders. Ask us and we'll tell you where it stands when you enquire."),
             ("Can I use your finance instead?", "Yes. See our finance page for the ways to spread the cost with us.")]},
    {"file": "grant-warm-homes-local-grant.html", "tag": "Income and EPC based", "big": "Grant", "name": "Warm Homes: Local Grant",
     "short": "Funded energy upgrades, which can include solar, for lower-income homes with a low energy rating.",
     "lede": "A government grant, run by local councils, that pays for energy upgrades in lower-income homes. Solar panels are one of the upgrades it can cover.",
     "facts": [("Who it's for", "Household income of £36,000 or less"), ("Your home", "Energy rating of D, E, F or G"), ("Run by", "Your local council")],
     "how": [("Check on GOV.UK", "Use the government's online checker to see if your household and home qualify."), ("Your council contacts you", "If you're eligible, the council gets in touch and arranges a home survey."),
             ("Upgrades are fitted", "The council decides which upgrades suit your home and arranges the work.")],
     "who_h": "Who qualifies.", "who_p": "You need a privately owned home in England with a low energy rating, and to meet one of the income rules.",
     "who": ["You own your home, or rent it from a private landlord", "Energy rating (EPC) of D to G", "Household income of £36,000 or less, or on certain benefits, or in an eligible postcode", "Funding is limited and not every council is taking applications"],
     "faq": [("Will it definitely pay for solar?", "Not always. The council's surveyor decides which upgrades suit your home. Solar panels are on the list, alongside insulation and heat pumps."),
             ("Can you apply for me?", "The application goes through GOV.UK and your council, not through us. We can tell you whether it looks worth applying before you pay for anything."),
             ("What if I don't qualify?", "Most homes don't. You still get 0% VAT and export payments, and you can spread the cost.")]},
    {"file": "grant-eco4.html", "tag": "Benefits based", "big": "ECO4", "name": "ECO4 and energy supplier schemes",
     "short": "The supplier-funded scheme that paid for upgrades in low-income homes. Now winding down.",
     "lede": "Under the Energy Company Obligation, larger energy suppliers paid for upgrades, sometimes including solar, in low-income homes. The scheme is being wound down.",
     "facts": [("Who it was for", "Households on certain benefits"), ("Status", "Closing to new applications"), ("Look at instead", "Warm Homes: Local Grant")],
     "how": [("Already applied?", "If you have an application in progress, speak to the supplier or installer handling it."), ("Starting now?", "Check the Warm Homes: Local Grant first. It is the main route for funded upgrades."),
             ("Not eligible?", "You still get 0% VAT and export payments on a system you pay for.")],
     "who_h": "Where it stands.", "who_p": "ECO4 was the fourth round of the scheme. The government has said it will not be replaced like for like.",
     "who": ["It covered homes on means-tested benefits with a low energy rating", "Solar was only funded alongside other upgrades", "New applications are no longer being taken by most suppliers", "We'll tell you if anything else is open for your address"],
     "faq": [("Can I still get free solar through ECO4?", "For most people, no. Suppliers have stopped taking new applications as the scheme ends."),
             ("What replaced it?", "There is no direct replacement. The Warm Homes: Local Grant is now the main scheme for lower-income households in England."),
             ("Is anyone offering 'free solar' genuine?", "Be careful. Fully funded solar only comes through official schemes with strict rules. If someone promises it to everyone, ask which scheme it is.")]},
]

def gcard(g, link=True):
    inner = f'<span class="tag">{g["tag"]}</span><div class="big">{g["big"]}</div><h3>{g["name"]}</h3><p>{g["short"]}</p>'
    return f'<a class="gcard" href="{g["file"]}" data-up>{inner}<span class="tl">Read more <i>→</i></span></a>'

def funding():
    body = "\n".join([
        phero("Government funding", h1("Help with the", "<em>cost of solar.</em>"), "There's no single solar grant for everyone, but every home gets some help and some homes get a lot. Tap any scheme to see how it works.", vid("wide-glades-1", True)),
        f'<section class="scr bone">{head("For most homes", "Help you can get now.", sub("These apply to almost everyone. No means test."))}<div class="gcards" style="--n:3">{"".join(gcard(g) for g in GRANTS[:3])}</div></section>',
        f'<section class="scr blk">{head("If you qualify", "Grants for some households.", sub("Aimed at lower-income homes and homes that are expensive to heat."))}<div class="gcards" style="--n:2">{"".join(gcard(g) for g in GRANTS[3:])}</div>'
        '<p class="note">This is a guide, not financial advice. Schemes change and some depend on your council. We confirm exactly what you can claim when we quote.</p></section>',
        faq("bone", "Questions", "Funding, answered.", [
            ("Is there a free solar panel scheme?", "Not for everyone. Fully funded solar is limited to households that meet income, benefits or energy-rating rules. Most customers pay for their system and benefit from 0% VAT and export payments."),
            ("Do I have to apply for 0% VAT?", "No. It applies automatically to solar panels and batteries fitted to homes, and it's already in the price we quote."),
            ("How do I get paid for exported power?", "After your install you receive an MCS certificate. You choose an export tariff from a supplier and they pay you for what your smart meter records going back to the grid."),
            ("Can you check what I qualify for?", "Yes. Tell us your postcode and a little about your household and we'll tell you which schemes are open to you.")]),
        formscr("blk", "Check what you qualify for", "Ask us about<br>funding.", "Tell us a little about your home and we'll tell you which schemes are open to you."),
        end("Start with<br>your price.", "See what solar would cost for your roof, then we'll tell you what funding applies.")])
    page("funding.html", "Government funding and grants for solar panels | Midlands Solar Installations", "0% VAT, Smart Export Guarantee payments, Warm Homes grants and loans for solar panels: what's available and who qualifies.", body, "funding.html")

def grants():
    for g in GRANTS:
        facts = "".join(f'<div class="gcard"><span class="tag">{k}</span><h3>{v}</h3></div>' for k, v in g["facts"])
        others = [o for o in GRANTS if o is not g][:3]
        body = "\n".join([
            f'<section class="scr ghero blk" data-hero><a class="back" href="funding.html">← All funding</a>{lab("Government funding")}<h1>{g["name"]}</h1>'
            f'<p class="sub" data-hin style="max-width:60ch">{g["lede"]}</p><div class="facts" data-hin>{facts}</div></section>',
            cols("bone", "How it works", "Three steps.", [{"k": f"0{i+1}", "h": t, "p": d} for i, (t, d) in enumerate(g["how"])]),
            split("blk", "Who it's for", g["who_h"], sub(g["who_p"]) + ticks(g["who"]) + f'<div class="btns">{btn("#contact", "Check if I qualify")}</div>', img("home-3.jpg", "Solar panels on a house roof")),
            faq("bone", "Questions", "Good to know.", g["faq"]),
            formscr("blk", "Check if you qualify", "Ask us<br>about this.", "Tell us a little about your home and we'll tell you whether this applies to you."),
            f'<section class="scr bone">{head("Other funding", "More ways to get help.", tl("funding.html", "All funding"))}<div class="gcards" style="--n:3">{"".join(gcard(o) for o in others)}</div></section>',
            end("Start with<br>your price.", "See what solar would cost for your roof, then we'll tell you what funding applies.")])
        page(g["file"], f'{g["name"]} | Midlands Solar Installations', g["short"], body, "funding.html")

# ------------------------------------------------------------------ finance
# Fill these in once the lender is confirmed. Anything left as None shows as "To be confirmed".
LENDER = {
    "Lender": None,
    "Authorised and regulated by": "Financial Conduct Authority",
    "Lender's FCA number": None,
    "Representative APR": None,
    "Loan terms available": None,
    "Deposit": None,
    "Our FCA number (as credit broker)": None,
}
REP_EXAMPLE = None  # the lender's representative example wording, once supplied

def finance():
    tbc = '<span class="tbc">To be confirmed</span>'
    rows = "".join(f"<div><dt>{k}</dt><dd>{v or tbc}</dd></div>" for k, v in LENDER.items())
    lender = (f'<section class="scr formscr bone" id="lender"><div>{lab("Who provides the finance")}<h2 data-rise>Your lender.</h2>'
              + sub("We arrange finance through a regulated lender. The lender makes the lending decision and you sign your agreement with them, not with us.")
              + sub("Midlands Solar Installations Ltd acts as a credit broker, not a lender.")
              + f'</div><div class="gcard" data-up><span class="tag">Lender details</span><dl>{rows}</dl>'
              + f'<p style="font-size:14.5px">{REP_EXAMPLE or "Representative example: " + tbc}</p></div></section>')
    ways = [("Option 1", "Pay in full", "The lowest overall cost. A deposit secures your install date, with the balance due once the system is fitted and working.", ""),
            ("Option 2", "Spread the cost", "Pay monthly instead of all at once. We show the monthly payment next to your expected monthly saving.", '<a class="tl" href="#lender">About the lender <i>→</i></a>'),
            ("Option 3", "Grants and funding", "Some households qualify for help with the cost. We check what's open for your address.", tl("funding.html", "Government funding"))]
    cards = "".join(f'<div class="gcard" data-up><span class="tag">{k}</span><h3>{h}</h3><p>{p}</p>{l}</div>' for k, h, p, l in ways)
    hero_ = phero("Finance options", h1("Spread the cost", "<em>of solar.</em>"), "Pay in one go or pay monthly. We show you the figures for both, side by side with what the system should save you.",
                  vid("wide-glades-3", True), f'<div class="btns" data-hin>{btn("quote/index.html", "See my numbers")}<a class="tl" href="#lender">About the lender <i>→</i></a></div>')
    body = "\n".join([
        hero_,
        f'<section class="scr bone">{head("Ways to pay", "Three ways to do it.")}<div class="gcards" style="--n:3">{cards}</div>'
        '<p class="note">Finance is subject to status and affordability checks. Terms apply. Speak to us for full details before you decide.</p></section>',
        split("blk", "How it adds up", "Savings first,<br>then the cost.",
              sub("Solar pays you back in two ways: you buy less electricity, and your supplier pays you for what you export. The online quote estimates both for your roof.")
              + ticks(["Yearly saving on your electricity bill", "Yearly income from exported power", "How many years the system takes to pay for itself", "The same figures with a battery added"])
              + f'<div class="btns">{btn("quote/index.html", "See my numbers")}</div>', img("home-1.jpg", "Solar panels on a house roof")),
        lender,
        faq("blk", "Questions", "Paying for solar.", [
            ("When do I pay?", "If you pay in full, a deposit secures your install date and the balance is due once the system is installed and working. If you spread the cost, your agreement with the lender sets out the payment dates."),
            ("Will the savings cover a monthly payment?", "It depends on your roof, your usage and the term you choose. We show the expected monthly saving next to the monthly payment so you can compare them directly."),
            ("Who am I borrowing from?", "The lender named on this page. They carry out the credit check and you sign your agreement with them."),
            ("Does a battery change the numbers?", "Usually, yes. A battery costs more up front but lets you use more of your own power, which raises the saving. The quote shows both versions.")]),
        formscr("bone", "Ask about finance", "Want a personal<br>illustration?", "Leave your details and we'll talk you through the monthly figures."),
        end()])
    page("finance.html", "Finance options for solar | Midlands Solar Installations", "Ways to pay for solar panels and batteries: pay in full or spread the cost monthly through a regulated lender.", body, "finance.html")

# ------------------------------------------------------------------ products
def shot(slug, fallback, alt):
    """Product picture. Drop a cut-out photo at assets/img/products/<slug>.png (transparent
    background) and it replaces the placeholder job photo automatically."""
    p = f"assets/img/products/{slug}.png"
    if os.path.exists(os.path.join(ROOT, p)):
        return f'<div class="shot cut"><img src="{p}" alt="{html.escape(alt)}" loading="lazy"></div>'
    return f'<div class="shot">{img(fallback, alt)}</div>'

def prod(slug, name, desc, fallback, alt):
    return f'<figure class="prod" data-tilt><div class="back"></div>{shot(slug, fallback, alt)}<figcaption class="txt"><h3>{name}</h3><p>{desc}</p></figcaption></figure>'

def products():
    bats = [prod(*b) for b in [
        ("ecoflow", "EcoFlow", "Slim, stackable tower. Add modules later.", "bat-ecoflow-3.jpg", "EcoFlow battery"),
        ("fox-ess", "Fox ESS", "Wall-mounted inverter and battery packs.", "bat-fox.jpg", "Fox ESS inverter and batteries"),
        ("sunsynk", "Sunsynk", "Hybrid inverter with backup power options.", "bat-sunsynk.jpg", "Sunsynk inverter and batteries"),
        ("sigenergy", "Sigenergy", "Inverter and battery in a single cabinet.", "bat-sigen.jpg", "Sigenergy battery"),
        ("growatt", "Growatt", "Widely used, with a clear monitoring app.", "bat-growatt.jpg", "Growatt inverter and batteries"),
        ("hanchu", "Hanchu", "Compact storage for homes with less space.", "bat-hanchu.jpg", "Hanchu inverter and battery")]]
    rest = [prod(*r) for r in [
        ("inverter", "Inverter", "Turns your panels' output into power your home can use.", "inv-fox.jpg", "Inverter on a wall"),
        ("monitoring", "Monitoring app", "See what you make, use, store and export, live.", "bat-growatt.jpg", "Inverter and batteries"),
        ("ev-charger", "EV charger", "Charge the car on your spare solar power.", "bat-outdoor.jpg", "Outdoor unit")]]
    panels = (f'<section class="scr split bone" id="panels"><div class="pstage" data-tilt>{shot("panel", "home-1.jpg", "All-black solar panels")}</div>'
              f'<div class="split-txt">{lab("Solar panels")}<h2 data-rise>All-black panels that look right on a house.</h2>'
              + sub("High-efficiency panels with black frames and black backing, so the array reads as one clean block on your roof.")
              + ticks(["Laid out around your roof's shape, vents and windows", "Fixed to the rafters, with the roof made good around every bracket", "Product warranties of 25 years"])
              + f'<div class="btns">{btn("quote/index.html", "See them on my roof")}</div></div></section>')
    body = "\n".join([
        phero("Products we fit", h1("Good kit,", "<em>fitted properly.</em>"), "We choose equipment we'd put on our own homes, and match it to your roof and how you use power.", vid("wide-snowdon-2", True)),
        panels,
        f'<section class="scr flush work bone" id="batteries" data-xpin>{head("Battery storage", "Use your own power after dark.", sub("A battery stores what your panels make in the day. These are makes we fit."))}'
        f'<div class="track" data-track>{"".join(bats)}</div></section>',
        f'<section class="scr bone" id="inverters">{head("The rest of the system", "Inverters, monitoring and EV chargers.")}<div class="prods">{"".join(rest)}</div></section>',
        formscr("blk", "Not sure what you need?", "Ask us what<br>suits your home.", "Tell us about your home and how you use power and we'll recommend a setup."),
        end("See what fits<br>your roof.", "The quote shows how many panels your roof takes and what a battery would add.")])
    page("products.html", "Solar panels, batteries and inverters we fit | Midlands Solar Installations", "The solar panels, battery storage, inverters and EV chargers Midlands Solar installs.", body, "products.html")


def biz(file, name, head1, lede, media, intro_h, intro, points, uses, other, shot):
    body = "\n".join([
        phero(name, head1, lede, media),
        split("bone", name, intro_h, sub(intro) + ticks(points) + f'<div class="btns">{btn("#contact", "Request a site survey")}<a class="tl" href="{PHONE_HREF}">Call {PHONE}</a></div>', shot),
        cols("blk", "Where it works", "Built around how you use power.", [{"k": f"0{i+1}", "h": t, "p": d} for i, (t, d) in enumerate(uses)]),
        cols("bone", "How a project runs", "Survey, design, install, support.", [
            {"k": "01", "h": "Site survey", "p": "We look at the roof or land, the structure, your supply and your half-hourly usage."},
            {"k": "02", "h": "Design and proposal", "p": "A system sized to your daytime demand, with generation, savings and payback set out clearly."},
            {"k": "03", "h": "Installation", "p": "Planned around your operations, including the grid connection application."},
            {"k": "04", "h": "Monitoring and upkeep", "p": "Ongoing monitoring, servicing and cleaning to keep the system performing."}], tl(*other)),
        formscr("blk", name, "Let's look at<br>your site.", "Larger systems are priced after a survey. Tell us about your building and we'll arrange a visit.", "survey")])
    page(file, f"{name} | Midlands Solar Installations", lede, body, "commercial.html")

def contact():
    body = "\n".join([
        formscr("blk", "Contact us", "Talk to<br>the team.", "Ask a question, check we cover your area, or book a survey. For a home solar price, the online quote is the quickest route.", tag="h1"),
        end("Want a price<br>for your home?", "Skip the form. See panels on your roof and a rough cost in about a minute.")])
    page("contact.html", "Contact us | Midlands Solar Installations", "Contact Midlands Solar Installations by phone, email or message.", body, "contact.html")

if __name__ == "__main__":
    home(); landing(); about(); work(); funding(); grants(); finance(); products(); contact()
    biz("commercial.html", "Commercial solar", h1("Cut your site's", "<em>energy bill.</em>"), "Solar for offices, warehouses, factories, schools and retail units across the Midlands.",
        vid("commercial", True), "Lower running costs, fixed for decades.",
        "Businesses use most of their electricity in daylight, which is exactly when solar produces it. A well-sized system cuts what you buy from the grid.",
        ["Designed around your half-hourly usage data", "Pitched, flat and metal-clad roofs", "Grid connection applications handled for you", "Battery storage and EV charging where they pay back"],
        [("Offices and retail", "Daytime demand from lighting, IT and air conditioning lines up well with solar output."),
         ("Warehouses and factories", "Large, unshaded roofs and steady daytime loads make for strong returns."),
         ("Schools and public buildings", "Lower bills and a visible commitment to cutting carbon.")],
        ("agricultural.html", "Looking for agricultural solar?"), img("com-3.jpg", "Rows of solar panels on a large flat roof"))
    biz("agricultural.html", "Agricultural solar", h1("Power the farm", "<em>from the barn roof.</em>"), "Solar for farms, rural buildings and high-usage agricultural sites across the Midlands.",
        vid("orbit-2", True), "Put your biggest roofs to work.",
        "Barns, grain stores and livestock buildings offer large roofs with little shading. Solar cuts the cost of refrigeration, ventilation, drying and pumping.",
        ["Systems sized to seasonal and daily demand", "Suitable for steel, fibre-cement and tiled roofs", "Three-phase supplies and larger grid connections", "Battery storage to cover early mornings and evenings"],
        [("Dairy and livestock", "Milking, cooling and ventilation run every day, so generated power is used on site."),
         ("Arable and storage", "Grain drying and cold stores draw heavily in summer, when output is highest."),
         ("Diversified sites", "Farm shops, workshops and holiday lets all share the same supply and savings.")],
        ("commercial.html", "Looking for commercial solar?"), img("com-5.jpg", "Solar panels on a large roof"))
    print("built", 10 + len(GRANTS), "pages")
