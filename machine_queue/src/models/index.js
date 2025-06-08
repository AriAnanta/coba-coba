/**
 * Database Models Index untuk Machine Queue Service
 * 
 * Inisialisasi Sequelize dan import semua model dengan MySQL
 */
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Database configuration - using MySQL untuk konsistensi microservice
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
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};

// Read all model files
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Initialize database
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connection established successfully');
    
    // Sync models - DO NOT alter tables if they already exist with data
    await sequelize.sync({ force: false, alter: false });
    console.log('📦 Database models synchronized');
    
    // Create sample data if none exists
    await createSampleData();
  } catch (error) {
    console.error('❌ Unable to connect to the MySQL database:', error);
    console.error('Please make sure MySQL is running and database exists');
  }
}

async function createSampleData() {
  try {
    const machineCount = await db.Machine.count();
    if (machineCount === 0) {
      console.log('🔧 Creating sample machines...');
      await db.Machine.bulkCreate([
        {
          machine_id: 'MCH-001',
          name: 'CNC Mill 1',
          type: 'Milling Machine',
          manufacturer: 'Haas',
          model_number: 'VF-2',
          capacity: 100,
          capacity_unit: 'parts/hour',
          location: 'Shop Floor A',
          status: 'operational',
          hours_per_day: 8
        },
        {
          machine_id: 'MCH-002',
          name: 'Lathe 2',
          type: 'Turning Machine',
          manufacturer: 'Mazak',
          model_number: 'QT-200',
          capacity: 50,
          capacity_unit: 'parts/hour',
          location: 'Shop Floor B',
          status: 'operational',
          hours_per_day: 8
        },
        {
          machine_id: 'MCH-003',
          name: '3D Printer 1',
          type: 'Additive Manufacturing',
          manufacturer: 'Stratasys',
          model_number: 'F370',
          capacity: 10,
          capacity_unit: 'parts/day',
          location: 'R&D Lab',
          status: 'operational',
          hours_per_day: 24
        }
      ]);
      console.log('✅ Sample machines created');
    }

    const queueCount = await db.MachineQueue.count();
    if (queueCount === 0) {
      console.log('📋 Creating sample queue items...');
      await db.MachineQueue.bulkCreate([
        {
          queue_id: 'QUEUE-001',
          machine_id: 1,
          batch_id: 1,
          batch_number: 'BATCH-001',
          product_name: 'Product A',
          step_name: 'Milling',
          hours_required: 4,
          priority: 'normal',
          status: 'waiting',
          position: 1
        },
        {
          queue_id: 'QUEUE-002',
          machine_id: 2,
          batch_id: 2,
          batch_number: 'BATCH-002',
          product_name: 'Product B',
          step_name: 'Turning',
          hours_required: 2,
          priority: 'high',
          status: 'waiting',
          position: 1
        }
      ]);
      console.log('✅ Sample queue items created');
    }
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
}

// Initialize on module load
initDatabase();

module.exports = db;
