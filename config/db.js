
require('dotenv').config();

const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 27892),
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',

  // Use Aiven's CA certificate when provided
  ssl: process.env.DB_HOST
  ? { rejectUnauthorized: false }
  : undefined,

  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  let connection;

  try {
    console.log('Testing MySQL connection...');

    connection = await pool.getConnection();

    const [rows] = await connection.query(
      'SELECT DATABASE() AS database_name, VERSION() AS mysql_version'
    );

    console.log('✅ MySQL connected successfully!');
    console.log('Database:', rows[0].database_name);
    console.log('Version:', rows[0].mysql_version);
  } catch (error) {
    console.error('❌ MySQL connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  } finally {
    if (connection) connection.release();
  }
}

testConnection();

module.exports = pool;

