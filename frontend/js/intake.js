// Step 1 of 5: turn the worker's own words into a classified case, then move on to
// the follow-up questions. Handles both typed text and voice input.
(function () {
  "use strict";

  var textarea = document.getElementById("intakeText");
  var analyzeBtn = document.getElementById("analyzeBtn");
  var voiceBtn = document.getElementById("voiceBtn");
  var status = document.getElementById("intakeStatus");

  analyzeBtn.addEventListener("click", function () {
    var text = textarea.value.trim();
    if (!text) {
      window.NyayaUI.setStatus(status, "Please describe what happened first.", "error");
      return;
    }
    submitIssue(text);
  });

  function submitIssue(text) {
    analyzeBtn.disabled = true;
    window.NyayaUI.setStatus(status, "Analyzing your issue…");

    window.NyayaAPI.createCase(text, window.NyayaStore.getLang())
      .then(function (result) {
        window.NyayaStore.addCase(result.id);
        window.location.href = "questions.html";
      })
      .catch(function (err) {
        analyzeBtn.disabled = false;
        window.NyayaUI.setStatus(status, err.message || "Could not reach the backend.", "error");
      });
  }

  /* ---------- voice intake (Web Speech API — Chrome/Edge only) ---------- */
  var SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognitionCtor) {
    voiceBtn.title = "Voice input needs Chrome or Edge — type instead.";
    voiceBtn.disabled = true;
    return;
  }

  var recognition = new SpeechRecognitionCtor();
  recognition.continuous = false;
  recognition.interimResults = false;

  voiceBtn.addEventListener("click", function () {
    recognition.lang = window.NyayaStore.getLang() === "hi" ? "hi-IN" : "en-IN";
    voiceBtn.textContent = "🎙️ Listening…";
    voiceBtn.disabled = true;
    try { recognition.start(); } catch (e) { resetVoiceBtn(); }
  });

  recognition.addEventListener("result", function (e) {
    textarea.value = e.results[0][0].transcript;
    resetVoiceBtn();
  });
  recognition.addEventListener("error", function () {
    window.NyayaUI.setStatus(status, "Didn't catch that — try again or type instead.", "error");
    resetVoiceBtn();
  });
  recognition.addEventListener("end", resetVoiceBtn);

  function resetVoiceBtn() {
    voiceBtn.textContent = "🎙️ Speak instead";
    voiceBtn.disabled = false;
  }
})();
