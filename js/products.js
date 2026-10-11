let allProducts = [],
  visible = 12;
const filters = {
  q: "",
  category: "All",
  brand: "All",
  availability: "All",
  min: "",
  max: "",
  sort: "featured",
  featured: false,
  new: false,
  sale: false,
};
function card(p) {
  const saved = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;
  return `<article class="shop-product"><div class="shop-product-visual"><img loading="lazy" src="${p.image}" alt="Illustrative ${p.category} image for ${p.name}"><div class="product-badges">${
    p.newArrival ? "<span>NEW</span>" : ""
  }${
    p.promotionEligible
      ? `<span class="sale-badge">${saved || 20}% OFF</span>`
      : ""
  }</div><button class="wish-btn" data-wish="${p.id}" aria-label="Save ${p.name}">${
    Wishlist.has(p.id) ? "♥" : "♡"
  }</button><button class="quick-view" data-view="${p.id}">Quick view</button></div><div class="shop-product-body"><div class="product-meta"><span>${p.brand}</span><small>${p.category}</small></div><h3>${p.name}</h3><p>${p.description}</p><div class="product-status"><i class="${
    p.availability === "In stock"
      ? "in-stock"
      : p.availability === "Low stock"
        ? "low-stock"
        : "preorder"
  }"></i>${p.availability}</div><div class="product-buy"><div><b>${SYN.money(p.price)}</b>${
    p.originalPrice ? `<del>${SYN.money(p.originalPrice)}</del>` : ""
  }</div><button data-add="${p.id}" ${
    p.availability === "Pre-order" ? "disabled" : ""
  }>+</button></div></div></article>`;
}
function filtered() {
  let list = allProducts.filter(
    (p) =>
      (filters.category === "All" || p.category === filters.category) &&
      (filters.brand === "All" || p.brand === filters.brand) &&
      (filters.availability === "All" ||
        p.availability === filters.availability) &&
      (!filters.min || p.price >= +filters.min) &&
      (!filters.max || p.price <= +filters.max) &&
      `${p.name} ${p.brand}`.toLowerCase().includes(filters.q.toLowerCase()) &&
      (!filters.featured || p.featured) &&
      (!filters.new || p.newArrival) &&
      (!filters.sale || p.promotionEligible),
  );
  return list.sort((a, b) =>
    filters.sort === "low"
      ? a.price - b.price
      : filters.sort === "high"
        ? b.price - a.price
        : filters.sort === "az"
          ? a.name.localeCompare(b.name)
          : Number(b.featured) - Number(a.featured),
  );
}
function render() {
  const list = filtered();
  document.querySelector("[data-results]").textContent =
    `${list.length} results`;
  document.querySelector("[data-product-grid]").innerHTML =
    list.slice(0, visible).map(card).join("") ||
    '<div class="state">No products match these filters.</div>';
  document
    .querySelector("[data-load]")
    .classList.toggle("hidden", visible >= list.length);
  bind();
}
function bind() {
  document
    .querySelectorAll("[data-add]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          Cart.add(allProducts.find((p) => p.id === +b.dataset.add))),
    );
  document.querySelectorAll("[data-wish]").forEach(
    (b) =>
      (b.onclick = () => {
        Wishlist.toggle(allProducts.find((p) => p.id === +b.dataset.wish));
        render();
      }),
  );
  document
    .querySelectorAll("[data-view]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          openProduct(allProducts.find((p) => p.id === +b.dataset.view))),
    );
}
function openProduct(p) {
  const modal = document.querySelector("[data-modal]");
  modal.innerHTML = `<div class="modal-card"><button class="icon-btn" data-close>CLOSE</button><div class="modal-body"><img src="${p.image}" alt="Illustrative ${p.name}"><div><span class="eyebrow">${p.brand} / ${p.category}</span><h2>${p.name}</h2><h3>${SYN.money(p.price)}</h3><p>${p.description}</p><p><strong>${p.availability}</strong> · ${
    p.promotionEligible ? "20% promotion applied" : "Standard sample price"
  }</p><table class="table">${p.specifications.map((s, i) => `<tr><th>Specification ${i + 1}</th><td>${s}</td></tr>`).join("")}</table><p><strong>Warranty:</strong> ${p.warranty}</p><div class="quantity"><button data-qminus>−</button><span data-qty>1</span><button data-qplus>+</button></div><button class="btn" data-modal-add>Add to bag</button> <button class="btn secondary" data-modal-wish>Add to wishlist</button></div></div></div>`;
  modal.classList.add("open");
  let q = 1;
  modal.querySelector("[data-qminus]").onclick = () =>
    (modal.querySelector("[data-qty]").textContent = q = Math.max(1, q - 1));
  modal.querySelector("[data-qplus]").onclick = () =>
    (modal.querySelector("[data-qty]").textContent = q = Math.min(10, q + 1));
  modal.querySelector("[data-close]").onclick = () =>
    modal.classList.remove("open");
  modal.querySelector("[data-modal-add]").onclick = () => Cart.add(p, q);
  modal.querySelector("[data-modal-wish]").onclick = () => Wishlist.toggle(p);
}
async function initProducts() {
  const grid = document.querySelector("[data-product-grid]");
  if (!grid) return;
  try {
    allProducts = await SYN.products();
    const params = new URLSearchParams(location.search);
    filters.q = params.get("search") || "";
    filters.category = params.get("category") || "All";
    filters.sale = params.get("sale") === "true";
    const cats = [...new Set(allProducts.map((p) => p.category))].sort(),
      brands = [...new Set(allProducts.map((p) => p.brand))].sort();
    document.querySelector("[name=category]").innerHTML = ["All", ...cats]
      .map(
        (x) =>
          `<option ${x === filters.category ? "selected" : ""}>${x}</option>`,
      )
      .join("");
    document.querySelector("[name=brand]").innerHTML = ["All", ...brands]
      .map((x) => `<option>${x}</option>`)
      .join("");
    document.querySelector("[name=search]").value = filters.q;
    document.querySelector("[name=sale]").checked = filters.sale;
    document.querySelectorAll("[data-filter]").forEach(
      (el) =>
        (el.oninput = () => {
          filters[el.name] = el.type === "checkbox" ? el.checked : el.value;
          visible = 12;
          render();
        }),
    );
    document.querySelector("[data-clear]").onclick = () => {
      Object.assign(filters, {
        q: "",
        category: "All",
        brand: "All",
        availability: "All",
        min: "",
        max: "",
        sort: "featured",
        featured: false,
        new: false,
        sale: false,
      });
      document.querySelectorAll("[data-filter]").forEach((el) => {
        el.type === "checkbox"
          ? (el.checked = false)
          : (el.value = filters[el.name]);
      });
      history.replaceState({}, "", location.pathname);
      render();
    };
    document.querySelector("[data-load]").onclick = () => {
      visible += 12;
      render();
    };
    document.querySelector("[data-view-toggle]").onclick = () =>
      document.querySelector("[data-product-grid]").classList.toggle("list");
    render();
    Cart.render();
    Wishlist.render();
  } catch (e) {
    grid.innerHTML =
      '<div class="state error">Could not retrieve /api/products. Start the Express server and retry.</div>';
  }
}
initProducts();

document
  .querySelector("[data-mobile-filter]")
  ?.addEventListener("click", () =>
    document.querySelector(".catalog-filters").classList.add("open"),
  );
document
  .querySelectorAll("[data-close-filter]")
  .forEach((b) =>
    b.addEventListener("click", () =>
      document.querySelector(".catalog-filters").classList.remove("open"),
    ),
  );
