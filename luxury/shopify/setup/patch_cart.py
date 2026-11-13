T = '/home/user/Cloud/luxury/theme/'
# r5: let the store script open and close the side panels
p = T + 'assets/r5.js'; s = open(p).read()
if 'window.AHSide' not in s:
    s = s.replace('  document.querySelectorAll("[data-open]").forEach(function (b) {',
                  '  window.AHSide = sideSet;\n  document.querySelectorAll("[data-open]").forEach(function (b) {', 1)
open(p, 'w').write(s)

p = T + 'assets/ah-store.js'; s = open(p).read()
old = '''    /* account and basket open the real pages */
    document.addEventListener("click", function (e) {
      var b = e.target.closest('[data-open="account"],[data-open-m="account"],[data-open="basket"],[data-open-m="basket"]');
      if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      var w = b.getAttribute("data-open") || b.getAttribute("data-open-m");
      location.href = w === "basket" ? R.cart : R.account;
    }, true);'''
new = '''    /* account opens the account page; the basket opens the real basket drawer */
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
    }, true);'''
assert old in s
s = s.replace(old, new)

helpers = '''  /* ---------- basket drawer, filled from the real Shopify basket ---------- */
  var ROOT = (window.Shopify && Shopify.routes && Shopify.routes.root) || "/";
  var FREE = 10000; /* free UK delivery from £100, in pence */
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
'''
s = s.replace('  /* real links for the menu, drawers and footer items', helpers + '  /* real links for the menu, drawers and footer items', 1)
# add to basket on product pages opens the drawer
s = s.replace('''.then(function (cart) { setCount(cart.item_count); if (msg) msg.innerHTML = 'Added to your basket. <a href="' + R.cart + '">View basket</a>'; })''',
              '''.then(function (cart) { setCount(cart.item_count); if (msg) msg.textContent = "Added to your basket."; if (drawCart(cart) && window.AHSide) window.AHSide("basket"); })''')
open(p, 'w').write(s)
print('openCart' in s, 'drawCart(cart)' in s)

css = '''
/* basket drawer */
#side-basket{display:flex;flex-direction:column}
.ahc-prog{padding:16px 28px 18px;border-bottom:1px solid var(--line,#E4E4E0);flex:none}
.ahc-prog p{margin:0 0 10px;font-size:13px;color:var(--ink2)}
.ahc-prog i{display:block;height:3px;background:#E4E4E0}
.ahc-prog b{display:block;height:100%;background:var(--olive,#5E6B3A);transition:width .4s ease}
.ahc-it{display:grid;grid-template-columns:96px minmax(0,1fr);gap:16px;padding:18px 0;border-bottom:1px solid var(--line,#E4E4E0)}
.ahc-it:first-child{padding-top:4px}
.ahc-im{display:block;aspect-ratio:1;background:#EDEDEB;overflow:hidden}
.ahc-im img{width:100%;height:100%;object-fit:cover}
.ahc-top{display:flex;justify-content:space-between;gap:12px;font-size:14px}
.ahc-top a{color:var(--ink);text-decoration:none;font-weight:500}
.ahc-tx p{margin:4px 0 0;font-size:13px;color:var(--ink2)}
.ahc-row{display:flex;justify-content:space-between;align-items:center;margin-top:14px}
.ahc-q{display:inline-flex;align-items:center;border:1px solid #D6D6D0}
.ahc-q button{width:34px;height:34px;border:0;background:none;font-size:16px;cursor:pointer;color:var(--ink)}
.ahc-q span{min-width:24px;text-align:center;font-size:13px}
.ahc-rm{border:0;background:none;padding:0;font-size:12.5px;color:var(--ink2);text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.ahc-sub{display:flex;justify-content:space-between;align-items:baseline;font-size:15px}
.ahc-sub b{font:500 22px/1 var(--display)}
.ahc-note{margin:6px 0 16px;font-size:12.5px;color:var(--ink2)}
.ahc-btn{display:flex;align-items:center;justify-content:center;height:52px;background:var(--ink);color:#fff;font:600 11.5px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;text-decoration:none;transition:background .25s}
.ahc-btn:hover{background:var(--olive,#5E6B3A)}
.ahc-link{display:block;text-align:center;margin-top:14px;font:600 11px/1 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:var(--ink)}
.ahc-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;text-align:center}
.ahc-empty p{font:500 24px/1.2 var(--display);margin:0}
.ahc-empty .ahc-btn{padding:0 32px}
'''
c = T + 'assets/r50.css'; t = open(c).read()
if '/* basket drawer */' not in t: t += css
open(c, 'w').write(t)
