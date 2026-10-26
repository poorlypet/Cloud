/* Poorly Pet: dog / cat split. Core.
   Decides which pet the visitor is shopping for, exposes window.PET, draws the Dogs | Cats toggle,
   the bottom prompt, and swaps the few fixed "dog" words on the page when the site is in cat mode.
   Loads in <head>, before any site data. No dependencies. */
(function () {
  "use strict";
  var W = window, D = document;
  var KEY = "pp_pet", SRC = "pp_pet_src", SESS = "pp_pet_sess";
  var NEW_UNTIL = "2027-03-31"; /* the NEW badge on the toggle disappears after this date */
  var ctx = W.PP_CTX || {};

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} return null; }
  function ck(v) { try { D.cookie = KEY + "=" + v + ";path=/;max-age=31536000;SameSite=Lax"; } catch (e) {} }

  /* ---- which pet does a piece of text talk about? returns "cat", "dog", "both" ---- */
  function speciesOf(title, tags, type) {
    var all = [title || "", type || ""].concat(tags || []).join(" ").toLowerCase();
    var c = /(^|[^a-z])(cats?|kittens?|feline)([^a-z]|$)/.test(all);
    var d = /(^|[^a-z])(dogs?|pupp(y|ies)|canine)([^a-z]|$)/.test(all);
    return c && d ? "both" : c ? "cat" : "dog";
  }
  function explicit(text) { /* only says cat or dog when the words are really there */
    var all = String(text || "").toLowerCase();
    var c = /(^|[^a-z])(cats?|kittens?|feline)([^a-z]|$)/.test(all);
    var d = /(^|[^a-z])(dogs?|pupp(y|ies)|canine)([^a-z]|$)/.test(all);
    return c && d ? "both" : c ? "cat" : d ? "dog" : "";
  }

  /* ---- the rules, in order ---- */
  var q; try { q = new URLSearchParams(location.search); } catch (e) { q = { get: function () { return null; } }; }
  var stored = ls(KEY); if (stored !== "cat" && stored !== "dog") stored = null;
  var storedSrc = ls(SRC);
  var link = q.get("pet"); link = link === "cat" || link === "dog" ? link : "";
  var adText = ["utm_campaign", "utm_content", "utm_term", "utm_medium", "pet_ad"].map(function (k) { return q.get(k) || ""; }).join(" ");
  var ad = explicit(adText); ad = ad === "cat" || ad === "dog" ? ad : "";
  var page = "", tmpl = ctx.tmpl || "";
  if (tmpl === "product") page = speciesOf(ctx.title, ctx.tags, ctx.type);
  else if (tmpl === "collection" && /^cat(s)?-/.test(ctx.handle || "")) page = "cat";
  else if (tmpl === "collection" || tmpl === "article" || tmpl === "page") page = explicit([ctx.title, (ctx.tags || []).join(" ")].join(" "));
  if (page === "both") page = "";
  var pageBoth = tmpl === "product" && speciesOf(ctx.title, ctx.tags, ctx.type) === "both";

  var pet, rule;
  if (link) { pet = link; rule = "link"; }
  else if (ad) { pet = ad; rule = "ad"; }
  else if (page) { pet = page; rule = "page"; }
  else if (stored) { pet = stored; rule = "stored"; }
  else { pet = "dog"; rule = "default"; }
  /* a link or ad landing is a fresh signal, so it becomes the remembered pet; a plain product page only does when nothing is remembered yet */
  if (rule === "link" || rule === "ad") { ls(KEY, pet); ls(SRC, "auto"); ck(pet); }
  else if (rule === "page" && !stored) { ls(KEY, pet); ls(SRC, "auto"); ck(pet); }

  var firstView = !ss(SESS); ss(SESS, "1");
  var PET = W.PET = {
    pet: pet, rule: rule, stored: stored, isCat: pet === "cat", tmpl: tmpl, firstView: firstView,
    speciesOf: speciesOf, explicit: explicit, hrefs: {}, products: {},
    /* is this baked product shown in the current mode? cat-only products stay out of dog shelves, dog-only out of cat shelves */
    ok: function (p) {
      var s = p.sp || speciesOf(p.title, p.tags, p.productType);
      if (pet === "cat") return s !== "dog";
      return !p.cx;
    },
    /* advice guides: a guide is for cats, dogs or both. Untagged guides are dog guides, as they always have been. */
    guideOk: function (g) {
      var s = g.sp || explicit((g.title || "") + " " + (g.cat || "")) || "dog";
      if (s === "both") return true;
      return pet === "cat" ? s === "cat" : s !== "cat";
    },
    m: function (h) { var p = W.PP_BY_HANDLE && W.PP_BY_HANDLE[h]; return p ? (PET.ok(p) ? 1 : 0) : 1; },
    set: function (p, why) {
      ls(KEY, p); ls(SRC, why || "choice"); ck(p);
      var u = location.pathname + location.search.replace(/([?&])pet=[^&]*&?/, "$1").replace(/[?&]$/, "");
      if ((tmpl === "product" || tmpl === "collection") && page && page !== p) { location.href = "/"; return; }
      location.href = u;
    }
  };
  W.PETC = function (d, c) { return pet === "cat" ? c : d; };
  D.documentElement.setAttribute("data-pet", pet);
  D.documentElement.setAttribute("data-pet-rule", rule);

  /* ---- the toggle ---- */
  function showNew() { return new Date() <= new Date(NEW_UNTIL + "T23:59:59"); }
  function togHTML(cls) {
    return '<div class="pet-tog ' + cls + '" role="group" aria-label="Shopping for dogs or cats">' +
      '<button type="button" data-pet="dog" aria-pressed="' + (pet === "dog") + '" class="' + (pet === "dog" ? "on" : "") + '">Dogs</button>' +
      '<button type="button" data-pet="cat" aria-pressed="' + (pet === "cat") + '" class="' + (pet === "cat" ? "on" : "") + '">Cats</button>' +
      (showNew() ? '<span class="pet-new" aria-hidden="true">NEW</span>' : "") + "</div>";
  }
  function mount() {
    var wm = D.querySelector("#hdr .wm");
    if (wm && !D.querySelector(".pet-tog.dk")) {
      var left = D.createElement("div"); left.className = "pet-left";
      wm.parentNode.insertBefore(left, wm); left.appendChild(wm); left.insertAdjacentHTML("beforeend", togHTML("dk"));
    }
    var mh = D.getElementById("mhdr");
    if (mh && !D.querySelector(".pet-mbar")) mh.insertAdjacentHTML("afterend", '<div class="pet-mbar">' + togHTML("mb") + "</div>");
    var dr = D.querySelector("#drawer .dtop");
    if (dr && !D.querySelector(".pet-tog.dr")) dr.insertAdjacentHTML("afterend", '<div class="pet-drawer">' + togHTML("dr") + "</div>");
    D.querySelectorAll(".pet-tog button").forEach(function (b) {
      if (b._pp) return; b._pp = 1;
      b.addEventListener("click", function () { var p = b.getAttribute("data-pet"); if (p !== pet) PET.set(p, "choice"); });
    });
  }

  /* ---- the bottom prompt ---- */
  var NAME = { dog: "dogs", cat: "cats" };
  function pop(html, ms) {
    var el = D.getElementById("pet-pop");
    if (!el) { el = D.createElement("div"); el.id = "pet-pop"; el.setAttribute("role", "dialog"); el.setAttribute("aria-live", "polite"); D.body.appendChild(el); }
    el.innerHTML = html + '<button class="pp-x" type="button" aria-label="Close">&times;</button>';
    el.querySelector(".pp-x").onclick = hide;
    el.querySelectorAll("[data-pick]").forEach(function (b) { b.onclick = function () { PET.set(b.getAttribute("data-pick"), "choice"); }; });
    setTimeout(function () { el.classList.add("show"); }, 60);
    if (ms) setTimeout(hide, ms);
    function hide() { el.classList.remove("show"); }
  }
  function prompt() {
    var home = tmpl === "index";
    var other = pet === "cat" ? "dog" : "cat";
    if (ss("pp_pet_pop")) return;
    if (!stored && (home || pageBoth) && rule !== "link" && rule !== "ad") { /* rules 3 and 5: no clue, so ask */
      ss("pp_pet_pop", "1");
      setTimeout(function () {
        pop('<div class="pp-t"><b>Shopping for a dog or a cat?</b>We will show the right products and advice.</div><div class="pp-b"><button type="button" data-pick="dog">Dogs</button><button type="button" class="y" data-pick="cat">Cats</button></div>');
      }, 1500);
      return;
    }
    if (firstView && (rule === "link" || rule === "ad" || (rule === "page" && stored && stored !== pet))) { /* rules 1, 2 and 4 */
      ss("pp_pet_pop", "1");
      var why = rule === "ad" ? "the link you followed was for " + NAME[pet] : "this " + (tmpl === "product" ? "product" : "page") + " is for " + NAME[pet];
      setTimeout(function () {
        pop('<div class="pp-t"><b>Showing ' + NAME[pet] + '.</b>We have tuned the site for ' + NAME[pet] + ' because ' + why + '.</div><div class="pp-b"><button type="button" data-pick="' + other + '">Switch to ' + NAME[other] + '</button></div>', 9000);
      }, 900);
      return;
    }
    if (firstView && home && rule === "stored") { /* rule 6 */
      ss("pp_pet_pop", "1");
      setTimeout(function () {
        pop('<div class="pp-t"><b>Welcome back.</b>Showing ' + NAME[pet] + ', as you chose last time.</div><div class="pp-b"><button type="button" data-pick="' + other + '">Switch to ' + NAME[other] + '</button></div>', 7000);
      }, 900);
    }
  }

  /* ---- cat mode: swap the fixed dog wording ---- */
  var SKIP = "script,style,textarea,input,select,option,noscript,[data-pet-keep],.pet-tog,#pet-pop,a[href*='/products/'],.bg-card,.bg-body,.bg-hero h1";
  /* on a product page only the theme's own fixed labels are reworded; the product's own text is left exactly as written */
  var PDP_SCOPE = ".n2-dogs,.n2-dogline,[class*='n2-fit'],.n2-sg";
  function swapWord(m, w, suf) {
    var base = /^D/.test(w) ? (/^DOG/.test(w) && w.length > 1 && w === w.toUpperCase() ? "CAT" : "Cat") : "cat";
    return base + (suf || "");
  }
  function swapStr(t) {
    if (!/dog|pupp/i.test(t)) return t;
    var keep = [];
    /* phrases that already name both pets stay exactly as they are */
    t = t.replace(/\b(dogs?\s*(&|&amp;|and|or|\/)\s*cats?|cats?\s*(&|&amp;|and|or|\/)\s*dogs?)\b/gi, function (m) { keep.push(m); return "\u0001" + (keep.length - 1) + "\u0001"; });
    t = t.replace(/\b(dog)(s|['\u2019]s)?\b/gi, function (m, w, suf) { return swapWord(m, w, suf); })
         .replace(/\bpupp(y|ies)\b/gi, function (m, y) { return /^P/.test(m) ? (y === "y" ? "Kitten" : "Kittens") : (y === "y" ? "kitten" : "kittens"); });
    return t.replace(/\u0001(\d+)\u0001/g, function (m, i) { return keep[+i]; });
  }
  function swapIn(root) {
    var w = D.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) { if (/dog|pupp/i.test(n.nodeValue) && !(n.parentNode.closest && n.parentNode.closest(SKIP))) list.push(n); }
    list.forEach(function (t) { var v = swapStr(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; });
    root.querySelectorAll && root.querySelectorAll("[placeholder],[aria-label],[title]").forEach(function (e) {
      ["placeholder", "aria-label", "title"].forEach(function (a) { var v = e.getAttribute(a); if (v && /dog|pupp/i.test(v) && !e.closest(SKIP)) e.setAttribute(a, swapStr(v)); });
    });
  }
  PET.swap = swapStr;
  function swapScope() {
    if (tmpl === "product") D.querySelectorAll(PDP_SCOPE).forEach(function (e) { swapIn(e); });
    else swapIn(D.body);
  }
  var busy = false;
  function catWords() {
    if (pet !== "cat") return;
    swapScope();
    if (D.title && tmpl !== "product" && tmpl !== "article") D.title = swapStr(D.title);
    new MutationObserver(function (muts) {
      if (busy) return; busy = true;
      setTimeout(function () { busy = false; swapScope(); }, 60);
    }).observe(D.body, { childList: true, subtree: true, characterData: true });
  }

  function ready() { mount(); prompt(); catWords(); /* run again once the page scripts have drawn their parts */ setTimeout(function () { mount(); catWords && 0; }, 700); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", ready); else ready();
  W.addEventListener("load", function () { mount(); if (pet === "cat") swapScope(); });
})();
