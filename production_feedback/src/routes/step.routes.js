/**
 * Routes untuk Production Step
 * 
 * Mendefinisikan routing untuk endpoint Production Step
 */
const express = require('express');
const router = express.Router();
const stepController = require('../controllers/step.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Semua routes membutuhkan autentikasi
router.use(verifyToken);

// Endpoint untuk mendapatkan data langkah produksi
router.get('/feedback/:feedbackId', stepController.getStepsByFeedbackId);
router.get('/:id', stepController.getStepById);
router.get('/step-id/:stepId', stepController.getStepByStepId);

// Endpoint untuk mengelola langkah produksi (memerlukan role tertentu)
router.post('/', checkRole(['production_manager', 'production_operator', 'admin']), stepController.createStep);
router.post('/batch', checkRole(['production_manager', 'production_operator', 'admin']), stepController.createBatchSteps);
router.put('/:id', checkRole(['production_manager', 'production_operator', 'admin']), stepController.updateStep);
router.put('/:id/status', checkRole(['production_manager', 'production_operator', 'admin']), stepController.updateStepStatus);
router.put('/:id/timing', checkRole(['production_manager', 'production_operator', 'admin']), stepController.updateStepTiming);
router.delete('/:id', checkRole(['production_manager', 'admin']), stepController.deleteStep);

module.exports = router;
