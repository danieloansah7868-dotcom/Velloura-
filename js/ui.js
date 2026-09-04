(function () {
  const onScroll = () => {
    document.body.classList.toggle("scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function accraHour() {
    try {
      return Number(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Africa/Accra",
          hour: "numeric",
          hourCycle: "h23"
        }).format(new Date())
      );
    } catch (err) {
      return new Date().getHours();
    }
  }

  function greetingWord() {
    const hour = accraHour();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function firstName() {
    try {
      const session = JSON.parse(sessionStorage.getItem("velloura_customer_session") || "null");
      if (!session || !session.email) return "";
      const list = JSON.parse(localStorage.getItem("velloura_customers_v1") || "[]");
      const customer = Array.isArray(list) ? list.find((c) => c.email === session.email) : null;
      return String(customer && customer.name ? customer.name : "").trim().split(/\s+/)[0] || "";
    } catch (err) {
      return "";
    }
  }

  const who = firstName();
  const greet = who ? `${greetingWord()} ${who}` : greetingWord();

  const bar = document.querySelector(".announce");
  if (bar) bar.textContent = `${greet} · Delivery in Greater Accra`;

  const kicker = document.querySelector(".hero-kicker");
  if (kicker) kicker.textContent = greet;
})();
