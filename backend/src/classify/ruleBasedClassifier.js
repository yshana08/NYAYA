// Offline classifier — plain keyword matching, no network call needed.
// Mirrors the six issue types in issueTypes.js so the demo behaves the same with or without Claude.
const { ISSUE_TYPES, ISSUE_KEYS } = require("../issues/issueTypes");

function ruleBasedClassify(text) {
  const lower = text.toLowerCase();
  const key = ISSUE_KEYS.find((k) => ISSUE_TYPES[k].keywords.some((word) => lower.includes(word))) || "other";
  const issue = ISSUE_TYPES[key];
  return {
    issueKey: key,
    detected: issue.label,
    question: issue.question,
    next: issue.next,
    evidence: issue.evidence
  };
}

module.exports = { ruleBasedClassify };
