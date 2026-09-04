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
  'Ref', 'Received', 'Recording', 'Species', 'Where', 'Ward', 'Lat', 'Lng',
  'Private land', 'Removed when', 'Removed why', 'Notes',
  'Submitter', 'Email', 'Photo', 'Form language', 'Reviewed'
];

/* Anything in this list, in the Reviewed column, means "publish it". A tick
   box gives a real boolean, so that counts too. */
var APPROVED = ['yes', 'y', 'true', 'approved', 'ok', 'x'];

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

function isApproved(row) {
  var v = row['Reviewed'];
  if (v === true) return true;
  return APPROVED.indexOf(String(v || '').trim().toLowerCase()) !== -1;
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
function approvedRecords() {
  return rows().filter(isApproved).map(function (r) {
    return {
      ref: String(r['Ref'] || ''),
      received: r['Received'] instanceof Date
        ? Utilities.formatDate(r['Received'], 'Indian/Maldives', 'yyyy-MM-dd') : String(r['Received'] || ''),
      recording: String(r['Recording'] || ''),
      species: String(r['Species'] || ''),
      place: String(r['Where'] || ''),
      ward: String(r['Ward'] || ''),
      lat: String(r['Lat'] || ''),
      lng: String(r['Lng'] || ''),
      privateLand: String(r['Private land'] || ''),
      lostDate: String(r['Removed when'] || ''),
      lostReason: String(r['Removed why'] || ''),
      notes: String(r['Notes'] || ''),
      submitter: String(r['Submitter'] || ''),
      language: String(r['Form language'] || 'en'),
      photoId: fileIdFrom(r['Photo'])
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
  var allowed = approvedRecords().some(function (r) { return r.photoId === id; });
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

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    /* Honeypot. Real people never see this field, so anything that fills it
       is a bot. Answer normally so it has nothing to learn, and drop it. */
    if (body.website) return json({ ok: true });

    if (!body.consent) return json({ ok: false, error: 'consent-missing' });

    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    }

    sheet.appendRow([
      'S-' + Utilities.formatDate(new Date(), 'Indian/Maldives', 'yyyyMMdd-HHmmss') +
        '-' + Utilities.getUuid().slice(0, 4),
      new Date(),
      body.kind === 'lost' ? 'Cut down' : 'Standing',
      body.species || '',
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
      savePhoto(body),
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
 * Writes the photograph to Drive and returns a link to it.
 * The form sends it as a data: URL so the whole record fits in one JSON body.
 */
function savePhoto(body) {
  if (!body.photo) return '';
  var m = /^data:([^;]+);base64,(.*)$/.exec(body.photo);
  if (!m) return '';

  var name = (body.photoName || 'photo').replace(/[^\w.\- ]/g, '_');
  var stamp = Utilities.formatDate(new Date(), 'Indian/Maldives', 'yyyy-MM-dd HHmm');
  var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], stamp + ' ' + name);

  return DriveApp.getFolderById(PHOTO_DIR).createFile(blob).getUrl();
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
    consent: true, kind: 'standing', species: 'cocos-nucifera',
    place: 'Test row from the script editor', ward: 'henveiru',
    notes: 'Delete this row.', language: 'en'
  }) } });
  Logger.log(out.getContent());
}
