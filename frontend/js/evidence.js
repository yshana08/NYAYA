// Evidence page: renders the live per-category checklist and readiness score for the
// current case, and scans evidence text (pasted, or read from a plain-text upload) to
// auto-tick matching items — the demo stand-in for real OCR (see backend/README.md).
(function () {
  "use strict";

  var caseId = window.NyayaUI.requireCurrentCase();
  if (!caseId) return;

  var CATEGORY_ICONS = { "Payment Evidence": "💰", "Account Evidence": "🔒", "Communication": "💬" };

  var categoriesEl = document.getElementById("evidenceCategories");
  var pctEl = document.getElementById("evidenceReadinessPct");
  var noteEl = document.getElementById("evidenceReadinessNote");
  var circleEl = document.getElementById("evidenceReadinessCircle");
  var fileInput = document.getElementById("evidenceFileInput");
  var scanText = document.getElementById("evidenceScanText");
  var scanBtn = document.getElementById("evidenceScanBtn");
  var scanStatus = document.getElementById("evidenceScanStatus");
  var scanChips = document.getElementById("evidenceScanChips");

  window.NyayaAPI.getEvidenceChecklist(caseId)
    .then(function (data) { renderChecklist(data.checklist); renderReadiness(data.readiness); })
    .catch(function () { /* keep the static demo checklist if the backend is unreachable */ });

  function renderReadiness(pct) {
    pctEl.textContent = pct + "%";
    circleEl.textContent = pct + "%";
    noteEl.textContent = pct >= 80
      ? "You're almost ready to submit your appeal."
      : "Keep collecting evidence to strengthen your case.";
  }

  function renderChecklist(checklist) {
    categoriesEl.innerHTML = checklist.map(function (cat) {
      var icon = CATEGORY_ICONS[cat.category] || "📁";
      var items = cat.items.map(function (item) {
        var cls = item.done ? "done" : "missing";
        var mark = item.done ? "✓ " : "+ ";
        return (
          '<div class="evidence-item ' + cls + '" data-category="' + cat.category + '" data-label="' + item.label + '" role="button" tabindex="0">' +
            mark + item.label +
          "</div>"
        );
      }).join("");
      return '<div class="evidence-category"><div class="category-header">' + icon + " <strong>" + cat.category + "</strong></div>" + items + "</div>";
    }).join("");

    categoriesEl.querySelectorAll(".evidence-item").forEach(function (el) {
      el.addEventListener("click", function () { toggleItem(el); });
    });
  }

  // Clicking a checklist item toggles it by hand — useful for evidence the worker
  // already has but hasn't (or can't) scan text for.
  function toggleItem(el) {
    var category = el.getAttribute("data-category");
    var label = el.getAttribute("data-label");
    var nowDone = !el.classList.contains("done");
    window.NyayaAPI.toggleEvidenceItem(caseId, category, label, nowDone).then(function (data) {
      renderChecklist(data.checklist);
      renderReadiness(data.readiness);
    });
  }

  scanBtn.addEventListener("click", function () {
    var text = scanText.value.trim();
    if (!text) {
      window.NyayaUI.setStatus(scanStatus, "Paste some text first.", "error");
      return;
    }
    runScan("pasted-text", text);
  });

  // Real screenshots/PDFs can't be OCR'd here, but a plain .txt upload can be read directly.
  fileInput.addEventListener("change", function () {
    Array.prototype.forEach.call(fileInput.files, function (file) {
      if (file.type === "text/plain") {
        var reader = new FileReader();
        reader.onload = function () { runScan(file.name, reader.result); };
        reader.readAsText(file);
      } else {
        runScan(file.name, ""); // logs the upload; paste the text above to actually scan it
        window.NyayaUI.setStatus(scanStatus, file.name + " uploaded — paste its text above to scan it.", "success");
      }
    });
  });

  function runScan(filename, text) {
    window.NyayaUI.setStatus(scanStatus, "Scanning…");
    window.NyayaAPI.scanEvidence(caseId, filename, text).then(function (data) {
      renderChecklist(data.checklist);
      renderReadiness(data.case.evidenceReadiness);
      scanChips.innerHTML = data.newChips.length
        ? data.newChips.map(function (c) { return '<span class="ev-chip">' + c + "</span>"; }).join(" ")
        : "";
      window.NyayaUI.setStatus(scanStatus, data.newChips.length ? "Found " + data.newChips.length + " signal(s)." : "No amounts, dates or status keywords found.", "success");
    }).catch(function (err) {
      window.NyayaUI.setStatus(scanStatus, err.message || "Could not scan that.", "error");
    });
  }
})();
