import { gql } from "@apollo/client";

// Fragments
const PRODUCTION_REQUEST_FIELDS = gql`
  fragment ProductionRequestFields on ProductionRequest {
    id
    productName
    quantity
    priority
    status
    createdAt
    updatedAt
  }
`;

const PRODUCTION_BATCH_FIELDS = gql`
  fragment ProductionBatchFields on ProductionBatch {
    id
    requestId
    batchNumber
    quantity
    status
    scheduledStartDate
    scheduledEndDate
    notes
    createdAt
    updatedAt
  }
`;

const PRODUCTION_STEP_FIELDS = gql`
  fragment ProductionStepFields on ProductionStep {
    id
    batchId
    stepName
    stepOrder
    status
    scheduledStartTime
    scheduledEndTime
    machineType
    notes
    createdAt
    updatedAt
  }
`;

const MATERIAL_ALLOCATION_FIELDS = gql`
  fragment MaterialAllocationFields on MaterialAllocation {
    id
    batchId
    materialId
    materialName
    quantityRequired
    quantityAllocated
    status
    notes
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_PRODUCTION_REQUESTS = gql`
  query GetProductionRequests {
    productionRequests {
      ...ProductionRequestFields
    }
  }
  ${PRODUCTION_REQUEST_FIELDS}
`;

export const GET_PRODUCTION_REQUEST = gql`
  query GetProductionRequest($id: ID!) {
    productionRequest(id: $id) {
      ...ProductionRequestFields
    }
  }
  ${PRODUCTION_REQUEST_FIELDS}
`;

export const GET_PRODUCTION_REQUESTS_BY_STATUS = gql`
  query GetProductionRequestsByStatus($status: RequestStatus!) {
    productionRequestsByStatus(status: $status) {
      ...ProductionRequestFields
    }
  }
  ${PRODUCTION_REQUEST_FIELDS}
`;

export const GET_PRODUCTION_BATCHES = gql`
  query GetProductionBatches {
    productionBatches {
      ...ProductionBatchFields
    }
  }
  ${PRODUCTION_BATCH_FIELDS}
`;

export const GET_PRODUCTION_BATCH = gql`
  query GetProductionBatch($id: ID!) {
    productionBatch(id: $id) {
      ...ProductionBatchFields
    }
  }
  ${PRODUCTION_BATCH_FIELDS}
`;

export const GET_PRODUCTION_BATCHES_BY_REQUEST = gql`
  query GetProductionBatchesByRequest($requestId: ID!) {
    productionBatchesByRequest(requestId: $requestId) {
      ...ProductionBatchFields
    }
  }
  ${PRODUCTION_BATCH_FIELDS}
`;

export const GET_PRODUCTION_BATCHES_BY_STATUS = gql`
  query GetProductionBatchesByStatus($status: BatchStatus!) {
    productionBatchesByStatus(status: $status) {
      ...ProductionBatchFields
    }
  }
  ${PRODUCTION_BATCH_FIELDS}
`;

export const GET_PRODUCTION_STEPS_BY_BATCH = gql`
  query GetProductionStepsByBatch($batchId: ID!) {
    productionStepsByBatch(batchId: $batchId) {
      ...ProductionStepFields
    }
  }
  ${PRODUCTION_STEP_FIELDS}
`;

export const GET_PRODUCTION_STEP = gql`
  query GetProductionStep($id: ID!) {
    productionStep(id: $id) {
      ...ProductionStepFields
    }
  }
  ${PRODUCTION_STEP_FIELDS}
`;

export const GET_MATERIAL_ALLOCATIONS_BY_BATCH = gql`
  query GetMaterialAllocationsByBatch($batchId: ID!) {
    materialAllocationsByBatch(batchId: $batchId) {
      ...MaterialAllocationFields
    }
  }
  ${MATERIAL_ALLOCATION_FIELDS}
`;

// Dashboard summary query
export const GET_PRODUCTION_REQUESTS_SUMMARY = gql`
  query GetProductionRequestsSummary {
    productionRequestsSummary {
      total
      status {
        status
        count
        color
      }
    }
  }
`;

export const GET_PENDING_BATCHES = gql`
  query GetPendingBatches {
    productionBatchesByStatus(status: pending) {
      id
      batchNumber
      quantity
      scheduledStartDate
      scheduledEndDate
      request {
        productName
        requestId
      }
    }
  }
`;

// Mutations
export const CREATE_PRODUCTION_REQUEST = gql`
  mutation CreateProductionRequest($input: ProductionRequestInput!) {
    createProductionRequest(input: $input) {
      ...ProductionRequestFields
    }
  }
  ${PRODUCTION_REQUEST_FIELDS}
`;

export const UPDATE_PRODUCTION_REQUEST = gql`
  mutation UpdateProductionRequest(
    $id: ID!
    $input: ProductionRequestUpdateInput!
  ) {
    updateProductionRequest(id: $id, input: $input) {
      ...ProductionRequestFields
    }
  }
  ${PRODUCTION_REQUEST_FIELDS}
`;

export const CANCEL_PRODUCTION_REQUEST = gql`
  mutation CancelProductionRequest($id: ID!) {
    cancelProductionRequest(id: $id) {
      ...ProductionRequestFields
    }
  }
  ${PRODUCTION_REQUEST_FIELDS}
`;

export const CREATE_PRODUCTION_BATCH = gql`
  mutation CreateProductionBatch($input: ProductionBatchInput!) {
    createProductionBatch(input: $input) {
      ...ProductionBatchFields
    }
  }
  ${PRODUCTION_BATCH_FIELDS}
`;

export const UPDATE_PRODUCTION_BATCH = gql`
  mutation UpdateProductionBatch(
    $id: ID!
    $input: ProductionBatchUpdateInput!
  ) {
    updateProductionBatch(id: $id, input: $input) {
      ...ProductionBatchFields
    }
  }
  ${PRODUCTION_BATCH_FIELDS}
`;

export const UPDATE_PRODUCTION_STEP = gql`
  mutation UpdateProductionStep($id: ID!, $input: ProductionStepUpdateInput!) {
    updateProductionStep(id: $id, input: $input) {
      ...ProductionStepFields
    }
  }
  ${PRODUCTION_STEP_FIELDS}
`;
