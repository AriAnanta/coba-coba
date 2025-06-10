/**
 * Quantity Stock Routes
 */
const express = require("express");
const router = express.Router();
const quantityStockController = require("../controllers/quantity_stock.controller");

// Rute untuk Quantity Stock
router.get("/", quantityStockController.getAllQuantityStock);
router.get("/:id", quantityStockController.getQuantityStockById);
router.get(
  "/product/:productName",
  quantityStockController.getQuantityStockByProductName
);
router.post("/", quantityStockController.createQuantityStock);
router.put("/:id", quantityStockController.updateQuantityStock);
router.delete("/:id", quantityStockController.deleteQuantityStock);

module.exports = router;
