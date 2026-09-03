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
  var REASONS = ["road-widening", "construction", "storm", "disease", "safety", "unknown"];

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

  function buildSelects() {
    fill("ward", WARDS, function (v) { return t("ward." + v); });
    fill("lostReason", REASONS, function (v) { return t("reason." + v); });
    fill("species", SPECIES.map(function (s) { return s.id; }), function (id) {
      var s = SPECIES.filter(function (x) { return x.id === id; })[0];
      var native = window.i18n.current === "dv" && s.dv ? s.dv : s.en;
      return s.sci === "Unidentified" ? native : native + " \u00b7 " + s.sci;
    });
    $("photo-hint").textContent = t("submit.photoHint", { mb: C.maxPhotoMb });
  }

  /* --- errors ------------------------------------------------------------- */
  function clearErrors() {
    errBox.hidden = true;
    errList.textContent = "";
    ["photo", "place", "email", "consent"].forEach(function (f) {
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

    var file = $("photo").files[0];
    if (file) {
      if (file.type && file.type.indexOf("image/") !== 0) {
        problems.push({ id: "photo", msg: t("err.photoType") });
      } else if (file.size > C.maxPhotoMb * 1024 * 1024) {
        problems.push({ id: "photo", msg: t("err.photoSize", {
          size: (file.size / 1048576).toFixed(1), mb: C.maxPhotoMb
        }) });
      }
    }

    var hasCoords = $("lat").value && $("lng").value;
    if (!$("place").value.trim() && !hasCoords) {
      problems.push({ id: "place", msg: t("err.required", { field: t("submit.where") }) });
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
    var lat = $("lat").value, lng = $("lng").value;

    /* Blur the position for trees on private land so a household is not
       identifiable from the published archive. */
    if ($("private").checked && lat && C.privateLandPrecision !== null) {
      lat = Number(lat).toFixed(C.privateLandPrecision);
      lng = Number(lng).toFixed(C.privateLandPrecision);
    }

    return {
      kind: kind,
      species: $("species").value,
      place: $("place").value.trim(),
      ward: $("ward").value,
      lat: lat, lng: lng,
      privateLand: $("private").checked ? "yes" : "no",
      lostDate: kind === "lost" ? $("lostDate").value.trim() : "",
      lostReason: kind === "lost" ? $("lostReason").value : "",
      notes: $("notes").value.trim(),
      name: $("name").value.trim(),
      email: $("email").value.trim(),
      photo: $("photo").files[0] || null,
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
      lbl("submit.kind") + ": " + t(r.kind === "lost" ? "submit.kindLost" : "submit.kindStanding"),
      lbl("submit.species") + ": " + (sp.sci || r.species) + (sp.en ? " (" + sp.en + ")" : ""),
      lbl("submit.where") + ": " + (r.place || "—"),
      lbl("submit.ward") + ": " + t("ward." + r.ward),
      "GPS: " + (r.lat ? r.lat + ", " + r.lng : "—"),
      lbl("submit.private") + ": " + r.privateLand
    ];
    if (r.kind === "lost") {
      lines.push(lbl("submit.lostDate") + ": " + (r.lostDate || "—"));
      lines.push(lbl("submit.lostReason") + ": " + t("reason." + (r.lostReason || "unknown")));
    }
    lines.push(lbl("submit.notes") + ": " + (r.notes || "—"));
    lines.push(lbl("submit.name") + ": " + (r.name || "—"));
    lines.push(lbl("submit.email") + ": " + (r.email || "—"));
    lines.push(lbl("submit.photo") + ": " + (r.photo ? r.photo.name : "—"));
    if (r.photo) lines.push("→ " + t("fallback.attach"));
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
  form.querySelectorAll('input[name="kind"]').forEach(function (r) {
    r.addEventListener("change", function () {
      $("lost-group").hidden = form.querySelector('input[name="kind"]:checked').value !== "lost";
    });
  });

  /* --- geolocation -------------------------------------------------------- */
  $("geo").addEventListener("click", function () {
    var status = $("geo-status");
    if (!navigator.geolocation) { status.textContent = t("submit.geoFail"); return; }
    status.textContent = t("submit.geoBusy");
    navigator.geolocation.getCurrentPosition(function (pos) {
      var lat = pos.coords.latitude.toFixed(5), lng = pos.coords.longitude.toFixed(5);
      $("lat").value = lat; $("lng").value = lng;
      status.textContent = t("submit.geoOk", { lat: lat, lng: lng });
    }, function () {
      status.textContent = t("submit.geoFail");
    }, { enableHighAccuracy: true, timeout: 10000 });
  });

  /* --- photo chosen ------------------------------------------------------- */
  $("photo").addEventListener("change", function () {
    var f = this.files[0];
    $("photo-hint").textContent = f
      ? t("submit.photoChosen", { name: f.name })
      : t("submit.photoHint", { mb: C.maxPhotoMb });
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
  window.i18n.init(buildSelects);
  buildSelects();
})();
