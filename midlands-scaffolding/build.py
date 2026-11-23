#!/usr/bin/env python3
"""Builds the Midlands Solar Scaffolding website. Run:  python3 build.py

Pages: index, services, learn, work, about, quote. Shared pieces (header, footer,
contact form, closing band) are defined once here. Styles: assets/css/site.css.
Behaviour and animation: assets/js/site.js."""
import html, math, os

ROOT = os.path.dirname(os.path.abspath(__file__))
PHONE = "0800 654 6343"
PHONE_RAW = "08006546343"
EMAIL = "enquiries@midlandssolar.co.uk"   # shared group inbox until the scaffolding company has its own
NAV = [("services.html", "Services"), ("learn.html", "Scaffold guide"), ("work.html", "Our work"), ("about.html", "About")]

ICON = {
    "phone": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6A2 2 0 0 1 22 16.9z"/></svg>',
    "shield": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
    "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    "tag": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="m9 13 2 2 4-4M9 7h6"/></svg>',
    "sun": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    "home": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
    "broom": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M6 21V10l6-6 6 6v11"/><path d="M10 21v-5h4v5"/></svg>',
}
ARROW = "<i>→</i>"

def img(n, alt=""): return f'<img src="assets/img/{n}" alt="{html.escape(alt)}" loading="lazy">'
def lab(t): return f'<p class="lab">{t}</p>'
def btn(href, t, cls="btn"): return f'<a class="{cls}" href="{href}">{t} {ARROW}</a>'
def tl(href, t): return f'<a class="tl" href="{href}">{t} {ARROW}</a>'
def h1(*lines): return "".join(f'<span class="ln"><span>{l}</span></span>' for l in lines)
def phone(hin=False):
    return (f'<span class="phone"{" data-hin" if hin else ""}>{ICON["phone"]}<a href="tel:{PHONE_RAW}">{PHONE}</a>'
            f'<button class="copy" type="button" data-copy="{PHONE}">Copy</button></span>')

WAVE = ('<svg class="wave{cls}" viewBox="0 0 1440 170" preserveAspectRatio="none" aria-hidden="true">'
        '<path class="fill" d="M0 170V118C260 40 560 18 860 52C1100 79 1290 120 1440 96V170Z"/>'
        '<path class="rim" d="M1440 96C1290 120 1100 79 860 52C560 18 260 40 0 118"/></svg>')

# ------------------------------------------------------------------ shared sections
SERVICES = [
    ("Solar panel installs", "Safe roof access for solar fitters, with edge protection at the eaves.", "job-05.jpg", "services.html#solar"),
    ("Roof repairs", "Fully boarded lifts to the gutter line, so roofers can work and store tiles safely.", "job-09.jpg", "services.html#roofing"),
    ("Chimney work", "Chimney stack scaffolds for repointing, flashing and capping.", "job-11.jpg", "services.html#chimney"),
    ("Gutters and fascias", "Quick, tidy scaffolds for roofline, gutter and painting work.", "job-03.jpg", "services.html#roofline"),
    ("Building and extensions", "Scaffolds that grow with the build, from the first lift to the roof.", "job-10.jpg", "services.html#building"),
    ("Commercial and industrial", "Shops, units and larger buildings, planned around your site.", "job-08.jpg", "services.html#commercial"),
]

def tiles():
    t = "".join(f'<a class="tile" href="{h}" data-up>{img(p, n)}<span class="go">→</span><div><h3>{n}</h3><p>{d}</p></div></a>' for n, d, p, h in SERVICES)
    return (f'<section class="band light screen"><div class="wrap"><div class="head"><div>{lab("What we scaffold")}<h2 data-rise>Scaffolding for every<br>kind of job.</h2></div>'
            f'{tl("services.html", "All services")}</div><div class="tiles">{t}</div></div></section>')

MYTHS = [
    ("All scaffolding systems are the same.", "Tube-and-fitting scaffolds, system scaffolds and mobile towers have different assembly requirements, load capacities and uses. The right one depends on the work, the site and the access needed."),
    ("Once it's up, it can be left alone.", "A scaffold must be inspected before first use, after anything that could affect it such as bad weather, and at least every seven days while it's in use."),
    ("You can take a few boards off if they're in the way.", "Only a competent scaffolder should alter a scaffold. Removing boards, rails or ties can make it unsafe for everyone on it."),
    ("Scaffolding is only needed for big jobs.", "Even short jobs at height, like clearing gutters or fixing a few tiles, are safer and often quicker from a properly boarded platform."),
]

def myths(skin="light"):
    cards = "".join(f'<div class="myth" role="button" tabindex="0" aria-pressed="false" data-up><div class="myth-in">'
                    f'<div class="face front"><span class="tag2">Myth</span><h3>{m}</h3><span class="hint">Tap to see the fact</span></div>'
                    f'<div class="face back"><span class="tag2">Fact</span><p>{f}</p></div></div></div>' for m, f in MYTHS)
    return (f'<section class="band {skin} screen"><div class="wrap"><div class="head"><div>{lab("Myth or fact")}<h2 data-rise>Scaffolding myths,<br>sorted out.</h2></div>'
            f'<p class="sub">Tap a card to flip it.</p></div><div class="myths">{cards}</div></div></section>')

def build_demo():
    steps = [("Base plates and sole boards", "Every upright stands on a steel base plate and a timber sole board, so the load spreads and nothing sinks."),
             ("Standards", "The upright tubes. They carry the weight of the whole scaffold down to the ground."),
             ("Ledgers", "Horizontal tubes running along the building, fixed to the standards at each lift."),
             ("Transoms and boards", "Short tubes bridge to the wall and carry the boards that make a solid working platform."),
             ("Guardrails and toe boards", "Rails at the right heights and a toe board along the edge stop people and tools falling."),
             ("Bracing and ties", "Diagonal braces stop the scaffold racking sideways, and ties fix it to the building."),
             ("Ladder access and gate", "A secured ladder to each lift, with a self-closing gate at the top."),
             ("Inspected and tagged", "We check it over, tag it and hand it over, ready for the next trade.")]
    st = "".join(f'<div class="step{" on" if i == 0 else ""}"><b>STEP {i+1} OF {len(steps)}</b><h3>{t}</h3><p>{d}</p></div>' for i, (t, d) in enumerate(steps))
    meter = "".join(f'<i{" class=on" if i == 0 else ""}></i>' for i in range(len(steps)))
    return (f'<section class="band dark" id="build" style="padding-block:0"><div class="wrap build"><div>{lab("How a scaffold goes up")}'
            f'<h2>Built tube by tube.</h2><div class="steps">{st}</div><div class="meter">{meter}</div></div>'
            f'<div class="rig" id="rig"></div></div></section>')

def strip(skin="white"):
    figs = [("job-01.jpg", "Rear elevation, two lifts"), ("job-09.jpg", "Roof access with ladder gate"), ("job-04.jpg", "Front elevation, semi"),
            ("job-06.jpg", "Rear extension"), ("job-11.jpg", "Patio and chimney access"), ("job-02.jpg", "Side and rear"),
            ("job-08.jpg", "Tubes and boards on the way"), ("job-12.jpg", "Narrow side access"), ("job-05.jpg", "Handed over, ready for solar")]
    f = "".join(f'<figure>{img(p, c)}<figcaption>{c}</figcaption></figure>' for p, c in figs)
    return (f'<section class="band {skin} strip screen" data-xpin style="padding-inline:0"><div class="wrap" style="padding-inline:var(--gut)">'
            f'<div class="head"><div>{lab("Recent work")}<h2 data-rise>Up, safe and<br>handed over.</h2></div>{tl("work.html", "See all our work")}</div></div>'
            f'<div class="track" data-track>{f}</div></section>')

def planner_teaser():
    jobs = [("solar", "Solar panels"), ("roof", "Roof repairs"), ("chimney", "Chimney"), ("gutters", "Gutters and fascias"), ("build", "Building work"), ("paint", "Painting or rendering")]
    chips = "".join(f'<a href="quote.html#{k}">{n} {ARROW}</a>' for k, n in jobs)
    return (f'<section class="band cyan"><div class="wrap"><div class="head"><div>{lab("Free quote in 2 minutes")}<h2 data-rise>What do you need<br>scaffolding for?</h2></div>'
            f'<p class="sub">Pick a job and answer a few quick questions. We\'ll come back to you with a price.</p></div><div class="pick" data-up>{chips}</div></div></section>')

TOWNS = [("Wolverhampton", 52.5862, -2.1288), ("Walsall", 52.5862, -1.9829), ("Cannock", 52.6910, -2.0270), ("Telford", 52.6766, -2.4469),
         ("Dudley", 52.5087, -2.0877), ("Stafford", 52.8066, -2.1171), ("Bilston", 52.5656, -2.0735), ("Willenhall", 52.5848, -2.0539),
         ("Wednesfield", 52.6017, -2.0839), ("Codsall", 52.6283, -2.1931), ("Kidderminster", 52.3887, -2.2496), ("Bridgnorth", 52.5355, -2.4195),
         ("Stourbridge", 52.4561, -2.1477), ("Sedgley", 52.5414, -2.1225), ("Perton", 52.5900, -2.2090)]

def radar():
    cx, cy, k = 300, 300, 1050   # px per degree of latitude (approximate local map)
    lat0, lon0 = TOWNS[0][1], TOWNS[0][2]
    out = ['<svg viewBox="-80 -10 760 620" role="img" aria-label="Map of the towns we cover around Wolverhampton">']
    for r in (90, 180, 270):
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="rgba(34,38,43,.12)" stroke-dasharray="4 6"/>')
    for i in range(3):
        out.append(f'<circle class="ring" cx="{cx}" cy="{cy}" r="270" fill="none" stroke="#46B6D3" stroke-width="2"/>')
    # the map shows the main towns; the closest ones would overlap Wolverhampton, so they're listed beside it instead
    shown = {"Wolverhampton", "Walsall", "Cannock", "Telford", "Dudley", "Stafford", "Kidderminster", "Bridgnorth", "Stourbridge", "Codsall"}
    for name, lat, lon in TOWNS:
        if name not in shown: continue
        x = cx + (lon - lon0) * k * math.cos(math.radians(lat0))
        y = cy - (lat - lat0) * k
        hq = name == "Wolverhampton"
        anchor = "middle" if hq else ("end" if x < cx - 20 else "start")
        dx = 0 if hq else (-14 if anchor == "end" else 14)
        dy = 34 if hq else 7
        out.append(f'<g class="town"><circle cx="{x:.0f}" cy="{y:.0f}" r="{13 if hq else 8}" fill="{"#46B6D3" if hq else "#22262B"}"/>'
                   f'<text x="{x + dx:.0f}" y="{y + dy:.0f}" text-anchor="{anchor}" font-family="Satoshi, Arial, sans-serif" font-size="{26 if hq else 21}" font-weight="700" fill="#22262B">{name}</text></g>')
    out.append("</svg>")
    return "".join(out)

def areas(skin="light"):
    towns = "".join(f'<span{" class=hq" if t[0] == "Wolverhampton" else ""}>{t[0]}</span>' for t in TOWNS)
    return (f'<section class="band {skin} screen"><div class="wrap group"><div>{lab("Where we work")}<h2 data-rise>Wolverhampton and<br>the towns around it.</h2>'
            f'<p class="sub">Based in Wolverhampton, working across the Black Country, Staffordshire and Shropshire. Not sure if we cover you? Ask us.</p>'
            f'<div class="towns" data-up>{towns}</div></div><div class="radar" data-up>{radar()}</div></div></section>')

FAQ = [
    ("How quickly can you put a scaffold up?", "We do our best to fit short-notice jobs in. Most domestic scaffolds go up in a day once booked. Call us with your dates and we'll tell you what we can do."),
    ("Do I need permission for scaffolding?", "Not on your own land. If any part of the scaffold sits on the pavement or road, a licence from the council is needed. We'll tell you if your job needs one."),
    ("How long can I keep it?", "As long as the work takes. We agree a hire period up front, and you can extend it if the job runs over."),
    ("Who checks the scaffold is safe?", "We inspect it before handover and tag it. While it's up it must be inspected at least every seven days and after bad weather."),
    ("Will it damage my garden or drive?", "Every upright sits on a base plate and timber sole board, which spreads the load. We protect paving and lawns and leave the site tidy."),
]

def faq(skin="white", items=FAQ, title="Before you book."):
    d = "".join(f"<details><summary>{q}</summary><p>{a}</p></details>" for q, a in items)
    return (f'<section class="band {skin} screen"><div class="wrap" style="max-width:1000px"><div class="head" style="grid-template-columns:1fr">'
            f'<div>{lab("Common questions")}<h2 data-rise>{title}</h2></div></div><div class="faq">{d}</div></div></section>')

def contact(skin="dark", title="Talk to the team.", text="Tell us about the job and we'll get back to you with a price. Or call us now.", kind="contact"):
    opts = "".join(f"<option>{o}</option>" for o in ["Solar panel install", "Roof repairs", "Chimney work", "Gutters and fascias", "Building or extension", "Painting or rendering", "Commercial or industrial", "Something else"])
    return (f'<section class="band {skin} screen" id="contact"><div class="wrap contact"><div>{lab("Free quote")}<h2 data-rise>{title}</h2><p class="sub">{text}</p>'
            f'<div class="lines"><div><span>Freephone</span><strong>{PHONE}</strong></div><div><span>Email</span><strong>{EMAIL}</strong></div>'
            f'<div><span>Covering</span><strong>Wolverhampton and surrounding towns</strong></div></div></div>'
            f'<form class="form card" novalidate data-up><input type="hidden" name="form" value="{kind}">'
            f'<div class="row"><label for="{kind}-name">Name<input id="{kind}-name" name="name" autocomplete="name" required></label>'
            f'<label for="{kind}-phone">Phone<input id="{kind}-phone" name="phone" type="tel" autocomplete="tel" required></label></div>'
            f'<div class="row"><label for="{kind}-email">Email<input id="{kind}-email" name="email" type="email" autocomplete="email" required></label>'
            f'<label for="{kind}-pc">Postcode<input id="{kind}-pc" name="postcode" autocomplete="postal-code"></label></div>'
            f'<label for="{kind}-job">What\'s the job?<select id="{kind}-job" name="job">{opts}</select></label>'
            f'<label for="{kind}-msg">Anything else?<textarea id="{kind}-msg" name="message" placeholder="Dates, which sides of the building, access…"></textarea></label>'
            f'<button class="btn" type="submit">Send my enquiry {ARROW}</button>'
            f'<p class="ok" role="status">Thanks. We\'ve got your enquiry and will be in touch soon.</p></form></div></section>')

def end(h2="Need scaffolding<br>at short notice?", p="Get in touch and we'll do our best to fit your project in."):
    rings = ('<svg class="rings" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'
             + "".join(f'<circle cx="720" cy="900" r="{r}" fill="none" stroke="#fff" stroke-width="2"/>' for r in (260, 420, 580, 740, 900)) + "</svg>")
    return (f'<section class="band cyan end screen">{rings}<div class="wrap"><h2 data-rise>{h2}</h2><p class="sub">{p}</p>'
            f'<div class="btns">{btn("quote.html", "Get a free quote")}{phone()}</div></div></section>')

def phero(label, title, text, picture):
    return (f'<section class="phero" data-hero>{img(picture)}<div class="wrap">{lab(label)}<h1>{title}</h1><p class="sub" data-hin>{text}</p></div>'
            f'{WAVE.format(cls="")}</section>')

# ------------------------------------------------------------------ page shell
def page(file, title, desc, body, active="", solid=False):
    links = "".join(f'<li><a href="{h}"{" aria-current=page" if h == active else ""}>{t}</a></li>' for h, t in NAV)
    cta = btn("quote.html", "Free quote")
    doc = f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{html.escape(title)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="{html.escape(desc)}">
<link rel="icon" href="assets/img/sun.png">
<link rel="stylesheet" href="assets/css/site.css">
</head>
<body{' class="solidnav"' if solid else ""}>
<div class="loader" id="loader"><img src="assets/img/sun.png" alt=""></div>
<header class="nav" id="nav">
  <a class="logo" href="index.html" aria-label="Midlands Solar Scaffolding home"><img class="lt" src="assets/img/logo-light.png" alt="Midlands Solar Scaffolding Ltd"><img class="dk" src="assets/img/logo-dark.png" alt=""></a>
  <ul>{links}</ul>
  <a class="tel" href="tel:{PHONE_RAW}">{PHONE}</a>{cta}
  <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"></button>
</header>
<nav class="menu" id="menu" aria-label="Menu"><a href="index.html">Home</a>{"".join(f'<a href="{h}">{t}</a>' for h, t in NAV)}<a href="quote.html">Free quote</a>{btn("quote.html", "Get a free quote")}{phone()}</nav>
<main id="top">
{body}
</main>
<footer class="foot">
  <div class="foot-cols">
    <div><img src="assets/img/logo-light.png" alt="Midlands Solar Scaffolding Ltd"><p>Commercial, domestic and industrial scaffolding across Wolverhampton and the surrounding towns. Sister company of Midlands Solar Installations Ltd.</p></div>
    <div><h4>Scaffolding</h4><ul><li><a href="services.html#solar">Solar panel installs</a></li><li><a href="services.html#roofing">Roof repairs</a></li><li><a href="services.html#chimney">Chimney work</a></li><li><a href="services.html#commercial">Commercial and industrial</a></li></ul></div>
    <div><h4>Company</h4><ul><li><a href="about.html">About us</a></li><li><a href="work.html">Our work</a></li><li><a href="learn.html">Scaffold guide</a></li><li><a href="quote.html">Free quote</a></li></ul></div>
    <div><h4>Talk to us</h4><ul><li>{PHONE}</li><li style="overflow-wrap:anywhere">{EMAIL}</li><li>Wolverhampton and surrounding towns</li></ul></div>
  </div>
  <div class="foot-base"><span>© 2026 Midlands Solar Scaffolding Ltd</span><span>Part of the Midlands Solar group</span></div>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="assets/js/site.js"></script>
</body>
</html>
'''
    open(os.path.join(ROOT, file), "w").write(doc)

# ------------------------------------------------------------------ pages
def home():
    slides = "".join(f'<img src="assets/img/{p}" alt="">' for p in ["job-09.jpg", "job-05.jpg", "job-03.jpg", "job-01.jpg"])
    dots = "".join(f'<button type="button" aria-label="Photo {i+1}"></button>' for i in range(4))
    hero = (f'<section class="hero" data-hero><div class="slides" aria-hidden="true">{slides}</div><div class="wrap">'
            f'<div class="chips" data-hin><span>Commercial</span><span>Domestic</span><span>Industrial</span></div>'
            f'<h1>{h1("Scaffolding,", "up and <em>ready</em>", "when you are.")}</h1>'
            f'<p class="sub" data-hin>Safe, tidy scaffolding for solar installs, roof repairs and building work across Wolverhampton and the surrounding towns.</p>'
            f'<div class="btns" data-hin>{btn("quote.html", "Get a free quote")}{phone()}</div></div>'
            f'<div class="dots">{dots}</div>{WAVE.format(cls="")}</section>')
    pts = [("shield", "Fully boarded and guarded", "Every lift boarded out, with guardrails and toe boards."),
           ("tag", "Inspected and tagged", "Checked and tagged at handover, ready for the next trade."),
           ("clock", "Short notice where we can", "Call us with your dates and we'll do our best to fit you in.")]
    group = (f'<section class="band light screen"><div class="wrap group"><div>{lab("Who we are")}<h2 data-rise>Scaffolding from the<br>Midlands Solar group.</h2>'
             '<p class="sub">We\'re the sister company of Midlands Solar Installations Ltd. We scaffold their solar installs, and take on independent jobs for homeowners, builders and businesses.</p>'
             f'<div class="logos" data-up>{img("logo-dark.png", "Midlands Solar Scaffolding Ltd")}<i></i>{img("solar-logo-dark.png", "Midlands Solar Installations Ltd")}</div></div>'
             '<ul class="points">' + "".join(f'<li data-up>{ICON[i]}<div><h3>{t}</h3><p>{d}</p></div></li>' for i, t, d in pts) + "</ul></div></section>")
    body = "\n".join([hero, group, tiles(), build_demo(), myths("light"), strip("white"), planner_teaser(), areas("light"), faq("white"),
                      contact("dark"), end()])
    page("index.html", "Midlands Solar Scaffolding", "Commercial, domestic and industrial scaffolding across Wolverhampton and the surrounding towns.", body)

def services():
    rows = [
        ("solar", "Solar panel installs", "Safe access for<br>solar fitters.", "job-05.jpg", "Most installs we scaffold",
         "We scaffold the installs for our sister company, Midlands Solar Installations, so we know exactly what solar fitters need on the roof.",
         ["Boarded lift at gutter height", "Edge protection along the eaves", "Ladder access with a gate at the top", "Hoist or loading bay for panels where needed"]),
        ("roofing", "Roof repairs", "Room to work<br>on the roof.", "job-09.jpg", "Roofing",
         "Re-roofing, tile repairs, ridges and valleys. A full working platform at the eaves keeps roofers safe and gives room to stack tiles.",
         ["Working platform to the gutter line", "Guardrails and toe boards", "Loading bays for materials", "Easy to extend if the job grows"]),
        ("chimney", "Chimney work", "Chimney stacks,<br>safely reached.", "job-11.jpg", "Chimneys",
         "Repointing, lead flashing, pots and cowls. We build a platform around the stack, with safe access up from the roof scaffold.",
         ["Platform all round the stack", "Roof protected under the scaffold", "Combined with a front scaffold where needed"]),
        ("roofline", "Gutters, fascias and painting", "Quick, tidy<br>roofline scaffolds.", "job-03.jpg", "Roofline",
         "Gutters, fascias, soffits, rendering and painting. Short-hire scaffolds put up and taken down with as little disruption as possible.",
         ["Short hire periods", "Front, back, side or all the way round", "Garden and drive protected"]),
        ("building", "Building and extensions", "Scaffolds that grow<br>with your build.", "job-10.jpg", "Building work",
         "From the first lift on a new extension to a full scaffold for a loft conversion. We adapt the scaffold as the build goes up.",
         ["Lifts added as walls go up", "Adaptations at short notice", "Tied in to suit the build"]),
        ("commercial", "Commercial and industrial", "Shops, units and<br>bigger buildings.", "job-08.jpg", "Commercial",
         "Signage, shop fronts, industrial units and larger buildings. Planned around your site, opening hours and the public.",
         ["Pavement and roadside scaffolds", "Help with council licences where needed", "Planned around opening hours"]),
    ]
    sec = []
    for i, (sid, kicker, title, pic, stamp, text, pts) in enumerate(rows):
        skin = "white" if i % 2 == 0 else "light"
        sec.append(f'<section class="band {skin} screen" id="{sid}"><div class="wrap svc{" rev" if i % 2 else ""}"><div class="pic" data-wipe>{img(pic, kicker)}<span class="stamp">{stamp}</span></div>'
                   f'<div>{lab(kicker)}<h2 data-rise>{title}</h2><p class="sub">{text}</p><ul class="ticks">' + "".join(f"<li>{p}</li>" for p in pts) + "</ul>"
                   f'<div class="btns">{btn("quote.html#" + {"roofline": "gutters", "commercial": "build", "roofing": "roof"}.get(sid, sid), "Quote for this job")}</div></div></div></section>')
    flow = [("Free quote", "Tell us about the job online or on the phone."), ("Site check", "We check access, ground and any licence needed."),
            ("Up and boarded", "Our team puts the scaffold up, usually in a day."), ("Handed over", "Inspected, tagged and ready for the next trade."),
            ("Down and tidy", "We take it down when you're done and leave the site clean.")]
    flow_s = (f'<section class="band dark screen"><div class="wrap"><div class="head"><div>{lab("How it works")}<h2 data-rise>From first call<br>to clear site.</h2></div>'
              f'<p class="sub">Five steps, and one team the whole way through.</p></div><ol class="flow">' + "".join(f'<li data-up><h3>{t}</h3><p>{d}</p></li>' for t, d in flow) + "</ol></div></section>")
    body = "\n".join([phero("Services", "Scaffolding for<br><em>every job.</em>", "Domestic, commercial and industrial scaffolding across Wolverhampton and the surrounding towns.", "job-04.jpg")]
                     + sec + [flow_s, contact("light", "Get a price<br>for your job.", "Tell us what you need and where. We'll come back to you with a price.", "services"), end()])
    page("services.html", "Scaffolding services | Midlands Solar Scaffolding", "Scaffolding for solar installs, roof repairs, chimneys, gutters, building work and commercial sites.", body, "services.html")

def learn():
    safe = [("Ladder gate", "A self-closing gate where the ladder meets the platform.", 35, 18),
            ("Fully boarded platform", "A complete working surface with no gaps to step through.", 46, 27),
            ("Guardrails and toe boards", "Rails at the right heights, and a board at the edge to stop tools falling.", 66, 27),
            ("Safe access", "A secured ladder, tied at the top, to every working lift.", 40, 44),
            ("No overloading", "Only the people and materials the scaffold was built for.", 60, 47),
            ("Secure supports and braces", "Diagonal braces stop the scaffold racking sideways.", 25, 56),
            ("Regular inspections", "Checked before use, after bad weather, and at least every seven days.", 48, 59),
            ("Strong foundations", "Base plates on timber sole boards so nothing sinks or moves.", 27, 70)]
    pins = "".join(f'<button class="pin" type="button" style="left:{x}%;top:{y}%" aria-label="{t}">{i+1}</button>' for i, (t, d, x, y) in enumerate(safe))
    lst = "".join(f"<li><div><h3>{t}</h3><p>{d}</p></div></li>" for t, d, x, y in safe)
    safe_s = (f'<section class="band white screen"><div class="wrap safe"><div class="spot" data-up>{img("job-09.jpg", "A finished scaffold on a two-storey house")}{pins}</div>'
              f'<div>{lab("Spot the safety features")}<h2 data-rise>What a safe<br>scaffold has.</h2><p class="sub" style="margin-bottom:18px">Tap a number on the photo, or pick from the list.</p><ol class="safe-list">{lst}</ol></div></div></section>')
    types = [("Tube and fitting", "The traditional scaffold.", "Steel tubes joined with clamps. It can be shaped to almost any building, which is why it's used on most houses.",
              [("Best for", "Houses, awkward shapes, chimneys and roofs"), ("Strength", "Built to suit the job"), ("Speed", "Skilled work, very flexible")]),
             ("System scaffold", "Pre-made parts that lock together.", "Standard lengths and fixed connection points. Quick to put up on large, regular buildings.",
              [("Best for", "Large, flat elevations and repeat layouts"), ("Strength", "Set by the system's design"), ("Speed", "Fast on big, simple jobs")]),
             ("Mobile tower", "A free-standing tower on wheels.", "Light aluminium towers for short, low-level work on firm, level ground. Not for roof work.",
              [("Best for", "Indoor work, ceilings, low walls"), ("Strength", "Light duty"), ("Speed", "Moved by hand around a site")]),
             ("Chimney scaffold", "A platform round the stack.", "Built off the roof, usually with a front scaffold for access, so the stack can be worked on from all sides.",
              [("Best for", "Repointing, flashing, pots and cowls"), ("Strength", "Light duty, built to the stack"), ("Speed", "Usually up in a day")]),
             ("Edge protection", "Guardrails at the roof edge.", "Rails and boards at the eaves that stop falls from the roof, often used on solar and roofing jobs.",
              [("Best for", "Solar installs and roofing"), ("Strength", "Built to stop falls"), ("Speed", "Quick to add")])]
    tabs = "".join(f'<button type="button" role="tab" aria-selected="{"true" if i == 0 else "false"}"{" class=on" if i == 0 else ""}>{n}</button>' for i, (n, *_r) in enumerate(types))
    panes = "".join(f'<div class="type-pane{" on" if i == 0 else ""}" role="tabpanel"><p class="lab">{s}</p><h3>{n}</h3><p class="sub">{d}</p><dl>'
                    + "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in facts) + "</dl></div>" for i, (n, s, d, facts) in enumerate(types))
    types_s = (f'<section class="band light screen"><div class="wrap"><div class="head"><div>{lab("Different jobs, different scaffolds")}<h2 data-rise>Which scaffold<br>do you need?</h2></div>'
               f'<p class="sub">Not sure? We\'ll recommend the right one when we quote.</p></div><div class="types"><div class="type-tabs" role="tablist">{tabs}</div><div>{panes}</div></div></div></section>')
    terms = [("Standard", "An upright tube carrying the load to the ground."), ("Ledger", "A horizontal tube running along the length of the scaffold."),
             ("Transom", "A short tube spanning between ledgers that holds the boards."), ("Lift", "One level of the scaffold, usually about two metres apart."),
             ("Sole board", "A timber plank under each base plate that spreads the load."), ("Toe board", "A board along the platform edge that stops things falling off."),
             ("Tie", "A fixing that holds the scaffold to the building."), ("Scaffold tag", "The card that shows when it was last inspected and if it's safe to use.")]
    terms_s = (f'<section class="band dark screen"><div class="wrap"><div class="head"><div>{lab("Scaffold jargon")}<h2 data-rise>The words you\'ll hear<br>on site.</h2></div>'
               f'<p class="sub">So you know what the scaffolders are talking about.</p></div><div class="terms">' + "".join(f'<div class="term" data-up><h3>{t}</h3><p>{d}</p></div>' for t, d in terms) + "</div></div></section>")
    faq2 = FAQ + [("Can I go on the scaffold myself?", "Only if it has been handed over for your use and you're working safely. If you're unsure, ask us first. Never alter it yourself."),
                  ("What about my neighbours?", "If the scaffold needs to go on or over a neighbour's land, you'll need their agreement first. We can help you plan around it.")]
    body = "\n".join([phero("Scaffold guide", "Scaffolding,<br><em>explained.</em>", "What makes a scaffold safe, which type you need, and the questions people ask before they book.", "job-09.jpg"),
                      safe_s, types_s, myths("white"), terms_s, faq("light", faq2, "Your questions, answered."), contact("dark"), end()])
    page("learn.html", "Scaffold guide | Midlands Solar Scaffolding", "What makes a scaffold safe, the different types of scaffolding and answers to common questions.", body, "learn.html")

def work():
    items = [("job-09.jpg", "home roof", "Roof access, two lifts"), ("job-01.jpg", "home", "Rear elevation"), ("job-05.jpg", "solar home", "Ready for solar"),
             ("job-03.jpg", "home roof", "Front elevation"), ("job-08.jpg", "commercial", "Loaded and on the way"), ("job-11.jpg", "home chimney", "Patio and chimney"),
             ("job-04.jpg", "home", "Semi-detached, front"), ("job-06.jpg", "build", "Rear extension"), ("job-10.jpg", "home roof", "Back of house"),
             ("job-02.jpg", "home", "Side and rear"), ("job-12.jpg", "home", "Narrow side access"), ("job-07.jpg", "build", "Extension, garden side")]
    figs = "".join(f'<figure data-cat="{c}">{img(p, t)}<figcaption>{t}</figcaption></figure>' for p, c, t in items)
    fl = "".join(f'<button type="button" data-f="{k}"{" class=on" if k == "all" else ""}>{n}</button>' for k, n in [("all", "All jobs"), ("home", "Homes"), ("roof", "Roofing"), ("solar", "Solar"), ("build", "Building work"), ("commercial", "Commercial")])
    gal = (f'<section class="band light"><div class="wrap"><div class="head"><div>{lab("Recent work")}<h2 data-rise>Real jobs, real<br>photos.</h2></div>'
           f'<p class="sub">Every photo here is a scaffold we put up. Tap one to see it bigger.</p></div><div class="filters">{fl}</div><div class="gal">{figs}</div></div></section>'
           '<div class="lb" id="lb" role="dialog" aria-label="Photo"><img alt=""><button class="x" type="button" aria-label="Close">✕</button>'
           '<button class="pv" type="button" aria-label="Previous">←</button><button class="nx" type="button" aria-label="Next">→</button></div>')
    body = "\n".join([phero("Our work", "Another one up<br><em>and ready.</em>", "Scaffolds for solar installs, roofing and building work across Wolverhampton and the surrounding towns.", "job-01.jpg"),
                      gal, end("Want yours<br>up next?", "Tell us about the job and we'll get you booked in.")])
    page("work.html", "Our work | Midlands Solar Scaffolding", "Photos of recent scaffolding jobs across Wolverhampton and the surrounding towns.", body, "work.html")

def about():
    story = (f'<section class="band light screen"><div class="wrap group"><div>{lab("About us")}<h2 data-rise>Part of the<br>Midlands Solar group.</h2>'
             '<p class="sub">Midlands Solar Scaffolding Ltd is the sister company of Midlands Solar Installations Ltd. We work closely alongside them, providing scaffolding to support their solar installation projects, while also taking on independent projects for private customers and other businesses.</p>'
             '<p class="sub" style="margin-top:14px">We\'re proud to work as part of the same group, delivering reliable, professional scaffolding across a wide range of projects.</p>'
             f'<div class="logos" data-up>{img("logo-dark.png", "Midlands Solar Scaffolding Ltd")}<i></i>{img("solar-logo-dark.png", "Midlands Solar Installations Ltd")}</div></div>'
             f'<div class="svc" style="grid-template-columns:1fr"><div class="pic" data-wipe>{img("job-08.jpg", "Our van loaded with tubes and boards")}<span class="stamp">Our own team and kit</span></div></div></div></section>')
    vals = [("shield", "Safe first", "Every scaffold boarded, guarded and checked before we hand it over."),
            ("broom", "Tidy sites", "Gardens and drives protected, and the site left clean when we're done."),
            ("clock", "Reliable", "We turn up when we say, and fit short-notice jobs in where we can.")]
    vals_s = (f'<section class="band white screen"><div class="wrap"><div class="head"><div>{lab("How we work")}<h2 data-rise>What you can<br>count on.</h2></div></div>'
              '<div class="values">' + "".join(f'<div class="value" data-up>{ICON[i]}<h3>{t}</h3><p>{d}</p></div>' for i, t, d in vals) + "</div></div></section>")
    body = "\n".join([phero("About us", "Reliable scaffolding,<br><em>done properly.</em>", "A Wolverhampton scaffolding company, and the sister company of Midlands Solar Installations.", "job-05.jpg"),
                      story, vals_s, areas("light"), contact("dark"), end()])
    page("about.html", "About us | Midlands Solar Scaffolding", "Midlands Solar Scaffolding Ltd, sister company of Midlands Solar Installations Ltd, based in Wolverhampton.", body, "about.html")

def quote():
    def opts(name, items, two=False):
        return f'<div class="opts{" two" if two else ""}">' + "".join(f'<label><input type="radio" name="{name}" value="{v}"><span>{t}<small>{s}</small></span></label>' for v, t, s in items) + "</div>"
    q = [("What's the scaffolding for?", opts("job", [("solar", "Solar panels", "Fitting panels or a battery"), ("roof", "Roof repairs", "Tiles, re-roofing, ridges"), ("chimney", "Chimney", "Repointing, flashing, pots"),
                                                  ("gutters", "Gutters and fascias", "Roofline work"), ("build", "Building work", "Extensions, lofts, walls"), ("paint", "Painting or rendering", "Walls and woodwork")])),
         ("What kind of building?", opts("property", [("bungalow", "Bungalow", "One storey"), ("house2", "House", "Two storeys"), ("house3", "Taller house", "Three storeys"), ("commercial", "Commercial", "Shop, unit or office")], True)),
         ("Which part of the building?", opts("where", [("front", "Front", "One elevation"), ("back", "Back", "One elevation"), ("side", "One side", "Gable end"),
                                                        ("frontback", "Front and back", "Two elevations"), ("all", "All the way round", "Every side"), ("chimney", "Chimney only", "Just the stack")])),
         ("When do you need it?", opts("when", [("asap", "As soon as possible", "Short notice"), ("two", "Within 2 weeks", ""), ("month", "Within a month", ""), ("flex", "I'm flexible", "")], True)),
         ("How long for?", opts("long", [("w1", "About a week", ""), ("w4", "2 to 4 weeks", ""), ("m3", "1 to 3 months", ""), ("unsure", "Not sure yet", "We'll advise")], True))]
    steps = "".join(f'<div class="qstep{" on" if i == 0 else ""}"><h3>{t}</h3>{o}</div>' for i, (t, o) in enumerate(q))
    details = ('<div class="qstep"><h3>Where should we send your quote?</h3><form class="form" id="planForm" novalidate>'
               '<div class="row"><label for="q-name">Name<input id="q-name" name="name" autocomplete="name" required></label>'
               '<label for="q-phone">Phone<input id="q-phone" name="phone" type="tel" autocomplete="tel" required></label></div>'
               '<div class="row"><label for="q-email">Email<input id="q-email" name="email" type="email" autocomplete="email" required></label>'
               '<label for="q-pc">Postcode<input id="q-pc" name="postcode" autocomplete="postal-code" required></label></div>'
               '<label for="q-msg">Anything else we should know?<textarea id="q-msg" name="message" placeholder="Access, parking, conservatory in the way…"></textarea></label>'
               f'<button class="btn" type="submit">Get my free quote {ARROW}</button></form></div>')
    summary = "".join(f'<div><dt>{k}</dt><dd id="{i}">Not chosen yet</dd></div>' for k, i in [("Job", "sJob"), ("Building", "sProp"), ("Scaffold on", "sWhere"), ("Typical size", "sLifts"), ("Start", "sWhen"), ("Hire", "sLong")])
    planner = (f'<section class="band light" style="padding-top:clamp(110px,15vh,150px)"><div class="wrap"><div class="head"><div>{lab("Free quote")}<h1 class="h2" style="font-size:clamp(34px,4.4vw,66px)" data-rise>Plan your scaffold.</h1></div>'
               f'<p class="sub">Six quick questions. You\'ll see your scaffold take shape as you answer.</p></div>'
               f'<div class="planner" id="planner"><div class="card"><div class="planner-flow"><div class="qhead"><b id="qCount">Step 1 of 6</b>'
               f'<span style="font-size:14px;color:var(--mu)">Or call {PHONE}</span></div><div class="qbar"><i style="width:16%"></i></div>{steps}{details}'
               '<div class="qnav"><button type="button" class="back" id="qBack">← Back</button><button type="button" class="btn" id="qNext">Next →</button></div></div>'
               f'<div class="done"><div class="tick"><svg width="34" height="34" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
               '<h3>Thanks, that\'s with us.</h3><p class="sub" style="margin:10px auto 0">We\'ll look over your answers and come back to you with a price. If it\'s urgent, give us a call.</p></div></div>'
               f'<aside class="preview" aria-live="polite"><p class="lab">Your scaffold</p><svg id="pvSvg" viewBox="0 0 360 340" role="img" aria-label="Drawing of your scaffold"></svg>'
               f'<dl class="summary">{summary}</dl><p class="note">A guide to help us quote. We\'ll confirm what you need before any work.</p></aside></div></div></section>')
    body = "\n".join([planner, faq("white"), end("Rather talk<br>it through?", "Call us and we'll talk you through what you need.")])
    page("quote.html", "Free scaffolding quote | Midlands Solar Scaffolding", "Plan your scaffold in six quick questions and get a free quote.", body, "quote.html", solid=True)

if __name__ == "__main__":
    home(); services(); learn(); work(); about(); quote()
    print("built 6 pages")
