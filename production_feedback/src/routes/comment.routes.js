/**
 * Routes untuk Feedback Comment
 * 
 * Mendefinisikan routing untuk endpoint Feedback Comment
 */
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Semua routes membutuhkan autentikasi
router.use(verifyToken);

// Endpoint untuk mendapatkan data komentar
router.get('/feedback/:feedbackId', commentController.getCommentsByFeedbackId);
router.get('/:id', commentController.getCommentById);
router.get('/replies/:parentCommentId', commentController.getCommentReplies);
router.get('/public/:feedbackId', commentController.getPublicComments);
router.get('/customer/:feedbackId', commentController.getCustomerComments);

// Endpoint untuk mengelola komentar
router.post('/', commentController.createComment);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
