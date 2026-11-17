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
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function tween(el, to, fmt) {   // count a number up or down to its new value
    var from = +el.dataset.v || 0; el.dataset.v = to;
    if (REDUCE || from === to) { el.textContent = fmt(to); return; }
    var t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / 500), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e);
      if (k < 1 && +el.dataset.v === to) requestAnimationFrame(step);
    })(t0);
  }
  function sunRating(perPanel) {  // yearly output of one panel, scaled to a 400W panel
    var v = perPanel * 400 / (S.apiWatts || 400);
    return v >= 400 ? [5, "Excellent sun"] : v >= 350 ? [4, "Very good sun"] : v >= 300 ? [3, "Good sun"] : v >= 250 ? [2, "Fair sun"] : [1, "Limited sun"];
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
    $("scan").hidden = v !== "analyse";
    $("visTools").hidden = v !== "suggest";
    $("fluxBtn").hidden = !S.flux;
    $("fluxLegend").hidden = !(v === "suggest" && S.showFlux && S.flux);
    $("mapTag").hidden = !(v === "pin" || (!LIVE && v !== "address"));
    $("mapTag").textContent = !LIVE ? "Sample roof (demo mode)" : "Drag the map to line up your roof";
    if (LIVE && gmap) setTimeout(fitRoof, 50);
    if (S.img) setTimeout(function () { paint(S.stage); }, 30);
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
        }).catch(function (err) {
          // address list unavailable (for example no credit left): ask for the house number instead
          if (err.status === 404 || !LIVE) throw err;
          console.warn("Address list unavailable, asking for house number", err);
          return null;
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
    if (!LIVE) { go("pin"); startPin(); return; }
    // Google's rooftop point usually sits on the middle of the house;
    // the address list's point is often on the front edge.
    google().then(function (g) {
      return new g.maps.Geocoder().geocode({ address: a.label, componentRestrictions: { country: "GB" } });
    }).then(function (r) {
      var x = r.results && r.results[0];
      if (x && x.geometry.location_type === "ROOFTOP") S.centre = { lat: x.geometry.location.lat(), lng: x.geometry.location.lng() };
    }).catch(function () {}).then(function () { go("pin"); startPin(); });
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
    S.showUnused = true; S.showFlux = false; S.alongRange = null; S.aiMapped = false; S.img = null; S.flux = null; S.born = {}; showCanvas(false);
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
    var t = document.querySelector('input[name="htype"]:checked');
    if (!t) { $("pinErr").textContent = "Choose your type of house first."; return; }
    S.htype = t.value;
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
      drawRoof();
      return Promise.all([LIVE ? loadRoofImage().catch(function (e) { console.warn("Roof photo unavailable, using the map", e); S.img = null; }) : null, wait(800)]);
    }).then(function () {
      return LIVE && C.aiEndpoint && S.img ? aiMap().catch(function (e) { console.warn("AI mapping unavailable, using Google's roof outline", e); return null; }) : null;
    }).then(function (ai) {
      if (!applyAI(ai) && LIVE && regridFlat()) drawRoof();
      mapHouse();
      S.traceStart = performance.now();
      showCanvas(true); paint("outline");
      return wait(S.house ? 2300 : 500);
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
    S.rawPanels = S.panels;
    S.apiWatts = sp.panelCapacityWatts || 400;
    // Semis and terraces: Google measures the whole row as one building.
    // Keep only panels that fit fully inside a strip one house wide,
    // centred on the pin and running across the ridge.
    var width = C.houseWidths[S.htype] || 0;
    if (LIVE && S.centre) {
      var kLat = 111320, kLng = 111320 * Math.cos(S.centre.lat * Math.PI / 180);
      var off = function (p) { return { x: (p.center.longitude - S.centre.lng) * kLng, y: (p.center.latitude - S.centre.lat) * kLat }; };
      // the roof face nearest the pin sets which way the ridge runs
      var near = S.panels.slice().sort(function (a, b) { var A = off(a), B = off(b); return Math.hypot(A.x, A.y) - Math.hypot(B.x, B.y); })[0];
      var az = (((sp.roofSegmentStats || [])[near.segmentIndex] || {}).azimuthDegrees || 0) * Math.PI / 180;
      var fx = Math.sin(az), fy = Math.cos(az);          // unit vector down the slope (east, north)
      S.frame = { fx: fx, fy: fy, width: width };
    }
    // If Google measured just this one home (no roof side runs much longer than
    // one home is wide), keep all of it: there are no neighbours to cut off.
    if (LIVE && S.centre && width) {
      var amin = Infinity, amax = -Infinity;
      S.panels.forEach(function (p) { var o = off(p), a = -o.x * fy + o.y * fx; amin = Math.min(amin, a); amax = Math.max(amax, a); });
      if (amax - amin + 1.1 <= width + 1) { width = 0; S.frame.width = 0; }
    }
    if (LIVE && S.centre && width) {
      // Keep whole columns of panels only: the same number on every side of
      // the roof, centred on the pin, so one house gets a matching front and back.
      var dimAll = latticeDims(S.panels, sp), anchor = {};
      S.panels.forEach(function (p) {            // the panel nearest the pin on each face
        var o = off(p), d = Math.hypot(o.x, o.y), a = anchor[p.segmentIndex];
        if (!a || d < a.d) anchor[p.segmentIndex] = { d: d, o: o };
      });
      S.panels = S.panels.filter(function (p) {
        var o = off(p), dm = dimAll[p.segmentIndex], a = anchor[p.segmentIndex];
        if (Math.abs(o.x * fx + o.y * fy) > C.houseDepthMeters / 2) return false;   // up/down the roof
        if (Math.abs(-o.x * fy + o.y * fx) > width / 2) return false;              // centre inside this house
        var u = -o.x * dm.fy + o.y * dm.fx, u0 = -a.o.x * dm.fy + a.o.y * dm.fx;
        var cols = Math.max(1, Math.floor((width + 0.2) / dm.along));
        var start = Math.round(-u0 / dm.along - (cols - 1) / 2);
        var ci = Math.round((u - u0) / dm.along);
        return ci >= start && ci <= start + cols - 1;
      });
    }
    if (LIVE && S.centre && S.panels.length) { S.panels = tidyGrid(S.panels); S.dims = latticeDims(S.panels, sp); }
    if (!S.panels.length) { var e = new Error("no panels"); e.status = 404; throw e; }
    buildSegs(sp);
  }

  /* roof spaces that can hold panels, best first */
  function buildSegs(sp) {
    var by = {};
    S.panels.forEach(function (p, i) {
      var s = by[p.segmentIndex] || (by[p.segmentIndex] = { index: p.segmentIndex, count: 0, energy: 0, first: i });
      s.count++; s.energy += p.yearlyEnergyDcKwh || 0;
    });
    S.segs = Object.keys(by).map(function (k) {
      var s = by[k], st = (sp.roofSegmentStats || [])[s.index] || {};
      s.azimuth = st.azimuthDegrees || 0;
      s.flat = (st.pitchDegrees || 0) < C.flatRoofPitch;
      s.perPanel = s.energy / s.count;
      return s;
    }).filter(function (s) { return s.count >= 2; })
      .sort(function (a, b) { return b.perPanel - a.perPanel; });
    S.segOn = {};
    S.segs.forEach(function (s) {
      var d = ((s.azimuth % 360) + 360) % 360;
      S.segOn[s.index] = d >= 90 && d <= 270;   // east through south to west
    });
    if (S.segs.length && !S.segs.some(function (s) { return S.segOn[s.index]; })) S.segOn[S.segs[0].index] = true;
  }

  /* Google places every panel exactly on the roof, but ranks them by output,
     so the top few can be scattered. Keep Google's positions and pick panels
     from the middle of each roof face outwards, so any count is a tidy block. */
  function tidyGrid(panels) {
    var bySeg = {};
    panels.forEach(function (p) { (bySeg[p.segmentIndex] = bySeg[p.segmentIndex] || []).push(p); });
    var faces = Object.keys(bySeg).map(function (k) {
      var list = bySeg[k], la = 0, ln = 0, en = 0;
      if (list[0].path) {   // flat roof already laid out in rows
        return { avg: list.reduce(function (a, p) { return a + (p.yearlyEnergyDcKwh || 0); }, 0) / list.length, panels: list };
      }
      list.forEach(function (p) { la += p.center.latitude; ln += p.center.longitude; en += p.yearlyEnergyDcKwh || 0; });
      la /= list.length; ln /= list.length;
      var kLng = Math.cos(la * Math.PI / 180);
      var d = function (p) { var y = p.center.latitude - la, x = (p.center.longitude - ln) * kLng; return x * x + y * y; };
      return { avg: en / list.length, panels: list.slice().sort(function (p, q) { return d(p) - d(q); }) };
    });
    faces.sort(function (x, y) { return y.avg - x.avg; });
    return faces.reduce(function (all, f) { return all.concat(f.panels); }, []);
  }

  /* Panel size as drawn from above, per roof face, measured from Google's own
     spacing between neighbouring panels. A sloping panel looks shorter from
     above, so this keeps rows edge to edge with no overlap. */
  function latticeDims(panels, sp) {
    var dims = {}, bySeg = {};
    panels.forEach(function (p) { (bySeg[p.segmentIndex] = bySeg[p.segmentIndex] || []).push(p); });
    Object.keys(bySeg).forEach(function (k) {
      var st = (sp.roofSegmentStats || [])[k] || {}, list = bySeg[k];
      var az = (st.azimuthDegrees || 0) * Math.PI / 180, cp = Math.cos((st.pitchDegrees || 0) * Math.PI / 180);
      var fx = Math.sin(az), fy = Math.cos(az);
      var kx = 111320 * Math.cos(list[0].center.latitude * Math.PI / 180), ky = 111320;
      var A = Infinity, D = Infinity, n = Math.min(list.length, 80);
      for (var i = 0; i < n; i++) for (var j = i + 1; j < n; j++) {
        var dx = (list[j].center.longitude - list[i].center.longitude) * kx, dy = (list[j].center.latitude - list[i].center.latitude) * ky;
        var u = Math.abs(-dx * fy + dy * fx), v = Math.abs(dx * fx + dy * fy);
        if (v < 0.25 && u > 0.3) A = Math.min(A, u);
        if (u < 0.25 && v > 0.3) D = Math.min(D, v);
      }
      var W = sp.panelWidthMeters, H = sp.panelHeightMeters;
      var land = list.filter(function (p) { return p.orientation !== "PORTRAIT"; }).length * 2 >= list.length;
      if (A > 3 && D > 3) { A = land ? H : W; D = (land ? W : H) * cp; }
      else if (A > 3) A = Math.abs(D - W * cp) < Math.abs(D - H * cp) ? H : W;
      else if (D > 3) D = (Math.abs(A - W) < Math.abs(A - H) ? H : W) * cp;
      dims[k] = { along: A, down: D, fx: fx, fy: fy };
    });
    return dims;
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
    var g = window.google;
    if (!S.hull || !gmap || !g) return;
    var b = new g.maps.LatLngBounds();
    S.hull.forEach(function (pt) { b.extend(pt); });
    gmap.fitBounds(b, 80);
    // past zoom 21 the UK imagery turns soft, so stop there
    g.maps.event.addListenerOnce(gmap, "idle", function () { if (gmap.getZoom() > 21) gmap.setZoom(21); });
  }
  function drawLive() {
    var g = window.google, sp = S.insights.solarPotential;
    clearLive();
    // each panel: a rectangle round its centre, lined up with its roof face
    var kLat0 = 111320, kLng0 = 111320 * Math.cos(S.centre.lat * Math.PI / 180), gap = 0.96;
    var pts = [];
    S.paths = [];
    polys = S.panels.map(function (p) {
      if (p.path) {
        p.path.forEach(function (q) { pts.push(q); });
        S.paths.push(p.path);
        return new g.maps.Polygon({ map: gmap, clickable: false, visible: false, strokeWeight: 1, paths: p.path });
      }
      var d = S.dims[p.segmentIndex], a = d.along * gap / 2, v = d.down * gap / 2;
      var path = [[a, v], [a, -v], [-a, -v], [-a, v]].map(function (q) {
        var x = -d.fy * q[0] + d.fx * q[1], y = d.fx * q[0] + d.fy * q[1];
        var pt = { lat: p.center.latitude + y / kLat0, lng: p.center.longitude + x / kLng0 };
        pts.push(pt);
        return pt;
      });
      S.paths.push(path);
      return new g.maps.Polygon({ map: gmap, clickable: false, visible: false, strokeWeight: 1, paths: path });
    });
    // dashed outline: a rectangle squared up with the roof, round the panels
    var F = S.frame, kLat = 111320, kLng = 111320 * Math.cos(S.centre.lat * Math.PI / 180);
    var u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
    pts.forEach(function (q) {
      var x = (q.lng - S.centre.lng) * kLng, y = (q.lat - S.centre.lat) * kLat;
      var u = -x * F.fy + y * F.fx, v = x * F.fx + y * F.fy;
      u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
    });
    // hug the panels with a small margin; for semis and terraces never wider than one house
    var m = 0.75;
    u0 -= m; u1 += m; v0 -= m; v1 += m;
    if (F.width) { u0 = Math.max(u0, -F.width / 2); u1 = Math.min(u1, F.width / 2); }
    var corner = function (u, v) { var x = -F.fy * u + F.fx * v, y = F.fx * u + F.fy * v; return { lat: S.centre.lat + y / kLat, lng: S.centre.lng + x / kLng }; };
    S.hull = [corner(u0, v0), corner(u1, v0), corner(u1, v1), corner(u0, v1)];
    outline = new g.maps.Polyline({
      map: gmap, clickable: false, strokeOpacity: 0, visible: false,
      path: S.hull.concat([S.hull[0]]),
      icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, strokeColor: "#ffffff", scale: 2 }, offset: "0", repeat: "12px" }]
    });
    fitRoof();
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
        roofSegmentStats: [{ azimuthDegrees: 325, pitchDegrees: 35 }, { azimuthDegrees: 145, pitchDegrees: 35 }],
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

  /* ---------- Google's own roof photo ----------
     The Maps satellite layer is a different photo from the one Google measured
     the roof on, and can be a metre or two out. So once the roof is measured we
     show Google's measurement photo (a GeoTIFF) and draw the panels on that. */
  var libsP = null;
  function loadLibs() {
    if (libsP) return libsP;
    var add = function (src) {
      return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
    };
    libsP = Promise.all([
      add("https://cdn.jsdelivr.net/npm/geotiff@2.1.3/dist-browser/geotiff.js"),
      add("https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.11.0/proj4.js")
    ]).catch(function (e) { libsP = null; throw e; });
    return libsP;
  }
  function loadRoofImage() {
    var la = 0, ln = 0;
    S.panels.forEach(function (p) { la += p.center.latitude; ln += p.center.longitude; });
    la /= S.panels.length; ln /= S.panels.length;
    var url = "https://solar.googleapis.com/v1/dataLayers:get?location.latitude=" + la + "&location.longitude=" + ln +
      "&radiusMeters=" + C.roofPhotoRadiusMeters + "&view=IMAGERY_AND_ANNUAL_FLUX_LAYERS&requiredQuality=MEDIUM&pixelSizeMeters=0.1&key=" + encodeURIComponent(C.googleApiKey);
    var key = "&key=" + encodeURIComponent(C.googleApiKey);
    var tif = function (u) {
      return fetch(u + key).then(function (res) { if (!res.ok) throw new Error("photo " + res.status); return res.arrayBuffer(); })
        .then(function (buf) { return window.GeoTIFF.fromArrayBuffer(buf); })
        .then(function (t) { return t.getImage(); });
    };
    var layers;
    return Promise.all([loadLibs(), getJSON(url)]).then(function (r) {
      layers = r[1];
      // the roof outline map is only needed for flat roofs; a failure there is not fatal
      var band = function (u) {
        return tif(u).then(function (m) { return m.readRasters({ interleave: true }).then(function (d) { return { d: d, w: m.getWidth(), h: m.getHeight() }; }); }).catch(function () { return null; });
      };
      return Promise.all([tif(layers.rgbUrl), band(layers.maskUrl), layers.annualFluxUrl ? band(layers.annualFluxUrl) : null]);
    }).then(function (r) {
        var img = r[0]; S.mask = r[1]; S.flux = fluxCanvas(r[2], r[1]);
        return img.readRasters({ interleave: true }).then(function (px) {
          var w = img.getWidth(), h = img.getHeight(), n = img.getSamplesPerPixel();
          var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
          var ctx = cv.getContext("2d"), id = ctx.createImageData(w, h);
          for (var i = 0; i < w * h; i++) {
            id.data[i * 4] = px[i * n]; id.data[i * 4 + 1] = px[i * n + 1]; id.data[i * 4 + 2] = px[i * n + 2]; id.data[i * 4 + 3] = 255;
          }
          ctx.putImageData(id, 0, 0);
          var code = img.getGeoKeys().ProjectedCSTypeGeoKey;
          var proj = "+proj=utm +zone=" + (code % 100) + (Math.floor(code / 100) === 327 ? " +south" : "") + " +datum=WGS84 +units=m +no_defs";
          var bb = img.getBoundingBox();
          S.img = {
            canvas: cv, w: w, h: h,
            res: (bb[2] - bb[0]) / w,
            px: function (q) {
              var p = window.proj4("EPSG:4326", proj, [q.lng, q.lat]);
              return { x: (p[0] - bb[0]) / (bb[2] - bb[0]) * w, y: (bb[3] - p[1]) / (bb[3] - bb[1]) * h };
            },
            ll: function (x, y) {
              var p = window.proj4(proj, "EPSG:4326", [bb[0] + x / w * (bb[2] - bb[0]), bb[3] - y / h * (bb[3] - bb[1])]);
              return { lat: p[1], lng: p[0] };
            }
          };
        });
      });
  }
  /* Flat roofs: Google angles the panels to face due south, but UK installers
     line them up with the walls. Find which way the building runs from Google's
     roof outline map, then lay the panels in rows square to the walls and inside
     the roof edge. Google's figures still set how many and how much they make. */
  function regridFlat() {
    var I = S.img, M = S.mask, sp = S.insights.solarPotential, stats = sp.roofSegmentStats || [];
    if (!I || !M || M.w !== I.w || M.h !== I.h) return false;
    var flat = {};
    S.panels.forEach(function (p) { if (((stats[p.segmentIndex] || {}).pitchDegrees || 0) < C.flatRoofPitch) flat[p.segmentIndex] = true; });
    var keys = Object.keys(flat);
    if (!keys.length) return false;
    var W = M.w, H = M.h, md = M.d, res = I.res;
    var mk = function (x, y) { x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < W && y < H && md[y * W + x] > 0; };
    var out = S.panels.filter(function (p) { return !flat[p.segmentIndex]; });
    var allFlat = !out.length, axis = null;
    keys.forEach(function (k) {
      var mine = S.panels.filter(function (p) { return p.segmentIndex == k; });
      var energies = mine.map(function (p) { return p.yearlyEnergyDcKwh || 0; }).sort(function (a, b) { return b - a; });
      var bb = stats[k].boundingBox;
      if (!bb) { out = out.concat(mine); return; }
      var a = I.px({ lat: bb.sw.latitude, lng: bb.sw.longitude }), b = I.px({ lat: bb.ne.latitude, lng: bb.ne.longitude });
      var x0 = Math.max(1, Math.floor(Math.min(a.x, b.x) - 5)), x1 = Math.min(W - 2, Math.ceil(Math.max(a.x, b.x) + 5));
      var y0 = Math.max(1, Math.floor(Math.min(a.y, b.y) - 5)), y1 = Math.min(H - 2, Math.ceil(Math.max(a.y, b.y) + 5));
      var inR = function (x, y) { return x >= x0 && x <= x1 && y >= y0 && y <= y1 && mk(x, y); };
      // which way the walls run: the commonest edge direction in the roof outline
      var hist = new Array(90).fill(0), x, y;
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) {
        var gx = (mk(x + 1, y) ? 1 : 0) - (mk(x - 1, y) ? 1 : 0), gy = (mk(x, y + 1) ? 1 : 0) - (mk(x, y - 1) ? 1 : 0);
        if (gx || gy) hist[((Math.round(Math.atan2(gy, gx) * 180 / Math.PI) % 90) + 90) % 90]++;
      }
      var best = 0, bestV = -1;
      for (var i = 0; i < 90; i++) { var v = 0; for (var j = -2; j <= 2; j++) v += hist[(i + j + 90) % 90]; if (v > bestV) { bestV = v; best = i; } }
      var t = best * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
      axis = { fx: c, fy: -sn };   // a wall direction, as east/north
      var us = [], vs = [], su = 0, sv = 0;
      for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) if (inR(x, y)) { var u = x * c + y * sn, w = -x * sn + y * c; us.push(u); vs.push(w); su += u; sv += w; }
      if (!us.length) { out = out.concat(mine); return; }
      var cu = su / us.length, cv = sv / us.length;
      var umin = Math.min.apply(null, us), umax = Math.max.apply(null, us), vmin = Math.min.apply(null, vs), vmax = Math.max.apply(null, vs);
      var toXY = function (u, v) { return { x: u * c - v * sn, y: u * sn + v * c }; };
      var L = sp.panelHeightMeters / res, S2 = sp.panelWidthMeters / res, gap = 0.05 / res, mg = 0.25 / res;
      var bestCells = [], bw = 0, bh = 0;
      [[L, S2], [S2, L]].forEach(function (dim) {
        var pw = dim[0], ph = dim[1];
        for (var fu = 0; fu < 4; fu++) for (var fv = 0; fv < 4; fv++) {
          var cells = [];
          for (var u = umin + fu * (pw + gap) / 4; u < umax; u += pw + gap)
            for (var v = vmin + fv * (ph + gap) / 4; v < vmax; v += ph + gap) {
              var ok = true;
              [-pw / 2 - mg, 0, pw / 2 + mg].forEach(function (du) {
                [-ph / 2 - mg, 0, ph / 2 + mg].forEach(function (dv) { var q = toXY(u + du, v + dv); if (ok && !inR(q.x, q.y)) ok = false; });
              });
              if (ok) cells.push([u, v]);
            }
          if (cells.length > bestCells.length) { bestCells = cells; bw = pw; bh = ph; }
        }
      });
      if (!bestCells.length) { out = out.concat(mine); return; }
      // fill whole rows from the middle of the roof outwards
      var ri = function (p) { return Math.round((p[1] - vmin) / (bh + gap)); }, ci = function (p) { return Math.round((p[0] - umin) / (bw + gap)); };
      var rMid = bestCells.reduce(function (a, p) { return a + ri(p); }, 0) / bestCells.length;
      var cMid = bestCells.reduce(function (a, p) { return a + ci(p); }, 0) / bestCells.length;
      bestCells.sort(function (p, q) {
        return Math.abs(ri(p) - rMid) - Math.abs(ri(q) - rMid) || ri(p) - ri(q) || Math.abs(ci(p) - cMid) - Math.abs(ci(q) - cMid) || ci(p) - ci(q);
      });
      bestCells.slice(0, mine.length).forEach(function (cell, i) {
        var corner = function (du, dv) { var q = toXY(cell[0] + du * 0.96, cell[1] + dv * 0.96); return I.ll(q.x, q.y); };
        var ctr = toXY(cell[0], cell[1]), ll = I.ll(ctr.x, ctr.y);
        out.push({
          segmentIndex: +k, center: { latitude: ll.lat, longitude: ll.lng },
          path: [corner(bw / 2, bh / 2), corner(bw / 2, -bh / 2), corner(-bw / 2, -bh / 2), corner(-bw / 2, bh / 2)],
          yearlyEnergyDcKwh: energies[Math.min(i, energies.length - 1)]
        });
      });
    });
    S.panels = tidyGrid(out);
    buildSegs(sp);
    // square the dashed outline up with the walls too
    if (allFlat && axis && S.frame) { S.frame.fx = axis.fx; S.frame.fy = axis.fy; }
    return true;
  }
  /* Sunlight map: Google's yearly sunshine per square metre of roof, coloured
     from shade (purple) to full sun (pale yellow), on roofs only. */
  function fluxCanvas(F, M) {
    if (!F || !M || F.w !== M.w || F.h !== M.h) return null;
    var n = F.w * F.h, vals = [], i;
    for (i = 0; i < n; i += 7) if (M.d[i] > 0 && F.d[i] > 0) vals.push(F.d[i]);
    if (vals.length < 50) return null;
    vals.sort(function (a, b) { return a - b; });
    var lo = vals[Math.floor(vals.length * 0.03)], hi = vals[Math.floor(vals.length * 0.97)];
    var stops = [[59, 15, 112], [182, 54, 121], [248, 118, 92], [254, 194, 135], [255, 247, 184]];
    var cv = document.createElement("canvas"); cv.width = F.w; cv.height = F.h;
    var ctx = cv.getContext("2d"), id = ctx.createImageData(F.w, F.h);
    for (i = 0; i < n; i++) {
      if (!(M.d[i] > 0) || !(F.d[i] > 0)) continue;
      var t = Math.max(0, Math.min(1, (F.d[i] - lo) / (hi - lo))) * (stops.length - 1);
      var k = Math.min(stops.length - 2, Math.floor(t)), f = t - k, a = stops[k], b = stops[k + 1];
      id.data[i * 4] = a[0] + (b[0] - a[0]) * f; id.data[i * 4 + 1] = a[1] + (b[1] - a[1]) * f;
      id.data[i * 4 + 2] = a[2] + (b[2] - a[2]) * f; id.data[i * 4 + 3] = 215;
    }
    ctx.putImageData(id, 0, 0);
    return cv;
  }
  /* ---------- AI mapping ----------
     Send Claude a crop of Google's roof photo with the home marked and a pixel
     grid, and get back the outline of this home's roof and its property
     boundary. Panels are then kept only inside the home's own roof. */
  function aiMap() {
    if (S.htype === "detached" || !S.frame || !S.frame.width) return Promise.resolve(null);   // nothing to split
    var I = S.img, F = S.frame, pc = I.px(S.centre);
    var K = 0.025 / I.res, M = C.aiRowMeters, W = Math.round(M / 0.025), H = Math.round(W * 2 / 3);
    var theta = Math.atan2(-F.fx, -F.fy);   // direction along the row, in photo pixels
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    ctx.fillStyle = "#333"; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 / K, 1 / K); ctx.rotate(-theta); ctx.translate(-pc.x, -pc.y);
    ctx.imageSmoothingQuality = "high"; ctx.drawImage(I.canvas, 0, 0); ctx.restore();
    var step = 1 / 0.025, n = 0;
    ctx.strokeStyle = "#00E5FF"; ctx.lineWidth = 2; ctx.font = "bold 18px Arial"; ctx.textAlign = "center";
    for (var x = 0; x < W; x += step) {
      n++;
      ctx.beginPath(); ctx.moveTo(x + 1, 30); ctx.lineTo(x + 1, H - 30); ctx.stroke();
      ctx.lineWidth = 4; ctx.strokeStyle = "#000"; ctx.strokeText(String(n), x + 1, 20); ctx.strokeText(String(n), x + 1, H - 8);
      ctx.fillStyle = "#FFEB3B"; ctx.fillText(String(n), x + 1, 20); ctx.fillText(String(n), x + 1, H - 8);
      ctx.lineWidth = 2; ctx.strokeStyle = "#00E5FF";
    }
    ctx.beginPath(); ctx.arc(W / 2, H / 2, 9, 0, Math.PI * 2); ctx.fillStyle = "#FF2828"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.stroke();
    var image = cv.toDataURL("image/jpeg", 0.9).split(",")[1];
    var ctrl = new AbortController(), timer = setTimeout(function () { ctrl.abort(); }, C.aiTimeoutMs);
    return fetch(C.aiEndpoint, {
      method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: image, metres: M, lines: n, homeType: S.htype })
    }).then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error("AI " + r.status); return r.json(); })
      .then(function (out) {
        // line k sits (k - 1) metres from the left edge; the pin is in the middle
        var a0 = Math.min(out.leftLine, out.rightLine) - 1 - M / 2, a1 = Math.max(out.leftLine, out.rightLine) - 1 - M / 2;
        return { joined: out.joined, along: [a0, a1], confidence: out.confidence };
      });
  }
  function inPoly(x, y, P) {
    var inside = false;
    for (var i = 0, j = P.length - 1; i < P.length; j = i++) {
      if (((P[i][1] > y) !== (P[j][1] > y)) && (x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) inside = !inside;
    }
    return inside;
  }
  function applyAI(ai) {
    if (!ai) return false;
    // Only called when Google's roof runs on past one home, so "not joined" can't be right
    if (ai.joined === "none") return false;
    var w = ai.along[1] - ai.along[0];
    if (!(w >= 3.5 && w <= 12) || ai.along[0] > 0.5 || ai.along[1] < -0.5) return false;   // not believable: keep the house-width rule
    S.alongRange = ai.along;
    var sp = S.insights.solarPotential, F = S.frame, kLat = 111320, kLng = 111320 * Math.cos(S.centre.lat * Math.PI / 180);
    var dims = latticeDims(S.rawPanels, sp);
    var keep = S.rawPanels.filter(function (p) {
      var e = (p.center.longitude - S.centre.lng) * kLng, n = (p.center.latitude - S.centre.lat) * kLat;
      var a = -e * F.fy + n * F.fx, c = e * F.fx + n * F.fy, d = dims[p.segmentIndex];
      var half = Math.abs(d.fx * F.fx + d.fy * F.fy) > 0.7 ? d.along / 2 : d.down / 2;   // panel's size along the row
      return a - half >= ai.along[0] - 0.15 && a + half <= ai.along[1] + 0.15 && Math.abs(c) <= C.houseDepthMeters / 2;
    });
    if (keep.length < 2) { S.alongRange = null; return false; }
    S.panels = tidyGrid(keep);
    S.dims = latticeDims(S.panels, sp);
    buildSegs(sp);
    if (regridFlat()) buildSegs(sp);
    drawRoof();
    S.aiMapped = true;
    return true;
  }

  /* Map the house: take Google's roof outline map (its own image recognition of
     roofs), keep the part that belongs to this house, trace its edge, and draw a
     dashed box round the property from front garden to back garden. */
  function mapHouse() {
    S.house = null; S.box = null;
    var I = S.img, M = S.mask, F = S.frame;
    if (!I || !M || !F || M.w !== I.w || M.h !== I.h) return;
    var W = M.w, H = M.h, md = M.d, res = I.res, width = F.width || 0;
    var pc = I.px(S.centre);
    var toFrame = function (x, y) {   // pixel -> metres along the ridge / across the roof, from the pin
      var e = (x - pc.x) * res, n = -(y - pc.y) * res;
      return { a: -e * F.fy + n * F.fx, c: e * F.fx + n * F.fy };
    };
    var ok = function (x, y) {
      if (x < 0 || y < 0 || x >= W || y >= H || !(md[y * W + x] > 0)) return false;
      var f = toFrame(x, y);
      if (S.alongRange) return f.a >= S.alongRange[0] && f.a <= S.alongRange[1] && Math.abs(f.c) <= C.houseDepthMeters / 2;
      if (!width) return Math.abs(f.a) <= C.detachedReachMeters && Math.abs(f.c) <= C.detachedReachMeters;
      return Math.abs(f.a) <= width / 2 && Math.abs(f.c) <= C.houseDepthMeters / 2;
    };
    // start from the roof pixel nearest the middle of this house's panels
    var la = 0, ln = 0;
    S.panels.forEach(function (p) { la += p.center.latitude; ln += p.center.longitude; });
    var seed = I.px({ lat: la / S.panels.length, lng: ln / S.panels.length });
    var sx = Math.round(seed.x), sy = Math.round(seed.y), found = false;
    for (var r = 0; r < 40 && !found; r++)
      for (var dy = -r; dy <= r && !found; dy++) for (var dx = -r; dx <= r && !found; dx++)
        if (ok(sx + dx, sy + dy)) { sx += dx; sy += dy; found = true; }
    if (!found) return;
    // flood fill this house's roof
    var comp = new Uint8Array(W * H), q = [sy * W + sx], n = 0;
    comp[q[0]] = 1;
    while (q.length && n < 400000) {
      var i = q.pop(), x = i % W, y = (i - x) / W; n++;
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
        var X = x + d[0], Y = y + d[1], j = Y * W + X;
        if (ok(X, Y) && !comp[j]) { comp[j] = 1; q.push(j); }
      });
    }
    if (n < 200) return;
    // trace the edge (Moore neighbour tracing), then smooth it
    var start = 0; while (!comp[start]) start++;
    var D = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    var at = function (x, y) { return x >= 0 && y >= 0 && x < W && y < H && comp[y * W + x]; };
    var cx = start % W, cy = (start - cx) / W, dir = 0, pts = [[cx, cy]];
    for (var step = 0; step < 200000; step++) {
      var moved = false;
      for (var k = 0; k < 8; k++) {
        var d = (dir + 6 + k) % 8, nx = cx + D[d][0], ny = cy + D[d][1];
        if (at(nx, ny)) { cx = nx; cy = ny; dir = d; moved = true; break; }
      }
      if (!moved || (cx === pts[0][0] && cy === pts[0][1])) break;
      pts.push([cx, cy]);
    }
    var simp = function (P, eps) {   // Douglas-Peucker
      if (P.length < 3) return P;
      var a = P[0], b = P[P.length - 1], best = 0, bi = 0, L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      for (var i = 1; i < P.length - 1; i++) {
        var dd = Math.abs((b[0] - a[0]) * (a[1] - P[i][1]) - (a[0] - P[i][0]) * (b[1] - a[1])) / L;
        if (dd > best) { best = dd; bi = i; }
      }
      if (best <= eps) return [a, b];
      return simp(P.slice(0, bi + 1), eps).slice(0, -1).concat(simp(P.slice(bi), eps));
    };
    var half = Math.floor(pts.length / 2);
    S.house = simp(pts.slice(0, half + 1), 1.2).slice(0, -1).concat(simp(pts.slice(half).concat([pts[0]]), 1.2));
    // property box: the house's extent, out past the front and back gardens
    var a0 = Infinity, a1 = -Infinity, c0 = Infinity, c1 = -Infinity;
    S.house.forEach(function (p) { var f = toFrame(p[0], p[1]); a0 = Math.min(a0, f.a); a1 = Math.max(a1, f.a); c0 = Math.min(c0, f.c); c1 = Math.max(c1, f.c); });
    if (S.alongRange) { a0 = S.alongRange[0] - 0.3; a1 = S.alongRange[1] + 0.3; }
    else if (width) { a0 = Math.max(a0, -width / 2) - 0.3; a1 = Math.min(a1, width / 2) + 0.3; } else { a0 -= 2.5; a1 += 2.5; }
    c0 -= C.gardenMeters; c1 += C.gardenMeters;
    var back = function (a, c) { var e = -F.fy * a + F.fx * c, nn = F.fx * a + F.fy * c; return [pc.x + e / res, pc.y - nn / res]; };
    S.box = [back(a0, c0), back(a1, c0), back(a1, c1), back(a0, c1)];
  }
  function showCanvas(on) {
    var cv = $("roofCanvas");
    cv.hidden = !(on && S.img);
  }
  function drawCanvas(on, unused, showOutline) {
    var cv = $("roofCanvas"), I = S.img;
    var W = cv.clientWidth || cv.parentNode.clientWidth, H = cv.clientHeight || cv.parentNode.clientHeight;
    if (!W || !H) return;
    var dpr = window.devicePixelRatio || 1;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // frame the roof outline with room around it, never showing past the photo's edge
    var hp = S.box ? S.box.map(function (p) { return { x: p[0], y: p[1] }; }) : S.hull.map(I.px);
    var x0 = Math.min.apply(null, hp.map(function (p) { return p.x; })), x1 = Math.max.apply(null, hp.map(function (p) { return p.x; }));
    var y0 = Math.min.apply(null, hp.map(function (p) { return p.y; })), y1 = Math.max.apply(null, hp.map(function (p) { return p.y; }));
    var sc = Math.min(W / ((x1 - x0) * (S.box ? 1.5 : 3.4)), H / ((y1 - y0) * (S.box ? 1.5 : 3.4)));
    sc = Math.max(sc, W / I.w, H / I.h);
    var ox = W / 2 - (x0 + x1) / 2 * sc, oy = H / 2 - (y0 + y1) / 2 * sc;
    ox = Math.min(0, Math.max(W - I.w * sc, ox)); oy = Math.min(0, Math.max(H - I.h * sc, oy));
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(I.canvas, ox, oy, I.w * sc, I.h * sc);
    if (S.showFlux && S.flux) ctx.drawImage(S.flux, ox, oy, I.w * sc, I.h * sc);
    var trace = function (path) {
      ctx.beginPath();
      path.forEach(function (q, k) { var p = I.px(q); var x = ox + p.x * sc, y = oy + p.y * sc; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
      ctx.closePath();
    };
    // every panel space on this house in yellow; chosen ones drop in one by one
    var anyUsed = Object.keys(on).length > 0, now = performance.now(), pending = false;
    ctx.setLineDash([]);
    S.paths.forEach(function (path, i) {
      var used = !!on[i];
      if (!used && !unused) return;
      trace(path);
      if (used) {
        var a = REDUCE ? 1 : Math.max(0, Math.min(1, (now - (S.born[i] || 0)) / 280));
        if (a < 1) pending = true;
        ctx.globalAlpha = a; ctx.fillStyle = "rgba(18,20,25,.95)"; ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.strokeStyle = "#F26727"; ctx.lineWidth = used ? 1.5 : 1.1; ctx.globalAlpha = used ? 1 : 0.85; ctx.stroke(); ctx.globalAlpha = 1;
    });
    var pxPath = function (P) {
      ctx.beginPath();
      P.forEach(function (p, k) { var x = ox + p[0] * sc, y = oy + p[1] * sc; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); });
    };
    if (showOutline && S.box) {   // dashed property box, always on once measured
      pxPath(S.box); ctx.closePath();
      ctx.setLineDash([9, 7]); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.2; ctx.stroke(); ctx.setLineDash([]);
    }
    if (showOutline && S.house && !anyUsed) {   // the house outline, traced as if scanned
      var prog = REDUCE ? 1 : Math.min(1, (now - (S.traceStart || 0)) / 1800);
      var m = Math.max(2, Math.round(S.house.length * prog));
      pxPath(S.house.slice(0, m).concat(prog >= 1 ? [S.house[0]] : []));
      ctx.shadowColor = "rgba(61,235,140,.8)"; ctx.shadowBlur = 10;
      ctx.strokeStyle = "#3DEB8C"; ctx.lineWidth = 2.5; ctx.lineJoin = "round"; ctx.stroke();
      ctx.shadowBlur = 0;
      if (prog < 1) pending = true;
    }
    if (pending) { cancelAnimationFrame(S.raf); S.raf = requestAnimationFrame(function () { drawCanvas(on, unused, showOutline); }); }
    if (showOutline && !anyUsed && !S.box) {
      trace(S.hull);
      ctx.setLineDash([8, 6]); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.font = "11px Inter, Arial, sans-serif"; ctx.fillStyle = "rgba(255,255,255,.8)"; ctx.textAlign = "right";
    ctx.fillText("Imagery \u00a9 Google", W - 10, H - 10);
  }
  window.addEventListener("resize", function () { if (S.img) paint(S.stage); });

  /* paint: show outline / chosen panels / unused spaces on the map */
  function paint(stage) {
    var on = {};
    if (stage !== "none" && stage !== "outline") chosen().forEach(function (i) { on[i] = true; });
    var showOutline = stage !== "none";
    var unused = S.showUnused && stage !== "none" && stage !== "outline";
    S.stage = stage;
    // remember when each chosen panel first appeared, so new ones animate in
    var t0 = performance.now(), k = 0;
    S.born = S.born || {};
    Object.keys(S.born).forEach(function (i) { if (!on[i]) delete S.born[i]; });
    Object.keys(on).forEach(function (i) { if (S.born[i] == null) S.born[i] = t0 + (k++) * 55; });
    if (LIVE && S.img) {
      if (outline) outline.setVisible(false);
      polys.forEach(function (p) { p.setVisible(false); });
      drawCanvas(on, unused, showOutline);
    } else if (LIVE) {
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
  function roofName(s) { return s.flat ? "Flat roof" : compass(s.azimuth) + " roof"; }
  function renderSuggest() {
    var ch = chosen(), perSeg = {};
    ch.forEach(function (i) { var s = S.panels[i].segmentIndex; perSeg[s] = (perSeg[s] || 0) + 1; });
    var used = S.segs.filter(function (s) { return perSeg[s.index]; });
    var names = used.map(function (s) { return roofName(s).toLowerCase(); });
    $("sugN").textContent = S.n + " panels";
    $("sugLine").textContent = "On your " + (names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0] || "roof") +
      ", making about " + num(kwhFor(ch)) + " kWh a year.";
    $("usageBtn").textContent = "~" + num(S.usage) + " kWh";
    $("segs").innerHTML = S.segs.map(function (s) {
      var c = perSeg[s.index] || 0, on = !!S.segOn[s.index];
      return '<li><label class="' + (on ? "on" : "") + '"><input type="checkbox" data-seg="' + s.index + '"' + (on ? " checked" : "") + ">" +
        '<span class="compass' + (s.flat ? " flat" : "") + '"><i style="transform:rotate(' + (s.flat ? 0 : Math.round(s.azimuth)) + 'deg)"></i></span>' +
        '<span class="seg-text"><strong>' + roofName(s) + " &middot; " + (on ? c + " panel" + (c === 1 ? "" : "s") : "room for " + s.count) + "</strong>" +
        "<small>" + (s.flat ? "Panels lined up with your walls" : faceNote(s.azimuth)) + "</small></span>" +
        '<span class="box"></span></label></li>';
    }).join("");
    $("nOut").textContent = S.n;
    $("unusedBtn").classList.toggle("on", S.showUnused); $("unusedBtn").setAttribute("aria-pressed", S.showUnused);
    $("fluxBtn").classList.toggle("on", !!S.showFlux); $("fluxBtn").setAttribute("aria-pressed", !!S.showFlux);
    $("fluxLegend").hidden = !(S.showFlux && S.flux);
  }

  $("fluxBtn").addEventListener("click", function () { S.showFlux = !S.showFlux; paint(); renderSuggest(); });

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
  $("toQuote").addEventListener("click", function () {
    go("results"); renderResults(); renderCal();
    var items = [
      "We're quoting for a <b>" + S.n + " panel solar system</b>, based on your electricity use",
      "Working out how solar will <b>change your bills</b>",
      "Calculating your prices with <b>0% VAT</b> and monthly payment options"
    ];
    $("ovList").innerHTML = items.map(function (t) { return "<li><span>" + t + "</span></li>"; }).join("");
    var ov = $("overlay"), li = $$("#ovList li");
    ov.hidden = false;
    li.forEach(function (x, i) {
      setTimeout(function () { x.classList.add("show"); }, REDUCE ? 0 : 150 + i * 650);
      setTimeout(function () { x.classList.add("done"); }, REDUCE ? 0 : 650 + i * 650);
    });
    setTimeout(function () { ov.classList.add("out"); }, REDUCE ? 600 : 2700);
    setTimeout(function () { ov.hidden = true; ov.classList.remove("out"); }, REDUCE ? 700 : 3050);
  });
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
    // share of the solar power used in the home; a battery raises it
    var self = Math.min(C.selfUseMax, C.selfUseNoBattery + p.batteryKwh * C.selfUsePerBatteryKwh);
    var used = Math.min(S.usage, kwh * self), exported = kwh - used;
    var billNow = S.usage * C.electricityPrice, billAfter = (S.usage - used) * C.electricityPrice, exportPay = exported * C.exportPrice;
    var save = billNow - billAfter + exportPay;
    var r = C.financeApr / 1200, m = C.financeMonths;
    var monthly = r ? total * r / (1 - Math.pow(1 + r, -m)) : total / m;
    return {
      lines: lines, total: total, kwh: kwh, save: save, payback: save ? total / save : 0, monthly: monthly,
      billNow: billNow, billAfter: billAfter, exportPay: exportPay, cut: billNow ? 1 - billAfter / billNow : 0,
      life: save * C.systemLifeYears - total
    };
  }

  function renderResults() {
    if ($("results").hidden) return;
    var q = quote(S.pkg), p = pkg(), kw = S.n * C.panelWatts / 1000, yrs = Math.round(C.financeMonths / 12);
    var pct = function (x) { return Math.round(x * 100) + "%"; };
    var years = function (x) { return x.toFixed(1) + " years"; };
    // summary band
    $("rN").textContent = S.n + " panels";
    $("pkgSize").textContent = "A " + kw.toFixed(1) + " kW system making about " + num(q.kwh) + " kWh a year. Priced as: " + p.name + ".";
    tween($("sSave"), Math.round(q.save), function (v) { return money(v) + "/yr"; });
    $("sPayback").textContent = "Pays back in about " + years(q.payback);
    $("sPriceLbl").textContent = "Rough cost (" + (S.scaf ? "with" : "without") + " scaffolding)";
    tween($("sPrice"), Math.round(q.total), money);
    $("sMonthly").textContent = "or from " + money(q.monthly) + " a month";
    $("rCut").textContent = pct(q.cut);
    $("rBills").textContent = money(q.billNow) + " a year now, about " + money(q.billAfter) + " after";
    $("nOut2").textContent = S.n;
    // package cards
    $("pkgs").innerHTML = C.packages.map(function (x) {
      var qq = quote(x.id), on = x.id === S.pkg;
      return '<label><input type="radio" name="pkg" value="' + x.id + '"' + (on ? " checked" : "") + '><div class="pk">' +
        '<span class="pk-tag' + (x.recommended ? " hot" : "") + '">' + esc(x.tag || "Lowest price") + "</span>" +
        "<div><b>" + esc(x.name) + "</b><small>" + esc(x.blurb || "") + "</small></div>" +
        "<div><strong>" + money(qq.total) + "</strong><em>or from " + money(qq.monthly) + " a month</em></div>" +
        "<ul><li><span>Saves about</span><i>" + money(qq.save) + " a year</i></li>" +
        "<li><span>Pays for itself in</span><i>" + years(qq.payback) + "</i></li>" +
        "<li><span>Bill cut by</span><i>" + pct(qq.cut) + "</i></li></ul>" +
        '<div class="pk-pick"><span>' + (on ? "Selected" : "Choose this") + "</span></div></div></label>";
    }).join("");
    // with / without scaffolding, both prices shown
    var keep = S.scaf; S.scaf = true; var tOn = quote(S.pkg).total; S.scaf = false; var tOff = quote(S.pkg).total; S.scaf = keep;
    $("scafSeg").innerHTML = [[1, "With scaffolding", tOn], [0, "Without scaffolding", tOff]].map(function (o) {
      return '<label><input type="radio" name="scafopt" value="' + o[0] + '"' + (!!o[0] === !!S.scaf ? " checked" : "") + "><span>" + o[1] + "<small>" + money(o[2]) + "</small></span></label>";
    }).join("");
    $("ptypes").innerHTML = C.panelTypes.map(function (t) {
      return '<label><input type="radio" name="ptype" value="' + t.id + '"' + (t.id === S.ptype ? " checked" : "") + "><span>" + esc(t.short || t.name) + "<small>" + money(t.pricePerPanel) + " a panel</small></span></label>";
    }).join("");
    // the numbers for the chosen package
    $("pkgName").textContent = p.name + " · " + (ptype().short || ptype().name);
    $("fTotalLbl").textContent = "Rough cost, " + (S.scaf ? "with" : "without") + " scaffolding";
    $("fTotal").textContent = money(q.total);
    $("fMonthly").textContent = money(q.monthly) + " a month";
    $("fMonthlyNote").textContent = "illustration over " + yrs + " years at " + C.financeApr + "% APR";
    $("fSave").textContent = money(q.save);
    $("fSaveNote").textContent = "including " + money(q.exportPay) + " for power you export";
    $("fPayback").textContent = years(q.payback);
    $("fLifeLbl").textContent = "Over " + C.systemLifeYears + " years";
    $("fLife").textContent = money(Math.max(0, q.life));
    $("fBill").textContent = money(q.billAfter) + " a year";
    $("fBillNote").textContent = "down from " + money(q.billNow) + " now";
    $("breakdown").innerHTML = q.lines.map(function (l) { return "<tr><td>" + esc(l[0]) + "</td><td>" + money(l[1]) + "</td></tr>"; }).join("") +
      "<tr><td>Total (0% VAT)</td><td>" + money(q.total) + "</td></tr>";
  }

  document.addEventListener("change", function (e) {
    if (e.target.name === "pkg") { S.pkg = e.target.value; renderResults(); }
    if (e.target.name === "ptype") { S.ptype = e.target.value; renderResults(); }
    if (e.target.name === "scafopt") { S.scaf = e.target.value === "1"; renderResults(); }
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
      package: $("pkgName").textContent, panelType: ptype().name, panels: S.n, systemKw: (S.n * C.panelWatts / 1000).toFixed(2),
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
  // the first screen plays a drone film; the photo sits behind it until the film loads
  if (C.heroPhoto) $("photo").style.backgroundImage = "url(" + JSON.stringify(C.heroPhoto) + ")";
  if (C.bookCallPhoto) { $("bookPhoto").style.backgroundImage = "url(" + JSON.stringify(C.bookCallPhoto) + ")"; $("bookPhoto").classList.add("has-img"); }
  if (LIVE) google().catch(function () {});
  // arriving from the website's postcode box: fill it in and start straight away
  var pcParam = new URLSearchParams(location.search).get("postcode");
  try { if (!pcParam) pcParam = sessionStorage.getItem("ms_postcode"); sessionStorage.removeItem("ms_postcode"); } catch (err) {}
  if (pcParam) { $("postcode").value = pcParam; setTimeout(function () { $("pcForm").requestSubmit(); }, 350); }
})();
