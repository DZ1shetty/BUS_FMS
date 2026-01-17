// database/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const { createClient } = require("@libsql/client");

const app = express();
app.use(cors());
app.use(express.json());

// ================================
// TURSO CONNECTION
// ================================
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Test DB connection once
(async () => {
  try {
    const result = await db.execute("SELECT 1 as ok");
    console.log("✅ Turso DB connected successfully:", result.rows);
  } catch (err) {
    console.error("❌ Turso DB connection failed:", err.message);
  }
})();

// ================================
// HEALTH CHECK
// ================================
app.get("/", (req, res) => {
  res.send("Bus Fleet Management System API is running. Backend connected via Turso.");
});

// ================================
// AUTH
// ================================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = await db.execute({
      sql: "SELECT * FROM Users WHERE username = ?",
      args: [username],
    });

    if (users.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users.rows[0];

    const storedPassword = user.password;
    const match = await bcrypt.compare(password, storedPassword);

    // fallback if plain text exists in old data
    if (!match && password !== storedPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    await db.execute({
      sql: "INSERT INTO Users (username, password) VALUES (?, ?)",
      args: [username, hash],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================================
// READ APIs
// ================================
app.get("/api/students", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM Students");
    res.json(result.rows);
  } catch (err) {
    console.error("Students error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/routes", async (req, res) => {
  const result = await db.execute("SELECT * FROM Routes");
  res.json(result.rows);
});

app.get("/api/buses", async (req, res) => {
  const result = await db.execute("SELECT * FROM Buses");
  res.json(result.rows);
});

app.get("/api/drivers", async (req, res) => {
  const result = await db.execute("SELECT * FROM Drivers");
  res.json(result.rows);
});

app.get("/api/maintenance", async (req, res) => {
  const result = await db.execute("SELECT * FROM MaintenanceLogs");
  res.json(result.rows);
});

app.get("/api/incidents", async (req, res) => {
  const result = await db.execute("SELECT * FROM Incidents");
  res.json(result.rows);
});

// ================================
// DASHBOARD
// ================================
app.get("/api/dashboard-stats", async (req, res) => {
  const students = await db.execute("SELECT COUNT(*) AS count FROM Students");
  const buses = await db.execute("SELECT COUNT(*) AS count FROM Buses");
  const routes = await db.execute("SELECT COUNT(*) AS count FROM Routes");
  const incidents = await db.execute("SELECT COUNT(*) AS count FROM Incidents");

  res.json({
    students: students.rows[0].count,
    buses: buses.rows[0].count,
    routes: routes.rows[0].count,
    incidents: incidents.rows[0].count,
  });
});

// ✅ IMPORTANT: Export app (NO app.listen here for Vercel)
module.exports = app;

// Start server locally if run directly
if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Backend server running locally on port ${PORT}`);
  });
}
