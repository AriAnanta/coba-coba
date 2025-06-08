/**
 * Routes untuk Feedback Notification
 * 
 * Mendefinisikan routing untuk endpoint Feedback Notification
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Semua routes membutuhkan autentikasi
router.use(verifyToken);

// Endpoint untuk mendapatkan data notifikasi
router.get('/feedback/:feedbackId', notificationController.getNotificationsByFeedbackId);
router.get('/:notificationId', notificationController.getNotificationById);
router.get('/recipient/:recipientType/:recipientId', notificationController.getNotificationsByRecipient);
router.get('/unread/:recipientType/:recipientId', notificationController.getUnreadCount);

// Endpoint untuk mengelola notifikasi
router.post('/', checkRole(['production_manager', 'quality_inspector', 'admin']), notificationController.createNotification);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/read-multiple', notificationController.markMultipleAsRead);
router.post('/:notificationId/send-email', checkRole(['production_manager', 'admin']), notificationController.sendEmailNotification);
router.delete('/:notificationId', checkRole(['production_manager', 'admin']), notificationController.deleteNotification);

module.exports = router;
