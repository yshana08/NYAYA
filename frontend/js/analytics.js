// Admin/NGO impact dashboard — real numbers across every case on the backend.
// Keeps the illustrative baseline numbers until there's at least one real case.
(function () {
  "use strict";

  window.NyayaAPI.getAnalytics().then(function (data) {
    if (!data.total) return; // fresh server — keep the illustrative baseline

    document.getElementById("anTotal").textContent = data.total;
    document.getElementById("anResolved").textContent = data.resolved;
    document.getElementById("anPending").textContent = data.pending;
    document.getElementById("anEscalated").textContent = data.escalated;
    if (data.recovered) document.getElementById("anRecovered").textContent = window.NyayaUI.formatINR(data.recovered);

    if (data.byIssueType.length) {
      document.getElementById("anIssueChart").innerHTML = data.byIssueType.map(function (i) {
        return '<div class="bar"><span>' + i.label + " (" + i.count + ")</span><div style=\"width:" + i.pct + '%"></div></div>';
      }).join("");
    }
  }).catch(function () { /* backend offline — leave the illustrative baseline */ });
})();
