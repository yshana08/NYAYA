// Thin fetch wrapper around every backend route. One function per endpoint, so page
// scripts never build a URL or parse a response body themselves.
window.NyayaAPI = (function () {
  "use strict";

  // Shared request helper: JSON in, JSON out, throws with the server's own error message.
  function request(path, options) {
    options = options || {};
    var opts = {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json" }
    };
    if (options.body) opts.body = JSON.stringify(options.body);

    return fetch("/api" + path, opts).then(function (res) {
      if (res.status === 204) return null;
      return res.json().then(function (data) {
        if (!res.ok) throw new Error((data && data.error) || "Request failed.");
        return data;
      });
    });
  }

  return {
    health: function () { return request("/health"); },
    getAnalytics: function () { return request("/analytics"); },

    createCase: function (text, lang) {
      return request("/cases", { method: "POST", body: { text: text, lang: lang } });
    },
    listCases: function (ids) {
      var qs = ids && ids.length ? "?ids=" + encodeURIComponent(ids.join(",")) : "";
      return request("/cases" + qs);
    },
    getCase: function (id) { return request("/cases/" + id); },
    patchCase: function (id, patch) { return request("/cases/" + id, { method: "PATCH", body: patch }); },
    deleteCase: function (id) { return request("/cases/" + id, { method: "DELETE" }); },
    exportCaseUrl: function (id) { return "/api/cases/" + id + "/export"; },

    getRights: function (id) { return request("/cases/" + id + "/rights"); },

    getEvidenceChecklist: function (id) { return request("/cases/" + id + "/evidence-checklist"); },
    toggleEvidenceItem: function (id, category, label, done) {
      return request("/cases/" + id + "/evidence-checklist", { method: "PATCH", body: { category: category, label: label, done: done } });
    },
    scanEvidence: function (id, filename, simulatedText) {
      return request("/cases/" + id + "/evidence", { method: "POST", body: { filename: filename, simulatedText: simulatedText } });
    },

    extractFormFields: function (id, simulatedText) {
      return request("/cases/" + id + "/form-extract", { method: "POST", body: { simulatedText: simulatedText } });
    },

    generateComplaint: function (id, payload) {
      return request("/cases/" + id + "/complaint", { method: "POST", body: payload });
    },

    requestHandoff: function (id) { return request("/cases/" + id + "/handoff", { method: "POST" }); }
  };
})();
