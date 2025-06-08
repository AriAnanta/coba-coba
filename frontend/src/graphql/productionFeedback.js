import { gql } from '@apollo/client';

// Fragments
const FEEDBACK_FIELDS = gql`
  fragment FeedbackFields on ProductionFeedback {
    id
    batchId
    batchNumber
    productName
    status
    plannedQuantity
    actualQuantity
    defectQuantity
    startDate
    endDate
    notes
    createdAt
    updatedAt
  }
`;

const STEP_FIELDS = gql`
  fragment StepFields on ProductionStep {
    id
    feedbackId
    stepName
    stepOrder
    status
    machineId
    machineName
    operatorId
    operatorName
    plannedStartTime
    plannedEndTime
    actualStartTime
    actualEndTime
    notes
    createdAt
    updatedAt
  }
`;

const QUALITY_CHECK_FIELDS = gql`
  fragment QualityCheckFields on QualityCheck {
    id
    feedbackId
    stepId
    checkName
    checkType
    result
    measuredValue
    expectedValue
    tolerance
    notes
    checkedBy
    checkedAt
    createdAt
    updatedAt
  }
`;

const IMAGE_FIELDS = gql`
  fragment ImageFields on FeedbackImage {
    id
    feedbackId
    stepId
    imageType
    imageUrl
    caption
    uploadedBy
    uploadedAt
    createdAt
    updatedAt
  }
`;

const COMMENT_FIELDS = gql`
  fragment CommentFields on FeedbackComment {
    id
    feedbackId
    stepId
    commentType
    content
    authorId
    authorName
    createdAt
    updatedAt
  }
`;

const NOTIFICATION_FIELDS = gql`
  fragment NotificationFields on FeedbackNotification {
    id
    feedbackId
    stepId
    notificationType
    priority
    title
    message
    isRead
    recipientId
    recipientName
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_FEEDBACK = gql`
  query GetFeedback($id: ID!) {
    feedback(id: $id) {
      ...FeedbackFields
      steps {
        ...StepFields
      }
      qualityChecks {
        ...QualityCheckFields
      }
      images {
        ...ImageFields
      }
      comments {
        ...CommentFields
      }
    }
  }
  ${FEEDBACK_FIELDS}
  ${STEP_FIELDS}
  ${QUALITY_CHECK_FIELDS}
  ${IMAGE_FIELDS}
  ${COMMENT_FIELDS}
`;

export const GET_FEEDBACKS = gql`
  query GetFeedbacks($filter: FeedbackFilterInput, $pagination: PaginationInput) {
    feedbacks(filter: $filter, pagination: $pagination) {
      items {
        ...FeedbackFields
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${FEEDBACK_FIELDS}
`;

export const GET_STEPS = gql`
  query GetSteps($feedbackId: ID!) {
    steps(feedbackId: $feedbackId) {
      ...StepFields
    }
  }
  ${STEP_FIELDS}
`;

export const GET_STEP = gql`
  query GetStep($id: ID!) {
    step(id: $id) {
      ...StepFields
      qualityChecks {
        ...QualityCheckFields
      }
      images {
        ...ImageFields
      }
      comments {
        ...CommentFields
      }
    }
  }
  ${STEP_FIELDS}
  ${QUALITY_CHECK_FIELDS}
  ${IMAGE_FIELDS}
  ${COMMENT_FIELDS}
`;

export const GET_QUALITY_CHECKS = gql`
  query GetQualityChecks($feedbackId: ID!, $stepId: ID) {
    qualityChecks(feedbackId: $feedbackId, stepId: $stepId) {
      ...QualityCheckFields
    }
  }
  ${QUALITY_CHECK_FIELDS}
`;

export const GET_QUALITY_CHECK = gql`
  query GetQualityCheck($id: ID!) {
    qualityCheck(id: $id) {
      ...QualityCheckFields
    }
  }
  ${QUALITY_CHECK_FIELDS}
`;

export const GET_IMAGES = gql`
  query GetImages($feedbackId: ID!, $stepId: ID, $imageType: ImageType) {
    images(feedbackId: $feedbackId, stepId: $stepId, imageType: $imageType) {
      ...ImageFields
    }
  }
  ${IMAGE_FIELDS}
`;

export const GET_COMMENTS = gql`
  query GetComments($feedbackId: ID!, $stepId: ID, $commentType: CommentType) {
    comments(feedbackId: $feedbackId, stepId: $stepId, commentType: $commentType) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($recipientId: ID!, $isRead: Boolean) {
    notifications(recipientId: $recipientId, isRead: $isRead) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FIELDS}
`;

export const GET_PRODUCTION_SUMMARY = gql`
  query GetProductionSummary($startDate: String, $endDate: String) {
    productionSummary(startDate: $startDate, endDate: $endDate) {
      totalBatches
      completedBatches
      inProgressBatches
      delayedBatches
      totalPlannedQuantity
      totalActualQuantity
      totalDefectQuantity
      defectRate
      onTimeDeliveryRate
      averageCycleTime
    }
  }
`;

// Dashboard summary query
export const GET_FEEDBACK_SUMMARY = gql`
  query GetFeedbackSummary {
    feedbackSummary {
      total
      status {
        status
        count
        color
      }
      defectRate
      onTimeRate
    }
  }
`;

// Mutations
export const CREATE_FEEDBACK = gql`
  mutation CreateFeedback($input: ProductionFeedbackInput!) {
    createFeedback(input: $input) {
      ...FeedbackFields
    }
  }
  ${FEEDBACK_FIELDS}
`;

export const UPDATE_FEEDBACK = gql`
  mutation UpdateFeedback($id: ID!, $input: ProductionFeedbackInput!) {
    updateFeedback(id: $id, input: $input) {
      ...FeedbackFields
    }
  }
  ${FEEDBACK_FIELDS}
`;

export const UPDATE_FEEDBACK_STATUS = gql`
  mutation UpdateFeedbackStatus($id: ID!, $status: ProductionStatus!) {
    updateFeedbackStatus(id: $id, status: $status) {
      ...FeedbackFields
    }
  }
  ${FEEDBACK_FIELDS}
`;

export const UPDATE_FEEDBACK_QUANTITIES = gql`
  mutation UpdateFeedbackQuantities(
    $id: ID!
    $actualQuantity: Int!
    $defectQuantity: Int!
  ) {
    updateFeedbackQuantities(
      id: $id
      actualQuantity: $actualQuantity
      defectQuantity: $defectQuantity
    ) {
      ...FeedbackFields
    }
  }
  ${FEEDBACK_FIELDS}
`;

export const DELETE_FEEDBACK = gql`
  mutation DeleteFeedback($id: ID!) {
    deleteFeedback(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_STEP = gql`
  mutation CreateStep($feedbackId: ID!, $input: ProductionStepInput!) {
    createStep(feedbackId: $feedbackId, input: $input) {
      ...StepFields
    }
  }
  ${STEP_FIELDS}
`;

export const CREATE_BATCH_STEPS = gql`
  mutation CreateBatchSteps($feedbackId: ID!, $inputs: [ProductionStepInput!]!) {
    createBatchSteps(feedbackId: $feedbackId, inputs: $inputs) {
      success
      message
      steps {
        ...StepFields
      }
    }
  }
  ${STEP_FIELDS}
`;

export const UPDATE_STEP = gql`
  mutation UpdateStep($id: ID!, $input: ProductionStepInput!) {
    updateStep(id: $id, input: $input) {
      ...StepFields
    }
  }
  ${STEP_FIELDS}
`;

export const UPDATE_STEP_STATUS = gql`
  mutation UpdateStepStatus($id: ID!, $status: StepStatus!) {
    updateStepStatus(id: $id, status: $status) {
      ...StepFields
    }
  }
  ${STEP_FIELDS}
`;

export const UPDATE_STEP_TIMING = gql`
  mutation UpdateStepTiming(
    $id: ID!
    $actualStartTime: String
    $actualEndTime: String
  ) {
    updateStepTiming(
      id: $id
      actualStartTime: $actualStartTime
      actualEndTime: $actualEndTime
    ) {
      ...StepFields
    }
  }
  ${STEP_FIELDS}
`;

export const DELETE_STEP = gql`
  mutation DeleteStep($id: ID!) {
    deleteStep(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_QUALITY_CHECK = gql`
  mutation CreateQualityCheck(
    $feedbackId: ID!
    $stepId: ID
    $input: QualityCheckInput!
  ) {
    createQualityCheck(feedbackId: $feedbackId, stepId: $stepId, input: $input) {
      ...QualityCheckFields
    }
  }
  ${QUALITY_CHECK_FIELDS}
`;

export const CREATE_BATCH_QUALITY_CHECKS = gql`
  mutation CreateBatchQualityChecks(
    $feedbackId: ID!
    $stepId: ID
    $inputs: [QualityCheckInput!]!
  ) {
    createBatchQualityChecks(feedbackId: $feedbackId, stepId: $stepId, inputs: $inputs) {
      success
      message
      qualityChecks {
        ...QualityCheckFields
      }
    }
  }
  ${QUALITY_CHECK_FIELDS}
`;

export const UPDATE_QUALITY_CHECK = gql`
  mutation UpdateQualityCheck($id: ID!, $input: QualityCheckInput!) {
    updateQualityCheck(id: $id, input: $input) {
      ...QualityCheckFields
    }
  }
  ${QUALITY_CHECK_FIELDS}
`;

export const UPDATE_QUALITY_CHECK_RESULT = gql`
  mutation UpdateQualityCheckResult(
    $id: ID!
    $result: QualityResult!
    $measuredValue: Float
    $notes: String
  ) {
    updateQualityCheckResult(
      id: $id
      result: $result
      measuredValue: $measuredValue
      notes: $notes
    ) {
      ...QualityCheckFields
    }
  }
  ${QUALITY_CHECK_FIELDS}
`;

export const DELETE_QUALITY_CHECK = gql`
  mutation DeleteQualityCheck($id: ID!) {
    deleteQualityCheck(id: $id) {
      success
      message
    }
  }
`;

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($feedbackId: ID!, $stepId: ID, $file: Upload!, $caption: String, $imageType: ImageType!) {
    uploadImage(feedbackId: $feedbackId, stepId: $stepId, file: $file, caption: $caption, imageType: $imageType) {
      ...ImageFields
    }
  }
  ${IMAGE_FIELDS}
`;

export const DELETE_IMAGE = gql`
  mutation DeleteImage($id: ID!) {
    deleteImage(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment(
    $feedbackId: ID!
    $stepId: ID
    $input: FeedbackCommentInput!
  ) {
    createComment(feedbackId: $feedbackId, stepId: $stepId, input: $input) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
      ...CommentFields
    }
  }
  ${COMMENT_FIELDS}
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id) {
      success
      message
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FIELDS}
`;

export const MARK_MULTIPLE_NOTIFICATIONS_AS_READ = gql`
  mutation MarkMultipleNotificationsAsRead($ids: [ID!]!) {
    markMultipleNotificationsAsRead(ids: $ids) {
      success
      message
      count
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      success
      message
    }
  }
`;