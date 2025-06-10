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

  # Tipe untuk status quantity stock
  enum QuantityStockStatus {
    received
    cancelled
    in_transit
    returned
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
    productName: String!
    quantity: Int!
    reorderPoint: Int
    status: QuantityStockStatus!
    createdAt: String!
    updatedAt: String!
    # Relasi dengan ProductionFeedback berdasarkan productName
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
    productName: String!
    quantity: Int!
    reorderPoint: Int
    status: QuantityStockStatus
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

  # Tipe untuk input filter quantity stock
  input QuantityStockFilterInput {
    status: QuantityStockStatus
    productName: String
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

  # Tipe untuk respons paginasi quantity stock
  type QuantityStockPaginationResponse {
    items: [QuantityStock]!
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
    getAllQuantityStocks(pagination: PaginationInput, filters: QuantityStockFilterInput): QuantityStockPaginationResponse
    getQuantityStocksByFeedbackId(feedbackId: String!): [QuantityStock]
    getQuantityStocksByProductName(productName: String!): [QuantityStock]
    getLowStockItems(threshold: Int): [QuantityStock]
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
    updateQuantityStock(id: ID!, quantity: Int!, reorderPoint: Int, status: QuantityStockStatus): QuantityStock
    deleteQuantityStock(id: ID!): GenericResponse
    updateQuantityStockStatus(id: ID!, status: QuantityStockStatus!): QuantityStock
    adjustQuantityStock(id: ID!, adjustmentQuantity: Int!, notes: String): QuantityStock
  }
`;

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
