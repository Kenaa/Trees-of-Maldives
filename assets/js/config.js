/* ---------------------------------------------------------------------------
   CONFIG — this is the only file you need to edit to get submissions working.
   Everything else can be left alone.
--------------------------------------------------------------------------- */

window.CONFIG = {

  /* 1. WHERE SUBMISSIONS GO -------------------------------------------------
     Paste your endpoint URL between the quotes.

     Set up for this project: a Google Apps Script web app that writes to the
     "Tree submissions" Sheet in Drive and files photographs in the
     "Submitted photos" folder beside it. The script is in
     tools/apps-script/Code.gs and the deployment steps are in the README
     next to it. Once deployed the URL looks like:

       https://script.google.com/macros/s/AKfycb.../exec

     Any service taking a plain multipart POST works too (Formspree, Getform,
     Web3Forms, Basin). Check the current free tier for photo uploads before
     committing to one, because those limits change.

     Leave it as "" and the form still works. It hands the submitter a tidy
     summary to copy and a pre-filled email to you, so nothing is lost. */
  submitEndpoint: "https://script.google.com/macros/s/AKfycbx6XVchRMDOxhK7fUWsP5NVmpkgM3Cem-N9Du7RU5bQEtXNXZebEmP_yPrOPJffZ8EY6Q/exec",

  /* 2. FALLBACK INBOX -------------------------------------------------------
     Used for the "send by email" fallback above. Put a real address here. */
  contactEmail: "you@example.com",

  /* 3. MAP ------------------------------------------------------------------ */
  map: {
    center: [4.1755, 73.5093],   // Malé
    zoom: 14,
    minZoom: 11,
    maxZoom: 19,
    maxBounds: [[4.10, 73.40], [4.30, 73.60]]  // Malé, Villimalé, Hulhumalé
  },

  /* 4. PHOTOS ---------------------------------------------------------------
     Largest photo the form will accept, in megabytes. */
  maxPhotoMb: 8,

};
