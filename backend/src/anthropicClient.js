// Single shared Anthropic client — null when no API key, so callers can feature-detect with `if (anthropic)`.
const Anthropic = require("@anthropic-ai/sdk");
const { ANTHROPIC_API_KEY } = require("./config");

const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;

module.exports = anthropic;
