/**
 * Routes API Mesin
 * 
 * Mendefinisikan endpoint API untuk pengelolaan mesin
 */
const express = require('express');
const machineController = require('../controllers/machine.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Terapkan middleware otentikasi untuk semua route
router.use(authMiddleware);

// Routes mesin
router.get('/machines', machineController.getAllMachines);
router.get('/machines/:id', machineController.getMachineById);
router.get('/machines/type/:type', machineController.getMachinesByType);
router.get('/machine-types', machineController.getMachineTypes);
router.get('/machines-for-product', machineController.getMachinesForProduct);
router.post('/machines', machineController.createMachine);
router.put('/machines/:id', machineController.updateMachine);
router.delete('/machines/:id', machineController.deleteMachine);
router.post('/machines/check-capacity', machineController.checkCapacity);

module.exports = router;
