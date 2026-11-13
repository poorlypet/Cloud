/* Axel & Hound: connects the signed-off interface to the Shopify store
   (links, basket, search, add to bag) and keeps media as blank frames until real media is added. */
(function () {
  "use strict";
  var AH = window.AH || {}, R = AH.routes || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function money(c) { return "£" + (c % 100 ? (c / 100).toFixed(2) : String(c / 100)); }
  function setCount(n) { $$("[data-count]").forEach(function (e) { if (e.closest(".v9-top")) e.textContent = "(" + n + ")"; else e.textContent = n > 0 ? n : ""; }); }

  /* blank frames for any prototype photography the menus or drawers still reference */
  function blankImages(root) {
    $$("img", root).forEach(function (im) {
      var s = im.getAttribute("src") || "";
      if (s && s.indexOf("data:") !== 0 && s.indexOf("cdn.shopify") < 0 && s.indexOf("/cdn/") < 0 && s.indexOf("//" + location.host) < 0 && !/\.(png)(\?|$)/.test(s)) {
        im.src = AH.blank; im.removeAttribute("srcset"); im.classList.add("ah-blank");
      }
    });
  }
  /* real links for the menu, drawers and footer items that were "#" in the prototype */
  function norm(t) { return (t || "").replace(/\s+/g, " ").replace(/[^\w &]/g, "").trim().toLowerCase(); }
  function fixLinks(root) {
    var L = AH.links || {};
    $$('a[href="#"]', root).forEach(function (a) {
      if (a.hasAttribute("data-k") || a.hasAttribute("data-open-m") || a.hasAttribute("data-q")) return;
      var t = norm(a.textContent), u = L[t];
      if (!u && t.indexOf("shop all ") === 0) u = L[t.slice(9)];
      if (!u && t.indexOf("shop ") === 0) u = L[t.slice(5)];
      if (!u) for (var k in L) { if (t && (k.indexOf(t) === 0 || t.indexOf(k) === 0)) { u = L[k]; break; } }
      if (u) a.setAttribute("href", u);
    });
    $$("a.nl[data-k]").forEach(function (a) { var u = L[norm(a.textContent)]; if (u) a.setAttribute("data-href", u); });
  }

  function init() {
    var hdr = $(".hdr");
    blankImages(document.body); fixLinks(document.body);
    setCount(AH.count || 0);
    /* account and basket open the real pages */
    document.addEventListener("click", function (e) {
      var b = e.target.closest('[data-open="account"],[data-open-m="account"],[data-open="basket"],[data-open-m="basket"]');
      if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var w = b.getAttribute("data-open") || b.getAttribute("data-open-m");
      location.href = w === "basket" ? R.cart : R.account;
    }, true);
    /* top-level menu items go to their category when clicked */
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a.nl[data-href]");
      if (a && !window.matchMedia("(hover: none)").matches) { e.preventDefault(); e.stopImmediatePropagation(); location.href = a.getAttribute("data-href"); }
    }, true);

    /* search panel: live results from the store, Enter opens the full results page */
    var q = document.getElementById("q"), res = $("[data-res]"), resH = $("[data-res-h]"), t = 0;
    if (q) {
      q.setAttribute("name", "q");
      q.addEventListener("keydown", function (e) { if (e.key === "Enter" && q.value.trim()) { e.preventDefault(); location.href = R.search + "?type=product&q=" + encodeURIComponent(q.value.trim()); } });
      q.addEventListener("input", function () {
        clearTimeout(t);
        var v = q.value.trim(); if (!v) return;
        t = setTimeout(function () {
          fetch("/search/suggest.json?q=" + encodeURIComponent(v) + "&resources[type]=product&resources[limit]=6").then(function (r) { return r.json(); }).then(function (d) {
            var ps = (d.resources && d.resources.results && d.resources.results.products) || [];
            if (resH) resH.textContent = ps.length ? "Products" : "No matches yet";
            if (res) res.innerHTML = ps.length ? ps.map(function (p) {
              return '<a class="pcd" href="' + p.url + '"><span class="im"><img src="' + (p.image || AH.blank) + '" alt="" class="' + (p.image ? "" : "ah-blank") + '"></span><span class="br">' + (p.vendor || "") + '</span><span class="pn">' + p.title + '</span><span class="pr"><b>£' + p.price + "</b></span></a>";
            }).join("") + '<a class="zlink" href="' + R.search + "?type=product&q=" + encodeURIComponent(v) + '">See all results</a>' : '<p class="srch-empty">Nothing matches &ldquo;' + v.replace(/</g, "&lt;") + '&rdquo; yet. Try a material or a category, such as wool or beds.</p>';
          }).catch(function () {});
        }, 180);
      });
      $$("[data-q]").forEach(function (a) { a.addEventListener("click", function () { setTimeout(function () { q.dispatchEvent(new Event("input")); }, 0); }); });
    }

    /* product page: real variants, prices, stock and add to bag */
    var pj = document.getElementById("ah-product");
    if (pj) {
      var P = JSON.parse(pj.textContent), ci = P.options.indexOf("Colour"), si = P.options.indexOf("Size");
      var msg = $(".msg"), stock = $(".stock"), price = $("[data-ah-price]");
      function sel() {
        var c = $('.sws button[aria-pressed="true"]'), s = $('.szs button[aria-pressed="true"]');
        return { c: c ? c.getAttribute("data-c") : null, s: s ? s.getAttribute("data-s") : null };
      }
      function find(c, s) {
        return P.variants.filter(function (v) {
          return (ci < 0 || !c || v.options[ci] === c) && (si < 0 || !s || v.options[si] === s);
        });
      }
      function refresh() {
        var x = sel();
        $$(".szs button").forEach(function (b) {
          var vs = find(x.c, b.getAttribute("data-s")), ok = vs.some(function (v) { return v.available; });
          if (ok) b.removeAttribute("data-oos"); else b.setAttribute("data-oos", "");
        });
        var v = find(x.c, x.s)[0];
        if (v && price) price.innerHTML = '<b style="font-weight:500">' + money(v.price) + "</b>" + (v.compare_at_price > v.price ? "<s>" + money(v.compare_at_price) + '</s><span class="ptag">−' + Math.round((v.compare_at_price - v.price) * 100 / v.compare_at_price) + "%</span>" : "");
      }
      document.addEventListener("click", function (e) { if (e.target.closest(".sws button,.szs button")) setTimeout(refresh, 0); });
      refresh();
      document.addEventListener("click", function (e) {
        var b = e.target.closest(".atc"); if (!b) return;
        var x = sel();
        if (si >= 0 && !x.s) return;                       /* the page asks for a size */
        e.preventDefault(); e.stopImmediatePropagation();
        var v = find(x.c, x.s)[0];
        if (!v || !v.available) { if (msg) msg.textContent = "Sorry, that option is out of stock."; return; }
        var qty = +(($(".q span") || {}).textContent || 1) || 1;
        b.disabled = true;
        fetch(R.add, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ items: [{ id: v.id, quantity: qty }] }) })
          .then(function (r) { return r.json().then(function (d) { if (!r.ok) throw d; return d; }); })
          .then(function () { return fetch(R.cart + ".js").then(function (r) { return r.json(); }); })
          .then(function (cart) { setCount(cart.item_count); if (msg) msg.innerHTML = 'Added to your basket. <a href="' + R.cart + '">View basket</a>'; })
          .catch(function (err) { if (msg) msg.textContent = (err && err.description) || "Sorry, we couldn’t add that. Please try again."; })
          .then(function () { b.disabled = false; });
      }, true);
    }

    /* basket page: quantities, remove and discount codes update the real basket */
    var lines = $(".v9-lines");
    if (lines) {
      document.addEventListener("click", function (e) {
        var b = e.target.closest(".v9-line [data-qd], .v9-line [data-rm]"); if (!b) return;
        e.preventDefault(); e.stopImmediatePropagation();
        var line = b.closest(".v9-line"), q = +$(".v9-q span", line).textContent;
        var nq = b.hasAttribute("data-rm") ? 0 : Math.max(0, q + (+b.getAttribute("data-qd")));
        line.style.opacity = ".5";
        fetch(R.change, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ id: line.getAttribute("data-key"), quantity: nq }) })
          .then(function () { location.reload(); });
      }, true);
      var promo = $("[data-promo]");
      if (promo) promo.addEventListener("submit", function (e) {
        e.preventDefault(); e.stopImmediatePropagation();
        var c = ($("input", promo).value || "").trim(); if (c) location.href = "/discount/" + encodeURIComponent(c) + "?redirect=" + encodeURIComponent(R.cart);
      }, true);
    }
    /* menus and drawers built after load */
    if (hdr && "MutationObserver" in window) new MutationObserver(function () { blankImages(document.body); fixLinks(document.body); }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
