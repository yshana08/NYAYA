// Wires up the two language controls that appear across pages:
// - dashboard's single "हिन्दी / EN" button — cycles the stored preference
// - intake's two-button .language-switch — sets it explicitly and highlights the active one
(function () {
  "use strict";

  var single = document.getElementById("langToggle");
  if (single) {
    single.addEventListener("click", function () {
      var next = window.NyayaStore.getLang() === "hi" ? "en" : "hi";
      window.NyayaStore.setLang(next);
    });
  }

  var switches = document.querySelectorAll(".language-switch");
  switches.forEach(function (group) {
    var buttons = group.querySelectorAll("button");
    buttons.forEach(function (btn) {
      var code = btn.textContent.trim().toLowerCase().indexOf("hindi") !== -1 || btn.textContent.indexOf("हिन्दी") !== -1 ? "hi" : "en";
      btn.setAttribute("data-lang", code);
      if (code === window.NyayaStore.getLang()) {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
      }
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        window.NyayaStore.setLang(code);
      });
    });
  });
})();
