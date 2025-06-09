/**
 * Batch Routes
 *
 * API routes for production batch management
 */
const express = require("express");
const batchController = require("../controllers/batch.controller");
const router = express.Router();

// Production Batch routes
router.get("/", batchController.getAllBatches);
router.get("/:id", batchController.getBatchById);
router.post("/", batchController.createBatch);
router.put("/:id", batchController.updateBatch);
router.delete("/:id", batchController.deleteBatch);

// Production Steps routes
router.get("/:batchId/steps", batchController.getBatchSteps);
router.post("/:batchId/steps", batchController.createProductionStep);
router.put("/:batchId/steps/:stepId", batchController.updateProductionStep);
router.delete("/:batchId/steps/:stepId", batchController.deleteProductionStep);
router.put(
  "/:batchId/steps/:stepId/complete",
  batchController.completeProductionStep
);

// Material Allocations routes
router.get("/:batchId/materials", batchController.getBatchMaterials);
router.post("/:batchId/materials", batchController.createMaterialAllocation);
router.put(
  "/:batchId/materials/:allocationId",
  batchController.updateMaterialAllocation
);
router.delete(
  "/:batchId/materials/:allocationId",
  batchController.deleteMaterialAllocation
);
router.put(
  "/:batchId/materials/:allocationId/allocate",
  batchController.allocateMaterial
);
router.put(
  "/:batchId/materials/:allocationId/consume",
  batchController.consumeMaterial
);

module.exports = router;
