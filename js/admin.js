const accounts = [
  {
    name: "Syndicate Admin",
    email: "admin@syndicate.demo",
    password: "admin123",
    role: "Administrator",
    access: "admin",
  },
  {
    name: "Store Manager",
    email: "manager@syndicate.demo",
    password: "manager123",
    role: "Store Manager",
    access: "admin",
  },
  {
    name: "Alex Rivera",
    email: "alex.rivera@example.test",
    password: "player123",
    role: "Student Gamer",
    access: "customer",
  },
  {
    name: "Sam Cruz",
    email: "sam.cruz@example.test",
    password: "player123",
    role: "Office Professional",
    access: "customer",
  },
  {
    name: "Jamie Santos",
    email: "jamie.santos@example.test",
    password: "player123",
    role: "Tech Enthusiast",
    access: "customer",
  },
];
const app = document.querySelector("[data-account-app]");
let products = [],
  customers = [],
  current = null,
  tab = "overview";
function login(account) {
  current = account;
  localStorage.setItem(
    "syn-demo-session",
    JSON.stringify({ email: account.email, access: account.access }),
  );
  document
    .querySelector("[data-admin-tab]")
    ?.classList.toggle("hidden", account.access !== "admin");
  account.access === "admin" ? admin() : customer();
}
function signIn(email, password) {
  const a = accounts.find(
    (x) =>
      x.email.toLowerCase() === email.toLowerCase() && x.password === password,
  );
  if (!a) {
    document.querySelector("[data-login-error]").textContent =
      "Email or password does not match a sample account.";
    return;
  }
  login(a);
}
function loginScreen() {
  app.innerHTML = `<section class="account-entry"><form class="account-login"><span class="eyebrow">SIGN IN</span><h2>Account login.</h2><label>Email<input name="email" type="email" required></label><label>Password<input name="password" type="password" required></label><p class="error hidden" data-login-error></p><button class="btn">Log in to demo</button><small>Passwords are fictional and are never submitted or stored.</small></form><div class="sample-accounts"><span class="eyebrow">SAMPLE ACCOUNTS FOR CHECKING</span><h3>Use a ready-made role.</h3><p>Select <b>Use</b> to fill the form or <b>Log in</b> to enter immediately.</p><h4>ADMIN → ADMIN DASHBOARD</h4>${rows("admin")}<h4>CUSTOMERS → CUSTOMER DASHBOARD</h4>${rows("customer")}<p class="demo-note">Academic demonstration only. This is not secure production authentication.</p></div></section>`;
  const form = app.querySelector("form");
  form.onsubmit = (e) => {
    e.preventDefault();
    signIn(form.email.value, form.password.value);
  };
  app.querySelectorAll("[data-use]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = accounts[+b.dataset.use];
        form.email.value = a.email;
        form.password.value = a.password;
      }),
  );
  app
    .querySelectorAll("[data-login]")
    .forEach((b) => (b.onclick = () => login(accounts[+b.dataset.login])));
}
function rows(access) {
  return accounts
    .map((a, i) => ({ a, i }))
    .filter((x) => x.a.access === access)
    .map(
      ({ a, i }) =>
        `<article><div><b>${a.name}</b><small>${a.role}<br>${a.email} &nbsp; / &nbsp; ${a.password}</small></div><div><button data-use="${i}">Use</button><button data-login="${i}">Log in</button></div></article>`,
    )
    .join("");
}
async function admin() {
  try {
    [products, customers] = await Promise.all([
      SYN.products(),
      fetch("/api/customers").then((r) => r.json()),
    ]);
  } catch {}
  renderAdmin();
}
function addDemoProduct() {
  const id = Math.max(0, ...products.map((p) => p.id)) + 1;
  products.unshift({
    id,
    name: "New Demo Product",
    brand: "Syndicate Lab",
    category: "Accessories",
    description: "Created in admin demo.",
    price: 999,
    image: "/images/products/accessories.jpg",
    availability: "In stock",
    specifications: ["Demo specification"],
    featured: false,
    newArrival: true,
    promotionEligible: false,
    warranty: "Illustrative warranty",
  });
  renderAdmin();
}
function exportProducts() {
  const blob = new Blob([JSON.stringify(products, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "syndicate-products-demo.json";
  a.click();
  URL.revokeObjectURL(url);
}
function renderAdmin() {
  app.innerHTML = `<section class="admin-top"><div><span class="eyebrow">DEMO ADMIN CONSOLE</span><h2>Command center.</h2><p>${current.name} · ${current.role}</p></div><button class="btn secondary" data-signout>Sign out</button></section><div class="admin-shell"><aside class="admin-nav">${["overview", "inventory", "customers", "orders", "campaign"].map((x) => `<button class="${tab === x ? "active" : ""}" data-tab="${x}">${x}</button>`).join("")}</aside><section class="admin-content">${panel()}</section></div>`;
  app.querySelector("[data-signout]").onclick = () => {
    localStorage.removeItem("syn-demo-session");
    document.querySelector("[data-admin-tab]")?.classList.add("hidden");
    current = null;
    loginScreen();
  };
  app.querySelectorAll("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.tab;
        renderAdmin();
      }),
  );
  app.querySelectorAll("[data-price]").forEach(
    (i) =>
      (i.onchange = () => {
        products.find((p) => p.id === +i.dataset.price).price = Math.max(
          0,
          +i.value,
        );
        SYN.toast("Demo price updated locally.");
      }),
  );
  app.querySelectorAll("[data-stock]").forEach(
    (s) =>
      (s.onchange = () => {
        products.find((p) => p.id === +s.dataset.stock).availability = s.value;
        SYN.toast("Demo availability updated locally.");
      }),
  );
  app.querySelectorAll("[data-field]").forEach(
    (el) =>
      (el.onchange = () => {
        const product = products.find((p) => p.id === +el.dataset.id),
          key = el.dataset.field;
        let value = el.type === "checkbox" ? el.checked : el.value;
        if (["price", "originalPrice"].includes(key))
          value = value ? Math.max(0, +value) : null;
        if (key === "specifications")
          value = value
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
        product[key] = value;
        if (key === "image") renderAdmin();
        else SYN.toast(`${key} updated locally.`);
      }),
  );
  app.querySelectorAll("[data-image-file]").forEach(
    (el) =>
      (el.onchange = () => {
        const file = el.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          products.find((p) => p.id === +el.dataset.imageFile).image = String(
            reader.result,
          );
          renderAdmin();
        };
        reader.readAsDataURL(file);
      }),
  );
  const save = app.querySelector("[data-save-inventory]");
  if (save)
    save.onclick = () => {
      localStorage.setItem(
        "syn-admin-inventory-demo",
        JSON.stringify(products),
      );
      SYN.toast("Inventory saved in this browser only.");
    };
  const add = app.querySelector("[data-add-product]");
  if (add) add.onclick = addDemoProduct;
  const exp = app.querySelector("[data-export-products]");
  if (exp) exp.onclick = exportProducts;
  app.querySelectorAll("[data-delete-product]").forEach(
    (b) =>
      (b.onclick = () => {
        products = products.filter((p) => p.id !== +b.dataset.deleteProduct);
        renderAdmin();
      }),
  );
}
function panel() {
  if (tab === "inventory")
    return `<div class="admin-heading"><div><span class="eyebrow">PRODUCT MANAGEMENT</span><h2>Full product editor.</h2></div><div><button class="btn secondary" data-add-product>Add product</button> <button class="btn secondary" data-export-products>Export JSON</button> <button class="btn" data-save-inventory>Save changes</button></div></div><p class="demo-note">Every product field is editable. Changes remain in this browser and do not mutate the JSON API.</p><div class="admin-product-grid">${products.map((p) => `<article class="admin-product-editor"><div class="admin-product-media"><img src="${p.image}" alt="Product preview"><label class="upload-btn">Upload image<input data-image-file="${p.id}" type="file" accept="image/*"></label><label>Image URL<input data-field="image" data-id="${p.id}" value="${p.image}"></label></div><div class="admin-product-fields"><div class="editor-title"><label>Product name<input data-field="name" data-id="${p.id}" value="${p.name}"></label><button class="text-button" data-delete-product="${p.id}">Remove</button></div><div class="editor-row"><label>Brand<input data-field="brand" data-id="${p.id}" value="${p.brand}"></label><label>Category<select data-field="category" data-id="${p.id}">${["Mice", "Keyboards", "Headsets", "Monitors", "Chairs", "Controllers", "Microphones", "Mousepads", "PC Components", "Accessories"].map((x) => `<option ${x === p.category ? "selected" : ""}>${x}</option>`).join("")}</select></label></div><label>Description<textarea data-field="description" data-id="${p.id}" rows="3">${p.description}</textarea></label><div class="editor-row three"><label>Sale price<input data-field="price" data-id="${p.id}" type="number" value="${p.price}"></label><label>Original price<input data-field="originalPrice" data-id="${p.id}" type="number" value="${p.originalPrice || ""}"></label><label>Availability<select data-field="availability" data-id="${p.id}">${["In stock", "Low stock", "Pre-order"].map((x) => `<option ${x === p.availability ? "selected" : ""}>${x}</option>`).join("")}</select></label></div><label>Warranty<input data-field="warranty" data-id="${p.id}" value="${p.warranty}"></label><label>Specifications<textarea data-field="specifications" data-id="${p.id}" rows="2">${p.specifications.join(", ")}</textarea></label><div class="editor-flags"><label><input data-field="featured" data-id="${p.id}" type="checkbox" ${p.featured ? "checked" : ""}> Featured</label><label><input data-field="newArrival" data-id="${p.id}" type="checkbox" ${p.newArrival ? "checked" : ""}> New arrival</label><label><input data-field="promotionEligible" data-id="${p.id}" type="checkbox" ${p.promotionEligible ? "checked" : ""}> 20% eligible</label></div></div></article>`).join("")}</div>`;
  if (tab === "customers")
    return `<div class="admin-heading"><div><span class="eyebrow">INTERNAL RECORDS</span><h2>Customer directory.</h2></div><span class="demo-pill">SYNTHETIC ONLY</span></div><div class="feature-grid">${customers.map((c) => `<article class="feature"><small>#${String(c.id).padStart(3, "0")}</small><h3>${c.name}</h3><p>${c.customerType}<br>${c.email}</p></article>`).join("")}</div>`;
  if (tab === "orders")
    return `<div class="admin-heading"><div><span class="eyebrow">ORDER OPERATIONS</span><h2>Sample order queue.</h2></div><span class="demo-pill">NO REAL ORDERS</span></div><div class="admin-table-wrap"><table class="admin-table"><tr><th>Reference</th><th>Customer</th><th>Total</th><th>Status</th></tr><tr><td>SYN-DEMO-104281</td><td>Alex Rivera</td><td>₱7,470</td><td>Ready for review</td></tr><tr><td>SYN-DEMO-104205</td><td>Sam Cruz</td><td>₱10,990</td><td>Demo confirmed</td></tr></table></div><p class="demo-note">No purchase, payment, shipment, or customer transaction occurred.</p>`;
  if (tab === "campaign")
    return `<div class="admin-heading"><div><span class="eyebrow">MARKETING PERFORMANCE</span><h2>PLAY MORE. PAY LESS.</h2></div><a class="btn secondary" href="campaign.html">Open campaign</a></div>${stats(
      [
        ["12.4K", "Sample impressions"],
        ["608", "Sample clicks"],
        ["4.9%", "Sample CTR"],
        [
          products.filter((p) => p.promotionEligible).length,
          "Eligible products",
        ],
      ],
    )}<p class="demo-note">All figures are illustrative.</p>`;
  return `<div class="admin-heading"><div><span class="eyebrow">STORE OVERVIEW</span><h2>Today at a glance.</h2></div><span class="demo-pill">DEMO DATA</span></div>${stats(
    [
      [products.length, "Catalog products"],
      [
        products.filter((p) => p.availability === "Low stock").length,
        "Low-stock alerts",
      ],
      [customers.length, "Synthetic customers"],
      ["4.9%", "Sample campaign CTR"],
    ],
  )}<div class="feature-grid"><article class="feature"><h3>Product API</h3><p>Connected to 30 catalog records.</p></article><article class="feature"><h3>Customer API</h3><p>Connected to fictional internal records.</p></article><article class="feature"><h3>External services</h3><p>Payments and live authentication are not configured.</p></article></div>`;
}
function stats(items) {
  return `<div class="admin-stats">${items.map((x) => `<article><small>${x[1]}</small><strong>${x[0]}</strong><span>Demonstration</span></article>`).join("")}</div>`;
}
function customer() {
  const cart = SYN.read("syn-cart"),
    wish = SYN.read("syn-wishlist");
  app.innerHTML = `<section class="admin-top"><div><span class="eyebrow">DEMO CUSTOMER ACCOUNT</span><h2>Welcome, ${current.name}.</h2><p>${current.email} · ${current.role}</p></div><button class="btn secondary" data-signout>Sign out</button></section><section>${stats(
    [
      [cart.reduce((n, x) => n + x.quantity, 0), "Bag quantity"],
      [wish.length, "Wishlist"],
      [0, "Demo orders"],
    ],
  )}<div class="state">No secure account or real order history exists.</div></section>`;
  app.querySelector("[data-signout]").onclick = () => {
    localStorage.removeItem("syn-demo-session");
    document.querySelector("[data-admin-tab]")?.classList.add("hidden");
    current = null;
    loginScreen();
  };
}
const saved = SYN.read("syn-demo-session", null);
const restored =
  saved &&
  accounts.find((a) => a.email === saved.email && a.access === saved.access);
restored ? login(restored) : loginScreen();
