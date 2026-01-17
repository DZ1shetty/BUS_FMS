require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`Backend server running locally on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('Server failed to start:', err);
});

// Helper for query execution
const runQuery = async (sql, args = []) => {
    try {
        const result = await client.execute({ sql, args });
        return result;
    } catch (error) {
        console.error("Database Error:", error);
        throw error;
    }
};

// --- ROUTES ---

// Dashboard Stats
app.get('/api/dashboard-stats', async (req, res) => {
    try {
        const [students, buses, routes, incidents] = await Promise.all([
            runQuery('SELECT COUNT(*) as count FROM Students'),
            runQuery('SELECT COUNT(*) as count FROM Buses'),
            runQuery('SELECT COUNT(*) as count FROM Routes'),
            runQuery('SELECT COUNT(*) as count FROM Incidents')
        ]);

        res.json({
            students: students.rows[0].count,
            buses: buses.rows[0].count,
            routes: routes.rows[0].count,
            incidents: incidents.rows[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Endpoints
app.get('/api/students', async (req, res) => {
    try {
        const result = await runQuery('SELECT * FROM Students');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/routes', async (req, res) => {
    try {
        const result = await runQuery('SELECT * FROM Routes');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/buses', async (req, res) => {
    try {
        const result = await runQuery('SELECT * FROM Buses');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/drivers', async (req, res) => {
    try {
        const result = await runQuery('SELECT * FROM Drivers');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/maintenance', async (req, res) => {
    try {
        const result = await runQuery('SELECT * FROM MaintenanceLogs');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/incidents', async (req, res) => {
    try {
        const result = await runQuery('SELECT * FROM Incidents');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADD Endpoints
app.post('/api/addstudents', async (req, res) => {
    const { Name, Grade, BusRouteID, BoardingPoint } = req.body;
    try {
        await runQuery('INSERT INTO Students (Name, Grade, BusRouteId, BoardingPoint) VALUES (?, ?, ?, ?)', [Name, Grade, BusRouteID, BoardingPoint]);
        res.json({ message: 'Student added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/addroutes', async (req, res) => {
    const { RouteName, StartPoint, EndPoint } = req.body; // Adjusted payload
    try {
        await runQuery('INSERT INTO Routes (RouteName, StartPoint, EndPoint) VALUES (?, ?, ?)', [RouteName || 'New Route', StartPoint, EndPoint]);
        res.json({ message: 'Route added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/addbuses', async (req, res) => {
    const { BusNumber, Capacity, RouteID } = req.body;
    try {
        await runQuery('INSERT INTO Buses (BusNumber, Capacity, RouteID) VALUES (?, ?, ?)', [BusNumber, Capacity, RouteID]);
        res.json({ message: 'Bus added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/adddrivers', async (req, res) => {
    const { Name, LicenseNumber, Phone } = req.body;
    try {
        await runQuery('INSERT INTO Drivers (Name, LicenseNumber, Phone) VALUES (?, ?, ?)', [Name, LicenseNumber, Phone]);
        res.json({ message: 'Driver added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/addmaintenance', async (req, res) => {
    const { BusID, Description, Date } = req.body;
    try {
        await runQuery('INSERT INTO MaintenanceLogs (BusID, Description, Date) VALUES (?, ?, ?)', [BusID, Description, Date]);
        res.json({ message: 'Maintenance log added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/addincidents', async (req, res) => {
    const { BusID, Description, Date } = req.body;
    try {
        await runQuery('INSERT INTO Incidents (BusID, Description, Date) VALUES (?, ?, ?)', [BusID, Description, Date]);
        res.json({ message: 'Incident added' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE Endpoints
app.delete('/api/deleteStudent/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM Students WHERE StudentID = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/deleteRoute/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM Routes WHERE RouteID = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/deleteBus/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM Buses WHERE BusID = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/deleteDriver/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM Drivers WHERE DriverID = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/deleteMaintainence/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM MaintenanceLogs WHERE LogID = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/deleteIncident/:id', async (req, res) => {
    try {
        await runQuery('DELETE FROM Incidents WHERE IncidentID = ?', [req.params.id]);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


