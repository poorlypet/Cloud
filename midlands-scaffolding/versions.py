#!/usr/bin/env python3
"""Five homepage directions for Midlands Solar Scaffolding: v1.html … v5.html, plus
versions.html to choose between them. Run:  python3 versions.py
Shared helpers and wording come from build.py; extra styles are in
assets/css/versions.css and behaviour in assets/js/versions.js."""
import os
import build as B
from build import img, lab, btn, tl, h1, phone, SERVICES, ICON, ARROW, TOWNS

NAMES = ["Clean", "Night", "Mosaic", "Split", "Posts"]

SAFE = [("Strong foundations", "Base plates on timber sole boards, so nothing sinks or moves."),
        ("Secure supports and braces", "Diagonal braces stop the scaffold racking sideways."),
        ("Fully boarded platforms", "A complete working surface with no gaps."),
        ("Guardrails and toe boards", "Rails at the right heights, and a board to stop tools falling."),
        ("Safe access", "A secured ladder to every lift, with a gate at the top."),
        ("Regular inspections", "Checked before use, after bad weather, and at least every seven days."),
        ("No overloading", "Only the people and materials the scaffold was built for."),
        ("Tied to the building", "Ties hold the scaffold firmly to the wall.")]

def group(skin="light"):
    pts = [("shield", "Fully boarded and guarded", "Every lift boarded out, with guardrails and toe boards."),
           ("tag", "Inspected and tagged", "Checked and tagged at handover, ready for the next trade."),
           ("clock", "Short notice where we can", "Call us with your dates and we'll do our best to fit you in.")]
    return (f'<section class="band {skin} screen"><div class="wrap group"><div>{lab("Who we are")}<h2 data-rise>Scaffolding from the<br>Midlands Solar group.</h2>'
            '<p class="sub">We\'re the sister company of Midlands Solar Installations Ltd. We scaffold their solar installs, and take on independent jobs for homeowners, builders and businesses.</p>'
            f'<div class="logos" data-up>{img("logo-dark.png", "Midlands Solar Scaffolding Ltd")}<i></i>{img("solar-logo-dark.png", "Midlands Solar Installations Ltd")}</div></div>'
            '<ul class="points">' + "".join(f'<li data-up>{ICON[i]}<div><h3>{t}</h3><p>{d}</p></div></li>' for i, t, d in pts) + "</ul></div></section>")

def marquee(dark=False):
    words = ["Commercial", "Domestic", "Industrial", "Solar installs", "Roof repairs", "Chimneys", "Short notice", "Wolverhampton"]
    run = "".join(f"<span>{w}</span>" for w in words)
    return f'<div class="marq{" dark-m" if dark else ""}" aria-hidden="true"><div class="marq-in">{run}{run}</div></div>'

def bento(skin="light"):
    t = "".join(f'<a class="tile" href="{h}" data-up>{img(p, n)}<span class="go">→</span><div><h3>{n}</h3><p>{d}</p></div></a>' for n, d, p, h in SERVICES)
    return (f'<section class="band {skin} screen"><div class="wrap"><div class="head"><div>{lab("What we scaffold")}<h2 data-rise>Scaffolding for every<br>kind of job.</h2></div>'
            f'{tl("services.html", "All services")}</div><div class="bento">{t}</div></div></section>')

def checks(skin="light"):
    c = "".join(f'<div class="check" data-up><b>{i+1}</b><h3>{t}</h3><p>{d}</p></div>' for i, (t, d) in enumerate(SAFE))
    return (f'<section class="band {skin} screen"><div class="wrap"><div class="head"><div>{lab("Safety first")}<h2 data-rise>What a safe<br>scaffold has.</h2></div>'
            f'{tl("learn.html", "Read the scaffold guide")}</div><div class="checks">{c}</div></div></section>')

def spot(skin="white"):
    safe = [("Ladder gate", "A self-closing gate where the ladder meets the platform.", 35, 18), ("Fully boarded platform", "A complete working surface with no gaps.", 46, 27),
            ("Guardrails and toe boards", "Rails at the right heights, and a board at the edge.", 66, 27), ("Safe access", "A secured ladder, tied at the top, to every lift.", 40, 44),
            ("No overloading", "Only the people and materials it was built for.", 60, 47), ("Secure braces", "Diagonal braces stop the scaffold racking sideways.", 25, 56),
            ("Regular inspections", "Checked before use, after bad weather, and every seven days.", 48, 59), ("Strong foundations", "Base plates on timber sole boards.", 27, 70)]
    pins = "".join(f'<button class="pin" type="button" style="left:{x}%;top:{y}%" aria-label="{t}">{i+1}</button>' for i, (t, d, x, y) in enumerate(safe))
    lst = "".join(f"<li><div><h3>{t}</h3><p>{d}</p></div></li>" for t, d, x, y in safe)
    return (f'<section class="band {skin} screen"><div class="wrap safe"><div class="spot" data-up>{img("job-09.jpg", "A finished scaffold on a two-storey house")}{pins}</div>'
            f'<div>{lab("Spot the safety features")}<h2 data-rise>What a safe<br>scaffold has.</h2><p class="sub" style="margin-bottom:18px">Tap a number on the photo, or pick from the list.</p><ol class="safe-list">{lst}</ol></div></div></section>')

def areas(skin="light"):
    chips = "".join(f'<span{" class=hq" if t[0] == "Wolverhampton" else ""}>{t[0]}</span>' for t in TOWNS)
    return (f'<section class="band {skin}"><div class="wrap"><div class="head"><div>{lab("Where we work")}<h2 data-rise>Wolverhampton and<br>the towns around it.</h2></div>'
            '<p class="sub">Not sure if we cover you? Ask us.</p></div><div class="areas2" data-up>' + chips + "</div></div></section>")

def strip(skin="white"): return B.strip(skin)
def myths(skin="light"): return B.myths(skin)
def faq(skin="white"): return B.faq(skin)
def contact(skin="dark"): return B.contact(skin)
def end(): return B.end()

# ------------------------------------------------------------------ the five heroes and signature sections
def v1():
    hero = (f'<section class="v1-hero" data-hero><div>{lab("Commercial · Domestic · Industrial")}<h1>{h1("Scaffolding,", "up and <em>ready</em>", "when you are.")}</h1>'
            '<p class="sub" data-hin>Safe, tidy scaffolding for solar installs, roof repairs and building work across Wolverhampton and the surrounding towns.</p>'
            f'<div class="btns" data-hin>{btn("quote.html", "Get a free quote")}{phone()}</div></div>'
            f'<div class="v1-pic"><div class="ph">{img("job-09.jpg", "Scaffold on a two-storey house")}</div>'
            f'<div class="v1-float">{img("job-05.jpg")}<b>Another one up and ready</b><span>Handed over for the next trade</span></div>'
            '<div class="v1-badge">Short notice?<br>Call us.</div></div></section>')
    return "", True, [hero, marquee(), group("light"), bento("white"), myths("light"), spot("white"), strip("light"), areas("white"), contact("dark"), end()]

def v2():
    slides = "".join(f'<img src="assets/img/{p}" alt="">' for p in ["job-05.jpg", "job-09.jpg", "job-01.jpg", "job-03.jpg"])
    hero = (f'<section class="v2-hero" data-hero><div class="slides" aria-hidden="true">{slides}</div><div class="wrap" style="position:relative;z-index:2">'
            f'<div class="chips" data-hin><span>Commercial</span><span>Domestic</span><span>Industrial</span></div>'
            f'<h1>{h1("Up. Safe.", "<em>Ready.</em>")}</h1>'
            '<div class="v2-row"><p class="sub" data-hin>Scaffolding for solar installs, roof repairs and building work across Wolverhampton and the surrounding towns.</p>'
            f'<div class="btns" data-hin>{btn("quote.html", "Get a free quote")}{phone()}</div></div></div></section>')
    cards = "".join(f'<article class="v2-card">{img(p, n)}<div><div class="num">0{i+1}</div><h3>{n}</h3><p>{d}</p><div class="btns" style="margin-top:20px">{btn(h, "Find out more")}</div></div></article>'
                    for i, (n, d, p, h) in enumerate(SERVICES))
    pan = f'<section class="v2-pan">{lab("")}<div class="v2-track">{cards}</div></section>'.replace('<p class="lab"></p>', "")
    return "v2", False, [hero, marquee(True), pan, checks("dark"), myths("light"), strip("white"), areas("dark"), contact("dark"), end()]

def v3():
    hero = (f'<section class="v3-hero" data-hero><div class="wall" data-offset="0" aria-hidden="true"></div><div class="v3-in">'
            f'<div class="chips" data-hin><span>Commercial</span><span>Domestic</span><span>Industrial</span></div>'
            f'<h1>{h1("Scaffolding across", "<em>Wolverhampton.</em>")}</h1>'
            '<p class="sub" data-hin>Reliable scaffolding for solar installs, roof repairs and building work, from the Midlands Solar group.</p>'
            f'<div class="btns" data-hin>{btn("quote.html", "Get a free quote")}{phone()}</div></div></section>')
    return "", False, [hero, group("light"), marquee(True), bento("white"), checks("light"), myths("white"), faq("light"), contact("dark"), end()]

def v4():
    hero = (f'<section class="v4-hero" data-hero><div>{lab("Midlands Solar Scaffolding")}<h1>{h1("Need scaffolding", "at short notice?")}</h1>'
            '<p class="sub" data-hin>Get in touch and we\'ll do our best to fit your project in. Commercial, domestic and industrial, across Wolverhampton and the surrounding towns.</p>'
            f'<div class="btns" data-hin>{btn("quote.html", "Get a free quote")}{phone()}</div></div>'
            f'<div class="ph" data-wipe>{img("job-04.jpg", "Scaffold on a semi-detached house")}</div></section>')
    pics = "".join(f'<img src="assets/img/{p}" alt="{n}">' for n, d, p, h in SERVICES)
    svcs = "".join(f'<article class="v4-svc">{lab("Service " + str(i + 1) + " of " + str(len(SERVICES)))}<h3>{n}</h3><p class="sub">{d}</p>'
                   f'<div class="btns">{btn(h, "Find out more", "btn ghost")}{tl("quote.html", "Get a quote")}</div></article>' for i, (n, d, p, h) in enumerate(SERVICES))
    sticky = f'<section class="v4-sticky"><div class="v4-pics">{pics}<span class="count">1 / {len(SERVICES)}</span></div><div>{svcs}</div></section>'
    return "", False, [hero, group("light"), sticky, myths("light"), spot("white"), areas("light"), contact("dark"), end()]

def v5():
    hero = (f'<section class="v5-hero" data-hero><div class="ph">{img("job-05.jpg", "Scaffold with the Midlands Solar Scaffolding banner")}</div>'
            f'<div class="v5-panel"><div class="wrap"><div class="v5-rule"></div><h1>{h1("Planning <em>roof repairs?</em>")}</h1>'
            '<p class="sub" data-hin>Getting your scaffolding arranged early keeps your project running smoothly. Commercial, domestic and industrial, across Wolverhampton.</p>'
            f'<div class="btns" data-hin>{btn("quote.html", "Contact us for a free quote")}{phone()}</div></div></div></section>')
    heads = [("Solar panel <em>installs</em>", "solar"), ("Ready for your <em>roofer</em>", "roofing"), ("Chimney work, <em>sorted</em>", "chimney"),
             ("Gutters and <em>fascias</em>", "roofline"), ("Building and <em>extensions</em>", "building"), ("Commercial and <em>industrial</em>", "commercial")]
    posts = "".join(f'<article class="post"><div class="ph">{img(p, n)}</div><div class="txt"><span class="tag3">{n}</span><h3>{hd}</h3><p>{d}</p>'
                    f'<div class="btns" style="margin-top:16px">{btn("services.html#" + sid, "Find out more")}</div></div></article>'
                    for (n, d, p, h), (hd, sid) in zip(SERVICES, heads))
    stack = (f'<section class="band light" style="padding-bottom:40px"><div class="wrap"><div class="head"><div>{lab("What we scaffold")}<h2 data-rise>Another one up<br>and ready.</h2></div>'
             f'<p class="sub">Scroll through the jobs we do most.</p></div></div><div class="stack">{posts}</div></section>')
    panes = "".join(f'<div class="mf-pane{" on" if i == 0 else ""}"><div class="mf-row m"><div class="mf-pill">Myth:</div><div class="mf-body"><h3>{m}</h3></div></div>'
                    f'<div class="mf-row f"><div class="mf-pill">Fact:</div><div class="mf-body"><p>{f}</p></div></div></div>' for i, (m, f) in enumerate(B.MYTHS))
    dots = "".join(f'<button type="button" aria-label="Myth {i+1}"></button>' for i in range(len(B.MYTHS)))
    mf = (f'<section class="band white screen"><div class="wrap"><div class="head" style="grid-template-columns:1fr;text-align:center;justify-items:center">'
          f'<div>{lab("Myth or fact")}<h2 data-rise>Scaffolding myths,<br>sorted out.</h2></div></div><div class="mf-sw">{dots}</div><div class="mf">{panes}</div></div></section>')
    safe = (f'<section class="band light screen"><div class="wrap"><div class="head"><div>{lab("Safety first")}<h2 data-rise>A safe scaffold <em>has:</em></h2></div>'
            f'{tl("learn.html", "Read the scaffold guide")}</div><ul class="v5-safe">' + "".join(f'<li data-up><b>{i+1}</b><div><h3>{t}</h3><p>{d}</p></div></li>' for i, (t, d) in enumerate(SAFE)) + "</ul></div></section>")
    return "", False, [hero, stack, mf, safe, group("white"), areas("light"), contact("dark"), end()]

def write(i, fn):
    cls, solid, secs = fn()
    B.page(f"v{i}.html", "Midlands Solar Scaffolding", "Commercial, domestic and industrial scaffolding across Wolverhampton and the surrounding towns.", "\n".join(secs), "", solid)
    p = os.path.join(B.ROOT, f"v{i}.html")
    h = open(p).read()
    if cls:
        h = h.replace("<body", f'<body data-v="{cls}"', 1).replace(f'<body data-v="{cls}">', f'<body class="{cls}">', 1)
    sw = '<div class="switch">' + "".join(f'<a href="v{k+1}.html"{" class=on" if k + 1 == i else ""}>{k+1}{" " + NAMES[k] if k + 1 == i else ""}</a>' for k in range(5)) + "</div>"
    h = h.replace("</footer>", "</footer>\n" + sw, 1)
    open(p, "w").write(h)

def write_home():
    """The chosen design (Mosaic) as the site's home page."""
    cls, solid, secs = v3()
    B.page("index.html", "Midlands Solar Scaffolding", "Commercial, domestic and industrial scaffolding across Wolverhampton and the surrounding towns.", "\n".join(secs), "", solid)

if __name__ == "__main__":
    for i, fn in enumerate([v1, v2, v3, v4, v5], 1):
        write(i, fn)
    print("built 5 versions")
