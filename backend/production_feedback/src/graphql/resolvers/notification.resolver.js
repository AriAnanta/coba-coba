/**
 * Resolver Notification untuk GraphQL API
 *
 * Implementasi resolver untuk FeedbackNotification
 */
const {
  FeedbackNotification,
  ProductionFeedback,
  Sequelize,
} = require("../../models");
const axios = require("axios");
const { Op } = Sequelize;

// Resolver untuk tipe FeedbackNotification
const notificationResolvers = {
  FeedbackNotification: {
    // Resolver untuk relasi
    feedback: async (parent) => {
      if (!parent.feedbackId) return null;
      return await ProductionFeedback.findByPk(parent.feedbackId);
    },
  },

  // Resolver untuk Query
  Query: {
    // Mendapatkan notifikasi berdasarkan ID
    notification: async (_, { id }) => {
      return await FeedbackNotification.findByPk(id);
    },

    // Mendapatkan semua notifikasi untuk penerima tertentu dengan filter
    notifications: async (_, { recipientId, isRead }) => {
      const whereCondition = {};

      if (recipientId) {
        whereCondition.recipientId = recipientId;
      }

      if (isRead !== undefined) {
        whereCondition.isRead = isRead;
      }

      return await FeedbackNotification.findAll({
        where: whereCondition,
        order: [["createdAt", "DESC"]],
      });
    },
  },

  // Resolver untuk Mutation
  Mutation: {
    // Membuat notifikasi baru
    createNotification: async (_, { input }) => {
      const newNotification = await FeedbackNotification.create(input);
      return newNotification;
    },

    // Memperbarui notifikasi (misal: menandai sudah dibaca)
    updateNotification: async (_, { id, input }) => {
      const notification = await FeedbackNotification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }
      await notification.update(input);
      return notification;
    },

    // Menandai notifikasi sebagai sudah dibaca
    markNotificationAsRead: async (_, { id }) => {
      const notification = await FeedbackNotification.findByPk(id);
      if (!notification) {
        throw new Error("Notification not found");
      }
      await notification.update({ isRead: true });
      return notification;
    },

    // Menandai beberapa notifikasi sebagai sudah dibaca
    markMultipleNotificationsAsRead: async (_, { ids }) => {
      const [updatedCount] = await FeedbackNotification.update(
        { isRead: true },
        { where: { id: { [Op.in]: ids } } }
      );
      return {
        success: true,
        message: `${updatedCount} notifications marked as read.`,
        count: updatedCount,
      };
    },

    // Menghapus notifikasi
    deleteNotification: async (_, { id }) => {
      const notification = await FeedbackNotification.findByPk(id);
      if (!notification) {
        return { success: false, message: "Notification not found" };
      }
      await notification.destroy();
      return { success: true, message: "Notification deleted successfully" };
    },
  },
};

// Fungsi helper untuk mengirim email notifikasi
async function sendEmailNotification(notification) {
  try {
    const userServiceUrl =
      process.env.USER_SERVICE_URL || "http://localhost:5006";
    const apiKey = process.env.INTERNAL_API_KEY || "default-internal-key";

    // Siapkan data untuk API User Service
    const emailData = {
      recipientType: notification.recipientType,
      recipientId: notification.recipientId,
      subject: notification.title,
      message: notification.message,
      priority: notification.priority || "normal",
    };

    // Kirim email melalui User Service API
    const response = await axios.post(
      `${userServiceUrl}/api/users/send-email`,
      emailData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
      }
    );

    // Update status pengiriman notifikasi
    await notification.update({
      isDelivered: true,
    });

    return response.data;
  } catch (error) {
    console.error("Error mengirim email notifikasi:", error);
    throw error;
  }
}

module.exports = notificationResolvers;
