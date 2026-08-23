// Central place for env-driven settings, so nothing else reads process.env directly.
require("dotenv").config();
const path = require("path");

module.exports = {
  PORT: process.env.PORT || 3000,
  SITE_ROOT: path.join(__dirname, "..", "..", "frontend"), // static site lives in the sibling frontend/ folder
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || null,
  CLASSIFY_MODEL: "claude-haiku-4-5-20251001"
};
