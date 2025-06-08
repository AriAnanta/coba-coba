/**
 * Machine Queue Management Service
 * Port: 5003
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { graphqlHTTP } = require("express-graphql");
const { schema, root } = require("./graphql/schema");
require("dotenv").config();

// Import routes
const queueRoutes = require("./routes/queue.routes");
const machineRoutes = require("./routes/machine.routes");
const uiRoutes = require("./routes/ui.routes");

// Import models to initialize database
const db = require("./models");

const app = express();
const PORT = process.env.PORT || 5003;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Logging middleware
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser for session management
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    service: "machine_queue",
    status: "healthy",
    timestamp: new Date().toISOString(),
    port: PORT,
    database: db.sequelize ? "connected" : "disconnected",
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Machine Queue Management Service API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      machines: "/api/machines",
      queues: "/api/queues",
    },
  });
});

// API Routes
app.use("/api", queueRoutes);
app.use("/api", machineRoutes);

// GraphQL endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: process.env.NODE_ENV === "development",
  })
);

// UI Routes (if using server-side rendering)
app.use("/", uiRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    service: "machine_queue",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle specific error types
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => e.message),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Duplicate entry",
      field: err.errors[0]?.path,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    service: "machine_queue",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Graceful shutdown handler
function gracefulShutdown(server) {
  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");
    server.close(() => {
      console.log("✅ Server closed");
      if (db.sequelize) {
        db.sequelize.close();
      }
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("🛑 SIGINT received, shutting down gracefully");
    server.close(() => {
      console.log("✅ Server closed");
      if (db.sequelize) {
        db.sequelize.close();
      }
      process.exit(0);
    });
  });
}

// Start server
async function startServer() {
  try {
    console.log("🚀 Starting Machine Queue Management Service...");
    console.log(`📊 Target port: ${PORT}`);

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 Machine Queue Management Service is running on port ${PORT}`
      );
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
      console.log(`⚙️  Machines API: http://localhost:${PORT}/api/machines`);
      console.log(`📋 Queue API: http://localhost:${PORT}/api/queues`);
      console.log(`🔗 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error(
          "Please check if another service is running on this port"
        );
        process.exit(1);
      } else {
        console.error("❌ Server error:", error);
        process.exit(1);
      }
    });

    gracefulShutdown(server);
    return server;
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);

module.exports = app;
