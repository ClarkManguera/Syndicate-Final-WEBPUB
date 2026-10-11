const form = document.querySelector("[data-contact-form]");
if (form) {
  const message = form.querySelector('[name="message"]');
  const count = document.querySelector("[data-character-count]");
  message.addEventListener(
    "input",
    () => (count.textContent = `${message.value.length} / 600`),
  );
  document.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
      form.subject.value = button.dataset.topic;
      document
        .querySelectorAll("[data-topic]")
        .forEach((item) => item.classList.toggle("active", item === button));
    });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const output = document.querySelector("[data-contact-status]");
    const reference = `SYN-SUPPORT-${Date.now().toString().slice(-5)}`;
    output.className = "ticket-success";
    output.innerHTML = `<span>TICKET CREATED</span><b>${reference}</b><p>The form was validated. This is a demonstration reference; no message was sent.</p>`;
    form.reset();
    count.textContent = "0 / 600";
  });
}
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = "Copied";
      setTimeout(() => (button.textContent = "Copy again"), 1500);
    } catch {
      button.textContent = "Copy unavailable";
    }
  });
});

const checkout = document.querySelector("[data-checkout-form]");
if (checkout) {
  checkout.addEventListener("submit", (e) => {
    e.preventDefault();
    const cart = SYN.read("syn-cart");
    const output = document.querySelector("[data-checkout-status]");
    if (!cart.length) {
      output.className = "error";
      output.textContent = "Add a product before checking out.";
      return;
    }
    if (!checkout.checkValidity()) {
      output.className = "error";
      output.textContent = "Complete all required delivery fields.";
      return;
    }
    const ref = `SYN-DEMO-${Date.now().toString().slice(-6)}`;
    SYN.write("syn-cart", []);
    Cart.render();
    output.className = "success";
    output.innerHTML = `Demo order confirmed: <strong>${ref}</strong>. No payment was collected and no real order was placed.`;
    checkout.reset();
  });
}
window.Cart?.render();
