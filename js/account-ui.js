import { currentCustomer, hydrateCustomer } from "./customers.js";
import { updateWishBadge } from "./wishlist.js";

function paintAccountLink() {
  const link = document.getElementById("account-link");
  if (!link) return;
  const customer = currentCustomer();
  if (customer) {
    link.href = "account.html";
    link.textContent = (customer.name || "").split(" ")[0] || "Account";
  } else {
    link.href = "account-login.html";
    link.textContent = "Login";
  }
}

paintAccountLink();
hydrateCustomer().then(paintAccountLink);

updateWishBadge();
window.addEventListener("velloura:wishlist-changed", updateWishBadge);

const searchForm = document.querySelector(".header-search");
const searchInput = searchForm?.querySelector('input[name="q"]');
if (searchInput && /shop\.html$/i.test(window.location.pathname)) {
  const q = new URLSearchParams(window.location.search).get("q");
  if (q) searchInput.value = q;
}
