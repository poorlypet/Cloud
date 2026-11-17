/* ============================================================
   Solar quote: address -> pin roof -> analyse -> suggestion -> results
   Live mode (googleApiKey set): Google satellite map + Solar API.
   Demo mode (no key): a sample roof so the flow can be clicked through.
   ============================================================ */
(function () {
  "use strict";

  var C = window.SOLAR_CONFIG;
  var LIVE = !!C.googleApiKey;
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var S = {
    postcode: "", address: null, centre: null,
    insights: null, panels: [], apiWatts: 400, segs: [], segOn: {},
    n: 8, usage: C.defaultUsageKwh, showUnused: false,
    pkg: (C.packages.filter(function (p) { return p.recommended; })[0] || C.packages[0]).id,
    ptype: C.panelTypes[0].id, scaf: true,
    calStart: 0, day: null, time: null, mode: "slot"
  };
  var gmap = null, polys = [], outline = null;

  /* ---------- helpers ---------- */
  function money(x) { return "£" + Math.round(x).toLocaleString("en-GB"); }
  function num(x) { return Math.round(x).toLocaleString("en-GB"); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function normPC(s) { s = (s || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); return s.length > 3 ? s.slice(0, -3) + " " + s.slice(-3) : s; }
  var PC_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/;
  function toast(msg) { var t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 3500); }
  function getJSON(url) {
    return fetch(url).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) {
        if (!r.ok) { var e = new Error((b.error && b.error.message) || ("HTTP " + r.status)); e.status = r.status; throw e; }
        return b;
      });
    });
  }
  function compass(deg) {
    var n = ["North", "North-east", "East", "South-east", "South", "South-west", "West", "North-west"];
    return n[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
  }
  function faceNote(deg) {
    var d = (((deg % 360) + 360) % 360);
    if (d >= 157.5 && d < 202.5) return "Best all-day generation";
    if (d >= 112.5 && d < 157.5) return "Great morning-to-midday generation";
    if (d >= 202.5 && d < 247.5) return "Great midday-to-evening generation";
    if (d >= 67.5 && d < 112.5) return "Good morning generation";
    if (d >= 247.5 && d < 292.5) return "Good evening generation";
    return "Low generation, not usually worth it";
  }

  /* ---------- Google loader ---------- */
  var gp = null;
  function google() {
    if (gp) return gp;
    gp = new Promise(function (res, rej) {
      window.__solarReady = function () { res(window.google); };
      var s = document.createElement("script");
      s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(C.googleApiKey) + "&libraries=geometry&loading=async&callback=__solarReady";
      s.async = true;
      s.onerror = function () { gp = null; rej(new Error("Maps failed to load")); };
      document.head.appendChild(s);
    });
    return gp;
  }

  /* ============================================================
     Views
     ============================================================ */
  var VIEWS = { address: "vAddress", pin: "vPin", analyse: "vAnalyse", suggest: "vSuggest" };
  function go(v) {
    var results = v === "results";
    $("split").hidden = results;
    $("results").hidden = !results;
    Object.keys(VIEWS).forEach(function (k) { $(VIEWS[k]).hidden = k !== v; });
    // the roof map lives on the right of the split screen, or in the summary card
    var holder = $("mapHolder");
    (results ? $("roofThumb") : $("visual")).appendChild(holder);
    holder.classList.toggle("on", v !== "address");
    $("cross").hidden = v !== "pin";
    $("mapTag").hidden = v !== "pin" && v !== "suggest";
    $("mapTag").textContent = !LIVE ? "Sample roof (demo mode)" : v === "pin" ? "Drag the map to move it" : "Panels shown on your roof";
    if (LIVE && gmap) setTimeout(fitRoof, 50);
    window.scrollTo(0, 0);
  }
  $$("[data-go]").forEach(function (b) { b.addEventListener("click", function () { go(b.dataset.go); if (b.dataset.go === "pin") startPin(); }); });

  /* ============================================================
     1. Address
     ============================================================ */
  $("postcode").addEventListener("input", function () { $("drop").hidden = true; $("pcErr").textContent = ""; });

  $("pcForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var pc = normPC($("postcode").value);
    $("postcode").value = pc;
    $("pcErr").textContent = "";
    if (!PC_RE.test(pc)) { $("pcErr").textContent = "Enter a full UK postcode, for example SW1A 1AA."; return; }
    S.postcode = pc;
    var btn = this.querySelector("button"); btn.disabled = true;
    listAddresses(pc).then(function (list) {
      btn.disabled = false;
      $("drop").hidden = false;
      $("houseForm").hidden = !!list;
      $("addrList").innerHTML = (list || []).map(function (a, i) {
        return '<li><button type="button" data-i="' + i + '">' + esc(a.label) + "</button></li>";
      }).join("");
      S.list = list;
      if (!list) $("houseNo").focus();
    }).catch(function (err) {
      btn.disabled = false;
      console.error(err);
      $("pcErr").textContent = err.status === 404 || err.status === 400
        ? "We couldn't find that postcode. Check it and try again."
        : "We couldn't look up that postcode just now. Try again in a moment.";
    });
  });

  function listAddresses(pc) {
    if (C.idealPostcodesKey) {
      return getJSON("https://api.ideal-postcodes.co.uk/v1/postcodes/" + encodeURIComponent(pc) + "?api_key=" + encodeURIComponent(C.idealPostcodesKey))
        .then(function (r) {
          var l = (r.result || []).map(function (a) {
            return { label: [a.line_1, a.line_2, a.post_town, a.postcode].filter(Boolean).join(", "), lat: a.latitude, lng: a.longitude };
          });
          if (!l.length) { var e = new Error("none"); e.status = 404; throw e; }
          return l;
        });
    }
    if (LIVE) return Promise.resolve(null);   // customer types their house number
    var l = [];
    for (var i = 1; i <= 24; i++) l.push({ label: i + " Sample Road, " + pc, lat: 0, lng: 0 });
    return Promise.resolve(l);
  }

  $("addrList").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var a = S.list[+b.dataset.i];
    S.address = a; S.centre = { lat: a.lat, lng: a.lng };
    $("drop").hidden = true;
    go("pin"); startPin();
  });

  $("houseForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var h = $("houseNo").value.trim();
    if (!h) { $("pcErr").textContent = "Enter your house number or name."; return; }
    google().then(function (g) {
      return new g.maps.Geocoder().geocode({ address: h + ", " + S.postcode, componentRestrictions: { country: "GB", postalCode: S.postcode } });
    }).then(function (r) {
      var x = r.results && r.results[0];
      if (!x) throw new Error("not found");
      S.address = { label: h + ", " + S.postcode };
      S.centre = { lat: x.geometry.location.lat(), lng: x.geometry.location.lng() };
      $("drop").hidden = true;
      go("pin"); startPin();
    }).catch(function () { $("pcErr").textContent = "We couldn't find that address. Check the house number and postcode."; });
  });

  /* ============================================================
     2. Pin the roof
     ============================================================ */
  function startPin() {
    $("pinErr").textContent = "";
    S.showUnused = false;
    if (!LIVE) { drawDemo(); paint("none"); return; }
    google().then(function (g) {
      if (!gmap) {
        gmap = new g.maps.Map($("map"), {
          center: S.centre, zoom: 20, mapTypeId: "satellite", tilt: 0,
          disableDefaultUI: true, zoomControl: true, gestureHandling: "greedy", keyboardShortcuts: false
        });
      } else { gmap.setCenter(S.centre); gmap.setZoom(20); }
      clearLive();
    });
  }

  $("pinDone").addEventListener("click", function () {
    if (LIVE && gmap) { var c = gmap.getCenter(); S.centre = { lat: c.lat(), lng: c.lng() }; }
    analyse();
  });

  /* ============================================================
     3. Analyse
     ============================================================ */
  function analyse() {
    go("analyse");
    var li = $$("#checks li");
    li.forEach(function (x) { x.className = ""; });
    li[0].className = "run";
    var fetchRoof = LIVE ? solarApi(S.centre.lat, S.centre.lng) : Promise.resolve(demoInsights());
    Promise.all([fetchRoof, wait(900)]).then(function (r) {
      useInsights(r[0]);
      li[0].className = "done"; li[1].className = "run";
      drawRoof(); paint("outline");
      return wait(800);
    }).then(function () {
      li[1].className = "done"; li[2].className = "run";
      recommend(); paint();
      return wait(800);
    }).then(function () {
      li[2].className = "done";
      return wait(250);
    }).then(function () { renderSuggest(); go("suggest"); })
      .catch(function (err) {
        console.error(err);
        go("pin");
        $("pinErr").textContent = err.status === 404
          ? "We don't have satellite data for this roof yet. Call us on " + C.phone + " and we'll measure it for you."
          : "We couldn't measure that roof. Move the dot onto the middle of your roof and try again.";
      });
  }

  function solarApi(lat, lng) {
    return Promise.all([
      getJSON("https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=" + lat +
        "&location.longitude=" + lng + "&requiredQuality=MEDIUM&key=" + encodeURIComponent(C.googleApiKey)),
      google()
    ]).then(function (r) { return r[0]; });
  }

  function useInsights(ins) {
    var sp = ins.solarPotential || {};
    S.insights = ins;
    S.panels = sp.solarPanels || [];
    S.apiWatts = sp.panelCapacityWatts || 400;
    if (!S.panels.length) { var e = new Error("no panels"); e.status = 404; throw e; }
    // roof spaces that can hold panels, best first
    var by = {};
    S.panels.forEach(function (p, i) {
      var s = by[p.segmentIndex] || (by[p.segmentIndex] = { index: p.segmentIndex, count: 0, energy: 0, first: i });
      s.count++; s.energy += p.yearlyEnergyDcKwh || 0;
    });
    S.segs = Object.keys(by).map(function (k) {
      var s = by[k], st = (sp.roofSegmentStats || [])[s.index] || {};
      s.azimuth = st.azimuthDegrees || 0;
      s.perPanel = s.energy / s.count;
      return s;
    }).filter(function (s) { return s.count >= 2; })
      .sort(function (a, b) { return b.perPanel - a.perPanel; });
    S.segOn = {};
    S.segs.forEach(function (s) {
      var d = ((s.azimuth % 360) + 360) % 360;
      S.segOn[s.index] = d >= 67.5 && d <= 292.5;
    });
    if (S.segs.length && !S.segs.some(function (s) { return S.segOn[s.index]; })) S.segOn[S.segs[0].index] = true;
  }

  /* ---------- which panels are used ---------- */
  function eligible() {
    var out = [];
    S.panels.forEach(function (p, i) { if (S.segOn[p.segmentIndex]) out.push(i); });
    return out;
  }
  function chosen() { return eligible().slice(0, S.n); }
  function maxN() { return Math.min(C.maxPanels, eligible().length); }
  function minN() { return Math.min(C.minPanels, maxN()); }
  function kwhFor(idx) {
    var dc = 0;
    idx.forEach(function (i) { dc += S.panels[i].yearlyEnergyDcKwh || 0; });
    return dc * (C.panelWatts / S.apiWatts) * C.dcToAc;
  }
  function recommend() {   // enough panels to cover yearly use, within roof limits
    var el = eligible(), gen = 0, n = 0;
    while (n < el.length && n < C.maxPanels && gen < S.usage) { gen = kwhFor(el.slice(0, n + 1)); n++; }
    S.n = Math.max(minN(), Math.min(n, maxN()));
  }

  /* ============================================================
     Drawing the roof
     ============================================================ */
  function drawRoof() { if (LIVE) drawLive(); else drawDemo(); }

  function clearLive() {
    polys.forEach(function (p) { p.setMap(null); }); polys = [];
    if (outline) { outline.setMap(null); outline = null; }
  }
  function fitRoof() {
    var bb = S.insights && S.insights.boundingBox, g = window.google;
    if (!bb || !gmap || !g) return;
    gmap.fitBounds(new g.maps.LatLngBounds({ lat: bb.sw.latitude, lng: bb.sw.longitude }, { lat: bb.ne.latitude, lng: bb.ne.longitude }), 40);
  }
  function drawLive() {
    var g = window.google, sp = S.insights.solarPotential, bb = S.insights.boundingBox;
    clearLive();
    if (bb) {
      var sw = { lat: bb.sw.latitude, lng: bb.sw.longitude }, ne = { lat: bb.ne.latitude, lng: bb.ne.longitude };
      outline = new g.maps.Polyline({
        map: gmap, clickable: false, strokeOpacity: 0,
        path: [sw, { lat: sw.lat, lng: ne.lng }, ne, { lat: ne.lat, lng: sw.lng }, sw],
        icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: "#ffffff", scale: 2 }, offset: "0", repeat: "12px" }],
        visible: false
      });
      fitRoof();
    }
    // each panel: a rectangle round its centre, turned to its roof face
    var w = sp.panelWidthMeters / 2, h = sp.panelHeightMeters / 2;
    var corners = [[w, h], [w, -h], [-w, -h], [-w, h]];
    polys = S.panels.map(function (p) {
      var c = new g.maps.LatLng(p.center.latitude, p.center.longitude);
      var az = ((sp.roofSegmentStats || [])[p.segmentIndex] || {}).azimuthDegrees || 0;
      var turn = p.orientation === "PORTRAIT" ? 90 : 0;
      return new g.maps.Polygon({
        map: gmap, clickable: false, visible: false, strokeWeight: 1,
        paths: corners.map(function (xy) {
          return g.maps.geometry.spherical.computeOffset(c, Math.hypot(xy[0], xy[1]), Math.atan2(xy[1], xy[0]) * 180 / Math.PI + turn + az);
        })
      });
    });
  }

  /* demo: a sample terrace seen from above */
  function demoInsights() {
    var panels = [];
    [[1, 308, 145, 420], [1, 336, 145, 419], [0, 238, 325, 236], [0, 266, 325, 230]].forEach(function (row) {
      for (var c = 0; c < 8; c++) {
        panels.push({ segmentIndex: row[0], x: 253.5 + c * 37, y: row[1], yearlyEnergyDcKwh: row[3] - Math.abs(c - 3.5) * 5 });
      }
    });
    panels.sort(function (a, b) { return b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh; });
    return {
      solarPotential: {
        solarPanels: panels, panelCapacityWatts: C.panelWatts,
        roofSegmentStats: [{ azimuthDegrees: 325 }, { azimuthDegrees: 145 }],
        wholeRoofStats: { areaMeters2: 84 }, maxSunshineHoursPerYear: 1210
      }
    };
  }
  function house(x, y, w, d, roof) {
    return '<rect x="' + (x + 5) + '" y="' + (y + 7) + '" width="' + w + '" height="' + d + '" fill="rgba(0,0,0,.22)"/>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + (d / 2) + '" fill="' + roof[0] + '"/>' +
      '<rect x="' + x + '" y="' + (y + d / 2) + '" width="' + w + '" height="' + (d / 2) + '" fill="' + roof[1] + '"/>' +
      '<line x1="' + x + '" y1="' + (y + d / 2) + '" x2="' + (x + w) + '" y2="' + (y + d / 2) + '" stroke="rgba(0,0,0,.25)" stroke-width="2"/>';
  }
  function drawDemo() {
    var roofs = [["#5E6168", "#787B82"], ["#6A5D57", "#86766E"], ["#55595F", "#6E7279"]];
    var s = '<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<rect x="-400" y="-400" width="1600" height="1400" fill="#8E9488"/>' +
      '<g transform="rotate(-35 400 300)">' +
      '<rect x="-600" y="398" width="2000" height="70" fill="#5B5F60"/>' +
      '<rect x="-600" y="132" width="2000" height="40" fill="#A9AA9F"/>' +
      '<rect x="-600" y="-160" width="2000" height="70" fill="#5B5F60"/>' +
      '<rect x="-600" y="380" width="2000" height="18" fill="#B9B9AE"/>';
    for (var r = -1; r <= 1; r++) for (var k = -3; k <= 3; k++) {
      if (r === 0 && k === 0) continue;
      var x = 250 + k * 316, y = 220 + r * 300;
      s += '<rect x="' + (x - 6) + '" y="' + (y + 168) + '" width="306" height="' + (r === 0 ? 0 : 50) + '" fill="#7F8B70"/>';
      s += house(x, y, 300, 160, roofs[(k + r + 9) % 3]);
    }
    s += '<rect x="244" y="388" width="312" height="10" fill="#7F8B70"/>' + house(250, 220, 300, 160, ["#62656C", "#7B7E85"]) +
      '<rect x="476" y="236" width="20" height="26" fill="#4C4F55"/>' +
      '<rect id="demoOutline" x="240" y="210" width="320" height="180" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="10 8" style="display:none"/>' +
      '<g id="demoPanels">' + S.panels.map(function (p, i) {
        return '<g data-i="' + i + '" style="display:none"><rect x="' + p.x + '" y="' + p.y + '" width="34" height="26" rx="1.5"/>' +
          '<path d="M' + (p.x + 17) + " " + p.y + "v26M" + p.x + " " + (p.y + 13) + 'h34" stroke-width=".8"/></g>';
      }).join("") + "</g></g></svg>";
    $("map").innerHTML = s;
  }

  /* paint: show outline / chosen panels / unused spaces on the map */
  function paint(stage) {
    var on = {};
    if (stage !== "none" && stage !== "outline") chosen().forEach(function (i) { on[i] = true; });
    var showOutline = stage !== "none";
    var unused = S.showUnused && stage !== "none" && stage !== "outline";
    if (LIVE) {
      if (outline) outline.setVisible(showOutline);
      polys.forEach(function (p, i) {
        var used = !!on[i];
        p.setOptions({
          visible: used || unused,
          fillColor: "#16181D", fillOpacity: used ? 0.95 : 0,
          strokeColor: "#ffffff", strokeOpacity: used ? 0.9 : 0.75, strokeWeight: used ? 1 : 1.2
        });
      });
    } else {
      var o = $("demoOutline"); if (o) o.style.display = showOutline ? "" : "none";
      $$("#demoPanels > g").forEach(function (g) {
        var used = !!on[+g.dataset.i];
        g.style.display = used || unused ? "" : "none";
        g.setAttribute("fill", used ? "#16181D" : "none");
        g.setAttribute("stroke", used ? "#4A505C" : "#fff");
        g.firstChild.setAttribute("stroke", "#fff");
        g.firstChild.setAttribute("stroke-width", used ? ".8" : "1.4");
        g.firstChild.setAttribute("stroke-dasharray", used ? "" : "4 3");
        g.lastChild.style.display = used ? "" : "none";
      });
    }
  }

  /* ============================================================
     4. Suggestion
     ============================================================ */
  function renderSuggest() {
    var ch = chosen(), perSeg = {};
    ch.forEach(function (i) { var s = S.panels[i].segmentIndex; perSeg[s] = (perSeg[s] || 0) + 1; });
    var usedSegs = Object.keys(perSeg).length;
    $("sugN").textContent = S.n + " panels";
    $("sugSeg").textContent = usedSegs + " of your roof space" + (S.segs.length === 1 ? "" : "s");
    $("usageBtn").textContent = "~" + num(S.usage) + " kWh";
    $("segs").innerHTML = S.segs.map(function (s) {
      var c = perSeg[s.index] || 0;
      return '<li><label><input type="checkbox" data-seg="' + s.index + '"' + (S.segOn[s.index] ? " checked" : "") + '><span class="box"></span>' +
        "<span><strong>" + compass(s.azimuth) + " &middot; " + (S.segOn[s.index] ? c + " panel" + (c === 1 ? "" : "s") : "fits " + s.count) + "</strong>" +
        "<small>" + faceNote(s.azimuth) + "</small></span></label></li>";
    }).join("");
    $("nOut").textContent = S.n;
    $("unusedBtn").textContent = S.showUnused ? "Hide unused roof space" : "Show unused roof space";
  }

  $("segs").addEventListener("change", function (e) {
    var i = e.target.dataset.seg; if (i == null) return;
    S.segOn[i] = e.target.checked;
    if (!eligible().length) { S.segOn[i] = true; e.target.checked = true; toast("Keep at least one roof space selected."); return; }
    recommend(); paint(); renderSuggest();
  });
  $("usageBtn").addEventListener("click", function () {
    $("usageForm").hidden = !$("usageForm").hidden;
    $("usageIn").value = S.usage; $("usageIn").focus();
  });
  $("usageForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = +$("usageIn").value;
    if (!(v >= 500 && v <= 20000)) { toast("Enter a yearly use between 500 and 20,000 kWh."); return; }
    S.usage = v; $("usageForm").hidden = true;
    recommend(); paint(); renderSuggest();
  });
  $("unusedBtn").addEventListener("click", function () { S.showUnused = !S.showUnused; paint(); renderSuggest(); });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-step]"); if (!b) return;
    var n = Math.max(minN(), Math.min(maxN(), S.n + +b.dataset.step));
    if (n === S.n) { toast(+b.dataset.step > 0 ? "That's the most panels your selected roof can take." : "That's the smallest system we install."); return; }
    S.n = n; paint(); renderSuggest(); renderResults();
  });
  $("toQuote").addEventListener("click", function () { go("results"); renderResults(); renderCal(); });
  $("backToRoof").addEventListener("click", function () { go("suggest"); renderSuggest(); });

  /* ============================================================
     5. Results: price and booking
     ============================================================ */
  function pkg() { return C.packages.filter(function (p) { return p.id === S.pkg; })[0] || C.packages[0]; }
  function ptype() { return C.panelTypes.filter(function (p) { return p.id === S.ptype; })[0] || C.panelTypes[0]; }

  function quote(pkgId, n) {
    var p = C.packages.filter(function (x) { return x.id === pkgId; })[0], t = ptype();
    n = n || S.n;
    var lines = [[n + " × " + t.name, n * t.pricePerPanel], ["Inverter, installation and certification", C.baseInstallPrice]];
    if (p.batteryPrice) lines.push([p.batteryKwh + " kWh battery", p.batteryPrice]);
    if (S.scaf) lines.push(["Scaffolding", C.scaffoldingPrice]);
    var total = lines.reduce(function (a, l) { return a + l[1]; }, 0);
    var kwh = kwhFor(chosen().slice(0, n));
    var self = Math.min(C.selfUseMax, C.selfUseNoBattery + p.batteryKwh * C.selfUsePerBatteryKwh);
    var save = kwh * self * C.electricityPrice + kwh * (1 - self) * C.exportPrice;
    var r = C.financeApr / 1200, m = C.financeMonths;
    var monthly = r ? total * r / (1 - Math.pow(1 + r, -m)) : total / m;
    return { lines: lines, total: total, kwh: kwh, save: save, payback: save ? total / save : 0, monthly: monthly };
  }

  function renderResults() {
    if ($("results").hidden) return;
    var q = quote(S.pkg), p = pkg(), kw = S.n * C.panelWatts / 1000;
    $("sSave").innerHTML = money(q.save) + "<small>/yr</small>";
    $("sPayback").textContent = "Pays back in ~" + q.payback.toFixed(1) + " years";
    $("sPriceLbl").textContent = "Rough cost (" + (S.scaf ? "inc." : "ex.") + " scaffolding)";
    $("sPrice").textContent = money(q.total);
    $("sMonthly").textContent = "or from " + money(q.monthly) + "/mo";
    $("scafPrice").textContent = "+" + money(C.scaffoldingPrice);
    $("pkgName").textContent = ptype().name + (p.batteryKwh ? " + " + p.batteryKwh + " kWh battery" : "");
    $("pkgSize").textContent = S.n + " panels (" + kw.toFixed(1) + " kW) · ~" + num(q.kwh) + " kWh a year";
    $("nOut2").textContent = S.n;
    $("batIcon").style.display = p.batteryKwh ? "" : "none";
    $("pkgs").innerHTML = C.packages.map(function (x) {
      var qq = quote(x.id);
      return '<label><input type="radio" name="pkg" value="' + x.id + '"' + (x.id === S.pkg ? " checked" : "") + '><span class="opt"><span><b>' + esc(x.name) + "</b>" +
        (x.recommended ? '<span class="tag">Recommended</span>' : "") + "<small>" + esc(x.note) + " · saves ~" + money(qq.save) + "/yr</small></span><em>" + money(qq.total) + "</em></span></label>";
    }).join("");
    $("ptypes").innerHTML = C.panelTypes.map(function (t) {
      return '<label><input type="radio" name="ptype" value="' + t.id + '"' + (t.id === S.ptype ? " checked" : "") + "><span>" + esc(t.name) + "<small>" + money(t.pricePerPanel) + " per panel</small></span></label>";
    }).join("");
    var sp = S.insights.solarPotential;
    $("roofLine").textContent = (S.address ? S.address.label + " · " : "") + num((sp.wholeRoofStats || {}).areaMeters2 || 0) + " m² roof";
    $("breakdown").innerHTML = q.lines.map(function (l) { return "<tr><td>" + esc(l[0]) + "</td><td>" + money(l[1]) + "</td></tr>"; }).join("") +
      "<tr><td>Total (0% VAT)</td><td>" + money(q.total) + "</td></tr>";
  }

  $("scaf").addEventListener("change", function () { S.scaf = this.checked; renderResults(); });
  $("changePkg").addEventListener("click", function () {
    var pick = $("pkgPick"); pick.hidden = !pick.hidden;
    this.textContent = pick.hidden ? "Change" : "Done";
  });
  document.addEventListener("change", function (e) {
    if (e.target.name === "pkg") { S.pkg = e.target.value; renderResults(); }
    if (e.target.name === "ptype") { S.ptype = e.target.value; renderResults(); }
  });

  /* ---------- calendar (test availability) ---------- */
  var DAYS = [];
  (function () {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 1; i <= 42; i++) {
      var x = new Date(d); x.setDate(d.getDate() + i);
      var open = C.callDays.indexOf(x.getDay()) > -1;
      var times = open ? C.callTimes.filter(function (t, k) { return (x.getDate() * 7 + k * 3 + x.getMonth()) % 5 !== 0 && (x.getDate() + k) % 4 !== 1; }) : [];
      DAYS.push({ date: x, times: times });
    }
  })();
  var DW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function renderCal() {
    var vis = DAYS.slice(S.calStart, S.calStart + 5), first = vis[0].date, last = vis[vis.length - 1].date;
    $("calMonth").textContent = MONTHS[first.getMonth()] + (last.getMonth() !== first.getMonth() ? " / " + MONTHS[last.getMonth()] : "") + " " + last.getFullYear();
    $("calPrev").disabled = S.calStart === 0;
    $("calNext").disabled = S.calStart + 5 >= DAYS.length;
    $("days").innerHTML = vis.map(function (d, k) {
      var i = S.calStart + k, n = d.times.length;
      var badge = n === 0 ? "Full" : n >= 3 ? "3+ slots" : n + " slot" + (n > 1 ? "s" : "");
      return '<button type="button" class="day' + (S.day === i ? " sel" : "") + '" data-day="' + i + '"' + (n ? "" : " disabled") + ">" +
        '<span class="dw">' + DW[d.date.getDay()] + '</span><span class="dn">' + d.date.getDate() + "</span>" +
        '<span class="slots' + (n && n < 3 ? " few" : "") + '">' + badge + "</span></button>";
    }).join("");
  }
  $("calPrev").addEventListener("click", function () { S.calStart = Math.max(0, S.calStart - 5); renderCal(); });
  $("calNext").addEventListener("click", function () { S.calStart = Math.min(DAYS.length - 5, S.calStart + 5); renderCal(); });
  $("days").addEventListener("click", function (e) {
    var b = e.target.closest("[data-day]"); if (!b) return;
    S.day = +b.dataset.day; S.time = null; S.mode = "slot";
    renderCal();
    $("timesWrap").hidden = false;
    $("contactForm").hidden = true;
    $("times").innerHTML = DAYS[S.day].times.map(function (t) { return '<button type="button" data-time="' + t + '">' + t + "</button>"; }).join("");
  });
  $("times").addEventListener("click", function (e) {
    var b = e.target.closest("[data-time]"); if (!b) return;
    S.time = b.dataset.time;
    $$("#times button").forEach(function (x) { x.classList.toggle("sel", x === b); });
    $("contactTitle").textContent = "Your details";
    $("bookBtn").textContent = "Confirm my call on " + dayLabel() + " at " + S.time;
    $("contactForm").hidden = false;
    $("cName").focus();
  });
  $("callbackBtn").addEventListener("click", function () {
    S.mode = "callback"; S.day = null; S.time = null;
    renderCal(); $("timesWrap").hidden = true;
    $("contactTitle").textContent = "Request a callback today";
    $("bookBtn").textContent = "Call me back";
    $("contactForm").hidden = false;
    $("cName").focus();
  });
  function dayLabel() { var d = DAYS[S.day].date; return DW[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()]; }

  $("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = this, err = $("bookErr");
    err.textContent = "";
    if (!f.checkValidity()) { err.textContent = "Add your name, phone number and a valid email."; return; }
    var q = quote(S.pkg);
    var data = {
      name: $("cName").value, phone: $("cPhone").value, email: $("cEmail").value,
      call: S.mode === "callback" ? "Callback today" : dayLabel() + " " + S.time,
      address: S.address && S.address.label, postcode: S.postcode,
      package: $("pkgName").textContent, panels: S.n, systemKw: (S.n * C.panelWatts / 1000).toFixed(2),
      scaffolding: S.scaf ? "Yes" : "No", roughCost: Math.round(q.total),
      yearlyKwh: Math.round(q.kwh), yearlySavings: Math.round(q.save)
    };
    var done = function () {
      $("bookFlow").hidden = true; $("booked").hidden = false;
      $("bookedText").textContent = S.mode === "callback"
        ? "We'll call you back today on " + data.phone + "."
        : "We'll call you on " + dayLabel() + " at " + S.time + " on " + data.phone + ". A confirmation is on its way to " + data.email + ".";
    };
    if (!C.leadEndpoint) { console.log("Booking (no leadEndpoint set):", data); done(); return; }
    var btn = $("bookBtn"); btn.disabled = true;
    fetch(C.leadEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
      .catch(function () { btn.disabled = false; err.textContent = "That didn't send. Call us on " + C.phone + " to book."; });
  });

  /* ---------- start ---------- */
  $$(".brand").forEach(function (b) { b.textContent = C.companyName; });
  $$(".phone-no").forEach(function (b) { b.textContent = C.phone; });
  $("installText").textContent = C.installText;
  if (C.heroPhoto) { $("photo").style.backgroundImage = "url(" + JSON.stringify(C.heroPhoto) + ")"; $("photo").classList.add("has-img"); }
  if (C.bookCallPhoto) { $("bookPhoto").style.backgroundImage = "url(" + JSON.stringify(C.bookCallPhoto) + ")"; $("bookPhoto").classList.add("has-img"); }
  if (LIVE) google().catch(function () {});
})();
