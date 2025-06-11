/**
 * Database Models Index
 * 
 * Initialize Sequelize and import all models
 */
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Initialize db object
const db = {};

// Add Sequelize and connection instance to db
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models directly
const User = require('./user.model');

// Add models to db object
db.User = User;

// Associate models if associations exist
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Sinkronisasi model dengan database
// Ini akan membuat tabel jika belum ada
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synchronized successfully');
  })
  .catch(err => {
    console.error('❌ Error synchronizing database:', err);
  });

// Export all models
module.exports = {
  User,
  sequelize,
  Sequelize
};
