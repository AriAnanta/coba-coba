/**
 * Production Feedback Service
 * Port: 5005
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./config/database");
const apiRoutes = require("./routes");
const { initializeServices } = require("./services");
const { findAvailablePort } = require("./utils/port-utils");

// Import Apollo Server
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { typeDefs, resolvers } = require("./graphql/schema"); // Pastikan path ini benar dan impor typeDefs, resolvers

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5005;

// Service information
const service = {
  name: "production_feedback",
  description: "Production Feedback Service",
  version: "1.0.0",
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Apollo Server
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  // Apply Apollo Server middleware
  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );
}

// Database initialization
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // Sync models in development
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("📦 Database models synchronized");
    }
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
    throw error;
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    service: service.name,
    status: "healthy",
    timestamp: new Date().toISOString(),
    port: PORT,
    database: sequelize.connectionManager.pool ? "connected" : "disconnected",
  });
});

// API routes
app.get("/api", (req, res) => {
  res.json({
    message: service.description + " API",
    version: service.version,
    endpoints: {
      health: "/health",
      feedback: "/api/feedback",
      reports: "/api/reports",
    },
  });
});

// Routes (this will be moved inside startServer to ensure correct order)
// app.use("/api", apiRoutes);

// 404 handler (this will be moved inside startServer)
// app.use("*", (req, res) => {
//   return res.status(404).json({
//     error: "Route not found",
//     service: service.name,
//   });
// });

// Error handler (this remains at the very end)
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    service: service.name,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Start server with port conflict handling
async function startServer() {
  try {
    // Initialize database first
    await initDatabase();

    // Start Apollo Server and apply its middleware
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await apolloServer.start();

    app.use(
      "/graphql",
      expressMiddleware(apolloServer, {
        context: async ({ req }) => ({ token: req.headers.token }),
      })
    );
    console.log("✅ GraphQL server started and endpoint configured");

    // Apply other API routes here, after GraphQL
    app.use("/api", apiRoutes);

    // Initialize services (including Machine Queue consumer)
    await initializeServices();
    console.log("✅ Services initialized successfully");

    const preferredPort = parseInt(process.env.PORT) || 5005;
    const startRange = parseInt(process.env.PORT_RANGE_START) || preferredPort;
    const endRange = parseInt(process.env.PORT_RANGE_END) || preferredPort + 10;

    const availablePort = await findAvailablePort(startRange, endRange);

    if (!availablePort) {
      console.error(
        `No available ports found in range ${startRange}-${endRange}`
      );
      process.exit(1);
    }

    if (availablePort !== preferredPort) {
      console.warn(
        `Port ${preferredPort} is in use. Using port ${availablePort} instead.`
      );
    }

    const server = app.listen(availablePort, () => {
      console.log(
        `🚀 ${service.description} is running on port ${availablePort}`
      );
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 Health check: http://localhost:${availablePort}/health`);
      console.log(`🔗 API endpoint: http://localhost:${availablePort}/api`);
      console.log(
        `📝 Feedback API: http://localhost:${availablePort}/api/feedback`
      );
      console.log(
        `🚀 GraphQL endpoint: http://localhost:${availablePort}/graphql`
      );
    });

    // IMPORTANT: Place the 404 handler here, after all valid routes have been defined
    app.use("*", (req, res) => {
      return res.status(404).json({
        error: "Route not found",
        service: service.name,
      });
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received. Shutting down gracefully...");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer().catch(console.error);

module.exports = app;
