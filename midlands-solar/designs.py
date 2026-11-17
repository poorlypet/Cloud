"""Builds the five homepage designs (design-1.html … design-5.html) and the
chooser page (designs.html). Run:  python3 designs.py

Each design is a full homepage with its own layout. Shared pieces (postcode
bar, reviews, numbers, funding/finance links) are defined once below. The nav,
footer and motion come from assets/js/designs.js."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))

REVIEWS = [
    ("The installation was quick, tidy and hassle-free. We're already seeing the benefits on our energy bills.", "Emily R.", "Homeowner, Birmingham"),
    ("From quote to completion, everything was simple. The system looks great and performs even better.", "James M.", "Homeowner, Solihull"),
    ("A brilliant team to work with. Professional, knowledgeable and always on hand to help.", "David L.", "Business owner, Coventry"),
    ("Solar has transformed the way we power our farm. It's efficient, reliable and future-proof.", "Tom P.", "Farmer, Warwickshire"),
]
STEPS = [
    ("Enter your postcode", "Pick your address and drop a pin on your roof.", "home-drone-1.jpg"),
    ("See panels on your roof", "We measure your roof from satellite images and lay the panels out for you.", "home-5.jpg"),
    ("Get your price", "A full price on screen, with and without a battery. Book a call if you like it.", "home-1.jpg"),
]
FIT = [
    ("Solar panels", "All-black panels that sit flat and neat on your roof.", "products.html#panels", "home-2.jpg"),
    ("Battery storage", "Store the power you make in the day and use it at night.", "products.html#batteries", "bat-ecoflow-3.jpg"),
    ("Commercial", "Warehouses, offices and units that use power all day.", "commercial.html", "com-1.jpg"),
    ("Farms", "Barns and farm buildings put to work.", "agricultural.html", "com-3.jpg"),
]

_pc = 0
def pc(label="Show my roof", hin=False):
    global _pc
    _pc += 1
    return (f'<form class="pc" data-pc{" data-hin" if hin else ""}><label class="sr" for="pc{_pc}">Postcode</label>'
            f'<input id="pc{_pc}" name="postcode" placeholder="Your postcode" autocomplete="postal-code" required>'
            f'<button class="btn" type="submit"><span>{label}</span> <i>→</i></button></form>')

def lab(t): return f'<p class="lab"><i></i>{t}</p>'
def img(name, alt="", extra=""): return f'<img src="assets/img/{name}" alt="{alt}" loading="lazy"{extra}>'
def vid(name, auto=False):
    return (f'<video src="assets/video/{name}.mp4" poster="assets/video/{name}.jpg" muted loop playsinline '
            + ('autoplay' if auto else 'data-v preload="none"') + '></video>')

def voices(skin):
    qs = "".join(f'<blockquote{" class=on" if i == 0 else ""}><p>“{q}”</p><footer><b>{n}</b> · {w}</footer></blockquote>' for i, (q, n, w) in enumerate(REVIEWS))
    return (f'<section class="voices {skin}" data-voices>{lab("Reviews")}<div><div class="stage">{qs}</div>'
            '<div class="ctl"><button data-prev aria-label="Previous review">←</button><button data-next aria-label="Next review">→</button><span data-vn>1 / 4</span></div></div></section>')

def nums(skin):
    return (f'<section class="nums {skin}"><div data-up><b data-count="4.9" data-d="1">4.9</b><span>out of 5 from our customers</span></div>'
            '<div data-up><b data-count="10" data-s="+">10+</b><span>years fitting solar</span></div>'
            '<div data-up><b data-count="25">25</b><span>year panel warranty</span></div></section>')

PAY = ('<section class="pay"><a href="funding.html" data-up><span>Government funding</span><div><h3>Could you get it part-paid?</h3>'
       '<p>Some homes qualify for grants and 0% VAT. We check what applies to you.</p></div><i>↗</i></a>'
       '<a href="finance.html" data-up><span>Finance</span><div><h3>Spread the cost monthly.</h3>'
       '<p>Pay over time and let the savings on your bill do some of the work.</p></div><i>↗</i></a></section>')

def end_sun():
    return ('<section class="end"><div class="sun" id="sun"></div><h2 data-rise>Your roof.<br>Your price.</h2>'
            f'<p>It takes about a minute and nobody calls unless you ask.</p>{pc()}</section>')

WORK_STRIP = "".join([
    f'<figure>{vid("fly-glades-1")}<figcaption>Roof install <span>Drone film</span></figcaption></figure>',
    f'<figure class="wide">{img("home-drone-1.jpg", "Solar panels on a house from above")}<figcaption>Home solar <span>From above</span></figcaption></figure>',
    f'<figure>{img("home-1.jpg", "Solar panels on a house roof")}<figcaption>Home solar <span>All-black panels</span></figcaption></figure>',
    f'<figure class="wide">{vid("orbit-2")}<figcaption>Barn roof <span>Drone film</span></figcaption></figure>',
    f'<figure>{img("bat-ecoflow-1.jpg", "Battery fitted in a home")}<figcaption>Battery storage <span>EcoFlow</span></figcaption></figure>',
    f'<figure>{vid("fly-snowdon-1")}<figcaption>Roof install <span>Drone film</span></figcaption></figure>',
    f'<figure class="wide">{vid("commercial")}<figcaption>Commercial roof <span>Drone film</span></figcaption></figure>',
    f'<figure>{img("bat-sigen.jpg", "Battery fitted outside a home")}<figcaption>Battery storage <span>Sigenergy</span></figcaption></figure>',
    f'<figure>{img("home-4.jpg", "Solar panels on a house roof")}<figcaption>Home solar <span>Finished roof</span></figcaption></figure>',
])
MORE = '<a class="tl" href="work.html">See all our work <i>→</i></a>'

# ------------------------------------------------------------------ 1 Daylight
def d1():
    steps = "".join(f'<article data-up><b>{i+1}</b><div class="media" data-wipe>{img(p, t)}</div><h3>{t}</h3><p>{s}</p></article>' for i, (t, s, p) in enumerate(STEPS))
    panels = "".join(f'<a href="{h}">{img(p, t)}<div><h3>{t}</h3><p>{s}</p></div></a>' for t, s, h, p in FIT)
    row1 = "".join([f'<div class="media">{img("home-drone-2.jpg")}</div>', f'<div class="media tall">{vid("fly-glades-2")}</div>', f'<div class="media">{img("home-3.jpg")}</div>',
                    f'<div class="media tall">{img("bat-ecoflow-1.jpg")}</div>', f'<div class="media">{vid("commercial")}</div>', f'<div class="media tall">{img("home-6.jpg")}</div>'])
    row2 = "".join([f'<div class="media tall">{img("home-4.jpg")}</div>', f'<div class="media">{vid("orbit-2")}</div>', f'<div class="media tall">{vid("fly-snowdon-2")}</div>',
                    f'<div class="media">{img("com-2.jpg")}</div>', f'<div class="media tall">{img("bat-sigen.jpg")}</div>', f'<div class="media">{img("home-drone-1.jpg")}</div>'])
    return "light", "", f'''
<section class="a-hero" data-hero>
  <h1><span class="ln"><span>Your roof.</span></span><span class="ln"><span>Your panels.</span></span><span class="ln"><span><em>Your price.</em></span></span></h1>
  <div class="a-hero-row"><p data-hin>Type in your postcode and see solar panels laid out on your own roof, with a price, in about a minute.</p>{pc(hin=True)}</div>
  <div class="a-win media" data-grow>{vid("hero-orbit", True)}<div class="tags"><span>MCS certified</span><span>Rated 4.9 out of 5</span><span>25-year panel warranty</span></div></div>
</section>
<section class="sec">
  {lab("How it works")}
  <div class="head"><h2 data-rise>Three steps.<br>About a minute.</h2><p class="sub">No home visit and no sales call. You do it yourself, from the sofa.</p></div>
  <div class="a-steps">{steps}</div>
</section>
<section class="a-fit blk">
  <div class="sec">{lab("What we fit")}<div class="head"><h2 data-rise>Everything for<br>the sun.</h2><p class="sub">Homes are most of what we do. We fit businesses and farms too.</p></div></div>
  <div class="a-panels">{panels}</div>
</section>
<section class="a-work">
  <div class="sec" style="padding-bottom:clamp(36px,4vw,64px)">{lab("Recent work")}<div class="head"><h2 data-rise>Fitted by us.</h2>{MORE}</div></div>
  <div class="a-row" data-drift="1">{row1}</div>
  <div class="a-row" data-drift="-1">{row2}</div>
</section>
{nums("blk")}
{voices("bone")}
{PAY}
<section class="a-end org">{lab("Get your price")}<h2 data-rise>See it on<br>your roof.</h2><p>It takes about a minute and nobody calls unless you ask.</p>{pc()}</section>
''', ""

# ------------------------------------------------------------------ 2 Cinema
def d2():
    caps = "".join(f'<div class="b-cap{" on" if i == 0 else ""}"><b>STEP {i+1} OF 3</b><h3>{t}</h3><p class="sub">{s}</p></div>' for i, (t, s, p) in enumerate(STEPS))
    media = [img("home-drone-2.jpg", "Solar panels from above"), img("bat-ecoflow-3.jpg", "Battery storage"), vid("commercial"), img("com-3.jpg", "Solar on a farm building")]
    chaps = "".join(f'<article class="b-chap"><div class="media">{m}</div><p class="lab"><span><i></i>What we fit</span><span>{i+1} / 4</span></p>'
                    f'<div class="b-chap-in"><h3>{t}</h3><div><p>{s}</p><a class="btn" href="{h}">Find out more <i>→</i></a></div></div></article>'
                    for i, ((t, s, h, p), m) in enumerate(zip(FIT, media)))
    return "", "", f'''
<section class="b-hero" data-hero>
  <div class="media">{vid("hero-orbit", True)}</div>
  <div class="b-hero-in">
    <h1><span class="ln"><span>Power from</span></span><span class="ln"><span>your <em>own roof.</em></span></span></h1>
    <p data-hin>Enter your postcode to see solar panels on your roof and get a price in about a minute.</p>
    {pc(hin=True)}
  </div>
  <div class="b-meta" data-hin><span>MCS certified</span><span>Rated 4.9 out of 5</span><span>25-year panel warranty</span></div>
</section>
<section class="b-demo" id="bDemo">
  <div>{lab("How it works")}<div class="b-caps" id="bCaps">{caps}</div></div>
  <div data-roof></div>
  <div class="b-side"><h2>Postcode to price in about a minute.</h2><div class="b-bar"><i id="bBar"></i></div></div>
</section>
<div class="b-chaps">{chaps}</div>
<section class="work blk" data-xpin>
  <div class="work-head"><div>{lab("Recent work")}<h2>Fitted by us.</h2></div>{MORE}</div>
  <div class="work-track" data-track>{WORK_STRIP}</div>
</section>
{nums("blk")}
{voices("blk")}
{PAY}
{end_sun()}
''', '''
if (MS.motion) {
  var caps = MS.$$("#bCaps .b-cap");
  var tl = MS.roofTimeline(MS.$("[data-roof]"));
  ScrollTrigger.create({ trigger: "#bDemo", start: "top top", end: "+=300%", pin: true, scrub: 0.6, animation: tl,
    onUpdate: function (s) {
      var i = Math.min(2, Math.floor(s.progress * 3.15));
      caps.forEach(function (c, k) { c.classList.toggle("on", k === i); });
      gsap.set("#bBar", { scaleX: s.progress });
    } });
  MS.$$(".b-chap").forEach(function (ch) {
    gsap.fromTo(ch.querySelector(".media"), { scale: 1.3 }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: ch, start: "top bottom", end: "top top", scrub: true } });
    gsap.from(ch.querySelector("h3"), { yPercent: 60, autoAlpha: 0, duration: 1.1, ease: "power4.out",
      scrollTrigger: { trigger: ch, start: "top 45%" } });
  });
}
'''

# ------------------------------------------------------------------ 3 Sunrise
def d3():
    skins = ["blk", "bone", "org"]
    pans = "".join(f'<article class="c-pan {skins[i]}"><div>{lab("How it works")}<b>{i+1}</b><div><h3>{t}</h3><p class="sub">{s}</p></div></div><div class="media">{img(p, t)}</div></article>'
                   for i, (t, s, p) in enumerate(STEPS))
    tiles = "".join(f'<a href="{h}">{img(p, t)}<i>↗</i><div><h3>{t}</h3><p>{s}</p></div></a>' for t, s, h, p in FIT)
    cols = [[img("home-1.jpg"), vid("fly-glades-3"), img("bat-ecoflow-1.jpg"), img("home-6.jpg")],
            [vid("fly-snowdon-1"), img("home-3.jpg"), img("com-2.jpg"), img("home-4.jpg"), vid("battery")],
            [img("home-2.jpg"), img("bat-sigen.jpg"), vid("fly-glades-1"), img("com-4.jpg")]]
    pars = ["6", "-14", "6"]
    colh = "".join(f'<div data-par="{pars[i]}">' + "".join(f'<div class="media">{m}</div>' for m in c) + "</div>" for i, c in enumerate(cols))
    qs = "".join(f'<blockquote><p>“{q}”</p><footer><b>{n}</b> · {w}</footer></blockquote>' for q, n, w in REVIEWS)
    return "navbar", "", f'''
<section class="c-hero" id="cHero" data-hero>
  <h1><span class="ln"><span>Put the sun</span></span><span class="ln"><span>to work.</span></span></h1>
  <div class="row"><p data-hin>Enter your postcode to see solar panels on your roof and get a price in about a minute.</p>{pc(hin=True)}</div>
  <div class="c-sun media">{vid("hero-orbit", True)}</div>
  <div class="c-over" id="cOver"><h2>Fitted across<br>the Midlands.</h2><p class="sub">Homes first. Businesses and farms too.</p></div>
</section>
<section class="c-how" data-xpin><div class="c-track" data-track>{pans}</div></section>
<section class="blk">
  <div class="sec" style="padding-bottom:clamp(36px,4vw,64px)">{lab("What we fit")}<div class="head"><h2 data-rise>Pick your<br>power.</h2><p class="sub">Homes are most of what we do. We fit businesses and farms too.</p></div></div>
  <div class="c-tiles">{tiles}</div>
</section>
<section class="blk">
  <div class="sec" style="padding-bottom:clamp(36px,4vw,64px)">{lab("Recent work")}<div class="head"><h2 data-rise>Fitted by us.</h2>{MORE}</div></div>
  <div class="c-cols">{colh}</div>
</section>
{nums("org")}
<section class="c-q bone">{lab("Reviews")}<div class="c-qtrack" data-dup>{qs}</div></section>
{PAY}
<section class="a-end blk" style="color:#fff">{lab("Get your price")}<h2 data-rise style="color:#fff">See it on<br><em>your roof.</em></h2><p>It takes about a minute and nobody calls unless you ask.</p>{pc()}</section>
''', '''
if (MS.motion) {
  gsap.timeline({ scrollTrigger: { trigger: "#cHero", start: "top top", end: "+=140%", pin: true, scrub: 0.5 } })
    .to("#cHero", { "--r": 130, "--cx": 50, "--cy": 50, ease: "power2.in", duration: 1 }, 0)
    .to("#cOver", { opacity: 1, duration: 0.3 }, 0.75)
    .to({}, { duration: 0.25 });
}
'''

# ------------------------------------------------------------------ 4 Split
def d4():
    arts = "".join(f'<article><b>STEP {i+1} OF 3</b><h3>{t}</h3><p class="sub">{s}</p></article>' for i, (t, s, p) in enumerate(STEPS))
    tabs = [("Solar panels", "All-black panels that sit flat and neat on your roof.", "products.html#panels", "home-2.jpg"),
            ("Batteries", "Store the power you make in the day and use it at night.", "products.html#batteries", "bat-ecoflow-3.jpg"),
            ("Inverters", "The unit that turns sunlight into power your home can use.", "products.html#inverters", "inv-fox.jpg"),
            ("Commercial", "Warehouses, offices and units that use power all day.", "commercial.html", "com-1.jpg"),
            ("Farms", "Barns and farm buildings put to work.", "agricultural.html", "com-3.jpg")]
    tb = "".join(f'<button{" class=on" if i == 0 else ""} data-tab="{i}">{t[0]}</button>' for i, t in enumerate(tabs))
    ti = "".join(f'<img src="assets/img/{t[3]}" alt="{t[0]}"{" class=on" if i == 0 else ""}>' for i, t in enumerate(tabs))
    tp = "".join(f'<div class="d-pane{" on" if i == 0 else ""}"><h3>{t[0]}</h3><p>{t[1]}</p><a class="btn" href="{t[2]}">Find out more <i>→</i></a></div>' for i, t in enumerate(tabs))
    strip = "".join(f'<div class="media" data-wipe>{m}</div>' for m in [img("home-1.jpg"), vid("fly-snowdon-1"), img("bat-sigen.jpg"), img("home-drone-1.jpg")])
    return "light navbar", "", f'''
<section class="d-hero" data-hero>
  <div>
    <h1><span class="ln"><span>Solar,</span></span><span class="ln"><span>without the</span></span><span class="ln"><span><em>sales visit.</em></span></span></h1>
    <p class="sub" data-hin>Enter your postcode to see panels on your own roof and get a price in about a minute.</p>
    {pc(hin=True)}
    <div class="d-trust" data-hin><span>MCS certified</span><span>Rated 4.9 out of 5</span><span>25-year panel warranty</span></div>
  </div>
  <div class="media">{vid("fly-glades-1", True)}</div>
</section>
<section class="d-how blk" id="dHow">
  <div data-roof></div>
  <div>{arts}</div>
</section>
<section class="d-fit">
  <div class="top">{lab("What we fit")}<div class="head"><h2 data-rise>Choose what<br>you need.</h2><p class="sub">Tap through to see each one.</p></div><div class="d-tabs" id="dTabs">{tb}</div></div>
  <div class="d-stage"><div class="media" id="dImgs">{ti}</div><div class="d-panes" id="dPanes">{tp}</div></div>
</section>
<section class="d-film">
  <div class="media" data-par="-8">{vid("hero-orbit")}</div>
  <div><div>{lab("Recent work")}<h2 data-rise>Fitted by us.</h2></div>{MORE}</div>
</section>
<div class="d-strip">{strip}</div>
{nums("bone")}
{voices("org")}
{PAY}
<section class="d-end blk">
  <div>{lab("Get your price")}<h2 data-rise>See it on<br><em>your roof.</em></h2><p class="sub">It takes about a minute and nobody calls unless you ask.</p>{pc()}</div>
  <div class="media" data-wipe>{img("home-drone-2.jpg", "Solar panels on a house from above")}</div>
</section>
''', '''
var tabs = MS.$$("#dTabs button"), imgs = MS.$$("#dImgs img"), panes = MS.$$("#dPanes .d-pane");
tabs.forEach(function (b, i) {
  b.addEventListener("click", function () {
    [tabs, imgs, panes].forEach(function (set) { set.forEach(function (el, k) { el.classList.toggle("on", k === i); }); });
  });
});
if (MS.motion) {
  ScrollTrigger.create({ trigger: "#dHow", start: "top top", end: "bottom bottom", scrub: 0.6, animation: MS.roofTimeline(MS.$("[data-roof]")) });
  gsap.from(".d-hero .media video", { scale: 1.25, duration: 2.4, ease: "power3.out", delay: 1.2 });
}
'''

# ------------------------------------------------------------------ 5 Mosaic
def d5():
    rows = "".join(f'<article class="e-row"><div class="media" data-wipe>{img(p, t)}</div><div data-up><b>{i+1}</b><h3>{t}</h3><p class="sub">{s}</p></div></article>'
                   for i, (t, s, p) in enumerate(STEPS))
    media = [img("home-drone-2.jpg"), img("bat-ecoflow-3.jpg"), vid("commercial"), img("com-3.jpg")]
    bg = "".join(f'<div class="media">{m}</div>' for m in media)
    words = "".join(f"<span>{t}</span>" for t in ["Panels", "Batteries", "Commercial", "Farms"])
    desc = "".join(f'<a href="{h}"{" class=on" if i == 0 else ""}>{s}<u>Find out more →</u></a>' for i, (t, s, h, p) in enumerate(FIT))
    grid = "".join([f'<div class="media w7" data-wipe>{vid("hero-orbit")}</div>', f'<div class="media w5" data-wipe>{img("home-1.jpg")}</div>',
                    f'<div class="media w4" data-wipe>{img("bat-sigen.jpg")}</div>', f'<div class="media w4" data-wipe>{vid("fly-snowdon-2")}</div>', f'<div class="media w4" data-wipe>{img("home-4.jpg")}</div>',
                    f'<div class="media w5" data-wipe>{img("bat-ecoflow-1.jpg")}</div>', f'<div class="media w7" data-wipe>{img("home-drone-1.jpg")}</div>'])
    qs = "".join(f'<blockquote data-up><p>“{q}”</p><footer><b>{n}</b> · {w}</footer></blockquote>' for q, n, w in REVIEWS)
    return "hero-mosaic", "", f'''
<section class="hero" data-hero>
  <div class="hero-bg hero-bg-mosaic" id="mosaic" aria-hidden="true"></div>
  <div class="hero-shade"></div>
  <div class="hero-in">
    <h1><span class="ln"><span>See solar</span></span><span class="ln"><span>on <em>your</em> roof.</span></span></h1>
    <div class="hero-row"><p data-hin>Enter your postcode. We map your roof from above, lay the panels out and show you a price in about a minute.</p>{pc(hin=True)}</div>
  </div>
  <div class="hero-foot" data-hin><span>MCS certified</span><span>Rated 4.9 out of 5</span><span>25-year panel warranty</span></div>
</section>
<section class="say"><p data-words>We fit solar panels and batteries on homes across the Midlands. You see your roof, your panels and your price before anyone picks up the phone.</p></section>
<section class="e-how blk">
  <div class="sec">{lab("How it works")}<div class="head"><h2 data-rise>Three steps.<br>About a minute.</h2><p class="sub">No home visit and no sales call. You do it yourself, from the sofa.</p></div></div>
  {rows}
</section>
<section class="e-fit" id="eFit">
  {bg}
  <p class="lab"><span><i></i>What we fit</span><span id="eN">1 / 4</span></p>
  <div class="e-words"><div id="eWords">{words}</div></div>
  <div class="e-desc" id="eDesc">{desc}</div>
  <div class="b-bar"><i id="eBar"></i></div>
</section>
<section class="blk">
  <div class="sec" style="padding-bottom:clamp(36px,4vw,64px)">{lab("Recent work")}<div class="head"><h2 data-rise>Fitted by us.</h2>{MORE}</div></div>
  <div class="e-grid">{grid}</div>
</section>
{nums("org")}
<section class="bone"><div class="e-qhead">{lab("Reviews")}<h2 data-rise>What customers say.</h2></div><div class="e-q">{qs}</div></section>
{PAY}
{end_sun()}
''', '''
if (MS.motion) {
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
    } });
  MS.$$("#mosaic .mcol").forEach(function (col, i) {
    gsap.to(col, { yPercent: i % 2 ? 9 : -9, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  });
}
'''

NAMES = ["Daylight", "Cinema", "Sunrise", "Split", "Mosaic"]
BLURB = ["Light and open. A film window that opens out as you scroll.",
         "All black. Full-screen film and big chapter screens.",
         "Orange first. The sun grows into a film as you scroll.",
         "Half text, half picture, the whole way down.",
         "A moving wall of your jobs behind the headline."]

HEAD = '''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="Solar panels and batteries fitted across the Midlands. See your roof, your panels and your price online in about a minute.">
<link rel="stylesheet" href="assets/fonts/fonts.css">
<link rel="stylesheet" href="assets/css/home2.css">
<link rel="stylesheet" href="assets/css/designs.css">
</head>
'''
TAIL = '''
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script src="assets/js/designs.js"></script>
'''

def page(cls, n, main, js, family="design"):
    """One full page: n is its number in the corner switch, family the set it belongs to."""
    return (HEAD.format(title="Midlands Solar") + f'<body class="{cls}" data-design="{n}" data-set="{family}">\n<main id="top">{main}</main>\n' + TAIL
            + (f"<script>\n(function () {{{js}}})();\n</script>\n" if js.strip() else "") + "</body>\n</html>\n")

if __name__ == "__main__":
    for i, fn in enumerate([d1, d2, d3, d4, d5]):
        cls, _, main, js = fn()
        open(os.path.join(HERE, f"design-{i+1}.html"), "w").write(page(cls, i + 1, main, js))

tiles = "".join(f'<a href="design-{i+1}.html"><img src="assets/img/design-{i+1}.jpg" alt=""><span><b>{i+1}</b><strong>{n}</strong><em>{BLURB[i]}</em></span></a>' for i, n in enumerate(NAMES))
CHOOSER = HEAD.format(title="Midlands Solar designs") + '''<body>
<style>
.pick{padding:clamp(28px,5vw,72px) var(--pad)}
.pick h1{font-size:clamp(40px,7vw,110px);margin:18px 0 12px}
.pick>p{color:var(--mute);max-width:52ch;margin-bottom:clamp(28px,4vw,56px)}
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
<h1>Five homepages.</h1>
<p>Open each one and scroll all the way down. The numbered switch in the bottom corner jumps between them.</p>
<div class="pick-grid">''' + tiles + '''</div>
</main>
</body>
</html>
'''
if __name__ == "__main__":
    open(os.path.join(HERE, "designs.html"), "w").write(CHOOSER)
    print("built 5 designs + chooser")
