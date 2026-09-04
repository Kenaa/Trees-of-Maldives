#!/usr/bin/env python3
"""
Copy approved submissions from the Google Sheet into the register.

A row is approved by putting yes (or a tick) in the Reviewed column. This
fetches those rows, turns each into a record in data/trees.js, saves the
photograph into photos/, and leaves everything else alone.

Run it yourself:            python3 tools/ingest.py
It also runs on a schedule: .github/workflows/ingest.yml

Records arrive with "verified": false. Approving a submission means it is fit
to publish, not that anyone has confirmed the tree is what the submitter said
it was. Those are different claims and the register keeps them apart.
"""
import base64, io, json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from validate import load_wrapped, STATUSES, WARDS, REASONS, BOUNDS  # noqa: E402

TIMEOUT = 60


def endpoint():
    """The one place the URL lives is config.js, so read it from there."""
    src = io.open(os.path.join(ROOT, "assets/js/config.js"), encoding="utf-8").read()
    m = re.search(r'submitEndpoint:\s*"([^"]*)"', src)
    return m.group(1) if m else ""


def get_json(url):
    with urllib.request.urlopen(url, timeout=TIMEOUT) as r:
        return json.loads(r.read().decode("utf-8"))


def write_data(path, var, obj):
    header = io.open(path, encoding="utf-8").read().split("window.")[0]
    io.open(path, "w", encoding="utf-8").write(
        header + "window.%s =\n" % var + json.dumps(obj, ensure_ascii=False, indent=1) + ";\n")


def next_id(trees):
    used = [int(t["id"].split("-")[1]) for t in trees if re.match(r"^MLE-\d{4}$", t.get("id", ""))]
    return "MLE-%04d" % ((max(used) + 1) if used else 1)


def clean(row, species_ids, problems):
    """Turn one sheet row into a register record, or None if it cannot be trusted."""
    ref = row.get("ref", "").strip()
    place = row.get("place", "").strip()
    if not place:
        problems.append("%s: no location given" % (ref or "a row"))
        return None

    ward = row.get("ward", "").strip().lower()
    if ward not in WARDS:
        problems.append("%s: ward %r is not one of %s" % (ref, ward, sorted(WARDS)))
        return None

    species = row.get("species", "").strip()
    if species not in species_ids:
        problems.append("%s: species %r is unknown, filed as unidentified" % (ref, species))
        species = "unknown"

    status = "lost" if row.get("recording", "").strip().lower().startswith("cut") else "standing"
    lang = "dv" if row.get("language") == "dv" else "en"

    # Coordinates are optional on the form. A record without them still belongs
    # in the register; it just cannot be drawn on the map until someone places it.
    lat = lng = None
    try:
        if row.get("lat") and row.get("lng"):
            lat, lng = float(row["lat"]), float(row["lng"])
            if not (BOUNDS[0] <= lat <= BOUNDS[1] and BOUNDS[2] <= lng <= BOUNDS[3]):
                problems.append("%s: %s, %s is outside Malé City, dropped" % (ref, lat, lng))
                lat = lng = None
    except ValueError:
        problems.append("%s: coordinates were not numbers, dropped" % ref)

    rec = {
        "id": None, "status": status, "verified": False, "species": species,
        "name": {lang: place}, "ward": ward, "place": {lang: place},
        "lat": lat, "lng": lng,
        "girthCm": None, "heightM": None, "ageYears": None,
        "notes": {lang: row.get("notes", "").strip()} if row.get("notes", "").strip() else {lang: ""},
        "photos": [], "recorded": row.get("received", ""), "lost": None, "sources": [],
        "ref": ref,
    }
    if row.get("submitter", "").strip():
        rec["credit"] = row["submitter"].strip()
    if row.get("privateLand", "").strip().lower() == "yes":
        rec["privateLand"] = True
    if status == "lost":
        reason = row.get("lostReason", "").strip()
        rec["lost"] = {
            "date": row.get("lostDate", "").strip(),
            "reason": reason if reason in REASONS else "unknown",
            "evidence": {lang: row.get("notes", "").strip()},
        }
    return rec


def save_photo(exec_url, photo_id, record_id, problems):
    try:
        out = get_json(exec_url + "?photo=" + photo_id)
    except Exception as e:
        problems.append("%s: could not fetch the photograph (%s)" % (record_id, e))
        return None
    if not out.get("ok"):
        problems.append("%s: photograph refused (%s)" % (record_id, out.get("error")))
        return None
    ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(out.get("mimeType"), "jpg")
    rel = "photos/%s.%s" % (record_id, ext)
    with open(os.path.join(ROOT, rel), "wb") as f:
        f.write(base64.b64decode(out["base64"]))
    return rel


def main():
    url = endpoint()
    if not url:
        print("No submitEndpoint in assets/js/config.js, nothing to do.")
        return 0

    data = load_wrapped("data/trees.js", "TREE_DATA")
    species = load_wrapped("data/species.js", "SPECIES_DATA")
    if not data or not species:
        print("Could not read the data files.")
        return 1
    species_ids = {s["id"] for s in species["species"]}

    try:
        feed = get_json(url + "?list=approved")
    except Exception as e:
        print("Could not reach the endpoint: %s" % e)
        return 1
    if not feed.get("ok"):
        print("The endpoint refused: %s" % feed.get("error"))
        return 1

    approved = feed.get("records", [])
    have = {t.get("ref") for t in data["trees"] if t.get("ref")}
    fresh = [r for r in approved if r.get("ref") and r["ref"] not in have]
    print("  approved in the sheet: %d, already in the register: %d, to add: %d"
          % (len(approved), len(approved) - len(fresh), len(fresh)))

    problems, added = [], 0
    for row in fresh:
        rec = clean(row, species_ids, problems)
        if not rec:
            continue
        rec["id"] = next_id(data["trees"])
        if row.get("photoId"):
            rel = save_photo(url, row["photoId"], rec["id"], problems)
            if rel:
                rec["photos"] = [{
                    "src": rel,
                    "alt": {"en": "Photograph of the tree recorded at %s." % rec["place"].get("en", rec["id"])},
                    "credit": rec.get("credit", ""),
                    "date": rec["recorded"],
                    # Nobody has looked at this image yet, so the alt text says
                    # only what provenance guarantees. It needs a human.
                    "altReview": True,
                }]
        data["trees"].append(rec)
        added += 1
        print("    + %s  %s" % (rec["id"], rec["place"].get("en") or rec["place"].get("dv")))

    for p in problems:
        print("  skipped: %s" % p)

    if added:
        data["meta"]["updated"] = max(r.get("received", "") for r in fresh) or data["meta"].get("updated")
        # The seed notice claims every record is a placeholder. Once a real one
        # lands that is no longer true, so it has to come down.
        data["meta"]["seed"] = False
        write_data(os.path.join(ROOT, "data/trees.js"), "TREE_DATA", data)
        print("\n  added %d record(s) to data/trees.js" % added)
    else:
        print("\n  nothing new")
    return 0


if __name__ == "__main__":
    sys.exit(main())
