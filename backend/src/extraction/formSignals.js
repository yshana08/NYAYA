// Smart Form Filler extraction — demo-grade, same philosophy as textSignals.js:
// regex over pasted "document text" standing in for a real OCR/parsing pass.
const NAME_RE = /name\s*[:\-]\s*([a-z][a-z .]{1,60})/i;
const ROLL_RE = /roll\s*(?:no\.?|number)?\s*[:\-]\s*([a-z0-9\/-]{2,20})/i;
const MARKS_RE = /(\d{1,4}(?:\.\d{1,2})?)\s*(?:\/|out of)\s*(\d{1,4})/i;
const PERCENT_RE = /(\d{1,3}(?:\.\d{1,2})?)\s*%/;

// Extracts whatever fields it can find; missing fields come back as null so the
// caller (and the UI) can show "not found" instead of a wrong guess.
function extractFormFields(text) {
  const source = String(text || "");
  const nameMatch = source.match(NAME_RE);
  const rollMatch = source.match(ROLL_RE);
  const marksMatch = source.match(MARKS_RE);
  const percentMatch = source.match(PERCENT_RE);

  const totalMarks = marksMatch ? Number(marksMatch[1]) : null;
  const maxMarks = marksMatch ? Number(marksMatch[2]) : null;
  const percentage = totalMarks !== null && maxMarks
    ? Math.round((totalMarks / maxMarks) * 1000) / 10
    : percentMatch ? Number(percentMatch[1]) : null;

  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    rollNumber: rollMatch ? rollMatch[1].trim() : null,
    totalMarks,
    maxMarks,
    percentage
  };
}

module.exports = { extractFormFields };
