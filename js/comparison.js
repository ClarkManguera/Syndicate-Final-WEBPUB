const modules = [
  [
    "AUTH-01",
    "Verified Intel",
    "PRODUCT CLARITY",
    "Authenticity-conscious selection, transparent demo labels, and warranty notes support every decision.",
    "30",
    "catalog records",
  ],
  [
    "CMP-02",
    "Versus Mode",
    "LIVE COMPARISON",
    "Select up to three products and compare their actual catalog data.",
    "3",
    "comparison slots",
  ],
  [
    "NAV-03",
    "Loadout Finder",
    "SMART BROWSING",
    "Ten collections and detailed filters help players find the right gear.",
    "10",
    "gear categories",
  ],
  [
    "BLD-04",
    "Build Paths",
    "SETUP GUIDANCE",
    "Budget, competitive, and creator loadouts create complete directions.",
    "3",
    "curated builds",
  ],
  [
    "SALE-05",
    "Deal Radar",
    "PROMOTION DISCOVERY",
    "Only marked products receive the campaign discount.",
    "20%",
    "selected gear",
  ],
  [
    "RWD-06",
    "Any Screen",
    "RESPONSIVE PLAY",
    "Adaptive controls work across desktop, tablet, and mobile.",
    "3",
    "responsive tiers",
  ],
  [
    "SUP-07",
    "Support Link",
    "CUSTOMER GUIDANCE",
    "Validated contact tools and FAQs keep guidance easy to find.",
    "6",
    "support topics",
  ],
  [
    "SPEC-08",
    "Tech Scan",
    "CLEAR SPECIFICATIONS",
    "Product details come from one centralized dataset.",
    "100%",
    "data driven",
  ],
];
let activeModule = 0;
function drawModules() {
  document.querySelector("[data-feature-modules]").innerHTML = modules
    .map(
      (m, i) =>
        `<button class="${
          i === activeModule ? "active" : ""
        }" data-module="${i}"><span>${m[0]}</span><b>${m[1]}</b><i>${String(i + 1).padStart(2, "0")}</i></button>`,
    )
    .join("");
  const m = modules[activeModule];
  document.querySelector("[data-feature-screen]").innerHTML =
    `<div class="screen-scanlines"></div><div class="module-header"><span>${m[0]}</span><b>MODULE ACTIVE</b></div><small>${m[2]}</small><h2>${m[1]}</h2><p>${m[3]}</p><div class="module-readout"><strong>${m[4]}</strong><span>${m[5]}</span></div><div class="power-meter"><i></i><i></i><i></i><i></i><i></i></div><a class="btn" href="products.html">Launch shop</a>`;
  document.querySelectorAll("[data-module]").forEach(
    (b) =>
      (b.onclick = () => {
        activeModule = +b.dataset.module;
        drawModules();
      }),
  );
}
drawModules();
(async () => {
  const root = document.querySelector("[data-comparison]");
  try {
    const products = await SYN.products();
    let category = "Mice",
      ids = [];
    const categories = [...new Set(products.map((p) => p.category))].sort();
    function draw() {
      const options = products.filter((p) => p.category === category);
      root.innerHTML = `<div class="versus-heading"><label>Battle category<select data-battle-category>${categories.map((x) => `<option ${x === category ? "selected" : ""}>${x}</option>`).join("")}</select></label></div><div class="fighter-select">${[
        0, 1, 2,
      ]
        .map((_, i) => {
          const p = products.find((x) => x.id === ids[i]);
          return `<article class="${
            p ? "locked" : ""
          }"><div class="player-label">PLAYER ${i + 1}</div>${
            p
              ? `<img src="${p.image}" alt="${p.name}">`
              : '<div class="fighter-empty"><strong>?</strong><span>SELECT GEAR</span></div>'
          }<label>Contender<select data-fighter="${i}"><option value="">Choose ${category}</option>${options.map((x) => `<option value="${x.id}" ${x.id === ids[i] ? "selected" : ""}>${x.name}</option>`).join("")}</select></label>${
            p
              ? `<div class="fighter-name"><small>${p.brand}</small><h3>${p.name}</h3></div>`
              : ""
          }</article>`;
        })
        .join("")}</div>${
        ids.length
          ? `<div class="battle-results"><div class="battle-title"><span>COMPARISON DATA</span><button data-reset>Reset match</button></div><div class="battle-grid">${ids
              .map((id, i) => {
                const p = products.find((x) => x.id === id);
                return `<article><span>P${i + 1}</span><h3>${p.name}</h3><div><small>Price</small><b>${SYN.money(p.price)}</b></div><div><small>Availability</small><b>${p.availability}</b></div><div><small>Specifications</small>${p.specifications.map((s) => `<p>${s}</p>`).join("")}</div><a class="btn secondary" href="products.html?search=${encodeURIComponent(p.name)}">View gear</a></article>`;
              })
              .join("")}</div></div>`
          : ""
      }`;
      root.querySelector("[data-battle-category]").onchange = (e) => {
        category = e.target.value;
        ids = [];
        draw();
      };
      root.querySelectorAll("[data-fighter]").forEach(
        (s) =>
          (s.onchange = () => {
            ids[+s.dataset.fighter] = +s.value;
            ids = ids.filter(Boolean);
            draw();
          }),
      );
      root.querySelector("[data-reset]")?.addEventListener("click", () => {
        ids = [];
        draw();
      });
    }
    draw();
  } catch {
    root.innerHTML = '<div class="error">Comparison data unavailable.</div>';
  }
})();
