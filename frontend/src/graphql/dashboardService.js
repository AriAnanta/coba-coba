import { gql } from '@apollo/client';

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalProductionRequests
      totalProductionBatches
      totalMaterials
      totalMachines
      totalUsers
    }
  }
`;

export const GET_PRODUCTION_REQUESTS_COUNT = gql`
  query GetProductionRequestsCount {
    productionRequestsCount {
      pending
      approved
      rejected
      cancelled
    }
  }
`;

export const GET_PRODUCTION_BATCHES_COUNT = gql`
  query GetProductionBatchesCount {
    productionBatchesCount {
      pending
      inProgress
      completed
      cancelled
    }
  }
`;

export const GET_LOW_STOCK_MATERIALS = gql`
  query GetLowStockMaterials {
    lowStockMaterials {
      id
      name
      currentStock
      minStockLevel
      unit
    }
  }
`;

export const GET_RECENT_MATERIAL_TRANSACTIONS = gql`
  query GetRecentMaterialTransactions {
    recentMaterialTransactions {
      id
      material {
        name
      }
      type
      quantity
      transactionDate
    }
  }
`;

export const GET_MACHINE_UTILIZATION = gql`
  query GetMachineUtilization {
    machineUtilization {
      machine {
        name
      }
      utilizationPercentage
    }
  }
`;