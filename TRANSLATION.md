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

## 3. Species and place names: `data/species.js` and `data/trees.js`

Species carrying `"dvReview": true` are the ones I was least confident about:

- `hibiscus-tiliaceus`: given as ދިގގާ
- `azadirachta-indica`: given as ހިތިގަސް
- `scaevola-taccada`: given as މަގޫ
- `pemphis-acidula`: given as ކުރެދި
- `samanea-saman`: transliterated as ސަމަނާ; there may be a real Dhivehi name
- `plumeria-obtusa`: given as ގުލްޗަނބޭލީ

The others (ރުއް، ނިކަ، މިދިލި، ފުނަ، ހިރުނދު، ކާނި، ބަނބުކެޔޮ، އަނބު، ކަށިކެޔޮ) still deserve
a glance. Set `"dvReview": false` once a name has been confirmed.

### Species with no Dhivehi name at all

These 12 came from the FAO's *Trees and shrubs of the Maldives* (Selvam, 2007,
RAP Publication 2007/12), whose introduction names the species of each island
plant community but gives no Dhivehi names. Rather than guess at Thaana, the
field is left empty, and the forms fall back to the English name.

- `allophylus-cobbe`: Allophylus (Allophylus cobbe)
- `suriana-maritima`: Bay cedar (Suriana maritima)
- `guettarda-speciosa`: Beach gardenia (Guettarda speciosa)
- `casuarina-equisetifolia`: Casuarina (Casuarina equisetifolia)
- `premna-serratifolia`: Headache tree (Premna serratifolia)
- `hernandia-nymphaeifolia`: Lantern tree (Hernandia nymphaeifolia)
- `pisonia-grandis`: Lettuce tree (Pisonia grandis)
- `morinda-citrifolia`: Noni (Morinda citrifolia)
- `ochrosia-oppositifolia`: Ochrosia (Ochrosia oppositifolia)
- `adenanthera-pavonina`: Red bead tree (Adenanthera pavonina)
- `barringtonia-asiatica`: Sea poison tree (Barringtonia asiatica)
- `tournefortia-argentea`: Tree heliotrope (Tournefortia argentea)

The full FAO book has an **Index of Dhivehi names** on p. 238. That is the right
place to fill these in from. Add the name to `dv` and set `"dvReview": false`.

Place names live in each record's `place.dv` in `data/trees.js`.

## Checking your work

Save the file, reload the page and press the language button in the header. The whole
interface should switch, and the layout should mirror. If a string comes out in English
while everything else is Dhivehi, that key is missing from the `dv` block. The code
falls back to English rather than showing a blank, so nothing breaks, but it is a sign
something needs adding.
