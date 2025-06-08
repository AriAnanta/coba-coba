/**
 * GraphQL Schema untuk Production Feedback Service
 * 
 * Mendefinisikan tipe, query, dan mutation untuk GraphQL API
 */
const { gql } = require('apollo-server-express');

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

  # Tipe untuk status langkah produksi
  enum StepStatus {
    pending
    in_progress
    completed
    skipped
    failed
  }

  # Tipe untuk kategori mesin
  enum MachineCategory {
    cutting
    milling
    drilling
    turning
    grinding
    welding
    assembly
    inspection
    packaging
    other
  }

  # Tipe untuk hasil pemeriksaan kualitas
  enum QualityResult {
    pending
    pass
    fail
    conditional_pass
    needs_rework
  }

  # Tipe untuk jenis gambar
  enum ImageType {
    product
    machine
    defect
    material
    document
    other
  }

  # Tipe untuk jenis komentar
  enum CommentType {
    internal
    customer
    marketplace
    system
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
    steps: [ProductionStep]
    qualityChecks: [QualityCheck]
    images: [FeedbackImage]
    comments: [FeedbackComment]
    notifications: [FeedbackNotification]
  }

  # Tipe untuk Production Step
  type ProductionStep {
    id: ID!
    stepId: String!
    feedbackId: String!
    stepName: String!
    stepOrder: Int!
    machineId: String
    machineName: String
    machineCategory: MachineCategory
    operatorId: String
    operatorName: String
    status: StepStatus!
    startTime: String
    endTime: String
    duration: Int
    plannedQuantity: Int!
    actualQuantity: Int
    defectQuantity: Int
    notes: String
    createdAt: String!
    updatedAt: String!
    feedback: ProductionFeedback
    qualityChecks: [QualityCheck]
    images: [FeedbackImage]
  }

  # Tipe untuk Quality Check
  type QualityCheck {
    id: ID!
    checkId: String!
    feedbackId: String!
    stepId: String
    checkName: String!
    checkType: String!
    checkDate: String!
    inspectorId: String
    inspectorName: String
    result: QualityResult!
    measurements: String
    standardValue: String
    actualValue: String
    tolerance: String
    deviationPercentage: Float
    notes: String
    createdAt: String!
    updatedAt: String!
    feedback: ProductionFeedback
    step: ProductionStep
    images: [FeedbackImage]
  }

  # Tipe untuk Feedback Image
  type FeedbackImage {
    id: ID!
    imageId: String!
    feedbackId: String!
    stepId: String
    qualityCheckId: String
    imageType: ImageType!
    title: String!
    description: String
    filePath: String!
    fileUrl: String!
    fileType: String!
    fileSize: Int!
    uploadedBy: String
    uploadDate: String!
    isPublic: Boolean!
    createdAt: String!
    updatedAt: String!
    feedback: ProductionFeedback
    step: ProductionStep
    qualityCheck: QualityCheck
  }

  # Tipe untuk Feedback Comment
  type FeedbackComment {
    id: ID!
    commentId: String!
    feedbackId: String!
    commentType: CommentType!
    content: String!
    userId: String
    userName: String
    userRole: String
    isImportant: Boolean!
    parentCommentId: String
    isEdited: Boolean!
    isDeleted: Boolean!
    visibleToCustomer: Boolean!
    visibleToMarketplace: Boolean!
    createdAt: String!
    updatedAt: String!
    feedback: ProductionFeedback
    parentComment: FeedbackComment
    replies: [FeedbackComment]
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

  # Tipe untuk paginasi dan filter
  input PaginationInput {
    page: Int
    limit: Int
  }

  input FeedbackFilterInput {
    status: ProductionStatus
    startDate: String
    endDate: String
    batchId: String
    orderId: String
    productId: String
    productName: String
  }

  # Tipe respons untuk query dengan paginasi
  type PaginatedFeedback {
    totalItems: Int!
    totalPages: Int!
    currentPage: Int!
    items: [ProductionFeedback]!
  }

  # Tipe respons untuk production summary
  type ProductionSummary {
    totalBatches: Int!
    completedBatches: Int!
    inProductionBatches: Int!
    onHoldBatches: Int!
    cancelledBatches: Int!
    totalPlannedQuantity: Int!
    totalActualQuantity: Int!
    totalDefectQuantity: Int!
    averageQualityScore: Float!
    timeframe: String!
  }

  # Tipe untuk input ProductionFeedback
  input ProductionFeedbackInput {
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
    notes: String
  }

  # Tipe untuk input ProductionStep
  input ProductionStepInput {
    feedbackId: String!
    stepName: String!
    stepOrder: Int!
    machineId: String
    machineName: String
    machineCategory: MachineCategory
    operatorId: String
    operatorName: String
    status: StepStatus!
    startTime: String
    endTime: String
    plannedQuantity: Int!
    actualQuantity: Int
    defectQuantity: Int
    notes: String
  }

  # Tipe untuk input QualityCheck
  input QualityCheckInput {
    feedbackId: String!
    stepId: String
    checkName: String!
    checkType: String!
    checkDate: String!
    inspectorId: String
    inspectorName: String
    result: QualityResult!
    measurements: String
    standardValue: String
    actualValue: String
    tolerance: String
    deviationPercentage: Float
    notes: String
  }

  # Tipe untuk input FeedbackComment
  input FeedbackCommentInput {
    feedbackId: String!
    commentType: CommentType!
    content: String!
    isImportant: Boolean
    parentCommentId: String
    visibleToCustomer: Boolean
    visibleToMarketplace: Boolean
  }

  # Tipe untuk respons umum
  type GenericResponse {
    success: Boolean!
    message: String
    id: ID
  }

  # Query
  type Query {
    # Feedback queries
    getFeedbackById(id: ID!): ProductionFeedback
    getFeedbackByFeedbackId(feedbackId: String!): ProductionFeedback
    getFeedbackByBatchId(batchId: String!): ProductionFeedback
    getFeedbackByOrderId(orderId: String!): ProductionFeedback
    getAllFeedback(pagination: PaginationInput, filters: FeedbackFilterInput): PaginatedFeedback
    getProductionSummary(timeframe: String): ProductionSummary

    # Step queries
    getStepById(id: ID!): ProductionStep
    getStepByStepId(stepId: String!): ProductionStep
    getStepsByFeedbackId(feedbackId: String!): [ProductionStep]

    # Quality check queries
    getQualityCheckById(id: ID!): QualityCheck
    getQualityCheckByCheckId(checkId: String!): QualityCheck
    getQualityChecksByFeedbackId(feedbackId: String!): [QualityCheck]
    getQualityChecksByStepId(stepId: String!): [QualityCheck]
    getQualitySummary(feedbackId: String!): QualityCheck

    # Image queries
    getImageById(id: ID!): FeedbackImage
    getImageByImageId(imageId: String!): FeedbackImage
    getImagesByFeedbackId(feedbackId: String!): [FeedbackImage]
    getImagesByStepId(stepId: String!): [FeedbackImage]
    getImagesByQualityCheckId(qualityCheckId: String!): [FeedbackImage]
    getPublicImages(feedbackId: String!): [FeedbackImage]

    # Comment queries
    getCommentById(id: ID!): FeedbackComment
    getCommentsByFeedbackId(feedbackId: String!): [FeedbackComment]
    getCommentReplies(parentCommentId: String!): [FeedbackComment]
    getPublicComments(feedbackId: String!): [FeedbackComment]
    getCustomerComments(feedbackId: String!): [FeedbackComment]

    # Notification queries
    getNotificationById(notificationId: String!): FeedbackNotification
    getNotificationsByFeedbackId(feedbackId: String!): [FeedbackNotification]
    getNotificationsByRecipient(recipientType: String!, recipientId: String!): [FeedbackNotification]
    getUnreadNotificationCount(recipientType: String!, recipientId: String!): Int
  }

  # Mutation
  type Mutation {
    # Feedback mutations
    createFeedback(input: ProductionFeedbackInput!): ProductionFeedback
    updateFeedback(id: ID!, input: ProductionFeedbackInput!): ProductionFeedback
    updateFeedbackStatus(id: ID!, status: ProductionStatus!): ProductionFeedback
    updateFeedbackQuantities(id: ID!, actualQuantity: Int, defectQuantity: Int): ProductionFeedback
    deleteFeedback(id: ID!): GenericResponse
    sendMarketplaceUpdate(feedbackId: String!): GenericResponse

    # Step mutations
    createStep(input: ProductionStepInput!): ProductionStep
    createBatchSteps(steps: [ProductionStepInput!]!): [ProductionStep]
    updateStep(id: ID!, input: ProductionStepInput!): ProductionStep
    updateStepStatus(id: ID!, status: StepStatus!): ProductionStep
    updateStepTiming(id: ID!, startTime: String, endTime: String): ProductionStep
    deleteStep(id: ID!): GenericResponse

    # Quality check mutations
    createQualityCheck(input: QualityCheckInput!): QualityCheck
    createBatchQualityChecks(checks: [QualityCheckInput!]!): [QualityCheck]
    updateQualityCheck(id: ID!, input: QualityCheckInput!): QualityCheck
    updateQualityResult(id: ID!, result: QualityResult!, notes: String): QualityCheck
    deleteQualityCheck(id: ID!): GenericResponse

    # Comment mutations
    createComment(input: FeedbackCommentInput!): FeedbackComment
    updateComment(id: ID!, content: String!, isImportant: Boolean, visibleToCustomer: Boolean, visibleToMarketplace: Boolean): FeedbackComment
    deleteComment(id: ID!): GenericResponse

    # Notification mutations
    markNotificationAsRead(notificationId: String!): GenericResponse
    markMultipleNotificationsAsRead(notificationIds: [String!]!): GenericResponse
    sendEmailNotification(notificationId: String!): GenericResponse
    deleteNotification(notificationId: String!): GenericResponse
  }
`;

module.exports = typeDefs;
