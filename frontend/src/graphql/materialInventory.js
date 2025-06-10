import { gql } from "@apollo/client";

// Fragments
const MATERIAL_FIELDS = gql`
  fragment MaterialFields on Material {
    id
    materialId
    name
    description
    category
    type
    unit
    stockQuantity
    reorderLevel
    price
    leadTime
    location
    supplierId
    status
    notes
    createdAt
    updatedAt
  }
`;

const SUPPLIER_FIELDS = gql`
  fragment SupplierFields on Supplier {
    id
    name
    contactPerson
    email
    phone
    address
    status
    notes
    createdAt
    updatedAt
  }
`;

const TRANSACTION_FIELDS = gql`
  fragment TransactionFields on MaterialTransaction {
    id
    materialId
    materialName
    type
    quantity
    unitPrice
    totalPrice
    supplierId
    supplierName
    batchId
    requestId
    notes
    transactionDate
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_MATERIALS = gql`
  query GetMaterials {
    materials {
      ...MaterialFields
    }
  }
  ${MATERIAL_FIELDS}
`;

export const GET_MATERIAL = gql`
  query GetMaterial($id: ID!) {
    material(id: $id) {
      ...MaterialFields
    }
  }
  ${MATERIAL_FIELDS}
`;

export const GET_MATERIAL_TYPES = gql`
  query GetMaterialTypes {
    materialTypes
  }
`;

export const GET_LOW_STOCK_MATERIALS = gql`
  query GetLowStockMaterials {
    lowStockMaterials {
      ...MaterialFields
    }
  }
  ${MATERIAL_FIELDS}
`;

export const GET_SUPPLIERS = gql`
  query GetSuppliers($filter: SupplierFilter) {
    suppliers(filter: $filter) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FIELDS}
`;

export const GET_SUPPLIER = gql`
  query GetSupplier($id: ID!) {
    supplier(id: $id) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FIELDS}
`;

export const GET_MATERIAL_SUPPLIERS = gql`
  query GetMaterialSuppliers($materialId: ID!) {
    materialSuppliers(materialId: $materialId) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FIELDS}
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions($filter: TransactionFilter) {
    transactions(filter: $filter) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

export const GET_TRANSACTION = gql`
  query GetTransaction($id: ID!) {
    transaction(id: $id) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

export const GET_MATERIAL_TRANSACTIONS = gql`
  query GetMaterialTransactions($materialId: ID!) {
    materialTransactions(materialId: $materialId) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

export const GET_BATCH_TRANSACTIONS = gql`
  query GetBatchTransactions($batchId: ID!) {
    batchTransactions(batchId: $batchId) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

// Dashboard summary query
export const GET_MATERIALS_SUMMARY = gql`
  query GetMaterialsSummary {
    materialsSummary {
      total
      status {
        status
        count
        color
      }
      lowStock
      totalValue
    }
  }
`;

// Mutations
export const CREATE_MATERIAL = gql`
  mutation CreateMaterial($input: MaterialInput!) {
    createMaterial(input: $input) {
      ...MaterialFields
    }
  }
  ${MATERIAL_FIELDS}
`;

export const UPDATE_MATERIAL = gql`
  mutation UpdateMaterial($id: ID!, $input: MaterialUpdateInput!) {
    updateMaterial(id: $id, input: $input) {
      ...MaterialFields
    }
  }
  ${MATERIAL_FIELDS}
`;

export const DELETE_MATERIAL = gql`
  mutation DeleteMaterial($id: ID!) {
    deleteMaterial(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_SUPPLIER = gql`
  mutation CreateSupplier($input: SupplierInput!) {
    createSupplier(input: $input) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FIELDS}
`;

export const UPDATE_SUPPLIER = gql`
  mutation UpdateSupplier($id: ID!, $input: SupplierUpdateInput!) {
    updateSupplier(id: $id, input: $input) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FIELDS}
`;

export const DELETE_SUPPLIER = gql`
  mutation DeleteSupplier($id: ID!) {
    deleteSupplier(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: TransactionInput!) {
    createTransaction(input: $input) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

export const UPDATE_TRANSACTION = gql`
  mutation UpdateTransaction($id: ID!, $input: TransactionUpdateInput!) {
    updateTransaction(id: $id, input: $input) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FIELDS}
`;

export const DELETE_TRANSACTION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id) {
      success
      message
    }
  }
`;

export const ADJUST_STOCK = gql`
  mutation AdjustStock($materialId: ID!, $quantity: Float!, $notes: String) {
    adjustStock(materialId: $materialId, quantity: $quantity, notes: $notes) {
      ...MaterialFields
      transaction {
        ...TransactionFields
      }
    }
  }
  ${MATERIAL_FIELDS}
  ${TRANSACTION_FIELDS}
`;
