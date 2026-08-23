// Evidence page: scan pasted evidence text (stand-in for real OCR), and read/toggle
// the per-category checklist that drives the evidence-readiness score.
const express = require("express");
const requireCase = require("./helpers/requireCase");
const { extractSignals } = require("../extraction/textSignals");
const { computeReadiness, autoTickFromChips, toggleItem } = require("../guidance/evidenceChecklist");

const router = express.Router();

router.get("/cases/:id/evidence-checklist", requireCase, (req, res) => {
  res.json({ checklist: req.case.evidenceChecklist, readiness: req.case.evidenceReadiness });
});

router.patch("/cases/:id/evidence-checklist", requireCase, (req, res) => {
  const c = req.case;
  const { category, label, done } = req.body || {};
  const found = toggleItem(c.evidenceChecklist, category, label, done);
  if (!found) return res.status(400).json({ error: "Unknown checklist item." });

  c.evidenceReadiness = computeReadiness(c.evidenceChecklist);
  res.json({ checklist: c.evidenceChecklist, readiness: c.evidenceReadiness });
});

router.post("/cases/:id/evidence", requireCase, (req, res) => {
  const c = req.case;
  const { filename, simulatedText } = req.body || {};
  const extracted = extractSignals(String(simulatedText || ""));

  c.evidenceFiles.push({ filename: filename || "pasted-text", extracted, scannedAt: new Date().toISOString() });
  autoTickFromChips(c.evidenceChecklist, extracted.chips);
  c.evidenceReadiness = computeReadiness(c.evidenceChecklist);

  res.json({ newChips: extracted.chips, checklist: c.evidenceChecklist, case: c });
});

module.exports = router;
