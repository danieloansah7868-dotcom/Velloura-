import { loginCustomer, registerCustomer, currentCustomer } from "./customers.js";

if (currentCustomer()) {
  window.location.replace("account.html");
}

const params = new URLSearchParams(window.location.search);
const nextPage = params.get("next") || "account.html";

const loginForm = document.getElementById("customer-login-form");
const registerForm = document.getElementById("customer-register-form");
const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");
const loginPanel = document.getElementById("login-panel");
const registerPanel = document.getElementById("register-panel");

document.querySelectorAll("[data-show-panel]").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    const panel = btn.getAttribute("data-show-panel");
    loginPanel.hidden = panel !== "login";
    registerPanel.hidden = panel !== "register";
  });
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = loginForm.elements.namedItem("email")?.value || "";
  const password = loginForm.elements.namedItem("password")?.value || "";
  const result = loginCustomer(email, password);
  if (!result.ok) {
    loginError.hidden = false;
    loginError.textContent = result.error;
    return;
  }
  window.location.href = nextPage;
});

registerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = registerCustomer({
    name: registerForm.elements.namedItem("name")?.value || "",
    email: registerForm.elements.namedItem("email")?.value || "",
    phone: registerForm.elements.namedItem("phone")?.value || "",
    password: registerForm.elements.namedItem("password")?.value || ""
  });
  if (!result.ok) {
    registerError.hidden = false;
    registerError.textContent = result.error;
    return;
  }
  window.location.href = nextPage;
});
