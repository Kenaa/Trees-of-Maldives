/* ---------------------------------------------------------------------------
   BILINGUAL STRINGS. English and Dhivehi (Thaana, right-to-left).

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
    "site.tagline": "A public register of the trees still standing in Malé, and the ones that are gone.",
    "skip": "Skip to main content",
    "nav.label": "Main",
    "nav.archive": "Register",
    "nav.submit": "Add a tree",
    "nav.about": "About",
    "lang.label": "Language",
    "lang.switch": "ދިވެހި",
    "stat.standing": "Still standing",
    "stat.lost": "Gone",
    "stat.threatened": "Under threat",
    "stat.total": "Records",
    "filters.title": "Find a tree",
    "filters.search": "Search",
    "filters.searchHint": "Name, species, street or record number",
    "filters.status": "Status",
    "filters.ward": "Ward",
    "filters.species": "Species",
    "filters.all": "All",
    "filters.clear": "Clear filters",
    "view.map": "Map",
    "map.attribution": "Map data © OpenStreetMap contributors",
    "results.count": "{n} trees match",
    "results.one": "1 tree matches",
    "results.none": "No trees match these filters.",
    "results.noneHint": "Try clearing a filter, or add this tree to the register yourself.",
    "status.cutback": "Cut back",
    "stat.cutback": "Cut back",
    "submit.kindCutback": "A tree that was cut back or heavily pruned",
    "submit.speciesOther": "Not in the list? What do people call it?",
    "submit.speciesOtherHint": "The local name, however it is spelt. Someone will match it to the list later.",
    "submit.pin": "Put a pin where the tree is",
    "submit.pinHint": "Tap the map to drop a pin, then drag it to adjust. Or type the coordinates below.",
    "submit.lat": "Latitude",
    "submit.lng": "Longitude",
    "submit.people": "No one can be identified in these photographs, or everyone in them has agreed to appear.",
    "reason.maintenance": "Routine maintenance",
    "reason.powerlines": "Power lines",
    "err.people": "Please confirm the photographs before sending.",
    "err.coords": "Put a pin on the map, or type the coordinates.",
    "err.photoCount": "That is {n} photographs. The limit is {max}.",
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
    "tree.noPhotoHint": "Have one? Add it to the register.",
    "tree.lostDate": "Removed",
    "tree.lostReason": "Reason",
    "tree.evidence": "Evidence",
    "tree.recorded": "Added",
    "tree.unverified": "Unverified",
    "tree.unverifiedFull": "Unverified. Nobody has checked this against a source or visited the tree.",
    "tree.verified": "Verified",
    "tree.open": "Open full record",
    "tree.close": "Close",
    "tree.unknown": "Not recorded",
    "tree.detailLabel": "Tree record",
    "seed.title": "Nothing here is real data yet",
    "seed.body": "Every record below is a placeholder, put here to build and test the register. Coordinates are approximate and no removal date has been confirmed. Replace them with real fieldwork.",
    "submit.title": "Add a tree to the register",
    "submit.lede": "No account needed. A photograph and a rough location are enough to start. Someone can fill in the rest later.",
    "submit.kind": "What are you recording?",
    "submit.kindStanding": "A tree that is still standing",
    "submit.kindLost": "A tree that was cut down or removed",
    "submit.photo": "Photograph",
    "submit.photoHint": "Up to {max} photographs, {mb} MB each. The whole tree, the trunk, and anything showing its condition.",
    "submit.photoChosen": "{n} selected",
    "submit.species": "What kind of tree is it?",
    "submit.speciesHint": "If you are not sure, choose “Not yet identified”. Someone else can confirm it.",
    "submit.where": "Where is it?",
    "submit.whereHint": "A street name or a landmark is fine.",
    "submit.ward": "Ward",
    "submit.geo": "Use my current location",
    "submit.geoOk": "Location captured: {lat}, {lng}",
    "submit.geoFail": "Could not get your location. Type the street name instead. That works just as well.",
    "submit.geoBusy": "Finding your location…",
    "submit.lostDate": "When did it happen?",
    "submit.lostDateHint": "An approximate month or year is fine.",
    "submit.lostReason": "Why, if you know?",
    "submit.notes": "Anything else worth recording",
    "submit.notesHint": "Its story, who planted it, how long it stood, what is there now.",
    "submit.private": "This tree is on private land",
    "submit.name": "Your name",
    "submit.nameHint": "Optional. Used to credit the record.",
    "submit.email": "Your email",
    "submit.emailHint": "Optional. Only used if we need to ask you about the record.",
    "submit.consent": "I am happy for this photograph and description to be published in the register under a Creative Commons licence.",
    "submit.send": "Send this record",
    "submit.sending": "Sending…",
    "err.title": "There is a problem with this form",
    "err.intro": "Fix the following and send again:",
    "err.required": "{field} is required.",
    "err.email": "Enter an email address in the form name@example.com, or leave it blank.",
    "err.photoSize": "That photo is {size} MB. The limit is {mb} MB, so please choose a smaller one.",
    "err.photoType": "That file is not an image. Choose a JPG, PNG or HEIC photo.",
    "err.consent": "We need your permission before we can publish the record.",
    "err.send": "The submission could not be sent. Nothing was lost. Copy the details below, or send them by email.",
    "ok.title": "Thank you. Record received.",
    "ok.body": "A moderator will check it before it appears in the register.",
    "ok.another": "Add another tree",
    "fallback.title": "One more step",
    "fallback.body": "This site has no submission inbox configured yet, so your record cannot be sent automatically. Nothing has been lost. Send it on with either button below.",
    "fallback.copy": "Copy the details",
    "fallback.copied": "Copied",
    "fallback.email": "Send by email",
    "fallback.summary": "Your record",
    "fallback.attach": "Attach your photograph to the email. It cannot be sent automatically.",
    "alt.github": "Already have a GitHub account?",
    "alt.githubHint": "You can file the record directly as a structured issue instead. Same information, and your name stays on it.",
    "colophon.what": "Register of standing and felled trees",
    "colophon.place": "Malé City",
    "colophon.records": "{n} records",
    "colophon.updated": "Updated {date}",
    "ledger.label": "Totals",
    "tabs.label": "Views",
    "tab.register": "Register",
    "tab.lost": "Lost",
    "table.region": "Register table, scrollable",
    "table.caption": "Every recorded tree. Sort by any column. Pointing at a row marks that tree on the map.",
    "col.id": "Record",
    "col.name": "Name",
    "col.species": "Species",
    "col.ward": "Ward",
    "col.status": "Status",
    "col.girth": "Girth",
    "sort.by": "Sort by {col}",
    "map.note": "Every tree on this map is also in the register, which works with a keyboard and a screen reader.",
    "lost.lede": "Trees cut down, cut back to a stump, or moved somewhere else. Each one needs a date and a source before it counts as evidence.",
    "lost.none": "No losses match these filters."
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
    "view.map": "ޗާޓު",
    "map.attribution": "ޗާޓުގެ މަޢުލޫމާތު © OpenStreetMap",
    "results.count": "{n} ގަސް ފެނިއްޖެ",
    "results.one": "1 ގަސް ފެނިއްޖެ",
    "results.none": "މި ފިލްޓަރުތަކާ ގުޅޭ ގަހެއް ނެތް.",
    "results.noneHint": "ފިލްޓަރެއް ސާފުކޮށްލާ، ނުވަތަ މި ގަސް އަމިއްލައަށް އިތުރުކުރޭ.",
    "status.cutback": "ކޮށާލާފައި",
    "stat.cutback": "ކޮށާލާފައި",
    "submit.kindCutback": "ކޮށާލާފައި ނުވަތަ ބޮޑުތަނުން ކުޑަކޮށްފައިވާ ގަހެއް",
    "submit.speciesOther": "ލިސްޓުގައި ނެތްތަ؟ މީހުން މިއަށް ކިޔަނީ ކީކޭ؟",
    "submit.speciesOtherHint": "އާންމުކޮށް ކިޔާ ނަން، ކޮންމެ ގޮތަކަށް ލިޔުނަސް ރަނގަޅު.",
    "submit.pin": "ގަސް ހުރި ތަނުގައި ޕިން ޖައްސަވާ",
    "submit.pinHint": "ޗާޓުގައި ފިއްތަވާ. ޕިން ދަމައިގެން ބަދަލުކުރެވޭނެ. ނުވަތަ ތިރީގައި ކޯޑިނޭޓް ލިޔުއްވާ.",
    "submit.lat": "ލެޓިޓިއުޑް",
    "submit.lng": "ލޮންޖިޓިއުޑް",
    "submit.people": "މި ފޮޓޯތަކުން އެއްވެސް މީހަކު ދެނެގަނެވޭކަށް ނެތް، ނުވަތަ އެ މީހުންގެ ރުހުން ލިބިފައިވޭ.",
    "reason.maintenance": "އާދައިގެ މަރާމާތު",
    "reason.powerlines": "ކަރަންޓު ވައުތައް",
    "err.people": "ފޮނުވުމުގެ ކުރިން ފޮޓޯތަކާ މެދު ކަށަވަރުކޮށްދެއްވާ.",
    "err.coords": "ޗާޓުގައި ޕިން ޖައްސަވާ، ނުވަތަ ކޯޑިނޭޓް ލިޔުއްވާ.",
    "err.photoCount": "ތިޔައީ {n} ފޮޓޯ. ހުއްދައީ {max} ފޮޓޯ.",
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
    "tree.unverifiedFull": "ކަށަވަރު ނުކުރެވޭ. އަދި ހަވާލާއަކުން ނުވަތަ ސީދާ ބަލައިގެން ޗެކް ކުރެވިފައެއް ނުވޭ.",
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
    "submit.photoHint": "{max} ފޮޓޯއާ ހަމައަށް، ކޮންމެ ފޮޓޯއެއް {mb} MB އަށް ވުރެ ކުޑަ.",
    "submit.photoChosen": "{n} ފޮޓޯ ހޮވިއްޖެ",
    "submit.species": "މިއީ ކޮން ބާވަތެއްގެ ގަހެއް؟",
    "submit.speciesHint": "ޔަޤީން ނުވާނަމަ „ދެނެގަނެވިފައި ނުވޭ“ ހޮވާ. އެހެން މީހަކު ކަށަވަރު ކޮށްދޭނެ.",
    "submit.where": "ހުރީ ކޮންތާކު؟",
    "submit.whereHint": "މަގުގެ ނަން ނުވަތަ ކައިރީގައި ހުރި ތަނެއްގެ ނަން ފުދޭ.",
    "submit.ward": "އަވަށް",
    "submit.geo": "އަހަރެން މިހާރު ހުރި ތަން ބޭނުންކުރޭ",
    "submit.geoOk": "މަޤާމު ލިބިއްޖެ: {lat}, {lng}",
    "submit.geoFail": "މަޤާމު ހޯދޭ ގޮތެއް ނުވި. މަގުގެ ނަން ލިޔުއްވާ. އެވެސް ރަނގަޅު.",
    "submit.geoBusy": "މަޤާމު ހޯދަނީ…",
    "submit.lostDate": "މިކަން ހިނގީ ކޮން އިރަކު؟",
    "submit.lostDateHint": "ގާތްގަނޑަކަށް މަހެއް ނުވަތަ އަހަރެއް ފުދޭ.",
    "submit.lostReason": "އެނގޭނަމަ، ކީއްވެ؟",
    "submit.notes": "އިތުރު އެއްޗެއް",
    "submit.notesHint": "އޭގެ ވާހަކަ، އިންދީ ކާކު، ކިހާ ދުވަހެއް ވަންދެން ހުރި، މިހާރު އެތާ އޮތީ ކޮން އެއްޗެއް.",
    "submit.private": "މި ގަސް ހުރީ އަމިއްލަ ބިމެއްގައި",
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
    "err.photoSize": "މި ފޮޓޯއަކީ {size} MB. ހުއްދަ އެންމެ ބޮޑު މިންވަރަކީ {mb} MB. ކުޑަ ފޮޓޯއެއް ހޮވާ.",
    "err.photoType": "މިއީ ފޮޓޯއެއް ނޫން. JPG، PNG ނުވަތަ HEIC ފޮޓޯއެއް ހޮވާ.",
    "err.consent": "ޝާއިޢުކުރުމުގެ ކުރިން ތިޔަބޭފުޅާގެ ހުއްދަ ބޭނުންވެއެވެ.",
    "err.send": "ރެކޯޑް ފޮނުވޭ ގޮތެއް ނުވި. އެއްވެސް އެއްޗެއް ގެއްލިފައެއް ނުވޭ. ތިރީގައިވާ ތަފްޞީލު ކޮޕީކުރޭ ނުވަތަ އީމެއިލްކުރޭ.",
    "ok.title": "ޝުކުރިއްޔާ. ރެކޯޑް ލިބިއްޖެ",
    "ok.body": "ޗާޓުގައި ދެއްކުމުގެ ކުރިން މޮޑަރޭޓަރަކު ބަލާނެއެވެ.",
    "ok.another": "އިތުރު ގަހެއް އިތުރުކުރޭ",
    "fallback.title": "ކުޑަ ފިޔަވަޅެއް ބާކީ",
    "fallback.body": "މި ސައިޓަށް އަދި ފޮނުވާނެ އިންބޮކްސްއެއް ސެޓްކުރެވިފައެއް ނުވޭ. އެއްވެސް އެއްޗެއް ގެއްލިފައެއް ނުވޭ. ތިރީގައިވާ ބަޓަނަކުން ފޮނުވާލައްވާ.",
    "fallback.copy": "ތަފްޞީލު ކޮޕީކުރޭ",
    "fallback.copied": "ކޮޕީ ކުރެވިއްޖެ",
    "fallback.email": "އީމެއިލްކުރޭ",
    "fallback.summary": "ތިޔަބޭފުޅާގެ ރެކޯޑް",
    "fallback.attach": "ފޮޓޯ އީމެއިލްއާއެކު އެޓޭޗް ކުރައްވާ. އޮޓޮމެޓިކުން ނުފޮނުވޭނެ.",
    "alt.github": "GitHub އެކައުންޓެއް އެބައޮތްތަ؟",
    "alt.githubHint": "އެގޮތުންވެސް ސީދާ ރެކޯޑް ފޮނުވިދާނެ. އެއް މަޢުލޫމާތު، އަދި ތިޔަބޭފުޅާގެ ނަން ރެކޯޑްގައި ހުންނާނެ.",
    "colophon.what": "ދިރިހުރި އަދި ގެއްލިފައި",
    "colophon.place": "މާލެ",
    "colophon.records": "{n} ރެކޯޑް",
    "colophon.updated": "ތާރީޚު {date}",
    "ledger.label": "ޖުމްލަ",
    "tabs.label": "ދައްކާ ގޮތް",
    "tab.register": "ރެކޯޑުތައް",
    "tab.lost": "ގެއްލިފައި",
    "table.region": "ރެކޯޑުތައް ތާވަލު",
    "table.caption": "ރެކޯޑުތައް. ތަރުތީބުކުރޭ.",
    "col.id": "ރެކޯޑް",
    "col.name": "ނަން",
    "col.species": "ބާވަތް",
    "col.ward": "އަވަށް",
    "col.status": "ހާލަތު",
    "col.girth": "ބުޑުގެ ވަށަމިން",
    "sort.by": "{col} ތަރުތީބުކުރޭ",
    "map.note": "ރެކޯޑް ކުރެވިފައިވާ ގަސްތަކުގެ ޗާޓު. ޗާޓުގައިވާ ހުރިހާ ގަހެއް ތިރީގައިވާ ލިސްޓުގައިވެސް ހިމެނެއެވެ.",
    "lost.lede": "ގެއްލިފައި ބަދަލުކޮށްފައި. ހެކި.",
    "lost.none": "މި ފިލްޓަރުތަކާ ގުޅޭ ގަހެއް ނެތް."
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

  /* The language a given string is actually in, so we can mark it up with
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

    /* The toggle's own label is written in the language it switches TO, so it
       has to be marked as a foreign fragment (WCAG 3.1.2). Without this a
       screen reader reads Thaana with an English voice, and the Thaana font
       stack never applies to it. */
    var other = lang === "en" ? "dv" : "en";
    document.querySelectorAll('[data-lang-toggle] [data-i18n="lang.switch"]').forEach(function (el) {
      el.setAttribute("lang", window.LANGS[other].code);
      el.setAttribute("dir", window.LANGS[other].dir);
    });
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
