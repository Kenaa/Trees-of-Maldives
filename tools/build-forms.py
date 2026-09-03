#!/usr/bin/env python3
"""
Regenerate the species menus in the GitHub issue forms from data/species.js.

Run after editing species data:   python3 tools/build-forms.py
tools/validate.py checks the result with the same label function, so the
forms and the register can never disagree about what a species is called.
"""
import io, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from validate import species_label, load_wrapped   # noqa: E402

BLOCK = re.compile(
    r'(?P<head>^ {4}id: species\n(?:.*\n)*?^ {6}options:\n)'
    r'(?P<opts>(?:^ {8}- ".*"\n)+)',
    re.M)


def main():
    species = load_wrapped("data/species.js", "SPECIES_DATA")
    if not species:
        print("could not read data/species.js")
        return 1
    labels = [species_label(sp) for sp in species["species"]]
    body = "".join('        - "%s"\n' % l.replace('"', '\\"') for l in labels)

    touched = 0
    for name in sorted(os.listdir(os.path.join(ROOT, ".github/ISSUE_TEMPLATE"))):
        if not name.endswith(".yml"):
            continue
        path = os.path.join(ROOT, ".github/ISSUE_TEMPLATE", name)
        text = io.open(path, encoding="utf-8").read()
        if "id: species" not in text:
            continue
        new, n = BLOCK.subn(lambda m: m.group("head") + body, text)
        if not n:
            print("  %s: could not find the species options block" % name)
            return 1
        # Keep "Not yet identified" as the default selection.
        new = re.sub(r'(^ {4}id: species\n(?:.*\n)*?^ {8}- ".*"\n(?!^ {8}- ))^ {6}default: \d+',
                     lambda m: m.group(1) + "      default: %d" % (len(labels) - 1),
                     new, flags=re.M)
        if new != text:
            io.open(path, "w", encoding="utf-8").write(new)
            touched += 1
        print("  %s: %d species" % (name, len(labels)))
    print("rewrote %d form(s)" % touched)
    return 0


if __name__ == "__main__":
    sys.exit(main())
