import { login, logout, checkAdmin, adminLoginAvailable, sanitizeNextPage } from "./auth.js";

const params = new URLSearchParams(window.location.search);
const nextPage = sanitizeNextPage(params.get("next"));
const reason = params.get("reason") || "";

const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");
const submitBtn = form?.querySelector('button[type="submit"]');

function showError(message) {
  if (!errorEl) return;
  errorEl.hidden = false;
  errorEl.textContent = message;
}

function setPending(pending) {
  if (!submitBtn) return;
  submitBtn.disabled = pending;
  submitBtn.textContent = pending ? "Signing in…" : "Log in";
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorEl.hidden = true;
    const email = form.elements.namedItem("email")?.value || "";
    const password = form.elements.namedItem("password")?.value || "";
    if (!email || !password) {
      showError("Enter your email and password.");
      return;
    }
    setPending(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        showError(result.error);
        return;
      }
      // Authenticated — now check the admin allowlist.
      const status = await checkAdmin();
      if (!status.ok && status.reason === "not-admin") {
        await logout();
        showError("This account does not have Seller Center access.");
        return;
      }
      if (!status.ok) {
        await logout();
        showError("Could not confirm Seller Center access. Please try again.");
        return;
      }
      window.location.href = nextPage;
    } finally {
      setPending(false);
    }
  });
}

(async function init() {
  if (!adminLoginAvailable()) {
    setPending(true);
    showError("Seller Center sign-in needs Supabase. Connect the project in js/config.js first.");
    return;
  }
  if (reason === "denied") {
    showError("This account does not have Seller Center access.");
  } else if (reason === "expired") {
    showError("Your session ended. Please sign in again.");
  } else if (reason === "unavailable") {
    showError("Sign-in is not available right now. Please try again.");
  }
  // Already signed in as an admin? Go straight through.
  const status = await checkAdmin();
  if (status.ok) {
    window.location.replace(nextPage);
  } else if (status.reason === "not-admin") {
    await logout();
    showError("This account does not have Seller Center access.");
  }
})();
