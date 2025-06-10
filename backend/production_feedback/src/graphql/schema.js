/**
 * GraphQL Schema untuk Production Feedback Service
 *
 * Mendefinisikan tipe, query, dan mutation untuk GraphQL API
 */
const { gql } = require("graphql-tag");

const typeDefs = gql`
  scalar Date
  scalar JSON

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

  # Tipe untuk prioritas notifikasi
  enum NotificationPriority {
    low
    medium
    high
    critical
  }

  # Tipe untuk metode pengiriman notifikasi
  enum DeliveryMethod {
    in_app
    email
    both
  }

  # Tipe untuk Production Feedback
  type ProductionFeedback {
    id: ID!
    feedbackId: String!
    batchId: String!
    # orderId: String # Hapus atau komentari jika tidak digunakan
    # productId: String # Hapus atau komentari jika tidak digunakan
    productName: String!
    productionPlanId: String
    status: ProductionStatus!
    plannedQuantity: Int!
    actualQuantity: Int
    defectQuantity: Int
    # qualityScore: Float # Hapus atau komentari jika tidak digunakan
    startDate: String
    endDate: String
    # isMarketplaceUpdated: Boolean! # Hapus atau komentari jika tidak digunakan
    # marketplaceUpdateDate: String # Hapus atau komentari jika tidak digunakan
    notes: String
    createdBy: String
    updatedBy: String # Hapus atau komentari jika tidak digunakan
    createdAt: String!
    updatedAt: String!
    notifications: [FeedbackNotification]
  }

  # Tipe untuk Feedback Notification
  type FeedbackNotification {
    id: ID!
    notificationId: String!
    feedbackId: String!
    type: NotificationType!
    title: String!
    message: String!
    recipientType: String!
    recipientId: String!
    isRead: Boolean!
    isDelivered: Boolean!
    priority: NotificationPriority!
    deliveryMethod: DeliveryMethod!
    createdBy: String
    createdAt: String!
    updatedAt: String!
    feedback: ProductionFeedback
  }

  # Input untuk membuat/memperbarui Production Feedback
  input ProductionFeedbackInput {
    batchId: String
    # batchNumber: String # Hapus atau komentari jika tidak digunakan
    productName: String!
    productionPlanId: String
    status: ProductionStatus
    plannedQuantity: Int
    actualQuantity: Int
    defectQuantity: Int
    # qualityScore: Float # Hapus atau komentari jika tidak digunakan
    startDate: String
    endDate: String
    # isMarketplaceUpdated: Boolean # Hapus atau komentari jika tidak digunakan
    # marketplaceUpdateDate: String # Hapus atau komentari jika tidak digunakan
    notes: String
    # customerNotes: String # Hapus atau komentari jika tidak digunakan
  }

  # Input untuk memfilter Production Feedback
  input FeedbackFilterInput {
    status: ProductionStatus
    startDate: String
    endDate: String
    productName: String
    batchId: String
  }

  # Input untuk membuat/memperbarui Notifikasi Feedback
  input FeedbackNotificationInput {
    feedbackId: String!
    type: NotificationType
    title: String!
    message: String!
    recipientType: String!
    recipientId: String!
    priority: NotificationPriority
    deliveryMethod: DeliveryMethod
  }

  # Tipe untuk ringkasan Production Feedback
  type FeedbackSummary {
    total: Int
    status: [StatusCount]
    defectRate: Float
    onTimeRate: Float
  }

  type StatusCount {
    status: ProductionStatus
    count: Int
    color: String
  }

  # Pagination input
  input PaginationInput {
    limit: Int
    offset: Int
    page: Int
    pageSize: Int
  }

  # Pagination info
  type PageInfo {
    hasNextPage: Boolean
    hasPreviousPage: Boolean
  }

  # Tipe untuk hasil query feedback dengan pagination
  type FeedbacksResult {
    items: [ProductionFeedback]
    totalCount: Int
    pageInfo: PageInfo
  }

  # Tipe untuk Success/Error messages
  type MutationResponse {
    success: Boolean!
    message: String
    id: ID
    count: Int
  }

  # Query utama
  type Query {
    feedbacks(
      filter: FeedbackFilterInput
      pagination: PaginationInput
    ): FeedbacksResult
    feedback(id: ID!): ProductionFeedback
    notifications(recipientId: String!, isRead: Boolean): [FeedbackNotification]
    notification(id: ID!): FeedbackNotification
    feedbackSummary: FeedbackSummary
  }

  # Mutation utama
  type Mutation {
    createFeedback(input: ProductionFeedbackInput!): ProductionFeedback
    updateFeedback(id: ID!, input: ProductionFeedbackInput!): ProductionFeedback
    updateFeedbackStatus(id: ID!, status: ProductionStatus!): ProductionFeedback
    updateFeedbackQuantities(
      id: ID!
      actualQuantity: Int!
      defectQuantity: Int!
    ): ProductionFeedback
    deleteFeedback(id: ID!): MutationResponse
    createNotification(input: FeedbackNotificationInput!): FeedbackNotification
    updateNotification(
      id: ID!
      input: FeedbackNotificationInput!
    ): FeedbackNotification
    markNotificationAsRead(id: ID!): FeedbackNotification
    markMultipleNotificationsAsRead(ids: [ID!]!): MutationResponse
    deleteNotification(id: ID!): MutationResponse
  }
`;

module.exports = {
  typeDefs,
  resolvers: require("./resolvers"),
};
