/**
 * Konfigurasi GraphQL untuk Material Inventory Service
 * 
 * Mengekspos schema dan resolvers untuk digunakan oleh server Apollo
 */
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// Membuat server Apollo
const createApolloServer = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Jika diperlukan, Anda dapat menambahkan data konteks di sini
      // yang akan tersedia di semua resolver
      return {
        user: req.user // Dari middleware auth
      };
    },
    formatError: (error) => {
      console.error('Error GraphQL:', error);
      
      return {
        message: error.message,
        path: error.path
      };
    }
  });
  
  await server.start();
  
  // Terapkan middleware Apollo pada Express
  server.applyMiddleware({ 
    app,
    path: '/graphql'
  });
  
  return server;
};

module.exports = { createApolloServer };
