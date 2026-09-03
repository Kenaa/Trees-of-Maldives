/* ===========================================================================
   The Last Trees of Malé — archive page.
   Plain JavaScript, no build step. Everything user-supplied goes in through
   textContent, never innerHTML, so a submitted record can never inject markup.
   =========================================================================== */
(function () {
  "use strict";

  var T       = window.TREE_DATA;
  var SPECIES = window.SPECIES_DATA.species;
  var t       = function () { return window.i18n.t.apply(null, arguments); };
  var pick    = function (p) { return window.i18n.pick(p); };

  var STATUSES = ["standing", "lost", "threatened", "relocated"];
  var WARDS    = ["henveiru", "galolhu", "maafannu", "machchangolhi", "villimale", "hulhumale"];
  var SORTS    = ["recent", "girth", "age", "name"];

  var speciesById = {};
  SPECIES.forEach(function (s) { speciesById[s.id] = s; });

  /* --- tiny DOM helper ---------------------------------------------------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];      // only ever our own icons
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* Wrap a value from the data files in the correct language marking, so a
     screen reader switches voice for Dhivehi inside an English page. */
  function bi(pair, tag, attrs) {
    var text = pick(pair);
    var lang = window.i18n.langOf(pair);
    var n = el(tag || "span", attrs || {});
    n.textContent = text;
    if (lang !== window.i18n.current) {
      n.setAttribute("lang", lang);
      n.setAttribute("dir", window.LANGS[lang].dir);
    }
    return n;
  }

  /* --- status iconography: shape as well as colour, never colour alone ---- */
  var ICONS = {
    standing:   '<circle cx="12" cy="12" r="7"/>',
    lost:       '<path d="M6 6l12 12M18 6 6 18"/>',
    threatened: '<path d="M12 4 21 20H3Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
    relocated:  '<path d="M4 12h13"/><path d="m13 6 6 6-6 6"/>'
  };
  function icon(status, size) {
    return el("span", {
      "aria-hidden": "true",
      html: '<svg width="' + (size || 14) + '" height="' + (size || 14) + '" viewBox="0 0 24 24" ' +
            'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" ' +
            'stroke-linejoin="round">' + ICONS[status] + "</svg>"
    });
  }

  function badge(status) {
    var b = el("span", { "class": "badge badge-" + status });
    b.appendChild(icon(status));
    b.appendChild(el("span", { text: t("status." + status) }));
    return b;
  }

  function unverifiedFlag() {
    var f = el("span", { "class": "flag-unverified", title: t("tree.unverifiedFull") });
    f.appendChild(el("span", { "aria-hidden": "true", text: "?" }));
    f.appendChild(el("span", { text: t("tree.unverified") }));
    return f;
  }

  /* --- state -------------------------------------------------------------- */
  var state = { q: "", status: "", ward: "", species: "", sort: "recent", view: "map" };

  function speciesLabel(id) {
    var s = speciesById[id];
    if (!s) return id;
    return window.i18n.current === "dv" && s.dv ? s.dv : s.en;
  }

  function matches(tree) {
    if (state.status && tree.status !== state.status) return false;
    if (state.ward && tree.ward !== state.ward) return false;
    if (state.species && tree.species !== state.species) return false;
    if (state.q) {
      var s = speciesById[tree.species] || {};
      var hay = [
        tree.id, pick(tree.name), pick(tree.place),
        s.sci, s.en, s.dv,
        t("ward." + tree.ward), t("status." + tree.status)
      ].join(" ").toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function sorted(list) {
    var c = list.slice();
    var coll = new Intl.Collator(window.i18n.current === "dv" ? "dv" : "en");
    if (state.sort === "girth") c.sort(function (a, b) { return (b.girthCm || 0) - (a.girthCm || 0); });
    else if (state.sort === "age") c.sort(function (a, b) { return (b.ageYears || 0) - (a.ageYears || 0); });
    else if (state.sort === "name") c.sort(function (a, b) { return coll.compare(pick(a.name), pick(b.name)); });
    else c.sort(function (a, b) { return String(b.recorded).localeCompare(String(a.recorded)) || a.id.localeCompare(b.id); });
    return c;
  }

  /* --- stats -------------------------------------------------------------- */
  function renderStats() {
    var box = document.getElementById("stats");
    box.textContent = "";
    var counts = { standing: 0, lost: 0, threatened: 0, relocated: 0 };
    T.trees.forEach(function (x) { counts[x.status] = (counts[x.status] || 0) + 1; });
    [
      ["stat.standing",   counts.standing,   "stat-standing"],
      ["stat.lost",       counts.lost + counts.relocated, "stat-lost"],
      ["stat.threatened", counts.threatened, "stat-threat"],
      ["stat.total",      T.trees.length,    ""]
    ].forEach(function (row) {
      box.appendChild(el("li", { "class": "stat " + row[2] }, [
        el("b", { text: String(row[1]) }),
        el("span", { text: t(row[0]) })
      ]));
    });
  }

  /* --- cards -------------------------------------------------------------- */
  function card(tree) {
    var s = speciesById[tree.species] || {};

    var media = el("div", { "class": "card-media" });
    if (tree.photos && tree.photos.length) {
      media.appendChild(el("img", {
        src: tree.photos[0].src,
        alt: pick(tree.photos[0].alt) || pick(tree.name),
        loading: "lazy", decoding: "async"
      }));
    } else {
      media.appendChild(el("span", {
        "class": "hint",
        html: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
              'stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/>' +
              '<circle cx="9" cy="10" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>'
      }));
      media.appendChild(el("span", { "class": "visually-hidden", text: t("tree.noPhoto") }));
    }

    var link = el("a", { "class": "card-link", href: "?tree=" + encodeURIComponent(tree.id) });
    link.appendChild(bi(tree.name));

    var body = el("div", { "class": "card-body" }, [
      badge(tree.status),
      el("h3", {}, [link]),
      el("p", { "class": "card-sci", lang: "la", text: s.sci || "" }),
      el("p", { "class": "card-meta", text: t("ward." + tree.ward) + " · " + pick(tree.place) })
    ]);
    if (!tree.verified) body.appendChild(unverifiedFlag());

    return el("li", {}, [
      el("article", { "class": "card" + (tree.status === "lost" ? " card-lost" : "") }, [media, body])
    ]);
  }

  /* --- map ---------------------------------------------------------------- */
  var map = null, layer = null;
  var MARK_COLOR = { standing: "#1B6340", lost: "#8F3520", threatened: "#7A4A05", relocated: "#4C5C51" };

  function markerIcon(status) {
    var svg =
      '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="' + MARK_COLOR[status] +
      '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" ' +
      'style="background:#fff;border-radius:50%;border:2px solid ' + MARK_COLOR[status] + '">' +
      ICONS[status] + "</svg>";
    return L.divIcon({ html: svg, className: "marker", iconSize: [28, 28], iconAnchor: [14, 14] });
  }

  function initMap() {
    if (typeof L === "undefined") {           // offline, or the CDN is blocked
      document.getElementById("map-section").hidden = true;
      document.getElementById("viewtoggle").hidden = true;
      state.view = "list";
      return false;
    }
    var c = window.CONFIG.map;
    map = L.map("map", {
      center: c.center, zoom: c.zoom, minZoom: c.minZoom, maxZoom: c.maxZoom,
      maxBounds: c.maxBounds, maxBoundsViscosity: .7, scrollWheelZoom: false
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: c.maxZoom, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
    /* Keyboard users must be able to scroll past the map, so wheel-zoom only
       engages once the map itself has focus. */
    map.on("focus", function () { map.scrollWheelZoom.enable(); });
    map.on("blur",  function () { map.scrollWheelZoom.disable(); });
    return true;
  }

  function renderMap(list) {
    if (!map) return;
    layer.clearLayers();
    list.forEach(function (tree) {
      if (typeof tree.lat !== "number" || typeof tree.lng !== "number") return;
      var m = L.marker([tree.lat, tree.lng], {
        icon: markerIcon(tree.status),
        keyboard: true,
        alt: pick(tree.name) + " — " + t("status." + tree.status),
        title: pick(tree.name)
      });
      var pop = el("div");
      pop.appendChild(el("h3", {}, [bi(tree.name)]));
      pop.appendChild(el("p", { "class": "card-sci", lang: "la", text: (speciesById[tree.species] || {}).sci || "" }));
      pop.appendChild(badge(tree.status));
      var open = el("p", {}, [el("a", { href: "?tree=" + encodeURIComponent(tree.id), text: t("tree.open") })]);
      pop.appendChild(open);
      m.bindPopup(pop);
      layer.addLayer(m);
    });
  }

  /* --- detail dialog ------------------------------------------------------ */
  var dialog = document.getElementById("detail");
  var lastFocus = null;

  function row(dl, labelKey, node) {
    if (!node) return;
    dl.appendChild(el("dt", { text: t(labelKey) }));
    var dd = el("dd");
    dd.appendChild(typeof node === "string" ? document.createTextNode(node) : node);
    dl.appendChild(dd);
  }

  function openDetail(tree, push) {
    var s = speciesById[tree.species] || {};
    var title = document.getElementById("detail-title");
    title.textContent = "";
    title.appendChild(bi(tree.name));

    var body = document.getElementById("detail-body");
    body.textContent = "";

    if (tree.photos && tree.photos.length) {
      tree.photos.forEach(function (p) {
        body.appendChild(el("img", { src: p.src, alt: pick(p.alt) || pick(tree.name) }));
      });
    } else {
      body.appendChild(el("p", { "class": "hint", text: t("tree.noPhoto") + " — " + t("tree.noPhotoHint") }));
    }

    var head = el("p", {}, [badge(tree.status)]);
    if (!tree.verified) { head.appendChild(document.createTextNode(" ")); head.appendChild(unverifiedFlag()); }
    body.appendChild(head);

    if (tree.lost) {
      var lb = el("div", { "class": "lost-block" });
      var ldl = el("dl", { "class": "dl" });
      row(ldl, "tree.lostDate", tree.lost.date || t("tree.unknown"));
      row(ldl, "tree.lostReason", t("reason." + (tree.lost.reason || "unknown")));
      if (tree.lost.evidence) row(ldl, "tree.evidence", bi(tree.lost.evidence));
      ldl.style.marginBottom = "0";
      lb.appendChild(ldl);
      body.appendChild(lb);
    }

    var dl = el("dl", { "class": "dl" });
    row(dl, "tree.species", el("span", {}, [
      el("span", { lang: "la", style: "font-style:italic", text: s.sci || "" }),
      document.createTextNode(" · "),
      bi({ en: s.en, dv: s.dv })
    ]));
    row(dl, "tree.location", el("span", {}, [
      bi(tree.place), document.createTextNode(" · " + t("ward." + tree.ward))
    ]));
    row(dl, "tree.girth",  tree.girthCm ? tree.girthCm + " cm" : t("tree.unknown"));
    row(dl, "tree.height", tree.heightM ? tree.heightM + " m" : t("tree.unknown"));
    row(dl, "tree.age",    tree.ageYears ? tree.ageYears + " " + t("tree.years") : t("tree.unknown"));
    row(dl, "tree.recorded", tree.recorded || t("tree.unknown"));
    row(dl, "tree.id", tree.id);
    body.appendChild(dl);

    if (pick(tree.notes)) {
      body.appendChild(el("h3", { text: t("tree.notes") }));
      body.appendChild(bi(tree.notes, "p"));
    }

    lastFocus = document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    document.getElementById("detail-close").focus();

    if (push) history.pushState({ tree: tree.id }, "", "?tree=" + encodeURIComponent(tree.id));
  }

  function closeDetail() {
    if (dialog.open) dialog.close();
  }
  dialog.addEventListener("close", function () {
    if (location.search) history.pushState({}, "", location.pathname);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  document.getElementById("detail-close").addEventListener("click", closeDetail);

  /* --- render ------------------------------------------------------------- */
  function render() {
    var list = sorted(T.trees.filter(matches));

    var ul = document.getElementById("list");
    ul.textContent = "";
    list.forEach(function (tr) { ul.appendChild(card(tr)); });

    document.getElementById("empty").hidden = list.length !== 0;
    document.getElementById("count").textContent =
      list.length === 1 ? t("results.one") : t("results.count", { n: list.length });

    renderMap(list);

    var showMap = state.view === "map" && map !== null;
    document.getElementById("map-section").hidden = !showMap;
    if (showMap) setTimeout(function () { map.invalidateSize(); }, 0);
  }

  /* --- select building ---------------------------------------------------- */
  function fillSelect(id, values, labelFor, keep) {
    var sel = document.getElementById(id);
    var prev = keep === undefined ? sel.value : keep;
    sel.textContent = "";
    sel.appendChild(el("option", { value: "", text: t("filters.all") }));
    values.forEach(function (v) { sel.appendChild(el("option", { value: v, text: labelFor(v) })); });
    sel.value = prev || "";
  }

  function buildSelects() {
    fillSelect("f-status",  STATUSES, function (v) { return t("status." + v); }, state.status);
    fillSelect("f-ward",    WARDS,    function (v) { return t("ward." + v); },   state.ward);
    fillSelect("f-species", SPECIES.map(function (s) { return s.id; }), speciesLabel, state.species);

    var sort = document.getElementById("sort");
    sort.textContent = "";
    SORTS.forEach(function (v) { sort.appendChild(el("option", { value: v, text: t("sort." + v) })); });
    sort.value = state.sort;
  }

  /* --- wiring ------------------------------------------------------------- */
  function debounce(fn, ms) {
    var h; return function () { clearTimeout(h); h = setTimeout(fn, ms); };
  }

  document.getElementById("q").addEventListener("input", debounce(function () {
    state.q = document.getElementById("q").value.trim(); render();
  }, 200));
  document.getElementById("f-status").addEventListener("change", function (e) { state.status = e.target.value; render(); });
  document.getElementById("f-ward").addEventListener("change", function (e) { state.ward = e.target.value; render(); });
  document.getElementById("f-species").addEventListener("change", function (e) { state.species = e.target.value; render(); });
  document.getElementById("sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
  document.getElementById("filters").addEventListener("submit", function (e) { e.preventDefault(); });

  document.getElementById("clear").addEventListener("click", function () {
    state.q = ""; state.status = ""; state.ward = ""; state.species = "";
    document.getElementById("q").value = "";
    buildSelects();
    render();
    document.getElementById("q").focus();
  });

  document.getElementById("viewtoggle").addEventListener("change", function (e) {
    state.view = e.target.value; render();
  });

  /* One delegated handler for every "open record" link, on cards and in map
     popups alike. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="?tree="]') : null;
    if (!a) return;
    e.preventDefault();
    var id = decodeURIComponent(a.getAttribute("href").slice(6));
    var tree = T.trees.filter(function (x) { return x.id === id; })[0];
    if (tree) openDetail(tree, true);
  });

  window.addEventListener("popstate", function () {
    var id = new URLSearchParams(location.search).get("tree");
    if (!id) { if (dialog.open) dialog.close(); return; }
    var tree = T.trees.filter(function (x) { return x.id === id; })[0];
    if (tree) openDetail(tree, false);
  });

  /* --- go ----------------------------------------------------------------- */
  window.i18n.init(function () { buildSelects(); renderStats(); render(); });
  initMap();
  buildSelects();
  renderStats();

  if (T.meta && T.meta.seed) {
    document.getElementById("seed-notice").hidden = false;
  }

  render();

  var deep = new URLSearchParams(location.search).get("tree");
  if (deep) {
    var tree = T.trees.filter(function (x) { return x.id === deep; })[0];
    if (tree) openDetail(tree, false);
  }
})();
