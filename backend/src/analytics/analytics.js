// Real numbers from real demo cases. The front end keeps its own illustrative baseline
// until this returns a non-zero total, so a fresh server doesn't blank the dashboard/analytics pages.
const caseStore = require("../store/caseStore");
const { parseAmount } = require("../extraction/textSignals");

function computeAnalytics() {
  let resolved = 0;
  let escalated = 0;
  let pending = 0;
  let recovered = 0;
  const byIssueType = new Map();

  caseStore.all().forEach((c) => {
    if (c.status === "Resolved") {
      resolved += 1;
      c.evidenceFiles.forEach((f) => f.extracted.amounts.forEach((a) => (recovered += parseAmount(a))));
    } else if (c.status === "Escalated") {
      escalated += 1;
    } else {
      pending += 1; // Draft, Submitted, Awaiting response
    }
    byIssueType.set(c.detected, (byIssueType.get(c.detected) || 0) + 1);
  });

  const issueCounts = Array.from(byIssueType.entries()).map(([label, count]) => ({ label, count }));
  const maxCount = Math.max(1, ...issueCounts.map((i) => i.count));
  const byIssueTypeChart = issueCounts
    .sort((a, b) => b.count - a.count)
    .map((i) => ({ ...i, pct: Math.round((i.count / maxCount) * 100) }));

  return { total: caseStore.all().size, resolved, escalated, pending, recovered, byIssueType: byIssueTypeChart };
}

module.exports = { computeAnalytics };
