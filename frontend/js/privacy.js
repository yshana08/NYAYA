// Trust & Privacy: view, export or delete the current case's stored data.
(function () {
  "use strict";

  var viewBtn = document.getElementById("privacyViewBtn");
  var exportBtn = document.getElementById("privacyExportBtn");
  var deleteBtn = document.getElementById("privacyDeleteBtn");
  var output = document.getElementById("privacyDataOutput");
  var status = document.getElementById("privacyStatus");

  var caseId = window.NyayaStore.getCurrentCaseId();
  if (!caseId) {
    [viewBtn, exportBtn, deleteBtn].forEach(function (b) { b.disabled = true; });
    window.NyayaUI.setStatus(status, "No case selected yet — start one from New Issue first.", "error");
    return;
  }

  viewBtn.addEventListener("click", function () {
    window.NyayaAPI.getCase(caseId).then(function (c) {
      output.textContent = JSON.stringify(c, null, 2);
      output.classList.remove("is-hidden");
    }).catch(function (err) { window.NyayaUI.setStatus(status, err.message || "Could not load case data.", "error"); });
  });

  exportBtn.addEventListener("click", function () {
    window.NyayaAPI.getCase(caseId).then(function (c) {
      window.NyayaUI.downloadJson(caseId + ".json", c);
    }).catch(function (err) { window.NyayaUI.setStatus(status, err.message || "Could not export case data.", "error"); });
  });

  deleteBtn.addEventListener("click", function () {
    if (!window.confirm("Permanently delete case " + caseId + "? This cannot be undone.")) return;
    window.NyayaAPI.deleteCase(caseId).then(function () {
      window.NyayaStore.removeCase(caseId);
      window.NyayaUI.setStatus(status, "Case " + caseId + " deleted.", "success");
      [viewBtn, exportBtn, deleteBtn].forEach(function (b) { b.disabled = true; });
      output.classList.add("is-hidden");
    }).catch(function (err) { window.NyayaUI.setStatus(status, err.message || "Could not delete the case.", "error"); });
  });
})();
