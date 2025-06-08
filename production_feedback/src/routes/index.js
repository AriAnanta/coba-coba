/**
 * File index untuk routes
 * 
 * Mengatur semua routes yang tersedia di Production Feedback Service
 */
const express = require('express');
const router = express.Router();
const feedbackRoutes = require('./feedback.routes');
const stepRoutes = require('./step.routes');
const qualityRoutes = require('./quality.routes');
const imageRoutes = require('./image.routes');
const commentRoutes = require('./comment.routes');
const notificationRoutes = require('./notification.routes');

// Mendaftarkan semua routes dengan prefix yang sesuai
router.use('/feedback', feedbackRoutes);
router.use('/step', stepRoutes);
router.use('/quality', qualityRoutes);
router.use('/image', imageRoutes);
router.use('/comment', commentRoutes);
router.use('/notification', notificationRoutes);

module.exports = router;
