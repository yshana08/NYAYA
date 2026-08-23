// GET /api/analytics — impact numbers for the dashboard and the admin/NGO analytics page.
const express = require("express");
const { computeAnalytics } = require("../analytics/analytics");

const router = express.Router();

router.get("/analytics", (req, res) => {
  res.json(computeAnalytics());
});

module.exports = router;
