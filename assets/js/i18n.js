/* ---------------------------------------------------------------------------
   BILINGUAL STRINGS — English and Dhivehi (Thaana, right-to-left).

   To fix a translation, edit the text between the quotes on the dv line.
   Never change the key on the left. Keys must match between en and dv.

   All Dhivehi below is a first draft and needs a native-speaker pass.
   See TRANSLATION.md.
--------------------------------------------------------------------------- */

window.LANGS = {
  en: { name: "English",  dir: "ltr", code: "en" },
  dv: { name: "ދިވެހި",    dir: "rtl", code: "dv" }
};

window.I18N = {
  en: {
    "site.name": "The Last Trees of Malé",
    "site.tagline": "A citizen archive of the trees still standing — and the ones we lost.",
    "skip": "Skip to main content",
    "nav.label": "Main",
    "nav.archive": "Archive",
    "nav.submit": "Add a tree",
    "nav.about": "About",
    "lang.label": "Language",
    "lang.switch": "ދިވެހި",

    "stat.standing": "Still standing",
    "stat.lost": "Recorded lost",
    "stat.threatened": "Under threat",
    "stat.total": "Records in total",

    "filters.title": "Find a tree",
    "filters.search": "Search",
    "filters.searchHint": "Name, species, street or record number",
    "filters.status": "Status",
    "filters.ward": "Ward",
    "filters.species": "Species",
    "filters.all": "All",
    "filters.clear": "Clear filters",
    "filters.sort": "Sort by",
    "sort.recent": "Most recently added",
    "sort.girth": "Largest first",
    "sort.age": "Oldest first",
    "sort.name": "Name (A–Z)",

    "view.label": "View",
    "view.map": "Map",
    "view.list": "List",
    "map.caption": "Map of recorded trees. Every tree on this map is also in the list below, which works with a keyboard and a screen reader.",
    "map.attribution": "Map data © OpenStreetMap contributors",

    "results.count": "{n} trees match",
    "results.one": "1 tree matches",
    "results.none": "No trees match these filters.",
    "results.noneHint": "Try clearing a filter, or add this tree to the archive yourself.",

    "status.standing": "Standing",
    "status.lost": "Lost",
    "status.threatened": "Under threat",
    "status.relocated": "Relocated",

    "ward.henveiru": "Henveiru",
    "ward.galolhu": "Galolhu",
    "ward.maafannu": "Maafannu",
    "ward.machchangolhi": "Machchangolhi",
    "ward.villimale": "Villimalé",
    "ward.hulhumale": "Hulhumalé",

    "reason.road-widening": "Road widening",
    "reason.construction": "Construction",
    "reason.storm": "Storm damage",
    "reason.disease": "Disease or decay",
    "reason.safety": "Safety works",
    "reason.relocated": "Moved elsewhere",
    "reason.unknown": "Not known",

    "tree.id": "Record",
    "tree.species": "Species",
    "tree.location": "Location",
    "tree.girth": "Girth",
    "tree.height": "Height",
    "tree.age": "Estimated age",
    "tree.years": "years",
    "tree.notes": "Notes",
    "tree.photos": "Photographs",
    "tree.noPhoto": "No photograph yet",
    "tree.noPhotoHint": "Have one? Add it to the archive.",
    "tree.lostDate": "Removed",
    "tree.lostReason": "Reason",
    "tree.evidence": "Evidence",
    "tree.recorded": "Recorded",
    "tree.unverified": "Unverified",
    "tree.unverifiedFull": "Unverified — not yet checked against a source or a site visit.",
    "tree.verified": "Verified",
    "tree.open": "Open full record",
    "tree.close": "Close",
    "tree.unknown": "Not recorded",
    "tree.detailLabel": "Tree record",

    "seed.title": "This archive is still empty of real data",
    "seed.body": "Every record you can see is a placeholder, put here to build and test the site. Coordinates are approximate and no removal date has been confirmed. Replace them with real fieldwork.",

    "submit.title": "Add a tree to the archive",
    "submit.lede": "No account needed. A photograph and a rough location are enough to start — we can fill in the rest.",
    "submit.kind": "What are you recording?",
    "submit.kindStanding": "A tree that is still standing",
    "submit.kindLost": "A tree that was cut down or removed",
    "submit.photo": "Photograph",
    "submit.photoHint": "One photo, up to {mb} MB. The whole tree if you can, trunk and canopy.",
    "submit.photoChosen": "Selected: {name}",
    "submit.species": "What kind of tree is it?",
    "submit.speciesHint": "If you are not sure, choose “Not yet identified”. Someone else can confirm it.",
    "submit.where": "Where is it?",
    "submit.whereHint": "A street name or a landmark is fine.",
    "submit.ward": "Ward",
    "submit.geo": "Use my current location",
    "submit.geoOk": "Location captured: {lat}, {lng}",
    "submit.geoFail": "Could not get your location. Type the street name instead — that works just as well.",
    "submit.geoBusy": "Finding your location…",
    "submit.lostDate": "When was it removed?",
    "submit.lostDateHint": "An approximate month or year is fine.",
    "submit.lostReason": "Why was it removed, if you know?",
    "submit.notes": "Anything else worth recording",
    "submit.notesHint": "Its story, who planted it, how long it stood, what is there now.",
    "submit.private": "This tree is on private land",
    "submit.privateHint": "We will round the published location so the address is not identifiable.",
    "submit.name": "Your name",
    "submit.nameHint": "Optional. Used to credit the record.",
    "submit.email": "Your email",
    "submit.emailHint": "Optional. Only used if we need to ask you about the record.",
    "submit.consent": "I am happy for this photograph and description to be published in the archive under a Creative Commons licence.",
    "submit.send": "Send this record",
    "submit.sending": "Sending…",

    "err.title": "There is a problem with this form",
    "err.intro": "Fix the following and send again:",
    "err.required": "{field} is required.",
    "err.email": "Enter an email address in the form name@example.com, or leave it blank.",
    "err.photoSize": "That photo is {size} MB. The limit is {mb} MB — please choose a smaller one.",
    "err.photoType": "That file is not an image. Choose a JPG, PNG or HEIC photo.",
    "err.consent": "We need your permission before we can publish the record.",
    "err.send": "The submission could not be sent. Nothing was lost — copy the details below or send them by email.",

    "ok.title": "Thank you — record received",
    "ok.body": "A moderator will check it before it appears on the map. That usually protects the archive more than it slows it down.",
    "ok.another": "Add another tree",

    "fallback.title": "Almost there — one more step",
    "fallback.body": "This site has no submission inbox configured yet, so your record cannot be sent automatically. Nothing has been lost. Send it on with either button below.",
    "fallback.copy": "Copy the details",
    "fallback.copied": "Copied",
    "fallback.email": "Send by email",
    "fallback.summary": "Your record",
    "fallback.attach": "Attach your photograph to the email — it cannot be sent automatically.",
    "alt.github": "Already have a GitHub account?",
    "alt.githubHint": "You can file the record directly as a structured issue instead. Same information, and your name stays on it."
  },

  dv: {
    "site.name": "މާލޭގެ ފަހު ގަސްތައް",
    "site.tagline": "އަދިވެސް ދިރިހުރި ގަސްތަކާއި، ގެއްލިގެން ދިޔަ ގަސްތަކުގެ ރައްޔިތުންގެ ރެކޯޑެއް.",
    "skip": "މައިގަނޑު ބަޔަށް ދޭ",
    "nav.label": "މައި މެނޫ",
    "nav.archive": "ރެކޯޑުތައް",
    "nav.submit": "ގަހެއް އިތުރުކުރޭ",
    "nav.about": "މަޝްރޫޢާ ބެހޭ",
    "lang.label": "ބަސް",
    "lang.switch": "English",

    "stat.standing": "ދިރިހުރި",
    "stat.lost": "ގެއްލިފައި",
    "stat.threatened": "ނުރައްކަލުގައި",
    "stat.total": "ޖުމްލަ ރެކޯޑު",

    "filters.title": "ގަހެއް ހޯދާ",
    "filters.search": "ހޯދާ",
    "filters.searchHint": "ނަން، ބާވަތް، މަގު ނުވަތަ ރެކޯޑް ނަންބަރު",
    "filters.status": "ހާލަތު",
    "filters.ward": "އަވަށް",
    "filters.species": "ބާވަތް",
    "filters.all": "ހުރިހާ",
    "filters.clear": "ފިލްޓަރު ސާފުކުރޭ",
    "filters.sort": "ތަރުތީބުކުރޭ",
    "sort.recent": "އެންމެ ފަހުން އިތުރުކުރި",
    "sort.girth": "އެންމެ ބޮޑު",
    "sort.age": "އެންމެ ދުވަސްވީ",
    "sort.name": "ނަން",

    "view.label": "ދައްކާ ގޮތް",
    "view.map": "ޗާޓު",
    "view.list": "ލިސްޓު",
    "map.caption": "ރެކޯޑް ކުރެވިފައިވާ ގަސްތަކުގެ ޗާޓު. ޗާޓުގައިވާ ހުރިހާ ގަހެއް ތިރީގައިވާ ލިސްޓުގައިވެސް ހިމެނެއެވެ.",
    "map.attribution": "ޗާޓުގެ މަޢުލޫމާތު © OpenStreetMap",

    "results.count": "{n} ގަސް ފެނިއްޖެ",
    "results.one": "1 ގަސް ފެނިއްޖެ",
    "results.none": "މި ފިލްޓަރުތަކާ ގުޅޭ ގަހެއް ނެތް.",
    "results.noneHint": "ފިލްޓަރެއް ސާފުކޮށްލާ، ނުވަތަ މި ގަސް އަމިއްލައަށް އިތުރުކުރޭ.",

    "status.standing": "ދިރިހުރި",
    "status.lost": "ގެއްލިފައި",
    "status.threatened": "ނުރައްކަލުގައި",
    "status.relocated": "ބަދަލުކޮށްފައި",

    "ward.henveiru": "ހެންވޭރު",
    "ward.galolhu": "ގަލޮޅު",
    "ward.maafannu": "މާފަންނު",
    "ward.machchangolhi": "މައްޗަންގޮޅި",
    "ward.villimale": "ވިލިމާލެ",
    "ward.hulhumale": "ހުޅުމާލެ",

    "reason.road-widening": "މަގު ފުޅާކުރުން",
    "reason.construction": "ޢިމާރާތްކުރުން",
    "reason.storm": "ވިއްސާރައިގެ ގެއްލުން",
    "reason.disease": "ބައްޔެއް ނުވަތަ ފީވުން",
    "reason.safety": "ރައްކާތެރިކަމުގެ މަސައްކަތް",
    "reason.relocated": "އެހެން ތަނަކަށް ބަދަލުކުރުން",
    "reason.unknown": "ނޭނގޭ",

    "tree.id": "ރެކޯޑް",
    "tree.species": "ބާވަތް",
    "tree.location": "ތަން",
    "tree.girth": "ބުޑުގެ ވަށަމިން",
    "tree.height": "އުސްމިން",
    "tree.age": "އަންދާޒާ ޢުމުރު",
    "tree.years": "އަހަރު",
    "tree.notes": "ނޯޓު",
    "tree.photos": "ފޮޓޯ",
    "tree.noPhoto": "އަދި ފޮޓޯއެއް ނެތް",
    "tree.noPhotoHint": "ފޮޓޯއެއް އެބައޮތްތަ؟ އިތުރުކޮށްލާ.",
    "tree.lostDate": "ކަނޑާލި ތާރީޚު",
    "tree.lostReason": "ސަބަބު",
    "tree.evidence": "ހެކި",
    "tree.recorded": "ރެކޯޑް ކުރި ތާރީޚު",
    "tree.unverified": "ކަށަވަރު ނުކުރެވޭ",
    "tree.unverifiedFull": "ކަށަވަރު ނުކުރެވޭ — އަދި ހަވާލާއަކުން ނުވަތަ ސީދާ ބަލައިގެން ޗެކް ކުރެވިފައެއް ނުވޭ.",
    "tree.verified": "ކަށަވަރު ކުރެވިފައި",
    "tree.open": "ފުރިހަމަ ރެކޯޑް ބަލާ",
    "tree.close": "ބަންދުކުރޭ",
    "tree.unknown": "ރެކޯޑް ކުރެވިފައި ނުވޭ",
    "tree.detailLabel": "ގަހުގެ ރެކޯޑް",

    "seed.title": "މި ރެކޯޑުތަކުގައި އަދި ޙަޤީޤީ މަޢުލޫމާތެއް ނެތް",
    "seed.body": "މިހާރު ފެންނަން ހުރި ހުރިހާ ރެކޯޑަކީ ސައިޓް ތައްޔާރުކުރުމަށް ލާފައިވާ ވަގުތީ މަޢުލޫމާތެވެ. މަޤާމުތަކަކީ ގާތްގަނޑަކަށް ދިމާވާ ތަންތަނެވެ. ޙަޤީޤީ މަޢުލޫމާތުން ބަދަލުކުރައްވާ.",

    "submit.title": "ރެކޯޑުތަކަށް ގަހެއް އިތުރުކުރޭ",
    "submit.lede": "އެކައުންޓެއް ބޭނުމެއް ނުވޭ. ފޮޓޯއަކާއި ގާތްގަނޑަކަށް ހުރި ތަނެއް އެނގުނަސް ފުދޭ.",
    "submit.kind": "ތިޔަ ރެކޯޑް ކުރައްވަނީ ކޮން އެއްޗެއް؟",
    "submit.kindStanding": "އަދިވެސް ދިރިހުރި ގަހެއް",
    "submit.kindLost": "ކަނޑާލާފައިވާ ނުވަތަ ނަގާފައިވާ ގަހެއް",
    "submit.photo": "ފޮޓޯ",
    "submit.photoHint": "އެއް ފޮޓޯ، {mb} MB އަށް ވުރެ ބޮޑު ނުވާ. ވެއްޖެއްޔާ މުޅި ގަސް ފެންނަ ގޮތަށް.",
    "submit.photoChosen": "ހޮވިފައި: {name}",
    "submit.species": "މިއީ ކޮން ބާވަތެއްގެ ގަހެއް؟",
    "submit.speciesHint": "ޔަޤީން ނުވާނަމަ „ދެނެގަނެވިފައި ނުވޭ“ ހޮވާ. އެހެން މީހަކު ކަށަވަރު ކޮށްދޭނެ.",
    "submit.where": "ހުރީ ކޮންތާކު؟",
    "submit.whereHint": "މަގުގެ ނަން ނުވަތަ ކައިރީގައި ހުރި ތަނެއްގެ ނަން ފުދޭ.",
    "submit.ward": "އަވަށް",
    "submit.geo": "އަހަރެން މިހާރު ހުރި ތަން ބޭނުންކުރޭ",
    "submit.geoOk": "މަޤާމު ލިބިއްޖެ: {lat}, {lng}",
    "submit.geoFail": "މަޤާމު ހޯދޭ ގޮތެއް ނުވި. މަގުގެ ނަން ލިޔުއްވާ — އެވެސް ރަނގަޅު.",
    "submit.geoBusy": "މަޤާމު ހޯދަނީ…",
    "submit.lostDate": "ކަނޑާލީ ކޮން އިރަކު؟",
    "submit.lostDateHint": "ގާތްގަނޑަކަށް މަހެއް ނުވަތަ އަހަރެއް ފުދޭ.",
    "submit.lostReason": "އެނގޭނަމަ، ކަނޑާލީ ކީއްވެ؟",
    "submit.notes": "އިތުރު އެއްޗެއް",
    "submit.notesHint": "އޭގެ ވާހަކަ، އިންދީ ކާކު، ކިހާ ދުވަހެއް ވަންދެން ހުރި، މިހާރު އެތާ އޮތީ ކޮން އެއްޗެއް.",
    "submit.private": "މި ގަސް ހުރީ އަމިއްލަ ބިމެއްގައި",
    "submit.privateHint": "ގޭގެ އެޑްރެސް ނޭނގޭނެ ގޮތަށް މަޤާމު ގާތްގަނޑަކަށް ދައްކާނަން.",
    "submit.name": "ތިޔަބޭފުޅާގެ ނަން",
    "submit.nameHint": "އިޚްތިޔާރީ. ރެކޯޑަށް ކްރެޑިޓް ދިނުމަށް.",
    "submit.email": "އީމެއިލް",
    "submit.emailHint": "އިޚްތިޔާރީ. ސުވާލެއް އޮތްނަމަ އެކަނި ބޭނުންކުރާނަން.",
    "submit.consent": "މި ފޮޓޯއާއި ތަފްޞީލު ކްރިއޭޓިވް ކޮމަންސް ލައިސަންސްގެ ދަށުން ޝާއިޢުކުރުމަށް އަޅުގަނޑު ރުހެމެވެ.",
    "submit.send": "މި ރެކޯޑް ފޮނުވާ",
    "submit.sending": "ފޮނުވަނީ…",

    "err.title": "މި ފޯމުގައި މައްސަލައެއް އެބައޮތް",
    "err.intro": "ތިރީގައިވާ ކަންކަން ރަނގަޅުކޮށް އަލުން ފޮނުވާ:",
    "err.required": "{field} ބޭނުންވެއެވެ.",
    "err.email": "name@example.com މި ގޮތަށް އީމެއިލް އެޑްރެހެއް ލިޔުއްވާ، ނުވަތަ ހުސްކޮށް ބާއްވާ.",
    "err.photoSize": "މި ފޮޓޯއަކީ {size} MB. ހުއްދަ އެންމެ ބޮޑު މިންވަރަކީ {mb} MB — ކުޑަ ފޮޓޯއެއް ހޮވާ.",
    "err.photoType": "މިއީ ފޮޓޯއެއް ނޫން. JPG، PNG ނުވަތަ HEIC ފޮޓޯއެއް ހޮވާ.",
    "err.consent": "ޝާއިޢުކުރުމުގެ ކުރިން ތިޔަބޭފުޅާގެ ހުއްދަ ބޭނުންވެއެވެ.",
    "err.send": "ރެކޯޑް ފޮނުވޭ ގޮތެއް ނުވި. އެއްވެސް އެއްޗެއް ގެއްލިފައެއް ނުވޭ — ތިރީގައިވާ ތަފްޞީލު ކޮޕީކުރޭ ނުވަތަ އީމެއިލްކުރޭ.",

    "ok.title": "ޝުކުރިއްޔާ — ރެކޯޑް ލިބިއްޖެ",
    "ok.body": "ޗާޓުގައި ދެއްކުމުގެ ކުރިން މޮޑަރޭޓަރަކު ބަލާނެއެވެ.",
    "ok.another": "އިތުރު ގަހެއް އިތުރުކުރޭ",

    "fallback.title": "ކުޑަ ފިޔަވަޅެއް ބާކީ",
    "fallback.body": "މި ސައިޓަށް އަދި ފޮނުވާނެ އިންބޮކްސްއެއް ސެޓްކުރެވިފައެއް ނުވޭ. އެއްވެސް އެއްޗެއް ގެއްލިފައެއް ނުވޭ. ތިރީގައިވާ ބަޓަނަކުން ފޮނުވާލައްވާ.",
    "fallback.copy": "ތަފްޞީލު ކޮޕީކުރޭ",
    "fallback.copied": "ކޮޕީ ކުރެވިއްޖެ",
    "fallback.email": "އީމެއިލްކުރޭ",
    "fallback.summary": "ތިޔަބޭފުޅާގެ ރެކޯޑް",
    "fallback.attach": "ފޮޓޯ އީމެއިލްއާއެކު އެޓޭޗް ކުރައްވާ — އޮޓޮމެޓިކުން ނުފޮނުވޭނެ.",
    "alt.github": "GitHub އެކައުންޓެއް އެބައޮތްތަ؟",
    "alt.githubHint": "އެގޮތުންވެސް ސީދާ ރެކޯޑް ފޮނުވިދާނެ. އެއް މަޢުލޫމާތު، އަދި ތިޔަބޭފުޅާގެ ނަން ރެކޯޑްގައި ހުންނާނެ."
  }
};

/* --------------------------------------------------------------------------
   Runtime. Nothing below needs editing to change a translation.
-------------------------------------------------------------------------- */
window.i18n = (function () {
  var KEY = "mta.lang";
  var lang = "en";

  function detect() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
    if (saved && window.I18N[saved]) return saved;
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("dv") === 0 ? "dv" : "en";
  }

  function t(key, vars) {
    var dict = window.I18N[lang] || window.I18N.en;
    var s = dict[key];
    if (s === undefined) s = window.I18N.en[key];
    if (s === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(vars[k]);
      });
    }
    return s;
  }

  /* Pick the right half of a {en, dv} pair from the data files, falling back
     to whichever one actually has content. */
  function pick(pair) {
    if (!pair) return "";
    if (typeof pair === "string") return pair;
    return pair[lang] || pair.en || pair.dv || "";
  }

  /* The language a given string is actually in — so we can mark it up with
     the correct lang/dir even when it is a fallback in the other language. */
  function langOf(pair) {
    if (!pair || typeof pair === "string") return lang;
    return pair[lang] ? lang : (pair.en ? "en" : "dv");
  }

  function apply(root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      /* format: "aria-label:some.key, title:other.key" */
      el.getAttribute("data-i18n-attr").split(",").forEach(function (part) {
        var bits = part.split(":");
        if (bits.length === 2) el.setAttribute(bits[0].trim(), t(bits[1].trim()));
      });
    });
    /* Prose blocks written directly in the HTML. */
    root.querySelectorAll("[data-lang]").forEach(function (el) {
      el.hidden = el.getAttribute("data-lang") !== lang;
    });
  }

  function set(next, rerender) {
    if (!window.I18N[next]) return;
    lang = next;
    try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
    var meta = window.LANGS[lang];
    document.documentElement.setAttribute("lang", meta.code);
    document.documentElement.setAttribute("dir", meta.dir);
    apply();
    if (typeof rerender === "function") rerender();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: lang } }));
  }

  function init(rerender) {
    set(detect(), rerender);
    document.querySelectorAll("[data-lang-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        set(lang === "en" ? "dv" : "en", rerender);
        btn.setAttribute("aria-label", window.i18n.t("lang.label"));
      });
    });
  }

  return {
    t: t, pick: pick, langOf: langOf, apply: apply, init: init, set: set,
    get current() { return lang; },
    get dir() { return window.LANGS[lang].dir; }
  };
})();
