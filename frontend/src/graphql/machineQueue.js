import { gql } from '@apollo/client';

// Fragments
const MACHINE_FIELDS = gql`
  fragment MachineFields on Machine {
    id
    name
    type
    status
    capacity
    location
    lastMaintenance
    nextMaintenance
    notes
    createdAt
    updatedAt
  }
`;

const QUEUE_FIELDS = gql`
  fragment QueueFields on MachineQueue {
    id
    machineId
    batchId
    productionStepId
    priority
    status
    estimatedStartTime
    estimatedEndTime
    actualStartTime
    actualEndTime
    notes
    createdAt
    updatedAt
  }
`;

// Queries
export const GET_MACHINES = gql`
  query GetMachines($filter: MachineFilter) {
    machines(filter: $filter) {
      ...MachineFields
    }
  }
  ${MACHINE_FIELDS}
`;

export const GET_MACHINE = gql`
  query GetMachine($id: ID!) {
    machine(id: $id) {
      ...MachineFields
    }
  }
  ${MACHINE_FIELDS}
`;

export const GET_MACHINE_TYPES = gql`
  query GetMachineTypes {
    machineTypes
  }
`;

export const GET_QUEUES = gql`
  query GetQueues($filter: QueueFilter) {
    queues(filter: $filter) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;

export const GET_QUEUE = gql`
  query GetQueue($id: ID!) {
    queue(id: $id) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;

export const GET_MACHINE_QUEUES = gql`
  query GetMachineQueues($machineId: ID!) {
    machineQueues(machineId: $machineId) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;

export const GET_BATCH_QUEUES = gql`
  query GetBatchQueues($batchId: ID!) {
    batchQueues(batchId: $batchId) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;

export const CHECK_CAPACITY = gql`
  query CheckCapacity($machineType: String!, $startTime: Date!, $endTime: Date!) {
    checkCapacity(machineType: $machineType, startTime: $startTime, endTime: $endTime) {
      available
      totalCapacity
      usedCapacity
      availableCapacity
      machines {
        ...MachineFields
      }
    }
  }
  ${MACHINE_FIELDS}
`;

// Dashboard summary query
export const GET_MACHINES_SUMMARY = gql`
  query GetMachinesSummary {
    machinesSummary {
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
export const CREATE_MACHINE = gql`
  mutation CreateMachine($input: CreateMachineInput!) {
    createMachine(input: $input) {
      ...MachineFields
    }
  }
  ${MACHINE_FIELDS}
`;

export const UPDATE_MACHINE = gql`
  mutation UpdateMachine($id: ID!, $input: UpdateMachineInput!) {
    updateMachine(id: $id, input: $input) {
      ...MachineFields
    }
  }
  ${MACHINE_FIELDS}
`;

export const DELETE_MACHINE = gql`
  mutation DeleteMachine($id: ID!) {
    deleteMachine(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_QUEUE = gql`
  mutation CreateQueue($input: CreateQueueInput!) {
    createQueue(input: $input) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;

export const UPDATE_QUEUE = gql`
  mutation UpdateQueue($id: ID!, $input: UpdateQueueInput!) {
    updateQueue(id: $id, input: $input) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;

export const DELETE_QUEUE = gql`
  mutation DeleteQueue($id: ID!) {
    deleteQueue(id: $id) {
      success
      message
    }
  }
`;

export const CHANGE_QUEUE_PRIORITY = gql`
  mutation ChangeQueuePriority($id: ID!, $priority: QueuePriority!) {
    changeQueuePriority(id: $id, priority: $priority) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;

export const REORDER_QUEUE = gql`
  mutation ReorderQueue($machineId: ID!, $queueIds: [ID!]!) {
    reorderQueue(machineId: $machineId, queueIds: $queueIds) {
      success
      message
    }
  }
`;

export const START_QUEUE = gql`
  mutation StartQueue($id: ID!) {
    startQueue(id: $id) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;

export const COMPLETE_QUEUE = gql`
  mutation CompleteQueue($id: ID!) {
    completeQueue(id: $id) {
      ...QueueFields
    }
  }
  ${QUEUE_FIELDS}
`;