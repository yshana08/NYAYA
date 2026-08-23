// In-memory case store — swap for a real database later, the shape stays the same.
// Every route reads/writes through this one module, so nothing else touches the raw Map.
const cases = new Map();
let caseCounter = 1041; // demo cases in the old script.js already used 1042-1047

function nextCaseId() {
  caseCounter += 1;
  return "NYA-GW-" + caseCounter;
}

function create(caseRecord) {
  cases.set(caseRecord.id, caseRecord);
  return caseRecord;
}

function get(id) {
  return cases.get(id) || null;
}

function list() {
  return Array.from(cases.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function remove(id) {
  return cases.delete(id);
}

function all() {
  return cases;
}

module.exports = { nextCaseId, create, get, list, remove, all };
