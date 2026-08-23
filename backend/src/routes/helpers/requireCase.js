// Shared "does this case exist" guard so every case-scoped route doesn't repeat the same 404 check.
const caseStore = require("../../store/caseStore");

function requireCase(req, res, next) {
  const caseRecord = caseStore.get(req.params.id);
  if (!caseRecord) return res.status(404).json({ error: "Case not found." });
  req.case = caseRecord;
  next();
}

module.exports = requireCase;
