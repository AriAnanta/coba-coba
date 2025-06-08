/**
 * Database Configuration untuk Machine Queue Service
 * 
 * Konfigurasi koneksi MySQL
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Konfigurasi database MySQL
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3308,
  database: process.env.DB_NAME || 'machine_queue_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+07:00' // WIB timezone
});

// Test koneksi database
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the MySQL database:', error);
    return false;
  }
}

// Tutup koneksi database
async function closeConnection() {
  try {
    await sequelize.close();
    console.log('✅ MySQL connection closed.');
  } catch (error) {
    console.error('❌ Error closing MySQL connection:', error);
  }
}

module.exports = {
  sequelize,
  testConnection,
  closeConnection
};
