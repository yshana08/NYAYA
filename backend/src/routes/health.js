// GET /api/health — is the server up, is Claude configured.
const express = require("express");
const anthropic = require("../anthropicClient");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Nyaya backend is running", ai: !!anthropic });
});

module.exports = router;
