/**
 * Database Models Index untuk Material Inventory Service
 *
 * Inisialisasi Sequelize dan import semua model
 */
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Membuat instance Sequelize dengan database khusus service ini
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 8,
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

// Inisialisasi objek db
const db = {};

// Menambahkan Sequelize dan instance koneksi ke db
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import semua file model dalam direktori
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

// Asosiasi model jika ada
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
