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

  /* What to call a record in a heading.

     A tree with a name people actually use keeps it: the Sultan Park banyan is
     the Sultan Park banyan. A submitted record has no such name, so it is
     called what it is, and the street underneath says where. Repeating the
     street in both lines, which is what happened before, told the reader
     nothing twice and buried the species. */
  /* The common name, with the other language's name beside it. Both are shown
     because a reader looking for "ruh" and a reader looking for "coconut palm"
     are looking for the same tree. */
  function commonName(x) {
    var sp = byId[x.species];
    var wrap = el("span", { "class": "name-pair" });
    if (!sp) { wrap.textContent = x.species || x.id; return wrap; }
    var dvName = sp.dv || sp.dvLatin || "";
    var thaana = !!sp.dv;
    if (window.i18n.current === "dv") {
      wrap.appendChild(el("span", { text: dvName || sp.en }));
      if (dvName && sp.en) {
        wrap.appendChild(el("span", { "class": "alt-name", lang: "en", dir: "ltr", text: sp.en }));
      }
    } else {
      wrap.appendChild(el("span", { text: sp.en }));
      if (dvName) {
        wrap.appendChild(el("span", {
          "class": "alt-name", lang: "dv", dir: thaana ? "rtl" : "ltr", text: dvName
        }));
      }
    }
    return wrap;
  }

  function coords(x) {
    if (typeof x.lat !== "number" || typeof x.lng !== "number") return "\u2014";
    return x.lat.toFixed(5) + ", " + x.lng.toFixed(5);
  }

  function titleOf(x) {
    if (pick(x.name)) return bi(x.name);
    var s = byId[x.species];
    if (!s) return el("span", { text: x.id });
    if (window.i18n.current === "dv" && (s.dv || s.dvLatin)) {
      return el("span", { text: s.dv || s.dvLatin });
    }
    return el("span", { text: s.en });
  }

  function titleText(x) {
    var n = titleOf(x);
    return n.textContent || "";
  }

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
      var hay = [x.id, pick(x.name), pick(x.place), s.sci, s.en, s.dv, s.dvLatin,
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
      if (k === "age") r = (a.ageYears || 0) - (b.ageYears || 0);
      else if (k === "girth") r = (a.girthCm || 0) - (b.girthCm || 0);
      else if (k === "name") r = coll.compare(titleText(a), titleText(b));
      else if (k === "location") r = coll.compare(pick(a.place), pick(b.place));
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

    /* Species: the common name over the binomial. This is the column that
       answers "what is it", so it carries the link to the full record. */
    var link = el("a", { href: "?tree=" + encodeURIComponent(x.id) });
    link.appendChild(commonName(x));
    var speciesCell = el("td", { "class": "rec-name" }, [link]);
    if (s.sci) {
      speciesCell.appendChild(el("div", { "class": "rec-sci", lang: "la", text: s.sci }));
    }
    tr.appendChild(speciesCell);

    /* Location: the coordinates over whatever the recorder called the place. */
    var loc = el("td", { "class": "col-opt" });
    loc.appendChild(el("div", { "class": "num", text: coords(x) }));
    loc.appendChild(el("div", { "class": "dim", style: "font-size:.82rem" }, [bi(x.place)]));
    tr.appendChild(loc);

    tr.appendChild(el("td", { "class": "col-opt", text: t("ward." + x.ward) }));

    var st = el("td", {}, [stamp(x.status)]);
    if (!x.verified) { st.appendChild(document.createTextNode(" ")); st.appendChild(unverified()); }
    tr.appendChild(st);

    tr.appendChild(el("td", { "class": "col-opt num",
      text: x.ageYears ? x.ageYears + " " + t("tree.years") : "\u2014" }));
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
      link.appendChild(titleOf(x));

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

  /* --- map -----------------------------------------------------------------
     MapLibre with OpenFreeMap's vector tiles, which need no API key. Vector
     tiles are what make the pitch and rotate possible, and they carry the
     building footprints the island reads by.

     The map is an enhancement throughout. Every tree on it is in the register
     table, which is the path that works with a keyboard and a screen reader,
     so nothing is lost when the library or the tile host is unreachable. */
  var map = null, markers = {};
  var MARK = { standing: "--ink", lost: "--verm", threatened: "--verm",
               relocated: "--muted", cutback: "--verm" };

  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function markerEl(x) {
    var c = css(MARK[x.status]), paper = css("--paper");
    var d = document.createElement("div");
    d.className = "marker";
    d.setAttribute("data-id", x.id);
    d.innerHTML =
      '<span class="marker-pin">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="' + paper + '" stroke="' + c +
      '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="1" y="1" width="22" height="22" fill="' + paper + '" stroke="' + c +
      '" stroke-width="2"/>' + GLYPH[x.status] + '</svg></span>';
    return d;
  }

  function popupFor(x) {
    return el("div", {}, [
      el("h3", { style: "margin:0 0 .2rem" }, [titleOf(x)]),
      el("p", { "class": "rec-sci", style: "margin:0 0 .4rem", lang: "la",
                text: (byId[x.species] || {}).sci || "" }),
      el("p", { style: "margin:0 0 .5rem" }, [stamp(x.status)]),
      el("p", { style: "margin:0" }, [
        el("a", { href: "?tree=" + encodeURIComponent(x.id), text: t("tree.open") })
      ])
    ]);
  }

  function initMap() {
    if (typeof maplibregl === "undefined") return false;
    var c = window.CONFIG.map;
    var flat = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      map = new maplibregl.Map({
        container: "map",
        style: "https://tiles.openfreemap.org/styles/liberty",
        /* CONFIG stores lat,lng because that is how people write coordinates
           and how the form collects them. MapLibre wants lng,lat, so the flip
           happens here and nowhere else. */
        center: [c.center[1], c.center[0]],
        zoom: c.zoom, minZoom: c.minZoom, maxZoom: c.maxZoom,
        maxBounds: [[c.maxBounds[0][1], c.maxBounds[0][0]],
                    [c.maxBounds[1][1], c.maxBounds[1][0]]],
        /* Tilted on arrival, because the tilt is the point. Anyone who has
           asked not to be moved around gets it flat. */
        pitch: flat ? 0 : 50,
        bearing: flat ? 0 : -18,
        scrollZoom: false,
        dragRotate: true,
        attributionControl: false
      });
    } catch (e) { return false; }

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new LayerToggle(), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    /* The canvas is a picture to anything that cannot see it. Naming it and
       pointing at the table is more honest than leaving it unlabelled. */
    var canvas = map.getCanvas();
    canvas.setAttribute("aria-label", t("map.note"));

    /* Wheel zoom would otherwise swallow the page scroll, so it only engages
       once someone has actually put focus or a click on the map. */
    function wheelOn() { map.scrollZoom.enable(); }
    function wheelOff() { map.scrollZoom.disable(); }
    canvas.addEventListener("focus", wheelOn);
    canvas.addEventListener("blur", wheelOff);
    map.on("click", wheelOn);
    map.getContainer().addEventListener("mouseleave", wheelOff);

    /* Only the building layer waits for the style: it edits paint properties
       that do not exist until then. Markers are DOM elements the map merely
       positions, so they go on immediately and survive a style that is slow,
       throttled, or never finishes. */
    map.on("load", function () {
      try { showBuildings(); } catch (e) { /* the style may not carry the layer */ }
      try { addSatellite(); } catch (e) { /* imagery is an extra, never a blocker */ }
    });
    map.on("error", function () { /* a missing tile should not take the page down */ });
    return true;
  }

  /* --- satellite ------------------------------------------------------------
     Esri's World Imagery, which needs no API key and has sub-metre coverage
     over Malé. For a register of trees this is not decoration: canopy is
     visible in imagery in a way it never is on a street map, so a contributor
     can check a record against what is actually on the ground.

     The raster goes in below the building layers, so buildings and every label
     still draw on top and the result reads as a hybrid rather than a bare
     photograph. */
  var satelliteOn = false;

  function addSatellite() {
    if (map.getSource("satellite")) return;
    map.addSource("satellite", {
      type: "raster",
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/" +
              "World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Imagery &copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics'
    });
    map.addLayer({
      id: "satellite", type: "raster", source: "satellite",
      layout: { visibility: "none" }
    }, map.getLayer("building") ? "building" : undefined);
  }

  function setSatellite(on) {
    if (!map || !map.getLayer("satellite")) return;
    satelliteOn = on;
    map.setLayoutProperty("satellite", "visibility", on ? "visible" : "none");
    /* The flat building fill would sit as grey blocks over the photograph and
       hide the very thing someone switched to imagery to look at. The extruded
       version stays, because it only shows when the map is tilted. */
    if (map.getLayer("building")) {
      map.setLayoutProperty("building", "visibility", on ? "none" : "visible");
    }
  }

  function LayerToggle() {}
  LayerToggle.prototype.onAdd = function () {
    var wrap = document.createElement("div");
    wrap.className = "maplibregl-ctrl maplibregl-ctrl-group";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "map-layer-btn";
    b.textContent = t("map.satellite");
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      setSatellite(!satelliteOn);
      b.textContent = t(satelliteOn ? "map.streets" : "map.satellite");
      b.setAttribute("aria-pressed", String(satelliteOn));
    });
    wrap.appendChild(b);
    this._el = wrap;
    return wrap;
  };
  LayerToggle.prototype.onRemove = function () {
    if (this._el && this._el.parentNode) this._el.parentNode.removeChild(this._el);
  };

  /* The Liberty style ships a building-3d extrusion layer. It is switched on
     here and tinted to the register's palette so the city reads as mass rather
     than as decoration. */
  function showBuildings() {
    if (!map.getLayer("building-3d")) return;
    map.setLayoutProperty("building-3d", "visibility", "visible");
    map.setPaintProperty("building-3d", "fill-extrusion-color", css("--rule"));
    map.setPaintProperty("building-3d", "fill-extrusion-opacity", 0.85);
  }

  var lastList = [];

  function renderMap(list) {
    lastList = list;
    if (!map) return;
    Object.keys(markers).forEach(function (id) { markers[id].remove(); });
    markers = {};
    list.forEach(function (x) {
      if (typeof x.lat !== "number" || typeof x.lng !== "number") return;
      var elm = markerEl(x);
      var m = new maplibregl.Marker({ element: elm })
        .setLngLat([x.lng, x.lat])
        .setPopup(new maplibregl.Popup({ offset: 16, closeButton: true })
          .setDOMContent(popupFor(x)))
        .addTo(map);
      /* MapLibre stamps its own role and a generic "Map marker" label onto the
         element when it is added, so the real one goes on afterwards. A pin
         that announces itself as "Map marker" tells a screen-reader user
         nothing about which tree they have landed on. */
      elm.setAttribute("role", "button");
      elm.setAttribute("tabindex", "0");
      elm.setAttribute("aria-label", titleText(x) + ", " + t("status." + x.status));
      elm.addEventListener("mouseenter", function () { highlight(x.id, false); });
      elm.addEventListener("mouseleave", function () { highlight(null, false); });
      elm.addEventListener("focus", function () { highlight(x.id, false); });
      elm.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); m.togglePopup(); }
      });
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
    if (i === 1 && map) setTimeout(function () { map.resize(); }, 0);
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
    title.appendChild(titleOf(x));

    var b = $("detail-body");
    b.textContent = "";

    if (x.photos && x.photos.length) {
      x.photos.forEach(function (p) {
        b.appendChild(el("img", { src: p.src, alt: pick(p.alt) || titleText(x) }));
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
    /* The form says a name is "used to credit the record", so it has to appear
       somewhere. This is that somewhere. */
    if (x.credit) spec(dl, "tree.credit", el("span", { text: x.credit }));
    /* What the submitter called the tree when the list had no entry for it. */
    if (x.speciesAsNamed) spec(dl, "tree.asNamed", el("span", { lang: "dv", text: x.speciesAsNamed }));
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
