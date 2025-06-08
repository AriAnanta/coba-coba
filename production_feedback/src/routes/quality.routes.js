/**
 * Routes untuk Quality Check
 * 
 * Mendefinisikan routing untuk endpoint Quality Check
 */
const express = require('express');
const router = express.Router();
const qualityController = require('../controllers/quality.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Semua routes membutuhkan autentikasi
router.use(verifyToken);

// Endpoint untuk mendapatkan data pemeriksaan kualitas
router.get('/feedback/:feedbackId', qualityController.getQualityChecksByFeedbackId);
router.get('/step/:stepId', qualityController.getQualityChecksByStepId);
router.get('/:id', qualityController.getQualityCheckById);
router.get('/check-id/:checkId', qualityController.getQualityCheckByCheckId);
router.get('/summary/:feedbackId', qualityController.getQualitySummary);

// Endpoint untuk mengelola pemeriksaan kualitas (memerlukan role tertentu)
router.post('/', checkRole(['production_manager', 'quality_inspector', 'admin']), qualityController.createQualityCheck);
router.post('/batch', checkRole(['production_manager', 'quality_inspector', 'admin']), qualityController.createBatchQualityChecks);
router.put('/:id', checkRole(['production_manager', 'quality_inspector', 'admin']), qualityController.updateQualityCheck);
router.put('/:id/result', checkRole(['production_manager', 'quality_inspector', 'admin']), qualityController.updateQualityResult);
router.delete('/:id', checkRole(['production_manager', 'admin']), qualityController.deleteQualityCheck);

module.exports = router;
