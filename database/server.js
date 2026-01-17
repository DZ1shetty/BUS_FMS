// server.js
require('dotenv').config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

// Middleware to verify JWT
// Middleware to verify JWT (Supports both Local JWT and Firebase ID Token)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  // 1. Try verifying as a local JWT (Manual Login)
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    return next();
  } catch (err) {
    // Token verification failed, might be a Firebase token.
    // Proceed to check Firebase token.
  }

  // 2. Try verifying as Firebase ID Token (Google Login)
  // Using Google's tokeninfo endpoint to verify without firebase-admin
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (response.ok) {
      const data = await response.json();
      // Optionally verify data.aud === process.env.FIREBASE_PROJECT_ID
      req.user = {
        id: data.sub,
        username: data.email || data.name,
        email: data.email,
        picture: data.picture
      };
      return next();
    } else {
      // Both verifications failed
      return res.status(403).json({ error: "Invalid or expired token." });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ error: "Token verification failed." });
  }
};

// Serve static files with cache control
app.use(express.static(path.join(__dirname, '../'), {
  maxAge: 0, // Disable cache for development
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/login/login.html');
});

// Create a connection pool instead of a single connection
let pool;
let promisePool;

if (process.env.DB_HOST) {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST === 'localhost' ? undefined : { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Promisify for Node.js async/await.
  promisePool = pool.promise();

  // Test connection
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("DB connection failed:", err);
    } else {
      console.log("Connected to MySQL");
      connection.release();
    }
  });
} else {
  console.warn("DB_HOST not set. Database features will not work.");
}

// Helper to get pool or throw
const getDb = () => {
  if (!promisePool) {
    throw new Error("Database not configured. Please set DB_HOST environment variable in Vercel.");
  }
  return promisePool;
};

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const [users] = await getDb().query("SELECT * FROM Users WHERE username = ?", [username]);

    if (users.length === 0) {
      return res.status(401).json({ error: "User does not exist, please signup!" });
    }

    const user = users[0];
    // Check if password matches (handling both plain text for legacy and hashed for new)
    const match = await bcrypt.compare(password, user.password);

    // Fallback for plain text passwords (if any exist from before optimization)
    if (match || (!match && password === user.password)) {
      const token = jwt.sign(
        { id: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ success: true, token, username: user.username, email: user.email });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login Error:", err);
    if (err.message.includes("Database not configured")) {
      return res.status(503).json({ error: "Database connection failed. Please configure DB_HOST in Vercel settings." });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Profile Management Endpoints
app.put("/api/users/profile", authenticateToken, async (req, res) => {
  const { username, email } = req.body;
  const userId = req.user.id; // From JWT

  try {
    // Check for unique username/email conflict (excluding self)
    const [existing] = await getDb().query("SELECT * FROM Users WHERE (username = ? OR email = ?) AND id != ?", [username, email, userId]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Username or Email already in use." });
    }

    await getDb().query("UPDATE Users SET username = ?, email = ? WHERE id = ?", [username, email, userId]);

    res.json({ success: true, message: "Profile updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.put("/api/users/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const [users] = await getDb().query("SELECT * FROM Users WHERE id = ?", [userId]);
    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    const user = users[0];
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match && currentPassword !== user.password) { // Support legacy plain
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await getDb().query("UPDATE Users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Forgot Password Flow
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const [users] = await getDb().query("SELECT * FROM Users WHERE email = ?", [email]);
    if (users.length === 0) {
      // Security: Don't reveal functionality, just say sent.
      return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
    }

    const user = users[0];
    // Generate a simple token (In production use a separate table with expiry)
    const resetToken = jwt.sign({ id: user.id, type: 'reset' }, JWT_SECRET, { expiresIn: '15m' });

    // MOCK EMAIL SENDING
    console.log(`[MOCK EMAIL] Password Reset Link for ${email}: http://localhost:5000/login/reset-password.html?token=${resetToken}`);

    res.json({ success: true, message: "Reset link sent to your email (Check server console for mock link)." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error processing request" });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'reset') return res.status(400).json({ error: "Invalid token type" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await getDb().query("UPDATE Users SET password = ? WHERE id = ?", [hashedPassword, decoded.id]);

    res.json({ success: true, message: "Password has been reset. Please login." });
  } catch (err) {
    return res.status(400).json({ error: "Invalid or expired token" });
  }
});

app.post("/api/signup", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    // Check if username already exists
    const [existingUsers] = await getDb().query("SELECT * FROM Users WHERE username = ?", [username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await getDb().query("INSERT INTO Users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);

    res.json({ success: true });
  } catch (err) {
    console.error("Signup Error:", err);
    if (err.message.includes("Database not configured")) {
      return res.status(503).json({ error: "Database connection failed. Please configure DB_HOST in Vercel settings." });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/students", authenticateToken, async (req, res) => {
  try {
    const [results] = await getDb().query("SELECT * FROM Students");
    res.json(results);
  } catch (err) {
    console.error("Students API Error:", err);
    if (err.message.includes("Database not configured")) {
      return res.status(503).json({ error: "Database not configured" });
    }
    res.status(500).json({ error: "Database connection failed. Check Vercel logs." });
  }
});

app.post("/api/addstudents", authenticateToken, async (req, res) => {
  try {
    const { Name, Grade, BusRouteID, BoardingPoint } = req.body;

    if (!Name || !Grade || !BusRouteID || !BoardingPoint) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [existing] = await getDb().query("SELECT * FROM Students WHERE Name = ?", [Name]);

    if (existing.length > 0) {
      return res.status(400).json({ error: "Student already exists" });
    }

    await getDb().query(
      "INSERT INTO Students(Name, Grade, BusRouteId, BoardingPoint) VALUES (?, ?, ?, ?)",
      [Name, Grade, BusRouteID, BoardingPoint]
    );
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/addroutes", authenticateToken, async (req, res) => {
  try {
    const { RouteID, StartPoint, EndPoint, Distance } = req.body;
    // RouteID is auto-increment, usually we don't insert it manually unless specified.
    // Assuming frontend sends it but we might ignore it or use it if not auto-increment.
    // Based on schema, RouteID is AUTO_INCREMENT. So we should ignore it or not require it.

    if (!StartPoint || !EndPoint) {
      return res.status(400).json({ error: "Start Point and End Point are required" });
    }

    await getDb().query(
      "INSERT INTO Routes(StartPoint, EndPoint, RouteName) VALUES (?, ?, ?)",
      [StartPoint, EndPoint, `Route ${StartPoint} to ${EndPoint}`] // Generating a name
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/addbuses", authenticateToken, async (req, res) => {
  try {
    const { BusNumber, Capacity, RouteID } = req.body;

    if (!BusNumber || !Capacity) {
      return res.status(400).json({ error: "Bus Number and Capacity are required" });
    }

    await getDb().query(
      "INSERT INTO Buses(BusNumber, Capacity, RouteID) VALUES (?, ?, ?)",
      [BusNumber, Capacity, RouteID || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/adddrivers", authenticateToken, async (req, res) => {
  try {
    const { Name, LicenseNumber, Phone } = req.body;

    if (!Name || !LicenseNumber) {
      return res.status(400).json({ error: "Name and License Number are required" });
    }

    await getDb().query(
      "INSERT INTO Drivers(Name, LicenseNumber, Phone) VALUES (?, ?, ?)",
      [Name, LicenseNumber, Phone]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/addmaintenance", authenticateToken, async (req, res) => {
  try {
    const { BusID, Description, Date } = req.body;

    if (!BusID || !Date) {
      return res.status(400).json({ error: "Bus ID and Date are required" });
    }

    await getDb().query(
      "INSERT INTO MaintenanceLogs(BusID, Description, Date) VALUES (?, ?, ?)",
      [BusID, Description, Date]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/addincidents", authenticateToken, async (req, res) => {
  try {
    const { BusID, Description, Date } = req.body;

    if (!BusID || !Date) {
      return res.status(400).json({ error: "Bus ID and Date are required" });
    }

    await getDb().query(
      "INSERT INTO Incidents(BusID, Description, Date) VALUES (?, ?, ?)",
      [BusID, Description, Date]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/routes", authenticateToken, async (req, res) => {
  try {
    const [results] = await getDb().query("SELECT * FROM Routes");
    res.json(results);
  } catch (err) {
    console.error("Routes API Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/api/buses", authenticateToken, async (req, res) => {
  try {
    const [results] = await getDb().query("SELECT * FROM Buses");
    res.json(results);
  } catch (err) {
    console.error("Buses API Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/api/drivers", async (req, res) => {
  try {
    const [results] = await getDb().query("SELECT * FROM Drivers");
    res.json(results);
  } catch (err) {
    console.error("Drivers API Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/api/maintenance", async (req, res) => {
  try {
    const [results] = await getDb().query("SELECT * FROM MaintenanceLogs");
    res.json(results);
  } catch (err) {
    console.error("Maintenance API Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/api/incidents", async (req, res) => {
  try {
    const [results] = await getDb().query("SELECT * FROM Incidents");
    res.json(results);
  } catch (err) {
    console.error("Incidents API Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// delete student data
app.delete("/api/deleteStudent/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await getDb().query("DELETE FROM Students WHERE StudentID = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete route data
app.delete("/api/deleteRoute/:id", async (req, res) => {
  try {
    const id = req.params.id;
    // Check for dependencies in Buses table
    const [buses] = await getDb().query("SELECT * FROM Buses WHERE RouteID = ?", [id]);
    if (buses.length > 0) {
      return res.status(400).json({ message: "Cannot delete route. It is assigned to one or more buses." });
    }
    // Check for dependencies in Students table
    const [students] = await getDb().query("SELECT * FROM Students WHERE BusRouteId = ?", [id]);
    if (students.length > 0) {
      return res.status(400).json({ message: "Cannot delete route. It is assigned to one or more students." });
    }

    await getDb().query("DELETE FROM Routes WHERE RouteID = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// delete bus data
app.delete("/api/deleteBus/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Check for dependencies in MaintenanceLogs
    const [maintenance] = await getDb().query("SELECT * FROM MaintenanceLogs WHERE BusID = ?", [id]);
    if (maintenance.length > 0) {
      return res.status(400).json({ message: "Cannot delete bus. It has associated maintenance logs." });
    }

    // Check for dependencies in Incidents
    const [incidents] = await getDb().query("SELECT * FROM Incidents WHERE BusID = ?", [id]);
    if (incidents.length > 0) {
      return res.status(400).json({ message: "Cannot delete bus. It has associated incidents." });
    }

    // Check for dependencies in Drivers (if there's a link, schema didn't show direct link from Driver to Bus, but let's check schema again if needed. 
    // Schema: Drivers(DriverID, Name, LicenseNumber, Phone). No BusID.
    // Wait, previous schema had AssignedBusId. Let's check the current schema.sql content I read earlier.
    // Schema read earlier: Drivers (DriverID, Name, LicenseNumber, Phone). No BusID.
    // So no dependency check needed for Drivers unless schema changed.

    await getDb().query("DELETE FROM Buses WHERE BusID = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// delete driver data
app.delete("/api/deleteDriver/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await getDb().query("DELETE FROM Drivers WHERE DriverID = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// delete maintainence data
app.delete("/api/deleteMaintainence/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await getDb().query("DELETE FROM MaintenanceLogs WHERE LogID = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// delete incident data
app.delete("/api/deleteIncident/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await getDb().query("DELETE FROM Incidents WHERE IncidentID = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

// Get Dashboard Stats
app.get("/api/dashboard-stats", authenticateToken, async (req, res) => {
  try {
    const [students] = await getDb().query("SELECT COUNT(*) as count FROM Students");
    const [buses] = await getDb().query("SELECT COUNT(*) as count FROM Buses");
    const [routes] = await getDb().query("SELECT COUNT(*) as count FROM Routes");
    const [incidents] = await getDb().query("SELECT COUNT(*) as count FROM Incidents");

    res.json({
      students: students[0].count,
      buses: buses[0].count,
      routes: routes[0].count,
      incidents: incidents[0].count
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/config/firebase", (req, res) => {
  if (!process.env.FIREBASE_API_KEY) {
    console.error("FIREBASE_API_KEY is missing in environment variables");
  }

  res.json({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
