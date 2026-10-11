window.Wishlist = {
  toggle(product) {
    const items = SYN.read("syn-wishlist");
    const exists = items.some((x) => x.id === product.id);
    SYN.write(
      "syn-wishlist",
      exists ? items.filter((x) => x.id !== product.id) : [...items, product],
    );
    SYN.toast(exists ? "Removed from wishlist." : "Saved to wishlist.");
    this.render();
  },
  has(id) {
    return SYN.read("syn-wishlist").some((x) => x.id === id);
  },
  render() {
    const root = document.querySelector("[data-wishlist]");
    if (!root) return;
    const items = SYN.read("syn-wishlist");
    root.innerHTML = items.length
      ? `<div class="product-grid">${items.map((p) => `<article class="product-card"><img src="${p.image}" alt=""><small>${p.brand}</small><h3>${p.name}</h3><span class="price">${SYN.money(p.price)}</span><div class="card-actions"><button class="btn" data-wish-cart="${p.id}">Move to bag</button><button class="btn secondary" data-wish-remove="${p.id}">Remove</button></div></article>`).join("")}</div>`
      : '<div class="state">No saved products yet.</div>';
    root
      .querySelectorAll("[data-wish-cart]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            Cart.add(items.find((x) => x.id === +b.dataset.wishCart))),
      );
    root
      .querySelectorAll("[data-wish-remove]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            this.toggle(items.find((x) => x.id === +b.dataset.wishRemove))),
      );
  },
};
