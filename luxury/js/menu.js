/* ==================================================================
   Shared menu engine for the five header versions.
   - One menu data set (no product counts anywhere).
   - Five mega layouts, chosen by <body data-layout="...">.
   - Hover intent, keyboard (focus opens, Esc closes), touch tap-to-open,
     height animates between panels, mobile drawer, video pause.
   Placeholder photography: Unsplash. Swap for product shots later.
   ================================================================== */
(function () {
  "use strict";

  var IMG = {
    cavalier: "1560807707-8cc77767d783", catSleep: "1519052537078-e6302a4968d4",
    corgiLie: "1600077106724-946750eeaf3c", labCollar: "1586671267731-da2cf3ceeb80",
    goldenWalk: "1576201836106-db1758fd1c97", toller: "1525253086316-d0c936c814f8",
    samoyed: "1529429617124-95b109e86bb8", goldenSit: "1552053831-71594a27632d",
    mastiff: "1541599540903-216a46ca1dc0", jack: "1561037404-61cd46aa615b",
    darkDog: "1534351450181-ea9f78427fe8", goldenFlower: "1510771463146-e89e6e86560e",
    goldenToy: "1591946614720-90a587da4a36", corgi: "1597633425046-08f5110420b5",
    puppy: "1507146426996-ef05306b995a", beach: "1523480717984-24cba35ae1ef",
    sea: "1530281700549-e82e7bf110d6", aussie: "1587300003388-59208cc962cb",
    catStairs: "1495360010541-f48722b34f7d", kitten: "1533743983669-94fa5c4338ec",
    kittenMint: "1592194996308-7b43878e84a6"
  };
  function src(key, w, h) {
    return "https://images.unsplash.com/photo-" + IMG[key] + "?w=" + w + (h ? "&h=" + h : "") + "&q=80&auto=format&fit=crop";
  }

  var EDITS = ["New in", "Bestsellers", "The Winter Sale"];

  var MENU = [
    { key: "beds", st: "darkDog", label: "Beds",
      groups: [{ t: "Beds", l: ["Bolster beds", "Orthopaedic beds", "Round beds", "Sofa beds", "Crate mats", "Spare covers"] },
               { t: "Blankets", l: ["Wool throws", "Fleece blankets", "Travel blankets"] }],
      f: [{ p: "cavalier", t: "The Sleep Edit", s: "Deep, supportive, made to last", n: "Bolster Bed, Bouclé", pr: "£245" },
          { p: "corgiLie", t: "Orthopaedic", s: "Memory foam for older joints", n: "Orthopaedic Bed, Linen", pr: "£310" },
          { p: "catSleep", t: "Throws", s: "Soft wool for cold evenings", n: "Wool Throw, Oat", pr: "£89" }] },
    { key: "walking", st: "aussie", label: "Walking",
      groups: [{ t: "Walking", l: ["Collars", "Leads", "Harnesses", "Collar & lead sets", "Poop bag holders", "Treat pouches"] },
               { t: "By material", l: ["Leather", "Waxed cotton", "Rope", "Tweed"] }],
      f: [{ p: "labCollar", t: "Leather Collars", s: "Soft, hand-finished leather", n: "Leather Collar, Cognac", pr: "£65" },
          { p: "goldenWalk", t: "The Walking Edit", s: "For the first walk of the day", n: "Rope Lead, Sand", pr: "£55" },
          { p: "toller", t: "Harnesses", s: "A comfortable fit, clean lines", n: "Padded Harness, Olive", pr: "£79" }] },
    { key: "coats", st: "goldenWalk", label: "Coats",
      groups: [{ t: "Coats", l: ["Winter coats", "Raincoats", "Knitwear", "Bathrobes", "Snoods"] },
               { t: "By fit", l: ["Dachshund", "Whippet & greyhound", "French bulldog", "Standard fit"] }],
      f: [{ p: "samoyed", t: "Winter Coats", s: "Quilted warmth for colder days", n: "Quilted Coat, Forest", pr: "£129" },
          { p: "goldenSit", t: "Knitwear", s: "Merino knits, cut for movement", n: "Cable Knit Jumper", pr: "£85" },
          { p: "mastiff", t: "Raincoats", s: "Waxed cotton for wet walks", n: "Waxed Raincoat, Tobacco", pr: "£115" }] },
    { key: "dining", st: "catSleep", label: "Dining",
      groups: [{ t: "Dining", l: ["Bowls", "Bowl stands", "Placemats", "Treat jars", "Food storage"] },
               { t: "By material", l: ["Stoneware", "Ceramic", "Stainless steel", "Oak"] }],
      f: [{ p: "jack", t: "Stoneware Bowls", s: "Glazed by hand, no two alike", n: "Stoneware Bowl, Chalk", pr: "£42" },
          { p: "darkDog", t: "Bowl Stands", s: "Raised, for easier eating", n: "Oak Bowl Stand", pr: "£95" },
          { p: "goldenFlower", t: "Treat Jars", s: "Pretty enough for the counter", n: "Ceramic Treat Jar", pr: "£48" }] },
    { key: "play", st: "goldenFlower", label: "Play",
      groups: [{ t: "Play", l: ["Plush toys", "Rope toys", "Balls", "Chew toys", "Puzzle toys"] },
               { t: "By age", l: ["Puppy", "Adult", "Senior"] }],
      f: [{ p: "goldenToy", t: "Plush Toys", s: "Soft, sturdy, much loved", n: "Plush Lamb", pr: "£24" },
          { p: "corgi", t: "Puzzle Toys", s: "Something to think about", n: "Wooden Puzzle", pr: "£38" },
          { p: "puppy", t: "For Puppies", s: "Gentle first toys", n: "Puppy Play Set", pr: "£60" }] },
    { key: "travel", st: "toller", label: "Travel",
      groups: [{ t: "Travel", l: ["Carriers", "Car seats", "Travel beds", "Travel bowls", "Travel blankets"] },
               { t: "Occasions", l: ["Weekends away", "Long drives", "City days"] }],
      f: [{ p: "beach", t: "The Travel Edit", s: "For weekends away", n: "Travel Bed, Canvas", pr: "£165" },
          { p: "sea", t: "Car Seats", s: "Padded, safe, easy to clean", n: "Car Seat, Charcoal", pr: "£185" },
          { p: "aussie", t: "Travel Bowls", s: "Fold flat, pack easily", n: "Folding Bowl", pr: "£28" }] },
    { key: "cats", st: "catSleep", label: "Cats",
      groups: [{ t: "Cats", l: ["Cat beds", "Scratchers", "Toys", "Bowls", "Collars"] },
               { t: "Living", l: ["Cat trees", "Litter boxes", "Window perches"] }],
      f: [{ p: "catStairs", t: "Cat Beds", s: "Warm spots for long naps", n: "Felt Cave Bed", pr: "£120" },
          { p: "kitten", t: "Scratchers", s: "Made to sit in the room", n: "Oak Scratcher", pr: "£140" },
          { p: "kittenMint", t: "Toys", s: "Small things, big joy", n: "Feather Wand", pr: "£18" }] },
    { key: "gifts", st: "cavalier", label: "Gifts",
      groups: [{ t: "Gifts", l: ["Gift sets", "For the new puppy", "Under £50", "Under £100", "Gift cards"] },
               { t: "For", l: ["Dogs", "Cats", "Their people"] }],
      f: [{ p: "goldenFlower", t: "Gift Sets", s: "Wrapped and ready to give", n: "Winter Gift Set", pr: "£120" },
          { p: "puppy", t: "New Puppy", s: "Everything for the first week", n: "New Puppy Box", pr: "£150" },
          { p: "kittenMint", t: "Gift Cards", s: "Let them choose", n: "Gift Card", pr: "from £25" }] }
  ];

  /* ---------------- render helpers ---------------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function list(items, cls) {
    return '<ul' + (cls ? ' class="' + cls + '"' : "") + ">" + items.map(function (x) {
      return '<li><a href="#"' + (/sale/i.test(x) ? ' class="is-sale"' : "") + ">" + esc(x) + "</a></li>";
    }).join("") + "</ul>";
  }
  function fig(f, w, h, cls) {
    return '<a class="mp-fig ' + (cls || "") + '" href="#"><span class="mp-img"><img src="' + src(f.p, w, h) +
      '" alt="" loading="lazy" decoding="async"></span><span class="mp-cap"><b>' + esc(f.t) + "</b><span>" + esc(f.s) + "</span></span></a>";
  }
  function all(c) { return '<a class="mp-all" href="#">Shop all ' + esc(c.label.toLowerCase()) + "</a>"; }

  var LAYOUTS = {
    /* V1: three text columns, two portrait images */
    columns: function (c) {
      return '<div class="mp-in"><div class="mp-cols">' +
        c.groups.map(function (g) { return '<div class="mp-col"><p class="mp-h">' + esc(g.t) + "</p>" + list(g.l) + "</div>"; }).join("") +
        '<div class="mp-col"><p class="mp-h">Edits</p>' + list(EDITS) + all(c) + "</div></div>" +
        '<div class="mp-imgs">' + c.f.slice(0, 2).map(function (f) { return fig(f, 520, 650); }).join("") + "</div></div>";
    },
    /* V2: large display-face list, three landscape images */
    editorial: function (c) {
      return '<div class="mp-in"><div class="mp-lead">' + list(c.groups[0].l, "mp-big") + "</div>" +
        '<div class="mp-side"><p class="mp-h">' + esc(c.groups[1].t) + "</p>" + list(c.groups[1].l) +
        '<p class="mp-h" style="margin-top:30px">Edits</p>' + list(EDITS) + "</div>" +
        '<div class="mp-imgs">' + c.f.map(function (f) { return fig(f, 520, 680); }).join("") + "</div></div>";
    },
    /* V3: image-led, three tall tiles with captions over the photo */
    tiles: function (c) {
      return '<div class="mp-in"><div class="mp-side"><p class="mp-title">' + esc(c.label) + "</p>" + list(c.groups[0].l) + all(c) + "</div>" +
        '<div class="mp-tiles">' + c.f.map(function (f) { return fig(f, 620, 760, "tile"); }).join("") + "</div></div>";
    },
    /* V4: link columns left, one large feature right that changes on hover */
    split: function (c) {
      var i = 0;
      var cols = c.groups.concat([{ t: "Edits", l: EDITS }]).map(function (g) {
        return '<div class="mp-col"><p class="mp-h">' + esc(g.t) + "</p><ul>" + g.l.map(function (x) {
          var lx = x.toLowerCase().replace(/s$/, ""), m = -1;
          c.f.forEach(function (f, n) { var ft = f.t.toLowerCase().replace(/s$/, ""); if (m < 0 && (ft.indexOf(lx) > -1 || lx.indexOf(ft) > -1)) m = n; });
          var idx = m > -1 ? m : (i % 3); i++;
          return '<li><a href="#" data-f="' + idx + '"' + (/sale/i.test(x) ? ' class="is-sale"' : "") + ">" + esc(x) + "</a></li>";
        }).join("") + "</ul></div>";
      }).join("");
      var f0 = c.f[0];
      return '<div class="mp-in"><div class="mp-cols">' + cols + "</div>" +
        '<a class="mp-feature" href="#" data-feats=\'' + JSON.stringify(c.f.map(function (f) { return { s: src(f.p, 1100, 720), t: f.t, d: f.s }; })).replace(/'/g, "&#39;") + "'>" +
        '<span class="mp-img"><img src="' + src(f0.p, 1100, 720) + '" alt="" decoding="async"></span>' +
        '<span class="mp-fcap"><b>' + esc(f0.t) + "</b><span>" + esc(f0.s) + "</span></span></a></div>";
    },
    /* V5: list left, three product cards, no counts */
    products: function (c) {
      return '<div class="mp-in"><div class="mp-side"><p class="mp-h">' + esc(c.groups[0].t) + "</p>" + list(c.groups[0].l) +
        '<p class="mp-h" style="margin-top:30px">Edits</p>' + list(EDITS) + "</div>" +
        '<div class="mp-prods"><p class="mp-h">Most loved</p><div class="mp-row">' + c.f.map(function (f) {
          return '<a class="mp-prod" href="#"><span class="mp-img"><img src="' + src(f.p, 480, 600) + '" alt="" loading="lazy" decoding="async"></span>' +
            '<span class="mp-pn">' + esc(f.n) + '</span><span class="mp-pp">' + esc(f.pr) + "</span></a>";
        }).join("") + "</div></div>" +
        '<a class="mp-story" href="#"><span class="mp-img"><img src="' + src(c.st, 600, 800) + '" alt="" loading="lazy" decoding="async"></span>' +
        '<span class="mp-fcap"><b>The ' + esc(c.label) + " Edit</b><span>Discover</span></span></a></div>";
    }
  };

  /* ---------------- build ---------------- */
  var body = document.body;
  var layout = LAYOUTS[body.getAttribute("data-layout")] || LAYOUTS.columns;
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
    p.innerHTML = layout(c);
    mega.appendChild(p);
  });
  if (nav.hasAttribute("data-sale")) navHtml += '<li><a class="nl sale" href="#">Sale</a></li>';
  nav.innerHTML = navHtml;

  var cur = null, openT = 0, closeT = 0;
  var links = nav.querySelectorAll(".nl[data-k]");
  function panel(k) { return mega.querySelector('.mp[data-k="' + k + '"]'); }
  function open(k) {
    clearTimeout(closeT);
    if (cur === k) return;
    cur = k;
    links.forEach(function (a) { a.setAttribute("aria-expanded", a.getAttribute("data-k") === k ? "true" : "false"); });
    mega.querySelectorAll(".mp").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-k") === k); });
    mega.style.height = panel(k).offsetHeight + "px";
    mega.classList.add("open");
    nav.classList.add("dim");
    hdr.classList.add("is-open");
    scrim.classList.add("on");
  }
  function close() {
    clearTimeout(openT);
    if (!cur) return;
    cur = null;
    links.forEach(function (a) { a.setAttribute("aria-expanded", "false"); });
    mega.querySelectorAll(".mp").forEach(function (p) { p.classList.remove("on"); });
    mega.style.height = "0px";
    mega.classList.remove("open");
    nav.classList.remove("dim");
    hdr.classList.remove("is-open");
    scrim.classList.remove("on");
  }
  var touch = window.matchMedia("(hover: none)").matches;
  links.forEach(function (a) {
    var k = a.getAttribute("data-k");
    a.addEventListener("mouseenter", function () {
      clearTimeout(openT); clearTimeout(closeT);
      openT = setTimeout(function () { open(k); }, cur ? 0 : 90);
    });
    a.addEventListener("mouseleave", function () { clearTimeout(openT); });
    a.addEventListener("focus", function () { open(k); });
    a.addEventListener("click", function (e) {
      if (touch && cur !== k) { e.preventDefault(); open(k); }
      else e.preventDefault(); /* prototype: no real collection pages yet */
    });
  });
  /* anything in the bar that is not a category closes the menu */
  hdr.querySelectorAll(".hdr-bar a:not([data-k]), .hdr-bar button").forEach(function (el) {
    el.addEventListener("mouseenter", function () { clearTimeout(openT); closeT = setTimeout(close, 120); });
    el.addEventListener("focus", close);
  });
  hdr.addEventListener("mouseleave", function () { clearTimeout(openT); closeT = setTimeout(close, 160); });
  hdr.addEventListener("mouseenter", function () { clearTimeout(closeT); });
  scrim.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && cur) { var a = nav.querySelector('[data-k="' + cur + '"]'); close(); a && a.focus(); }
  });
  document.addEventListener("focusin", function (e) { if (cur && !hdr.contains(e.target)) close(); });
  window.addEventListener("resize", function () { if (cur) mega.style.height = panel(cur).offsetHeight + "px"; });
  /* height can change once lazy images load */
  mega.addEventListener("load", function () { if (cur) mega.style.height = panel(cur).offsetHeight + "px"; }, true);
  /* warm the image cache the first time the pointer reaches the header */
  hdr.addEventListener("mouseenter", function warm() {
    mega.querySelectorAll("img[loading=lazy]").forEach(function (i) { i.loading = "eager"; });
    hdr.removeEventListener("mouseenter", warm);
  });

  /* V4: feature image follows the hovered link */
  mega.querySelectorAll(".mp").forEach(function (p) {
    var feat = p.querySelector(".mp-feature");
    if (!feat) return;
    var data = JSON.parse(feat.getAttribute("data-feats"));
    var img = feat.querySelector("img"), b = feat.querySelector(".mp-fcap b"), d = feat.querySelector(".mp-fcap span");
    data.forEach(function (x) { var i = new Image(); i.src = x.s; });
    var shown = 0, t = 0;
    p.querySelectorAll("[data-f]").forEach(function (a) {
      a.addEventListener("mouseenter", function () {
        var n = +a.getAttribute("data-f");
        if (n === shown) return;
        shown = n;
        feat.classList.add("swap");
        clearTimeout(t);
        t = setTimeout(function () { img.src = data[n].s; b.textContent = data[n].t; d.textContent = data[n].d; feat.classList.remove("swap"); }, 220);
      });
    });
  });

  /* ---------------- mobile drawer ---------------- */
  var drawer = document.createElement("div");
  drawer.className = "drawer";
  drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = '<div class="drawer-top"><span class="logo">' + (document.querySelector(".logo") || { innerHTML: "" }).innerHTML +
    '</span><button type="button" class="ico" data-close aria-label="Close menu"><svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
    '<div class="drawer-body">' + MENU.map(function (c) {
      return "<details><summary>" + esc(c.label) + "</summary>" + list(c.groups[0].l.concat(["Shop all " + c.label.toLowerCase()])) + "</details>";
    }).join("") + '<div class="drawer-foot"><a href="#" style="color:var(--sale)">The Winter Sale</a><a href="#">Help</a><a href="#">Account</a></div></div>';
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
    function sync() { pause.classList.toggle("paused", video.paused); pause.setAttribute("aria-label", video.paused ? "Play video" : "Pause video"); }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { video.removeAttribute("autoplay"); video.pause(); }
    pause.addEventListener("click", function () { video.paused ? video.play() : video.pause(); });
    video.addEventListener("play", sync); video.addEventListener("pause", sync); sync();
  }
})();
