/* Axel & Hound Home */
(function () {
  "use strict";
  var AH = window.AH || {}, R = AH.routes || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var scrim = $("[data-scrim]"), openEl = null;

  /* drawers and overlays */
  function open(id) {
    var el = document.getElementById(id); if (!el) return;
    close(); openEl = el; el.classList.add("on"); scrim.classList.add("on");
    document.documentElement.style.overflow = "hidden";
    var f = $("input:not([type=hidden]),button,a", el); setTimeout(function () { (id === "search" ? $("#srch-q") : el).focus(); }, 60);
  }
  function close() {
    if (!openEl) return; openEl.classList.remove("on"); scrim.classList.remove("on");
    document.documentElement.style.overflow = ""; openEl = null;
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); open(o.getAttribute("data-open")); return; }
    if (e.target.closest("[data-close]") || e.target === scrim) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

  /* header shadow once scrolled */
  var hdr = $("[data-hdr]");
  if (hdr) window.addEventListener("scroll", function () { hdr.classList.toggle("stuck", window.scrollY > 4); }, { passive: true });

  /* announcement messages take turns */
  var msgs = $$(".ann-msg");
  if (msgs.length > 1) { var mi = 0; setInterval(function () { msgs[mi].classList.remove("on"); mi = (mi + 1) % msgs.length; msgs[mi].classList.add("on"); }, 4500); }

  /* predictive search */
  var sq = $("[data-suggest]"), out = $("[data-suggest-out]"), base = out ? out.innerHTML : "", st = 0;
  if (sq) sq.addEventListener("input", function () {
    clearTimeout(st); var v = sq.value.trim();
    if (!v) { out.innerHTML = base; return; }
    st = setTimeout(function () {
      fetch(R.suggest + "?q=" + encodeURIComponent(v) + "&resources[type]=product,collection,page&resources[limit]=4&section_id=predictive-search")
        .then(function (r) { return r.text(); })
        .then(function (h) { var d = new DOMParser().parseFromString(h, "text/html"), s = d.querySelector(".shopify-section"); out.innerHTML = s ? s.innerHTML : ""; });
    }, 200);
  });

  /* basket: refresh the drawer and count from the section */
  function refreshCart(openIt) {
    return fetch(window.location.pathname + "?sections=cart-drawer").then(function (r) { return r.json(); }).then(function (d) {
      var box = $("#cart-drawer"); if (box && d["cart-drawer"]) {
        var doc = new DOMParser().parseFromString(d["cart-drawer"], "text/html");
        box.innerHTML = doc.body.firstElementChild.innerHTML;
      }
      return fetch(R.cart + ".js").then(function (r) { return r.json(); });
    }).then(function (c) {
      $$("[data-count]").forEach(function (n) { n.textContent = c.item_count > 0 ? c.item_count : ""; });
      if (openIt) open("cart-drawer");
    });
  }
  function change(key, q) {
    return fetch(R.change + ".js", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ id: key, quantity: q }) });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("#cart-drawer [data-q]"); if (!b) return;
    var line = b.closest("[data-key]"), inp = $("[data-qi]", line), q = Math.max(0, (+inp.value || 0) + (+b.getAttribute("data-q")));
    line.style.opacity = ".5"; change(line.getAttribute("data-key"), q).then(function () { refreshCart(false); });
  });
  document.addEventListener("change", function (e) {
    var inp = e.target.closest("#cart-drawer [data-qi]"); if (!inp) return;
    var line = inp.closest("[data-key]"); change(line.getAttribute("data-key"), Math.max(0, +inp.value || 0)).then(function () { refreshCart(false); });
  });
  /* basket page */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".cart [data-q]"); if (!b) return;
    var line = b.closest("[data-key]"), inp = $("input", line), q = Math.max(0, (+inp.value || 0) + (+b.getAttribute("data-q")));
    line.style.opacity = ".5"; change(line.getAttribute("data-key"), q).then(function () { location.reload(); });
  });

  /* quantity pickers on the product page */
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".pinfo .qty [data-q]"); if (!b) return;
    var i = $("input", b.parentNode); i.value = Math.max(1, (+i.value || 1) + (+b.getAttribute("data-q")));
  });

  /* product: variant selection, price, availability and add to bag */
  var pj = $("[data-product-json]");
  if (pj) {
    var P = JSON.parse(pj.textContent), form = $("#pform"), idIn = $("input[name=id]", form), msg = $("[data-msg]"), btn = $("[data-add]", form);
    function chosen() { return P.options.map(function (o, i) { var c = $('input[data-opt="' + i + '"]:checked'); return c ? c.value : null; }); }
    function match(sel) { return P.variants.find(function (v) { return v.options.every(function (o, i) { return sel[i] === null || sel[i] === o; }); }); }
    function update() {
      var sel = chosen(), v = sel.indexOf(null) < 0 ? match(sel) : null;
      $$("[data-opt-name]").forEach(function (l) { var i = +l.getAttribute("data-opt-name"); l.textContent = sel[i] || ""; });
      /* mark sizes that are out of stock with the current choices */
      P.options.forEach(function (o, i) {
        $$('input[data-opt="' + i + '"]').forEach(function (inp) {
          var test = sel.slice(); test[i] = inp.value;
          var ok = P.variants.some(function (v) { return v.available && v.options.every(function (x, k) { return test[k] === null || test[k] === x; }); });
          inp.classList.toggle("na", !ok);
        });
      });
      if (v) {
        idIn.value = v.id;
        var pr = $("[data-price]", $(".pinfo"));
        if (pr) pr.innerHTML = v.compare_at_price > v.price ? '<span class="now">' + fm(v.price) + "</span><s>" + fm(v.compare_at_price) + "</s>" : "<span>" + fm(v.price) + "</span>";
        btn.disabled = !v.available; btn.textContent = v.available ? "Add to bag" : "Sold out";
        if (history.replaceState) history.replaceState(null, "", location.pathname + "?variant=" + v.id);
      } else { btn.disabled = false; btn.textContent = "Add to bag"; }
    }
    function fm(c) { return "£" + (c % 100 ? (c / 100).toFixed(2) : String(c / 100)); }
    $$("input[data-opt]").forEach(function (i) { i.addEventListener("change", update); });
    update();
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var sel = chosen(), miss = sel.indexOf(null);
      if (miss >= 0) { msg.textContent = "Please choose a " + P.options[miss].toLowerCase() + "."; return; }
      var v = match(sel); if (!v || !v.available) { msg.textContent = "Sorry, that option is sold out."; return; }
      btn.disabled = true; msg.textContent = "";
      fetch(R.add + ".js", { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw d; return d; }); })
        .then(function () { return refreshCart(true); })
        .catch(function (err) { msg.textContent = (err && err.description) || "Sorry, we couldn’t add that. Please try again."; })
        .then(function () { btn.disabled = false; });
    });
    /* gallery opens full screen */
    var lb = $("[data-lb]");
    $$("[data-lb-open]").forEach(function (b, i) { b.addEventListener("click", function () { if (!lb) return; lb.classList.add("on"); document.documentElement.style.overflow = "hidden"; var t = $$("img", lb)[i]; if (t) t.scrollIntoView(); }); });
    if (lb) $("[data-lb-close]", lb).addEventListener("click", function () { lb.classList.remove("on"); document.documentElement.style.overflow = ""; });
  }

  /* collection filters submit as you choose them */
  $$("[data-facets]").forEach(function (f) {
    f.addEventListener("change", function (e) { if (e.target.matches("input[type=checkbox],select")) f.submit(); });
  });
  $$("[data-sort]").forEach(function (s) { s.addEventListener("change", function () { var u = new URL(location.href); u.searchParams.set("sort_by", s.value); location.href = u.toString(); }); });

  /* sections rise in gently */
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    $$(".rv").forEach(function (el) { io.observe(el); });
  } else $$(".rv").forEach(function (el) { el.classList.add("in"); });
})();
