/**
 * The Last Trees of Malé — submission endpoint.
 *
 * Receives records from the public form at
 * https://kenaa.github.io/Trees-of-Maldives/submit.html
 * and writes them to a Google Sheet, saving any photograph to Drive.
 *
 * Nothing here is public. Photos are created inside a private folder and the
 * Sheet holds only a link to them. If you later want photographs to appear on
 * the site, that is a separate decision and a separate share.
 *
 * Deploying it is a job for a person, not for a script: see README.md next
 * to this file.
 */

/* The two Drive items this writes to. Both already exist. */
var SHEET_ID  = '15WS4SdPekAjyTJK-HVWDtYJSFPi3fs5TbqWBhABFQlg';  // "Tree submissions"
var PHOTO_DIR = '1Esf-Lz2qIvaVZ0-Jj_kdABoFMVU0Fj5Z';             // "Submitted photos"

var COLUMNS = [
  'Ref', 'Received', 'Recording', 'Species', 'Species as named', 'Where', 'Ward',
  'Lat', 'Lng', 'Private land', 'Happened when', 'Happened why', 'Notes',
  'Submitter', 'Email', 'People check', 'Photos', 'Form language',
  'Reviewed', 'Update'
];

/* What the three radio buttons on the form become in the sheet. */
var RECORDING = { standing: 'Standing', lost: 'Cut down', cutback: 'Cut back' };

/* Reviewed decides two things at once.

   yes       publish it, but say plainly that nobody has checked it
   verified  publish it as checked: you have seen this tree yourself, or you
             have a dated photograph or a named source for what happened to it

   Approving is not the same as verifying. A stranger's record can be worth
   publishing while still unconfirmed, and the register should say so rather
   than quietly imply that someone went and looked. */
var APPROVED = ['yes', 'y', 'true', 'approved', 'ok', 'x', 'verified', 'v'];
var VERIFIED = ['verified', 'v'];

/* Update is a separate column on purpose. Ticking it re-imports that one row
   over the record already in the register, which is how a correction or a new
   detail reaches a tree published weeks ago. Leaving it blank is what stops
   every run overwriting work done since. */
var UPDATE = ['yes', 'y', 'true', 'update', 'ok', 'x'];

/* Visiting the /exec URL in a browser should tell you it is alive.
   ?list=approved  the rows ticked Reviewed, for the ingest workflow
   ?photo=<id>     the bytes of one photograph belonging to an approved row */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.list === 'approved') return json({ ok: true, records: approvedRecords() });
  if (p.photo) return json(approvedPhoto(p.photo));
  return json({ ok: true, service: 'trees-of-maldives', hint: 'POST a record here.' });
}

function rows() {
  var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  if (sheet.getLastRow() < 2) return [];
  var values = sheet.getDataRange().getValues();
  var head = values[0];
  return values.slice(1).map(function (r) {
    var o = {};
    head.forEach(function (h, i) { o[h] = r[i]; });
    return o;
  });
}

function flagged(value, words) {
  if (value === true) return true;
  return words.indexOf(String(value === null || value === undefined ? '' : value)
    .trim().toLowerCase()) !== -1;
}

function isApproved(row) { return flagged(row['Reviewed'], APPROVED); }
function wantsUpdate(row) { return flagged(row['Update'], UPDATE); }

/* Verification has to be written, not clicked. A tick box in Reviewed means
   "publish this"; saying a record is verified is a claim that someone went and
   looked, and that claim should take a word rather than a checkbox. */
function isVerified(row) {
  var v = row['Reviewed'];
  if (v === true) return false;
  return VERIFIED.indexOf(String(v === null || v === undefined ? '' : v)
    .trim().toLowerCase()) !== -1;
}

function fileIdFrom(url) {
  var m = /[-\w]{25,}/.exec(String(url || ''));
  return m ? m[0] : '';
}

/**
 * Approved rows, ready to publish. Email is deliberately absent: the archive
 * never publishes it, so it should not leave the sheet at all. The submitter's
 * name does travel, because that is the credit they agreed to.
 */
/* Sheets hands back a Date for anything it decides is a date, and String() on
   that gives "Wed Jul 08 2026 00:00:00 GMT+0500 (Maldives Time)". A register
   wants a date, so dates are formatted and everything else passes through. */
function cell(v) {
  if (v instanceof Date) return Utilities.formatDate(v, 'Indian/Maldives', 'yyyy-MM-dd');
  return String(v === null || v === undefined ? '' : v);
}

function approvedRecords() {
  return rows().filter(isApproved).map(function (r) {
    return {
      ref: cell(r['Ref']),
      received: cell(r['Received']),
      recording: cell(r['Recording']),
      species: cell(r['Species']),
      place: cell(r['Where']),
      ward: cell(r['Ward']),
      lat: cell(r['Lat']),
      lng: cell(r['Lng']),
      privateLand: cell(r['Private land']),
      speciesOther: cell(r['Species as named']),
      lostDate: cell(r['Happened when']),
      lostReason: cell(r['Happened why']),
      notes: cell(r['Notes']),
      submitter: cell(r['Submitter']),
      language: String(r['Form language'] || 'en'),
      verified: isVerified(r),
      update: wantsUpdate(r),
      photoIds: cell(r['Photos']).split('\n')
        .map(fileIdFrom).filter(function (x) { return x; })
    };
  });
}

/**
 * One photograph, base64, so the workflow can put it in the repository.
 *
 * The id has to belong to an approved row. Without that check this would be an
 * open proxy to every file in the Drive account, which is emphatically not what
 * a public endpoint should be.
 */
function approvedPhoto(id) {
  var allowed = approvedRecords().some(function (r) { return r.photoIds.indexOf(id) !== -1; });
  if (!allowed) return { ok: false, error: 'not-an-approved-photo' };
  try {
    var f = DriveApp.getFileById(id);
    if (f.getParents().next().getId() !== PHOTO_DIR) return { ok: false, error: 'wrong-folder' };
    var blob = f.getBlob();
    return { ok: true, name: f.getName(), mimeType: blob.getContentType(),
             base64: Utilities.base64Encode(blob.getBytes()) };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Make sure row 1 names the columns this script writes.
 *
 * Only ever widens. If the header already there is the start of COLUMNS, the
 * missing names are added on the end, which keeps every existing row lined up
 * with its data and saves anyone emptying the sheet when a field is added. A
 * header rearranged by hand is left alone, because guessing would file values
 * under the wrong headings.
 */
function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    return;
  }
  var head = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (h) { return String(h === null || h === undefined ? '' : h).trim(); });
  while (head.length && head[head.length - 1] === '') head.pop();

  var startsRight = head.length <= COLUMNS.length &&
    head.every(function (h, i) { return h === COLUMNS[i]; });

  if (startsRight && head.length < COLUMNS.length) {
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]).setFontWeight('bold');
  }
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    /* Honeypot. Real people never see this field, so anything that fills it
       is a bot. Answer normally so it has nothing to learn, and drop it. */
    if (body.website) return json({ ok: true });

    if (!body.consent) return json({ ok: false, error: 'consent-missing' });

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    ensureHeader(sheet);

    sheet.appendRow([
      'S-' + Utilities.formatDate(new Date(), 'Indian/Maldives', 'yyyyMMdd-HHmmss') +
        '-' + Utilities.getUuid().slice(0, 4),
      new Date(),
      RECORDING[body.kind] || 'Standing',
      body.species || '',
      body.speciesOther || '',
      body.place || '',
      body.ward || '',
      body.lat || '',
      body.lng || '',
      body.privateLand === 'yes' ? 'yes' : '',
      body.lostDate || '',
      body.lostReason || '',
      body.notes || '',
      body.name || '',
      body.email || '',
      body.people ? 'confirmed' : '',
      savePhotos(body),
      body.language || '',
      ''
    ]);

    return json({ ok: true });
  } catch (err) {
    /* Returning the message lets the form show something useful rather than
       a bare failure, and the submitter still gets the copy/email fallback. */
    return json({ ok: false, error: String(err) });
  }
}

/**
 * Writes every photograph to Drive and returns the links, one per line.
 * The form sends them as data: URLs so a whole record fits in one JSON body.
 */
function savePhotos(body) {
  var list = body.photos || (body.photo ? [{ dataUrl: body.photo, name: body.photoName }] : []);
  var folder = DriveApp.getFolderById(PHOTO_DIR);
  var stamp = Utilities.formatDate(new Date(), 'Indian/Maldives', 'yyyy-MM-dd HHmm');
  var urls = [];
  for (var i = 0; i < list.length; i++) {
    var m = /^data:([^;]+);base64,(.*)$/.exec(list[i].dataUrl || '');
    if (!m) continue;
    var name = (list[i].name || ('photo-' + (i + 1))).replace(/[^\w.\- ]/g, '_');
    var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], stamp + ' ' + name);
    urls.push(folder.createFile(blob).getUrl());
  }
  return urls.join('\n');
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once from the editor before deploying. It writes a test row and
 * asks for the permissions the web app needs, which is easier to understand
 * than the consent screen you would otherwise meet mid-deployment.
 */
function testFromEditor() {
  var out = doPost({ postData: { contents: JSON.stringify({
    consent: true, people: 'yes', kind: 'standing', species: 'cocos-nucifera',
    place: 'Test row from the script editor', ward: 'henveiru',
    notes: 'Delete this row.', language: 'en'
  }) } });
  Logger.log(out.getContent());
}
