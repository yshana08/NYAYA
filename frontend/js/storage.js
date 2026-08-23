// Per-browser case tracking. There's no login in this demo, so "my cases" and
// "the case I'm currently working on" are remembered in localStorage instead of a session.
window.NyayaStore = (function () {
  "use strict";

  var KEYS = { CASE_IDS: "nyaya.caseIds", CURRENT_ID: "nyaya.currentCaseId", LANG: "nyaya.lang" };

  function readList() {
    try { return JSON.parse(localStorage.getItem(KEYS.CASE_IDS)) || []; }
    catch (e) { return []; }
  }

  function getCaseIds() { return readList(); }

  // Adds an id to "my cases" and makes it the current one being worked on.
  function addCase(id) {
    var ids = readList();
    if (ids.indexOf(id) === -1) ids.unshift(id);
    localStorage.setItem(KEYS.CASE_IDS, JSON.stringify(ids));
    setCurrentCaseId(id);
  }

  function removeCase(id) {
    var ids = readList().filter(function (x) { return x !== id; });
    localStorage.setItem(KEYS.CASE_IDS, JSON.stringify(ids));
    if (getCurrentCaseId() === id) setCurrentCaseId(ids[0] || null);
  }

  function getCurrentCaseId() { return localStorage.getItem(KEYS.CURRENT_ID) || null; }

  function setCurrentCaseId(id) {
    if (id) localStorage.setItem(KEYS.CURRENT_ID, id);
    else localStorage.removeItem(KEYS.CURRENT_ID);
  }

  function getLang() { return localStorage.getItem(KEYS.LANG) || "en"; }
  function setLang(lang) { localStorage.setItem(KEYS.LANG, lang); }

  return {
    getCaseIds: getCaseIds,
    addCase: addCase,
    removeCase: removeCase,
    getCurrentCaseId: getCurrentCaseId,
    setCurrentCaseId: setCurrentCaseId,
    getLang: getLang,
    setLang: setLang
  };
})();
