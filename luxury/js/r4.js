/* ==================================================================
   Axel & Hound · round 4 engine (black and white)
   <body data-layout> picks the category mega menu:
     lib (text columns + flush photo) · tiles (four photo tiles)
     listtiles (lists + two tiles) · list3 (one list + three tiles)
   "New In" always opens as four large photo tiles.
   <body data-band> adds a slim "Shop all / Close" band to each menu.
   Also runs: transparent header, search panel with live results,
   basket / account / saved drawers, mobile menu, hero video.
   Photography is placeholder until product shots are ready.
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
  function src(k, w) {
    var s = IMG[k];
    return s.indexOf("http") === 0 ? s + "?w=" + w + "&q=80&auto=format&fit=crop" : s;
  }

  var MENU = [
    { key: "new", label: "New In", g: [{ t: "New in", l: ["New beds", "New collars & leads", "New knitwear", "New for cats"] }], f: [],
      tiles: [{ p: "still1", t: "New beds" }, { p: "labCollar", t: "New collars & leads" }, { p: "poodle", t: "New knitwear" }, { p: "catStairs", t: "New for cats" }] },
    { key: "beds", label: "Beds", hero: "still1", line: "Deep, soft beds and the throws that go with them.",
      g: [{ t: "Beds", l: ["Bolster beds", "Round beds", "Orthopaedic beds", "Sofa beds", "Crate mats", "Replacement covers"] },
          { t: "Blankets & cushions", l: ["Wool throws", "Bouclé blankets", "Cushions", "Travel blankets"] },
          { t: "Collections", l: ["Bouclé", "Wool", "Velvet", "Linen"] }],
      f: [{ p: "still1", t: "The Bouclé Bed", n: "Bolster Bed, Moss Bouclé", pr: 245 },
          { p: "cavalier", t: "Cushions", n: "Bolster Cushion, Rose", pr: 95 },
          { p: "still2", t: "Throws", n: "Wool Throw, Oat", pr: 89 }] },
    { key: "walking", label: "Walking", hero: "labCollar", line: "Leather, rope and waxed cotton, made for the daily walk.",
      g: [{ t: "Walking", l: ["Collars", "Leads", "Harnesses", "Collar & lead sets", "Poop bag holders", "Treat pouches"] },
          { t: "By material", l: ["Leather", "Waxed cotton", "Rope", "Tweed"] },
          { t: "Collections", l: ["Heritage leather", "Field", "City"] }],
      f: [{ p: "labCollar", t: "Collars", n: "Leather Collar, Cognac", pr: 65 },
          { p: "goldenWalk", t: "Leads", n: "Rope Lead, Sand", pr: 55 },
          { p: "toller", t: "Harnesses", n: "Padded Harness, Olive", pr: 79 }] },
    { key: "coats", label: "Coats", hero: "poodle", line: "Merino knits and quilted coats for the colder months.",
      g: [{ t: "Coats", l: ["Winter coats", "Raincoats", "Knitwear", "Bathrobes", "Snoods"] },
          { t: "By fit", l: ["Dachshund", "Whippet & greyhound", "French bulldog", "Standard fit"] },
          { t: "Collections", l: ["Quilted", "Merino", "Waxed cotton"] }],
      f: [{ p: "poodle", t: "Knitwear", n: "Cable Knit Jumper, Cream", pr: 85 },
          { p: "samoyed", t: "Winter coats", n: "Quilted Coat, Forest", pr: 129 },
          { p: "mastiff", t: "Raincoats", n: "Waxed Raincoat, Tobacco", pr: 115 }] },
    { key: "dining", label: "Dining", hero: "darkDog", line: "Stoneware bowls, oak stands and jars for the counter.",
      g: [{ t: "Dining", l: ["Bowls", "Bowl stands", "Placemats", "Treat jars", "Food storage"] },
          { t: "Care", l: ["Grooming", "Brushes", "Shampoo"] },
          { t: "By material", l: ["Stoneware", "Ceramic", "Oak", "Steel"] }],
      f: [{ p: "jack", t: "Bowls", n: "Stoneware Bowl, Chalk", pr: 42 },
          { p: "darkDog", t: "Bowl stands", n: "Oak Bowl Stand", pr: 95 },
          { p: "groom", t: "Grooming", n: "Beechwood Brush", pr: 32 }] },
    { key: "play", label: "Play", hero: "goldenToy", line: "Soft, sturdy toys in wool felt and natural rubber.",
      g: [{ t: "Play", l: ["Plush toys", "Rope toys", "Balls", "Chew toys", "Puzzle toys"] },
          { t: "By age", l: ["Puppy", "Adult", "Senior"] },
          { t: "Collections", l: ["Wool felt", "Natural rubber"] }],
      f: [{ p: "goldenToy", t: "Plush toys", n: "Plush Lamb", pr: 24 },
          { p: "pupDark", t: "Puppy", n: "Puppy Play Set", pr: 60 },
          { p: "corgi", t: "Puzzle toys", n: "Oak Puzzle", pr: 38 }] },
    { key: "travel", label: "Travel", hero: "beach", line: "Carriers, car seats and beds for weekends away.",
      g: [{ t: "Travel", l: ["Carriers", "Car seats", "Travel beds", "Travel bowls", "Travel blankets"] },
          { t: "Occasions", l: ["Weekends away", "Long drives", "City days"] },
          { t: "Collections", l: ["Canvas", "Waxed cotton"] }],
      f: [{ p: "beach", t: "Travel beds", n: "Travel Bed, Canvas", pr: 165 },
          { p: "sea", t: "Car seats", n: "Car Seat, Charcoal", pr: 185 },
          { p: "aussie", t: "Travel bowls", n: "Folding Bowl", pr: 28 }] },
    { key: "cats", label: "Cats", hero: "catSleep", line: "Felt caves, oak scratchers and warm places to sleep.",
      g: [{ t: "Cats", l: ["Cat beds", "Scratchers", "Toys", "Bowls", "Collars"] },
          { t: "Living", l: ["Cat trees", "Litter boxes", "Window perches"] },
          { t: "Collections", l: ["Felt", "Oak"] }],
      f: [{ p: "catStairs", t: "Cat beds", n: "Felt Cave Bed", pr: 120 },
          { p: "kitten", t: "Scratchers", n: "Oak Scratcher", pr: 140 },
          { p: "catSleep", t: "Toys", n: "Wool Mouse Set", pr: 22 }] },
    { key: "gifts", label: "Gifts", hero: "still2", line: "Wrapped by hand and ready to give.",
      g: [{ t: "Gifts", l: ["Gift sets", "For the new puppy", "Under £50", "Under £100", "Gift cards"] },
          { t: "For", l: ["Dogs", "Cats", "Their people"] },
          { t: "Occasions", l: ["Birthdays", "Christmas", "Gotcha day"] }],
      f: [{ p: "goldenFlower", t: "Gift sets", n: "Winter Gift Set", pr: 120 },
          { p: "cavalier", t: "Gift cards", n: "Gift Card", pr: 50 },
          { p: "pupDark", t: "For the new puppy", n: "New Puppy Box", pr: 150 }] }
  ];
  var FEAT = ["New in", "Bestsellers", "Sale"];
  var DOGS = ["still2", "goldenWalk", "toller", "samoyed", "mastiff", "poodle", "labCollar", "goldenToy", "beach", "cavalier", "pupDark", "groom"];

  /* ---------------- helpers ---------------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function gbp(n) { return "£" + n.toFixed(n % 1 ? 2 : 0); }
  var ARW = '<svg viewBox="0 0 16 10"><path d="M0 5h15M11 1l4 4-4 4"/></svg>';
  function links(items, cls) {
    return "<ul" + (cls ? ' class="' + cls + '"' : "") + ">" + items.map(function (x) {
      return '<li><a class="ln' + (/^sale$/i.test(x) ? " is-sale" : "") + '" href="#">' + esc(x) + "</a></li>";
    }).join("") + "</ul>";
  }
  function more(c) { return '<a class="more" href="#">Shop all ' + esc(c.label.toLowerCase()) + ARW + "</a>"; }
  function ph(k, w, ratio, cap) {
    return '<span class="ph"' + (ratio ? ' style="aspect-ratio:' + ratio + '"' : "") + '><img src="' + src(k, w) +
      '" alt="" loading="lazy" decoding="async">' + (cap ? '<span class="phcap">' + esc(cap) + "</span>" : "") + "</span>";
  }

  function tile(f, ratio) {
    return '<a class="tile" href="#">' + ph(f.p, 760, ratio) + '<span class="tile-l">' + esc(f.t) + ARW + "</span></a>";
  }
  function fourTiles(c) {
    if (c.tiles) return c.tiles;
    var pool = c.f.map(function (f) { return f.p; }).concat([c.hero], c.key === "cats" ? ["kitten", "catStairs", "catSleep", "still2"] : DOGS);
    pool = pool.filter(function (k, i) { return pool.indexOf(k) === i; });
    var labels = c.f.map(function (f) { return f.t; }).concat(["Shop all " + c.label.toLowerCase()]);
    return labels.slice(0, 4).map(function (t, i) { return { p: pool[i], t: t }; });
  }
  function cols(c, n) {
    return c.g.slice(0, n).map(function (g) { return '<div class="col"><p class="hd">' + esc(g.t) + "</p>" + links(g.l) + "</div>"; }).join("");
  }
  var LAYOUTS = {
    newin: function (c) {
      return '<div class="mp-in L-tiles"><div class="tiles4">' + c.tiles.map(function (f) { return tile(f, "1/1"); }).join("") + "</div></div>";
    },
    /* Liberty-style: capital text columns, a photograph flush to the right edge */
    lib: function (c) {
      var f = c.f[0];
      return '<div class="L-lib"><div class="lib-cols">' + cols(c, 3) +
        '<div class="col"><p class="hd">Featured</p>' + links(FEAT) + "</div></div>" +
        '<a class="lib-ph" href="#">' + ph(c.hero, 1000) + '<span class="lib-cap"><span class="k">' + esc(c.line) + '</span><span class="t">' + esc(f.t) + '</span><span class="s">Shop now</span></span></a></div>';
    },
    /* Belstaff-style: a row of sub-links, then four photo tiles */
    tiles: function (c) {
      return '<div class="mp-in L-tiles"><ul class="sub">' + c.g[0].l.map(function (x) { return '<li><a class="ln" href="#">' + esc(x) + "</a></li>"; }).join("") +
        '<li><a class="ln" href="#">Shop all</a></li></ul><div class="tiles4">' + fourTiles(c).map(function (f) { return tile(f, "1/1"); }).join("") + "</div></div>";
    },
    /* two text columns, two tall tiles */
    listtiles: function (c) {
      return '<div class="mp-in L-lt">' + cols(c, 2) + '<div class="tiles2">' + fourTiles(c).slice(0, 2).map(function (f) { return tile(f, "4/5"); }).join("") + "</div></div>";
    },
    /* one text column, three tiles */
    list3: function (c) {
      return '<div class="mp-in L-l3"><div class="col"><p class="hd">' + esc(c.g[0].t) + "</p>" + links(c.g[0].l) + '<p class="hd" style="margin-top:28px">Featured</p>' + links(FEAT) + "</div>" +
        '<div class="tiles3">' + fourTiles(c).slice(0, 3).map(function (f) { return tile(f, "3/4"); }).join("") + "</div></div>";
    }
  };

  /* ---------------- build header pieces ---------------- */
  var body = document.body;
  var layout = LAYOUTS[body.getAttribute("data-layout")] || LAYOUTS.lib;
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
    p.className = "mp"; p.id = "mp-" + c.key; p.setAttribute("data-k", c.key);
    var band = body.hasAttribute("data-band") ? '<div class="band"><a class="bbtn" href="#">Shop all ' + esc(c.label.toLowerCase()) + '</a><a class="bbtn on" href="#">Bestsellers</a>' +
      '<button type="button" class="band-x" data-close-mega aria-label="Close menu"><svg viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13"/></svg></button></div>' : "";
    p.innerHTML = band + (c.tiles ? LAYOUTS.newin(c) : layout(c));
    mega.appendChild(p);
  });
  nav.innerHTML = navHtml;

  /* ---------------- state ---------------- */
  var hovering = false, cur = null, searchOn = false, sideOn = null;
  function paint() {
    var scrolled = window.scrollY > 8;
    hdr.classList.toggle("scrolled", scrolled);
    hdr.classList.toggle("open-any", !!(cur || searchOn));
    hdr.classList.toggle("clear", !scrolled && !hovering && !cur && !searchOn);
    scrim.classList.toggle("on", !!(cur || searchOn || sideOn));
    scrim.classList.toggle("top", !!sideOn);
  }
  window.addEventListener("scroll", paint, { passive: true });

  /* ---------------- mega ---------------- */
  var openT = 0, closeT = 0;
  var navLinks = nav.querySelectorAll(".nl[data-k]");
  function panel(k) { return mega.querySelector('.mp[data-k="' + k + '"]'); }
  function open(k) {
    clearTimeout(closeT);
    if (cur === k) return;
    if (searchOn) searchSet(false);
    cur = k;
    navLinks.forEach(function (a) { a.setAttribute("aria-expanded", a.getAttribute("data-k") === k ? "true" : "false"); });
    mega.querySelectorAll(".mp").forEach(function (p) { p.classList.toggle("on", p.getAttribute("data-k") === k); });
    mega.style.height = panel(k).offsetHeight + "px";
    mega.classList.add("open"); nav.classList.add("dim");
    paint();
  }
  function close() {
    clearTimeout(openT);
    if (!cur) return;
    cur = null;
    navLinks.forEach(function (a) { a.setAttribute("aria-expanded", "false"); });
    mega.querySelectorAll(".mp").forEach(function (p) { p.classList.remove("on"); });
    mega.style.height = "0px";
    mega.classList.remove("open"); nav.classList.remove("dim");
    paint();
  }
  var touch = window.matchMedia("(hover: none)").matches;
  navLinks.forEach(function (a) {
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
  });
  hdr.addEventListener("mouseenter", function () { hovering = true; clearTimeout(closeT); paint(); });
  hdr.addEventListener("mouseleave", function () { hovering = false; clearTimeout(openT); closeT = setTimeout(close, 180); paint(); });
  window.addEventListener("resize", function () { if (cur) mega.style.height = panel(cur).offsetHeight + "px"; });
  mega.addEventListener("load", function () { if (cur) mega.style.height = panel(cur).offsetHeight + "px"; }, true);
  hdr.addEventListener("mouseenter", function warm() {
    mega.querySelectorAll("img[loading=lazy]").forEach(function (i) { i.loading = "eager"; });
    hdr.removeEventListener("mouseenter", warm);
  });

  /* ---------------- search ---------------- */
  var PRODUCTS = [];
  MENU.forEach(function (c) { c.f.forEach(function (f) { PRODUCTS.push({ p: f.p, n: f.n, pr: f.pr, c: c.label }); }); });
  var srch = document.createElement("div");
  srch.className = "srch";
  srch.setAttribute("role", "dialog");
  srch.setAttribute("aria-label", "Search");
  srch.innerHTML = '<div class="srch-in"><div class="srch-field"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>' +
    '<input id="q" type="search" placeholder="Search beds, collars, coats" autocomplete="off" aria-label="Search the shop">' +
    '<button type="button" class="srch-x" data-close-search>Close</button></div>' +
    '<div class="srch-body"><div><p class="cap">Popular</p><ul>' +
    ["Bouclé bed", "Leather collar", "Dachshund coat", "Wool throw", "Gift sets"].map(function (x) { return '<li><a class="ln" href="#" data-q="' + x + '">' + x + "</a></li>"; }).join("") +
    '</ul><p class="cap" style="margin-top:28px">Help</p><ul><li><a class="ln" href="#">Delivery</a></li><li><a class="ln" href="#">Returns</a></li><li><a class="ln" href="#">Size guide</a></li></ul></div>' +
    '<div><div class="srch-res-h"><p class="cap" data-res-h>Most searched this week</p></div><div class="srch-grid" data-res></div></div></div></div>';
  hdr.appendChild(srch);
  var q = srch.querySelector("#q"), res = srch.querySelector("[data-res]"), resH = srch.querySelector("[data-res-h]");
  function card(p) {
    return '<a class="pc" href="#">' + ph(p.p, 520, null) + '<span class="pc-n">' + esc(p.n) + '</span><span class="pc-p">' + gbp(p.pr) + "</span></a>";
  }
  function renderResults() {
    var v = q.value.trim().toLowerCase(), list;
    if (!v) { list = [PRODUCTS[0], PRODUCTS[3], PRODUCTS[6], PRODUCTS[2]]; resH.textContent = "Most searched this week"; }
    else {
      var words = v.split(/\s+/);
      list = PRODUCTS.filter(function (p) { var h = (p.n + " " + p.c).toLowerCase(); return words.every(function (w) { return h.indexOf(w.replace(/s$/, "")) > -1; }); }).slice(0, 4);
      resH.textContent = list.length ? "Products" : "";
    }
    res.innerHTML = list.length ? list.map(card).join("") : '<p class="srch-empty">Nothing matches “' + esc(q.value) + '”. Try a material or a category, such as wool or beds.</p>';
  }
  q.addEventListener("input", renderResults);
  srch.querySelectorAll("[data-q]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); q.value = a.getAttribute("data-q"); renderResults(); q.focus(); }); });
  function searchSet(on) {
    if (on) { close(); renderResults(); }
    searchOn = on;
    srch.classList.toggle("on", on);
    if (on) setTimeout(function () { q.focus(); }, 80);
    paint();
  }
  srch.querySelector("[data-close-search]").addEventListener("click", function () { searchSet(false); });

  /* ---------------- side drawers ---------------- */
  var basket = [
    { p: "labCollar", n: "Leather Collar, Cognac", v: "Size M", pr: 65, q: 1 },
    { p: "jack", n: "Stoneware Bowl, Chalk", v: "Medium", pr: 42, q: 1 }
  ];
  var saved = [
    { p: "still1", n: "Bolster Bed, Moss Bouclé", v: "Medium", pr: 245 },
    { p: "poodle", n: "Cable Knit Jumper, Cream", v: "Dachshund fit", pr: 85 }
  ];
  var FREE = 150;
  var X = '<button type="button" class="x" data-close-side>Close<svg viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13"/></svg></button>';
  var sides = {};
  function makeSide(id, label) {
    var s = document.createElement("aside");
    s.className = "side"; s.id = "side-" + id; s.tabIndex = -1;
    s.setAttribute("role", "dialog"); s.setAttribute("aria-label", label); s.setAttribute("aria-hidden", "true");
    body.appendChild(s); sides[id] = s;
    s.addEventListener("click", function (e) { if (e.target.closest("[data-close-side]")) sideSet(null); });
    return s;
  }
  makeSide("basket", "Basket"); makeSide("account", "Account"); makeSide("saved", "Saved items");

  function renderBasket() {
    var count = 0, sub = 0;
    basket.forEach(function (i) { count += i.q; sub += i.q * i.pr; });
    var left = Math.max(0, FREE - sub);
    var ship = left ? "You are " + gbp(left) + " away from complimentary delivery." : "Your order qualifies for complimentary delivery.";
    var s = sides.basket;
    s.innerHTML = '<div class="side-h"><h2>Basket<small>(' + count + ")</small></h2>" + X + "</div>" +
      '<div class="side-b">' + (basket.length ? '<div class="ship">' + ship + '<div class="bar"><i style="width:' + Math.min(100, sub / FREE * 100) + '%"></i></div></div>' +
      basket.map(function (i, n) {
        return '<div class="item">' + ph(i.p, 240) + '<div><div class="item-top"><span>' + esc(i.n) + "</span><span>" + gbp(i.pr * i.q) + '</span></div><p class="item-v">' + esc(i.v) + "</p>" +
          '<div class="item-row"><span class="qty"><button type="button" data-dec="' + n + '" aria-label="Fewer">−</button><span>' + i.q + '</span><button type="button" data-inc="' + n + '" aria-label="More">+</button></span>' +
          '<button type="button" class="rm" data-rm="' + n + '">Remove</button></div></div></div>';
      }).join("") +
      '<label class="chk"><input id="giftwrap" type="checkbox"> Add gift wrapping and a handwritten card</label>' +
      '<div class="recs"><p class="cap" style="color:var(--mute)">You may also like</p><div class="recs-g">' +
      [PRODUCTS[2], PRODUCTS[7]].map(function (p) { return '<a class="pc" href="#">' + ph(p.p, 400, "4/5") + '<span class="pc-n" style="color:var(--ink)">' + esc(p.n) + '</span><span class="pc-p">' + gbp(p.pr) + "</span></a>"; }).join("") +
      "</div></div>" : '<p class="empty">Your basket is empty.</p>') + "</div>" +
      (basket.length ? '<div class="side-f"><div class="sum"><span>Subtotal</span><span>' + gbp(sub) + '</span></div><div class="sum"><span>Delivery</span><span>' + (left ? "£6.95" : "Complimentary") + "</span></div>" +
        '<div class="sum total"><span>Total</span><span>' + gbp(sub + (left ? 6.95 : 0)) + '</span></div><button type="button" class="wbtn">Checkout' + ARW + "</button>" +
        '<p class="paynote">Pay in 3 at 0% APR with <b>Shop Pay</b> or <b>Klarna</b>.</p></div>' : "");
    document.querySelectorAll("[data-count]").forEach(function (el) { el.innerHTML = "<b>" + count + "</b>"; el.style.display = count ? "" : "none"; });
  }
  sides.basket.addEventListener("click", function (e) {
    var b = e.target.closest("[data-inc],[data-dec],[data-rm]");
    if (!b) return;
    var n;
    if (b.hasAttribute("data-inc")) { n = +b.getAttribute("data-inc"); basket[n].q++; }
    else if (b.hasAttribute("data-dec")) { n = +b.getAttribute("data-dec"); basket[n].q = Math.max(1, basket[n].q - 1); }
    else { basket.splice(+b.getAttribute("data-rm"), 1); }
    renderBasket();
  });

  sides.account.innerHTML = '<div class="side-h"><h2>Account</h2>' + X + "</div>" +
    '<div class="side-b"><form id="signin" novalidate><label class="field"><span>Email address</span><input id="email" type="email" autocomplete="email"></label>' +
    '<label class="field"><span>Password</span><input id="pw" type="password" autocomplete="current-password"></label>' +
    '<button class="wbtn" type="submit">Sign in</button><p style="margin-top:14px"><a class="small-link" href="#">Forgotten your password?</a></p></form>' +
    '<div style="margin-top:40px;padding-top:28px;border-top:1px solid var(--line)"><h3 style="font:400 22px/1.2 var(--display)">New to Axel &amp; Hound?</h3>' +
    '<ul class="perks"><li>Track orders and arrange returns</li><li>Keep a list of saved pieces</li><li>Store your dog’s sizes for quicker checkout</li><li>Early access to the sale</li></ul>' +
    '<button type="button" class="wbtn line" style="margin-top:24px">Create an account</button></div></div>';
  sides.account.querySelector("#signin").addEventListener("submit", function (e) { e.preventDefault(); toast("Sign-in is a preview on this page"); });

  function renderSaved() {
    var s = sides.saved;
    s.innerHTML = '<div class="side-h"><h2>Saved<small>(' + saved.length + ")</small></h2>" + X + "</div>" +
      '<div class="side-b">' + (saved.length ? saved.map(function (i, n) {
        return '<div class="item">' + ph(i.p, 240) + '<div><div class="item-top"><span>' + esc(i.n) + "</span><span>" + gbp(i.pr) + '</span></div><p class="item-v">' + esc(i.v) + "</p>" +
          '<div class="item-row"><button type="button" class="small-link" data-add="' + n + '">Add to basket</button><button type="button" class="rm" data-unsave="' + n + '">Remove</button></div></div></div>';
      }).join("") : '<p class="empty">Nothing saved yet. Tap the heart on any piece to keep it here.</p>') + "</div>";
  }
  sides.saved.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add],[data-unsave]");
    if (!b) return;
    if (b.hasAttribute("data-add")) {
      var i = saved.splice(+b.getAttribute("data-add"), 1)[0];
      basket.push({ p: i.p, n: i.n, v: i.v, pr: i.pr, q: 1 });
      renderSaved(); renderBasket(); sideSet("basket");
    } else { saved.splice(+b.getAttribute("data-unsave"), 1); renderSaved(); }
  });
  renderBasket(); renderSaved();

  var lastFocus = null;
  function sideSet(id) {
    if (id) { close(); if (searchOn) searchSet(false); lastFocus = document.activeElement; }
    Object.keys(sides).forEach(function (k) { sides[k].classList.toggle("on", k === id); sides[k].setAttribute("aria-hidden", k === id ? "false" : "true"); });
    sideOn = id;
    body.style.overflow = id ? "hidden" : "";
    paint();
    if (id) setTimeout(function () { sides[id].focus({ preventScroll: true }); }, 60);
    else if (lastFocus) { lastFocus.focus(); lastFocus = null; }
  }
  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      var w = b.getAttribute("data-open");
      if (w === "search") searchSet(!searchOn); else sideSet(w);
    });
  });
  mega.addEventListener("click", function (e) { if (e.target.closest("[data-close-mega]")) close(); });
  scrim.addEventListener("click", function () { if (sideOn) sideSet(null); else { close(); searchSet(false); } });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (sideOn) sideSet(null);
    else if (searchOn) searchSet(false);
    else if (cur) { var a = nav.querySelector('[data-k="' + cur + '"]'); close(); a && a.focus(); }
  });
  document.addEventListener("focusin", function (e) { if (cur && !hdr.contains(e.target)) close(); });

  var toastEl = document.createElement("div");
  toastEl.className = "toast"; toastEl.setAttribute("role", "status");
  body.appendChild(toastEl);
  var tt = 0;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove("on"); }, 2400); }

  /* ---------------- mobile menu ---------------- */
  var drawer = document.createElement("div");
  drawer.className = "drawer"; drawer.setAttribute("aria-hidden", "true");
  drawer.innerHTML = '<div class="drawer-top"><span class="logo">' + document.querySelector(".logo").innerHTML +
    '</span><button type="button" class="x" data-close-drawer>Close<svg viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13"/></svg></button></div>' +
    '<div class="drawer-body">' + MENU.map(function (c) {
      return "<details><summary>" + esc(c.label) + "</summary><ul>" + c.g[0].l.concat(["Shop all " + c.label.toLowerCase()]).map(function (x) {
        return '<li><a href="#">' + esc(x) + "</a></li>";
      }).join("") + "</ul></details>";
    }).join("") + '<div class="drawer-foot"><a href="#" style="color:var(--sale)">Sale</a><a href="#">Help</a><a href="#" data-open-m="account">Account</a><a href="#" data-open-m="saved">Saved</a></div></div>';
  body.appendChild(drawer);
  function drawerSet(on) { drawer.classList.toggle("on", on); drawer.setAttribute("aria-hidden", on ? "false" : "true"); body.style.overflow = on ? "hidden" : ""; }
  document.querySelectorAll("[data-burger]").forEach(function (b) { b.addEventListener("click", function () { drawerSet(true); }); });
  drawer.querySelector("[data-close-drawer]").addEventListener("click", function () { drawerSet(false); });
  drawer.querySelectorAll("[data-open-m]").forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); drawerSet(false); sideSet(a.getAttribute("data-open-m")); }); });

  /* ---------------- hero video ---------------- */
  var video = document.querySelector(".hero video");
  var pause = document.querySelector("[data-pause]");
  if (video && pause) {
    var sync = function () { pause.classList.toggle("paused", video.paused); pause.setAttribute("aria-label", video.paused ? "Play video" : "Pause video"); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { video.removeAttribute("autoplay"); video.pause(); }
    pause.addEventListener("click", function () { video.paused ? video.play() : video.pause(); });
    video.addEventListener("play", sync); video.addEventListener("pause", sync); sync();
  }

  /* preview hooks so a reviewer can jump straight to a state: #search, #basket, #account, #saved */
  var h = location.hash.replace("#", "");
  if (h === "search") searchSet(true); else if (sides[h]) sideSet(h);
  paint();
})();
