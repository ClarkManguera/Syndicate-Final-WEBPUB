const pillars = [
  [
    "GEAR",
    "01 / EQUIP",
    "Choose with purpose.",
    "Gear is the mouse that responds, the display that keeps up, and the audio that keeps a team connected. Syndicate makes those choices easier to understand.",
    "30",
    "demo products",
  ],
  [
    "PLAY",
    "02 / CONNECT",
    "Better together.",
    "Play is competition, collaboration, and the shared moments around every setup. Our identity is built around people improving as a team.",
    "10",
    "focused categories",
  ],
  [
    "BEYOND",
    "03 / ADVANCE",
    "Build past the game.",
    "Beyond means using technology to create, study, work, stream, and grow. A capable setup supports everything a player wants to become.",
    "1",
    "shared community",
  ],
];
let active = 0;
function drawIdentity() {
  document.querySelector("[data-identity-tabs]").innerHTML = pillars
    .map(
      (p, i) =>
        `<button class="${
          i === active ? "active" : ""
        }" data-pillar="${i}"><span>${String(i + 1).padStart(2, "0")}</span>${p[0]}</button>`,
    )
    .join("");
  const p = pillars[active];
  document.querySelector("[data-identity-display]").innerHTML =
    `<div><span>${p[1]}</span><h2>${p[2]}</h2><p>${p[3]}</p><a class="btn secondary" href="products.html">Enter the catalog</a></div><div class="identity-stat"><strong>${p[4]}</strong><small>${p[5]}</small></div><div class="identity-cube"><img src="images/logo/syndicate-logo.svg" alt=""></div>`;
  document.querySelectorAll("[data-pillar]").forEach(
    (b) =>
      (b.onclick = () => {
        active = +b.dataset.pillar;
        drawIdentity();
      }),
  );
}
drawIdentity();
