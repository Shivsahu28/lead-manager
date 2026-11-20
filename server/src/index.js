import express from "express";
import cors from "cors";
import db from "./db.js";
import { validateLead } from "./validation.js";

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const columns = ["name", "email", "phone", "company", "source", "status"];

app.get("/api/leads", (req, res) => {
  const { search = "", status = "" } = req.query;
  let sql = "SELECT * FROM leads WHERE 1=1";
  const params = [];
  if (search.trim()) {
    sql += " AND name LIKE ?";
    params.push(`%${search.trim()}%`);
  }
  if (status && ["New", "Contacted", "Qualified", "Lost"].includes(status)) {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY id DESC";
  res.json(db.prepare(sql).all(...params));
});

app.post("/api/leads", (req, res) => {
  const errors = validateLead(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields", errors });
  const values = columns.map((key) => req.body[key].trim());
  const result = db.prepare(`INSERT INTO leads (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`).run(...values);
  res.status(201).json(db.prepare("SELECT * FROM leads WHERE id = ?").get(result.lastInsertRowid));
});

app.put("/api/leads/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ message: "Lead not found" });
  const errors = validateLead(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ message: "Please correct the highlighted fields", errors });
  const values = columns.map((key) => req.body[key].trim());
  db.prepare(`UPDATE leads SET ${columns.map((key) => `${key} = ?`).join(", ")} WHERE id = ?`).run(...values, req.params.id);
  res.json(db.prepare("SELECT * FROM leads WHERE id = ?").get(req.params.id));
});

app.delete("/api/leads/:id", (req, res) => {
  const result = db.prepare("DELETE FROM leads WHERE id = ?").run(req.params.id);
  if (!result.changes) return res.status(404).json({ message: "Lead not found" });
  res.status(204).end();
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server" });
});

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
