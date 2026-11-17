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

def phero(label, h1, lede, media):
    """Inner page hero: full-screen photo or clip with the page title over it."""
    return (f'<section class="scr phero" data-hero><div class="media">{media}</div>'
            f'<div>{lab(label)}<h1>{h1}</h1><p class="sub" data-hin>{lede}</p></div></section>')

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
        phero("About us", h1("Renewable energy,", "<em>done properly.</em>"), "Midlands Solar was set up to make switching to solar simpler, clearer and more dependable for homes and businesses across the region.", img("home-drone-2.jpg")),
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

def funding():
    body = "\n".join([
        phero("Government funding", h1("Help with the", "<em>cost of solar.</em>"), "There's no single solar grant for everyone, but most homes get some help. Here's what's available and who it's for.", img("home-3.jpg")),
        cols("bone", "For every home", "Support you get automatically.", [
            {"k": "EVERYONE", "big": "0% VAT", "h": "No VAT on home solar and batteries", "p": "Solar panels and battery storage fitted to homes are zero-rated for VAT until 31 March 2027. It's already in our prices, so there's nothing to claim."},
            {"k": "EVERYONE WITH AN MCS INSTALL", "big": "SEG", "h": "Get paid for the power you export", "p": "Under the Smart Export Guarantee, energy suppliers pay you for electricity you send back to the grid. You need an MCS-certified install and a smart meter."}]),
        cols("blk", "For some households", "Grants, if you qualify.", [
            {"k": "INCOME AND EPC BASED", "h": "Warm Homes: Local Grant", "p": "Funding for energy upgrades, which can include solar panels, for eligible households in England. It's delivered through participating local councils."},
            {"k": "BENEFITS AND INCOME BASED", "h": "Energy supplier schemes", "p": "Larger energy suppliers have funded home upgrades for eligible households. What's covered and who qualifies changes, so ask us what applies now."}],
            note="This page is a guide, not financial advice. Schemes change and some depend on your council. We'll confirm exactly what you can claim when we quote."),
        faq("bone", "Questions", "Funding, answered.", [
            ("Is there a free solar panel scheme?", "Not for everyone. Fully funded solar is limited to households that meet income, benefits or energy-rating rules under specific schemes. Most customers pay for their system and benefit from 0% VAT and export payments."),
            ("Do I have to apply for 0% VAT?", "No. It applies automatically to solar panels and batteries fitted to homes, and it's already reflected in the price we quote."),
            ("How do I get Smart Export Guarantee payments?", "After your install you receive an MCS certificate. You choose an export tariff from a supplier, send them the certificate, and they pay you for the power your smart meter records going back to the grid."),
            ("Can you check what I qualify for?", "Yes. Tell us your postcode and a little about your household when you enquire, and we'll tell you which schemes are open to you.")]),
        formscr("blk", "Check what you qualify for", "Ask us about<br>funding.", "Tell us a little about your home and we'll tell you which schemes are open to you."),
        end("Start with<br>your price.", "See what solar would cost for your roof, then we'll tell you what funding applies.")])
    page("funding.html", "Government funding for solar panels | Midlands Solar Installations", "0% VAT, Smart Export Guarantee payments and grants for solar panels: what's available and who qualifies.", body, "funding.html")

def finance():
    body = "\n".join([
        phero("Finance options", h1("Pay <em>your way.</em>"), "Solar is a long-term saving. Pay in one go or spread the cost: we show you the figures for both so you can choose.", img("bat-ecoflow-2.jpg")),
        cols("bone", "Ways to pay", "Three ways to do it.", [
            {"k": "OPTION 1", "h": "Pay in full", "p": "The lowest overall cost. A deposit secures your install date, with the balance due once the system is fitted and working."},
            {"k": "OPTION 2", "h": "Spread the cost", "p": "Pay monthly instead of all at once. Ask us for a personal illustration showing the monthly payment next to your expected monthly saving."},
            {"k": "OPTION 3", "h": "Grants and funding", "p": "Some households qualify for help with the cost. We check what's open for your address.", "link": tl("funding.html", "Government funding")}],
            note="Finance is subject to status and affordability checks. Terms apply. Speak to us for full details before you decide."),
        split("blk", "How it adds up", "Savings first,<br>then the cost.",
              sub("Solar pays you back in two ways: you buy less electricity, and your supplier pays you for what you export. The online quote estimates both for your roof.")
              + ticks(["Yearly saving on your electricity bill", "Yearly income from exported power", "How many years the system takes to pay for itself", "The same figures with a battery added"])
              + f'<div class="btns">{btn("quote/index.html", "See my numbers")}</div>', img("home-1.jpg", "Solar panels on a house roof")),
        faq("bone", "Questions", "Paying for solar.", [
            ("When do I pay?", "If you pay in full, a deposit secures your install date and the balance is due once the system is installed and commissioned. If you spread the cost, your agreement sets out the payment dates."),
            ("Will the savings cover a monthly payment?", "It depends on your roof, your usage and the term you choose. We show the expected monthly saving next to the monthly payment so you can compare them directly."),
            ("Does a battery change the numbers?", "Usually, yes. A battery costs more up front but lets you use more of your own power, which raises the saving. The quote shows both versions.")]),
        formscr("blk", "Ask about finance", "Want a personal<br>illustration?", "Leave your details and we'll talk you through the monthly figures."),
        end()])
    page("finance.html", "Finance options for solar | Midlands Solar Installations", "Ways to pay for solar panels and batteries: pay in full or spread the cost.", body, "finance.html")

def products():
    bats = [fig(img(f, a), n, d) for f, a, n, d in [
        ("bat-ecoflow-3.jpg", "EcoFlow battery stack in a garage", "EcoFlow", "Slim, stackable tower. Add modules later."),
        ("bat-fox.jpg", "Fox ESS inverter and batteries on a wall", "Fox ESS", "Wall-mounted inverter and battery packs."),
        ("bat-sunsynk.jpg", "Sunsynk inverter above two batteries", "Sunsynk", "Hybrid inverter with backup power options."),
        ("bat-sigen.jpg", "Sigenergy battery unit", "Sigenergy", "Inverter and battery in a single cabinet."),
        ("bat-growatt.jpg", "Growatt inverter and batteries", "Growatt", "Widely used, with a clear monitoring app."),
        ("bat-hanchu.jpg", "Hanchu inverter and battery", "Hanchu", "Compact storage for homes with less space.")]]
    body = "\n".join([
        phero("Products we fit", h1("Good kit,", "<em>fitted properly.</em>"), "We choose equipment we'd put on our own homes, and match it to your roof and how you use power.", img("home-2.jpg")),
        split("bone", "Solar panels", "All-black panels that look right on a house.",
              sub("High-efficiency panels with black frames and black backing, so the array reads as one clean block on your roof.")
              + ticks(["Laid out around your roof's shape, vents and windows", "Fixed to the rafters, with the roof made good around every bracket", "Product warranties of 25 years"])
              + f'<div class="btns">{btn("quote/index.html", "See them on my roof")}</div>', vid("fly-glades-3"), sid="panels"),
        strip("blk", "Battery storage", "Use your own power after dark.", bats, sub("A battery stores what your panels make in the day. These are systems we've fitted recently."), "batteries"),
        cols("bone", "The rest of the system", "Inverters, monitoring and EV chargers.", [
            {"k": "INVERTER", "h": "The part that does the work", "p": "The inverter turns the panels' output into power your home can use. We size it to your array and leave room for a battery.", "media": img("inv-fox.jpg", "Inverter on a wall")},
            {"k": "MONITORING", "h": "Watch it working", "p": "An app on your phone shows what you're generating, using, storing and exporting, live and over time.", "media": img("bat-growatt.jpg", "Inverter and batteries")},
            {"k": "EV CHARGER", "h": "Charge the car on sunshine", "p": "Add a home charger that can use your spare solar power before it goes to the grid.", "media": img("bat-outdoor.jpg", "Outdoor inverter and battery")}], sid="inverters"),
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
    home(); landing(); about(); work(); funding(); finance(); products(); contact()
    biz("commercial.html", "Commercial solar", h1("Cut your site's", "<em>energy bill.</em>"), "Solar for offices, warehouses, factories, schools and retail units across the Midlands.",
        vid("commercial", True), "Lower running costs, fixed for decades.",
        "Businesses use most of their electricity in daylight, which is exactly when solar produces it. A well-sized system cuts what you buy from the grid.",
        ["Designed around your half-hourly usage data", "Pitched, flat and metal-clad roofs", "Grid connection applications handled for you", "Battery storage and EV charging where they pay back"],
        [("Offices and retail", "Daytime demand from lighting, IT and air conditioning lines up well with solar output."),
         ("Warehouses and factories", "Large, unshaded roofs and steady daytime loads make for strong returns."),
         ("Schools and public buildings", "Lower bills and a visible commitment to cutting carbon.")],
        ("agricultural.html", "Looking for agricultural solar?"), img("com-3.jpg", "Rows of solar panels on a large flat roof"))
    biz("agricultural.html", "Agricultural solar", h1("Power the farm", "<em>from the barn roof.</em>"), "Solar for farms, rural buildings and high-usage agricultural sites across the Midlands.",
        img("com-2.jpg"), "Put your biggest roofs to work.",
        "Barns, grain stores and livestock buildings offer large roofs with little shading. Solar cuts the cost of refrigeration, ventilation, drying and pumping.",
        ["Systems sized to seasonal and daily demand", "Suitable for steel, fibre-cement and tiled roofs", "Three-phase supplies and larger grid connections", "Battery storage to cover early mornings and evenings"],
        [("Dairy and livestock", "Milking, cooling and ventilation run every day, so generated power is used on site."),
         ("Arable and storage", "Grain drying and cold stores draw heavily in summer, when output is highest."),
         ("Diversified sites", "Farm shops, workshops and holiday lets all share the same supply and savings.")],
        ("commercial.html", "Looking for commercial solar?"), img("com-5.jpg", "Solar panels on a large roof"))
    print("built 10 pages")
