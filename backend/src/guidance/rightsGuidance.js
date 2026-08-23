// Rights & escalation guidance shown on rights.html — reads straight from issueTypes.js
// so it can never disagree with what the classifier or evidence checklist say about a case.
const { ISSUE_TYPES } = require("../issues/issueTypes");

function getRightsGuidance(issueKey) {
  const issue = ISSUE_TYPES[issueKey] || ISSUE_TYPES.other;
  return {
    nextStep: issue.next,
    options: issue.options,
    escalationPath: issue.escalationPath
  };
}

module.exports = { getRightsGuidance };
