import { gql } from "@apollo/client";

// Fragments
const PRODUCTION_PLAN_FIELDS = gql`
  fragment ProductionPlanFields on ProductionPlan {
    id
    planId
    requestId
    productionRequestId
    productName
    plannedStartDate
    plannedEndDate
    priority
    status
    plannedBatches
    planningNotes
    batchId
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_PLANS = gql`
  query GetPlans {
    plans {
      ...ProductionPlanFields
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;

export const GET_PLAN = gql`
  query GetPlan($id: ID!) {
    plan(id: $id) {
      ...ProductionPlanFields
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;

// Dashboard summary query
export const GET_PLANS_SUMMARY = gql`
  query GetPlansSummary {
    plansSummary {
      total
      status {
        status
        count
        color
      }
    }
  }
`;

// Mutations
export const CREATE_PLAN = gql`
  mutation CreatePlan($input: PlanInput!) {
    createPlan(input: $input) {
      ...ProductionPlanFields
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;

export const UPDATE_PLAN = gql`
  mutation UpdatePlan($id: ID!, $input: PlanUpdateInput!) {
    updatePlan(id: $id, input: $input) {
      ...ProductionPlanFields
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;

export const DELETE_PLAN = gql`
  mutation DeletePlan($id: ID!) {
    deletePlan(id: $id) {
      success
      message
    }
  }
`;

export const APPROVE_PLAN = gql`
  mutation ApprovePlan($id: ID!) {
    approvePlan(id: $id) {
      success
      message
      plan {
        ...ProductionPlanFields
      }
    }
  }
  ${PRODUCTION_PLAN_FIELDS}
`;
