window.Cart = {
  add(product, quantity = 1) {
    if (product.availability === "Pre-order")
      return SYN.toast("This item is available for pre-order only.");
    const cart = SYN.read("syn-cart");
    const line = cart.find((x) => x.product.id === product.id);
    if (line) line.quantity = Math.min(10, line.quantity + quantity);
    else cart.push({ product, quantity: Math.min(10, quantity) });
    SYN.write("syn-cart", cart);
    SYN.toast(`${product.name} added to bag.`);
    this.render();
  },
  set(id, quantity) {
    const cart = SYN.read("syn-cart")
      .map((x) =>
        x.product.id === id ? { ...x, quantity: Math.min(10, quantity) } : x,
      )
      .filter((x) => x.quantity > 0);
    SYN.write("syn-cart", cart);
    this.render();
  },
  remove(id) {
    SYN.write(
      "syn-cart",
      SYN.read("syn-cart").filter((x) => x.product.id !== id),
    );
    this.render();
  },
  clear() {
    SYN.write("syn-cart", []);
    this.render();
  },
  totals() {
    const cart = SYN.read("syn-cart");
    const subtotal = cart.reduce(
      (s, x) => s + (x.product.originalPrice || x.product.price) * x.quantity,
      0,
    );
    const discount = cart.reduce(
      (s, x) =>
        s +
        ((x.product.originalPrice || x.product.price) - x.product.price) *
          x.quantity,
      0,
    );
    return { subtotal, discount, total: subtotal - discount };
  },
  render() {
    const root = document.querySelector("[data-cart]");
    if (!root) return;
    const cart = SYN.read("syn-cart");
    if (!cart.length) {
      root.innerHTML =
        '<div class="state"><h3>Your bag is empty.</h3><p>Add equipment from the catalog to begin a demo order.</p></div>';
      return;
    }
    const t = this.totals();
    root.innerHTML = `<div class="cart-layout"><div>${cart.map((x) => `<article class="cart-line"><img src="${x.product.image}" alt=""><div><h3>${x.product.name}</h3><p>${SYN.money(x.product.price)} ${x.product.promotionEligible ? "· 20% applied" : ""}</p><div class="quantity"><button data-minus="${x.product.id}">−</button><span>${x.quantity}</span><button data-plus="${x.product.id}">+</button></div><button class="text-button" data-remove="${x.product.id}">Remove</button></div><strong>${SYN.money(x.product.price * x.quantity)}</strong></article>`).join("")}<button class="text-button" data-clear>Clear bag</button></div><aside class="summary"><h3>Order summary</h3><p><span>Regular subtotal</span><strong>${SYN.money(t.subtotal)}</strong></p><p><span>Eligible savings</span><strong>−${SYN.money(t.discount)}</strong></p><h3>Total ${SYN.money(t.total)}</h3><button class="btn" data-checkout>Proceed to demo checkout</button></aside></div>`;
    root.querySelectorAll("[data-minus]").forEach(
      (b) =>
        (b.onclick = () => {
          const x = cart.find((y) => y.product.id === +b.dataset.minus);
          this.set(x.product.id, x.quantity - 1);
        }),
    );
    root.querySelectorAll("[data-plus]").forEach(
      (b) =>
        (b.onclick = () => {
          const x = cart.find((y) => y.product.id === +b.dataset.plus);
          this.set(x.product.id, x.quantity + 1);
        }),
    );
    root
      .querySelectorAll("[data-remove]")
      .forEach((b) => (b.onclick = () => this.remove(+b.dataset.remove)));
    root.querySelector("[data-clear]").onclick = () => this.clear();
    root.querySelector("[data-checkout]").onclick = () =>
      document
        .querySelector("[data-checkout-form]")
        .scrollIntoView({ behavior: "smooth" });
  },
};
