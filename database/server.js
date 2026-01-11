// server.js
require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send(
    "Bus Fleet Management System API is running. Access the frontend via the React dev server."
  );
});

// ================================
// DATABASE CONNECTION (AIVEN ONLY)
// ================================
let pool;
let promisePool;

if (process.env.AIVEN_DB_HOST) {
  pool = mysql.createPool({
    host: process.env.AIVEN_DB_HOST,
    user: process.env.AIVEN_DB_USER,
    password: process.env.AIVEN_DB_PASSWORD,
    database: process.env.AIVEN_DB_NAME,
    port: Number(process.env.AIVEN_DB_PORT),
    ssl:
      process.env.AIVEN_DB_SSL === "true"
        ? { rejectUnauthorized: true }
        : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  promisePool = pool.promise();

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Aiven DB connection failed:", err);
    } else {
      console.log("✅ Connected to Aiven MySQL");
      connection.release();
    }
  });
} else {
  console.warn(
    "⚠️ AIVEN_DB_HOST not set. Database features will not work."
  );
}

// Helper
const getDb = () => {
  if (!promisePool) {
    throw new Error(
      "Database not configured. Please set AIVEN_DB_* environment variables."
    );
  }
  return promisePool;
};

// ================================
// AUTH
// ================================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  try {
    const [users] = await getDb().query(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res
        .status(401)
        .json({ error: "User does not exist, please signup!" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match && password === user.password) {
      return res.json({ success: true });
    }

    if (match) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const [existingUsers] = await getDb().query(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await getDb().query(
      "INSERT INTO Users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================================
// READ APIs
// ================================
app.get("/api/students", async (req, res) => {
  try {
    const [results] = await getDb().query("SELECT * FROM Students");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/api/routes", async (req, res) => {
  const [results] = await getDb().query("SELECT * FROM Routes");
  res.json(results);
});

app.get("/api/buses", async (req, res) => {
  const [results] = await getDb().query("SELECT * FROM Buses");
  res.json(results);
});

app.get("/api/drivers", async (req, res) => {
  const [results] = await getDb().query("SELECT * FROM Drivers");
  res.json(results);
});

app.get("/api/maintenance", async (req, res) => {
  const [results] = await getDb().query("SELECT * FROM MaintenanceLogs");
  res.json(results);
});

app.get("/api/incidents", async (req, res) => {
  const [results] = await getDb().query("SELECT * FROM Incidents");
  res.json(results);
});

// ================================
// CREATE APIs
// ================================
app.post("/api/addstudents", async (req, res) => {
  const { Name, Grade, BusRouteID, BoardingPoint } = req.body;
  await getDb().query(
    "INSERT INTO Students(Name, Grade, BusRouteId, BoardingPoint) VALUES (?, ?, ?, ?)",
    [Name, Grade, BusRouteID, BoardingPoint]
  );
  res.json({ success: true });
});

app.post("/api/addroutes", async (req, res) => {
  const { StartPoint, EndPoint } = req.body;
  await getDb().query(
    "INSERT INTO Routes(StartPoint, EndPoint, RouteName) VALUES (?, ?, ?)",
    [StartPoint, EndPoint, `Route ${StartPoint} to ${EndPoint}`]
  );
  res.json({ success: true });
});

app.post("/api/addbuses", async (req, res) => {
  const { BusNumber, Capacity, RouteID } = req.body;
  await getDb().query(
    "INSERT INTO Buses(BusNumber, Capacity, RouteID) VALUES (?, ?, ?)",
    [BusNumber, Capacity, RouteID || null]
  );
  res.json({ success: true });
});

app.post("/api/adddrivers", async (req, res) => {
  const { Name, LicenseNumber, Phone } = req.body;
  await getDb().query(
    "INSERT INTO Drivers(Name, LicenseNumber, Phone) VALUES (?, ?, ?)",
    [Name, LicenseNumber, Phone]
  );
  res.json({ success: true });
});

app.post("/api/addmaintenance", async (req, res) => {
  const { BusID, Description, Date } = req.body;
  await getDb().query(
    "INSERT INTO MaintenanceLogs(BusID, Description, Date) VALUES (?, ?, ?)",
    [BusID, Description, Date]
  );
  res.json({ success: true });
});

app.post("/api/addincidents", async (req, res) => {
  const { BusID, Description, Date } = req.body;
  await getDb().query(
    "INSERT INTO Incidents(BusID, Description, Date) VALUES (?, ?, ?)",
    [BusID, Description, Date]
  );
  res.json({ success: true });
});

// ================================
// DASHBOARD
// ================================
app.get("/api/dashboard-stats", async (req, res) => {
  const [[students]] = await getDb().query(
    "SELECT COUNT(*) as count FROM Students"
  );
  const [[buses]] = await getDb().query(
    "SELECT COUNT(*) as count FROM Buses"
  );
  const [[routes]] = await getDb().query(
    "SELECT COUNT(*) as count FROM Routes"
  );
  const [[incidents]] = await getDb().query(
    "SELECT COUNT(*) as count FROM Incidents"
  );

  res.json({
    students: students.count,
    buses: buses.count,
    routes: routes.count,
    incidents: incidents.count,
  });
});

// ================================
// FIREBASE CONFIG
// ================================
app.get("/api/config/firebase", (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  });
});

// ================================
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
  );
}

module.exports = app;
