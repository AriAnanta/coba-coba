/**
 * Resolver Feedback untuk GraphQL API
 *
 * Implementasi resolver untuk ProductionFeedback
 */
const {
  ProductionFeedback,
  FeedbackNotification,
  Sequelize,
} = require("../../models");
const { Op } = Sequelize;

// Resolver untuk tipe ProductionFeedback
const feedbackResolvers = {
  ProductionFeedback: {
    notifications: async (parent) => {
      return await FeedbackNotification.findAll({
        where: { feedbackId: parent.id },
      });
    },
  },

  // Resolver untuk Query
  Query: {
    // Mendapatkan feedback berdasarkan ID
    feedback: async (_, { id }) => {
      return await ProductionFeedback.findByPk(id);
    },

    // Mendapatkan semua feedback dengan paginasi dan filter
    feedbacks: async (_, { filter, pagination }) => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;

      // Siapkan kondisi where berdasarkan filter
      const whereCondition = {};

      if (filter) {
        if (filter.status) whereCondition.status = filter.status;
        if (filter.batchId)
          whereCondition.batchId = { [Op.like]: `%${filter.batchId}%` };
        if (filter.productName)
          whereCondition.productName = { [Op.like]: `%${filter.productName}%` };

        if (filter.startDate && filter.endDate) {
          whereCondition.createdAt = {
            [Op.between]: [
              new Date(filter.startDate),
              new Date(filter.endDate),
            ],
          };
        } else if (filter.startDate) {
          whereCondition.createdAt = { [Op.gte]: new Date(filter.startDate) };
        } else if (filter.endDate) {
          whereCondition.createdAt = { [Op.lte]: new Date(filter.endDate) };
        }
      }

      // Query dengan paginasi
      const { count, rows } = await ProductionFeedback.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        items: rows,
        totalCount: count,
        pageInfo: {
          hasNextPage: page * limit < count,
          hasPreviousPage: page > 1,
        },
      };
    },

    // Mendapatkan ringkasan feedback untuk dashboard
    feedbackSummary: async () => {
      const total = await ProductionFeedback.count();
      const statusCounts = await ProductionFeedback.findAll({
        attributes: [
          "status",
          [Sequelize.fn("COUNT", Sequelize.col("status")), "count"],
        ],
        group: ["status"],
      });

      const completedCount =
        statusCounts.find((s) => s.status === "completed")?.dataValues.count ||
        0;
      const totalActual = await ProductionFeedback.sum("quantityProduced", {
        where: { status: "completed" },
      });
      const totalDefect = await ProductionFeedback.sum("quantityRejected", {
        where: { status: "completed" },
      });

      const defectRate = totalActual > 0 ? totalDefect / totalActual : 0;
      const onTimeRate = 0; // Placeholder, perlu logika untuk ini

      const status = statusCounts.map((s) => ({
        status: s.status,
        count: s.dataValues.count,
        color:
          s.status === "completed"
            ? "success"
            : s.status === "rejected"
            ? "error"
            : "warning",
      }));

      return {
        total,
        status,
        defectRate,
        onTimeRate,
      };
    },
  },

  // Resolver untuk Mutation
  Mutation: {
    // Membuat feedback baru
    createFeedback: async (_, { input }) => {
      const newFeedback = await ProductionFeedback.create({
        feedbackId: input.feedbackId || `FB-${Date.now()}`,
        batchId: input.batchId,
        productName: input.productName,
        productionPlanId: input.productionPlanId,
        status: input.status,
        plannedQuantity: input.plannedQuantity,
        quantityProduced: input.actualQuantity,
        quantityRejected: input.defectQuantity,
        startDate: input.startDate,
        endDate: input.endDate,
        notes: input.notes,
      });
      return newFeedback;
    },

    // Memperbarui feedback
    updateFeedback: async (_, { id, input }) => {
      const feedback = await ProductionFeedback.findByPk(id);
      if (!feedback) {
        throw new Error("Feedback not found");
      }
      await feedback.update({
        ...input,
        quantityProduced: input.actualQuantity,
        quantityRejected: input.defectQuantity,
      });
      return feedback;
    },

    // Memperbarui status feedback
    updateFeedbackStatus: async (_, { id, status }) => {
      const feedback = await ProductionFeedback.findByPk(id);
      if (!feedback) {
        throw new Error("Feedback not found");
      }
      await feedback.update({ status });
      return feedback;
    },

    // Memperbarui kuantitas feedback
    updateFeedbackQuantities: async (
      _,
      { id, actualQuantity, defectQuantity }
    ) => {
      const feedback = await ProductionFeedback.findByPk(id);
      if (!feedback) {
        throw new Error("Feedback not found");
      }
      await feedback.update({
        quantityProduced: actualQuantity,
        quantityRejected: defectQuantity,
      });
      return feedback;
    },

    // Menghapus feedback
    deleteFeedback: async (_, { id }) => {
      const feedback = await ProductionFeedback.findByPk(id);
      if (!feedback) {
        return { success: false, message: "Feedback not found" };
      }
      await feedback.destroy();
      return { success: true, message: "Feedback deleted successfully" };
    },
  },
};

module.exports = feedbackResolvers;
