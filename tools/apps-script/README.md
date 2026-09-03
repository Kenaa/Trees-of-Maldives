# Turning on submissions

The public form has no inbox until you do this. Until then it hands people a
summary to copy and a pre-filled email, so nothing is lost, but nothing is
collected automatically either.

This takes about five minutes and needs no developer account. It uses the
Google Drive already connected to the project.

## What already exists

Three things were created in Drive for you:

| | |
|---|---|
| Folder | [Trees of Maldives](https://drive.google.com/drive/folders/1iTs7JJyGbvwIwatAZs9lVLb_DpO3GVEM) |
| Sheet | [Tree submissions](https://docs.google.com/spreadsheets/d/15WS4SdPekAjyTJK-HVWDtYJSFPi3fs5TbqWBhABFQlg/edit) |
| Folder | [Submitted photos](https://drive.google.com/drive/folders/1Esf-Lz2qIvaVZ0-Jj_kdABoFMVU0Fj5Z) |

Their IDs are already written into `Code.gs`, so there is nothing to fill in.

## Steps

1. Open the **Tree submissions** sheet, then choose **Extensions → Apps Script**.
2. Delete the few lines of placeholder code in the editor.
3. Paste in everything from [`Code.gs`](Code.gs), then save.
4. In the function dropdown at the top, pick **`testFromEditor`** and press **Run**.

   Google will ask for permission, and the warning screen is alarming but
   expected: it says "unverified" because the script is yours and has not been
   through Google's review, which only applies to publicly listed apps.
   Choose **Review permissions**, pick your account, then **Advanced → Go to
   Tree submissions (unsafe) → Allow**.

5. Look at the sheet. A header row and one test row should have appeared.
   Delete the test row.
6. Back in the editor: **Deploy → New deployment**. Click the gear beside
   "Select type" and choose **Web app**.
7. Set:
   - **Execute as:** Me
   - **Who has access:** **Anyone**
8. Press **Deploy** and copy the **Web app URL**. It ends in `/exec`.
9. Open [`assets/js/config.js`](../../assets/js/config.js) and paste that URL
   between the quotes on the `submitEndpoint` line. Commit and push.

Give Pages a minute, then send yourself a test record from the live form.

## Two things worth knowing

**"Anyone" is about the endpoint, not your files.** It has to be "Anyone",
because the people filling in the form are strangers without Google accounts.
It lets anyone *send a record to the script*. It does not make the Sheet, the
photos, or the folder public: those stay private to your account, and the
script only ever writes.

**Editing the code later does not change the live endpoint.** Apps Script keeps
serving the deployed version. After changing `Code.gs`, go to
**Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy**.
The URL stays the same.

## What arrives

One row per record, with the photograph saved to Drive and linked from the
`Photo` column:

`Received · Recording · Species · Where · Ward · Lat · Lng · Private land ·
Removed when · Removed why · Notes · Submitter · Email · Photo · Form language ·
Reviewed`

`Reviewed` is left empty on purpose. It is yours to mark as you work through
submissions and copy the good ones into `data/trees.js`.

## What the form does before sending

- **Shrinks the photograph** to 2000px and re-encodes it as JPEG, which takes a
  typical 8 MB phone photo well under 1 MB. Uploads finish quickly on a mobile
  connection. If the browser cannot decode the format, usually HEIC outside
  Safari, the original file is sent instead.
- **Rounds the location** for trees marked as being on private land, so a
  household cannot be identified from the published map.
- **Carries a honeypot field** that people never see. Anything that fills it in
  is a bot, and the script accepts the request and discards it.
