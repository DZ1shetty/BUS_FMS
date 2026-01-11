// server.js
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// ================================
// HEALTH CHECK
// ================================
app.get("/", (req, res) => {
  res.send(
    "Bus Fleet Management System API is running. Backend connected via Aiven MySQL."
  );
});

// ================================
// DATABASE CONNECTION (AIVEN)
// ================================
const pool = mysql.createPool({
  host: process.env.AIVEN_DB_HOST,
  user: process.env.AIVEN_DB_USER,
  password: process.env.AIVEN_DB_PASSWORD,
  database: process.env.AIVEN_DB_NAME || "bus_fms",
  port: Number(process.env.AIVEN_DB_PORT),
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 10,
});

const db = pool.promise();

// ================================
// AUTH
// ================================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.query(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );

  if (rows.length === 0) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match && password !== user.password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({ success: true });
});

app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  await db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hash]
  );

  res.json({ success: true });
});

// ================================
// READ APIs
// ================================
app.get("/api/students", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM students");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/routes", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM routes");
  res.json(rows);
});

app.get("/api/buses", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM buses");
  res.json(rows);
});

app.get("/api/drivers", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM drivers");
  res.json(rows);
});

app.get("/api/maintenance", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM maintenancelogs");
  res.json(rows);
});

app.get("/api/incidents", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM incidents");
  res.json(rows);
});

// ================================
// CREATE APIs
// ================================
app.post("/api/addstudents", async (req, res) => {
  const { name, grade, busrouteid, boardingpoint } = req.body;

  await db.query(
    "INSERT INTO students (name, grade, busrouteid, boardingpoint) VALUES (?, ?, ?, ?)",
    [name, grade, busrouteid, boardingpoint]
  );

  res.json({ success: true });
});

// ================================
// SHOW DASHBOARD COUNTS
// ================================
app.get("/api/dashboard-stats", async (req, res) => {
  const [[students]] = await db.query(
    "SELECT COUNT(*) AS count FROM students"
  );
  const [[buses]] = await db.query(
    "SELECT COUNT(*) AS count FROM buses"
  );
  const [[routes]] = await db.query(
    "SELECT COUNT(*) AS count FROM routes"
  );
  const [[incidents]] = await db.query(
    "SELECT COUNT(*) AS count FROM incidents"
  );

  res.json({
    students: students.count,
    buses: buses.count,
    routes: routes.count,
    incidents: incidents.count,
  });
});

// ================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
