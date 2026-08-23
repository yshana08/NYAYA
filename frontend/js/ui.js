// Small formatting/DOM helpers shared by every page script — kept out of api.js and
// storage.js so those two stay pure "talk to the backend" / "talk to localStorage" modules.
window.NyayaUI = (function () {
  "use strict";

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message || "";
    el.classList.remove("error", "success");
    if (type) el.classList.add(type);
    el.classList.toggle("is-hidden", !message);
  }

  function formatINR(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN");
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  }

  // Case-scoped pages (questions, rights, evidence, ...) all need a current case to work on.
  // Sends the worker back to intake when there isn't one, and returns null so callers can bail.
  function requireCurrentCase() {
    var id = window.NyayaStore.getCurrentCaseId();
    if (!id) {
      window.location.href = "intake.html";
      return null;
    }
    return id;
  }

  // Triggers a browser download of a JSON blob without needing a server-generated file.
  function downloadJson(filename, data) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return { setStatus: setStatus, formatINR: formatINR, formatDate: formatDate, requireCurrentCase: requireCurrentCase, downloadJson: downloadJson };
})();
