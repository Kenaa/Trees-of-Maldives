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
import base64, io, json, os, re, sys, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from validate import load_wrapped, STATUSES, WARDS, REASONS, BOUNDS  # noqa: E402

TIMEOUT = 60


def endpoint():
    """The one place the URL lives is config.js, so read it from there."""
    src = io.open(os.path.join(ROOT, "assets/js/config.js"), encoding="utf-8").read()
    m = re.search(r'submitEndpoint:\s*"([^"]*)"', src)
    return m.group(1) if m else ""


def get_json(url, attempts=4):
    """Fetch and parse, retrying a few times first.

    Apps Script answers /exec with a redirect to a one-shot result URL, and
    that occasionally 404s or times out when Google is busy or the deployment
    is being replaced. A scheduled job should ride that out rather than mail
    the maintainer about a blip, so transient failures are retried with a
    growing pause and only a persistent one is raised.
    """
    last = None
    for n in range(attempts):
        try:
            with urllib.request.urlopen(url, timeout=TIMEOUT) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:
            last = e
            if n < attempts - 1:
                time.sleep(3 * (n + 1))
    raise last


def write_data(path, var, obj):
    header = io.open(path, encoding="utf-8").read().split("window.")[0]
    io.open(path, "w", encoding="utf-8").write(
        header + "window.%s =\n" % var + json.dumps(obj, ensure_ascii=False, indent=1) + ";\n")


def next_id(trees):
    used = [int(t["id"].split("-")[1]) for t in trees if re.match(r"^MLE-\d{4}$", t.get("id", ""))]
    return "MLE-%04d" % ((max(used) + 1) if used else 1)


MONTHS = {"Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
          "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"}


def tidy_date(v):
    """Turn whatever the sheet gave us into something a register can print.

    Google Sheets returns a Date object for any cell it reads as a date, which
    arrives here as "Wed Jul 08 2026 00:00:00 GMT+0500 (Maldives Time)". The
    script now formats those itself, but old rows and hand-typed cells still
    come through this way, so it is fixed on the way in as well.
    """
    text = (v or "").strip()
    m = re.match(r"^\w{3} (\w{3}) (\d{1,2}) (\d{4})", text)
    if m and m.group(1) in MONTHS:
        return "%s-%s-%02d" % (m.group(3), MONTHS[m.group(1)], int(m.group(2)))
    return text


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

    rec_kind = row.get("recording", "").strip().lower()
    status = {"cut down": "lost", "cut back": "cutback"}.get(rec_kind, "standing")
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
        # Verification comes from the Reviewed column saying so in words.
        # Publishing and vouching are different acts.
        "id": None, "status": status, "verified": bool(row.get("verified")), "species": species,
        # Deliberately no "name". A submitter tells us where a tree is, not what
        # it is called, and copying the street into both fields made records
        # that printed the same line twice. The register falls back to the
        # species until a person gives the tree a name worth having.
        "ward": ward, "place": {lang: place},
        "lat": lat, "lng": lng,
        "girthCm": None, "heightM": None, "ageYears": None,
        "notes": {lang: row.get("notes", "").strip()} if row.get("notes", "").strip() else {lang: ""},
        "photos": [], "recorded": row.get("received", ""), "lost": None, "sources": [],
        "ref": ref,
    }
    if row.get("submitter", "").strip():
        rec["credit"] = row["submitter"].strip()
    # What the submitter calls it, kept verbatim. Useful when the list has no
    # entry for the tree, and the thing a Dhivehi speaker can act on later.
    if row.get("speciesOther", "").strip():
        rec["speciesAsNamed"] = row["speciesOther"].strip()
    if row.get("privateLand", "").strip().lower() == "yes":
        rec["privateLand"] = True
    if status in ("lost", "cutback"):
        reason = row.get("lostReason", "").strip()
        rec["lost"] = {
            "date": tidy_date(row.get("lostDate", "")),
            "reason": reason if reason in REASONS else "unknown",
            "evidence": {lang: row.get("notes", "").strip()},
        }
    return rec


HEIC_TYPES = {"image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"}

# The form shrinks photographs in the browser before sending, but only for
# formats the browser can decode. HEIC skips that, so it is also the one that
# arrives at full size. Same ceiling here, for the same reason.
MAX_PX = 2000


def to_jpeg(raw, record_id, problems):
    """Return (bytes, extension), converting HEIC to JPEG where possible.

    If the conversion library is missing the file is kept as-is with an honest
    .heic extension and a problem is recorded, because a picture that will not
    open is better named than disguised.
    """
    try:
        from PIL import Image
        try:
            import pillow_heif
            pillow_heif.register_heif_opener()
        except ImportError:
            pass
        im = Image.open(io.BytesIO(raw))
        im = im.convert("RGB")
        im.thumbnail((MAX_PX, MAX_PX))
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=86, optimize=True)
        return buf.getvalue(), "jpg"
    except Exception as e:
        problems.append(
            "%s: could not convert a HEIC photograph to JPEG (%s). Saved as .heic, "
            "which most browsers cannot display." % (record_id, e))
        return raw, "heic"


# What the sheet is the authority on. Everything else in a record was added by
# a person working in the repository, and an update must not throw that away.
FROM_SHEET = ("status", "verified", "species", "speciesAsNamed", "ward", "place",
              "lat", "lng", "notes", "credit", "lost", "recorded")


def merge(old, new):
    """Update a published record from its sheet row, in place.

    Only the fields the sheet actually knows about are replaced. A name someone
    gave the tree, a girth somebody measured, sources, translations: all of that
    was added in the repository and the sheet has no opinion on it, so it stays.

    Photographs are replaced, but alt text a person has written is carried over
    by filename, because that is the one part of a photograph record that takes
    a human eye and it would be tedious to lose on every correction.
    """
    written = {}
    for p in old.get("photos") or []:
        if p.get("src") and not p.get("altReview"):
            written[p["src"]] = p.get("alt")
    for p in new.get("photos") or []:
        if p.get("src") in written:
            p["alt"] = written[p["src"]]
            p.pop("altReview", None)

    for key in FROM_SHEET:
        if key in new:
            old[key] = new[key]
        else:
            old.pop(key, None)
    old["photos"] = new.get("photos") or []


def save_photo(exec_url, photo_id, record_id, suffix, problems):
    try:
        out = get_json(exec_url + "?photo=" + photo_id)
    except Exception as e:
        problems.append("%s: could not fetch the photograph (%s)" % (record_id, e))
        return None
    if not out.get("ok"):
        problems.append("%s: photograph refused (%s)" % (record_id, out.get("error")))
        return None
    raw = base64.b64decode(out["base64"])
    mime = (out.get("mimeType") or "").lower()
    name = (out.get("name") or "").lower()

    # iPhones shoot HEIC, and the form only re-encodes formats the browser can
    # decode, so HEIC arrives untouched. No browser but Safari can display it,
    # and the old code wrote it out as .jpg, which made an image nobody could
    # open and nothing that would say so. Convert it here instead.
    if mime in HEIC_TYPES or name.endswith((".heic", ".heif")):
        raw, ext = to_jpeg(raw, record_id, problems)
    else:
        ext = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}.get(mime, "jpg")

    rel = "photos/%s%s.%s" % (record_id, suffix, ext)
    with open(os.path.join(ROOT, rel), "wb") as f:
        f.write(raw)
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
    existing = {t["ref"]: t for t in data["trees"] if t.get("ref")}
    fresh = [r for r in approved if r.get("ref") and r["ref"] not in existing]
    redo = [r for r in approved if r.get("ref") in existing and r.get("update")]
    print("  approved in the sheet: %d, new: %d, marked for update: %d"
          % (len(approved), len(fresh), len(redo)))

    problems, added, updated = [], 0, 0

    for row in fresh + redo:
        rec = clean(row, species_ids, problems)
        if not rec:
            continue
        old = existing.get(row["ref"])
        rec["id"] = old["id"] if old else next_id(data["trees"])

        ids = row.get("photoIds") or ([row["photoId"]] if row.get("photoId") else [])
        for n, pid in enumerate(ids, start=1):
            suffix = "" if len(ids) == 1 else "-%d" % n
            rel = save_photo(url, pid, rec["id"], suffix, problems)
            if not rel:
                continue
            rec["photos"].append({
                "src": rel,
                "alt": {"en": "Photograph of the tree recorded at %s." % rec["place"].get("en", rec["id"])},
                "credit": rec.get("credit", ""),
                "date": rec["recorded"],
                # Nobody has looked at this image yet, so the alt text says only
                # what provenance guarantees. It needs a human.
                "altReview": True,
            })

        if old:
            merge(old, rec)
            updated += 1
            print("    ~ %s  %s" % (old["id"], old["place"].get("en") or old["place"].get("dv")))
        else:
            data["trees"].append(rec)
            added += 1
            print("    + %s  %s" % (rec["id"], rec["place"].get("en") or rec["place"].get("dv")))

    if updated:
        print("  updated %d record(s) from the sheet" % updated)
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
