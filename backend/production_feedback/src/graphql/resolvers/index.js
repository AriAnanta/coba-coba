/**
 * Kumpulan resolver untuk GraphQL API
 * 
 * File ini mengimpor dan menggabungkan semua resolver
 */
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const feedbackResolvers = require('./feedback.resolver');
const quantityStockResolvers = require('./quantity-stock.resolver');

// Resolver untuk tipe skalar Date
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString(); // Convert outgoing Date to ISO string for JSON
    }
    return value;
  },
  parseValue(value) {
    return new Date(value); // Convert incoming value to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value); // Convert hard-coded AST string to Date
    }
    if (ast.kind === Kind.INT) {
      return new Date(parseInt(ast.value, 10)); // Convert hard-coded AST integer to Date
    }
    return null; // Invalid hard-coded value
  },
});

// Resolver untuk tipe skalar JSON
const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value) {
    return value; // Return the value as is
  },
  parseValue(value) {
    return value; // Return the value as is
  },
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
        try {
          return JSON.parse(ast.value);
        } catch (e) {
          return ast.value;
        }
      case Kind.OBJECT:
        return ast.fields.reduce((obj, field) => {
          obj[field.name.value] = field.value.value;
          return obj;
        }, {});
      default:
        return null;
    }
  },
});

// Gabungkan semua resolver
const resolvers = {
  Date: dateScalar,
  JSON: jsonScalar,
  
  // Gabungkan Query dari semua resolver
  Query: {
    ...feedbackResolvers.Query,
    ...quantityStockResolvers.Query,
  },
  
  // Gabungkan Mutation dari semua resolver
  Mutation: {
    ...feedbackResolvers.Mutation,
    ...quantityStockResolvers.Mutation,
  },
  
  // Gabungkan tipe dari semua resolver
  ProductionFeedback: feedbackResolvers.ProductionFeedback,
  QuantityStock: quantityStockResolvers.QuantityStock,
};

module.exports = resolvers;
