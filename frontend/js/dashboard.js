// Dashboard: pulls the worker's own cases (tracked in localStorage, no login in this demo)
// and fills in the summary cards. Leaves the page's static demo content untouched when
// there are no real cases yet, same fallback approach as the rest of the app.
(function () {
  "use strict";

  var ids = window.NyayaStore.getCaseIds();
  if (!ids.length) return; // fresh visitor — keep the illustrative placeholder cards

  window.NyayaAPI.listCases(ids).then(function (summaries) {
    if (!summaries.length) return;
    renderActiveCases(summaries);
    renderPendingEarnings(summaries);
    return renderCurrentCaseCards(summaries);
  }).catch(function () { /* backend offline — leave the placeholder UI as-is */ });

  function statusDotClass(status) {
    return status === "Escalated" || status === "Awaiting response" ? "orange-dot" : "green-dot";
  }

  function renderActiveCases(summaries) {
    var active = summaries.filter(function (c) { return c.status !== "Resolved"; });
    document.getElementById("activeCasesCount").textContent = active.length;

    var list = document.getElementById("activeCasesList");
    list.innerHTML = active.slice(0, 2).map(function (c) {
      return (
        '<div class="case-mini">' +
          '<span class="case-status ' + statusDotClass(c.status) + '">●</span>' +
          '<div><strong>' + c.detected + '</strong><small>' + c.id + '</small></div>' +
          '<span>' + c.evidenceReadiness + '%</span>' +
        '</div>'
      );
    }).join("") || '<p style="font-size:13px;color:var(--muted);">No active cases.</p>';
  }

  function renderPendingEarnings(summaries) {
    var total = summaries
      .filter(function (c) { return c.status !== "Resolved"; })
      .reduce(function (sum, c) { return sum + (Number(c.pendingAmount) || 0); }, 0);
    if (total > 0) document.getElementById("pendingEarningsAmount").textContent = window.NyayaUI.formatINR(total);
  }

  // The readiness ring + "next action" banner both describe one specific case —
  // prefer the one the worker was last looking at, else the most recently created.
  function renderCurrentCaseCards(summaries) {
    var currentId = window.NyayaStore.getCurrentCaseId();
    var pick = summaries.find(function (c) { return c.id === currentId; }) || summaries[0];
    return window.NyayaAPI.getCase(pick.id).then(function (full) {
      document.getElementById("dashboardReadinessCircle").textContent = full.evidenceReadiness + "%";
      document.getElementById("dashboardReadinessNote").textContent = full.next;

      document.getElementById("nextActionTitle").textContent = full.next;
      document.getElementById("nextActionMeta").textContent = "Case " + full.id;
      document.getElementById("nextActionBtn").addEventListener("click", function () {
        window.NyayaStore.setCurrentCaseId(full.id);
        window.location.href = "rights.html";
      });
    });
  }
})();
