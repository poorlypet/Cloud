/* Two trial product-page layouts, chosen with ?pv=1 or ?pv=2 (remembered for the visit). Desktop only. */
(function () {
  var q = new URLSearchParams(location.search).get("pv");
  try { if (q) sessionStorage.setItem("ahpv", q); else q = sessionStorage.getItem("ahpv"); } catch (e) {}
  if (q === "0") { try { sessionStorage.removeItem("ahpv"); } catch (e) {} return; }
  if (q !== "1" && q !== "2") return;
  if (!matchMedia("(min-width:1081px)").matches) return;
  var P = document.querySelector(".p8"); if (!P) return;
  var top = P.querySelector(".gtop"), gv = P.querySelector(".gv"), zi = P.querySelector(".zi");
  P.classList.add("pv" + q);
  var $ = function (s, r) { return (r || P).querySelector(s); };
  var el = function (t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  var IM = [].map.call(P.querySelectorAll(".gg .gt img"), function (i) { return i.getAttribute("src"); }).filter(Boolean);
  var n = IM.length; if (!n) return;

  /* breadcrumb above everything; size guide links on the size line */
  var cr = $(".crumb"); if (cr) top.parentNode.insertBefore(cr, top), cr.classList.add("pv-crumb");
  var h1 = $("h1"); if (h1) h1.textContent = h1.textContent.replace(/-/g, "\u2011");
  var lr = $(".lrow"), sh = $(".szw-h"); if (lr && sh) sh.appendChild(lr);

  /* lightbox: open the theme's viewer on photo k */
  function zoom(k) { var lb = document.querySelector(".zlb"); if (!lb) return; lb.showModal(); var b = lb.querySelector('.lt button[data-i="' + k + '"]'); if (b) b.click(); }
  var CH = '<svg viewBox="0 0 10 18" aria-hidden="true"><path d="M9 1L1 9l8 8"/></svg>', CHR = '<svg viewBox="0 0 10 18" aria-hidden="true"><path d="M1 1l8 8-8 8"/></svg>';
  var EXP = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 7V2h5M13 2h5v5M18 13v5h-5M7 18H2v-5"/></svg>';
  var G = el("div", "pvg"), bar = el("div", "pv-bar"), cnt = el("span", "pv-cnt");
  var nav = el("div", "pv-nav", '<button type="button" class="pv-a" data-d="-1" aria-label="Previous photos">' + CH + '</button><button type="button" class="pv-a" data-d="1" aria-label="Next photos">' + CHR + '</button>');
  var i = 0, per = q === "1" ? 3 : 2, cells = [];
  for (var k = 0; k < per; k++) {
    var c = el("div", "pv-c pv-c" + k, '<img alt="" loading="eager">');
    if ((q === "1" && k === 0) || (q === "2" && k === 1)) c.appendChild(el("button", "pv-exp", EXP));
    cells.push(c); G.appendChild(c);
  }
  G.addEventListener("click", function (e) { var c = e.target.closest(".pv-c"); if (c) zoom((i + cells.indexOf(c)) % n); });
  var th;
  if (q === "2") {
    th = el("div", "pv-th");
    IM.forEach(function (s, k) { var b = el("button", "", '<img alt="" loading="lazy" src="' + s.replace(/width=\d+/, "width=200") + '">'); b.type = "button"; b.setAttribute("aria-label", "Show photo " + (k + 1)); b.onclick = function () { set(k); }; th.appendChild(b); });
    bar.appendChild(th);
  }
  bar.appendChild(q === "1" ? cnt : el("span", "pv-gap"));
  if (q === "2") nav.insertBefore(cnt, nav.firstChild);
  bar.appendChild(nav);
  function set(k) {
    i = ((k % n) + n) % n;
    cells.forEach(function (c, j) { c.querySelector("img").src = IM[(i + j) % n]; c.style.display = j < n ? "" : "none"; });
    cnt.textContent = q === "1" ? (i + 1) + "–" + Math.min(i + per, n) + " / " + n : (i + 1) + " / " + n;
    if (th) [].forEach.call(th.children, function (b, j) { b.classList.toggle("on", j === i); });
    if (th && th.children[i]) th.children[i].scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  nav.addEventListener("click", function (e) { var a = e.target.closest(".pv-a"); if (a) set(i + (+a.dataset.d) * (q === "1" ? per : 1)); });
  [].forEach.call(gv.children, function (c) { c.style.display = "none"; }); gv.appendChild(G); gv.appendChild(bar);
  set(0);

  /* version 2: rating beside the price, swatches beside the colour name, accordions instead of tabs */
  if (q === "2") {
    var pr = $(".prow"), price = $(".price"), rate = $(".rate");
    if (pr && price && rate) { var row = el("div", "pv-pr"); row.appendChild(price); row.appendChild(rate); pr.insertBefore(row, pr.firstChild); }
    var tw = $(".ztw"), tabs = tw && [].slice.call(tw.querySelectorAll(".ztabs [role=tab]")), pans = tw && [].slice.call(tw.querySelectorAll(".ztp"));
    if (tw && tabs.length === pans.length) {
      var acc = el("div", "pv-acc");
      tabs.forEach(function (t, k) {
        var d = el("details"), s = el("summary", "", '<span>' + t.textContent + '</span><i aria-hidden="true"></i>');
        d.appendChild(s); pans[k].hidden = false; pans[k].removeAttribute("hidden"); d.appendChild(pans[k]); acc.appendChild(d);
      });
      tw.parentNode.replaceChild(acc, tw);
    }
  }
})();
