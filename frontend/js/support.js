// Worker Safety Net: reveals the (static, curated) organization/legal-aid directories,
// and sends the current case's package to a human supporter via the backend.
(function () {
  "use strict";

  document.getElementById("findOrgsBtn").addEventListener("click", function () {
    document.getElementById("orgsList").classList.toggle("is-hidden");
  });
  document.getElementById("findLegalAidBtn").addEventListener("click", function () {
    document.getElementById("legalAidList").classList.toggle("is-hidden");
  });

  var handoffBtn = document.getElementById("handoffBtn");
  var status = document.getElementById("handoffStatus");

  handoffBtn.addEventListener("click", function () {
    var caseId = window.NyayaStore.getCurrentCaseId();
    if (!caseId) {
      window.NyayaUI.setStatus(status, "Start a case first (New Issue) before requesting handoff.", "error");
      return;
    }
    handoffBtn.disabled = true;
    window.NyayaUI.setStatus(status, "Preparing case package…");
    window.NyayaAPI.requestHandoff(caseId)
      .then(function () { window.NyayaUI.setStatus(status, "Case package prepared — a human supporter will follow up.", "success"); })
      .catch(function (err) { window.NyayaUI.setStatus(status, err.message || "Could not prepare the case package.", "error"); })
      .finally(function () { handoffBtn.disabled = false; });
  });
})();
