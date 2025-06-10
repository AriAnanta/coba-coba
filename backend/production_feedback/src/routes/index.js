/**
 * File index untuk routes
 *
 * Mengatur semua routes yang tersedia di Production Feedback Service
 */
const express = require("express");
const router = express.Router();
const feedbackRoutes = require("./feedback.routes");
const consumerRoutes = require("./consumer.routes");
// const notificationRoutes = require("./notification.routes"); // Notifikasi ditangani oleh feedback.routes
const uiRoutes = require("./ui.routes");
const quantityStockRoutes = require("./quantity_stock.routes");

// Mendaftarkan semua routes dengan prefix yang sesuai
router.use("/feedback", feedbackRoutes);
router.use("/consumer", consumerRoutes);
// router.use("/notifications", notificationRoutes); // Notifikasi ditangani oleh feedback.routes
router.use("/ui", uiRoutes);
router.use("/quantity-stock", quantityStockRoutes);

module.exports = router;
