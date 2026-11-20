/* Page behaviour shared by versions 1A and 1B: body area row and its panel, product cards, range tabs, menu, reviews. */
var PAGE = (function () {
  var $ = UI.$, $$ = UI.$$, id = function (x) { return document.getElementById(x); };

  /* Product card: picture standing off a backdrop, plain text underneath. o.cls = extra classes (e.g. "lt" for the light card). */
  function card(p, i, o) {
    o = o || {};
    var sub = o.why ? 'Matches ' + BR.tidy(o.why.slice(0, 2).join(', ')) : BR.areaText(p);
    return '<article class="pc' + (o.cls ? ' ' + o.cls : '') + '" data-tilt="30,18">' +
      '<a class="pc-a" href="#" aria-label="' + p.name + '" data-cur="View"><span class="pc-b"></span><span class="pc-s shot"><span class="ph">' + APP.IMG + '</span></span></a>' +
      '<div class="pc-t"><small>' + p.sup + '</small><h3><a href="#">' + p.name + '</a></h3><p>' + sub + '</p>' +
      '<div class="pc-f"><b>£00.00</b><a class="tl" href="#">Select size {i:arrow-right}</a></div></div></article>';
  }

  /* o = { card: extra card classes, voices: true when the reviews are a one-at-a-time slider } */
  function init(o) {
    o = o || {};
    var copt = { render: card, cls: o.card || '' }, tiles = id('tiles'), pn = id('pn'), rt, last = '';
    var EASE = 'cubic-bezier(.16,1,.3,1)';
    /* a short ease-in for things that have just been redrawn */
    function arrive(el, y, ms) { if (el && el.animate && !FX.calm) el.animate([{ opacity: 0, transform: 'translateY(' + y + 'px)' }, { opacity: 1, transform: 'none' }], { duration: ms, easing: EASE }); }
    var f = APP.Finder(draw);
    tiles.innerHTML = BR.areas.map(function (a) {
      return '<button class="tile" data-area="' + a.id + '" data-tilt="22,14" data-cur="Choose"><span class="tile-p"><span class="shot"><span class="ph">' + APP.IMG + '</span></span></span><b>' + a.s + '</b></button>';
    }).join('');

    /* the small pointer on the panel sits under the chosen picture */
    function notch() {
      var t = $('.tile.on', tiles); if (!t || pn.hidden) return;
      var r = t.getBoundingClientRect(), p = pn.getBoundingClientRect();
      pn.style.setProperty('--nx', Math.max(34, Math.min(p.width - 34, r.left + r.width / 2 - p.left)) + 'px');
    }
    function draw() {
      $$('.tile', tiles).forEach(function (t) { var on = t.dataset.area === f.s.area; t.classList.toggle('on', on); t.setAttribute('aria-pressed', on); });
      var opening = pn.hidden && f.any();
      pn.hidden = !f.any();
      if (f.any()) {
        var r = f.res(), a = f.s.area && BR.find(BR.areas, f.s.area), c = f.s.cond && BR.find(BR.conditions, f.s.cond);
        var key = r.items.map(function (it) { return it.p.id; }).join();
        pn.innerHTML = '<i class="pn-n"></i><div class="pn-g"><div class="pn-l">' +
          '<div class="lift pn-ph" data-tilt="18,12"><span class="shot"><span class="ph m">' + APP.IMG + '<span>Photo: ' + (a ? a.s.toLowerCase() : 'dog') + '</span></span></span></div>' +
          '<h3>' + (a ? a.name : c ? c.name : 'Your dog') + '</h3><p>' + (a ? a.note : c ? c.info : '') + '</p>' +
          '<button class="tl" data-clear="1">Start again</button></div><div class="pn-r">' +
          (a ? '' : '<div class="pn-row"><b>Where do they need support?</b>' + APP.chips('area', f.areaList(), f.s) + '</div>') +
          '<div class="pn-row"><b>Has a vet diagnosed a condition?</b>' + APP.chips('cond', f.conds(), f.s) +
            (a && c ? '<p class="note">{i:info}<span>' + c.info + '</span></p>' : '') + '</div>' +
          '<div class="pn-row"><b>What are you seeing?</b>' + APP.chips('sym', f.symList(), f.s) + (r.likely.length ? APP.note(r) : '') + '</div>' +
          '</div></div><div class="pn-o"><h4>Supports that <em>suit</em></h4><div class="grid" id="pn-g">' + APP.cards(r.items, copt) + '</div></div>';
        /* only fade the results when the list itself changes */
        if (opening) arrive(pn, 22, 700); else if (key !== last) arrive(id('pn-g'), 14, 520);
        last = key;
        notch();
      } else last = '';
      clearTimeout(rt); rt = setTimeout(FX.refresh, 350);
    }
    tiles.addEventListener('click', function (e) { var b = e.target.closest('.tile'); if (b) f.area(b.dataset.area); });
    tiles.addEventListener('scroll', notch, { passive: true });
    window.addEventListener('resize', notch);
    pn.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var d = b.dataset;
      if (d.clear) f.clear(); else if (d.area) f.area(d.area); else if (d.cond) f.cond(d.cond); else if (d.sym) f.sym(d.sym);
    });
    UI.rail(id('choose'));
    APP.menu(id('nv'), function (a) {
      f.only('area', a); FX.scrollTo(id('choose'));
      var t = $('.tile.on', tiles); if (t) tiles.scrollTo({ left: t.offsetLeft - tiles.clientWidth / 2 + t.offsetWidth / 2, behavior: 'smooth' });
    });

    var rr;
    APP.range({ tabs: id('rt'), box: id('rb'), tx: id('rx'), card: copt, after: function () { if (rr) { rr.update(); arrive(id('rb'), 16, 560); } } });
    rr = UI.rail(id('range'));
    if (o.voices) APP.voices(id('voi'));
    APP.versionBar();
    draw();
    FX.init();
  }
  return { init: init, card: card };
})();
