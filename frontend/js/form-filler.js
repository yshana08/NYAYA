// Smart Form Filler: extracts name / roll number / marks from pasted document text
// (or a plain-text upload — no real OCR, see backend/README.md) and fills the demo form,
// leaving the worker to review and confirm before anything is treated as final.
(function () {
  "use strict";

  var caseId = window.NyayaUI.requireCurrentCase();
  if (!caseId) return;

  var fileInput = document.getElementById("formFileInput");
  var scanText = document.getElementById("formScanText");
  var extractBtn = document.getElementById("formExtractBtn");
  var confirmBtn = document.getElementById("formConfirmBtn");
  var status = document.getElementById("formStatus");

  extractBtn.addEventListener("click", function () {
    var text = scanText.value.trim();
    if (!text) {
      window.NyayaUI.setStatus(status, "Paste the document's text first.", "error");
      return;
    }
    runExtract(text);
  });

  fileInput.addEventListener("change", function () {
    var file = fileInput.files[0];
    if (!file) return;
    if (file.type === "text/plain") {
      var reader = new FileReader();
      reader.onload = function () { scanText.value = reader.result; runExtract(reader.result); };
      reader.readAsText(file);
    } else {
      window.NyayaUI.setStatus(status, file.name + " uploaded — paste its text above to extract fields (no OCR in this demo).", "success");
    }
  });

  function runExtract(text) {
    window.NyayaUI.setStatus(status, "Extracting…");
    window.NyayaAPI.extractFormFields(caseId, text).then(function (fields) {
      renderFields(fields);
      window.NyayaUI.setStatus(status, "Extracted — please verify before confirming.", "success");
    }).catch(function (err) {
      window.NyayaUI.setStatus(status, err.message || "Could not extract anything from that text.", "error");
    });
  }

  function renderFields(fields) {
    var name = fields.name || "Not found";
    var roll = fields.rollNumber || "Not found";
    var marks = fields.totalMarks !== null ? fields.totalMarks + " / " + fields.maxMarks : "Not found";
    var pct = fields.percentage !== null ? fields.percentage + "%" : "Not found";

    document.getElementById("fmName").textContent = name;
    document.getElementById("fmRoll").textContent = roll;
    document.getElementById("fmMarks").textContent = marks;
    document.getElementById("fmPercent").textContent = pct;

    document.getElementById("ffName").value = name;
    document.getElementById("ffRoll").value = roll;
    document.getElementById("ffPercent").value = pct;

    document.getElementById("formVerifyNote").textContent = fields.percentage !== null
      ? "Nyaya calculated " + pct + " from the marks detected in your document. Please verify before submission."
      : "Nyaya couldn't find marks in that text — try pasting the full document.";
  }

  confirmBtn.addEventListener("click", function () {
    window.NyayaAPI.patchCase(caseId, { answers: { formConfirmed: true } })
      .then(function () { window.NyayaUI.setStatus(status, "Saved · worker-confirmed.", "success"); })
      .catch(function (err) { window.NyayaUI.setStatus(status, err.message || "Could not save.", "error"); });
  });
})();
