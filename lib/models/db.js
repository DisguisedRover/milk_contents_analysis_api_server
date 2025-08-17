const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path'); 

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); 


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1); 
  } else {
    console.log('Connected to the database!');
    connection.release();
  }
});

module.exports = pool.promise();