import { gql } from "@apollo/client";

// Fragments
const FEEDBACK_FIELDS = gql`
  fragment FeedbackFields on ProductionFeedback {
    id
    feedbackId
    batchId
    productName
    productionPlanId
    status
    plannedQuantity
    actualQuantity
    defectQuantity
    startDate
    endDate
    notes
    createdBy
    updatedBy
    createdAt
    updatedAt
  }
`;

const NOTIFICATION_FIELDS = gql`
  fragment NotificationFields on FeedbackNotification {
    id
    notificationId
    feedbackId
    type
    title
    message
    recipientType
    recipientId
    isRead
    isDelivered
    priority
    deliveryMethod
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_FEEDBACK = gql`
  query GetFeedback($id: ID!) {
    feedback(id: $id) {
      ...FeedbackFields
    }
  }
  ${FEEDBACK_FIELDS}
`;

export const GET_FEEDBACKS = gql`
  query GetFeedbacks(
    $filter: FeedbackFilterInput
    $pagination: PaginationInput
  ) {
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

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($recipientId: String!, $isRead: Boolean) {
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

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: FeedbackNotificationInput!) {
    createNotification(input: $input) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FIELDS}
`;

export const UPDATE_NOTIFICATION = gql`
  mutation UpdateNotification($id: ID!, $input: FeedbackNotificationInput!) {
    updateNotification(id: $id, input: $input) {
      ...NotificationFields
    }
  }
  ${NOTIFICATION_FIELDS}
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
