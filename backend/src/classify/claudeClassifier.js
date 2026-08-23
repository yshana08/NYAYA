// Claude-powered classifier — forces a tool call so we always get valid, well-shaped
// JSON back instead of hoping the model returns parseable text.
const anthropic = require("../anthropicClient");
const { CLASSIFY_MODEL } = require("../config");
const { findIssueKeyByLabel } = require("../issues/issueTypes");

const CASE_TOOL = {
  name: "file_case",
  description: "File a gig-worker dispute into a structured case record.",
  input_schema: {
    type: "object",
    properties: {
      detected: {
        type: "string",
        description:
          "One short issue category, e.g. 'Payment Delay', 'Account Deactivation', 'Wrong Penalty', 'Incentive Dispute', 'Unsafe Incident', or 'Uncategorised — routed to review'."
      },
      question: { type: "string", description: "One useful follow-up question to ask the worker next." },
      next: { type: "string", description: "One concrete, practical next step the worker should take." },
      evidence: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 4,
        description: "2-4 short evidence/document items the worker should preserve or collect."
      }
    },
    required: ["detected", "question", "next", "evidence"]
  }
};

async function classifyWithClaude(text, lang) {
  const message = await anthropic.messages.create({
    model: CLASSIFY_MODEL,
    max_tokens: 500,
    system:
      "You are Nyaya, an AI dispute-intake assistant for Indian gig workers (drivers, delivery riders). " +
      "A worker describes a problem in Hindi, English, or Hinglish. File it as a structured case by calling " +
      "the file_case tool. Be practical and specific. Never invent laws, sections, or guaranteed outcomes. " +
      "Never ask for OTPs, PINs, passwords or bank credentials. Keep every field short and worker-facing.",
    messages: [{ role: "user", content: `Language hint: ${lang || "en"}\n\nWorker's problem:\n${text}` }],
    tools: [CASE_TOOL],
    tool_choice: { type: "tool", name: "file_case" }
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return a tool_use block");

  const { detected, question, next, evidence } = toolUse.input;
  if (!detected || !question || !next || !Array.isArray(evidence)) {
    throw new Error("Claude returned an incomplete case");
  }
  // Map Claude's free-text category back to one of our six known issue keys,
  // so downstream features (evidence checklist, rights guidance) still work.
  return { issueKey: findIssueKeyByLabel(detected), detected, question, next, evidence };
}

module.exports = { classifyWithClaude };
