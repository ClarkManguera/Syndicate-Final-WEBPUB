const frame = document.querySelector(".email-frame");
document.querySelectorAll("[data-preview]").forEach(
  (b) =>
    (b.onclick = () => {
      frame.classList.toggle("mobile", b.dataset.preview === "mobile");
      document
        .querySelectorAll("[data-preview]")
        .forEach((x) => x.classList.toggle("secondary", x !== b));
    }),
);
