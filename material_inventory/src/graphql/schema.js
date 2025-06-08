/**
 * Schema GraphQL untuk Material Inventory Service
 *
 * Mendefinisikan tipe, query, dan mutation untuk layanan inventory material
 */
const { gql } = require("apollo-server-express");

const typeDefs = gql`
  # Tipe untuk Material
  type Material {
    id: ID!
    materialId: String!
    name: String!
    description: String
    category: String!
    type: String!
    unit: String!
    stockQuantity: Float!
    reorderLevel: Float
    price: Float
    leadTime: Int
    location: String
    supplierId: ID
    status: String!
    notes: String
    createdAt: String
    updatedAt: String
    supplierInfo: Supplier
    transactions: [MaterialTransaction]
  }

  # Tipe untuk Supplier (Pemasok)
  type Supplier {
    id: ID!
    supplierId: String!
    name: String!
    address: String
    city: String
    state: String
    postalCode: String
    country: String
    contactPerson: String
    phone: String
    email: String
    website: String
    paymentTerms: String
    leadTime: Int
    rating: Float
    status: String!
    notes: String
    createdAt: String
    updatedAt: String
    materials: [Material]
  }

  # Tipe untuk Transaksi Material
  type MaterialTransaction {
    id: ID!
    transactionId: String!
    type: String!
    materialId: ID!
    quantity: Float!
    unit: String!
    transactionDate: String!
    supplierId: ID
    referenceNumber: String
    unitPrice: Float
    totalPrice: Float
    notes: String
    createdBy: String
    createdAt: String
    updatedAt: String
    material: Material
    supplier: Supplier
  }

  # Tipe untuk Laporan Stok
  type StockReport {
    totalItems: Int!
    totalValue: Float
    lowStockItems: Int
    categories: [String]
    materials: [Material]
  }

  # Tipe untuk Laporan Supplier
  type SupplierPerformance {
    supplierId: ID!
    name: String!
    totalTransactions: Int
    totalValue: Float
    onTimeDelivery: Float
    qualityRating: Float
    materialCount: Int
  }

  # Tipe untuk Respons Generik
  type GenericResponse {
    success: Boolean!
    message: String
    id: ID
  }

  # Tipe untuk InputMaterial
  input MaterialInput {
    materialId: String
    name: String!
    description: String
    category: String!
    type: String!
    unit: String!
    stockQuantity: Float
    reorderLevel: Float
    price: Float
    leadTime: Int
    location: String
    supplierId: ID
    status: String
    notes: String
  }

  # Tipe untuk InputSupplier
  input SupplierInput {
    supplierId: String
    name: String!
    address: String
    city: String
    state: String
    postalCode: String
    country: String
    contactPerson: String
    phone: String
    email: String
    website: String
    paymentTerms: String
    leadTime: Int
    rating: Float
    status: String
    notes: String
  }

  # Tipe untuk InputTransaksi
  input TransactionInput {
    transactionId: String
    type: String!
    materialId: ID!
    quantity: Float!
    unit: String!
    transactionDate: String
    supplierId: ID
    referenceNumber: String
    unitPrice: Float
    totalPrice: Float
    notes: String
    createdBy: String
  }

  # Tipe untuk Cek Stok
  input StockCheckInput {
    materialId: ID!
    quantity: Float!
  }

  # Hasil cek stok
  type StockCheckResult {
    materialId: ID!
    name: String!
    available: Boolean!
    stockQuantity: Float!
    requestedQuantity: Float!
    difference: Float!
  }

  # Root Query
  type Query {
    # Query untuk Material
    materials(
      category: String
      type: String
      status: String
      supplierId: ID
      lowStock: Boolean
    ): [Material]

    material(id: ID!): Material
    materialById(materialId: String!): Material
    materialCategories: [String]
    materialTypes: [String]

    # Query untuk Supplier
    suppliers(status: String): [Supplier]
    supplier(id: ID!): Supplier
    supplierById(supplierId: String!): Supplier
    supplierMaterials(id: ID!): [Material]

    # Query untuk Transaksi
    transactions(
      type: String
      materialId: ID
      supplierId: ID
      startDate: String
      endDate: String
      limit: Int
    ): [MaterialTransaction]

    transaction(id: ID!): MaterialTransaction
    materialTransactionHistory(materialId: ID!): [MaterialTransaction]

    # Query untuk Laporan
    stockReport(category: String, lowStock: Boolean): StockReport
    supplierPerformance(supplierId: ID): [SupplierPerformance]

    # Fitur Pengecekan
    checkStock(input: [StockCheckInput!]!): [StockCheckResult]
  }

  # Root Mutation
  type Mutation {
    # Mutations untuk Material
    createMaterial(input: MaterialInput!): Material
    updateMaterial(id: ID!, input: MaterialInput!): Material
    deleteMaterial(id: ID!): GenericResponse

    # Mutations untuk Supplier
    createSupplier(input: SupplierInput!): Supplier
    updateSupplier(id: ID!, input: SupplierInput!): Supplier
    deleteSupplier(id: ID!): GenericResponse

    # Mutations untuk Transaksi
    receiveMaterial(input: TransactionInput!): MaterialTransaction
    issueMaterial(input: TransactionInput!): MaterialTransaction
    createStockAdjustment(input: TransactionInput!): MaterialTransaction
  }
`;

module.exports = typeDefs;
