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

Source: FAO, *Trees and shrubs of the Maldives* (Selvam, 2007, RAP Publication
2007/12). The text supplied covers pp. 3-81: 33 species accounts running from
*Adenanthera pavonina* to *Desmodium umbellatum*. Eight of our species fall in
that range. `dvLatin` holds the book's romanisation verbatim; `dv` holds Thaana.


### Settled against the book (5)

Romanisation from the book, Thaana confirmed to match it. Nothing to do here.

- `calophyllum-inophyllum`: ފުނަ (Funa).
- `artocarpus-altilis`: ބަނބުކެޔޮ (Ban'bukeyo).
- `azadirachta-indica`: ހިތި ގަސް (Hithi gas).
- `samanea-saman`: ބޮޑު ގަސް (Bodu gas). Book files it under the synonym Albizia saman.
- `cordia-subcordata`: ކާނި (Kaani).

### Romanisation is sourced, Thaana is mine (3) — please check these first

The book gives the name only in Latin script. I transliterated it into Thaana,
which is the step most likely to be wrong. The romanisation in brackets is
authoritative; the Thaana beside it is not.

- `allophylus-cobbe`: ދޮންމޫސާ — book says **Dhon'moosa**.
- `adenanthera-pavonina`: މަދޮށި — book says **Madhoshi**.
- `barringtonia-asiatica`: ކިންބި — book says **Kin'bi**. Also recorded as Kim'bi.

### Not in the supplied pages, still unverified (5)

- `scaevola-taccada`: given as މަގޫ
- `hibiscus-tiliaceus`: given as ދިގގާ
- `plumeria-obtusa`: given as ގުލްޗަނބޭލީ
- `pemphis-acidula`: given as ކުރެދި
- `unknown`: given as ދެނެގަނެވިފައި ނުވޭ

### Not in the supplied pages, believed right (6)

Common names I am reasonably confident of, but none has been checked:

- ނިކަ، ރުއް، މިދިލި، އަނބު، ހިރުނދު، ކަށިކެޔޮ

### Still with no Dhivehi name at all (9)

- `suriana-maritima`: Bay cedar (*Suriana maritima*)
- `guettarda-speciosa`: Beach gardenia (*Guettarda speciosa*)
- `casuarina-equisetifolia`: Casuarina (*Casuarina equisetifolia*)
- `premna-serratifolia`: Headache tree (*Premna serratifolia*)
- `hernandia-nymphaeifolia`: Lantern tree (*Hernandia nymphaeifolia*)
- `pisonia-grandis`: Lettuce tree (*Pisonia grandis*)
- `morinda-citrifolia`: Noni (*Morinda citrifolia*)
- `ochrosia-oppositifolia`: Ochrosia (*Ochrosia oppositifolia*)
- `tournefortia-argentea`: Tree heliotrope (*Tournefortia argentea*)

The **Index of Dhivehi names on p. 238** would close all of these at once. It is
not in the pages supplied so far. Add the name to `dv`, put the book's spelling in
`dvLatin`, set `"dvSource": "FAO"`, then run:

```bash
python3 tools/build-forms.py && python3 tools/validate.py
```

The first regenerates the GitHub issue-form menus from the data; the second checks
they match. Never hand-edit the species list inside the `.yml` forms.

Place names live in each record's `place.dv` in `data/trees.js`.

## Checking your work

Save the file, reload the page and press the language button in the header. The whole
interface should switch, and the layout should mirror. If a string comes out in English
while everything else is Dhivehi, that key is missing from the `dv` block. The code
falls back to English rather than showing a blank, so nothing breaks, but it is a sign
something needs adding.
