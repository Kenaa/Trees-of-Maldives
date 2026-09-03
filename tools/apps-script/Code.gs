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
  'Received', 'Recording', 'Species', 'Where', 'Ward', 'Lat', 'Lng',
  'Private land', 'Removed when', 'Removed why', 'Notes',
  'Submitter', 'Email', 'Photo', 'Form language', 'Reviewed'
];

/* Visiting the /exec URL in a browser should tell you it is alive. */
function doGet() {
  return json({ ok: true, service: 'trees-of-maldives', hint: 'POST a record here.' });
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
