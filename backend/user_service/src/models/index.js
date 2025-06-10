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

// Export all models
module.exports = {
  User,
  sequelize,
  Sequelize
};
