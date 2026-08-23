// Single source of truth for the six dispute types Nyaya understands.
// Every other module (classifier, rights guidance, evidence checklist) reads from here
// instead of keeping its own copy, so the six categories never drift out of sync.

const ISSUE_TYPES = {
  deactivation: {
    label: "Account Deactivation",
    keywords: ["deactivat", "band ho", "account band", "blocked", "suspend"],
    question: "Did the app show any message or email when it was deactivated?",
    next: "Request the written reason for deactivation and preserve your last 30 days of earnings history before it disappears.",
    evidence: ["Deactivation notice", "Earnings history (30d)", "ID / registration"],
    options: [
      "Request a written reason for deactivation",
      "Preserve your payment/earnings records",
      "Submit a formal appeal",
      "Follow up if the platform stays silent",
      "Escalate if the appeal is ignored"
    ],
    escalationPath: ["Platform Support", "Grievance Channel", "Worker Organization", "Legal Aid"],
    evidenceChecklist: {
      "Account Evidence": ["Deactivation screenshot", "Deactivation notice / message", "ID / registration proof"],
      "Payment Evidence": ["Earnings history (30 days)"],
      "Communication": ["Support conversation / ticket"]
    }
  },
  payment: {
    label: "Payment Delay",
    keywords: ["payment", "paisa", "paise", "nahi mila", "payout", "salary"],
    question: "Which orders are pending — do you have the order IDs or trip receipts?",
    next: "File a payment-delay ticket with your order IDs today. Platforms typically must settle within 3–7 working days.",
    evidence: ["Order / trip IDs", "Payment ledger screenshot", "Bank statement (7d)"],
    options: [
      "File a payment-delay ticket with order IDs",
      "Attach a payment ledger screenshot",
      "Wait out the standard 3–7 working day window",
      "Escalate if still unpaid after that window"
    ],
    escalationPath: ["Platform Support", "Payments Team", "Grievance Channel", "Legal Aid"],
    evidenceChecklist: {
      "Payment Evidence": ["Earnings statement", "Payment history", "Pending payout proof"],
      "Communication": ["Support conversation"]
    }
  },
  penalty: {
    label: "Wrong Penalty",
    keywords: ["penalty", "fine", "jurmana", "charge lag", "deduct"],
    question: "Do you have a timestamped photo or GPS log from when the delay happened?",
    next: "Dispute the penalty inside the appeal window and attach your timestamped photo as proof of the delay cause.",
    evidence: ["Timestamped photo", "Trip GPS / route log", "Penalty notice"],
    options: [
      "Dispute the penalty inside the appeal window",
      "Attach timestamped proof of the cause",
      "Follow up if there's no response",
      "Escalate if the dispute is rejected unfairly"
    ],
    escalationPath: ["Platform Support", "Appeals Team", "Grievance Channel", "Worker Organization"],
    evidenceChecklist: {
      "Account Evidence": ["Penalty notice"],
      "Payment Evidence": ["Timestamped photo", "Trip GPS / route log"],
      "Communication": ["Support conversation"]
    }
  },
  incentive: {
    label: "Incentive Dispute",
    keywords: ["incentive", "bonus"],
    question: "Can you share the incentive scheme screenshot shown before you started the trips?",
    next: "Compare your trip count against the published slab and raise a shortfall ticket with both screenshots.",
    evidence: ["Incentive scheme screenshot", "Trip count summary", "Payout breakdown"],
    options: [
      "Compare your trip count against the published slab",
      "Raise a shortfall ticket with both screenshots",
      "Escalate if the shortfall isn't corrected"
    ],
    escalationPath: ["Platform Support", "Incentives Team", "Grievance Channel", "Worker Organization"],
    evidenceChecklist: {
      "Payment Evidence": ["Incentive scheme screenshot", "Trip count summary", "Payout breakdown"]
    }
  },
  safety: {
    label: "Unsafe Incident",
    keywords: ["unsafe", "danger", "gaali", "threat", "dhamki", "safety", "harass"],
    question: "Is this the first report on this customer, and do you have the in-app chat or call log?",
    next: "File a safety report immediately through the app's SOS channel and ask that the account be flagged.",
    evidence: ["In-app chat / call log", "Order / customer ID", "Witness contact, if any"],
    options: [
      "File a safety report through the SOS channel",
      "Ask that the offending account be flagged",
      "Preserve the chat/call log as evidence",
      "Escalate to the platform's safety team"
    ],
    escalationPath: ["Platform Safety Team", "Grievance Channel", "Local Authorities", "Legal Aid"],
    evidenceChecklist: {
      "Account Evidence": ["Order / customer ID"],
      "Communication": ["In-app chat / call log", "Witness contact, if any"]
    }
  },
  other: {
    label: "Uncategorised — routed to review",
    keywords: [],
    question: "Tell me in one line what happened, Hindi or English — I'll find the closest process.",
    next: "Your case is queued for a quick human review. You'll get a recommended path within one working day.",
    evidence: ["Any related screenshots", "A short written account"],
    options: ["Describe the issue in one line", "Wait for the human review queue", "Add more evidence if asked"],
    escalationPath: ["Review Queue", "Grievance Channel", "Worker Organization", "Legal Aid"],
    evidenceChecklist: {
      "Communication": ["Any related screenshots", "A short written account"]
    }
  }
};

// Ordered keys, "other" last — used wherever we need to try specific types before the catch-all.
const ISSUE_KEYS = Object.keys(ISSUE_TYPES).filter((k) => k !== "other").concat("other");

// Finds the closest issue key for a free-text label (e.g. Claude's own wording of "detected").
// Falls back to "other" when nothing matches, so a lookup never returns undefined.
function findIssueKeyByLabel(label) {
  const lower = String(label || "").toLowerCase();
  for (const key of ISSUE_KEYS) {
    if (key === "other") continue;
    const issue = ISSUE_TYPES[key];
    if (lower.includes(key) || lower.includes(issue.label.toLowerCase())) return key;
  }
  return "other";
}

module.exports = { ISSUE_TYPES, ISSUE_KEYS, findIssueKeyByLabel };
