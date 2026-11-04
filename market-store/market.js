/* market.js: makes the custom storefront work for the Germany and Ireland markets.
   It runs only when window.PP_MARKET.code is DE or IE (set by snippets/market-config.liquid), so the UK store is untouched.
   Three jobs:
     1. data      swap the UK product list and GBP prices for the euro catalogue (eu-catalog.js), set the free delivery
                  amount and the delivery wording
     2. links     keep the market in every link and cart call (/de-de/... or /en-ie/...), so the basket and checkout stay in euro
     3. text      show prices as euro and, for Germany, translate the interface (de-dict.js)
   Load order: market-config, eu-catalog.js, de-dict.js, then the early part of this file before pet-cat.js (it reads and
   filters the product lists), then the late part after site-data.js (see the two entry points at the bottom). */
(function () {
  'use strict';
  var M = window.PP_MARKET;
  if (!M || (M.code !== 'DE' && M.code !== 'IE')) return;
  var DE = M.code === 'DE';
  var ROOT = String(M.root || '/').replace(/\/$/, '');   // "/de-de" or "/en-ie"
  var FREE = 50;                                          // free delivery from this amount in euro, both markets
  var SHIP = DE ? 5.99 : 4.99;                            // the delivery charge below that (as set in Shopify)
  var DICT = (DE && window.PP_DE) || {};
  var RULES = (DE ? window.PP_DE_RULES : window.PP_IE_RULES) || [];

  /* ---------- helpers ---------- */
  function norm(s) { return String(s).replace(/\s+/g, ' ').trim(); }
  function prefix(u) {
    if (typeof u !== 'string' || u.charAt(0) !== '/' || u.indexOf('//') === 0) return u;
    if (u === ROOT || u.indexOf(ROOT + '/') === 0 || u.indexOf(ROOT + '?') === 0 || u.indexOf(ROOT + '#') === 0) return u;
    if (/^\/(cdn|assets|apps|a|checkouts|services|\.well-known|wpm|\.shopify|_)(\/|$)/.test(u)) return u;
    if (u === '/') return ROOT + '/';
    return ROOT + u;
  }
  function euro(whole, dec) {
    var n = whole.replace(/,/g, '');
    if (DE) { var w = n.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return w + ',' + (dec || '00') + ' €'; }
    return '€' + whole + (dec ? '.' + dec : '');
  }
  var PRICE = /£\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?/g;
  function money(s) {
    return s.replace(PRICE, function (m, w, d) {
      if (d != null && d.length === 1) d += '0';
      // whole amounts with no pence (for example the free delivery amount) keep no decimals
      if (d == null) return DE ? w.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €' : '€' + w;
      return euro(w, d);
    });
  }
  function translate(s) {
    var n = norm(s);
    if (!n) return s;
    var out = null;
    if (Object.prototype.hasOwnProperty.call(DICT, n)) out = DICT[n];
    else {
      for (var i = 0; i < RULES.length; i++) {
        var r = RULES[i];
        if (r[0].test(n)) { out = n.replace(r[0], r[1]); break; }
      }
    }
    if (out == null) return s;
    var lead = (/^\s*/.exec(s) || [''])[0], trail = (/\s*$/.exec(s) || [''])[0];
    return lead + out + trail;
  }
  function fixText(s) { return money(translate(s)); }

  /* ---------- 1. data (early part) ---------- */
  function applyData() {
    var CAT = window.PP_EUCAT && window.PP_EUCAT.p, SH = window.SHOPIFY, PP = window.PP;
    if (CAT && SH && SH.products) {
      var fix = function (p) {
        var e = CAT[p.handle];
        if (!e) return false;                       // not in the Ireland and Germany catalogue: not sold here
        if (DE && e[0]) p.title = e[0];
        p.price = e[1]; p.priceMax = e[2]; p.compareAt = e[3] || null; p.available = !!e[4];
        return true;
      };
      SH.products = SH.products.filter(fix);
      ['PETEXTRA', 'PETCATP'].forEach(function (k) { if (window[k] && window[k].filter) window[k] = window[k].filter(fix); });
      Object.keys(SH.collections || {}).forEach(function (k) {
        var c = SH.collections[k];
        if (c && c.products && c.products.filter) c.products = c.products.filter(function (h) { return CAT[h]; });
      });
    }
    var C = PP && PP.content;
    if (C) {
      // one line of copy per place the theme states delivery. The pound sign is turned into the euro sign when it is shown.
      var del = DE ? 'Versand aus Großbritannien' : 'shipped from the UK';
      C.util = C.util || [];
      C.util[0] = DE ? ['Kostenloser Versand', 'ab £' + FREE + ' Bestellwert'] : ['Free delivery', 'on orders over £' + FREE];
      C.usp = C.usp || [];
      C.usp[0] = DE ? ['Kostenloser Versand', 'ab £' + FREE + ' Bestellwert'] : ['Free delivery to Ireland', 'on orders over £' + FREE];
      C.usp[2] = DE ? ['Lieferung in 2 bis 5 Werktagen', del] : ['Delivery in 2 to 5 working days', del];
      if (DE && C.hero) { C.hero.lead = 'Die passende Hilfe f\u00fcr Ihren Hund bei'; C.hero.words = ['juckender Haut', 'Lahmheit', 'Angst', 'Mundgeruch', 'Magenproblemen', 'R\u00fcckenschmerzen', 'steifen Gelenken', 'der Genesung']; }
      if (C.how && C.how[2]) C.how[2] = DE ? 'Kostenloser Versand ab £' + FREE : 'Free delivery over £' + FREE;
    }
    window.PDP_BASE = ROOT + '/products/';
    if (window.SHOP_ROUTES) {
      ['cart', 'search', 'account', 'login', 'logout'].forEach(function (k) { if (window.SHOP_ROUTES[k]) window.SHOP_ROUTES[k] = prefix(window.SHOP_ROUTES[k]); });
    }
  }

  /* ---------- 2. links and cart calls ---------- */
  function wireNetwork() {
    var of = window.fetch;
    if (of) {
      window.fetch = function (input, init) {
        if (typeof input === 'string' && /^\/(cart|products\/[^?#]+\.js|collections\/[^?#]*\.json|search|recommendations|browsing_context)/.test(input)) input = prefix(input);
        return of.call(this, input, init);
      };
    }
    var ox = window.XMLHttpRequest && XMLHttpRequest.prototype.open;
    if (ox) XMLHttpRequest.prototype.open = function (m, u) { var a = [].slice.call(arguments); if (typeof u === 'string' && /^\/(cart|search)/.test(u)) a[1] = prefix(u); return ox.apply(this, a); };
  }
  function fixLinks(root) {
    var list = (root.querySelectorAll ? root.querySelectorAll('a[href^="/"],form[action^="/"]') : []);
    [].forEach.call(list, function (e) {
      if (e.hasAttribute('data-market-choice')) return;   // the country switcher keeps its own links
      var attr = e.tagName === 'FORM' ? 'action' : 'href', v = e.getAttribute(attr), p = prefix(v);
      if (p !== v) e.setAttribute(attr, p);
    });
    if (root.nodeType === 1 && (root.tagName === 'A' || root.tagName === 'FORM') && !root.hasAttribute('data-market-choice')) {
      var at = root.tagName === 'FORM' ? 'action' : 'href', vv = root.getAttribute(at);
      if (vv && vv.charAt(0) === '/') { var pp = prefix(vv); if (pp !== vv) root.setAttribute(at, pp); }
    }
  }

  /* ---------- 3. text on the page ---------- */
  var ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  function fixNode(node) {
    if (node.nodeType === 3) {
      var p = node.parentNode;
      if (!p || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.nodeName)) return;
      var v = node.nodeValue, nv = fixText(v);
      if (nv !== v) node.nodeValue = nv;
      return;
    }
    if (node.nodeType !== 1 || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(node.nodeName)) return;
    var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null), t;
    var nodes = [];
    while ((t = w.nextNode())) nodes.push(t);
    nodes.forEach(fixNode);
    var els = [node].concat([].slice.call(node.querySelectorAll('[placeholder],[aria-label],[title],[alt]')));
    els.forEach(function (e) {
      ATTRS.forEach(function (a) {
        if (!e.getAttribute) return;
        var v = e.getAttribute(a);
        if (v) { var nv = fixText(v); if (nv !== v) e.setAttribute(a, nv); }
      });
    });
  }
  var queue = [], scheduled = false;
  function flush() {
    scheduled = false;
    var q = queue; queue = [];
    q.forEach(function (n) { if (n.isConnected !== false) { fixNode(n); if (n.nodeType === 1) fixLinks(n); } });
    fixTitle();
  }
  function fixTitle() {
    var t = document.title, nt = fixText(t.replace(/\.\s*Poorly Pet$/, '')) + (/\.\s*Poorly Pet$/.test(t) ? '. Poorly Pet' : '');
    if (nt !== t) document.title = nt;
  }
  function enqueue(n) { queue.push(n); if (!scheduled) { scheduled = true; (window.requestAnimationFrame || setTimeout)(flush); } }
  function wireDom() {
    document.documentElement.lang = DE ? 'de' : 'en-IE';
    enqueue(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') enqueue(m.target);
        else if (m.type === 'attributes') enqueue(m.target);
        else [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1 || n.nodeType === 3) enqueue(n); });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  /* ---------- entry points ---------- */
  window.PP_MARKET_ENGINE = {
    // after site-data.js: fix what depends on the address, set the delivery charge, switch the UK multi-buy offers off
    late: function () {
      var S = window.PPSITE;
      if (S) {
        if (S.currentCollection) {
          var oc = S.currentCollection, re = new RegExp('^' + ROOT.replace(/\//g, '\\/') + '\\/search\\/?$');
          S.currentCollection = function () { return re.test(location.pathname) ? 'search' : oc(); };
        }
        if (S.delivery) S.delivery.standard = SHIP;
        if (S.offers) S.offers.supplementCodes = null;
      }
      if (document.body) wireDom(); else document.addEventListener('DOMContentLoaded', wireDom);
    },
    // after offers.js: the 2 for 10% and 3 for 15% supplement offers are UK only
    afterOffers: function () {
      var o = window.PPOffers;
      if (o) window.PPOffers = { all: [], forProduct: function () { return []; }, badge: function () { return null; }, lines: function () { return []; }, test: o.test };
    },
    translate: translate, money: money, prefix: prefix
  };
  applyData(); wireNetwork();
})();
