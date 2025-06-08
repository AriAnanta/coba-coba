/**
 * Feedback Routes
 * 
 * Defines API endpoints for feedback and production status updates
 */
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
// Temporarily comment out these imports until we create the controller files
// const stepController = require('../controllers/step.controller');
// const qualityController = require('../controllers/quality.controller');
// const notificationController = require('../controllers/notification.controller');
// const imageController = require('../controllers/image.controller');
// const commentController = require('../controllers/comment.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'), false);
    }
  }
});

// Main feedback CRUD routes
router.get('/list', feedbackController.getAllFeedback);
router.get('/:id', feedbackController.getFeedbackById);
router.get('/feedbackId/:feedbackId', feedbackController.getFeedbackByFeedbackId);
router.get('/productionId/:productionId', feedbackController.getFeedbackByProductionId);
router.get('/batchId/:batchId', feedbackController.getFeedbackByBatchId);
router.post('/', feedbackController.createFeedback);
router.put('/:id', feedbackController.updateFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

// Status and progress routes
router.post('/status', feedbackController.receiveStatusUpdate);
router.get('/status/history/:requestId', feedbackController.getStatusHistory);
router.get('/progress/:requestId', feedbackController.getProductionProgress);
router.post('/progress', feedbackController.updateProgress);
router.get('/summary/status', feedbackController.getStatusSummary);
router.get('/summary/completion', feedbackController.getCompletionTimeReport);
router.get('/summary/production', feedbackController.getProductionSummary);
router.get('/marketplace/:id', feedbackController.getMarketplaceStatus);
router.post('/marketplace/:id', feedbackController.sendMarketplaceUpdate);

// Notification routes
router.get('/notifications/all', feedbackController.getAllNotifications);
router.get('/notifications/customer/:customerId', feedbackController.getCustomerNotifications);
router.post('/notifications', feedbackController.sendNotification);
router.put('/notifications/:id', feedbackController.markNotificationAsRead);
router.get('/updates/customer/:customerId', feedbackController.getCustomerUpdates);

// Issue routes
router.post('/issues', feedbackController.reportIssue);
router.get('/issues', feedbackController.getAllIssues);
router.get('/issues/:issueId', feedbackController.getIssueById);
router.put('/issues/:issueId', feedbackController.updateIssue);
router.get('/issues/analytics', feedbackController.getIssueAnalytics);

// Customer notification route
router.post('/notify-customer', feedbackController.notifyCustomer);

// TODO: Uncomment these routes when the corresponding controller files are created
/*
// Step routes
router.get('/steps/feedback/:feedbackId', stepController.getStepsByFeedbackId);
router.get('/steps/:id', stepController.getStepById);
router.get('/steps/stepId/:stepId', stepController.getStepByStepId);
router.post('/steps', stepController.createStep);
router.post('/steps/batch', stepController.createMultipleSteps);
router.put('/steps/:id', stepController.updateStep);
router.put('/steps/:id/status', stepController.updateStepStatus);
router.delete('/steps/:id', stepController.deleteStep);
router.get('/steps/machine/:machineId', stepController.getStepsByMachineId);
router.get('/steps/operator/:operatorId', stepController.getStepsByOperatorId);

// Quality check routes
router.get('/quality/feedback/:feedbackId', qualityController.getQualityChecksByFeedbackId);
router.get('/quality/step/:stepId', qualityController.getQualityChecksByStepId);
router.get('/quality/:id', qualityController.getQualityCheckById);
router.get('/quality/checkId/:checkId', qualityController.getQualityCheckByCheckId);
router.post('/quality', qualityController.createQualityCheck);
router.post('/quality/batch', qualityController.createMultipleQualityChecks);
router.put('/quality/:id', qualityController.updateQualityCheck);
router.put('/quality/:id/result', qualityController.updateQualityCheckResult);
router.delete('/quality/:id', qualityController.deleteQualityCheck);
router.get('/quality/summary/:feedbackId', qualityController.getQualitySummaryByFeedbackId);

// Image routes
router.get('/images/feedback/:feedbackId', imageController.getImagesByFeedbackId);
router.get('/images/step/:stepId', imageController.getImagesByStepId);
router.get('/images/quality/:qualityCheckId', imageController.getImagesByQualityCheckId);
router.get('/images/:id', imageController.getImageById);
router.get('/images/imageId/:imageId', imageController.getImageByImageId);
router.post('/images', upload.single('image'), imageController.uploadImage);
router.put('/images/:id', imageController.updateImage);
router.delete('/images/:id', imageController.deleteImage);
router.get('/uploads/:filename', imageController.getImageFile);
router.get('/images/public/:feedbackId', imageController.getPublicImages);

// Comment routes
router.get('/comments/feedback/:feedbackId', commentController.getCommentsByFeedbackId);
router.get('/comments/:id', commentController.getCommentById);
router.post('/comments', commentController.createComment);
router.put('/comments/:id', commentController.updateComment);
router.delete('/comments/:id', commentController.deleteComment);
router.get('/comments/public/:feedbackId', commentController.getPublicComments);
router.get('/comments/customer/:feedbackId', commentController.getCustomerComments);
router.get('/comments/replies/:parentCommentId', commentController.getCommentReplies);

// Additional notification management routes
router.get('/notifications/recipient/:recipientType/:recipientId', notificationController.getNotificationsByRecipient);
router.get('/notifications/:notificationId', notificationController.getNotificationById);
router.post('/notifications/create', notificationController.createNotification);
router.put('/notifications/read/:notificationId', notificationController.markAsRead);
router.post('/notifications/read-multiple', notificationController.markMultipleAsRead);
router.get('/notifications/unread/:recipientType/:recipientId', notificationController.getUnreadCount);
router.post('/notifications/email/:notificationId', notificationController.sendEmailNotification);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);
*/

module.exports = router;
