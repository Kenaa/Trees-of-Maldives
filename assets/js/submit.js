/* ===========================================================================
   Submission form.

   Two paths, decided by whether CONFIG.submitEndpoint is filled in:
     1. Configured:     POST the record (photo included) to the form service.
     2. Not configured: hand the submitter a copyable summary and a
        pre-filled email. A record is never silently lost.
   =========================================================================== */
(function () {
  "use strict";

  var SPECIES = window.SPECIES_DATA.species;
  var t = function () { return window.i18n.t.apply(null, arguments); };
  var C = window.CONFIG;

  var WARDS   = ["henveiru", "galolhu", "maafannu", "machchangolhi", "villimale", "hulhumale"];
  var REASONS = ["road-widening", "construction", "storm", "disease", "safety",
               "maintenance", "powerlines", "unknown"];

  var form     = document.getElementById("tree-form");
  var errBox   = document.getElementById("errors");
  var errList  = document.getElementById("errors-list");
  var doneBox  = document.getElementById("done");
  var fallback = document.getElementById("fallback");

  var $ = function (id) { return document.getElementById(id); };

  /* --- selects ------------------------------------------------------------ */
  function fill(id, values, label) {
    var sel = $(id), prev = sel.value;
    sel.textContent = "";
    values.forEach(function (v) {
      var o = document.createElement("option");
      o.value = v; o.textContent = label(v);
      sel.appendChild(o);
    });
    if (prev) sel.value = prev;
  }

  var prevSpecies = "";

  function buildSelects() {
    fill("ward", WARDS, function (v) { return t("ward." + v); });
    fill("lostReason", REASONS, function (v) { return t("reason." + v); });
    /* Default to "not yet identified" rather than whatever sorts first, so a
       half-read form cannot file a confident guess. */
    fill("species", SPECIES.map(function (s) { return s.id; }), function (id) {
      var s = SPECIES.filter(function (x) { return x.id === id; })[0];
      var dvMode = window.i18n.current === "dv";
      var label = dvMode ? (s.dv || s.dvLatin || s.en) : s.en;
      if (s.sci !== "Unidentified") label += " \u00b7 " + s.sci;
      if (!dvMode && s.dvLatin) label += " (" + s.dvLatin + ")";
      return label;
    });
    if (!$("species").value || !prevSpecies) $("species").value = "unknown";
    prevSpecies = $("species").value;
    $("photo-hint").textContent = t("submit.photoHint", { mb: C.maxPhotoMb, max: C.maxPhotos });
  }

  /* --- errors ------------------------------------------------------------- */
  function clearErrors() {
    errBox.hidden = true;
    errList.textContent = "";
    ["photo", "place", "email", "consent", "people", "lat"].forEach(function (f) {
      var e = $(f + "-error");
      if (e) { e.hidden = true; e.textContent = ""; }
      var input = $(f);
      if (input) input.removeAttribute("aria-invalid");
    });
  }

  function showErrors(list) {
    errList.textContent = "";
    list.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + item.id;
      a.textContent = item.msg;
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        var target = $(item.id);
        if (target) { target.focus(); target.scrollIntoView({ block: "center" }); }
      });
      li.appendChild(a);
      errList.appendChild(li);

      var input = $(item.id);
      if (input) input.setAttribute("aria-invalid", "true");
      var slot = $(item.id + "-error");
      if (slot) {
        slot.textContent = item.msg;
        slot.hidden = false;
      }
    });
    errBox.hidden = false;
    errBox.focus();
    errBox.scrollIntoView({ block: "center" });
  }

  /* --- validation --------------------------------------------------------- */
  function validate() {
    var problems = [];

    var files = Array.prototype.slice.call($("photo").files);
    if (files.length > C.maxPhotos) {
      problems.push({ id: "photo", msg: t("err.photoCount", { n: files.length, max: C.maxPhotos }) });
    }
    files.forEach(function (f) {
      if (f.type && f.type.indexOf("image/") !== 0) {
        problems.push({ id: "photo", msg: t("err.photoType") });
      } else if (f.size > C.maxPhotoMb * 1024 * 1024) {
        problems.push({ id: "photo", msg: t("err.photoSize", {
          size: (f.size / 1048576).toFixed(1), mb: C.maxPhotoMb
        }) });
      }
    });

    if (!$("people").checked) {
      problems.push({ id: "people", msg: t("err.people") });
    }

    if (!$("place").value.trim()) {
      problems.push({ id: "place", msg: t("err.required", { field: t("submit.where") }) });
    }
    if (!validCoords()) {
      problems.push({ id: "lat", msg: t("err.coords") });
    }

    var email = $("email").value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      problems.push({ id: "email", msg: t("err.email") });
    }

    if (!$("consent").checked) {
      problems.push({ id: "consent", msg: t("err.consent") });
    }

    return problems;
  }

  /* --- the record --------------------------------------------------------- */
  function collect() {
    var kind = form.querySelector('input[name="kind"]:checked').value;
    var lat = $("lat").value.trim(), lng = $("lng").value.trim();
    var isEvent = kind === "lost" || kind === "cutback";

    return {
      kind: kind,
      species: $("species").value,
      place: $("place").value.trim(),
      ward: $("ward").value,
      lat: lat, lng: lng,
      privateLand: $("private").checked ? "yes" : "no",
      speciesOther: $("speciesOther").value.trim(),
      lostDate: isEvent ? $("lostDate").value.trim() : "",
      lostReason: isEvent ? $("lostReason").value : "",
      people: $("people").checked ? "yes" : "",
      notes: $("notes").value.trim(),
      name: $("name").value.trim(),
      email: $("email").value.trim(),
      photos: Array.prototype.slice.call($("photo").files),
      language: window.i18n.current,
      submitted: new Date().toISOString().slice(0, 10)
    };
  }

  /* Labels are written as questions for the form. In a plain-text summary a
     trailing question mark before a colon reads badly, so trim it. */
  function lbl(key) { return t(key).replace(/[?\u061F]\s*$/, ""); }

  function asText(r) {
    var sp = SPECIES.filter(function (x) { return x.id === r.species; })[0] || {};
    var lines = [
      lbl("submit.kind") + ": " + t("submit.kind" +
        (r.kind === "lost" ? "Lost" : r.kind === "cutback" ? "Cutback" : "Standing")),
      lbl("submit.species") + ": " + (sp.sci || r.species) + (sp.en ? " (" + sp.en + ")" : ""),
      lbl("submit.where") + ": " + (r.place || "—"),
      lbl("submit.ward") + ": " + t("ward." + r.ward),
      "GPS: " + (r.lat ? r.lat + ", " + r.lng : "—"),
      lbl("submit.private") + ": " + r.privateLand
    ];
    if (r.kind !== "standing") {
      lines.push(lbl("submit.lostDate") + ": " + (r.lostDate || "—"));
      lines.push(lbl("submit.lostReason") + ": " + t("reason." + (r.lostReason || "unknown")));
    }
    lines.push(lbl("submit.notes") + ": " + (r.notes || "—"));
    lines.push(lbl("submit.name") + ": " + (r.name || "—"));
    lines.push(lbl("submit.email") + ": " + (r.email || "—"));
    lines.push(lbl("submit.photo") + ": " +
      (r.photos.length ? r.photos.map(function (f) { return f.name; }).join(", ") : "—"));
    if (r.photos.length) lines.push("→ " + t("fallback.attach"));
    return lines.join("\n");
  }

  /* --- submit ------------------------------------------------------------- */
  function showFallback(record) {
    var text = asText(record);
    $("fallback-text").textContent = text;
    $("mailto").href = "mailto:" + encodeURIComponent(C.contactEmail) +
      "?subject=" + encodeURIComponent("Tree record: " + (record.place || record.ward)) +
      "&body=" + encodeURIComponent(text);
    fallback.hidden = false;
    form.hidden = true;
    fallback.focus();
  }

  /* --- Google Apps Script transport ---------------------------------------
     Apps Script cannot parse multipart/form-data, so records go to it as JSON
     with the photograph inlined as a data: URL. The Content-Type below is
     deliberate: text/plain keeps this a CORS-simple request, and Apps Script
     never answers the preflight that application/json would trigger. */

  function isAppsScript(url) { return /script\.google\.com/.test(url); }

  /* Phone photos run to 4-12 MB and the register has no use for that. Shrinking
     in the browser keeps uploads quick on a mobile connection and well inside
     the request limit. Falls back to the original bytes when the browser cannot
     decode the format, which today mostly means HEIC outside Safari. */
  function shrinkPhoto(file, maxPx, quality) {
    return new Promise(function (resolve) {
      function raw() {
        var fr = new FileReader();
        fr.onload  = function () { resolve({ dataUrl: fr.result, name: file.name }); };
        fr.onerror = function () { resolve(null); };
        fr.readAsDataURL(file);
      }
      function draw(bmp) {
        try {
          var scale = Math.min(1, maxPx / Math.max(bmp.width, bmp.height));
          var w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
          var c = document.createElement("canvas");
          c.width = w; c.height = h;
          c.getContext("2d").drawImage(bmp, 0, 0, w, h);
          if (bmp.close) bmp.close();
          var url = c.toDataURL("image/jpeg", quality);
          /* Re-encoding is not always a saving. A small PNG, a screenshot or a
             already-compressed image can come out larger as JPEG, so keep
             whichever is actually smaller. */
          if (url.length * 0.75 >= file.size) return raw();
          resolve({ dataUrl: url, name: file.name.replace(/\.[^.]+$/, "") + ".jpg" });
        } catch (e) { raw(); }
      }
      if (typeof createImageBitmap !== "function") return raw();
      createImageBitmap(file, { imageOrientation: "from-image" }).then(draw, function () {
        createImageBitmap(file).then(draw, raw);
      });
    });
  }

  function sendToAppsScript(record, done, fail) {
    var payload = {
      consent: true, website: $("website").value,
      kind: record.kind, species: record.species, place: record.place,
      ward: record.ward, lat: record.lat, lng: record.lng,
      privateLand: record.privateLand, lostDate: record.lostDate,
      lostReason: record.lostReason, notes: record.notes,
      speciesOther: record.speciesOther, people: record.people,
      name: record.name, email: record.email, language: record.language
    };
    function go() {
      fetch(C.submitEndpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      })
        .then(function (res) { return res.json(); })
        .then(function (out) { if (out && out.ok) { done(); } else { fail(); } }, fail);
    }
    if (!record.photos.length) return go();
    payload.photos = [];
    Promise.all(record.photos.map(function (f) {
      return shrinkPhoto(f, 2000, 0.82);
    })).then(function (list) {
      list.forEach(function (p) {
        if (p) payload.photos.push({ dataUrl: p.dataUrl, name: p.name });
      });
      go();
    }, go);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();

    var problems = validate();
    if (problems.length) { showErrors(problems); return; }

    var record = collect();
    var btn = $("send");

    if (!C.submitEndpoint) { showFallback(record); return; }

    btn.disabled = true;
    btn.textContent = t("submit.sending");

    function reset()  { btn.disabled = false; btn.textContent = t("submit.send"); }
    function done()   { form.hidden = true; doneBox.hidden = false; doneBox.focus(); reset(); }
    function failed() {
      showErrors([{ id: "send", msg: t("err.send") }]);
      showFallback(record);
      errBox.hidden = false;
      reset();
    }

    if (isAppsScript(C.submitEndpoint)) { sendToAppsScript(record, done, failed); return; }

    var fd = new FormData();
    Object.keys(record).forEach(function (k) {
      if (k === "photo") { if (record.photo) fd.append("photo", record.photo, record.photo.name); }
      else fd.append(k, record[k]);
    });
    fd.append("_subject", "Tree record: " + (record.place || record.ward));

    fetch(C.submitEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.hidden = true;
        doneBox.hidden = false;
        doneBox.focus();
      })
      .catch(function () {
        showErrors([{ id: "send", msg: t("err.send") }]);
        showFallback(record);
        errBox.hidden = false;
      })
      .then(function () {
        btn.disabled = false;
        btn.textContent = t("submit.send");
      });
  });

  /* --- conditional section ------------------------------------------------ */
  function kindChanged() {
    var kind = form.querySelector('input[name="kind"]:checked').value;
    var isEvent = kind === "lost" || kind === "cutback";
    $("event-group").hidden = !isEvent;
    if (isEvent) {
      $("event-legend").textContent = t(kind === "lost" ? "submit.kindLost" : "submit.kindCutback");
    }
  }
  form.querySelectorAll('input[name="kind"]').forEach(function (r) {
    r.addEventListener("change", kindChanged);
  });

  /* --- geolocation -------------------------------------------------------- */
  $("geo").addEventListener("click", function () {
    var status = $("geo-status");
    if (!navigator.geolocation) { status.textContent = t("submit.geoFail"); return; }
    status.textContent = t("submit.geoBusy");
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude.toFixed(5), lng = pos.coords.longitude.toFixed(5);
      $("lat").value = lat; $("lng").value = lng;
      setPin(Number(lat), Number(lng), true);
      status.textContent = t("submit.geoOk", { lat: lat, lng: lng });
    }, function () {
      status.textContent = t("submit.geoFail");
    }, { enableHighAccuracy: true, timeout: 10000 });
  });

  /* --- photo chosen ------------------------------------------------------- */
  $("photo").addEventListener("change", function () {
    $("photo-hint").textContent = this.files.length
      ? t("submit.photoChosen", { n: this.files.length })
      : t("submit.photoHint", { mb: C.maxPhotoMb, max: C.maxPhotos });
  });

  /* --- where the tree is ---------------------------------------------------
     The map is the quick way. The two number fields are the accessible way,
     and they stay in step with it, so neither is second-class. */

  function validCoords() {
    var lat = parseFloat($("lat").value), lng = parseFloat($("lng").value);
    if (isNaN(lat) || isNaN(lng)) return false;
    var b = C.map.maxBounds;
    return lat >= b[0][0] && lat <= b[1][0] && lng >= b[0][1] && lng <= b[1][1];
  }

  var picker = null, pin = null;

  function setPin(lat, lng, recentre) {
    if (!picker) return;
    if (pin) { pin.setLatLng([lat, lng]); }
    else {
      pin = L.marker([lat, lng], { draggable: true }).addTo(picker);
      pin.on("dragend", function () {
        var p = pin.getLatLng();
        $("lat").value = p.lat.toFixed(5);
        $("lng").value = p.lng.toFixed(5);
      });
    }
    if (recentre) picker.setView([lat, lng], Math.max(picker.getZoom(), 16));
  }

  function initPicker() {
    if (typeof L === "undefined") return;      /* offline: the fields still work */
    var c = C.map;
    picker = L.map("picker", {
      center: c.center, zoom: c.zoom, minZoom: c.minZoom, maxZoom: c.maxZoom,
      maxBounds: c.maxBounds, maxBoundsViscosity: 0.7, scrollWheelZoom: false
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: c.maxZoom,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(picker);
    picker.on("click", function (e) {
      $("lat").value = e.latlng.lat.toFixed(5);
      $("lng").value = e.latlng.lng.toFixed(5);
      setPin(e.latlng.lat, e.latlng.lng, false);
    });
    picker.on("focus", function () { picker.scrollWheelZoom.enable(); });
    picker.on("blur",  function () { picker.scrollWheelZoom.disable(); });
  }

  /* Typing coordinates moves the pin, so the two ways of answering agree. */
  ["lat", "lng"].forEach(function (id) {
    $(id).addEventListener("change", function () {
      if (validCoords()) setPin(parseFloat($("lat").value), parseFloat($("lng").value), true);
    });
  });

  /* --- copy --------------------------------------------------------------- */
  $("copy").addEventListener("click", function () {
    var text = $("fallback-text").textContent;
    var announce = function () {
      $("copy-status").textContent = t("fallback.copied");
      $("copy").textContent = t("fallback.copied");
      setTimeout(function () { $("copy").textContent = t("fallback.copy"); }, 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(announce, announce);
    } else {
      var ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
      announce();
    }
  });

  /* --- go ----------------------------------------------------------------- */
  window.i18n.init(function () { buildSelects(); kindChanged(); });
  buildSelects();
  kindChanged();
  initPicker();
})();
