import { login, isLoggedIn } from "./auth.js";

const params = new URLSearchParams(window.location.search);
const nextPage = params.get("next") || "admin.html";

if (isLoggedIn()) {
  window.location.replace(nextPage);
}

const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = form.elements.namedItem("email")?.value || "";
  const password = form.elements.namedItem("password")?.value || "";
  if (login(email, password)) {
    window.location.href = nextPage;
    return;
  }
  errorEl.hidden = false;
  errorEl.textContent = "Wrong email or password. Try again.";
});
