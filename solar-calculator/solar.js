/* ============================================================
   Solar quote calculator
   Step 1  postcode   -> check it is a real UK postcode
   Step 2  house      -> address list (Ideal Postcodes) or typed number
   Step 3  quote      -> Google Solar API finds the roof and the best
                         panel positions; we draw them on the satellite
                         map and price the system from config.js
   With no Google key the page runs in demo mode with a sample roof.
   ============================================================ */
(function () {
  "use strict";

  var C = window.SOLAR_CONFIG;
  var LIVE = !!C.googleApiKey;
  var $ = function (id) { return document.getElementById(id); };

  var state = {
    postcode: "", pcLatLng: null, addresses: [], address: null,
    insights: null, panels: [], apiPanelWatts: 400,
    n: C.defaultPanels, batteryId: C.batteries[0].id, scaffolding: true
  };
  var map = null, polygons = [];

  /* ---------- small helpers ---------- */
  function money(x) { return "£" + Math.round(x).toLocaleString("en-GB"); }
  function num(x) { return Math.round(x).toLocaleString("en-GB"); }
  function normalisePostcode(s) {
    s = (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    return s.length > 3 ? s.slice(0, -3) + " " + s.slice(-3) : s;
  }
  var PC_RE = /^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/;
  function loading(on, text) {
    $("loading").hidden = !on;
    if (text) $("loadingText").textContent = text;
  }
  function show(step) {
    [1, 2, 3].forEach(function (i) { $("step" + i).hidden = i !== step; });
    document.querySelectorAll(".steps li").forEach(function (li) {
      var s = +li.dataset.step;
      li.classList.toggle("on", s === step);
      li.classList.toggle("done", s < step);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function getJSON(url) {
    return fetch(url).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (!r.ok) { var e = new Error((body.error && body.error.message) || body.message || ("HTTP " + r.status)); e.status = r.status; throw e; }
        return body;
      });
    });
  }
  function compass(deg) {
    var names = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
    return names[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
  }

  /* ---------- Google Maps loader (live mode only) ---------- */
  var googlePromise = null;
  function loadGoogle() {
    if (googlePromise) return googlePromise;
    googlePromise = new Promise(function (resolve, reject) {
      window.__solarMapsReady = function () { resolve(window.google); };
      var s = document.createElement("script");
      s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(C.googleApiKey) +
        "&libraries=geometry&loading=async&callback=__solarMapsReady";
      s.async = true;
      s.onerror = function () { googlePromise = null; reject(new Error("Google Maps failed to load")); };
      document.head.appendChild(s);
    });
    return googlePromise;
  }

  /* ============================================================
     STEP 1: postcode
     ============================================================ */
  $("pcForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var pc = normalisePostcode($("postcode").value);
    $("postcode").value = pc;
    $("pcErr").textContent = "";
    if (!PC_RE.test(pc)) { $("pcErr").textContent = "Please enter a full UK postcode, for example SW1A 1AA."; return; }
    state.postcode = pc;
    loading(true, "Looking up your postcode…");
    findAddresses(pc).then(function () {
      loading(false);
      setupStep2();
      show(2);
    }).catch(function (err) {
      loading(false);
      $("pcErr").textContent = err.status === 404
        ? "We couldn't find that postcode. Please check it and try again."
        : "Sorry, something went wrong looking up your postcode. Please try again.";
      console.error(err);
    });
  });

  function findAddresses(pc) {
    state.addresses = [];
    if (C.idealPostcodesKey) {
      // Full list of addresses with coordinates for each one
      return getJSON("https://api.ideal-postcodes.co.uk/v1/postcodes/" + encodeURIComponent(pc) +
        "?api_key=" + encodeURIComponent(C.idealPostcodesKey)).then(function (res) {
        state.addresses = (res.result || []).map(function (a) {
          return {
            label: [a.line_1, a.line_2].filter(Boolean).join(", "),
            lat: a.latitude, lng: a.longitude
          };
        });
        if (!state.addresses.length) { var e = new Error("no addresses"); e.status = 404; throw e; }
      });
    }
    // Free postcode check (no key): confirms the postcode and gives its centre point
    return getJSON("https://api.postcodes.io/postcodes/" + encodeURIComponent(pc)).then(function (res) {
      state.pcLatLng = { lat: res.result.latitude, lng: res.result.longitude };
      if (!LIVE) {
        for (var i = 1; i <= 24; i++) state.addresses.push({ label: i + " Sample Road", lat: 0, lng: 0 });
      }
    });
  }

  /* ============================================================
     STEP 2: pick the house
     ============================================================ */
  function setupStep2() {
    $("pcShown").textContent = "Postcode " + state.postcode;
    $("addrErr").textContent = "";
    var useList = state.addresses.length > 0;
    $("addrListWrap").hidden = !useList;
    $("addrTypeWrap").hidden = useList;
    if (useList) {
      var sel = $("addrList");
      sel.innerHTML = '<option value="">Choose your address</option>' + state.addresses.map(function (a, i) {
        return '<option value="' + i + '">' + a.label.replace(/</g, "&lt;") + "</option>";
      }).join("");
      sel.focus();
    } else {
      $("houseNo").value = "";
      $("houseNo").focus();
    }
  }

  $("addrForm").addEventListener("submit", function (e) {
    e.preventDefault();
    $("addrErr").textContent = "";
    var p;
    if (state.addresses.length) {
      var i = $("addrList").value;
      if (i === "") { $("addrErr").textContent = "Please choose your address."; return; }
      var a = state.addresses[+i];
      state.address = { label: a.label + ", " + state.postcode, lat: a.lat, lng: a.lng };
      p = Promise.resolve();
    } else {
      var h = $("houseNo").value.trim();
      if (!h) { $("addrErr").textContent = "Please enter your house number or name."; return; }
      loading(true, "Finding your house…");
      p = geocode(h, state.postcode).then(function (loc) {
        state.address = { label: h + ", " + state.postcode, lat: loc.lat, lng: loc.lng };
      });
    }
    p.then(function () { return loadRoof(state.address.lat, state.address.lng); })
      .then(function () { loading(false); renderStep3(); show(3); })
      .catch(function (err) {
        loading(false);
        console.error(err);
        $("addrErr").textContent = err.status === 404
          ? "We don't have satellite roof data for this address yet. Call us on " + C.phone + " and we'll measure it for you."
          : "Sorry, we couldn't load your roof. Please try again, or call us on " + C.phone + ".";
      });
  });

  function geocode(house, pc) {
    return loadGoogle().then(function (g) {
      return new g.maps.Geocoder().geocode({
        address: house + ", " + pc,
        componentRestrictions: { country: "GB", postalCode: pc }
      });
    }).then(function (res) {
      var r = res.results && res.results[0];
      if (!r) { if (state.pcLatLng) return state.pcLatLng; throw new Error("address not found"); }
      return { lat: r.geometry.location.lat(), lng: r.geometry.location.lng() };
    });
  }

  /* ============================================================
     The roof: Google Solar API (live) or a sample roof (demo)
     ============================================================ */
  function loadRoof(lat, lng) {
    if (!LIVE) { useInsights(demoInsights()); return Promise.resolve(); }
    loading(true, "Measuring your roof…");
    var url = "https://solar.googleapis.com/v1/buildingInsights:findClosest" +
      "?location.latitude=" + lat + "&location.longitude=" + lng +
      "&requiredQuality=MEDIUM&key=" + encodeURIComponent(C.googleApiKey);
    return Promise.all([getJSON(url), loadGoogle()]).then(function (r) { useInsights(r[0]); });
  }

  function useInsights(ins) {
    var sp = ins.solarPotential || {};
    state.insights = ins;
    state.panels = sp.solarPanels || [];
    state.apiPanelWatts = sp.panelCapacityWatts || 400;
    if (!state.panels.length) { var e = new Error("no panels"); e.status = 404; throw e; }
  }

  /* ============================================================
     STEP 3: draw the roof and price the system
     ============================================================ */
  function renderStep3() {
    var ins = state.insights, sp = ins.solarPotential;
    $("addrTitle").textContent = state.address.label;

    // Slider limits: your min/max, capped at what fits on the roof
    var fit = state.panels.length;
    var max = Math.min(C.maxPanels, fit);
    var min = Math.min(C.minPanels, max);
    var sl = $("panels");
    sl.min = min; sl.max = max;
    state.n = Math.max(min, Math.min(state.n, max));
    sl.value = state.n;
    $("panelsNote").textContent = fit < C.maxPanels
      ? "Your roof fits up to " + fit + " panels."
      : "Your roof has room for " + fit + " panels.";

    // Roof facts
    var segs = (sp.roofSegmentStats || []).slice().sort(function (a, b) { return b.stats.areaMeters2 - a.stats.areaMeters2; });
    var facts = [
      ["Roof area", num((sp.wholeRoofStats || {}).areaMeters2 || 0) + " m²"],
      ["Panels that fit", num(fit)],
      ["Main roof faces", segs.length ? compass(segs[0].azimuthDegrees || 0) : "-"],
      ["Sunshine", num(sp.maxSunshineHoursPerYear || 0) + " hrs/yr"]
    ];
    if (ins.imageryDate) facts.push(["Imagery from", ins.imageryDate.month + "/" + ins.imageryDate.year]);
    $("facts").innerHTML = facts.map(function (f) { return "<li>" + f[0] + "<b>" + f[1] + "</b></li>"; }).join("");

    if (LIVE) drawLive(); else drawDemo();
    update();
  }

  function drawLive() {
    var g = window.google, sp = state.insights.solarPotential;
    var c = state.insights.center;
    polygons.forEach(function (p) { p.setMap(null); });
    if (!map) {
      map = new g.maps.Map($("map"), {
        center: { lat: c.latitude, lng: c.longitude }, zoom: 20,
        mapTypeId: "satellite", tilt: 0, disableDefaultUI: true, zoomControl: true,
        gestureHandling: "cooperative"
      });
      // Wrong building? Tap your roof to re-measure.
      map.addListener("click", function (ev) {
        loading(true, "Measuring that roof…");
        loadRoof(ev.latLng.lat(), ev.latLng.lng())
          .then(function () { loading(false); renderStep3(); })
          .catch(function () { loading(false); alert("We couldn't find roof data there. Try tapping the middle of your roof."); });
      });
    }
    var bb = state.insights.boundingBox;
    if (bb) {
      map.fitBounds(new g.maps.LatLngBounds(
        { lat: bb.sw.latitude, lng: bb.sw.longitude },
        { lat: bb.ne.latitude, lng: bb.ne.longitude }), 24);
    } else {
      map.setCenter({ lat: c.latitude, lng: c.longitude });
    }

    // Each panel: a rectangle around its centre, turned to face the
    // same way as its roof face (azimuth) and laid portrait or landscape.
    var w = sp.panelWidthMeters / 2, h = sp.panelHeightMeters / 2;
    var corners = [[w, h], [w, -h], [-w, -h], [-w, h]];
    polygons = state.panels.map(function (p) {
      var centre = new g.maps.LatLng(p.center.latitude, p.center.longitude);
      var az = (sp.roofSegmentStats[p.segmentIndex] || {}).azimuthDegrees || 0;
      var turn = p.orientation === "PORTRAIT" ? 90 : 0;
      var path = corners.map(function (xy) {
        return g.maps.geometry.spherical.computeOffset(centre, Math.hypot(xy[0], xy[1]),
          Math.atan2(xy[1], xy[0]) * 180 / Math.PI + turn + az);
      });
      return new g.maps.Polygon({
        paths: path, map: map, clickable: false, visible: false,
        strokeColor: "#C9D8F0", strokeOpacity: 0.9, strokeWeight: 1,
        fillColor: "#12305A", fillOpacity: 0.92
      });
    });
  }

  /* ---------- demo roof (no Google key) ---------- */
  function demoInsights() {
    var panels = [], rows = 3, cols = 8;
    // south face first (sunniest), filled from the middle row outward
    for (var r = 0; r < rows; r++) for (var col = 0; col < cols; col++) {
      panels.push({ x: col, y: r, yearlyEnergyDcKwh: 0 });
    }
    panels.sort(function (a, b) { return Math.abs(a.y - 1) - Math.abs(b.y - 1) || Math.abs(a.x - 3.5) - Math.abs(b.x - 3.5); });
    return {
      center: { latitude: 0, longitude: 0 },
      solarPotential: {
        solarPanels: panels, panelCapacityWatts: C.panelWatts,
        maxSunshineHoursPerYear: 1180,
        wholeRoofStats: { areaMeters2: 92 },
        roofSegmentStats: [{ azimuthDegrees: 180, stats: { areaMeters2: 46 } }, { azimuthDegrees: 0, stats: { areaMeters2: 46 } }]
      }
    };
  }

  function drawDemo() {
    var X0 = 70, Y0 = 70, W = 360, ridge = 150, Y1 = 250;   // house roof in svg units
    var pw = 40, ph = 28, gap = 3;
    var gx = X0 + (W - (8 * pw + 7 * gap)) / 2, gy = ridge + 8;
    var svg = '<svg viewBox="0 0 500 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sample roof with solar panels">' +
      '<rect width="500" height="340" fill="#4F6B3E"/>' +
      '<rect x="0" y="292" width="500" height="48" fill="#8A8F8C"/>' +
      '<rect x="0" y="286" width="500" height="6" fill="#B7BDB8"/>' +
      '<rect x="-60" y="96" width="110" height="160" fill="#6C4B3C"/><line x1="-60" y1="176" x2="50" y2="176" stroke="#4F362A" stroke-width="3"/>' +
      '<rect x="450" y="96" width="110" height="160" fill="#6C4B3C"/><line x1="450" y1="176" x2="560" y2="176" stroke="#4F362A" stroke-width="3"/>' +
      '<circle cx="455" cy="60" r="34" fill="#3D5A2F"/><circle cx="40" cy="300" r="0"/>' +
      '<rect x="' + (X0 + 6) + '" y="' + (Y0 + 8) + '" width="' + W + '" height="' + (Y1 - Y0) + '" fill="rgba(0,0,0,.25)"/>' +
      '<rect x="' + X0 + '" y="' + Y0 + '" width="' + W + '" height="' + (ridge - Y0) + '" fill="#6E4A39"/>' +
      '<rect x="' + X0 + '" y="' + ridge + '" width="' + W + '" height="' + (Y1 - ridge) + '" fill="#83584A"/>' +
      '<line x1="' + X0 + '" y1="' + ridge + '" x2="' + (X0 + W) + '" y2="' + ridge + '" stroke="#4A3127" stroke-width="4"/>' +
      '<rect x="' + (X0 + 290) + '" y="' + (Y0 + 18) + '" width="22" height="30" fill="#5B5F5C"/>' +
      '<text x="' + (X0 + W / 2) + '" y="' + (Y0 + 45) + '" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.55)" font-family="Figtree,Arial">North-facing</text>' +
      '<text x="' + (X0 + W / 2) + '" y="' + (Y1 + 26) + '" text-anchor="middle" font-size="12" fill="rgba(255,255,255,.8)" font-family="Figtree,Arial">South-facing (best for solar)</text>' +
      '<g id="demoPanels">' + state.panels.map(function (p, i) {
        var x = gx + p.x * (pw + gap), y = gy + p.y * (ph + gap);
        return '<g data-i="' + i + '"><rect x="' + x + '" y="' + y + '" width="' + pw + '" height="' + ph + '" rx="1.5" fill="#12305A" stroke="#C9D8F0" stroke-width="1"/>' +
          '<line x1="' + (x + pw / 2) + '" y1="' + y + '" x2="' + (x + pw / 2) + '" y2="' + (y + ph) + '" stroke="#2D4C7E" stroke-width=".8"/>' +
          '<line x1="' + x + '" y1="' + (y + ph / 2) + '" x2="' + (x + pw) + '" y2="' + (y + ph / 2) + '" stroke="#2D4C7E" stroke-width=".8"/></g>';
      }).join("") + "</g></svg>";
    $("map").innerHTML = svg;
    $("roofHint").textContent = "Demo mode: this is a sample roof. Add your Google key in config.js to see real roofs.";
  }

  /* ---------- the numbers ---------- */
  function battery(id) { return C.batteries.filter(function (b) { return b.id === id; })[0] || C.batteries[0]; }

  function generation(n) {   // kWh per year, at the plug
    if (!LIVE) return n * C.panelWatts / 1000 * C.demoYieldPerKw;
    var dc = 0;
    for (var i = 0; i < n && i < state.panels.length; i++) dc += state.panels[i].yearlyEnergyDcKwh || 0;
    return dc * (C.panelWatts / state.apiPanelWatts) * C.dcToAc;
  }

  function quote(n, batteryId, scaffolding) {
    var b = battery(batteryId);
    var lines = [
      [n + " × " + C.panelWatts + "W panels", n * C.pricePerPanel],
      ["Inverter, installation and certification", C.baseInstallPrice]
    ];
    if (scaffolding) lines.push(["Scaffolding", C.scaffoldingPrice]);
    if (b.price) lines.push([b.name, b.price]);
    var sub = lines.reduce(function (s, l) { return s + l[1]; }, 0);
    var total = sub * (1 + C.vatRate);
    var kwh = generation(n);
    var selfUse = Math.min(C.selfUseMax, C.selfUseNoBattery + b.kwh * C.selfUsePerBatteryKwh);
    var savings = kwh * selfUse * C.electricityPrice + kwh * (1 - selfUse) * C.exportPrice;
    return { lines: lines, total: total, kw: n * C.panelWatts / 1000, kwh: kwh, savings: savings, payback: savings > 0 ? total / savings : 0 };
  }

  function update() {
    var n = state.n, q = quote(n, state.batteryId, state.scaffolding);

    // panels on the roof
    if (LIVE) polygons.forEach(function (p, i) { p.setVisible(i < n); });
    else document.querySelectorAll("#demoPanels > g").forEach(function (el) { el.style.display = +el.dataset.i < n ? "" : "none"; });

    $("panelsOut").textContent = n + " panels";
    $("total").textContent = money(q.total);
    $("totalNote").textContent = (state.scaffolding ? "Includes scaffolding" : "No scaffolding") + " · " + battery(state.batteryId).name;
    $("kw").textContent = q.kw.toFixed(2) + " kW";
    $("kwh").textContent = num(q.kwh) + " kWh";
    $("save").textContent = money(q.savings);
    $("payback").textContent = q.payback ? q.payback.toFixed(1) + " years" : "-";
    $("breakdown").innerHTML = q.lines.map(function (l) { return "<tr><td>" + l[0] + "</td><td>" + money(l[1]) + "</td></tr>"; }).join("") +
      (C.vatRate ? "<tr><td>VAT</td><td>" + money(q.total - q.total / (1 + C.vatRate)) + "</td></tr>" : "") +
      "<tr><td>Total</td><td>" + money(q.total) + "</td></tr>";

    // comparison: every battery, with and without scaffolding
    $("cmpPanels").textContent = n;
    $("compare").innerHTML = "<thead><tr><th>Battery</th><th>With scaffolding</th><th>Without scaffolding</th></tr></thead><tbody>" +
      C.batteries.map(function (b) {
        return "<tr><th>" + b.name + "</th>" + [true, false].map(function (sc) {
          var qq = quote(n, b.id, sc);
          var sel = b.id === state.batteryId && sc === state.scaffolding;
          return '<td><button type="button" class="' + (sel ? "sel" : "") + '" data-b="' + b.id + '" data-s="' + (sc ? 1 : 0) + '">' +
            money(qq.total) + "<small>saves " + money(qq.savings) + "/yr</small></button></td>";
        }).join("") + "</tr>";
      }).join("") + "</tbody>";

    // keep the controls in step with the table
    document.querySelectorAll('input[name="bat"]').forEach(function (r) { r.checked = r.value === state.batteryId; });
    document.querySelectorAll('input[name="scaf"]').forEach(function (r) { r.checked = (r.value === "1") === state.scaffolding; });
  }

  /* ---------- controls ---------- */
  $("batteryOpts").innerHTML = C.batteries.map(function (b) {
    return '<label><input type="radio" name="bat" value="' + b.id + '"><span>' + b.name +
      (b.price ? "<small>+" + money(b.price) + "</small>" : "") + "</span></label>";
  }).join("");

  $("panels").addEventListener("input", function () { state.n = +this.value; update(); });
  document.addEventListener("change", function (e) {
    if (e.target.name === "bat") { state.batteryId = e.target.value; update(); }
    if (e.target.name === "scaf") { state.scaffolding = e.target.value === "1"; update(); }
  });
  $("compare").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    state.batteryId = b.dataset.b;
    state.scaffolding = b.dataset.s === "1";
    update();
  });
  document.querySelectorAll("[data-go]").forEach(function (b) {
    b.addEventListener("click", function () { show(+b.dataset.go); });
  });

  /* ---------- lead form ---------- */
  $("leadForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, err = $("leadErr");
    err.textContent = "";
    if (!f.checkValidity()) { err.textContent = "Please fill in your name, a valid email and your phone number."; return; }
    var q = quote(state.n, state.batteryId, state.scaffolding);
    var data = {
      name: f.name.value, email: f.email.value, phone: f.phone.value,
      address: state.address && state.address.label, panels: state.n,
      systemKw: q.kw.toFixed(2), battery: battery(state.batteryId).name,
      scaffolding: state.scaffolding ? "Yes" : "No",
      estimatedPrice: Math.round(q.total), yearlyKwh: Math.round(q.kwh), yearlySavings: Math.round(q.savings)
    };
    var done = function () { f.hidden = true; $("leadOk").hidden = false; };
    if (!C.leadEndpoint) { console.log("Lead (no leadEndpoint set):", data); done(); return; }
    var btn = f.querySelector("button"); btn.disabled = true;
    fetch(C.leadEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
      .catch(function () { btn.disabled = false; err.textContent = "Sorry, that didn't send. Please call us on " + C.phone + "."; });
  });

  /* ---------- start ---------- */
  $("brand").textContent = C.companyName;
  $("demoTag").hidden = LIVE;
  if (LIVE) loadGoogle().catch(function () {});
})();
