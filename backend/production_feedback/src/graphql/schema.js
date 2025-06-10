/**
 * GraphQL Schema untuk Production Feedback Service
 * 
 * Mendefinisikan tipe, query, dan mutation untuk GraphQL API
 */
const { gql } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const resolvers = require('./resolvers');

const typeDefs = gql`
  # Tipe untuk status produksi
  enum ProductionStatus {
    pending
    in_production
    on_hold
    completed
    cancelled
    rejected
  }

  # Tipe untuk jenis notifikasi
  enum NotificationType {
    status_change
    quality_issue
    step_completion
    comment
    system
  }

  # Tipe untuk Production Feedback
  type ProductionFeedback {
    id: ID!
    feedbackId: String!
    batchId: String!
    orderId: String
    productId: String
    productName: String!
    productionPlanId: String
    status: ProductionStatus!
    plannedQuantity: Int!
    actualQuantity: Int
    defectQuantity: Int
    qualityScore: Float
    startDate: String
    endDate: String
    isMarketplaceUpdated: Boolean!
    marketplaceUpdateDate: String
    notes: String
    createdBy: String
    updatedBy: String
    createdAt: String!
    updatedAt: String!
    # Relasi dengan QuantityStock
    quantityStocks: [QuantityStock]
  }

  # Tipe untuk Quantity Stock
  type QuantityStock {
    id: ID!
    feedbackId: String!
    materialId: String!
    materialName: String!
    usedQuantity: Float!
    unit: String!
    notes: String
    createdBy: String
    updatedBy: String
    createdAt: String!
    updatedAt: String!
    # Relasi dengan ProductionFeedback
    feedback: ProductionFeedback
  }

  # Tipe untuk respons generik
  type GenericResponse {
    success: Boolean!
    message: String
    data: JSON
  }

  # Input untuk Production Feedback
  input ProductionFeedbackInput {
    batchId: String!
    orderId: String
    productId: String
    productName: String!
    productionPlanId: String
    status: ProductionStatus
    plannedQuantity: Int!
    actualQuantity: Int
    defectQuantity: Int
    startDate: String
    endDate: String
    notes: String
  }

  # Input untuk Quantity Stock
  input QuantityStockInput {
    feedbackId: String!
    materialId: String!
    materialName: String!
    usedQuantity: Float!
    unit: String!
    notes: String
  }



  # Tipe skalar kustom
  scalar Date
  scalar JSON

  # Tipe untuk input paginasi
  input PaginationInput {
    page: Int
    limit: Int
  }

  # Tipe untuk input filter
  input FeedbackFilterInput {
    status: ProductionStatus
    batchId: String
    productName: String
    startDate: String
    endDate: String
  }

  # Tipe untuk informasi halaman
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # Tipe untuk respons paginasi feedback
  type FeedbackPaginationResponse {
    items: [ProductionFeedback]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  # Query root
  type Query {
    # Feedback queries
    getFeedbackById(id: ID!): ProductionFeedback
    getFeedbackByFeedbackId(feedbackId: String!): ProductionFeedback
    getFeedbackByBatchId(batchId: String!): ProductionFeedback
    getAllFeedback(pagination: PaginationInput, filters: FeedbackFilterInput): FeedbackPaginationResponse

    # Quantity Stock queries
    getQuantityStockById(id: ID!): QuantityStock
    getQuantityStocksByFeedbackId(feedbackId: String!): [QuantityStock]
    getQuantityStocksByMaterialId(materialId: String!): [QuantityStock]
  }

  # Mutation root
  type Mutation {
    # Feedback mutations
    createFeedback(input: ProductionFeedbackInput!): ProductionFeedback
    updateFeedback(id: ID!, input: ProductionFeedbackInput!): ProductionFeedback
    updateFeedbackStatus(id: ID!, status: ProductionStatus!): ProductionFeedback
    updateFeedbackQuantities(id: ID!, actualQuantity: Int, defectQuantity: Int): ProductionFeedback
    deleteFeedback(id: ID!): GenericResponse
    sendMarketplaceUpdate(feedbackId: String!): GenericResponse

    # Quantity Stock mutations
    createQuantityStock(input: QuantityStockInput!): QuantityStock
    updateQuantityStock(id: ID!, usedQuantity: Float!, notes: String): QuantityStock
    deleteQuantityStock(id: ID!): GenericResponse
    createBatchQuantityStocks(stocks: [QuantityStockInput!]!): [QuantityStock]
  }


`;

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
