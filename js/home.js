(async () => {
  const root = document.querySelector("[data-featured]");
  if (!root) return;
  try {
    const products = await SYN.products("?featured=true");
    root.innerHTML = products
      .slice(0, 8)
      .map(
        (p) =>
          `<article class="product-card"><img loading="lazy" src="${p.image}" alt="Illustrative ${p.category}"><small>${p.brand} / ${p.category}</small><h3>${p.name}</h3><span class="price">${SYN.money(p.price)}</span><div class="card-actions"><a class="btn secondary" href="products.html?search=${encodeURIComponent(p.name)}">Details</a><button class="btn" data-home-add="${p.id}">Add to bag</button></div></article>`,
      )
      .join("");
    root
      .querySelectorAll("[data-home-add]")
      .forEach(
        (b) =>
          (b.onclick = () =>
            Cart.add(products.find((p) => p.id === +b.dataset.homeAdd))),
      );
  } catch {
    root.innerHTML =
      '<div class="state error">Featured products could not load.</div>';
  }
})();
const campaignEnd =
  Number(localStorage.getItem("syn-campaign-end")) > Date.now()
    ? Number(localStorage.getItem("syn-campaign-end"))
    : Date.now() + 72 * 60 * 60 * 1000;
localStorage.setItem("syn-campaign-end", String(campaignEnd));
function updateCountdown() {
  const total = Math.max(0, Math.floor((campaignEnd - Date.now()) / 1000)),
    values = {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
  Object.entries(values).forEach(([key, value]) => {
    const el = document.querySelector(`[data-${key}]`);
    if (el) el.textContent = String(value).padStart(2, "0");
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);
