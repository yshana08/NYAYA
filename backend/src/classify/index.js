// Dispatcher: try Claude when configured, fall back to the offline matcher on any failure
// (missing key, network error, malformed response) — the app should never hard-fail here.
const anthropic = require("../anthropicClient");
const { ruleBasedClassify } = require("./ruleBasedClassifier");
const { classifyWithClaude } = require("./claudeClassifier");

async function classify(text, lang) {
  if (anthropic) {
    try {
      return await classifyWithClaude(text, lang);
    } catch (err) {
      console.error("Claude classification failed, falling back to offline matcher:", err.message);
    }
  }
  return ruleBasedClassify(text);
}

module.exports = { classify };
