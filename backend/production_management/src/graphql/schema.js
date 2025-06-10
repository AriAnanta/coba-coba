/**
 * GraphQL Schema for Production Management Service
 *
 * Defines types, queries, and mutations for production management functionality
 */
const { buildSchema } = require("graphql");
const {
  ProductionRequest,
  ProductionBatch,
  ProductionStep,
  MaterialAllocation,
} = require("../models");
const axios = require("axios");

// Define GraphQL schema
const schema = buildSchema(`
  # Enum types
  enum RequestStatus {
    received
    planned
    in_production
    completed
    cancelled
  }

  enum BatchStatus {
    pending
    scheduled
    in_progress
    completed
    cancelled
  }

  enum StepStatus {
    pending
    scheduled
    in_progress
    completed
    cancelled
  }

  enum MaterialStatus {
    pending
    partial
    allocated
    consumed
  }

  enum Priority {
    low
    normal
    high
    urgent
  }

  # Object types
  type ProductionRequest {
    id: ID!
    requestId: String!
    productName: String!
    quantity: Int!
    priority: Priority!
    status: RequestStatus!
    batches: [ProductionBatch]
    createdAt: String!
    updatedAt: String!
  }

  type ProductionBatch {
    id: ID!
    batchNumber: String!
    requestId: Int!
    scheduledStartDate: String
    scheduledEndDate: String
    quantity: Int!
    status: BatchStatus!
    materialsAssigned: Boolean!
    machineAssigned: Boolean!
    notes: String
    request: ProductionRequest
    steps: [ProductionStep]
    materialAllocations: [MaterialAllocation]
    createdAt: String!
    updatedAt: String!
  }

  type ProductionStep {
    id: ID!
    batchId: Int!
    stepName: String!
    stepOrder: Int!
    machineType: String
    scheduledStartTime: String
    scheduledEndTime: String
    machineId: Int
    operatorId: Int
    status: StepStatus!
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  type MaterialAllocation {
    id: ID!
    batchId: Int!
    materialId: Int!
    quantityRequired: Float!
    quantityAllocated: Float!
    unitOfMeasure: String!
    status: MaterialStatus!
    allocationDate: String
    notes: String
    createdAt: String!
    updatedAt: String!
  }

  # Input types
  input ProductionRequestInput {
    requestId: String!
    productName: String!
    quantity: Int!
    priority: Priority!
  }

  input ProductionRequestUpdateInput {
    productName: String
    quantity: Int
    priority: Priority
    status: RequestStatus
  }

  input ProductionStepInput {
    stepName: String!
    machineType: String
    scheduledStartTime: String
    scheduledEndTime: String
  }

  input MaterialInput {
    materialId: Int!
    quantityRequired: Float!
    unitOfMeasure: String!
  }

  input ProductionBatchInput {
    requestId: Int!
    quantity: Int!
    scheduledStartDate: String
    scheduledEndDate: String
    notes: String
    steps: [ProductionStepInput]
    materials: [MaterialInput]
  }

  input ProductionBatchUpdateInput {
    scheduledStartDate: String
    scheduledEndDate: String
    status: BatchStatus
    notes: String
  }

  input ProductionStepUpdateInput {
    machineId: Int
    operatorId: Int
    status: StepStatus
    notes: String
  }

  # Root Query
  type Query {
    # Production Request Queries
    productionRequests: [ProductionRequest]
    productionRequest(id: ID!): ProductionRequest
    productionRequestsByStatus(status: RequestStatus!): [ProductionRequest]
    
    # Production Batch Queries
    productionBatches: [ProductionBatch]
    productionBatch(id: ID!): ProductionBatch
    productionBatchesByRequest(requestId: ID!): [ProductionBatch]
    productionBatchesByStatus(status: BatchStatus!): [ProductionBatch]
    
    # Production Step Queries
    productionStepsByBatch(batchId: ID!): [ProductionStep]
    productionStep(id: ID!): ProductionStep
    
    # Material Allocation Queries
    materialAllocationsByBatch(batchId: ID!): [MaterialAllocation]
  }

  # Root Mutation
  type Mutation {
    # Production Request Mutations
    createProductionRequest(input: ProductionRequestInput!): ProductionRequest
    updateProductionRequest(id: ID!, input: ProductionRequestUpdateInput!): ProductionRequest
    cancelProductionRequest(id: ID!): ProductionRequest
    
    # Production Batch Mutations
    createProductionBatch(input: ProductionBatchInput!): ProductionBatch
    updateProductionBatch(id: ID!, input: ProductionBatchUpdateInput!): ProductionBatch
    
    # Production Step Mutations
    updateProductionStep(id: ID!, input: ProductionStepUpdateInput!): ProductionStep
  }
`);

// Root resolver
const root = {
  // Production Request Queries
  productionRequests: async () => {
    try {
      const requests = await ProductionRequest.findAll({
        order: [["createdAt", "DESC"]],
      });
      return requests;
    } catch (error) {
      console.error("GraphQL Error - productionRequests:", error);
      throw new Error("Failed to fetch production requests");
    }
  },

  productionRequest: async ({ id }) => {
    try {
      console.log(
        "Resolver productionRequest dipanggil. ID diterima:",
        id,
        "Tipe:",
        typeof id
      );
      // Pastikan id adalah integer sebelum digunakan dengan findByPk
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        throw new Error("ID permintaan produksi tidak valid.");
      }

      const request = await ProductionRequest.findByPk(numericId, {
        include: [
          {
            model: ProductionBatch,
            as: "batches",
          },
        ],
      });

      if (!request) {
        throw new Error("Production request not found");
      }

      return request;
    } catch (error) {
      console.error("GraphQL Error - productionRequest:", error);
      throw new Error("Gagal mengambil detail permintaan produksi");
    }
  },

  productionRequestsByStatus: async ({ status }) => {
    try {
      const requests = await ProductionRequest.findAll({
        where: { status },
        order: [["createdAt", "DESC"]],
      });
      return requests;
    } catch (error) {
      console.error(
        `GraphQL Error - productionRequestsByStatus(${status}):`,
        error
      );
      throw new Error(
        `Failed to fetch production requests by status: ${status}`
      );
    }
  },

  // Production Batch Queries
  productionBatches: async () => {
    try {
      const batches = await ProductionBatch.findAll({
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: ProductionRequest,
            as: "request",
          },
        ],
      });
      return batches;
    } catch (error) {
      console.error("GraphQL Error - productionBatches:", error);
      throw new Error("Failed to fetch production batches");
    }
  },

  productionBatch: async ({ id }) => {
    try {
      const batch = await ProductionBatch.findByPk(id, {
        include: [
          {
            model: ProductionRequest,
            as: "request",
          },
          {
            model: ProductionStep,
            as: "steps",
            order: [["stepOrder", "ASC"]],
          },
          {
            model: MaterialAllocation,
            as: "materialAllocations",
            attributes: [
              "id",
              ["batch_id", "batchId"],
              "materialId",
              "quantityRequired",
              "quantityAllocated",
              "unitOfMeasure",
              "status",
              "allocationDate",
              "notes",
              "createdAt",
              "updatedAt",
            ],
          },
        ],
      });

      if (!batch) {
        throw new Error("Production batch not found");
      }

      return batch;
    } catch (error) {
      console.error(`GraphQL Error - productionBatch(${id}):`, error);
      throw error;
    }
  },

  productionBatchesByRequest: async ({ requestId }) => {
    try {
      const batches = await ProductionBatch.findAll({
        where: { requestId },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: ProductionStep,
            as: "steps",
            order: [["stepOrder", "ASC"]],
          },
        ],
      });
      return batches;
    } catch (error) {
      console.error(
        `GraphQL Error - productionBatchesByRequest(${requestId}):`,
        error
      );
      throw new Error(
        `Failed to fetch production batches for request: ${requestId}`
      );
    }
  },

  productionBatchesByStatus: async ({ status }) => {
    try {
      const batches = await ProductionBatch.findAll({
        where: { status: status.toLowerCase() },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: ProductionRequest,
            as: "request",
          },
        ],
      });
      return batches;
    } catch (error) {
      console.error(
        `GraphQL Error - productionBatchesByStatus(${status}):`,
        error
      );
      throw new Error(
        `Failed to fetch production batches by status: ${status}`
      );
    }
  },

  // Production Step Queries
  productionStepsByBatch: async ({ batchId }) => {
    try {
      const steps = await ProductionStep.findAll({
        where: { batchId },
        order: [["stepOrder", "ASC"]],
      });
      return steps;
    } catch (error) {
      console.error(
        `GraphQL Error - productionStepsByBatch(${batchId}):`,
        error
      );
      throw new Error(`Failed to fetch production steps for batch: ${batchId}`);
    }
  },

  productionStep: async ({ id }) => {
    try {
      const step = await ProductionStep.findByPk(id);

      if (!step) {
        throw new Error("Production step not found");
      }

      return step;
    } catch (error) {
      console.error(`GraphQL Error - productionStep(${id}):`, error);
      throw error;
    }
  },

  // Material Allocation Queries
  materialAllocationsByBatch: async ({ batchId }) => {
    try {
      const allocations = await MaterialAllocation.findAll({
        where: { batchId },
        order: [["createdAt", "ASC"]],
      });
      return allocations;
    } catch (error) {
      console.error(
        `GraphQL Error - materialAllocationsByBatch(${batchId}):`,
        error
      );
      throw new Error(
        `Failed to fetch material allocations for batch: ${batchId}`
      );
    }
  },

  // Production Request Mutations
  createProductionRequest: async ({ input }, context) => {
    try {
      // Check if user is authenticated
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const newRequest = await ProductionRequest.create({
        requestId: input.requestId,
        productName: input.productName,
        quantity: input.quantity,
        priority: input.priority,
        status: "received",
      });

      // Notify the Production Planning Service about the new request
      try {
        await axios.post(
          `${process.env.PLANNING_SERVICE_URL}/api/planning/notify`,
          {
            requestId: newRequest.id,
            priority: newRequest.priority,
          }
        );
      } catch (error) {
        console.error("Failed to notify Planning Service:", error.message);
        // Continue execution even if notification fails
      }

      return newRequest;
    } catch (error) {
      console.error("GraphQL Error - createProductionRequest:", error);
      throw error;
    }
  },

  updateProductionRequest: async ({ id, input }, context) => {
    try {
      // Check if user is authenticated
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const request = await ProductionRequest.findByPk(id);

      if (!request) {
        throw new Error("Production request not found");
      }

      // Update request
      await request.update({
        ...(input.productName && { productName: input.productName }),
        ...(input.quantity && { quantity: input.quantity }),
        ...(input.priority && { priority: input.priority }),
        ...(input.status && { status: input.status }),
      });

      // If status or priority changed, notify the Planning Service
      if (input.priority || input.status) {
        try {
          await axios.post(
            `${process.env.PLANNING_SERVICE_URL}/api/planning/update`,
            {
              requestId: request.id,
              priority: request.priority,
              status: request.status,
            }
          );
        } catch (error) {
          console.error(
            "Failed to notify Planning Service of update:",
            error.message
          );
          // Continue execution even if notification fails
        }
      }

      return request;
    } catch (error) {
      console.error(`GraphQL Error - updateProductionRequest(${id}):`, error);
      throw error;
    }
  },

  cancelProductionRequest: async ({ id }, context) => {
    try {
      // Check if user is authenticated
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const request = await ProductionRequest.findByPk(id, {
        include: [
          {
            model: ProductionBatch,
            as: "batches",
          },
        ],
      });

      if (!request) {
        throw new Error("Production request not found");
      }

      // Update request status
      await request.update({ status: "cancelled" });

      // Update associated batches
      if (request.batches && request.batches.length > 0) {
        for (const batch of request.batches) {
          await batch.update({ status: "cancelled" });

          // Notify the Machine Queue Service
          try {
            await axios.post(
              `${process.env.MACHINE_QUEUE_URL}/api/queue/cancel`,
              {
                batchId: batch.id,
              }
            );
          } catch (error) {
            console.error(
              "Failed to notify Machine Queue Service:",
              error.message
            );
            // Continue execution even if notification fails
          }
        }
      }

      // Notify the Production Feedback Service
      try {
        await axios.post(
          `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
          {
            requestId: request.requestId,
            status: "cancelled",
            notes: "Request cancelled by user",
          }
        );
      } catch (error) {
        console.error("Failed to notify Feedback Service:", error.message);
        // Continue execution even if notification fails
      }

      return request;
    } catch (error) {
      console.error(`GraphQL Error - cancelProductionRequest(${id}):`, error);
      throw error;
    }
  },

  // Production Batch Mutations
  createProductionBatch: async ({ input }, context) => {
    try {
      // Check if user is authenticated
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      // Find the production request
      const request = await ProductionRequest.findByPk(input.requestId);

      if (!request) {
        throw new Error("Production request not found");
      }

      // Generate batch number
      const batchNumber = `B${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Create the production batch
      const newBatch = await ProductionBatch.create({
        batchNumber,
        requestId: input.requestId,
        quantity: input.quantity,
        scheduledStartDate: input.scheduledStartDate,
        scheduledEndDate: input.scheduledEndDate,
        notes: input.notes,
        status: "pending",
      });

      // Create production steps if provided
      if (input.steps && input.steps.length > 0) {
        for (let i = 0; i < input.steps.length; i++) {
          const step = input.steps[i];
          await ProductionStep.create({
            batchId: newBatch.id,
            stepName: step.stepName,
            stepOrder: i + 1,
            machineType: step.machineType,
            scheduledStartTime: step.scheduledStartTime,
            scheduledEndTime: step.scheduledEndTime,
            status: "pending",
          });
        }
      }

      // Create material allocations if provided
      if (input.materials && input.materials.length > 0) {
        for (const material of input.materials) {
          await MaterialAllocation.create({
            batchId: newBatch.id,
            materialId: material.materialId,
            quantityRequired: material.quantityRequired,
            unitOfMeasure: material.unitOfMeasure,
            status: "pending",
          });
        }
      }

      // Update the request status to 'planned'
      await request.update({ status: "planned" });

      // Notify the Material Inventory Service
      try {
        if (input.materials && input.materials.length > 0) {
          await axios.post(
            `${process.env.MATERIAL_INVENTORY_URL}/api/inventory/reserve`,
            {
              batchId: newBatch.id,
              materials: input.materials,
            }
          );
        }
      } catch (error) {
        console.error(
          "Failed to notify Material Inventory Service:",
          error.message
        );
        // Continue execution even if notification fails
      }

      // Notify the Machine Queue Service
      try {
        if (input.steps && input.steps.length > 0) {
          await axios.post(`${process.env.MACHINE_QUEUE_URL}/api/queue/add`, {
            batchId: newBatch.id,
            batchNumber: newBatch.batchNumber,
            requestId: request.requestId,
            productName: request.productName,
            priority: request.priority,
            steps: input.steps.map((s, i) => ({
              stepId: i + 1,
              stepName: s.stepName,
              machineType: s.machineType,
              scheduledStartTime: s.scheduledStartTime,
              scheduledEndTime: s.scheduledEndTime,
            })),
          });
        }
      } catch (error) {
        console.error("Failed to notify Machine Queue Service:", error.message);
        // Continue execution even if notification fails
      }

      // Return the created batch with associations
      return await ProductionBatch.findByPk(newBatch.id, {
        include: [
          {
            model: ProductionRequest,
            as: "request",
          },
          {
            model: ProductionStep,
            as: "steps",
            order: [["stepOrder", "ASC"]],
          },
          {
            model: MaterialAllocation,
            as: "materialAllocations",
            attributes: [
              "id",
              ["batch_id", "batchId"],
              "materialId",
              "quantityRequired",
              "quantityAllocated",
              "unitOfMeasure",
              "status",
              "allocationDate",
              "notes",
              "createdAt",
              "updatedAt",
            ],
          },
        ],
      });
    } catch (error) {
      console.error("GraphQL Error - createProductionBatch:", error);
      throw error;
    }
  },

  updateProductionBatch: async ({ id, input }, context) => {
    try {
      // Check if user is authenticated
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      // Find the batch
      const batch = await ProductionBatch.findByPk(id);

      if (!batch) {
        throw new Error("Production batch not found");
      }

      // Update batch
      await batch.update({
        ...(input.scheduledStartDate && {
          scheduledStartDate: input.scheduledStartDate,
        }),
        ...(input.scheduledEndDate && {
          scheduledEndDate: input.scheduledEndDate,
        }),
        ...(input.status && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
      });

      // If status changed to 'in_progress', update request status and notify Feedback Service
      if (input.status === "in_progress") {
        const request = await ProductionRequest.findByPk(batch.requestId);
        if (request) {
          await request.update({ status: "in_production" });

          // Notify the Production Feedback Service
          try {
            await axios.post(
              `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
              {
                requestId: request.requestId,
                status: "in_production",
                notes: `Batch ${batch.batchNumber} started production`,
              }
            );
          } catch (error) {
            console.error("Failed to notify Feedback Service:", error.message);
            // Continue execution even if notification fails
          }
        }
      }

      // If status changed to 'completed', check if all batches are completed to update request status
      if (input.status === "completed") {
        const request = await ProductionRequest.findByPk(batch.requestId);
        if (request) {
          const allBatches = await ProductionBatch.findAll({
            where: { requestId: batch.requestId },
          });

          const allCompleted = allBatches.every(
            (b) => b.status === "completed" || b.status === "cancelled"
          );

          if (allCompleted) {
            await request.update({ status: "completed" });

            // Notify the Production Feedback Service
            try {
              await axios.post(
                `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
                {
                  requestId: request.requestId,
                  status: "completed",
                  notes: "All batches completed",
                }
              );
            } catch (error) {
              console.error(
                "Failed to notify Feedback Service:",
                error.message
              );
              // Continue execution even if notification fails
            }
          }
        }
      }

      return batch;
    } catch (error) {
      console.error(`GraphQL Error - updateProductionBatch(${id}):`, error);
      throw error;
    }
  },

  // Production Step Mutations
  updateProductionStep: async ({ id, input }, context) => {
    try {
      // Check if user is authenticated
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      // Find the step
      const step = await ProductionStep.findByPk(id);

      if (!step) {
        throw new Error("Production step not found");
      }

      // Update step
      await step.update({
        ...(input.machineId && { machineId: input.machineId }),
        ...(input.operatorId && { operatorId: input.operatorId }),
        ...(input.status && { status: input.status }),
        ...(input.notes !== undefined && { notes: input.notes }),
      });

      // If step status changed to 'in_progress', update batch status if it's the first step
      if (input.status === "in_progress") {
        const batch = await ProductionBatch.findByPk(step.batchId);
        if (batch && batch.status !== "in_progress") {
          // Check if this is the first step
          const steps = await ProductionStep.findAll({
            where: { batchId: step.batchId },
            order: [["stepOrder", "ASC"]],
          });

          if (steps[0].id === step.id) {
            await batch.update({
              status: "in_progress",
            });

            // Update the request status
            const request = await ProductionRequest.findByPk(batch.requestId);
            if (request) {
              await request.update({ status: "in_production" });
            }
          }
        }
      }

      // If step status changed to 'completed', check if all steps are completed to update batch status
      if (input.status === "completed") {
        const batch = await ProductionBatch.findByPk(step.batchId);
        if (batch) {
          const steps = await ProductionStep.findAll({
            where: { batchId: step.batchId },
          });

          const allCompleted = steps.every(
            (s) => s.status === "completed" || s.status === "cancelled"
          );

          if (allCompleted) {
            await batch.update({
              status: "completed",
            });

            // Check if all batches for this request are completed
            const allBatches = await ProductionBatch.findAll({
              where: { requestId: batch.requestId },
            });

            const allBatchesCompleted = allBatches.every(
              (b) => b.status === "completed" || b.status === "cancelled"
            );

            if (allBatchesCompleted) {
              const request = await ProductionRequest.findByPk(batch.requestId);
              if (request) {
                await request.update({ status: "completed" });

                // Notify the Production Feedback Service
                try {
                  await axios.post(
                    `${process.env.FEEDBACK_SERVICE_URL}/api/feedback/status-update`,
                    {
                      requestId: request.requestId,
                      status: "completed",
                      notes: "All production completed",
                    }
                  );
                } catch (error) {
                  console.error(
                    "Failed to notify Feedback Service:",
                    error.message
                  );
                  // Continue execution even if notification fails
                }
              }
            }
          }
        }
      }

      return step;
    } catch (error) {
      console.error(`GraphQL Error - updateProductionStep(${id}):`, error);
      throw error;
    }
  },
};

module.exports = {
  schema,
  rootValue: root,
};
