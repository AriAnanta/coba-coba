/**
 * Feedback Routes
 *
 * Defines API endpoints for feedback and production status updates
 */
const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback.controller");
const notificationController = require("../controllers/notification.controller");
// const { Router } = require("express"); // Ini mungkin redundant, bisa dihapus jika tidak digunakan lagi
const {
  verifyToken,
  checkRole,
} = require("../../../common/middleware/auth.middleware");

// Main feedback CRUD routes
router.get("/list", feedbackController.getAllFeedback);
router.get("/:id", feedbackController.getFeedbackById);
router.get(
  "/feedbackId/:feedbackId",
  feedbackController.getFeedbackByFeedbackId
);
router.get(
  "/productionId/:productionId",
  feedbackController.getFeedbackByProductionId
);
router.get("/batchId/:batchId", feedbackController.getFeedbackByBatchId);
router.post("/", feedbackController.createFeedback);
router.put("/:id", feedbackController.updateFeedback);
router.delete("/:id", feedbackController.deleteFeedback);

// Marketplace status and update
router.get("/marketplace/:id", feedbackController.getMarketplaceStatus);
router.post("/marketplace/:id", feedbackController.sendMarketplaceUpdate);

// Notification routes
// router.get("/notifications/all", notificationController.getAllNotifications); // Hapus karena tidak ada di controller
router.get(
  "/notifications/feedback/:feedbackId",
  notificationController.getNotificationsByFeedbackId
);
router.get(
  "/notifications/:notificationId",
  notificationController.getNotificationById
);
router.get(
  "/notifications/recipient/:recipientType/:recipientId",
  notificationController.getNotificationsByRecipient
);
router.post("/notifications", notificationController.createNotification);
router.put(
  "/notifications/:notificationId",
  notificationController.updateNotification
);
router.delete(
  "/notifications/:notificationId",
  notificationController.deleteNotification
);
router.put(
  "/notifications/mark-read/:notificationId",
  notificationController.markAsRead
);
router.put(
  "/notifications/mark-all-read/:recipientType/:recipientId",
  notificationController.markAllAsReadByRecipient
);
router.get(
  "/notifications/unread-count/:recipientType/:recipientId",
  notificationController.getUnreadCountByRecipient
);

// Real-time updates (SSE) - Placeholder, consider moving this to a dedicated endpoint or WebSocket service
router.get(
  "/updates/customer/:customerId",
  feedbackController.getCustomerUpdates
);

module.exports = router;
