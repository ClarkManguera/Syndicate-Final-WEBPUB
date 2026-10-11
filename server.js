const express = require("express");
const path = require("path");
const products = require("./data/products.json");
const productRoutes = require("./routes/products");
const customerRoutes = require("./routes/customers");
const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use(express.static(__dirname, { extensions: ["html"] }));
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", products: products.length }),
);
app.use("/api", (_req, res) =>
  res.status(404).json({ error: "API endpoint not found" }),
);
app.use((_req, res) =>
  res.status(404).sendFile(path.join(__dirname, "index.html")),
);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
const port = Number(process.env.PORT) || 3000;
app.listen(port, () =>
  console.log(`SYNDICATE running at http://localhost:${port}`),
);
