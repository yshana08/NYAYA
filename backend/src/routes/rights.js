// GET /api/cases/:id/rights — the "your options" + escalation path shown on rights.html.
const express = require("express");
const requireCase = require("./helpers/requireCase");
const { getRightsGuidance } = require("../guidance/rightsGuidance");

const router = express.Router();

router.get("/cases/:id/rights", requireCase, (req, res) => {
  res.json(getRightsGuidance(req.case.issueKey));
});

module.exports = router;
