/**
 * Index file untuk GraphQL resolvers
 * 
 * Menggabungkan semua resolver untuk digunakan oleh Apollo Server
 */
const feedbackResolvers = require('./feedback.resolver');
const stepResolvers = require('./step.resolver');
const qualityResolvers = require('./quality.resolver');
const imageResolvers = require('./image.resolver');
const commentResolvers = require('./comment.resolver');
const notificationResolvers = require('./notification.resolver');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

// Resolver untuk tipe skalar khusus
const scalarResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Tipe data Date kustom',
    parseValue(value) {
      // Input dari variabel di query
      return new Date(value);
    },
    serialize(value) {
      // Output ke klien
      return value instanceof Date ? value.toISOString() : null;
    },
    parseLiteral(ast) {
      // Input dari hardcoded value di query
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    }
  }),
  
  JSON: new GraphQLScalarType({
    name: 'JSON',
    description: 'Tipe data JSON kustom',
    parseValue(value) {
      return typeof value === 'string' ? JSON.parse(value) : value;
    },
    serialize(value) {
      return typeof value === 'string' ? value : JSON.stringify(value);
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.STRING) {
        try {
          return JSON.parse(ast.value);
        } catch (e) {
          return ast.value;
        }
      }
      return null;
    }
  })
};

// Gabungkan semua resolver
const resolvers = {
  Query: {
    ...feedbackResolvers.Query,
    ...stepResolvers.Query,
    ...qualityResolvers.Query,
    ...imageResolvers.Query,
    ...commentResolvers.Query,
    ...notificationResolvers.Query
  },
  Mutation: {
    ...feedbackResolvers.Mutation,
    ...stepResolvers.Mutation,
    ...qualityResolvers.Mutation,
    ...imageResolvers.Mutation,
    ...commentResolvers.Mutation,
    ...notificationResolvers.Mutation
  },
  ProductionFeedback: feedbackResolvers.ProductionFeedback,
  ProductionStep: stepResolvers.ProductionStep,
  QualityCheck: qualityResolvers.QualityCheck,
  FeedbackImage: imageResolvers.FeedbackImage,
  FeedbackComment: commentResolvers.FeedbackComment,
  FeedbackNotification: notificationResolvers.FeedbackNotification,
  ...scalarResolvers
};

module.exports = resolvers;
