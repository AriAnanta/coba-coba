/**
 * Production Routes
 *
 * API routes for production request management
 */
const express = require("express");
const productionController = require("../controllers/production.controller");
const router = express.Router();

// Get all production requests
router.get("/", productionController.getAllRequests);

// Get production request by ID
router.get("/:id", productionController.getRequestById);

// Create a new production request
router.post("/", productionController.createRequest);

// New endpoint for external production request ingestion
router.post("/ingest", productionController.createRequest);

// Update a production request
router.put("/:id", productionController.updateRequest);

// Delete a production request
router.delete("/:id", productionController.deleteRequest);

// Cancel a production request
router.post("/:id/cancel", productionController.cancelRequest);

module.exports = router;
