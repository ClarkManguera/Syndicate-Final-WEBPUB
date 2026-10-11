(async () => {
  const root = document.querySelector("[data-sale-products]");
  if (!root) return;
  try {
    const products = await SYN.products("?sale=true");
    root.innerHTML = products
      .slice(0, 4)
      .map(
        (p) =>
          `<article class="product-card"><img src="${p.image}" alt="Illustrative ${p.category}"><small>${p.brand}</small><h3>${p.name}</h3><span class="price">${SYN.money(p.price)} <del>${SYN.money(p.originalPrice)}</del></span><a class="btn" href="products.html?sale=true&utm_source=campaign&utm_medium=website&utm_campaign=play_more_pay_less">Shop offer</a></article>`,
      )
      .join("");
  } catch {
    root.innerHTML = '<div class="error">Eligible products unavailable.</div>';
  }
})();
