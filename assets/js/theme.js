/* ---------------------------------------------------------------------------
   Light or dark, chosen or inherited.

   Dark by default, whatever the operating system says. A register of trees is
   mostly looked at as a map, and the imagery it opens on reads better against
   a dark ground. Light is one click away and the choice is remembered, so
   anyone who finds dark harder to read pays for it once.

   The first few lines run from <head>, before anything is painted. Deciding
   the theme after first paint is what produces the white flash that dark-mode
   users notice immediately.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  var KEY = "mta.theme";
  var root = document.documentElement;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function apply(v) {
    if (v === "light" || v === "dark") root.setAttribute("data-theme", v);
    else root.removeAttribute("data-theme");
  }

  function current() {
    var v = stored();
    return v === "light" || v === "dark" ? v : "dark";
  }

  apply(current());

  var SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2' +
            'M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2' +
            'M4.6 19.4l1.4-1.4M18 6l1.4-1.4"/>';
  var MOON = '<path d="M21 12.9A9 9 0 1 1 11.1 3a7.2 7.2 0 0 0 9.9 9.9Z"/>';

  function wire() {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    function paint() {
      var next = current() === "dark" ? "light" : "dark";
      btn.innerHTML = '<svg class="ico" width="16" height="16" viewBox="0 0 24 24" ' +
        'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
        'aria-hidden="true">' + (next === "dark" ? MOON : SUN) + "</svg>";
      var label = window.i18n ? window.i18n.t("theme." + next)
                             : ("Switch to the " + next + " theme");
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    }

    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch (e) { /* private mode */ }
      apply(next);
      paint();
    });

    /* The label is words, so it changes with the language. */
    document.addEventListener("langchange", paint);

    paint();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
