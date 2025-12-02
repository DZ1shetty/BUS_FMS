require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "DZ12005@SQL!",
  database: process.env.DB_NAME || "bus_fms",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

async function verifyData() {
  try {
    console.log("--- Verifying Database Content ---");
    
    const tables = ['Students', 'Routes', 'Buses', 'Drivers', 'MaintenanceLogs', 'Incidents', 'Users'];
    
    for (const table of tables) {
      const [rows] = await promisePool.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${rows[0].count} rows`);
      
      if (rows[0].count > 0) {
        const [data] = await promisePool.query(`SELECT * FROM ${table}`);
        console.table(data);
      }
    }
    
    console.log("----------------------------------");
    console.log("Data verification complete. The data is stored in your MySQL database.");
    
  } catch (err) {
    console.error("Error verifying data:", err);
  } finally {
    pool.end();
  }
}

verifyData();
