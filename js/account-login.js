import { loginCustomer, registerCustomer, loginWithGoogle, hydrateCustomer, currentCustomer } from "./customers.js";

const params = new URLSearchParams(window.location.search);
const nextPage = params.get("next") || "account.html";

const loginForm = document.getElementById("customer-login-form");
const registerForm = document.getElementById("customer-register-form");
const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");
const loginPanel = document.getElementById("login-panel");
const registerPanel = document.getElementById("register-panel");

function showError(el, message) {
  if (!el) return;
  el.hidden = !message;
  el.textContent = message || "";
}

function goNext() {
  window.location.href = nextPage;
}

hydrateCustomer().then((customer) => {
  if (customer) goNext();
});

document.querySelectorAll("[data-show-panel]").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    const panel = btn.getAttribute("data-show-panel");
    loginPanel.hidden = panel !== "login";
    registerPanel.hidden = panel !== "register";
  });
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = loginForm.querySelector("button[type=submit]");
  if (submit) submit.disabled = true;
  showError(loginError, "");
  const email = loginForm.elements.namedItem("email")?.value || "";
  const password = loginForm.elements.namedItem("password")?.value || "";
  const result = await loginCustomer(email, password);
  if (submit) submit.disabled = false;
  if (!result.ok) {
    showError(loginError, result.error);
    return;
  }
  goNext();
});

registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = registerForm.querySelector("button[type=submit]");
  if (submit) submit.disabled = true;
  showError(registerError, "");
  const result = await registerCustomer({
    name: registerForm.elements.namedItem("name")?.value || "",
    email: registerForm.elements.namedItem("email")?.value || "",
    phone: registerForm.elements.namedItem("phone")?.value || "",
    password: registerForm.elements.namedItem("password")?.value || ""
  });
  if (submit) submit.disabled = false;
  if (!result.ok) {
    showError(registerError, result.error);
    return;
  }
  goNext();
});

async function startGoogle(event) {
  const btn = event.currentTarget;
  const errorEl = btn.closest(".auth-card")?.querySelector(".error-text") || loginError;
  showError(errorEl, "");
  btn.disabled = true;
  const result = await loginWithGoogle(nextPage);
  if (!result.ok) {
    btn.disabled = false;
    showError(errorEl, result.error);
  }
}

document.getElementById("google-login")?.addEventListener("click", startGoogle);
document.getElementById("google-register")?.addEventListener("click", startGoogle);

if (currentCustomer()) goNext();
