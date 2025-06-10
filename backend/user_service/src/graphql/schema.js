/**
 * GraphQL Schema for User Service
 */
const { buildSchema } = require("graphql");

// Define schema
const schema = buildSchema(`
  type User {
    id: ID!
    username: String!
    email: String!
    fullName: String!
    role: String!
    status: String!
    lastLogin: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthResponse {
    token: String!
    user: User!
  }

  type VerifyResponse {
    valid: Boolean!
    user: User
    message: String
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    currentUser: User
  }

  type Mutation {
    login(username: String!, password: String!): AuthResponse
    register(username: String!, email: String!, password: String!, fullName: String!, role: String): AuthResponse
    updateUser(id: ID!, username: String, email: String, password: String, fullName: String, role: String, status: String): User
    deleteUser(id: ID!): Boolean
    verifyToken(token: String!): VerifyResponse
  }
`);

module.exports = schema;
