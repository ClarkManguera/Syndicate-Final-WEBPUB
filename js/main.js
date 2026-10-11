const SYN = {
  read(key, fallback = []) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  },
  write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    this.updateCounts();
  },
  money(value) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);
  },
  toast(message) {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = message;
    document.body.append(el);
    setTimeout(() => el.remove(), 2400);
  },
  updateCounts() {
    const cart = this.read("syn-cart");
    const wish = this.read("syn-wishlist");
    document
      .querySelectorAll("[data-cart-count]")
      .forEach(
        (e) => (e.textContent = cart.reduce((n, x) => n + x.quantity, 0)),
      );
    document
      .querySelectorAll("[data-wish-count]")
      .forEach((e) => (e.textContent = wish.length));
  },
  async products(query = "") {
    const r = await fetch(`/api/products${query}`);
    if (!r.ok) throw new Error("Catalog request failed");
    return r.json();
  },
};
window.SYN = SYN;
const categories = [
  "Mice",
  "Keyboards",
  "Headsets",
  "Monitors",
  "Chairs",
  "Controllers",
  "Microphones",
  "Mousepads",
  "PC Components",
  "Accessories",
];
const page = location.pathname.split("/").pop() || "index.html";
document.querySelector("[data-header]").innerHTML = `
  <div class="announcement">LEVEL UP YOUR SETUP — GET 20% OFF SELECTED GEAR</div>
  <header class="global-header site-header">
    <a class="logo" href="index.html"><img src="images/logo/syndicate-logo.svg" alt="SYN cube logo"><span>SYNDICATE<small>GEAR / PLAY / BEYOND</small></span></a>
    <button class="icon-btn menu menu-btn" aria-label="Open navigation">MENU</button>
    <nav class="site-navigation site-nav">
      <div class="nav-primary">
        <a href="index.html">Home</a><a href="products.html">Shop</a><a href="index.html#categories">Categories</a><a href="features.html">Features</a><a href="about.html">About</a><a href="contact.html">Contact</a>
      </div>
      <a class="admin-tab hidden" data-admin-tab href="account.html">Admin</a>
      <div class="nav-tools nav-actions">
        <button data-search aria-label="Search catalog">SEARCH</button>
        <a class="account-label" href="account.html">ACCOUNT</a>
        <a href="products.html#wishlist">♡ <span class="count" data-wish-count>0</span></a>
        <a href="products.html#cart">BAG <span class="count" data-cart-count>0</span></a>
      </div>
      <a class="btn" href="products.html?sale=true">Shop now</a>
    </nav>
  </header>
  <form class="global-search search-panel" action="products.html"><label class="hidden" for="global-search">Search products</label><input id="global-search" name="search" placeholder="Search product or brand"><button class="btn">Search catalog</button></form>`;
document.querySelector("[data-footer]").innerHTML =
  `<footer class="footer"><div class="footer-grid"><div><a class="logo" href="index.html"><img src="images/logo/syndicate-logo.svg" alt=""><span>SYNDICATE<small>GEAR / PLAY / BEYOND</small></span></a><p>Fictional gaming retail concept built around teamwork and better setups.</p></div><div><strong>Explore</strong><a href="products.html">Shop all</a><a href="features.html">Features</a><a href="campaign.html">Campaign</a><a href="email-marketing.html">Email preview</a></div><div><strong>Categories</strong>${categories
    .slice(0, 5)
    .map(
      (x) =>
        `<a href="products.html?category=${encodeURIComponent(x)}">${x}</a>`,
    )
    .join(
      "",
    )}</div><div><strong>Sample contact</strong><span>hello@syndicate-demo.test</span><span>+63 917 555 0148</span><span>Quezon City, Philippines</span><span>Mon–Sat · 10:00–19:00</span></div><div><strong>Stay in the loop</strong><form class="newsletter"><label>Email<input type="email" required placeholder="you@example.com"></label><label><span><input type="checkbox" required> I consent to this demo signup.</span></label><button class="btn">Subscribe</button><small data-newsletter-note></small></form></div></div><p class="legal">© 2025 SYNDICATE. Fictional academic project. No official brand partnerships, live payments, authentication, or delivery service.</p></footer>`;
function updateActiveNavigation() {
  const currentPage = page || "index.html";
  document.querySelectorAll(".nav-primary a").forEach((link) => {
    const href = link.getAttribute("href");
    const [targetPage, targetHash] = href.split("#");
    const normalizedTarget = targetPage || "index.html";
    const isSectionLink = Boolean(targetHash);
    const isActive = isSectionLink
      ? currentPage === normalizedTarget && location.hash === `#${targetHash}`
      : currentPage === normalizedTarget &&
        !(normalizedTarget === "index.html" && location.hash);
    link.classList.toggle("active", isActive);
  });
}
updateActiveNavigation();
window.addEventListener("hashchange", updateActiveNavigation);
document.querySelector(".menu-btn").onclick = () =>
  document.querySelector(".site-nav").classList.toggle("open");
document.querySelector("[data-search]").onclick = () =>
  document.querySelector(".search-panel").classList.toggle("open");
document.querySelectorAll(".newsletter").forEach((form) =>
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.querySelector("input[type=email]").value;
    localStorage.setItem("syn-demo-subscription", email);
    form.querySelector("[data-newsletter-note]").textContent =
      "Saved in demo state only. No email was sent.";
  }),
);
SYN.updateCounts();
const session = SYN.read("syn-demo-session", null);
if (session?.access === "admin")
  document.querySelector("[data-admin-tab]")?.classList.remove("hidden");
