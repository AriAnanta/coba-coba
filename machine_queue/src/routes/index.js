/**
 * Routes Index
 * 
 * Menggabungkan semua routes untuk Machine Queue Service
 */
const express = require('express');
const queueRoutes = require('./queue.routes');
const machineRoutes = require('./machine.routes');
const uiRoutes = require('./ui.routes');

const router = express.Router();

// API Routes
router.use('/api', queueRoutes);
router.use('/api', machineRoutes);

// UI Routes
router.use('/', uiRoutes);

module.exports = router;
