/**
 * Routes API untuk Transaksi Material
 *
 * Mengelola endpoint API untuk transaksi material (penerimaan, pengeluaran, penyesuaian)
 */
const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Semua routes dilindungi dengan middleware verifikasi token
// router.use(verifyToken);

// Routes untuk transaksi material
router.get("/", transactionController.getAllTransactions);
router.get("/report", transactionController.getTransactionReport);
router.get(
  "/materials/:materialId",
  transactionController.getMaterialTransactionHistory
);
router.get("/:id", transactionController.getTransactionById);
router.post("/adjustment", transactionController.createStockAdjustment);

module.exports = router;
