/**
 * GraphQL Schema untuk Production Planning Service
 *
 * Mendefinisikan tipe dan resolver untuk API GraphQL
 */
const { buildSchema } = require("graphql");
const { ProductionPlan } = require("../models");
const axios = require("axios");
const productionManagementService = require("../services/productionManagement.service");

// Mendefinisikan skema GraphQL
const schema = buildSchema(`
  type Query {
    plans: [ProductionPlan]
    plan(id: ID!): ProductionPlan
  }

  type Mutation {
    createPlan(input: PlanInput!): ProductionPlan
    updatePlan(id: ID!, input: PlanUpdateInput!): ProductionPlan
    deletePlan(id: ID!): SuccessResponse
    approvePlan(id: ID!): ApproveResponse
  }

  input PlanInput {
    requestId: Int
    planningNotes: String!
    priority: String
    batchId: Int
    productName: String
    plannedStartDate: String
    plannedEndDate: String
    plannedBatches: Int
  }

  input PlanUpdateInput {
    productName: String
    plannedStartDate: String
    plannedEndDate: String
    priority: String
    status: String
    planningNotes: String
    plannedBatches: Int
    requestId: Int
    batchId: Int
  }

  type SuccessResponse {
    success: Boolean
    message: String
  }

  type ApproveResponse {
    success: Boolean
    message: String
    plan: ProductionPlan
    batchCreated: BatchResponse
  }

  type BatchResponse {
    id: Int
    batchNumber: String
  }

  type ProductionPlan {
    id: ID
    planId: String
    requestId: Int
    productionRequestId: String
    productName: String
    plannedStartDate: String
    plannedEndDate: String
    priority: String
    status: String
    planningNotes: String
    plannedBatches: Int
    batchId: Int
    createdAt: String
    updatedAt: String
  }
`);

// Implementasi resolver
const root = {
  // Queries
  plans: async () => {
    try {
      const plans = await ProductionPlan.findAll({
        order: [["createdAt", "DESC"]],
      });
      return plans.map((plan) => formatPlan(plan));
    } catch (error) {
      console.error("Error mengambil rencana produksi:", error);
      throw new Error("Gagal mengambil rencana produksi");
    }
  },

  plan: async ({ id }) => {
    try {
      const plan = await ProductionPlan.findByPk(id);
      if (!plan) {
        throw new Error("Rencana produksi tidak ditemukan");
      }
      return formatPlan(plan);
    } catch (error) {
      console.error("Error mengambil detail rencana produksi:", error);
      throw new Error("Gagal mengambil detail rencana produksi");
    }
  },

  // Mutations
  createPlan: async ({ input }) => {
    try {
      let request = null;
      let batch = null;

      if (input.batchId) {
        if (typeof input.batchId !== "number" || input.batchId <= 0) {
          throw new Error("Batch ID tidak valid. Harus angka positif.");
        }
        batch = await productionManagementService.getProductionBatchById(
          input.batchId
        );
        if (!batch) {
          throw new Error("Batch tidak ditemukan");
        }
        if (batch.request?.id) {
          const requestIdAsNumber = Number(batch.request.id);
          if (typeof requestIdAsNumber !== "number" || requestIdAsNumber <= 0) {
            throw new Error(
              "Request ID terkait batch tidak valid. Harus angka positif."
            );
          }
          console.log(
            "Mengambil detail permintaan (dari batch), ID:",
            requestIdAsNumber,
            "Tipe:",
            typeof requestIdAsNumber
          );
          request = await productionManagementService.getProductionRequestById(
            requestIdAsNumber
          );
        }
      } else if (input.requestId) {
        const requestIdAsNumber = Number(input.requestId);
        if (typeof requestIdAsNumber !== "number" || requestIdAsNumber <= 0) {
          throw new Error("Request ID tidak valid. Harus angka positif.");
        }
        console.log(
          "Mengambil detail permintaan (dari input), ID:",
          requestIdAsNumber,
          "Tipe:",
          typeof requestIdAsNumber
        );
        request = await productionManagementService.getProductionRequestById(
          requestIdAsNumber
        );
      }

      const planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newPlan = await ProductionPlan.create({
        planId,
        requestId: input.requestId
          ? Number(input.requestId)
          : batch?.request?.id
          ? Number(batch.request.id)
          : null,
        productionRequestId:
          request?.requestId || batch?.request?.requestId || null,
        productName:
          input.productName || batch?.productName || request?.productName || "",
        plannedStartDate:
          input.plannedStartDate ||
          batch?.scheduledStartDate ||
          request?.dueDate ||
          new Date(),
        plannedEndDate:
          input.plannedEndDate ||
          batch?.scheduledEndDate ||
          request?.dueDate ||
          null,
        priority: input.priority || request?.priority || "normal",
        planningNotes: input.planningNotes || "Rencana dibuat otomatis.",
        status: "draft",
        batchId: input.batchId || null,
        plannedBatches: input.plannedBatches || 1,
      });

      return formatPlan(newPlan);
    } catch (error) {
      console.error("Error membuat rencana produksi:", error);
      throw new Error("Gagal membuat rencana produksi: " + error.message);
    }
  },

  updatePlan: async ({ id, input }) => {
    try {
      const plan = await ProductionPlan.findByPk(id);
      if (!plan) {
        throw new Error("Rencana produksi tidak ditemukan");
      }

      const updateData = {};
      if (input.productName !== undefined)
        updateData.productName = input.productName;
      if (input.plannedStartDate !== undefined)
        updateData.plannedStartDate = input.plannedStartDate;
      if (input.plannedEndDate !== undefined)
        updateData.plannedEndDate = input.plannedEndDate;
      if (input.priority !== undefined)
        updateData.priority = input.priority.toLowerCase();
      if (input.status !== undefined) updateData.status = input.status;
      if (input.planningNotes !== undefined)
        updateData.planningNotes = input.planningNotes;
      if (input.plannedBatches !== undefined)
        updateData.plannedBatches = input.plannedBatches;
      if (input.requestId !== undefined) updateData.requestId = input.requestId;
      if (input.batchId !== undefined) updateData.batchId = input.batchId;

      await plan.update(updateData);
      return formatPlan(plan);
    } catch (error) {
      console.error("Error memperbarui rencana produksi:", error);
      throw new Error("Gagal memperbarui rencana produksi");
    }
  },

  deletePlan: async ({ id }) => {
    try {
      const plan = await ProductionPlan.findByPk(id);
      if (!plan) {
        throw new Error("Rencana produksi tidak ditemukan");
      }
      await plan.destroy();
      return {
        success: true,
        message: "Rencana produksi berhasil dihapus",
      };
    } catch (error) {
      console.error("Error menghapus rencana produksi:", error);
      throw new Error("Gagal menghapus rencana produksi");
    }
  },

  approvePlan: async ({ id }) => {
    try {
      const plan = await ProductionPlan.findByPk(id);
      if (!plan) {
        throw new Error("Rencana produksi tidak ditemukan");
      }

      await plan.update({
        status: "approved",
        planningNotes: `${
          plan.planningNotes || ""
        }\nApproved at ${new Date().toISOString()}`,
      });

      try {
        const productionPlanData = {
          id: plan.id,
          planId: plan.planId,
          requestId: plan.requestId,
          productName: plan.productName,
          plannedStartDate: plan.plannedStartDate,
          plannedEndDate: plan.plannedEndDate,
          plannedBatches: plan.plannedBatches || 1,
          batchId: plan.batchId || null,
        };

        const result = await productionManagementService.createProductionBatch(
          productionPlanData,
          [],
          []
        );

        await plan.update({
          planningNotes: `${
            plan.planningNotes || ""
          }\nBatch produksi dibuat dengan ID: ${
            result.batchNumber || result.id
          }`,
        });

        return {
          success: true,
          message: "Rencana produksi disetujui dan batch produksi dibuat",
          plan: formatPlan(plan),
          batchCreated: {
            id: result.id,
            batchNumber: result.batchNumber,
          },
        };
      } catch (error) {
        console.error("Gagal membuat batch produksi:", error.message);
        return {
          success: true,
          message:
            "Rencana produksi disetujui tetapi gagal membuat batch produksi",
          plan: formatPlan(plan),
          batchCreated: null,
        };
      }
    } catch (error) {
      console.error("Error menyetujui rencana produksi:", error);
      throw new Error(`Gagal menyetujui rencana produksi: ${error.message}`);
    }
  },
};

function toISOStringOrNull(dateInput) {
  if (!dateInput) {
    return null;
  }
  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

function formatPlan(plan) {
  const formatted = {
    ...plan.dataValues,
    plannedStartDate: toISOStringOrNull(plan.plannedStartDate),
    plannedEndDate: toISOStringOrNull(plan.plannedEndDate),
    createdAt: toISOStringOrNull(plan.createdAt),
    updatedAt: toISOStringOrNull(plan.updatedAt),
  };
  return formatted;
}

module.exports = {
  schema,
  root,
};
