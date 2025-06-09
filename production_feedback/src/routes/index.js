/**
 * File index untuk routes
 * 
 * Mengatur semua routes yang tersedia di Production Feedback Service
 */
const express = require('express');
const router = express.Router();
const feedbackRoutes = require('./feedback.routes');
const consumerRoutes = require('./consumer.routes');

// Mendaftarkan semua routes dengan prefix yang sesuai
router.use('/feedback', feedbackRoutes);
router.use('/consumer', consumerRoutes);

module.exports = router;
