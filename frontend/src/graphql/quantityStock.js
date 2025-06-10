import { gql } from "@apollo/client";

// Fragment untuk QuantityStock
export const QUANTITY_STOCK_FIELDS = gql`
  fragment QuantityStockFields on QuantityStock {
    id
    productName
    quantity
    reorderPoint
    status
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_QUANTITY_STOCK = gql`
  query GetQuantityStock($id: ID!) {
    getQuantityStockById(id: $id) {
      ...QuantityStockFields
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

export const GET_QUANTITY_STOCKS = gql`
  query GetQuantityStocks(
    $filters: QuantityStockFilterInput
    $pagination: PaginationInput
  ) {
    getAllQuantityStocks(filters: $filters, pagination: $pagination) {
      items {
        ...QuantityStockFields
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

export const GET_QUANTITY_STOCKS_BY_FEEDBACK_ID = gql`
  query GetQuantityStocksByFeedbackId($feedbackId: String!) {
    getQuantityStocksByFeedbackId(feedbackId: $feedbackId) {
      ...QuantityStockFields
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

export const GET_QUANTITY_STOCKS_BY_PRODUCT_NAME = gql`
  query GetQuantityStocksByProductName($productName: String!) {
    getQuantityStocksByProductName(productName: $productName) {
      ...QuantityStockFields
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

export const GET_LOW_STOCK_ITEMS = gql`
  query GetLowStockItems($threshold: Int) {
    getLowStockItems(threshold: $threshold) {
      ...QuantityStockFields
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

// Mutations
export const CREATE_QUANTITY_STOCK = gql`
  mutation CreateQuantityStock($input: QuantityStockInput!) {
    createQuantityStock(input: $input) {
      ...QuantityStockFields
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

export const UPDATE_QUANTITY_STOCK = gql`
  mutation UpdateQuantityStock($id: ID!, $quantity: Int!, $reorderPoint: Int, $status: QuantityStockStatus) {
    updateQuantityStock(id: $id, quantity: $quantity, reorderPoint: $reorderPoint, status: $status) {
      ...QuantityStockFields
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

export const UPDATE_QUANTITY_STOCK_STATUS = gql`
  mutation UpdateQuantityStockStatus($id: ID!, $status: QuantityStockStatus!) {
    updateQuantityStockStatus(id: $id, status: $status) {
      ...QuantityStockFields
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

export const ADJUST_QUANTITY_STOCK = gql`
  mutation AdjustQuantityStock($id: ID!, $adjustmentQuantity: Int!, $notes: String) {
    adjustQuantityStock(id: $id, adjustmentQuantity: $adjustmentQuantity, notes: $notes) {
      ...QuantityStockFields
    }
  }
  ${QUANTITY_STOCK_FIELDS}
`;

export const DELETE_QUANTITY_STOCK = gql`
  mutation DeleteQuantityStock($id: ID!) {
    deleteQuantityStock(id: $id) {
      success
      message
    }
  }
`;