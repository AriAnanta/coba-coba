/**
 * Feedback Controller
 * Handles production feedback, notifications, and customer communication
 */

/**
 * Controller Feedback untuk Production Feedback Service
 *
 * Mengelola logika bisnis untuk feedback produksi
 */
const { Op, sequelize } = require("sequelize");
const { ProductionFeedback, FeedbackNotification } = require("../models");
const axios = require("axios");
require("dotenv").config();

// Fungsi untuk membuat ID unik dengan format khusus
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

// Fungsi untuk mengirim notifikasi
const createNotification = async (
  feedbackId,
  type,
  title,
  message,
  recipientType,
  recipientId,
  priority = "medium"
) => {
  try {
    return await FeedbackNotification.create({
      notificationId: generateUniqueId("NOTIF"),
      feedbackId,
      type,
      title,
      message,
      recipientType,
      recipientId,
      priority,
      deliveryMethod: "in_app",
    });
  } catch (error) {
    console.error("Error membuat notifikasi:", error);
    // Kita hanya log error tanpa mengganggu flow utama aplikasi
  }
};

// Fungsi untuk meng-update status ke marketplace
const updateMarketplace = async (feedback) => {
  try {
    // Hanya kirim update jika sudah ada batchId dan status feedback sudah bukan 'pending'
    if (!feedback.batchId || feedback.status === "pending") {
      return {
        success: false,
        message: "Belum dapat mengirim update ke marketplace",
      };
    }

    // Menyiapkan data untuk dikirim ke marketplace
    const marketplaceData = {
      production_id: feedback.productionId,
      batch_id: feedback.batchId,
      product_id: feedback.productId,
      status: feedback.status,
      completion_percentage: feedback.completionPercentage,
      quantity_produced: feedback.quantityProduced,
      quantity_rejected: feedback.quantityRejected,
      estimated_completion: feedback.endDate,
      notes: feedback.customerNotes || feedback.notes,
    };

    // Mengirim data ke marketplace API
    const response = await axios.post(
      `${process.env.MARKETPLACE_API_URL}/production/update`,
      marketplaceData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MARKETPLACE_API_KEY}`,
        },
      }
    );

    // Update status marketplace di database
    await ProductionFeedback.update(
      {
        marketplaceUpdateStatus: "sent",
        marketplaceLastUpdate: new Date(),
      },
      { where: { id: feedback.id } }
    );

    return {
      success: true,
      message: "Berhasil mengirim update ke marketplace",
      data: response.data,
    };
  } catch (error) {
    console.error("Error mengupdate marketplace:", error);

    // Update status marketplace di database sebagai failed
    await ProductionFeedback.update(
      {
        marketplaceUpdateStatus: "failed",
        marketplaceLastUpdate: new Date(),
      },
      { where: { id: feedback.id } }
    );

    return {
      success: false,
      message: `Gagal mengirim update ke marketplace: ${error.message}`,
      error: error.response ? error.response.data : error.message,
    };
  }
};

// Main feedback CRUD operations
const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await ProductionFeedback.findAll();
    return res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Error getting all feedback:", error);
    return res.status(500).json({ message: "Failed to retrieve feedback" });
  }
};

const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await ProductionFeedback.findByPk(id);
    if (feedback) {
      return res.status(200).json(feedback);
    } else {
      return res.status(404).json({ message: "Feedback not found" });
    }
  } catch (error) {
    console.error("Error getting feedback by ID:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve feedback by ID" });
  }
};

const getFeedbackByFeedbackId = async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const feedback = await ProductionFeedback.findOne({
      where: { feedbackId },
    });
    if (feedback) {
      return res.status(200).json(feedback);
    } else {
      return res.status(404).json({ message: "Feedback not found" });
    }
  } catch (error) {
    console.error("Error getting feedback by feedback ID:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve feedback by feedback ID" });
  }
};

const getFeedbackByProductionId = async (req, res) => {
  try {
    const { productionId } = req.params;
    const feedback = await ProductionFeedback.findOne({
      where: { productionId },
    });
    if (feedback) {
      return res.status(200).json(feedback);
    } else {
      return res.status(404).json({ message: "Feedback not found" });
    }
  } catch (error) {
    console.error("Error getting feedback by production ID:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve feedback by production ID" });
  }
};

const getFeedbackByBatchId = async (req, res) => {
  try {
    const { batchId } = req.params;
    const feedback = await ProductionFeedback.findOne({ where: { batchId } });
    if (feedback) {
      return res.status(200).json(feedback);
    } else {
      return res.status(404).json({ message: "Feedback not found" });
    }
  } catch (error) {
    console.error("Error getting feedback by batch ID:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve feedback by batch ID" });
  }
};

const createFeedback = async (req, res) => {
  try {
    const {
      batchId,
      productionId,
      productId,
      productName,
      quantityOrdered,
      quantityProduced,
      quantityRejected,
      qualityScore,
      notes,
      customerNotes,
      status,
      startDate,
      endDate,
    } = req.body;
    const newFeedback = await ProductionFeedback.create({
      feedbackId: generateUniqueId("FB"),
      batchId,
      productionId,
      productId,
      productName,
      quantityOrdered,
      quantityProduced,
      quantityRejected,
      qualityScore,
      notes,
      customerNotes,
      status: status || "pending",
      startDate,
      endDate,
    });
    await createNotification(
      newFeedback.id,
      "new_feedback",
      "New Production Feedback",
      `New feedback received for batch ${batchId}.`,
      "admin",
      null,
      "high"
    );
    return res.status(201).json({
      message: "Feedback created successfully",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return res.status(500).json({ message: "Failed to create feedback" });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const feedback = await ProductionFeedback.findByPk(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Update the feedback record
    await feedback.update(updates);

    // Send notification for status change
    if (updates.status && updates.status !== feedback.previous("status")) {
      await createNotification(
        feedback.id,
        "status_change",
        "Feedback Status Update",
        `Feedback for batch ${feedback.batchId} status changed to ${updates.status}.`,
        "customer",
        null,
        "medium"
      );
    }

    // Send notification for quality score change (if it drops)
    if (
      updates.qualityScore &&
      feedback.qualityScore !== null && // Only if qualityScore was previously set
      updates.qualityScore < feedback.previous("qualityScore")
    ) {
      await createNotification(
        feedback.id,
        "quality_alert",
        "Quality Score Alert",
        `Quality score for batch ${feedback.batchId} dropped to ${updates.qualityScore}.`,
        "admin",
        null,
        "high"
      );
    }

    return res
      .status(200)
      .json({ message: "Feedback updated successfully", feedback });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return res.status(500).json({ message: "Failed to update feedback" });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await ProductionFeedback.findByPk(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    await feedback.destroy();
    return res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.status(500).json({ message: "Failed to delete feedback" });
  }
};

// Marketplace status and update
const getMarketplaceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await ProductionFeedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    return res.status(200).json({
      marketplaceStatus: feedback.marketplaceUpdateStatus,
      lastUpdate: feedback.marketplaceLastUpdate,
    });
  } catch (error) {
    console.error("Error getting marketplace status:", error);
    return res
      .status(500)
      .json({ message: "Failed to get marketplace status" });
  }
};

const sendMarketplaceUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await ProductionFeedback.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    const result = await updateMarketplace(feedback);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error sending marketplace update:", error);
    return res
      .status(500)
      .json({ message: "Failed to send marketplace update" });
  }
};

// Notification routes (using FeedbackNotification model)
const getAllNotifications = async (req, res) => {
  try {
    const allNotifications = await FeedbackNotification.findAll();
    return res.status(200).json(allNotifications);
  } catch (error) {
    console.error("Error getting all notifications:", error);
    return res.status(500).json({ message: "Failed to get all notifications" });
  }
};

const getCustomerNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;
    const customerNotifs = await FeedbackNotification.findAll({
      where: { recipientId: customerId, recipientType: "customer" },
    });
    return res.status(200).json(customerNotifs);
  } catch (error) {
    console.error("Error getting customer notifications:", error);
    return res
      .status(500)
      .json({ message: "Failed to get customer notifications" });
  }
};

const sendNotification = async (req, res) => {
  try {
    const {
      feedbackId,
      type,
      title,
      message,
      recipientType,
      recipientId,
      priority,
    } = req.body;
    const newNotification = await createNotification(
      feedbackId,
      type,
      title,
      message,
      recipientType,
      recipientId,
      priority
    );
    return res
      .status(201)
      .json({ message: "Notification sent", notification: newNotification });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ message: "Failed to send notification" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await FeedbackNotification.update({ isRead: true }, { where: { id } });
    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res
      .status(500)
      .json({ message: "Failed to mark notification as read" });
  }
};

// Real-time updates (SSE) - Simplified placeholder
const getCustomerUpdates = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}

`);
  };

  // Example: send a new event every 5 seconds
  const intervalId = setInterval(() => {
    // Di sini, Anda bisa mengirim data notifikasi real-time dari database
    // atau dari event yang diterima oleh consumer
    sendEvent({ type: "ping", timestamp: new Date() });
  }, 5000);

  req.on("close", () => {
    clearInterval(intervalId);
    res.end();
  });
};

module.exports = {
  getAllFeedback,
  getFeedbackById,
  getFeedbackByFeedbackId,
  getFeedbackByProductionId,
  getFeedbackByBatchId,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getMarketplaceStatus,
  sendMarketplaceUpdate,
  getAllNotifications,
  getCustomerNotifications,
  sendNotification,
  markNotificationAsRead,
  getCustomerUpdates,
};
