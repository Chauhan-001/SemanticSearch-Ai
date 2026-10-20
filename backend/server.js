const express = require("express");

const app = express();
const PORT = 3000;
const PYTHON_URL = "http://127.0.0.1:8000";

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "SemanticSearch AI Node Backend",
  });
});

async function proxy(req, res, method, path) {
  try {
    const response = await fetch(`${PYTHON_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "POST" ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error(`Proxy ${method} ${path} failed:`, error);
    return res.status(502).json({
      error: "Could not communicate with the Python search service",
    });
  }
}

app.post("/search", (req, res) => {
  const { query, top_k = 3 } = req.body;
  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "Query must be a non-empty string" });
  }
  return proxy(req, res, "POST", "/search");
});

app.post("/documents", (req, res) => {
  const { documents } = req.body;
  if (!Array.isArray(documents) || documents.length === 0) {
    return res.status(400).json({ error: "Documents must be a non-empty array" });
  }
  return proxy(req, res, "POST", "/documents");
});

app.get("/documents", (req, res) => {
  return proxy(req, res, "GET", "/documents");
});

app.delete("/documents", (req, res) => {
  return proxy(req, res, "DELETE", "/documents");
});

app.listen(PORT, () => {
  console.log(`Node backend running at http://localhost:${PORT}`);
});
