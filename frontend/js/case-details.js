// Case Details: full view of one case — summary, a day-based escalation timeline,
// quick actions (which set this as the "current" case for the pages they link to),
// and the real audit trail.
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var caseId = params.get("id") || window.NyayaStore.getCurrentCaseId();
  if (!caseId) { window.location.href = "cases.html"; return; }
  window.NyayaStore.setCurrentCaseId(caseId); // Evidence/Complaint links below act on this case now

  function formatDateTime(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " · " +
      d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }

  window.NyayaAPI.getCase(caseId).then(function (c) {
    renderHeader(c);
    renderSummary(c);
    renderTimeline(c);
    renderAuditTrail(c);
    wireExport(c);
  }).catch(function () {
    document.getElementById("cdSummary").textContent = "Could not load this case — is the backend running?";
  });

  function renderHeader(c) {
    document.getElementById("cdCaseId").textContent = "CASE " + c.id;
    document.getElementById("cdIssueTitle").textContent = c.detected;
    document.getElementById("cdCreatedAt").textContent = "Created " + window.NyayaUI.formatDate(c.createdAt);
    document.getElementById("cdStatusBadge").textContent = "● " + c.status;
  }

  function renderSummary(c) {
    var parts = [c.text];
    if (c.answers.pendingAmount) parts.push("Approximately " + window.NyayaUI.formatINR(c.answers.pendingAmount) + " pending.");
    parts.push(c.timeline.length + " update(s) recorded so far.");
    document.getElementById("cdSummary").textContent = parts.join(" ");
  }

  // The four escalation stages are fixed (Day 0/3/7/10) — completeness is just how
  // many days have passed since the case was created.
  function renderTimeline(c) {
    var created = new Date(c.createdAt);
    var daysElapsed = Math.floor((Date.now() - created.getTime()) / 86400000);
    var stages = [
      { day: 0, label: "Submitted" },
      { day: 3, label: "Reminder" },
      { day: 7, label: "Escalation" },
      { day: 10, label: "External Support" }
    ];
    var firstPending = stages.findIndex(function (s) { return daysElapsed < s.day; });

    document.getElementById("cdTimeline").innerHTML = stages.map(function (s, i) {
      var cls = daysElapsed >= s.day ? "timeline-complete" : i === firstPending ? "timeline-active" : "";
      var due = new Date(created.getTime() + s.day * 86400000);
      var when = s.day === 10 ? "If unresolved" : window.NyayaUI.formatDate(due.toISOString());
      return '<div class="' + cls + '"><b>DAY ' + s.day + '</b><strong>' + s.label + '</strong><span>' + when + '</span></div>';
    }).join("");
  }

  function renderAuditTrail(c) {
    document.getElementById("cdAuditTrail").innerHTML = c.timeline.map(function (entry) {
      return "<div><span>" + formatDateTime(entry.at) + "</span> " + entry.label + "</div>";
    }).join("");
  }

  function wireExport(c) {
    document.getElementById("cdExportBtn").addEventListener("click", function (e) {
      e.preventDefault();
      window.NyayaUI.downloadJson(c.id + ".json", c);
    });
  }
})();
