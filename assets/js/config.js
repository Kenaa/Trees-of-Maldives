/* ---------------------------------------------------------------------------
   CONFIG — this is the only file you need to edit to get submissions working.
   Everything else can be left alone.
--------------------------------------------------------------------------- */

window.CONFIG = {

  /* 1. WHERE SUBMISSIONS GO -------------------------------------------------
     Paste the endpoint URL from your form service between the quotes.
     Works with any service that accepts a plain multipart POST — for example
     Formspree, Getform, Web3Forms or Basin. Check the current free tier for
     photo uploads before you commit to one; limits change.

     Leave it as "" and the form still works: it will hand the submitter a
     tidy summary to copy, plus a pre-filled email to you. Nothing is lost. */
  submitEndpoint: "",

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

  /* 5. PRIVACY --------------------------------------------------------------
     Round published coordinates for trees on private land to this many
     decimal places (3 ≈ 110 m). Set to null to publish exact positions. */
  privateLandPrecision: 3
};
