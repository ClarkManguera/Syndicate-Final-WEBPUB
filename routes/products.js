const router = require("express").Router();
const products = require("../data/products.json");
router.get("/", (req, res) => {
  const allowed = new Set([
    "category",
    "brand",
    "search",
    "sale",
    "featured",
    "new",
  ]);
  const invalid = Object.keys(req.query).find((key) => !allowed.has(key));
  if (invalid)
    return res
      .status(400)
      .json({ error: `Unsupported query parameter: ${invalid}` });
  let result = [...products];
  const text = String(req.query.search || "")
    .trim()
    .toLowerCase();
  if (text.length > 80)
    return res
      .status(400)
      .json({ error: "Search is limited to 80 characters" });
  if (text)
    result = result.filter((p) =>
      `${p.name} ${p.brand}`.toLowerCase().includes(text),
    );
  if (req.query.category)
    result = result.filter((p) => p.category === req.query.category);
  if (req.query.brand)
    result = result.filter((p) => p.brand === req.query.brand);
  if (req.query.sale === "true")
    result = result.filter((p) => p.promotionEligible);
  if (req.query.featured === "true") result = result.filter((p) => p.featured);
  if (req.query.new === "true") result = result.filter((p) => p.newArrival);
  res.json(result);
});
router.get("/:id", (req, res) => {
  if (!/^\d+$/.test(req.params.id))
    return res.status(400).json({ error: "Product ID must be numeric" });
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});
module.exports = router;
