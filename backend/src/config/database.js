const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'imps_upi_db',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function connectDatabase() {
  try {
    const connection = await pool.getConnection();

    console.log('MySQL connected successfully');

    connection.release();
  } catch (error) {
    console.error(
      'MySQL connection failed:',
      error.message
    );

    process.exit(1);
  }
}

module.exports = {
  pool,
  connectDatabase
};
