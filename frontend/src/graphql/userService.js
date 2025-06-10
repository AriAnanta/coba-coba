import { gql } from "@apollo/client";

// Fragments
const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    username
    email
    role
    fullName
    status
    lastLogin
    createdAt
    updatedAt
  }
`;

const ROLE_FIELDS = gql`
  fragment RoleFields on Role {
    id
    name
    description
    permissions
    createdAt
    updatedAt
  }
`;

const PERMISSION_FIELDS = gql`
  fragment PermissionFields on Permission {
    id
    name
    description
    resource
    action
    createdAt
    updatedAt
  }
`;

// Auth Queries and Mutations
export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const REGISTER = gql`
  mutation Register(
    $username: String!
    $email: String!
    $password: String!
    $fullName: String!
  ) {
    register(
      username: $username
      email: $email
      password: $password
      fullName: $fullName
    ) {
      token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const VERIFY_TOKEN = gql`
  query VerifyToken {
    verifyToken {
      valid
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      success
      message
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;

// User Queries
export const GET_USERS = gql`
  query GetUsers($filter: UserFilterInput, $pagination: PaginationInput) {
    users(filter: $filter, pagination: $pagination) {
      items {
        ...UserFields
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${USER_FIELDS}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
      role
    }
  }
  ${USER_FIELDS}
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    currentUser {
      ...UserFields
      role
    }
  }
  ${USER_FIELDS}
`;

// Dashboard summary query
export const GET_USERS_SUMMARY = gql`
  query GetUsersSummary {
    usersSummary {
      total
      status {
        status
        count
        color
      }
      byRole {
        role
        count
      }
    }
  }
`;

// User Mutations
export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($id: ID!, $status: UserStatus!) {
    updateUserStatus(id: $id, status: $status) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($id: ID!, $fullName: String, $email: String) {
    updateUser(id: $id, fullName: $fullName, email: $email) {
      ...UserFields
    }
  }
  ${USER_FIELDS}
`;
