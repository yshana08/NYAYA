// Case lifecycle: create from the intake demo, list/read, move the status pipe forward,
// merge in question-flow answers, delete, and export as a downloadable JSON file.
const express = require("express");
const caseStore = require("../store/caseStore");
const requireCase = require("./helpers/requireCase");
const { classify } = require("../classify");
const { buildChecklist } = require("../guidance/evidenceChecklist");

const router = express.Router();

// A short summary shape for list views (My Cases, dashboard) — avoids shipping full case bodies.
function toSummary(c) {
  return {
    id: c.id,
    detected: c.detected,
    status: c.status,
    evidenceReadiness: c.evidenceReadiness,
    pendingAmount: c.answers.pendingAmount || null,
    createdAt: c.createdAt
  };
}

router.post("/cases", async (req, res) => {
  try {
    const { text, lang } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "Please describe what happened." });
    }

    const classified = await classify(String(text).trim(), lang);
    const id = caseStore.nextCaseId();
    const now = new Date().toISOString();

    const caseRecord = caseStore.create({
      id,
      text: String(text).trim(),
      lang: lang || "en",
      issueKey: classified.issueKey,
      detected: classified.detected,
      question: classified.question,
      next: classified.next,
      evidence: classified.evidence,
      status: "Draft",
      timeline: [{ label: "Draft", at: now }],
      evidenceFiles: [],
      evidenceChecklist: buildChecklist(classified.issueKey),
      evidenceReadiness: 0,
      answers: {},
      platform: null,
      complaintDraft: null,
      formData: null,
      handoffRequested: false,
      createdAt: now
    });

    res.json({
      id: caseRecord.id,
      detected: caseRecord.detected,
      question: caseRecord.question,
      next: caseRecord.next,
      evidence: caseRecord.evidence
    });
  } catch (err) {
    console.error("POST /api/cases failed:", err);
    res.status(500).json({ error: "Could not process that case. Please try again." });
  }
});

// Optional ?ids=NYA-GW-1,NYA-GW-2 filter — lets a browser show only the cases it created,
// since there's no login/auth in this demo backend.
router.get("/cases", (req, res) => {
  const { ids } = req.query;
  let items = caseStore.list();
  if (ids) {
    const wanted = new Set(String(ids).split(",").map((s) => s.trim()).filter(Boolean));
    items = items.filter((c) => wanted.has(c.id));
  }
  res.json(items.map(toSummary));
});

router.get("/cases/:id", requireCase, (req, res) => {
  res.json(req.case);
});

// Moves the status pipe, appends a timeline entry, and/or merges question-flow answers
// (deactivation date, pending amount, etc.) and the chosen complaint platform.
router.patch("/cases/:id", requireCase, (req, res) => {
  const c = req.case;
  const { status, timelineEntry, answers, platform } = req.body || {};

  if (status) c.status = status;
  if (timelineEntry) c.timeline.push(timelineEntry);
  if (answers && typeof answers === "object") Object.assign(c.answers, answers);
  if (platform) c.platform = platform;

  res.json({ ok: true, case: c });
});

router.delete("/cases/:id", requireCase, (req, res) => {
  caseStore.remove(req.params.id);
  res.json({ ok: true });
});

router.get("/cases/:id/export", requireCase, (req, res) => {
  res.setHeader("Content-Disposition", `attachment; filename="${req.case.id}.json"`);
  res.json(req.case);
});

module.exports = router;
