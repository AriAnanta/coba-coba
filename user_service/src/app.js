/**
 * User Management Service
 * Port: 5006
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5006;

// Service information
const service = {
  name: "user_service",
  description: "User Management Service",
  version: "1.0.0",
};

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GraphQL setup
const { graphqlHTTP } = require("express-graphql");
const schema = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const { verifyToken } = require("./middleware/auth.middleware");

// GraphQL endpoint - MUST BE PLACED BEFORE OTHER ROUTES TO AVOID 404s
app.use(
  "/graphql",
  verifyToken,
  graphqlHTTP((req) => ({
    schema: schema,
    rootValue: resolvers,
    graphiql: process.env.NODE_ENV !== "production",
    context: { user: req.user },
  }))
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    service: service.name,
    status: "healthy",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Import routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const uiRoutes = require("./routes/ui.routes");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// UI routes - placed after API and GraphQL to avoid conflicts
app.use("/", uiRoutes);

app.get("/api", (req, res) => {
  res.json({
    message: service.description + " API",
    version: service.version,
    endpoints: {
      health: "/health",
      api: "/api",
      graphql: "/graphql",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    service: service.name,
    requestedRoute: req.originalUrl,
    method: req.method,
    availableRoutes: {
      auth: ["/api/auth/login", "/api/auth/register"],
      users: ["/api/users"],
      graphql: ["/graphql"], // Added GraphQL endpoint to available routes
      health: ["/health"],
      api: ["/api"],
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    service: service.name,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ${service.description} is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🔗 GraphQL endpoint: http://localhost:${PORT}/graphql`); // Added GraphQL endpoint log
});

module.exports = app;
