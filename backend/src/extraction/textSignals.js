// Evidence-scan extraction — no real OCR (see the intake demo's note to the user).
// Pulls amounts / dates / status words out of pasted text, the same way a real OCR
// pass would hand off to this stage.
const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";
const AMOUNT_RE = /₹\s?\d[\d,]*(?:\.\d{1,2})?/g;
const DATE_RE = new RegExp(`\\b\\d{1,2}\\s+(?:${MONTHS})\\b`, "gi");
const STATUS_WORDS = [
  "deactivated", "suspended", "pending", "approved", "rejected",
  "resolved", "delayed", "blocked", "reinstated", "under review"
];

function extractSignals(text) {
  const amounts = text.match(AMOUNT_RE) || [];
  const dates = text.match(DATE_RE) || [];
  const lower = text.toLowerCase();
  const statuses = STATUS_WORDS.filter((w) => lower.includes(w));

  const chips = []
    .concat(amounts.map((a) => a.replace(/\s+/g, " ").trim()))
    .concat(dates.map((d) => "Date: " + d))
    .concat(statuses.map((s) => "Status: " + s));

  return {
    chips,
    amounts,
    hasAmount: amounts.length > 0,
    hasDate: dates.length > 0,
    hasStatus: statuses.length > 0
  };
}

function parseAmount(chip) {
  return Number(chip.replace(/[₹,\s]/g, "")) || 0;
}

module.exports = { extractSignals, parseAmount };
