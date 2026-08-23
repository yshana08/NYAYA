// My Cases: lists every case this browser has created. Clicking a row makes it the
// "current" case (read by case-details.html and every case-scoped page after it).
(function () {
  "use strict";

  var ids = window.NyayaStore.getCaseIds();
  if (!ids.length) return; // fresh visitor — keep the illustrative placeholder rows

  var container = document.getElementById("caseListContainer");

  function statusClass(status) {
    return status === "Escalated" || status === "Awaiting response" ? "status-orange" : "status-green";
  }

  window.NyayaAPI.listCases(ids).then(function (cases) {
    if (!cases.length) return;
    container.innerHTML = cases.map(function (c) {
      return (
        '<a href="case-details.html" class="case-row" data-id="' + c.id + '">' +
          '<div class="case-id"><span>CASE ID</span><strong>' + c.id + '</strong></div>' +
          '<div><span>ISSUE</span><strong>' + c.detected + '</strong></div>' +
          '<div><span>STATUS</span><b class="' + statusClass(c.status) + '">' + c.status + '</b></div>' +
          '<div><span>READINESS</span><strong>' + c.evidenceReadiness + '%</strong></div>' +
          '<div>→</div>' +
        '</a>'
      );
    }).join("");

    container.querySelectorAll(".case-row").forEach(function (row) {
      row.addEventListener("click", function () {
        window.NyayaStore.setCurrentCaseId(row.getAttribute("data-id"));
      });
    });
  }).catch(function () { /* backend offline — leave the placeholder rows as-is */ });
})();
