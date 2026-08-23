// Dispatcher: Claude when configured, offline template on any failure — same pattern as classify/index.js.
const anthropic = require("../anthropicClient");
const { templateComplaint } = require("./templateComplaint");
const { claudeComplaint } = require("./claudeComplaint");

async function generateComplaint(input) {
  if (anthropic) {
    try {
      return await claudeComplaint(input);
    } catch (err) {
      console.error("Claude complaint drafting failed, falling back to template:", err.message);
    }
  }
  return templateComplaint(input);
}

module.exports = { generateComplaint };
