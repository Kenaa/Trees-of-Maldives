# Contributing

## Adding a tree you have seen

Use the [add a tree](submit.html) form. No account, no sign-up. A photograph and a
street name are enough — the rest can be filled in later by someone else.

The single most valuable contribution is **an old, dated photograph of a tree that is
now gone**. That evidence exists almost nowhere else, and it is quietly disappearing
from family albums and old phone backups.

## For moderators: turning a submission into a record

1. Read the submission. Does it describe one identifiable tree in one place?
   A message about "the trees along Ameenee Magu" is a lead, not a record — reply and
   ask which one, or open one record per tree.
2. Save the photograph into `photos/` as `mle-00NN.jpg`, resized to about 1600px on the
   long edge.
3. Add the record to `data/trees.js`, following the shape documented in the
   [README](README.md#adding-a-tree-by-hand).
4. Set `"verified": false`. It stays false until someone has stood in front of the tree,
   or has matched a loss to a dated photograph or a named source.
5. Write the `alt` text for the photograph. Describe what is in the frame for someone
   who cannot see it: *"A wide banyan with aerial roots, filling a walled courtyard"*,
   not *"tree"*.

## Standards worth keeping

**Never mark something verified to make the archive look better.** An unverified record
is useful. A wrong record that is labelled verified is worse than no record at all,
because the first time someone checks one and finds it false, every other record
becomes questionable too.

**Record losses conservatively.** Date, reason, source. If the reason is not known,
`"unknown"` is an honest answer and a perfectly good record.

**Count relocations separately.** A mature tree moved elsewhere frequently does not
survive. Filing it under "saved" flatters the outcome.

**Respect private ground.** Tick the private-land box for courtyard trees. The published
coordinates are rounded so a household cannot be identified from the map.

## Changing the site itself

Every change has to hold two lines that are easy to break by accident:

- **Both languages.** A new visible string needs a key in *both* the `en` and `dv`
  blocks of `assets/js/i18n.js`. Never hard-code English into a page template.
- **WCAG 2.1 AA.** Before opening a pull request: tab through the whole page and make
  sure focus is always visible and never trapped; check every image has `alt`; check
  every form control has a real `<label>`; and check any new colour against its
  background at 4.5:1 for text, 3:1 for borders and icons. The palette at the top of
  `assets/css/style.css` is already verified — reuse those variables rather than
  inventing new colours.

Layout uses CSS **logical properties** (`padding-inline`, `inset-inline-start`,
`margin-block`) rather than left/right. That is what makes the Dhivehi layout mirror by
itself. Adding a `left:` or `margin-right:` will break right-to-left silently, and it
will only show up when someone switches the language.
