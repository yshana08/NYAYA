// Builds and scores the per-case evidence checklist shown on the Evidence page.
const { ISSUE_TYPES } = require("../issues/issueTypes");

// A fresh checklist for a case, grouped by category, everything starts un-collected.
function buildChecklist(issueKey) {
  const template = (ISSUE_TYPES[issueKey] || ISSUE_TYPES.other).evidenceChecklist;
  return Object.entries(template).map(([category, items]) => ({
    category,
    items: items.map((label) => ({ label, done: false }))
  }));
}

// Readiness = % of checklist items marked done. Falls back to 0 for an empty checklist.
function computeReadiness(checklist) {
  const items = checklist.flatMap((c) => c.items);
  if (!items.length) return 0;
  const done = items.filter((i) => i.done).length;
  return Math.round((done / items.length) * 100);
}

// Auto-ticks any checklist item whose label appears (as a word) in a freshly scanned chip,
// e.g. a chip "Status: deactivated" ticks an "Account Evidence" item mentioning "deactivation".
function autoTickFromChips(checklist, chips) {
  const lowerChips = chips.map((c) => c.toLowerCase());
  checklist.forEach((category) => {
    category.items.forEach((item) => {
      if (item.done) return;
      const keyword = item.label.toLowerCase().split(/[\s/(]/)[0];
      if (lowerChips.some((chip) => chip.includes(keyword))) item.done = true;
    });
  });
  return checklist;
}

// Manually toggles one item by category + label; returns false if it wasn't found.
function toggleItem(checklist, category, label, done) {
  const cat = checklist.find((c) => c.category === category);
  const item = cat && cat.items.find((i) => i.label === label);
  if (!item) return false;
  item.done = !!done;
  return true;
}

module.exports = { buildChecklist, computeReadiness, autoTickFromChips, toggleItem };
