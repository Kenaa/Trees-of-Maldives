# The Last Trees of Malé

A public register of the trees still standing in Malé City, and a record of the ones
that were cut down.

Two things are tracked at once: **what is still here**, so there is something concrete
to point at the next time a tree is threatened, and **what is already gone**, so the
loss is countable rather than merely remembered.

- Bilingual **English and Dhivehi**, with full right-to-left layout for Thaana.
- Built to **WCAG 2.1 AA**: keyboard-only, screen reader, 200% zoom, high contrast.
- **No build step, no server, no framework.** Plain HTML, CSS and JavaScript.
- **No account needed to contribute.** The submission form is open to anyone.

---

## Looking at it

Double-click `index.html`. That is the whole procedure. It works straight from the
file system, no local server required.

The only part that needs an internet connection is the map, which pulls tiles from
OpenStreetMap. Offline, the map hides itself and the list takes over.

---

## Putting it online with GitHub Pages

You do not need the command line for any of this.

1. Go to <https://github.com/new>. Give the repository a name (`male-trees` is fine),
   set it to **Public**, and create it.
2. On the new repository page, click **uploading an existing file**, then drag in
   *everything inside this folder*: `index.html`, `submit.html`, `about.html`, and the
   `assets`, `data` and `photos` folders. Commit.
3. Go to **Settings → Pages**. Under *Source*, choose **Deploy from a branch**, pick
   the `main` branch and the `/ (root)` folder, and click **Save**.
4. Wait about a minute. Your site is at
   `https://YOUR-USERNAME.github.io/male-trees/`.

Every later change you make in the repository publishes itself within a minute.

> The `.nojekyll` file in this folder matters. It stops GitHub trying to run the site
> through a blog engine. Keep it.

---

## Turning submissions on

Out of the box the form works, but it has nowhere to send records: it hands the
submitter a copyable summary and a pre-filled email to you instead. Nothing is lost,
but it is manual.

To make submissions arrive automatically:

1. Sign up with a form service that accepts a plain `POST` with a file attached.
   Formspree, Getform, Web3Forms and Basin all do this. **Check the current free tier
   for photo uploads before committing to one**, because these limits change and the
   photo is the part that matters most here.
2. Copy the endpoint URL it gives you.
3. Open `assets/js/config.js` and paste it in:

```js
submitEndpoint: "https://formspree.io/f/xxxxxxx",
contactEmail:   "you@example.com",
```

That is the only change needed. Also set `contactEmail` either way, since it is the fallback
if the service is ever down.

---

## The two ways people contribute

**The public form.** <https://kenaa.github.io/Trees-of-Maldives/submit.html>. No account,
no signup, works on a phone. This is the main route and the one to share publicly.
See *Turning submissions on* above to give it an inbox.

**GitHub issue forms.** <https://github.com/Kenaa/Trees-of-Maldives/issues/new/choose>.
Structured forms for people who already have a GitHub account. Three of them: a standing
tree, a tree that was cut down, and a correction to an existing record. Photographs are
dragged straight into the form and GitHub hosts them free.

The GitHub route costs nothing, never expires, and gives you moderation for free: each
submission arrives as an issue you triage, with the contributor's name attached and a
permanent audit trail. Its one limitation is that it needs a GitHub account, which is why
the public form exists alongside it rather than being replaced by it.

Edit the forms in `.github/ISSUE_TEMPLATE/`. They are plain YAML, so adding a question means
adding a few lines.

---

## Checking your data

```bash
python3 tools/validate.py
```

It reads `data/trees.js`, `data/species.js` and `assets/js/i18n.js` and reports anything
that would break the site: broken JSON with the line number, duplicate record ids, a
species that does not exist, coordinates outside Malé City, a `lost` block missing from a
felled tree, a photo file that is not there, missing `alt` text, or a translation key that
exists in one language but not the other.

The same check runs automatically on every push and pull request
(`.github/workflows/validate.yml`), so a stray comma cannot silently empty the live map.

---

## Adding a tree by hand

Open `data/trees.js`. It is ordinary JSON with one line of wrapper at the top and a
semicolon at the bottom. Leave those two alone and edit everything between freely.

```js
{
  "id": "MLE-0017",
  "status": "standing",          // standing | lost | threatened | relocated
  "verified": false,             // true only after a site visit or a real source
  "species": "ficus-benghalensis",   // an id from data/species.js
  "name":  { "en": "Sultan Park banyan", "dv": "ރަސްރަނި ބަގީޗާ ނިކަ" },
  "ward":  "henveiru",           // henveiru | galolhu | maafannu |
                                 // machchangolhi | villimale | hulhumale
  "place": { "en": "Rasrani Bageecha", "dv": "ރަސްރަނި ބަގީޗާ" },
  "lat": 4.17570, "lng": 73.50900,
  "girthCm": 340, "heightM": 14, "ageYears": 90,   // null if unknown
  "notes": { "en": "…", "dv": "…" },
  "photos": [
    { "src": "photos/mle-0017.jpg",
      "alt": { "en": "A wide banyan…", "dv": "…" },
      "credit": "Photographer's name", "date": "2026-08-14" }
  ],
  "recorded": "2026-09-03",
  "lost": null,                  // see below
  "sources": []
}
```

For a tree that is gone, set `"status": "lost"` and fill in the `lost` block:

```js
"lost": {
  "date": "2024-02",             // YYYY-MM or YYYY-MM-DD; approximate is fine
  "reason": "road-widening",     // road-widening | construction | storm |
                                 // disease | safety | relocated | unknown
  "evidence": { "en": "Photograph from R. Ali, dated 2023-11.", "dv": "…" }
}
```

**Check your work**: save the file and reload `index.html`. If a record vanishes, you
have most likely dropped a comma or a closing brace.

### Photos

Drop image files into `photos/` and reference them as `photos/filename.jpg`. Resize
them to roughly 1600px on the long edge first. Full-size phone photos will make the
site slow on the mobile connections most people will use to read it.

Every photo needs an `alt` description. It is what a blind reader gets instead of the
image, and it is a WCAG requirement, not a nicety.

---

## The seed data

**Every record currently in `data/trees.js` is an unverified placeholder.** The
coordinates are approximate, the measurements are invented, and none of the removal
dates has been checked against a source. They exist so the site could be built and
tested against something realistic.

Delete them as real fieldwork replaces them. When the last one is gone, set
`"seed": false` in the `meta` block at the top of the file and the warning banner on the
home page disappears by itself.

---

## Translation

All Dhivehi in this project is a first draft and needs a native-speaker review.
See [TRANSLATION.md](TRANSLATION.md); fixing a string means editing one line.

---

## What is in here

```
index.html            The archive: map, filters, list, record detail
submit.html           The public submission form
about.html            Why the project exists, what the statuses mean, privacy
assets/css/style.css  All styling. The palette is contrast-verified. Read the note
                      at the top before changing any colour.
assets/js/config.js   The only file you need to edit for submissions
assets/js/i18n.js     Every English and Dhivehi string
assets/js/app.js      The archive page
assets/js/submit.js   The form
data/trees.js         The archive itself
data/species.js       Species reference: scientific, English and Dhivehi names
photos/               Photographs
```

---

## Licences

- **Code** — MIT. See [LICENSE](LICENSE).
- **Tree records** — [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/),
  so journalists, researchers and the council can reuse them with credit.
- **Photographs** — remain the property of the photographer, published with permission.
- **Base map** — © OpenStreetMap contributors.
