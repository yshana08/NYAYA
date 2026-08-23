// POST /api/cases/:id/handoff — "Prepare Case Package" on support.html: flags the case
// for a human/legal-aid supporter and logs it on the audit trail.
const express = require("express");
const requireCase = require("./helpers/requireCase");

const router = express.Router();

router.post("/cases/:id/handoff", requireCase, (req, res) => {
  const c = req.case;
  c.handoffRequested = true;
  c.timeline.push({ label: "Human handoff prepared", at: new Date().toISOString() });
  res.json({ ok: true, case: c });
});

module.exports = router;
