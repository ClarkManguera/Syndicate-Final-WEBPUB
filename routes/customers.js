const router = require("express").Router();
const customers = require("../data/customers.json");
router.get("/", (_req, res) => res.json(customers));
router.get("/:id", (req, res) => {
  if (!/^\d+$/.test(req.params.id))
    return res.status(400).json({ error: "Customer ID must be numeric" });
  const customer = customers.find((c) => c.id === Number(req.params.id));
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});
module.exports = router;
