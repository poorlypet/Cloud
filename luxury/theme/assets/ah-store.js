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
  /* ---------- basket drawer, filled from the real Shopify basket ---------- */
  var ROOT = (window.Shopify && Shopify.routes && Shopify.routes.root) || "/";
  var FREE = 7500; /* free UK delivery from £75, in pence */
  function escH(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function drawCart(c) {
    var el = document.getElementById("side-basket"); if (!el) return false;
    var n = c.item_count;
    var head = '<div class="side-h"><h2>Your basket<small>(' + n + ')</small></h2><button type="button" class="x" data-ahc-x>Close<svg viewBox="0 0 14 14"><path d="M1 1l12 12M13 1L1 13"/></svg></button></div>';
    if (!n) {
      el.innerHTML = head + '<div class="side-b ahc-empty"><p>Your basket is empty.</p><a class="ahc-btn" href="/collections/new-in">Shop new in</a></div>';
      return true;
    }
    var left = Math.max(0, FREE - c.total_price), pct = Math.min(100, Math.round(c.total_price * 100 / FREE));
    var items = c.items.map(function (it) {
      var img = it.image ? '<img src="' + it.image + (it.image.indexOf("?") < 0 ? "?" : "&") + 'width=240" alt="">' : "";
      return '<div class="ahc-it" data-key="' + escH(it.key) + '"><a class="ahc-im" href="' + escH(it.url) + '">' + img + '</a><div class="ahc-tx">' +
        '<div class="ahc-top"><a href="' + escH(it.url) + '">' + escH(it.product_title) + '</a><span>' + money(it.final_line_price) + '</span></div>' +
        (it.variant_title ? '<p>' + escH(it.variant_title) + '</p>' : '') +
        '<div class="ahc-row"><div class="ahc-q"><button type="button" data-ahq="-1" aria-label="One fewer">&minus;</button><span>' + it.quantity + '</span><button type="button" data-ahq="1" aria-label="One more">+</button></div>' +
        '<button type="button" class="ahc-rm" data-ahrm>Remove</button></div></div></div>';
    }).join("");
    el.innerHTML = head +
      '<div class="ahc-prog"><p>' + (left ? 'You&rsquo;re ' + money(left) + ' away from free UK delivery' : 'You&rsquo;ve got free UK delivery') + '</p><i><b style="width:' + pct + '%"></b></i></div>' +
      '<div class="side-b">' + items + '</div>' +
      '<div class="side-f"><div class="ahc-sub"><span>Subtotal</span><b>' + money(c.total_price) + '</b></div><p class="ahc-note">Delivery and any discount codes are added at checkout.</p>' +
      '<a class="ahc-btn" href="' + ROOT + 'checkout">Checkout</a><a class="ahc-link" href="' + R.cart + '">View basket</a></div>';
    return true;
  }
  function openCart() {
    fetch(R.cart + ".js", { headers: { Accept: "application/json" } }).then(function (r) { return r.json(); })
      .then(function (c) { setCount(c.item_count); if (drawCart(c) && window.AHSide) window.AHSide("basket"); else location.href = R.cart; })
      .catch(function () { location.href = R.cart; });
  }
  window.AHCart = { open: openCart, draw: drawCart };
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
    /* account opens the account page; the basket opens the real basket drawer */
    document.addEventListener("click", function (e) {
      var b = e.target.closest('[data-open="account"],[data-open-m="account"],[data-open="basket"],[data-open-m="basket"]');
      if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var w = b.getAttribute("data-open") || b.getAttribute("data-open-m");
      if (w === "basket") openCart(); else location.href = R.account;
    }, true);
    /* basket drawer: quantity, remove and close */
    document.addEventListener("click", function (e) {
      var x = e.target.closest("[data-ahc-x]"); if (x) { e.preventDefault(); if (window.AHSide) window.AHSide(null); return; }
      var b = e.target.closest("#side-basket [data-ahq], #side-basket [data-ahrm]"); if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var it = b.closest(".ahc-it"), q = +$(".ahc-q span", it).textContent;
      var nq = b.hasAttribute("data-ahrm") ? 0 : Math.max(0, q + (+b.getAttribute("data-ahq")));
      it.style.opacity = ".5";
      fetch(ROOT + "cart/change.js", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ id: it.getAttribute("data-key"), quantity: nq }) })
        .then(function (r) { return r.json(); })
        .then(function (c) { setCount(c.item_count); drawCart(c); })
        .catch(function () { it.style.opacity = ""; });
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
      var P = JSON.parse(pj.textContent), ci = P.options.indexOf("Colour"), si = P.options.indexOf("Size"), hi = P.options.indexOf("Hardware");
      var msg = $(".msg"), stock = $(".stock"), price = $("[data-ah-price]");
      function sel() {
        var c = $('.sws button[aria-pressed="true"]'), s = $('.szs button[aria-pressed="true"]'), h = $('.hws button[aria-pressed="true"]');
        return { c: c ? c.getAttribute("data-c") : null, s: s ? s.getAttribute("data-s") : null, h: h ? h.getAttribute("data-h") : null };
      }
      function find(c, s, h) {
        if (h === undefined) h = sel().h;
        return P.variants.filter(function (v) {
          return (ci < 0 || !c || v.options[ci] === c) && (si < 0 || !s || v.options[si] === s) && (hi < 0 || !h || v.options[hi] === h);
        });
      }
      function refresh() {
        var x = sel();
        $$(".szs button").forEach(function (b) {
          var vs = find(x.c, b.getAttribute("data-s")), ok = vs.some(function (v) { return v.available; });
          if (ok) b.removeAttribute("data-oos"); else b.setAttribute("data-oos", "");
        });
        var v = find(x.c, x.s)[0];
        if (v) $$(".p3l, .p3m").forEach(function (el) { el.innerHTML = el.innerHTML.replace(/£[0-9][0-9,]*(?:\.[0-9]{2})?/, money(Math.round(v.price / 3))); });
        if (v && price) price.innerHTML = '<b style="font-weight:500">' + money(v.price) + "</b>" + (v.compare_at_price > v.price ? "<s>" + money(v.compare_at_price) + '</s><span class="ptag">−' + Math.round((v.compare_at_price - v.price) * 100 / v.compare_at_price) + "%</span>" : "");
      }
      document.addEventListener("click", function (e) {
        var hb = e.target.closest(".hws button");
        if (hb) { $$(".hws button").forEach(function (b) { b.setAttribute("aria-pressed", b === hb ? "true" : "false"); }); var hn = $("[data-hwname]"); if (hn) hn.textContent = hb.getAttribute("data-h"); }
        if (e.target.closest(".sws button,.szs button,.hws button")) setTimeout(refresh, 0);
      });
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
          .then(function (cart) { setCount(cart.item_count); if (msg) msg.textContent = "Added to your basket."; if (drawCart(cart) && window.AHSide) window.AHSide("basket"); })
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

/* collection card colour dots: preview the colour on hover */
if(!window.__csw){window.__csw=1;document.addEventListener('mouseover',function(e){var a=e.target.closest&&e.target.closest('.csw a[data-img]');if(!a)return;var c=a.closest('.pcd'),im=c&&c.querySelector('.im img');if(!im)return;if(!im.dataset.orig)im.dataset.orig=im.currentSrc||im.src;im.removeAttribute('srcset');im.src=a.dataset.img;});document.addEventListener('mouseout',function(e){var c=e.target.closest&&e.target.closest('.csw');if(!c||c.contains(e.relatedTarget))return;var im=c.closest('.pcd').querySelector('.im img');if(im&&im.dataset.orig)im.src=im.dataset.orig;});}

/* big colour families on the product page: show two rows, current colour kept visible, "Show all N" opens the rest */
(function(){if(window.__sibclip)return;window.__sibclip=1;
function run(){var w=document.querySelector('.ah-sibs');if(!w)return;var a=w.querySelectorAll('a');if(a.length<=20)return;
var cur=w.querySelector('[aria-current]');if(cur)w.insertBefore(cur,w.firstChild);
w.classList.add('clip');var b=document.createElement('button');b.type='button';b.className='sib-more';b.textContent='Show all '+a.length;
b.addEventListener('click',function(){var o=w.classList.toggle('clip');b.textContent=o?'Show all '+a.length:'Show fewer'});
var cr=w.closest('.crow')||w.parentNode;cr.parentNode.insertBefore(b,cr.nextSibling)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run()})();

(function(){if(window.__pvfill)return;window.__pvfill=1;
function fit(){var g=document.querySelector('.pv3 .pvg3'),gi=document.querySelector('.gi');if(!g||!gi)return;
 if(!matchMedia('(min-width: 901px)').matches){g.classList.remove('one');return}
 g.classList.remove('one');if(g.getBoundingClientRect().height<gi.offsetHeight-120)g.classList.add('one')}
function go(){fit();addEventListener('resize',fit);var gi=document.querySelector('.gi');if(gi&&'ResizeObserver' in window)new ResizeObserver(fit).observe(gi);setTimeout(fit,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go()})();

/* collection pages: keep Shopify's order, but move the brands so Brott Barcelona comes last; "Load more" adds products on the same page */
(function(){if(window.__cxorder)return;window.__cxorder=1;
var RANK={'Cloud7':0,'Nordog':1,'Tadazhi':2,'Molly and Stitch':3,'Pintu':4,'BDEBRUNO':5,'PAIKKA':6,'Brott Barcelona':9};
function brandOrder(grid){var kids=[].slice.call(grid.querySelectorAll(':scope > .pcd'));if(kids.length<2)return;
 kids.forEach(function(k){k.style.display='';k.classList.remove('fam-hidden')});
 var rows=kids.map(function(k,i){var v=k.getAttribute('data-v')||'';var r=RANK.hasOwnProperty(v)?RANK[v]:7;return {k:k,i:i,r:r}});
 rows.sort(function(a,b){return a.r-b.r||a.i-b.i});
 rows.forEach(function(x){grid.appendChild(x.k)})}
window.__cxmix=function(g){if(g)brandOrder(g)};
function go(){var grid=document.querySelector('.cx-grid');if(!grid)return;
 var sel=document.querySelector('.cx-sort');if(!sel||!sel.value||sel.value==='feat')brandOrder(grid);
 var more=document.querySelector('.cx-more');if(!more)return;var btn=more.querySelector('a.btn-o');if(!btn)return;
 var m=(more.querySelector('p')||{textContent:''}).textContent.match(/of\s+([0-9,]+)/);var total=m?parseInt(m[1].replace(/,/g,''),10):0;
 btn.addEventListener('click',function(e){e.preventDefault();btn.disabled=true;btn.textContent='Loading...';
  fetch(btn.href,{credentials:'same-origin'}).then(function(r){return r.text()}).then(function(h){
   var d=new DOMParser().parseFromString(h,'text/html');var ng=d.querySelector('.cx-grid');
   if(ng){[].slice.call(ng.querySelectorAll(':scope > .pcd')).forEach(function(k){grid.appendChild(document.importNode(k,true))})}
   var nm=d.querySelector('.cx-more a.btn-o');
   var sel2=document.querySelector('.cx-sort');if(sel2&&sel2.value&&sel2.value!=='feat'){sel2.dispatchEvent(new Event('change'))}else{brandOrder(grid)}
   var n=grid.querySelectorAll(':scope > .pcd').length;
   var p=more.querySelector('p');if(p&&total)p.textContent='Showing '+n+' of '+total+' products';
   var bar=more.querySelector('.prog i');if(bar&&total)bar.style.width=Math.min(100,Math.round(n*100/total))+'%';
   if(nm){btn.href=nm.getAttribute('href');btn.disabled=false;btn.textContent='Load more'}else{btn.remove()}
  }).catch(function(){btn.disabled=false;btn.textContent='Load more';location.href=btn.href});
 });
}
/* load the next pages automatically (up to 8), then order by brand again, so the brands are all in the list before Brott is put last */
function autoLoad(){var grid=document.querySelector('.cx-grid');if(!grid)return;var sel=document.querySelector('.cx-sort');if(sel&&sel.value&&sel.value!=='feat')return;var n=0;
 function step(){var btn=document.querySelector('.cx-more a.btn-o');if(!btn||!btn.parentNode||n>=8)return;n++;btn.click();setTimeout(function(){if(window.__cxmix)window.__cxmix(grid);step()},2200)}
 setTimeout(step,600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){go();autoLoad()});else{go();autoLoad()}
})();
