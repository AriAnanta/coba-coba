/**
 * Production Feedback Service
 * Port: 5005
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./config/database');
const { findAvailablePort } = require('./utils/port-utils');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5005;

// Service information
const service = {
  name: 'production_feedback',
  description: 'Production Feedback Service',
  version: '1.0.0'
};

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('📦 Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: service.name,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT,
    database: sequelize.connectionManager.pool ? 'connected' : 'disconnected'
  });
});

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: process.env.NODE_ENV === 'development',
  customFormatErrorFn: (error) => {
    console.error('GraphQL Error:', error);
    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
      service: service.name
    };
  }
}));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    service: service.name
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    service: service.name,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server with port conflict handling
async function startServer() {
  try {
    // Initialize database first
    await initDatabase();
    
    const preferredPort = parseInt(process.env.PORT) || 5005;
    const startRange = parseInt(process.env.PORT_RANGE_START) || preferredPort;
    const endRange = parseInt(process.env.PORT_RANGE_END) || preferredPort + 10;
    
    const availablePort = await findAvailablePort(startRange, endRange);
    
    if (!availablePort) {
      console.error(`No available ports found in range ${startRange}-${endRange}`);
      process.exit(1);
    }
    
    if (availablePort !== preferredPort) {
      console.warn(`Port ${preferredPort} is in use. Using port ${availablePort} instead.`);
    }
    
    const server = app.listen(availablePort, () => {
      console.log(`🚀 ${service.description} is running on port ${availablePort}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Health check: http://localhost:${availablePort}/health`);
      console.log(`🔍 GraphQL endpoint: http://localhost:${availablePort}/graphql`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);

module.exports = app;
