/**
 * Routes API untuk Material
 *
 * Mengelola endpoint API untuk material bahan baku
 */
const express = require("express");
const router = express.Router();
const materialController = require("../controllers/material.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Semua routes dilindungi dengan middleware verifikasi token
// router.use(verifyToken);

// Routes untuk material
router.get("/", materialController.getAllMaterials);
router.get("/categories", materialController.getMaterialCategories);
router.get("/types", materialController.getMaterialTypes);
router.get("/transaction-types", materialController.getTransactionTypes);
router.get("/suppliers", materialController.getSuppliers);
router.get("/stock-report", materialController.getMaterialStockReport);
router.post("/check-stock", materialController.checkMaterialStock);
router.post("/issue", materialController.issueMaterials);
router.post("/receive", materialController.receiveMaterials);
router.get("/replenishable", materialController.getReplenishableMaterials);
router.post("/purchase", materialController.purchaseMaterials);
router.get(
  "/recalculate-statuses",
  materialController.recalculateMaterialStatuses
);
router.get("/:id", materialController.getMaterialById);
router.post("/", materialController.createMaterial);
router.put("/:id", materialController.updateMaterial);
router.delete("/:id", materialController.deleteMaterial);

module.exports = router;
