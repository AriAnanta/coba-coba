/**
 * Konfigurasi aplikasi
 */
require("dotenv").config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 3308,
  env: process.env.NODE_ENV || "development",

  // Database configuration
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3308,
    name: process.env.DB_NAME || "production_planning_db",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },

  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",

  // Service URLs
  userServiceUrl: process.env.USER_SERVICE_URL || "http://localhost:3000",
  materialInventoryUrl:
    process.env.MATERIAL_INVENTORY_URL || "http://localhost:3001",
  machineQueueUrl: process.env.MACHINE_QUEUE_URL || "http://localhost:3002",
  productionManagementUrl:
    process.env.PRODUCTION_MANAGEMENT_URL || "http://localhost:3004",
  productionFeedbackUrl:
    process.env.PRODUCTION_FEEDBACK_URL || "http://localhost:3005",

  // Optimization settings
  optimizationSettings: {
    // Prioritas untuk optimasi jadwal (nilai lebih tinggi = prioritas lebih tinggi)
    priorities: {
      dueDate: 5, // Prioritas untuk tanggal jatuh tempo
      materialAvailability: 4, // Prioritas untuk ketersediaan material
      machineAvailability: 3, // Prioritas untuk ketersediaan mesin
      setupTime: 2, // Prioritas untuk waktu setup
      batchSize: 1, // Prioritas untuk ukuran batch
    },

    // Batas waktu untuk algoritma optimasi (dalam milidetik)
    optimizationTimeout: 5000,

    // Jumlah maksimum iterasi untuk algoritma optimasi
    maxIterations: 100,

    // Faktor buffer untuk jadwal (dalam persen)
    schedulingBuffer: 10,
  },
};
