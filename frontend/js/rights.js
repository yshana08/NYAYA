// Rights & Action: shows the AI's recommended next step, options, and escalation path
// for the current case, and lets the worker mark the next step as started.
(function () {
  "use strict";

  var caseId = window.NyayaUI.requireCurrentCase();
  if (!caseId) return;

  var nextStepEl = document.getElementById("rightsNextStep");
  var optionsList = document.getElementById("rightsOptionsList");
  var escalationPath = document.getElementById("rightsEscalationPath");
  var startBtn = document.getElementById("rightsStartActionBtn");
  var status = document.getElementById("rightsActionStatus");

  window.NyayaAPI.getRights(caseId).then(function (rights) {
    nextStepEl.textContent = rights.nextStep;
    optionsList.innerHTML = rights.options.map(function (o) { return "<li>" + o + "</li>"; }).join("");
    // First stage is always the active/current one — the worker hasn't escalated yet at this point.
    escalationPath.innerHTML = rights.escalationPath.map(function (stage, i) {
      var node = '<div' + (i === 0 ? ' class="path-active"' : "") + ">" + stage + "</div>";
      return i === 0 ? node : "<span>↓</span>" + node;
    }).join("");
  }).catch(function () { /* keep the static defaults if the backend is unreachable */ });

  startBtn.addEventListener("click", function () {
    startBtn.disabled = true;
    window.NyayaUI.setStatus(status, "Saving…");
    window.NyayaAPI.patchCase(caseId, {
      status: "Submitted",
      timelineEntry: { label: "Submitted", at: new Date().toISOString() }
    }).then(function () {
      window.NyayaUI.setStatus(status, "Marked as started — case moved to Submitted.", "success");
    }).catch(function (err) {
      startBtn.disabled = false;
      window.NyayaUI.setStatus(status, err.message || "Could not update the case.", "error");
    });
  });
})();
