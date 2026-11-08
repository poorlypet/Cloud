/* ==================================================================
   Axel & Hound · round 2 menu engine
   <body data-layout="..."> picks the mega arrangement:
     cols2img · colsfeature · cols3img · colsproducts · colshover
   <body class="tx"> makes the header transparent over the hero.
   Photography is placeholder (stills from the hero film + stock).
   ================================================================== */
(function () {
  "use strict";

  var U = "https://images.unsplash.com/photo-";
  var IMG = {
    still1: "../media/still-1.jpg", still2: "../media/still-2.jpg",
    cavalier: U + "1560807707-8cc77767d783", catSleep: U + "1519052537078-e6302a4968d4",
    labCollar: U + "1586671267731-da2cf3ceeb80", goldenWalk: U + "1576201836106-db1758fd1c97",
    toller: U + "1525253086316-d0c936c814f8", samoyed: U + "1529429617124-95b109e86bb8",
    mastiff: U + "1541599540903-216a46ca1dc0", poodle: U + "1605244863941-3a3ed921c60d",
    jack: U + "1561037404-61cd46aa615b", darkDog: U + "1534351450181-ea9f78427fe8",
    goldenFlower: U + "1510771463146-e89e6e86560e", goldenToy: U + "1591946614720-90a587da4a36",
    pupDark: U + "1611003228941-98852ba62227", groom: U + "1516734212186-a967f81ad0d7",
    beach: U + "1523480717984-24cba35ae1ef", sea: U + "1530281700549-e82e7bf110d6",
    aussie: U + "1587300003388-59208cc962cb", catStairs: U + "1495360010541-f48722b34f7d",
    kitten: U + "1533743983669-94fa5c4338ec", corgi: U + "1597633425046-08f5110420b5"
  };
  function src(k, w, h) {
    var s = IMG[k];
    if (s.indexOf("http") !== 0) return s;
    return s + "?w=" + w + (h ? "&h=" + h : "") + "&q=80&auto=format&fit=crop";
  }

  var EDITS = ["New in", "Bestsellers", "Gift ideas", "Sale"];

  var MENU = [
    { key: "beds", label: "Beds",
      g: [{ t: "Shop by type", l: ["Bolster beds", "Round beds", "Orthopaedic beds", "Sofa beds", "Crate mats", "Replacement covers"] },
          { t: "Blankets & cushions", l: ["Wool throws", "Bouclé blankets", "Cushions", "Travel blankets"] },
          { t: "Collections", l: ["Bouclé", "Wool", "Velvet", "Linen"] }],
      f: [{ p: "still1", t: "The Bouclé Bed", s: "Deep, soft, made to last", n: "Bolster Bed, Moss Bouclé", pr: "£245" },
          { p: "cavalier", t: "Cushions & Bolsters", s: "For sofa-sharing dogs", n: "Bolster Cushion, Rose", pr: "£95" },
          { p: "catSleep", t: "Throws", s: "Wool for colder evenings", n: "Wool Throw, Oat", pr: "£89" }] },
    { key: "walking", label: "Walking",
      g: [{ t: "Shop by type", l: ["Collars", "Leads", "Harnesses", "Collar & lead sets", "Poop bag holders", "Treat pouches"] },
          { t: "By material", l: ["Leather", "Waxed cotton", "Rope", "Tweed"] },
          { t: "Collections", l: ["Heritage leather", "Field", "City"] }],
      f: [{ p: "labCollar", t: "Leather Collars", s: "Soft, hand-finished leather", n: "Leather Collar, Cognac", pr: "£65" },
          { p: "goldenWalk", t: "The Walking Edit", s: "For the first walk of the day", n: "Rope Lead, Sand", pr: "£55" },
          { p: "toller", t: "Harnesses", s: "A comfortable fit, clean lines", n: "Padded Harness, Olive", pr: "£79" }] },
    { key: "coats", label: "Coats",
      g: [{ t: "Shop by type", l: ["Winter coats", "Raincoats", "Knitwear", "Bathrobes", "Snoods"] },
          { t: "By fit", l: ["Dachshund", "Whippet & greyhound", "French bulldog", "Standard fit"] },
          { t: "Collections", l: ["Quilted", "Merino", "Waxed cotton"] }],
      f: [{ p: "poodle", t: "Knitwear", s: "Merino, cut for movement", n: "Cable Knit Jumper, Cream", pr: "£85" },
          { p: "samoyed", t: "Winter Coats", s: "Quilted warmth for colder days", n: "Quilted Coat, Forest", pr: "£129" },
          { p: "mastiff", t: "Raincoats", s: "Waxed cotton for wet walks", n: "Waxed Raincoat, Tobacco", pr: "£115" }] },
    { key: "dining", label: "Dining",
      g: [{ t: "Shop by type", l: ["Bowls", "Bowl stands", "Placemats", "Treat jars", "Food storage"] },
          { t: "By material", l: ["Stoneware", "Ceramic", "Stainless steel", "Oak"] },
          { t: "Care", l: ["Grooming", "Shampoo", "Brushes"] }],
      f: [{ p: "jack", t: "Stoneware Bowls", s: "Glazed by hand", n: "Stoneware Bowl, Chalk", pr: "£42" },
          { p: "darkDog", t: "Bowl Stands", s: "Raised, for easier eating", n: "Oak Bowl Stand", pr: "£95" },
          { p: "groom", t: "Grooming", s: "Brushes and gentle washes", n: "Beechwood Brush", pr: "£32" }] },
    { key: "play", label: "Play",
      g: [{ t: "Shop by type", l: ["Plush toys", "Rope toys", "Balls", "Chew toys", "Puzzle toys"] },
          { t: "By age", l: ["Puppy", "Adult", "Senior"] },
          { t: "Collections", l: ["Wool felt", "Natural rubber"] }],
      f: [{ p: "goldenToy", t: "Plush Toys", s: "Soft, sturdy, much loved", n: "Plush Lamb", pr: "£24" },
          { p: "pupDark", t: "For Puppies", s: "Gentle first toys", n: "Puppy Play Set", pr: "£60" },
          { p: "corgi", t: "Puzzle Toys", s: "Something to think about", n: "Oak Puzzle", pr: "£38" }] },
    { key: "travel", label: "Travel",
      g: [{ t: "Shop by type", l: ["Carriers", "Car seats", "Travel beds", "Travel bowls", "Travel blankets"] },
          { t: "Occasions", l: ["Weekends away", "Long drives", "City days"] },
          { t: "Collections", l: ["Canvas", "Waxed cotton"] }],
      f: [{ p: "beach", t: "The Travel Edit", s: "For weekends away", n: "Travel Bed, Canvas", pr: "£165" },
          { p: "sea", t: "Car Seats", s: "Padded, safe, easy to clean", n: "Car Seat, Charcoal", pr: "£185" },
          { p: "aussie", t: "Travel Bowls", s: "Fold flat, pack easily", n: "Folding Bowl", pr: "£28" }] },
    { key: "cats", label: "Cats",
      g: [{ t: "Shop by type", l: ["Cat beds", "Scratchers", "Toys", "Bowls", "Collars"] },
          { t: "Living", l: ["Cat trees", "Litter boxes", "Window perches"] },
          { t: "Collections", l: ["Felt", "Oak"] }],
      f: [{ p: "catStairs", t: "Cat Beds", s: "Warm spots for long naps", n: "Felt Cave Bed", pr: "£120" },
          { p: "kitten", t: "Scratchers", s: "Made to sit in the room", n: "Oak Scratcher", pr: "£140" },
          { p: "catSleep", t: "Throws", s: "For the warmest spot", n: "Wool Throw, Oat", pr: "£89" }] },
    { key: "gifts", label: "Gifts",
      g: [{ t: "Shop by type", l: ["Gift sets", "For the new puppy", "Under £50", "Under £100", "Gift cards"] },
          { t: "For", l: ["Dogs", "Cats", "Their people"] },
          { t: "Occasions", l: ["Birthdays", "Christmas", "Gotcha day"] }],
      f: [{ p: "still2", t: "Gift Sets", s: "Wrapped and ready to give", n: "Winter Gift Set", pr: "£120" },
          { p: "goldenFlower", t: "Thank-you Gifts", s: "Small and beautifully made", n: "Treat Jar Set", pr: "£48" },
          { p: "pupDark", t: "New Puppy", s: "Everything for the first week", n: "New Puppy Box", pr: "£150" }] }
  ];

  /* ---------------- helpers ---------------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function col(t, items, data) {
    return '<div class="mp-col"><p class="mp-h">' + esc(t) + "</p><ul>" + items.map(function (x, i) {
      var d = data ? ' data-f="' + data(x, i) + '"' : "";
      return '<li><a href="#"' + d + (/^sale$/i.test(x) ? ' class="is-sale"' : "") + ">" + esc(x) + "</a></li>";
    }).join("") + "</ul></div>";
  }
  function card(f, w, h, ratio) {
    return '<a class="mp-card" href="#"><span class="mp-img" style="aspect-ratio:' + ratio + '"><img src="' + src(f.p, w, h) +
      '" alt="" loading="lazy" decoding="async"></span><span class="mp-t">' + esc(f.t) + '</span><span class="mp-s">' + esc(f.s) + "</span></a>";
  }
  function prod(f) {
    return '<a class="mp-card mp-prod" href="#"><span class="mp-img" style="aspect-ratio:4/5"><img src="' + src(f.p, 520, 650) +
      '" alt="" loading="lazy" decoding="async"></span><span class="mp-t">' + esc(f.n) + '</span><span class="mp-s">' + esc(f.pr) + "</span></a>";
  }
  var ARW = '<svg viewBox="0 0 16 10"><path d="M0 5h15M11 1l4 4-4 4"/></svg>';
  function foot(c) {
    return '<div class="mp-foot"><div class="mp-foot-in"><a href="#">Shop all ' + esc(c.label.toLowerCase()) + ARW + "</a>" +
      '<div class="mp-usp"><span>Complimentary UK delivery over £150</span><span>Gift wrapping on every order</span><span>30-day returns</span></div></div></div>';
  }

  var LAYOUTS = {
    cols2img: function (c) {
      return '<div class="mp-in">' + c.g.map(function (g) { return col(g.t, g.l); }).join("") + col("Edits", EDITS) +
        card(c.f[0], 640, 800, "4/5") + card(c.f[1], 640, 800, "4/5") + "</div>";
    },
    colsfeature: function (c) {
      return '<div class="mp-in">' + col(c.g[0].t, c.g[0].l) + col(c.g[1].t, c.g[1].l) + col("Edits", EDITS) +
        card(c.f[0], 1200, 800, "3/2") + "</div>";
    },
    cols3img: function (c) {
      return '<div class="mp-in">' + col(c.g[0].t, c.g[0].l) + col("Edits", EDITS) +
        c.f.map(function (f) { return card(f, 560, 750, "3/4"); }).join("") + "</div>";
    },
    colsproducts: function (c) {
      return '<div class="mp-in">' + col(c.g[0].t, c.g[0].l) + col(c.g[1].t, c.g[1].l) +
        '<div class="mp-prods"><div class="mp-prods-h"><p class="mp-h">Most loved</p><a href="#">View all</a></div><div class="mp-prow">' +
        c.f.map(prod).join("") + "</div></div></div>";
    },
    colshover: function (c) {
      function match(x, i) {
        var lx = x.toLowerCase().replace(/s$/, ""), m = -1;
        c.f.forEach(function (f, n) { var ft = f.t.toLowerCase().replace(/s$/, ""); if (m < 0 && (ft.indexOf(lx) > -1 || lx.indexOf(ft) > -1)) m = n; });
        return m > -1 ? m : i % 3;
      }
      var feats = JSON.stringify(c.f.map(function (f) { return { s: src(f.p, 760, 950), t: f.t, d: f.s }; })).replace(/'/g, "&#39;");
      return '<div class="mp-in">' + col(c.g[0].t, c.g[0].l, match) + col(c.g[1].t, c.g[1].l, match) + col(c.g[2].t, c.g[2].l, match) + col("Edits", EDITS, match) +
        '<a class="mp-card mp-swap" href="#" data-feats=\'' + feats + "'>" +
        '<span class="mp-img" style="aspect-ratio:4/5"><img src="' + src(c.f[0].p, 760, 950) + '" alt="" decoding="async"></span>' +
        '<span class="mp-t">' + esc(c.f[0].t) + '</span><span class="mp-s">' + esc(c.f[0].s) + "</span></a></div>";
    }
  };

  /* ---------------- build ---------------- */
  var body = document.body;
  var layout = LAYOUTS[body.getAttribute("data-layout")] || LAYOUTS.cols2img;
  var hdr = document.querySelector(".hdr");
  var nav = document.querySelector("[data-nav]");
  var mega = document.createElement("div");
  mega.className = "mega";
  hdr.appendChild(mega);
  var scrim = document.createElement("div");
  scrim.className = "scrim";
  body.appendChild(scrim);

  var navHtml = "";
  MENU.forEach(function (c) {
    navHtml += '<li><a class="nl" href="#" data-k="' + c.key + '" aria-expanded="false" aria-controls="mp-' + c.key + '">' + esc(c.label) + "</a></li>";
    var p = document.createElement("div");
    p.className = "mp";
    p.id = "mp-" + c.key;
    p.setAttribute("data-k", c.key);
    p.innerHTML = layout(c) + foot(c);
    mega.appendChild(p);
  });
  if (nav.hasAttribute("data-sale")) navHtml += '<li><a class="nl sale" href="#">Sale</a></li>';
  nav.innerHTML = navHtml;

  /* header state: transparent pages go solid on hover, open menu or scroll */
  var tx = body.classList.contains("tx"), hovering = false, cur = null;
  function paint() {
    var scrolled = window.scrollY > 8;
    hdr.classList.toggle("scrolled", scrolled);
    if (tx) hdr.classList.toggle("clear", !scrolled && !hovering && !cur);
  }
  window.addEventListener("scroll", paint, { passive: true });

  var openT = 0, closeT = 0;
  var links = nav.querySelectorAll(".nl[data-k]");
  function panel(k) { return mega.querySelector('.mp[data-k="' + k + '"]'); }
  function open(k) {
    clearTimeout(closeT);
    if (cur === k) return;
    cur = k;
    links.forEach(function (a) { a.setAttribute("aria-expanded", a.getAttribute("data-k") === k ? "true" : "false"); });
    mega.querySelectorAll(".mp").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-k") === k); });
    mega.style.height = panel(k).offsetHeight + "px";
    mega.classList.add("open"); nav.classList.add("dim"); scrim.classList.add("on");
    paint();
  }
  function close() {
    clearTimeout(openT);
    if (!cur) return;
    cur = null;
    links.forEach(function (a) { a.setAttribute("aria-expanded", "false"); });
    mega.querySelectorAll(".mp").forEach(function (p) { p.classList.remove("on"); });
    mega.style.height = "0px";
    mega.classList.remove("open"); nav.classList.remove("dim"); scrim.classList.remove("on");
    paint();
  }
  var touch = window.matchMedia("(hover: none)").matches;
  links.forEach(function (a) {
    var k = a.getAttribute("data-k");
    a.addEventListener("mouseenter", function () {
      clearTimeout(openT); clearTimeout(closeT);
      openT = setTimeout(function () { open(k); }, cur ? 0 : 110);
    });
    a.addEventListener("mouseleave", function () { clearTimeout(openT); });
    a.addEventListener("focus", function () { open(k); });
    a.addEventListener("click", function (e) { e.preventDefault(); if (touch && cur !== k) open(k); });
  });
  hdr.querySelectorAll(".hdr-bar a:not([data-k]), .hdr-bar button").forEach(function (el) {
    el.addEventListener("mouseenter", function () { clearTimeout(openT); closeT = setTimeout(close, 120); });
    el.addEventListener("focus", close);
  });
  hdr.addEventListener("mouseenter", function () { hovering = true; clearTimeout(closeT); paint(); });
  hdr.addEventListener("mouseleave", function () { hovering = false; clearTimeout(openT); closeT = setTimeout(close, 180); paint(); });
  scrim.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && cur) { var a = nav.querySelector('[data-k="' + cur + '"]'); close(); a && a.focus(); }
  });
  document.addEventListener("focusin", function (e) { if (cur && !hdr.contains(e.target)) close(); });
  window.addEventListener("resize", function () { if (cur) mega.style.height = panel(cur).offsetHeight + "px"; });
  mega.addEventListener("load", function () { if (cur) mega.style.height = panel(cur).offsetHeight + "px"; }, true);
  hdr.addEventListener("mouseenter", function warm() {
    mega.querySelectorAll("img[loading=lazy]").forEach(function (i) { i.loading = "eager"; });
    hdr.removeEventListener("mouseenter", warm);
  });
  paint();

  /* colshover: the image follows the hovered link */
  mega.querySelectorAll(".mp-swap").forEach(function (card) {
    var data = JSON.parse(card.getAttribute("data-feats"));
    var img = card.querySelector("img"), t = card.querySelector(".mp-t"), s = card.querySelector(".mp-s");
    data.forEach(function (x) { var i = new Image(); i.src = x.s; });
    var shown = 0, tm = 0;
    card.closest(".mp").querySelectorAll("[data-f]").forEach(function (a) {
      a.addEventListener("mouseenter", function () {
        var n = +a.getAttribute("data-f");
        if (n === shown) return;
        shown = n; card.classList.add("swap"); clearTimeout(tm);
        tm = setTimeout(function () { img.src = data[n].s; t.textContent = data[n].t; s.textContent = data[n].d; card.classList.remove("swap"); }, 200);
      });
    });
  });

  /* ---------------- mobile drawer ---------------- */
  var drawer = document.createElement("div");
  drawer.className = "drawer";
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = '<div class="drawer-top"><span class="logo">' + document.querySelector(".logo").innerHTML +
    '</span><button type="button" class="ico" data-close aria-label="Close menu"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
    '<div class="drawer-body">' + MENU.map(function (c) {
      return "<details><summary>" + esc(c.label) + "</summary><ul>" + c.g[0].l.concat(["Shop all " + c.label.toLowerCase()]).map(function (x) {
        return '<li><a href="#">' + esc(x) + "</a></li>";
      }).join("") + "</ul></details>";
    }).join("") + '<div class="drawer-foot"><a href="#" style="color:var(--sale)">Sale</a><a href="#">Help</a><a href="#">Account</a></div></div>';
  body.appendChild(drawer);
  function drawerSet(on) {
    drawer.classList.toggle("on", on);
    drawer.setAttribute("aria-hidden", on ? "false" : "true");
    body.style.overflow = on ? "hidden" : "";
  }
  document.querySelectorAll("[data-burger]").forEach(function (b) { b.addEventListener("click", function () { drawerSet(true); }); });
  drawer.querySelector("[data-close]").addEventListener("click", function () { drawerSet(false); });

  /* ---------------- hero video ---------------- */
  var video = document.querySelector(".hero video");
  var pause = document.querySelector("[data-pause]");
  if (video && pause) {
    var sync = function () { pause.classList.toggle("paused", video.paused); pause.setAttribute("aria-label", video.paused ? "Play video" : "Pause video"); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { video.removeAttribute("autoplay"); video.pause(); }
    pause.addEventListener("click", function () { video.paused ? video.play() : video.pause(); });
    video.addEventListener("play", sync); video.addEventListener("pause", sync); sync();
  }
})();
