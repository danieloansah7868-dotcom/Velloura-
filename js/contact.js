import { CONFIG } from "./config.js";
import { buildWhatsAppLink } from "./utils.js";

const phoneEl = document.getElementById("contact-phone");
if (phoneEl && CONFIG.phoneDisplay) phoneEl.textContent = CONFIG.phoneDisplay;

const waBtn = document.getElementById("wa-btn");
if (waBtn) {
  waBtn.href = buildWhatsAppLink(CONFIG.whatsappNumber, "Hi Velloura, I have a question.");
}

const form = document.getElementById("contact-form");
form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = String(form.elements.namedItem("name")?.value || "").trim();
  const message = String(form.elements.namedItem("message")?.value || "").trim();
  const errorEl = document.getElementById("contact-error");
  if (name.length < 2 || message.length < 4) {
    errorEl.hidden = false;
    errorEl.textContent = "Please enter your name and a short message.";
    return;
  }
  const text = `Hi Velloura, my name is ${name}. ${message}`;
  window.location.href = buildWhatsAppLink(CONFIG.whatsappNumber, text);
});
