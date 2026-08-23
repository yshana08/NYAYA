// Earnings-at-Risk Calculator: pure client-side math, with an "Add to Case" that saves
// the result onto the current case's pending amount.
(function () {
  "use strict";

  var rateInput = document.getElementById("earnDailyRate");
  var daysInput = document.getElementById("earnDays");
  var resultAmount = document.getElementById("earnResultAmount");
  var resultFormula = document.getElementById("earnResultFormula");
  var addBtn = document.getElementById("earnAddToCaseBtn");
  var status = document.getElementById("earnStatus");

  function recalc() {
    var rate = Number(rateInput.value) || 0;
    var days = Number(daysInput.value) || 0;
    var total = rate * days;
    resultAmount.textContent = window.NyayaUI.formatINR(total);
    resultFormula.textContent = "₹" + rate + "/day × " + days + " days";
    return total;
  }

  rateInput.addEventListener("input", recalc);
  daysInput.addEventListener("input", recalc);
  recalc();

  addBtn.addEventListener("click", function () {
    var caseId = window.NyayaStore.getCurrentCaseId();
    if (!caseId) {
      window.NyayaUI.setStatus(status, "Start a case first (New Issue) before adding this.", "error");
      return;
    }
    var total = recalc();
    window.NyayaAPI.patchCase(caseId, { answers: { pendingAmount: total } })
      .then(function () { window.NyayaUI.setStatus(status, "Added " + window.NyayaUI.formatINR(total) + " to your case.", "success"); })
      .catch(function (err) { window.NyayaUI.setStatus(status, err.message || "Could not save.", "error"); });
  });
})();
