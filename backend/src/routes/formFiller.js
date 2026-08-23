// POST /api/cases/:id/form-extract — the Smart Form Filler's document-to-fields step.
const express = require("express");
const requireCase = require("./helpers/requireCase");
const { extractFormFields } = require("../extraction/formSignals");

const router = express.Router();

router.post("/cases/:id/form-extract", requireCase, (req, res) => {
  const { simulatedText } = req.body || {};
  if (!simulatedText || !String(simulatedText).trim()) {
    return res.status(400).json({ error: "Paste the document text to extract from." });
  }

  const fields = extractFormFields(simulatedText);
  req.case.formData = fields; // worker still has to confirm before it's used anywhere
  res.json(fields);
});

module.exports = router;
