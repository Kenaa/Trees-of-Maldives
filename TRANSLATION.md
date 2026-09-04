# Dhivehi translation

**Status: first draft, not yet reviewed by a native speaker.**

Every Dhivehi string in this project was written without a native review pass. The
structure is sound: right-to-left layout, Thaana typography, correct `lang`
attributes so screen readers switch voice. The wording needs checking, and some
of it is likely to be wrong or unidiomatic.

Three places need review, in order of how much they matter.

## 1. Interface strings: `assets/js/i18n.js`

Everything a visitor reads: buttons, labels, error messages. Roughly 124 strings.
Each appears twice in the file, once under `en:` and once under `dv:`:

```js
"submit.send": "Send this record",     // in the en block
"submit.send": "މި ރެކޯޑް ފޮނުވާ",      // the same key in the dv block
```

Fix the text between the quotes on the `dv` line. **Never change the key on the left**,
and never delete a line. The two blocks must keep exactly the same set of keys.

Watch for `{n}`, `{mb}`, `{field}` and similar. These are filled in with real values at
runtime and must survive into the Dhivehi version, though they can move within the
sentence to wherever the grammar wants them.

## 2. Page prose: `about.html`

The About page carries two parallel blocks of writing:

```html
<div data-lang="en" lang="en">   … English …   </div>
<div data-lang="dv" lang="dv" dir="rtl" hidden>   … ދިވެހި …   </div>
```

Edit inside the `dv` block. The Dhivehi version is deliberately a little shorter than
the English; a faithful rewrite that reads naturally is better than a literal one.

## 3. Species names: `data/species.js`

Source: FAO, *Trees and Shrubs of the Maldives* (Selvam, 2007, RAP Publication
2007/12). Every species in the register now carries a name from it. They were
resolved by matching page numbers between the book's two indexes, the index of
scientific and common names and the index of Dhivehi names, so each one is
checkable against a specific page.

Each species carries four fields:

| field | meaning |
|---|---|
| `dv` | the name in Thaana, which is what the site displays |
| `dvLatin` | the book's romanisation, copied verbatim |
| `dvPage` | the page in the book, so the name can be checked |
| `dvReview` | true where the Thaana is my transliteration, not a checked spelling |

### Please check these first (15)

The romanisation is the book's and is reliable. The Thaana beside it is my
transliteration of that romanisation, which is the step most likely to be wrong.

| page | species | book spelling | Thaana |
|---|---|---|---|
| 17 | `adenanthera-pavonina` | Madhoshi | މަދޮށި |
| 21 | `allophylus-cobbe` | Dhon'moosa | ދޮންމޫސާ |
| 41 | `barringtonia-asiatica` | Kin'bi | ކިންބި |
| 101 | `guettarda-speciosa` | Uni | އުނި |
| 103 | `hernandia-nymphaeifolia` | Kandhu | ކަންދު |
| 105 | `hibiscus-tiliaceus` | Dhigga | ދިގގަ |
| 117 | `morinda-citrifolia` | Ahi | އަހި |
| 125 | `ochrosia-oppositifolia` | Dhun'buri | ދުންބުރި |
| 133 | `pisonia-grandis` | Lhos | ޅޮސް |
| 137 | `plumeria-obtusa` | Bodu gulchampa | ބޮޑު ގުލްޗަމްޕާ |
| 139 | `premna-serratifolia` | Dhakan'dhaa | ދަކަންދާ |
| 153 | `suriana-maritima` | Halaveli | ހަލަވެލި |
| 169 | `tournefortia-argentea` | Boshi | ބޮށި |
| 219 | `pandanus-tectorius` | Boa kashikeyo | ކަށިކެޔޮ |
| 225 | `casuarina-equisetifolia` | Fithuroanu | ފިތުރޯނު |

Set `"dvReview": false` on each once you have confirmed the spelling.

### Settled (12)

Book spelling and Thaana agree, and these are everyday words. Nothing to do.

| page | species | book spelling | Thaana |
|---|---|---|---|
| 19 | `samanea-saman` | Bodu gas | ބޮޑު ގަސް |
| 31 | `artocarpus-altilis` | Ban'bukeyo | ބަނބުކެޔޮ |
| 39 | `azadirachta-indica` | Hithi gas | ހިތި ގަސް |
| 49 | `calophyllum-inophyllum` | Funa | ފުނަ |
| 77 | `cordia-subcordata` | Kaani | ކާނި |
| 91 | `ficus-benghalensis` | Nika | ނިކަ |
| 111 | `mangifera-indica` | An'bu | އަނބު |
| 149 | `scaevola-taccada` | Magoo | މަގޫ |
| 165 | `terminalia-catappa` | Midhili gas | މިދިލި |
| 167 | `thespesia-populnea` | Hirun'dhu | ހިރުނދު |
| 197 | `pemphis-acidula` | Kuredhi | ކުރެދި |
| 211 | `cocos-nucifera` | Dhivehi ruh | ރުއް |

### Where the book gives more than one name

- `samanea-saman` (p. 19): Book files it under the synonym Albizia saman.
- `barringtonia-asiatica` (p. 41): Also indexed as Kim'bi.
- `cordia-subcordata` (p. 77): Also indexed as Kauni.
- `ficus-benghalensis` (p. 91): Also indexed as Kiri gas.
- `hernandia-nymphaeifolia` (p. 103): Also indexed as Mas kandhu.
- `hibiscus-tiliaceus` (p. 105): Book spells it Dhigga; I had recorded Dhiggaa.
- `plumeria-obtusa` (p. 137): Page 137 covers several Plumeria; it also lists Raiy gulchampa for the red one.
- `pemphis-acidula` (p. 197): Also indexed as Keredhi.
- `cocos-nucifera` (p. 211): Book's full entry name is Dhivehi ruh.
- `pandanus-tectorius` (p. 219): Book's entry name is Boa kashikeyo; kashikeyo alone is the everyday word.

### Species with no Dhivehi name

None. Only the `unknown` placeholder has no book entry, which is correct.


After changing any species name, run:

```bash
python3 tools/build-forms.py && python3 tools/validate.py
```

The first regenerates the GitHub issue-form menus from the data; the second
checks they match. Never hand-edit the species list inside the `.yml` forms.

Place names live in each record's `place.dv` in `data/trees.js`.

## Checking your work

Save the file, reload the page and press the language button in the header. The whole
interface should switch, and the layout should mirror. If a string comes out in English
while everything else is Dhivehi, that key is missing from the `dv` block. The code
falls back to English rather than showing a blank, so nothing breaks, but it is a sign
something needs adding.
