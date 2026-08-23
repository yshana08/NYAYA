// Step 2 of 5: a few follow-up details, saved onto the case before moving to Rights & Action.
(function () {
  "use strict";

  var caseId = window.NyayaUI.requireCurrentCase();
  if (!caseId) return;

  var detectedLabel = document.getElementById("qDetectedLabel");
  var followUp = document.getElementById("qFollowUp");
  var dateInput = document.getElementById("qDate");
  var reasonChoice = document.getElementById("qReasonChoice");
  var amountInput = document.getElementById("qPendingAmount");
  var continueBtn = document.getElementById("qContinueBtn");
  var status = document.getElementById("qStatus");
  var selectedReason = null;

  window.NyayaAPI.getCase(caseId).then(function (c) {
    detectedLabel.textContent = c.detected;
    followUp.textContent = c.question;
    if (c.answers.eventDate) dateInput.value = c.answers.eventDate;
    if (c.answers.pendingAmount) amountInput.value = c.answers.pendingAmount;
    if (c.answers.reasonGiven) selectReason(c.answers.reasonGiven);
  }).catch(function () { /* keep the static defaults if the backend is unreachable */ });

  reasonChoice.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () { selectReason(btn.getAttribute("data-value")); });
  });

  function selectReason(value) {
    selectedReason = value;
    reasonChoice.querySelectorAll("button").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-value") === value);
    });
  }

  continueBtn.addEventListener("click", function (e) {
    e.preventDefault();
    var answers = {};
    if (dateInput.value) answers.eventDate = dateInput.value;
    if (selectedReason) answers.reasonGiven = selectedReason;
    if (amountInput.value) answers.pendingAmount = Number(amountInput.value);

    window.NyayaUI.setStatus(status, "Saving…");
    window.NyayaAPI.patchCase(caseId, { answers: answers })
      .then(function () { window.location.href = "rights.html"; })
      .catch(function (err) { window.NyayaUI.setStatus(status, err.message || "Could not save your answers.", "error"); });
  });
})();
