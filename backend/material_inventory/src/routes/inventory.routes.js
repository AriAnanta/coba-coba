const express = require('express');
const inventoryController = require('../controllers/inventory.controller');
const router = express.Router();

// Material inventory routes
router.get('/', inventoryController.getAllMaterials);
router.get('/:materialId', inventoryController.getMaterialById);
router.post('/', inventoryController.addMaterial);
router.put('/:materialId', inventoryController.updateMaterial);
router.delete('/:materialId', inventoryController.deleteMaterial);

// Stock management routes
router.get('/:materialId/stock', inventoryController.getStock);
router.post('/:materialId/stock/add', inventoryController.addStock);
router.post('/:materialId/stock/consume', inventoryController.consumeStock);

// Reservation routes
router.post('/reserve', inventoryController.reserveMaterials);
router.post('/release', inventoryController.releaseMaterials);
router.get('/reservations', inventoryController.getReservations);

// Reports
router.get('/reports/low-stock', inventoryController.getLowStockReport);
router.get('/reports/usage', inventoryController.getUsageReport);

module.exports = router;
