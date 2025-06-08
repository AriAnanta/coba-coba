/**
 * Database Models Index for Production Management Service
 *
 * Initialize Sequelize and import all models
 */
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Create Sequelize instance with service-specific database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3308,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    underscored: true,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Initialize db object
const db = {};

// Add Sequelize and connection instance to db
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import all model files in the directory
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== "index.js" && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Associate models if associations exist
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
