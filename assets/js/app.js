/* ===========================================================================
   THE LAST TREES OF MALÉ. Register page.

   Plain JavaScript, no build step. Everything that came from the data files
   goes in through textContent, never innerHTML, so a submitted record can
   never inject markup.

   The register and the map are two views of one filtered list. Pointing at a
   row lights its marker and the other way round, which is the whole reason
   the two views sit under one set of tabs.
   =========================================================================== */
(function () {
  "use strict";

  var T = window.TREE_DATA, SPECIES = window.SPECIES_DATA.species;
  var t = function () { return window.i18n.t.apply(null, arguments); };
  var pick = function (p) { return window.i18n.pick(p); };

  var STATUSES = ["standing", "cutback", "threatened", "lost", "relocated"];
  var WARDS = ["henveiru", "galolhu", "maafannu", "machchangolhi", "villimale", "hulhumale"];
  /* What the Lost panel covers. A tree stripped of its canopy belongs here:
     leaving it out would hide the commonest way canopy actually goes. */
  var GONE = { lost: 1, relocated: 1, cutback: 1 };

  var byId = {};
  SPECIES.forEach(function (s) { byId[s.id] = s; });

  var $ = function (id) { return document.getElementById(id); };

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];        // only ever our own icons
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* Mark data in the language it is actually in, so a screen reader switches
     voice for Dhivehi inside an English page and vice versa. */
  function bi(pair, tag, attrs) {
    var n = el(tag || "span", attrs || {});
    n.textContent = pick(pair);
    var lang = window.i18n.langOf(pair);
    if (lang !== window.i18n.current) {
      n.setAttribute("lang", lang);
      n.setAttribute("dir", window.LANGS[lang].dir);
    }
    return n;
  }

  /* --- status marks: shape as well as colour, never colour alone --------- */
  var GLYPH = {
    standing:   '<circle cx="12" cy="12" r="7"/>',
    lost:       '<path d="M6 6l12 12M18 6 6 18"/>',
    threatened: '<path d="M12 4 21 20H3Z"/>',
    relocated:  '<path d="M4 12h13"/><path d="m13 6 6 6-6 6"/>',
    cutback:    '<path d="M3 8h18"/><path d="M8 13a4 4 0 0 1 8 0v6H8Z"/>'
  };
  function glyph(status, size) {
    var s = size || 11;
    return el("span", {
      "aria-hidden": "true",
      html: '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" ' +
            'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" ' +
            'stroke-linejoin="round">' + GLYPH[status] + '</svg>'
    });
  }
  function stamp(status) {
    return el("span", { "class": "stamp stamp-" + status }, [
      glyph(status), el("span", { text: t("status." + status) })
    ]);
  }
  function unverified() {
    return el("span", { "class": "unverified", title: t("tree.unverifiedFull"), text: t("tree.unverified") });
  }

  /* --- state ------------------------------------------------------------- */
  var state = { q: "", status: "", ward: "", species: "", sort: "id", dir: "asc", tab: 0 };

  function speciesLabel(id) {
    var s = byId[id];
    if (!s) return id;
    /* In Dhivehi, prefer Thaana, then the book's romanisation. Falling back to
       English would be worse: the romanisation is still the Dhivehi name. */
    if (window.i18n.current === "dv") return s.dv || s.dvLatin || s.en;
    /* Most people in Malé type Dhivehi in Latin script, so the romanisation
       is what makes this menu searchable for them. Redundant in Thaana. */
    return s.dvLatin ? s.en + " (" + s.dvLatin + ")" : s.en;
  }

  function matches(x) {
    if (state.status && x.status !== state.status) return false;
    if (state.ward && x.ward !== state.ward) return false;
    if (state.species && x.species !== state.species) return false;
    if (state.q) {
      var s = byId[x.species] || {};
      var hay = [x.id, pick(x.name), pick(x.place), s.sci, s.en, s.dv,
                 t("ward." + x.ward), t("status." + x.status)].join(" ").toLowerCase();
      if (hay.indexOf(state.q.toLowerCase()) === -1) return false;
    }
    return true;
  }

  function sortList(list) {
    var coll = new Intl.Collator(window.i18n.current === "dv" ? "dv" : "en");
    var k = state.sort, sign = state.dir === "desc" ? -1 : 1;
    return list.slice().sort(function (a, b) {
      var r;
      if (k === "girth") r = (a.girthCm || 0) - (b.girthCm || 0);
      else if (k === "name") r = coll.compare(pick(a.name), pick(b.name));
      else if (k === "species") r = coll.compare((byId[a.species] || {}).sci || "", (byId[b.species] || {}).sci || "");
      else if (k === "ward") r = coll.compare(t("ward." + a.ward), t("ward." + b.ward));
      else if (k === "status") r = STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status);
      else r = a.id.localeCompare(b.id);
      return (r || a.id.localeCompare(b.id)) * sign;
    });
  }

  /* --- masthead + ledger -------------------------------------------------- */
  function renderColophon() {
    $("colophon-count").textContent = t("colophon.records", { n: T.trees.length });
    $("colophon-updated").textContent = t("colophon.updated", { date: (T.meta && T.meta.updated) || "" });
  }

  function renderLedger() {
    var c = { standing: 0, lost: 0, threatened: 0, relocated: 0, cutback: 0 };
    T.trees.forEach(function (x) { c[x.status] = (c[x.status] || 0) + 1; });
    var box = $("ledger");
    box.textContent = "";
    [["stat.standing", c.standing, ""],
     ["stat.cutback", c.cutback, "is-loss"],
     ["stat.lost", c.lost + c.relocated, "is-loss"],
     ["stat.threatened", c.threatened, ""],
     ["stat.total", T.trees.length, ""]
    ].forEach(function (r) {
      box.appendChild(el("li", { "class": r[2] }, [
        el("b", { "class": "mono", text: String(r[1]) }),
        el("span", { "class": "label", text: t(r[0]) })
      ]));
    });
  }

  /* --- register ----------------------------------------------------------- */
  function row(x) {
    var s = byId[x.species] || {};
    var tr = el("tr", { "data-id": x.id, "class": GONE[x.status] ? "is-lost" : "" });

    tr.appendChild(el("td", { "class": "rec-id", text: x.id }));

    var link = el("a", { href: "?tree=" + encodeURIComponent(x.id) });
    link.appendChild(bi(x.name));
    tr.appendChild(el("td", { "class": "rec-name" }, [
      link, el("div", { "class": "dim", style: "font-size:.82rem;font-weight:400" }, [bi(x.place)])
    ]));

    tr.appendChild(el("td", { "class": "col-opt rec-sci", lang: "la", text: s.sci || "" }));
    tr.appendChild(el("td", { "class": "col-opt", text: t("ward." + x.ward) }));

    var st = el("td", {}, [stamp(x.status)]);
    if (!x.verified) { st.appendChild(document.createTextNode(" ")); st.appendChild(unverified()); }
    tr.appendChild(st);

    tr.appendChild(el("td", { "class": "col-opt num", text: x.girthCm ? x.girthCm + " cm" : "—" }));
    return tr;
  }

  function renderRegister(list) {
    var body = $("rows");
    body.textContent = "";
    list.forEach(function (x) { body.appendChild(row(x)); });
    $("empty").hidden = list.length !== 0;
  }

  /* --- lost panel --------------------------------------------------------- */
  function renderLost(list) {
    var gone = list.filter(function (x) { return GONE[x.status]; });
    var ul = $("losses");
    ul.textContent = "";
    gone.forEach(function (x) {
      var s = byId[x.species] || {};
      var when = (x.lost && x.lost.date) || t("tree.unknown");
      var link = el("a", { href: "?tree=" + encodeURIComponent(x.id) });
      link.appendChild(bi(x.name));

      var body = el("div", {}, [
        el("h3", {}, [link]),
        el("p", { "class": "loss-meta" }, [
          el("span", { lang: "la", style: "font-style:italic", text: s.sci || "" }),
          document.createTextNode(" · " + t("ward." + x.ward) + " · " +
            t("reason." + ((x.lost && x.lost.reason) || "unknown")))
        ])
      ]);
      if (pick(x.notes)) body.appendChild(bi(x.notes, "p"));

      ul.appendChild(el("li", { "class": "loss", "data-id": x.id }, [
        el("div", { "class": "loss-when", text: when }), body
      ]));
    });
    $("lost-empty").hidden = gone.length !== 0;
  }

  /* --- map ---------------------------------------------------------------- */
  var map = null, layer = null, markers = {};
  var MARK = { standing: "--ink", lost: "--verm", threatened: "--verm",
               relocated: "--muted", cutback: "--verm" };

  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function markerIcon(status) {
    var c = css(MARK[status]);
    var paper = css("--paper");
    return L.divIcon({
      className: "marker",
      iconSize: [24, 24], iconAnchor: [12, 12],
      html: '<svg width="24" height="24" viewBox="0 0 24 24" fill="' + paper + '" stroke="' + c +
            '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
            '<rect x="1" y="1" width="22" height="22" fill="' + paper + '" stroke="' + c +
            '" stroke-width="2"/>' + GLYPH[status] + '</svg>'
    });
  }

  function initMap() {
    if (typeof L === "undefined") return false;      // offline, or the CDN is blocked
    var c = window.CONFIG.map;
    map = L.map("map", {
      center: c.center, zoom: c.zoom, minZoom: c.minZoom, maxZoom: c.maxZoom,
      maxBounds: c.maxBounds, maxBoundsViscosity: .7, scrollWheelZoom: false
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: c.maxZoom,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    layer = L.layerGroup().addTo(map);
    /* The raster basemap carries no information a screen reader can use, and
       Leaflet ships its tiles without alt text. Markers live in a separate
       pane, so hiding this one costs nothing. */
    map.getPane("tilePane").setAttribute("aria-hidden", "true");
    /* Keyboard users must be able to scroll past the map, so wheel zoom only
       engages once the map itself has focus. */
    map.on("focus", function () { map.scrollWheelZoom.enable(); });
    map.on("blur", function () { map.scrollWheelZoom.disable(); });
    return true;
  }

  function renderMap(list) {
    if (!map) return;
    layer.clearLayers();
    markers = {};
    list.forEach(function (x) {
      if (typeof x.lat !== "number" || typeof x.lng !== "number") return;
      var m = L.marker([x.lat, x.lng], {
        icon: markerIcon(x.status), keyboard: true,
        alt: pick(x.name) + ", " + t("status." + x.status), title: pick(x.name)
      });
      var pop = el("div", {}, [
        el("h3", { style: "margin:0 0 .2rem" }, [bi(x.name)]),
        el("p", { "class": "rec-sci", style: "margin:0 0 .4rem", lang: "la",
                  text: (byId[x.species] || {}).sci || "" }),
        el("p", { style: "margin:0 0 .5rem" }, [stamp(x.status)]),
        el("p", { style: "margin:0" }, [
          el("a", { href: "?tree=" + encodeURIComponent(x.id), text: t("tree.open") })
        ])
      ]);
      m.bindPopup(pop);
      m.on("mouseover", function () { highlight(x.id, false); });
      m.on("mouseout", function () { highlight(null, false); });
      layer.addLayer(m);
      markers[x.id] = m;
    });
  }

  /* --- cross-highlighting -------------------------------------------------
     One function drives it from either side. `scroll` is true when the map
     initiated it, so the register row is brought into view. */
  var lit = null;
  function highlight(id, scroll) {
    if (lit === id) return;
    lit = id;
    document.querySelectorAll(".register tr.is-active, .marker.is-active")
      .forEach(function (n) { n.classList.remove("is-active"); });
    if (!id) return;
    var tr = document.querySelector('.register tr[data-id="' + CSS.escape(id) + '"]');
    if (tr) {
      tr.classList.add("is-active");
      if (scroll && tr.scrollIntoView) tr.scrollIntoView({ block: "nearest" });
    }
    var m = markers[id];
    if (m && m.getElement()) m.getElement().classList.add("is-active");
  }

  $("rows").addEventListener("mouseover", function (e) {
    var tr = e.target.closest("tr[data-id]");
    highlight(tr ? tr.getAttribute("data-id") : null, false);
  });
  $("rows").addEventListener("mouseleave", function () { highlight(null, false); });
  $("rows").addEventListener("focusin", function (e) {
    var tr = e.target.closest("tr[data-id]");
    if (tr) highlight(tr.getAttribute("data-id"), false);
  });

  /* --- tabs ---------------------------------------------------------------- */
  var TABS = [["t-register", "p-register"], ["t-map", "p-map"], ["t-lost", "p-lost"]];

  function moveIndicator() {
    var btn = $(TABS[state.tab][0]), bar = $("tabs");
    bar.style.setProperty("--ind-x", btn.offsetLeft + "px");
    bar.style.setProperty("--ind-w", btn.offsetWidth);
  }

  function selectTab(i, focus) {
    state.tab = i;
    TABS.forEach(function (pair, n) {
      var btn = $(pair[0]), panel = $(pair[1]);
      var on = n === i;
      btn.setAttribute("aria-selected", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
    });
    $("tabs").classList.toggle("is-lost", i === 2);
    moveIndicator();
    if (focus) $(TABS[i][0]).focus();
    if (i === 1 && map) setTimeout(function () { map.invalidateSize(); }, 0);
  }

  TABS.forEach(function (pair, i) {
    $(pair[0]).addEventListener("click", function () { selectTab(i, false); });
  });

  $("tabs").addEventListener("keydown", function (e) {
    var rtl = window.i18n.dir === "rtl";
    var fwd = rtl ? "ArrowLeft" : "ArrowRight";
    var back = rtl ? "ArrowRight" : "ArrowLeft";
    var i = state.tab;
    if (e.key === fwd) i = (state.tab + 1) % TABS.length;
    else if (e.key === back) i = (state.tab + TABS.length - 1) % TABS.length;
    else if (e.key === "Home") i = 0;
    else if (e.key === "End") i = TABS.length - 1;
    else return;
    e.preventDefault();
    selectTab(i, true);
  });

  window.addEventListener("resize", moveIndicator);

  /* --- detail sheet -------------------------------------------------------- */
  var dialog = $("detail"), lastFocus = null;

  function spec(dl, key, node) {
    if (!node) return;
    dl.appendChild(el("dt", { text: t(key) }));
    var dd = el("dd");
    dd.appendChild(typeof node === "string" ? document.createTextNode(node) : node);
    dl.appendChild(dd);
  }

  function openDetail(x, push) {
    var s = byId[x.species] || {};
    var title = $("detail-title");
    title.textContent = "";
    title.appendChild(bi(x.name));

    var b = $("detail-body");
    b.textContent = "";

    if (x.photos && x.photos.length) {
      x.photos.forEach(function (p) {
        b.appendChild(el("img", { src: p.src, alt: pick(p.alt) || pick(x.name) }));
      });
    } else {
      b.appendChild(el("p", { "class": "hint", text: t("tree.noPhoto") + ". " + t("tree.noPhotoHint") }));
    }

    var head = el("p", {}, [stamp(x.status)]);
    if (!x.verified) { head.appendChild(document.createTextNode(" ")); head.appendChild(unverified()); }
    b.appendChild(head);

    if (x.lost) {
      var lb = el("div", { "class": "loss-block" });
      var ld = el("dl", { "class": "spec" });
      spec(ld, "tree.lostDate", el("span", { "class": "mono", text: x.lost.date || t("tree.unknown") }));
      spec(ld, "tree.lostReason", t("reason." + (x.lost.reason || "unknown")));
      if (x.lost.evidence) spec(ld, "tree.evidence", bi(x.lost.evidence));
      lb.appendChild(ld);
      b.appendChild(lb);
    }

    var dl = el("dl", { "class": "spec" });
    spec(dl, "tree.species", el("span", {}, [
      el("span", { lang: "la", style: "font-style:italic", text: s.sci || "" }),
      document.createTextNode(" · "), bi({ en: s.en, dv: s.dv })
    ]));
    spec(dl, "tree.location", el("span", {}, [
      bi(x.place), document.createTextNode(" · " + t("ward." + x.ward))
    ]));
    spec(dl, "tree.girth", el("span", { "class": "mono", text: x.girthCm ? x.girthCm + " cm" : t("tree.unknown") }));
    spec(dl, "tree.height", el("span", { "class": "mono", text: x.heightM ? x.heightM + " m" : t("tree.unknown") }));
    spec(dl, "tree.age", el("span", { "class": "mono", text: x.ageYears ? x.ageYears + " " + t("tree.years") : t("tree.unknown") }));
    spec(dl, "tree.recorded", el("span", { "class": "mono", text: x.recorded || t("tree.unknown") }));
    spec(dl, "tree.id", el("span", { "class": "mono", text: x.id }));
    b.appendChild(dl);

    if (pick(x.notes)) {
      b.appendChild(el("h3", { text: t("tree.notes") }));
      b.appendChild(bi(x.notes, "p"));
    }

    lastFocus = document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    $("detail-close").focus();
    if (push) history.pushState({ tree: x.id }, "", "?tree=" + encodeURIComponent(x.id));
  }

  dialog.addEventListener("close", function () {
    if (location.search) history.pushState({}, "", location.pathname);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  $("detail-close").addEventListener("click", function () { dialog.close(); });

  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="?tree="]') : null;
    if (!a) return;
    e.preventDefault();
    var id = decodeURIComponent(a.getAttribute("href").slice(6));
    var x = T.trees.filter(function (n) { return n.id === id; })[0];
    if (x) openDetail(x, true);
  });

  window.addEventListener("popstate", function () {
    var id = new URLSearchParams(location.search).get("tree");
    if (!id) { if (dialog.open) dialog.close(); return; }
    var x = T.trees.filter(function (n) { return n.id === id; })[0];
    if (x) openDetail(x, false);
  });

  /* --- sorting ------------------------------------------------------------- */
  document.querySelectorAll("th[data-sort]").forEach(function (th) {
    var key = th.getAttribute("data-sort");
    var btn = th.querySelector(".sortbtn");
    btn.appendChild(el("span", {
      "class": "arrow", "aria-hidden": "true",
      html: '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="3"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
    }));
    btn.addEventListener("click", function () {
      if (state.sort === key) state.dir = state.dir === "asc" ? "desc" : "asc";
      else { state.sort = key; state.dir = "asc"; }
      render();
    });
  });

  function paintSort() {
    document.querySelectorAll("th[data-sort]").forEach(function (th) {
      var on = th.getAttribute("data-sort") === state.sort;
      if (on) th.setAttribute("aria-sort", state.dir === "asc" ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
      var btn = th.querySelector(".sortbtn");
      btn.setAttribute("aria-label", t("sort.by", { col: t("col." + th.getAttribute("data-sort")) }));
    });
  }

  /* --- render -------------------------------------------------------------- */
  function render() {
    var list = sortList(T.trees.filter(matches));
    renderRegister(list);
    renderLost(list);
    renderMap(list);
    paintSort();

    $("count").textContent = list.length === 1 ? t("results.one") : t("results.count", { n: list.length });
    $("c-register").textContent = list.length;
    $("c-map").textContent = list.filter(function (x) { return typeof x.lat === "number"; }).length;
    $("c-lost").textContent = list.filter(function (x) { return GONE[x.status]; }).length;
    moveIndicator();
  }

  /* --- filters ------------------------------------------------------------- */
  function fill(id, values, label, keep) {
    var sel = $(id), prev = keep === undefined ? sel.value : keep;
    sel.textContent = "";
    sel.appendChild(el("option", { value: "", text: t("filters.all") }));
    values.forEach(function (v) { sel.appendChild(el("option", { value: v, text: label(v) })); });
    sel.value = prev || "";
  }

  function buildSelects() {
    fill("f-status", STATUSES, function (v) { return t("status." + v); }, state.status);
    fill("f-ward", WARDS, function (v) { return t("ward." + v); }, state.ward);
    fill("f-species", SPECIES.map(function (s) { return s.id; }), speciesLabel, state.species);
  }

  function debounce(fn, ms) { var h; return function () { clearTimeout(h); h = setTimeout(fn, ms); }; }

  $("q").addEventListener("input", debounce(function () { state.q = $("q").value.trim(); render(); }, 200));
  $("f-status").addEventListener("change", function (e) { state.status = e.target.value; render(); });
  $("f-ward").addEventListener("change", function (e) { state.ward = e.target.value; render(); });
  $("f-species").addEventListener("change", function (e) { state.species = e.target.value; render(); });
  $("filters").addEventListener("submit", function (e) { e.preventDefault(); });
  $("clear").addEventListener("click", function () {
    state.q = state.status = state.ward = state.species = "";
    $("q").value = "";
    buildSelects(); render(); $("q").focus();
  });

  /* --- go ------------------------------------------------------------------ */
  window.i18n.init(function () { buildSelects(); renderColophon(); renderLedger(); render(); });

  if (!initMap()) {
    $("t-map").hidden = true;
    $("p-map").hidden = true;
  }
  buildSelects();
  renderColophon();
  renderLedger();
  if (T.meta && T.meta.seed) $("seed-notice").hidden = false;
  render();
  selectTab(0, false);

  var deep = new URLSearchParams(location.search).get("tree");
  if (deep) {
    var x = T.trees.filter(function (n) { return n.id === deep; })[0];
    if (x) openDetail(x, false);
  }
})();
