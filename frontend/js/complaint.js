// Complaint Generator: drafts a platform-ready complaint from the case's own facts
// (Claude-written when configured, template-based otherwise — see backend/src/complaint/).
(function () {
  "use strict";

  var caseId = window.NyayaUI.requireCurrentCase();
  if (!caseId) return;

  var platformSelect = document.getElementById("complaintPlatform");
  var typeSelect = document.getElementById("complaintType");
  var additionalInput = document.getElementById("complaintAdditional");
  var generateBtn = document.getElementById("generateComplaintBtn");
  var status = document.getElementById("complaintStatus");
  var subjectEl = document.getElementById("complaintSubject");
  var bodyEl = document.getElementById("complaintBody");
  var copyBtn = document.getElementById("complaintCopyBtn");
  var downloadBtn = document.getElementById("complaintDownloadBtn");

  var draft = { subject: subjectEl.textContent, body: "" }; // plain text, kept for copy/download

  window.NyayaAPI.getCase(caseId).then(function (c) {
    if ([].slice.call(typeSelect.options).some(function (o) { return o.value === c.detected; })) {
      typeSelect.value = c.detected;
    }
    if (c.platform) platformSelect.value = c.platform;
  }).catch(function () {});

  generateBtn.addEventListener("click", function () {
    generateBtn.disabled = true;
    window.NyayaUI.setStatus(status, "Drafting…");

    window.NyayaAPI.generateComplaint(caseId, {
      platform: platformSelect.value || null,
      complaintType: typeSelect.value,
      additional: additionalInput.value.trim()
    }).then(function (result) {
      draft = result;
      subjectEl.textContent = result.subject;
      bodyEl.innerHTML = result.body.split("\n\n").map(function (para) {
        return para.replace(/\n/g, "<br>");
      }).join("<br><br>");
      window.NyayaUI.setStatus(status, "Draft ready.", "success");
    }).catch(function (err) {
      window.NyayaUI.setStatus(status, err.message || "Could not generate the complaint.", "error");
    }).finally(function () { generateBtn.disabled = false; });
  });

  copyBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(draft.subject + "\n\n" + draft.body)
      .then(function () { window.NyayaUI.setStatus(status, "Copied to clipboard.", "success"); });
  });

  downloadBtn.addEventListener("click", function () {
    var blob = new Blob([draft.subject + "\n\n" + draft.body], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = caseId + "-complaint.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
})();
