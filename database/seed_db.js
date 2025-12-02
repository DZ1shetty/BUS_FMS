const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "DZ12005@SQL!",
  database: "bus_fms",
  multipleStatements: true
};

const connection = mysql.createConnection(dbConfig);

const dataPath = path.join(__dirname, 'dummy_data.sql');
const dataSql = fs.readFileSync(dataPath, 'utf8');

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL server.');

  connection.query(dataSql, (err, results) => {
    if (err) {
      console.error('Error inserting dummy data:', err);
      process.exit(1);
    }
    console.log('Dummy data inserted successfully.');
    connection.end();
  });
});
