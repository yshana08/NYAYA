// Claude-drafted complaint — forced tool call, same pattern as the classifier,
// so we always get a clean { subject, body } back.
const anthropic = require("../anthropicClient");
const { CLASSIFY_MODEL } = require("../config");

const COMPLAINT_TOOL = {
  name: "draft_complaint",
  description: "Draft a formal, platform-ready complaint letter for a gig worker's dispute case.",
  input_schema: {
    type: "object",
    properties: {
      subject: { type: "string", description: "A short subject line starting with 'Subject: '." },
      body: { type: "string", description: "The full letter body, professional and factual, worker-facing." }
    },
    required: ["subject", "body"]
  }
};

async function claudeComplaint({ complaintType, platform, additional, caseRecord }) {
  const message = await anthropic.messages.create({
    model: CLASSIFY_MODEL,
    max_tokens: 600,
    system:
      "You draft short, professional, factual complaint letters for Indian gig workers to send to " +
      "delivery/ride-hailing platforms. Never invent facts not given to you. Never invent laws or " +
      "guaranteed outcomes. Call draft_complaint with the result.",
    messages: [{
      role: "user",
      content:
        `Complaint type: ${complaintType}\n` +
        `Platform: ${platform || "not specified"}\n` +
        `Case ID: ${caseRecord.id}\n` +
        `Case filed on: ${caseRecord.createdAt}\n` +
        `Worker's original description: ${caseRecord.text}\n` +
        `Pending amount (if any): ${(caseRecord.answers && caseRecord.answers.pendingAmount) || "not specified"}\n` +
        `Additional info from worker: ${additional || "none"}`
    }],
    tools: [COMPLAINT_TOOL],
    tool_choice: { type: "tool", name: "draft_complaint" }
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not return a tool_use block");

  const { subject, body } = toolUse.input;
  if (!subject || !body) throw new Error("Claude returned an incomplete complaint");
  return { subject, body };
}

module.exports = { claudeComplaint };
