// POST /api/cases/:id/complaint — generates the complaint draft shown on complaint.html.
const express = require("express");
const requireCase = require("./helpers/requireCase");
const { generateComplaint } = require("../complaint");

const router = express.Router();

router.post("/cases/:id/complaint", requireCase, async (req, res) => {
  try {
    const c = req.case;
    const { platform, complaintType, additional } = req.body || {};
    if (platform) c.platform = platform;

    const draft = await generateComplaint({
      complaintType: complaintType || c.detected,
      platform: platform || c.platform,
      additional,
      caseRecord: c
    });

    c.complaintDraft = draft;
    res.json(draft);
  } catch (err) {
    console.error("POST /api/cases/:id/complaint failed:", err);
    res.status(500).json({ error: "Could not generate the complaint. Please try again." });
  }
});

module.exports = router;
