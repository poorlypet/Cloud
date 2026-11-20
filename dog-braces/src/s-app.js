/* Shared behaviour for versions 1 to 5: the body area / condition / symptom choice, product cards, shop menu, reviews. */
var APP = (function () {
  var $ = UI.$, $$ = UI.$$;
  var IMG = '{i:image}';

  /* The customer's choice. Any of the three can be set first; the others narrow to what still applies. */
  function Finder(onChange) {
    var s = { area: null, cond: null, syms: [] };
    function clean() {
      if (s.cond && s.area && BR.find(BR.conditions, s.cond).areas.indexOf(s.area) < 0) return false;
      var ok = BR.symptomsFor(s.area, s.cond).map(function (x) { return x.id; });
      s.syms = s.syms.filter(function (v) { return ok.indexOf(v) > -1; });
      return true;
    }
    var api = {
      s: s,
      area: function (id, keep) { s.area = (s.area === id && !keep) ? null : (id || null); if (!clean()) s.cond = null; clean(); onChange(api); },
      cond: function (id, keep) { s.cond = (s.cond === id && !keep) ? null : (id || null); if (!clean()) s.area = null; clean(); onChange(api); },
      sym: function (id) { var i = s.syms.indexOf(id); if (i > -1) s.syms.splice(i, 1); else s.syms.push(id); onChange(api); },
      oneSym: function (id) { s.syms = id ? [id] : []; onChange(api); },
      only: function (k, id) { s.area = null; s.cond = null; s.syms = []; if (k === 'sym') s.syms = [id]; else s[k] = id; onChange(api); },
      clear: function () { s.area = null; s.cond = null; s.syms = []; onChange(api); },
      any: function () { return !!(s.area || s.cond || s.syms.length); },
      res: function () { return BR.match(s); },
      conds: function () { return BR.conditionsFor(s.area); },
      symList: function () { return BR.symptomsFor(s.area, s.cond); },
      areaList: function () { return s.cond ? BR.areas.filter(function (a) { return BR.find(BR.conditions, s.cond).areas.indexOf(a.id) > -1; }) : BR.areas; },
      areaName: function () { return s.area ? BR.find(BR.areas, s.area).name : ''; },
      condName: function () { return s.cond ? BR.find(BR.conditions, s.cond).name : ''; }
    };
    return api;
  }

  function chips(k, list, s) {
    return '<div class="chs">' + list.map(function (o) {
      var on = k === 'sym' ? s.syms.indexOf(o.id) > -1 : s[k] === o.id;
      return '<button class="ch' + (on ? ' on' : '') + '" data-' + k + '="' + o.id + '" aria-pressed="' + on + '">' + o.name + '</button>';
    }).join('') + '</div>';
  }
  /* <option> list for a plain dropdown */
  function options(list, first, cur) {
    return '<option value="">' + first + '</option>' + list.map(function (o) { return '<option value="' + o.id + '"' + (cur === o.id ? ' selected' : '') + '>' + o.name + '</option>'; }).join('');
  }
  /* the choices made so far, each removable */
  function picked(f) {
    var x = [];
    if (f.s.area) x.push(['area', '', f.areaName()]);
    if (f.s.cond) x.push(['cond', '', f.condName()]);
    f.s.syms.forEach(function (v) { x.push(['sym', v, BR.find(BR.symptoms, v).name]); });
    return x.map(function (c) { return '<button class="x" data-rm="' + c[0] + '" data-v="' + c[1] + '" aria-label="Remove ' + c[2] + '">' + c[2] + '{i:close}</button>'; }).join('');
  }
  function unpick(f, d) { if (d.rm === 'sym') f.sym(d.v); else if (d.rm === 'area') f.area(null); else if (d.rm === 'cond') f.cond(null); }
  function note(r) {
    return r.likely.length ? '<p class="note">{i:info}<span>These signs are often seen with ' + BR.tidy(r.likely.join(', ')) + '. Your vet can confirm a diagnosis.</span></p>' : '';
  }
  var NONE = '<p class="note" style="grid-column:1/-1">{i:info}<span>Nothing matches that combination. Remove one of your choices, or contact us for advice.</span></p>';

  /* Product card. o.why = matched conditions, o.cls = extra classes, o.h = picture beside the text, o.label = show the level on the picture. */
  function card(p, i, o) {
    o = o || {};
    var sub = o.why ? '<b>Matches:</b> ' + BR.tidy(o.why.slice(0, 2).join(', ')) : (o.sub === 'uses' ? 'For ' + BR.tidy(BR.uses(p).slice(0, 2).join(', ')) : BR.areaText(p));
    var lab = o.label === false ? '' : '<span class="pd-l">' + p.sup + '</span>';
    var img = '<a class="pd-i" href="#" aria-label="' + p.name + '" data-cur="View">' + IMG + lab + '</a>';
    var body = '<h3><a href="#">' + p.name + '</a></h3><p class="pd-s">' + (o.label === false ? '<b>' + p.sup + '.</b> ' : '') + sub + '</p>' +
      '<div class="pd-f"><span class="pd-p">£00.00</span><a class="btn sm' + (o.btn ? ' ' + o.btn : '') + '" href="#">Select size</a></div>';
    return '<article class="pd' + (o.cls ? ' ' + o.cls : '') + (o.h ? ' h' : '') + '" style="--i:' + i + '">' + img + (o.h ? '<div class="pd-b">' + body + '</div>' : body) + '</article>';
  }
  function cards(items, o) {
    return items.length ? items.map(function (it, i) {
      var oo = {}; for (var k in (o || {})) oo[k] = o[k];
      if (it.why && (o || {}).showWhy) oo.why = it.why;
      return card(it.p || it, i, oo);
    }).join('') : NONE;
  }

  /* "Shop supports" menu: products by type, plus body areas. onArea(id) is called when a body area is chosen. */
  function menu(root, onArea) {
    var mm = $('.mm', root);
    mm.innerHTML = '<div class="mp" data-p="shop" hidden>' + BR.levels.map(function (l) {
      return '<div><h3>' + BR.typeName[l.type] + '</h3><small>' + l.sup + '</small><ul>' + BR.byType(l.type).map(function (p) { return '<li><a href="#range">' + p.name + '</a></li>'; }).join('') + '</ul></div>';
    }).join('') + '<div class="mp-b"><h3>By body area</h3><small>Choose where they need support</small><ul>' +
      BR.areas.map(function (a) { return '<li><button data-pa="' + a.id + '">' + a.name + '</button></li>'; }).join('') + '</ul></div></div>';
    UI.mega(root);
    mm.addEventListener('click', function (e) { var b = e.target.closest('[data-pa]'); if (b && onArea) onArea(b.dataset.pa); });
  }

  /* Product range with type tabs. o = { tabs, box, tx, card, after } */
  function range(o) {
    function draw(t) {
      o.box.innerHTML = cards(BR.byType(t).slice(0, o.limit || 99), o.card);
      if (o.tx) {
        var l = t && BR.levels.filter(function (x) { return x.type === t; })[0];
        o.tx.innerHTML = l ? '<b>' + BR.typeName[t] + ': ' + l.sup.toLowerCase() + '.</b> ' + l.d : 'Wraps give light support, braces firm support and splints rigid support. Choose a type to see what each is for.';
      }
      if (o.after) o.after();
    }
    UI.tabs(o.tabs, draw);
    draw('');
  }

  /* reviews that swap one at a time */
  function voices(box) {
    var qs = $$('blockquote', box), dots = $$('.dots i', box), i = 0, timer;
    function show(n) {
      i = (n + qs.length) % qs.length;
      qs.forEach(function (q, k) { q.classList.toggle('on', k === i); });
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      clearInterval(timer);
      if (!FX.calm) timer = setInterval(function () { show(i + 1); }, 6500);
    }
    $('[data-prev]', box).onclick = function () { show(i - 1); };
    $('[data-next]', box).onclick = function () { show(i + 1); };
    show(0);
  }

  /* mark the current page in the preview bar */
  function versionBar() {
    var here = location.pathname.split('/').pop();
    $$('.vs a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === here); });
  }
  return { Finder: Finder, chips: chips, options: options, picked: picked, unpick: unpick, note: note, card: card, cards: cards, menu: menu, range: range, voices: voices, versionBar: versionBar, NONE: NONE, IMG: IMG };
})();
