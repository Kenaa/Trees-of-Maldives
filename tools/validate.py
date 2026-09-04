#!/usr/bin/env python3
"""
Check the archive's data files before they go live.

Run it yourself with:      python3 tools/validate.py
It also runs automatically on every push, via .github/workflows/validate.yml

Errors block the build. Warnings are things worth fixing but not worth stopping for.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STATUSES = {"standing", "lost", "threatened", "relocated"}
WARDS    = {"henveiru", "galolhu", "maafannu", "machchangolhi", "villimale", "hulhumale"}
REASONS  = {"road-widening", "construction", "storm", "disease", "safety", "relocated", "unknown"}
# Malé, Villimalé and Hulhumalé all sit inside this box.
BOUNDS   = (4.10, 4.30, 73.40, 73.60)

errors, warnings = [], []
def err(m):  errors.append(m)
def warn(m): warnings.append(m)


def load_wrapped(path, var):
    """Read a data/*.js file: JSON with `window.X =` on the front and `;` on the end."""
    raw = open(os.path.join(ROOT, path), encoding="utf-8").read()
    m = re.search(r"window\.%s\s*=\s*(.*);\s*$" % var, raw, re.S)
    if not m:
        err("%s: cannot find `window.%s = ...;` — has the wrapper been edited?" % (path, var))
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError as e:
        err("%s: broken JSON at line %d, column %d — %s" % (path, e.lineno, e.colno, e.msg))
        err("        (this is almost always a missing comma, or one comma too many "
            "before a closing } or ])")
        return None


def check_trees(data, species_ids):
    trees = data.get("trees")
    if not isinstance(trees, list):
        err("data/trees.js: no `trees` list")
        return

    seen = set()
    for t in trees:
        tid = t.get("id", "<no id>")
        where = "data/trees.js [%s]" % tid

        if not re.match(r"^MLE-\d{4}$", str(tid)):
            err("%s: id should look like MLE-0001" % where)
        if tid in seen:
            err("%s: duplicate id" % where)
        seen.add(tid)

        if t.get("status") not in STATUSES:
            err("%s: status %r must be one of %s" % (where, t.get("status"), sorted(STATUSES)))
        if t.get("ward") not in WARDS:
            err("%s: ward %r must be one of %s" % (where, t.get("ward"), sorted(WARDS)))
        if t.get("species") not in species_ids:
            err("%s: species %r is not in data/species.js" % (where, t.get("species")))
        if not isinstance(t.get("verified"), bool):
            err("%s: verified must be true or false" % where)

        for field in ("name", "place"):
            v = t.get(field)
            if not isinstance(v, dict) or not v.get("en"):
                err("%s: %s needs at least an English value" % (where, field))
            elif not v.get("dv"):
                warn("%s: %s has no Dhivehi translation" % (where, field))

        # Coordinates are optional: the form lets someone give a street name
        # instead. Such a record belongs in the register, it just cannot be
        # drawn on the map until somebody places it.
        lat, lng = t.get("lat"), t.get("lng")
        if lat is None and lng is None:
            warn("%s: no coordinates, so it is missing from the map" % where)
        elif not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
            err("%s: lat and lng must both be numbers, or both be null" % where)
        elif not (BOUNDS[0] <= lat <= BOUNDS[1] and BOUNDS[2] <= lng <= BOUNDS[3]):
            err("%s: %s, %s is outside Malé City — check the order (lat first)" % (where, lat, lng))

        # A lost or relocated tree needs its lost block; a living one must not have one.
        lost = t.get("lost")
        if t.get("status") in ("lost", "relocated"):
            if not isinstance(lost, dict):
                err("%s: status is %r but there is no `lost` block" % (where, t["status"]))
            else:
                if not lost.get("date"):
                    warn("%s: no removal date recorded" % where)
                if lost.get("reason") not in REASONS:
                    err("%s: lost.reason %r must be one of %s" % (where, lost.get("reason"), sorted(REASONS)))
        elif lost not in (None, {}):
            err("%s: status is %r, so `lost` should be null" % (where, t.get("status")))

        if t.get("verified") and not t.get("sources") and t.get("status") in ("lost", "relocated"):
            warn("%s: marked verified but lists no sources" % where)

        for p in t.get("photos") or []:
            src = p.get("src", "")
            if not src:
                err("%s: a photo has no src" % where)
            elif not os.path.exists(os.path.join(ROOT, src)):
                err("%s: photo file not found: %s" % (where, src))
            alt = p.get("alt")
            if not isinstance(alt, dict) or not alt.get("en"):
                err("%s: photo %s needs English alt text (a WCAG requirement)" % (where, src))
            elif p.get("altReview"):
                warn("%s: alt text for %s was written without anyone seeing the "
                     "photograph — describe what is actually in frame" % (where, src))

    if data.get("meta", {}).get("seed") and not any(not t.get("verified") for t in trees):
        warn("meta.seed is still true but every record is verified — you can set it to false")


def check_i18n():
    path = os.path.join(ROOT, "assets/js/i18n.js")
    src = open(path, encoding="utf-8").read()
    try:
        en = src.split("\n  en: {")[2].split("\n  dv: {")[0]
        dv = src.split("\n  dv: {")[2].split("\n};")[0]
    except IndexError:
        err("assets/js/i18n.js: cannot find the en and dv blocks")
        return
    keys = lambda b: set(re.findall(r'"([a-zA-Z]+\.[A-Za-z0-9._-]+)"\s*:', b))
    e, d = keys(en), keys(dv)
    for k in sorted(e - d):
        err("assets/js/i18n.js: %r is in the English block but missing from Dhivehi" % k)
    for k in sorted(d - e):
        err("assets/js/i18n.js: %r is in the Dhivehi block but missing from English" % k)
    if e and e == d:
        print("  i18n: %d keys, English and Dhivehi in step" % len(e))


TYPES = {"markdown", "input", "textarea", "dropdown", "checkboxes"}


def species_label(sp):
    """The one true option label for a species in the issue-form menus.

    tools/build-forms.py generates the menus with this function and
    check_issue_forms() verifies them with it, so the two cannot drift.
    The romanisation is included because most people in Male type Dhivehi
    in Latin script, and it is what makes the menu searchable for them.
    """
    line = sp["en"] if sp["id"] == "unknown" else "%s \u00b7 %s" % (sp["en"], sp["sci"])
    if sp.get("dv"):
        line += " | %s" % sp["dv"]
        if sp.get("dvLatin"):
            line += " (%s)" % sp["dvLatin"]
    return line


def check_issue_forms(species):
    """Validate the GitHub issue forms. Skipped silently if PyYAML is absent —
    it is present on GitHub's runners, so CI always checks them."""
    try:
        import yaml
    except ImportError:
        # Skipping locally is a convenience. Skipping in CI would mean the
        # forms go unchecked without anyone noticing, so fail there instead.
        if os.environ.get("CI"):
            err("PyYAML is missing, so the issue forms could not be checked. "
                "Add `pip install pyyaml` to the workflow.")
            return
        print("  issue forms: skipped (no PyYAML locally; CI still checks them)")
        return
    import glob

    # The species menus in the forms are generated from data/species.js. If they
    # drift, a contributor picks a species the register does not know about.
    expected = [species_label(sp) for sp in (species or {}).get("species", [])]

    files = sorted(glob.glob(os.path.join(ROOT, ".github/ISSUE_TEMPLATE/*.yml")))
    if not files:
        return
    for path in files:
        rel = os.path.relpath(path, ROOT)
        try:
            d = yaml.safe_load(open(path, encoding="utf-8"))
        except yaml.YAMLError as e:
            err("%s: invalid YAML — %s" % (rel, e))
            continue
        if rel.endswith("config.yml"):
            for cl in d.get("contact_links") or []:
                for k in ("name", "url", "about"):
                    if not cl.get(k):
                        err("%s: a contact link is missing %r" % (rel, k))
            continue
        for k in ("name", "description", "body"):
            if k not in d:
                err("%s: missing top-level %r" % (rel, k))
        ids = set()
        for i, item in enumerate(d.get("body") or []):
            loc = "%s body[%d]" % (rel, i)
            t = item.get("type")
            if t not in TYPES:
                err("%s: unknown field type %r" % (loc, t))
                continue
            a = item.get("attributes") or {}
            if t == "markdown":
                if not a.get("value"):
                    err("%s: markdown needs attributes.value" % loc)
            else:
                if not a.get("label"):
                    err("%s: %s needs attributes.label" % (loc, t))
                if item.get("id"):
                    if item["id"] in ids:
                        err("%s: duplicate field id %r" % (loc, item["id"]))
                    ids.add(item["id"])
            if t == "dropdown":
                opts = a.get("options")
                if not isinstance(opts, list) or not opts:
                    err("%s: dropdown needs a non-empty options list" % loc)
                elif a.get("default") is not None and not (0 <= a["default"] < len(opts)):
                    err("%s: default index %d is outside 0..%d"
                        % (loc, a["default"], len(opts) - 1))
            if t == "dropdown" and item.get("id") == "species" and expected:
                opts = a.get("options") or []
                if opts != expected:
                    err("%s: the species menu does not match data/species.js "
                        "(%d options here, %d in the data). Regenerate it rather "
                        "than editing by hand." % (loc, len(opts), len(expected)))
                    for extra in [o for o in opts if o not in expected][:3]:
                        err("        not in species.js: %r" % extra)
                    for miss in [o for o in expected if o not in opts][:3]:
                        err("        missing from the form: %r" % miss)
            if t == "checkboxes":
                for o in a.get("options") or []:
                    if not isinstance(o, dict) or not o.get("label"):
                        err("%s: a checkbox option has no label" % loc)
    print("  issue forms: %d checked" % len(files))


def main():
    species = load_wrapped("data/species.js", "SPECIES_DATA")
    trees   = load_wrapped("data/trees.js", "TREE_DATA")

    species_ids = set()
    if species:
        for s in species.get("species", []):
            if s["id"] in species_ids:
                err("data/species.js: duplicate species id %r" % s["id"])
            species_ids.add(s["id"])
            if not s.get("sci") or not s.get("en"):
                err("data/species.js: %r needs both a scientific and an English name" % s["id"])
        print("  species: %d entries" % len(species_ids))

    if trees:
        check_trees(trees, species_ids)
        print("  trees: %d records" % len(trees.get("trees", [])))

    check_i18n()
    check_issue_forms(species)

    for w in warnings:
        print("  warning: %s" % w)
    for e in errors:
        print("  ERROR:   %s" % e)

    if errors:
        print("\n%d error(s). The site would break — fix these before publishing." % len(errors))
        return 1
    print("\nAll good%s." % (" (%d warning(s))" % len(warnings) if warnings else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
