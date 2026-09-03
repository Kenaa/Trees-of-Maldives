#!/usr/bin/env python3
"""
Regenerate the species menus in the GitHub issue forms from data/species.js.

data/species.js is the single source of truth. Run this after editing it:

    python3 tools/sync-forms.py

tools/validate.py fails if the menus and the data disagree, so this is the
supported way to change them. Editing the YAML by hand will break the build.
"""
import io, json, os, re, glob, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_species():
    raw = io.open(os.path.join(ROOT, "data/species.js"), encoding="utf-8").read()
    m = re.search(r"window\.SPECIES_DATA\s*=\s*(.*);\s*$", raw, re.S)
    if not m:
        sys.exit("data/species.js: cannot find `window.SPECIES_DATA = ...;`")
    return json.loads(m.group(1))["species"]


def option(s):
    """One menu line. Must match the expectation in tools/validate.py."""
    if s["id"] == "unknown":
        return "%s | %s" % (s["en"], s.get("dv", ""))
    line = "%s · %s" % (s["en"], s["sci"])
    if s.get("dv"):
        line += " | %s" % s["dv"]
    return line


def main():
    species = load_species()
    opts = [option(s) for s in species]
    try:
        default = next(i for i, s in enumerate(species) if s["id"] == "unknown")
    except StopIteration:
        sys.exit("data/species.js: no 'unknown' species, so the menu has no safe default")

    block = "\n".join('        - "%s"' % o for o in opts)
    pattern = re.compile(
        r'(  - type: dropdown\n    id: species\n(?:.*?\n)*?      options:\n)'
        r'((?:        - "[^"]*"\n)+)'
        r'(      default: \d+\n)')

    changed = 0
    for path in sorted(glob.glob(os.path.join(ROOT, ".github/ISSUE_TEMPLATE/*.yml"))):
        s = io.open(path, encoding="utf-8").read()
        m = pattern.search(s)
        if not m:
            continue                       # no species menu in this form
        new = s[:m.start(2)] + block + "\n" + ("      default: %d\n" % default) + s[m.end(3):]
        rel = os.path.relpath(path, ROOT)
        if new == s:
            print("  %s: already up to date" % rel)
        else:
            io.open(path, "w", encoding="utf-8").write(new)
            print("  %s: rewritten, %d options, default=%d" % (rel, len(opts), default))
            changed += 1

    print("\n%d file(s) changed. Now run: python3 tools/validate.py" % changed)


if __name__ == "__main__":
    main()
