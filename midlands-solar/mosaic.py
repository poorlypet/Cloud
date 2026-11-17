"""Builds five business-led homepages that all open with the moving mosaic
hero (mosaic-1.html … mosaic-5.html) plus a chooser (mosaics.html).
Run:  python3 mosaic.py

Each page is assembled from the section builders below, in a different order
and with different treatments. Shared helpers come from designs.py."""
import os
from designs import HERE, HEAD, REVIEWS, FIT, PAY, MORE, WORK_STRIP, pc, lab, img, vid, voices, nums, page

AREAS = ["Birmingham", "Coventry", "Leicester", "Nottingham", "Derby", "Northampton", "Rugby", "Stoke-on-Trent", "Worcester", "Lincoln"]
BRANDS = ["EcoFlow", "Fox ESS", "Sigenergy", "Growatt", "Sunsynk", "Hanchu"]
# how a job actually runs, start to finish
JOB = [
    ("Get your price", "Online in about a minute, or call and we'll talk it through.", img("home-5.jpg", "Solar panels on a roof")),
    ("We survey your home", "We check the roof, the electrics and where everything will go.", img("home-drone-1.jpg", "A house from above")),
    ("We fit it", "Scaffold up, panels on, battery in. We leave it tidy.", vid("fly-glades-2")),
    ("Switched on and looked after", "We set up your app, register the system and stay on the end of the phone.", img("bat-ecoflow-1.jpg", "A battery fitted in a home")),
]
WHY = [
    ("MCS certified", "The standard you need to be paid for power you send back to the grid."),
    ("25-year panel warranty", "Your panels are covered for the long run."),
    ("10+ years fitting solar", "More than a decade of roofs across the region."),
    ("Rated 4.9 out of 5", "From the customers we've fitted for."),
]
ABOUT_H = "A Midlands installer, start to finish."
ABOUT_P = "Midlands Solar Installations designs, fits and looks after solar panels and battery storage for homes, businesses and farms."
ABOUT_LINK = '<a class="tl" href="about.html">More about us <i>→</i></a>'

HERO = f'''
<section class="hero" data-hero>
  <div class="hero-bg hero-bg-mosaic" id="mosaic" aria-hidden="true"></div>
  <div class="hero-shade"></div>
  <div class="hero-in">
    <h1><span class="ln"><span>See solar</span></span><span class="ln"><span>on <em>your</em> roof.</span></span></h1>
    <div class="hero-row"><p data-hin>Solar panels and batteries, fitted across the Midlands. Enter your postcode for a price in about a minute.</p>{pc(hin=True)}</div>
  </div>
  <div class="hero-foot" data-hin><span>MCS certified</span><span>Rated 4.9 out of 5</span><span>25-year panel warranty</span></div>
</section>'''

def head(label, h2, right="", pad=True):
    inner = f'{lab(label)}<div class="head"><h2 data-rise>{h2}</h2>{right}</div>'
    return f'<div class="sec" style="padding-bottom:clamp(36px,4vw,64px)">{inner}</div>' if pad else inner

def say(skin="bone"):
    return (f'<section class="say {skin}"><p data-words>We fit solar panels and batteries for homes, businesses and farms across the Midlands. '
            'One company from the first quote to the day it is switched on, and after.</p></section>')

def points(four=False, up=True):
    return (f'<div class="g-points{" four" if four else ""}">' + "".join(f'<div{" data-up" if up else ""}><h3>{t}</h3><p>{s}</p></div>' for t, s in WHY) + "</div>")

# ---------------------------------------------------------------- about us
def about_split(skin="blk", rev=False, clip="fly-glades-1"):
    return (f'<section class="g-about {skin}{" rev" if rev else ""}"><div class="media" data-wipe>{vid(clip)}</div>'
            f'<div>{lab("About us")}<h2 data-rise>{ABOUT_H}</h2><p class="sub">{ABOUT_P}</p>{points()}{ABOUT_LINK}</div></section>')

def about_film(skin="blk"):
    return (f'<section class="d-film"><div class="media" data-par="-8">{vid("orbit-2")}</div>'
            f'<div><div>{lab("About us")}<h2 data-rise>A Midlands installer,<br>start to finish.</h2></div>{ABOUT_LINK}</div></section>'
            f'<section class="{skin}" style="padding-top:clamp(40px,5vw,72px)"><p class="sub" style="padding:0 var(--pad) clamp(32px,4vw,56px)">{ABOUT_P}</p>{points(True)}</section>')

def about_window(skin="blk"):
    right = f'<p class="sub">{ABOUT_P}</p>'
    return (f'<section class="{skin}">{head("About us", "A Midlands installer,<br>start to finish.", right)}'
            f'<div class="a-win media" data-grow>{vid("hero-orbit")}</div><div style="height:clamp(40px,5vw,72px)"></div>{points(True)}</section>')

# ---------------------------------------------------------------- what we fit
FIT_SUB = '<p class="sub">Homes are most of what we do. We fit businesses and farms too.</p>'
def fit_swap():
    media = [img("home-drone-2.jpg"), img("bat-ecoflow-3.jpg"), vid("commercial"), img("com-3.jpg")]
    bg = "".join(f'<div class="media">{m}</div>' for m in media)
    words = "".join(f"<span>{t}</span>" for t in ["Panels", "Batteries", "Commercial", "Farms"])
    desc = "".join(f'<a href="{h}"{" class=on" if i == 0 else ""}>{s}<u>Find out more →</u></a>' for i, (t, s, h, p) in enumerate(FIT))
    return (f'<section class="e-fit" id="eFit">{bg}<p class="lab"><span><i></i>What we fit</span><span id="eN">1 / 4</span></p>'
            f'<div class="e-words"><div id="eWords">{words}</div></div><div class="e-desc" id="eDesc">{desc}</div><div class="b-bar"><i id="eBar"></i></div></section>')

def fit_tiles():
    tiles = "".join(f'<a href="{h}">{img(p, t)}<i>↗</i><div><h3>{t}</h3><p>{s}</p></div></a>' for t, s, h, p in FIT)
    return f'<section class="blk">{head("What we fit", "Panels, batteries<br>and more.", FIT_SUB)}<div class="c-tiles">{tiles}</div></section>'

def fit_panels():
    panels = "".join(f'<a href="{h}">{img(p, t)}<div><h3>{t}</h3><p>{s}</p></div></a>' for t, s, h, p in FIT)
    return f'<section class="a-fit blk">{head("What we fit", "Panels, batteries<br>and more.", FIT_SUB)}<div class="a-panels">{panels}</div></section>'

def chaps(label, items, cls=""):
    """Full-screen screens that stack over one another. items: (title, sentence, media, link or None)"""
    n = len(items)
    return '<div class="b-chaps">' + "".join(
        f'<article class="b-chap {cls}"><div class="media">{m}</div><p class="lab"><span><i></i>{label}</span><span>{i+1} / {n}</span></p>'
        f'<div class="b-chap-in"><h3>{t}</h3><div><p>{s}</p>' + (f'<a class="btn" href="{h}">Find out more <i>→</i></a>' if h else "") + "</div></div></article>"
        for i, (t, s, m, h) in enumerate(items)) + "</div>"

def fit_chaps():
    media = [img("home-drone-2.jpg", "Solar panels from above"), img("bat-ecoflow-3.jpg", "Battery storage"), vid("commercial"), img("com-3.jpg", "Solar on a farm building")]
    return chaps("What we fit", [(t, s, m, h) for (t, s, h, p), m in zip(FIT, media)])

# ---------------------------------------------------------------- how a job goes
JOB_H = "From quote<br>to switch-on."
JOB_SUB = '<p class="sub">Four steps, and you deal with us the whole way through.</p>'
def job_rows(skin="blk"):
    rows = "".join(f'<article class="e-row"><div class="media" data-wipe>{m}</div><div data-up><b>{i+1}</b><h3>{t}</h3><p class="sub">{s}</p></div></article>' for i, (t, s, m) in enumerate(JOB))
    return f'<section class="e-how {skin}">{head("How a job goes", JOB_H, JOB_SUB)}{rows}</section>'

def job_cols(skin="blk"):
    cols = "".join(f'<article data-up><b>{i+1}</b><div class="media" data-wipe>{m}</div><h3>{t}</h3><p>{s}</p></article>' for i, (t, s, m) in enumerate(JOB))
    return f'<section class="sec {skin}">{head("How a job goes", JOB_H, JOB_SUB, pad=False)}<div class="a-steps four">{cols}</div></section>'

def job_xpin():
    skins = ["blk", "bone", "org", "blk"]
    pans = "".join(f'<article class="c-pan {skins[i]}"><div>{lab("How a job goes")}<b>{i+1}</b><div><h3>{t}</h3><p class="sub">{s}</p></div></div><div class="media">{m}</div></article>' for i, (t, s, m) in enumerate(JOB))
    return f'<section class="c-how" data-xpin><div class="c-track" data-track>{pans}</div></section>'

def job_split():
    arts = "".join(f'<article><b>HOW A JOB GOES · STEP {i+1} OF 4</b><h3>{t}</h3><p class="sub">{s}</p></article>' for i, (t, s, m) in enumerate(JOB))
    return f'<section class="d-how blk"><div class="media">{vid("fly-glades-3")}</div><div>{arts}</div></section>'

def job_chaps():
    return chaps("How a job goes", [(t, s, m, None) for t, s, m in JOB], "long")

# ---------------------------------------------------------------- recent work
def work_grid():
    grid = "".join([f'<div class="media w7" data-wipe>{vid("hero-orbit")}</div>', f'<div class="media w5" data-wipe>{img("home-1.jpg")}</div>',
                    f'<div class="media w4" data-wipe>{img("bat-sigen.jpg")}</div>', f'<div class="media w4" data-wipe>{vid("fly-snowdon-2")}</div>', f'<div class="media w4" data-wipe>{img("home-4.jpg")}</div>',
                    f'<div class="media w5" data-wipe>{img("bat-ecoflow-1.jpg")}</div>', f'<div class="media w7" data-wipe>{img("home-drone-1.jpg")}</div>'])
    return f'<section class="blk">{head("Recent work", "Fitted by us.", MORE)}<div class="e-grid">{grid}</div></section>'

def work_strip():
    return (f'<section class="work blk" data-xpin><div class="work-head"><div>{lab("Recent work")}<h2>Fitted by us.</h2></div>{MORE}</div>'
            f'<div class="work-track" data-track>{WORK_STRIP}</div></section>')

def work_cols():
    cols = [[img("home-1.jpg"), vid("fly-glades-3"), img("bat-ecoflow-1.jpg"), img("home-6.jpg")],
            [vid("fly-snowdon-1"), img("home-3.jpg"), img("com-2.jpg"), img("home-4.jpg"), vid("battery")],
            [img("home-2.jpg"), img("bat-sigen.jpg"), vid("fly-glades-1"), img("com-4.jpg")]]
    pars = ["6", "-14", "6"]
    colh = "".join(f'<div data-par="{pars[i]}">' + "".join(f'<div class="media">{m}</div>' for m in c) + "</div>" for i, c in enumerate(cols))
    return f'<section class="blk">{head("Recent work", "Fitted by us.", MORE)}<div class="c-cols">{colh}</div><div style="height:clamp(64px,8vw,120px)"></div></section>'

def work_rows(skin="bone"):
    row1 = "".join([f'<div class="media">{img("home-drone-2.jpg")}</div>', f'<div class="media tall">{vid("fly-glades-2")}</div>', f'<div class="media">{img("home-3.jpg")}</div>',
                    f'<div class="media tall">{img("bat-ecoflow-1.jpg")}</div>', f'<div class="media">{vid("commercial")}</div>', f'<div class="media tall">{img("home-6.jpg")}</div>'])
    row2 = "".join([f'<div class="media tall">{img("home-4.jpg")}</div>', f'<div class="media">{vid("orbit-2")}</div>', f'<div class="media tall">{vid("fly-snowdon-2")}</div>',
                    f'<div class="media">{img("com-2.jpg")}</div>', f'<div class="media tall">{img("bat-sigen.jpg")}</div>', f'<div class="media">{img("home-drone-1.jpg")}</div>'])
    return f'<section class="a-work {skin}">{head("Recent work", "Fitted by us.", MORE)}<div class="a-row" data-drift="1">{row1}</div><div class="a-row" data-drift="-1">{row2}</div></section>'

def work_film():
    strip = "".join(f'<div class="media" data-wipe>{m}</div>' for m in [img("home-1.jpg"), vid("fly-snowdon-1"), img("bat-sigen.jpg"), img("home-drone-1.jpg")])
    return (f'<section class="d-film"><div class="media" data-par="-8">{vid("commercial")}</div><div><div>{lab("Recent work")}<h2 data-rise>Fitted by us.</h2></div>{MORE}</div></section>'
            f'<div class="d-strip">{strip}</div>')

# ---------------------------------------------------------------- brands, areas, reviews
def brands(skin="blk"):
    return f'<section class="g-brands {skin}">{lab("Brands we fit")}<div class="g-btrack" data-dup>' + "".join(f"<span>{b}</span>" for b in BRANDS) + "</div></section>"

def areas_text(skin="bone"):
    towns = " · ".join(AREAS)
    return (f'<section class="sec g-areas {skin}">{lab("Where we work")}<p class="big" data-words>{towns} and everywhere between.</p>'
            '<p class="sub">Not sure if we cover you? Put your postcode in and we will tell you.</p></section>')

def areas_marquee(skin="bone"):
    r1 = "".join(f"<span>{a}</span>" for a in AREAS[:5] + AREAS[:2])
    r2 = "".join(f"<span>{a}</span>" for a in AREAS[5:] + AREAS[5:7])
    return f'<section class="g-towns {skin}">{lab("Where we work")}<div class="g-trow" data-drift="1">{r1}</div><div class="g-trow" data-drift="-1">{r2}</div></section>'

def reviews_grid():
    qs = "".join(f'<blockquote data-up><p>“{q}”</p><footer><b>{n}</b> · {w}</footer></blockquote>' for q, n, w in REVIEWS)
    return f'<section class="bone"><div class="e-qhead">{lab("Reviews")}<h2 data-rise>What customers say.</h2></div><div class="e-q">{qs}</div></section>'

def reviews_marquee():
    qs = "".join(f'<blockquote><p>“{q}”</p><footer><b>{n}</b> · {w}</footer></blockquote>' for q, n, w in REVIEWS)
    return f'<section class="c-q bone">{lab("Reviews")}<div class="c-qtrack" data-dup>{qs}</div></section>'

# ---------------------------------------------------------------- online quote + close
def tool(skin="bone"):
    return (f'<section class="g-tool {skin}"><div>{lab("Online quote")}<h2 data-rise>Want a price<br>right now?</h2>'
            f'<p class="sub">Put your postcode in. We map your roof, lay the panels out and show you a price in about a minute.</p>{pc()}</div>'
            '<div data-roof data-auto></div></section>')

def end():
    return ('<section class="end"><div class="sun" id="sun"></div><h2 data-rise>Let\'s get you<br>on solar.</h2>'
            f'<p>Get a price online in about a minute, or speak to us.</p>{pc()}<a class="g-call" href="tel:08006546343">or call 0800 654 6343</a></section>')

# ---------------------------------------------------------------- page scripts
JS_MOSAIC = '''
  MS.$$("#mosaic .mcol").forEach(function (col, i) {
    gsap.to(col, { yPercent: i % 2 ? 9 : -9, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  });'''
JS_SWAP = '''
  var bgs = MS.$$("#eFit .media"), ds = MS.$$("#eDesc a"), n = bgs.length;
  var tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
  for (var i = 1; i < n; i++) {
    tl.to("#eWords", { yPercent: -100 / n * i, duration: 1 }, i - 1 + 0.4)
      .fromTo(bgs[i], { opacity: 0, scale: 1.2 }, { opacity: 1, scale: 1, duration: 1 }, i - 1 + 0.4);
  }
  tl.to({}, { duration: 0.6 });
  ScrollTrigger.create({ trigger: "#eFit", start: "top top", end: "+=" + n * 80 + "%", pin: true, scrub: 0.5, animation: tl,
    onUpdate: function (s) {
      var k = Math.min(n - 1, Math.floor(s.progress * n + 0.12));
      ds.forEach(function (d, j) { d.classList.toggle("on", j === k); });
      MS.$("#eN").textContent = (k + 1) + " / " + n;
      gsap.set("#eBar", { scaleX: s.progress });
    } });'''
JS_CHAPS = '''
  MS.$$(".b-chap").forEach(function (ch) {
    gsap.fromTo(ch.querySelector(".media"), { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ch, start: "top bottom", end: "top top", scrub: true } });
    gsap.from(ch.querySelector("h3"), { yPercent: 60, autoAlpha: 0, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: ch, start: "top 45%" } });
  });'''
def js(*parts): return "\nif (MS.motion) {" + "".join((JS_MOSAIC,) + parts) + "\n}\n"

VERSIONS = [
    ("Story", "Who you are first, then what you fit and how a job goes.",
     [say(), about_split(), fit_swap(), job_rows(), work_grid(), brands(), reviews_grid(), areas_text("blk"), tool(), PAY, end()], js(JS_SWAP)),
    ("Proof", "Numbers, jobs and reviews straight after the hero.",
     [nums("org"), work_strip(), voices("bone"), about_film(), fit_tiles(), job_xpin(), areas_marquee(), tool("blk"), PAY, end()], js()),
    ("Services", "Opens on what you fit, one full screen each.",
     [fit_chaps(), say(), about_split("blk", True, "fly-snowdon-1"), job_cols("bone"), work_cols(), brands(), reviews_marquee(), areas_text("blk"), PAY, tool(), end()], js(JS_CHAPS)),
    ("Local", "Leads with the towns you cover, then the company.",
     [areas_marquee(), about_film(), fit_panels(), job_split(), work_rows(), nums("blk"), voices("org"), tool(), PAY, end()], js()),
    ("Film", "About-us film that opens out, then full-screen job steps.",
     [about_window(), fit_swap(), nums("org"), job_chaps(), work_film(), voices("blk"), brands("bone"), areas_text(), tool("blk"), PAY, end()], js(JS_SWAP, JS_CHAPS)),
]

if __name__ == "__main__":
    for i, (name, blurb, secs, script) in enumerate(VERSIONS):
        open(os.path.join(HERE, f"mosaic-{i+1}.html"), "w").write(page("hero-mosaic", i + 1, HERO + "\n" + "\n".join(secs), script, "mosaic"))
    tiles = "".join(f'<a href="mosaic-{i+1}.html"><img src="assets/img/mosaic-{i+1}.jpg" alt=""><span><b>{i+1}</b><strong>{v[0]}</strong><em>{v[1]}</em></span></a>' for i, v in enumerate(VERSIONS))
    chooser = HEAD.format(title="Midlands Solar mosaic versions") + '''<body>
<style>
.pick{padding:clamp(28px,5vw,72px) var(--pad)}
.pick h1{font-size:clamp(40px,7vw,110px);margin:18px 0 12px}
.pick>p{color:var(--mute);max-width:56ch;margin-bottom:clamp(28px,4vw,56px)}
.pick img.lg{height:54px;width:auto}
.pick-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:clamp(20px,2.4vw,36px) 16px}
.pick-grid a{display:block}
.pick-grid a>img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;background:#1A1A1A;transition:transform .8s var(--ease)}
.pick-grid a:hover>img{transform:scale(.98)}
.pick-grid span{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 14px;padding-top:14px}
.pick-grid b{grid-row:span 2;font:600 44px/1 var(--disp);color:var(--o)}
.pick-grid strong{font:500 24px/1.1 var(--disp)}
.pick-grid em{font-style:normal;color:var(--mute);font-size:15px}
</style>
<main class="pick">
<img class="lg" src="assets/img/logo-light.png" alt="Midlands Solar">
<h1>Five mosaic versions.</h1>
<p>All five open with the same moving hero. The difference is what comes after it, so scroll each one to the bottom. The numbered switch in the corner jumps between them.</p>
<div class="pick-grid">''' + tiles + '''</div>
</main>
</body>
</html>
'''
    open(os.path.join(HERE, "mosaics.html"), "w").write(chooser)
    print("built 5 mosaic versions + chooser")
