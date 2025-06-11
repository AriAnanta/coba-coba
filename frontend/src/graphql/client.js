import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  split,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { getMainDefinition } from "@apollo/client/utilities";
import { toast } from "react-toastify";

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      toast.error(`GraphQL Error: ${message}`);
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    toast.error(`Network Error: ${networkError.message}`);
  }
});

// Service endpoints
const endpoints = {
  userService: "http://localhost:5006/graphql",
  productionManagement: "http://localhost:5001/graphql",
  productionPlanning: "http://localhost:5002/graphql",
  machineQueue: "http://localhost:5003/graphql",
  materialInventory: "http://localhost:5004/graphql",
  productionFeedback: "http://localhost:5005/graphql",
};

// Create HTTP links for each service
const userServiceLink = new HttpLink({
  uri: endpoints.userService,
  credentials: "include",
});

const productionManagementLink = new HttpLink({
  uri: endpoints.productionManagement,
});

const productionPlanningLink = new HttpLink({
  uri: endpoints.productionPlanning,
});

const machineQueueLink = new HttpLink({
  uri: endpoints.machineQueue,
});

const materialInventoryLink = new HttpLink({
  uri: endpoints.materialInventory,
});

const productionFeedbackLink = new HttpLink({
  uri: endpoints.productionFeedback,
});

// Request middleware to add auth token to requests
const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token");
  if (token) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }));
  }
  return forward(operation);
});

// Custom link for routing operations to the correct microservice
const routerLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query);
  const operationName = definition.name?.value || "";

  let targetLink;

  // Define routing logic based on operation names
  if (
    [
      "GetMaterials",
      "GetMaterial",
      "GetMaterialById",
      "GetMaterialCategories",
      "GetMaterialTypes",
      "GetLowStockMaterials",
      "GetSuppliers",
      "GetSupplier",
      "GetSupplierById",
      "GetSupplierMaterials",
      "GetTransactions",
      "GetTransaction",
      "GetMaterialTransactionHistory",
      "GetStockReport",
      "GetSupplierPerformance",
      "CheckStock",
      "CreateMaterial",
      "UpdateMaterial",
      "DeleteMaterial",
      "CreateSupplier",
      "UpdateSupplier",
      "DeleteSupplier",
      "ReceiveMaterial",
      "IssueMaterial",
      "CreateStockAdjustment",
    ].includes(operationName)
  ) {
    targetLink = materialInventoryLink;
  } else if (
    [
      "Login",
      "Register",
      "VerifyToken",
      "ChangePassword",
      "RequestPasswordReset",
      "ResetPassword",
      "GetUsers",
      "GetUser",
      "GetCurrentUser",
      "GetUsersSummary",
      "CreateUser",
      "UpdateUser",
      "UpdateUserStatus",
      "UpdateProfile",
    ].includes(operationName)
  ) {
    targetLink = userServiceLink;
  } else if (operationName.startsWith("ProductionManagement")) {
    targetLink = productionManagementLink;
  } else if (
    [
      "GetPlans",
      "GetPlan",
      "GetCapacityPlans",
      "GetMaterialPlans",
      "GetCapacityPlan",
      "GetMaterialPlan",
      "GetPlansSummary",
      "CreatePlan",
      "UpdatePlan",
      "DeletePlan",
      "ApprovePlan",
      "AddCapacityPlan",
      "AddMaterialPlan",
      "UpdateCapacityPlan",
      "DeleteCapacityPlan",
      "UpdateMaterialPlan",
    ].includes(operationName)
  ) {
    targetLink = productionPlanningLink;
  } else if (
    [
      "GetMachineTypes",
      "GetMachines",
      "GetMachine",
      "GetQueues",
      "GetQueue",
      "CheckCapacity",
      "CreateMachine",
      "UpdateMachine",
      "DeleteMachine",
      "CreateQueue",
      "UpdateQueue",
      "DeleteQueue",
    ].includes(operationName) ||
    operationName.startsWith("MachineQueue")
  ) {
    targetLink = machineQueueLink;
  } else {
    // Default fallback to Production Feedback Service if no other service matches
    targetLink = productionFeedbackLink;
  }

  console.log(
    `Routing operation '${operationName}' to: ${targetLink.options.uri}`
  );
  return targetLink.request(operation, forward);
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([authMiddleware, errorLink, routerLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export const productionManagement = new ApolloClient({
  uri: "http://localhost:5001/graphql",
  cache: new InMemoryCache(),
});

export const productionFeedback = new ApolloClient({
  uri: "http://localhost:5005/graphql",
  cache: new InMemoryCache(),
});
