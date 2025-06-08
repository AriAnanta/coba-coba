/**
 * Routes API untuk Supplier (Pemasok)
 *
 * Mengelola endpoint API untuk pemasok bahan baku
 */
const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Semua routes dilindungi dengan middleware verifikasi token
// router.use(verifyToken);

// Routes untuk supplier
router.get("/", supplierController.getAllSuppliers);
router.get("/performance", supplierController.getSupplierPerformance);
router.get("/:id", supplierController.getSupplierById);
router.get("/:id/materials", supplierController.getSupplierMaterials);
router.post("/", supplierController.createSupplier);
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;
