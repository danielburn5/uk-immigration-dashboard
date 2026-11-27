"use strict";
(() => {
  const form = document.getElementById("feedback-form");
  if (!form || !window.fetch) return; // Without JS, the form still submits using regular HTML.
  const button = document.getElementById("feedback-submit");
  const success = document.getElementById("feedback-success");
  const errorBox = document.getElementById("feedback-error");
  let sending = false;
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    button.textContent = "Sending…";
    errorBox.hidden = true;
    errorBox.textContent = "";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      });
      if (!response.ok) {
        let details = "";
        try {
          const result = await response.json();
          const errors = Array.isArray(result.errors) ? result.errors.map(e => e.message).filter(Boolean) : [];
          details = errors.join(" ");
        } catch (_) {}
        throw new Error(details || "Your message could not be sent. Please try again.");
      }
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (error) {
      errorBox.textContent = error instanceof Error ? error.message : "Your message could not be sent. Please try again.";
      errorBox.hidden = false;
      errorBox.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } finally {
      sending = false;
      button.disabled = false;
      button.textContent = "Send feedback";
    }
  });
})();
