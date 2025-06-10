/**
 * Quantity Stock Controller
 * Handles quantity stock data operations
 */

const { Op } = require("sequelize");
const { QuantityStock } = require("../models");

// Fungsi untuk membuat ID unik
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

// Mendapatkan semua data quantity_stock
const getAllQuantityStock = async (req, res) => {
  try {
    const stocks = await QuantityStock.findAll();
    return res.status(200).json(stocks);
  } catch (error) {
    console.error("Error mendapatkan semua quantity stock:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil data quantity stock" });
  }
};

// Mendapatkan quantity_stock berdasarkan ID
const getQuantityStockById = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await QuantityStock.findByPk(id);
    if (stock) {
      return res.status(200).json(stock);
    } else {
      return res
        .status(404)
        .json({ message: "Quantity stock tidak ditemukan" });
    }
  } catch (error) {
    console.error("Error mendapatkan quantity stock berdasarkan ID:", error);
    return res
      .status(500)
      .json({ message: "Gagal mengambil data quantity stock" });
  }
};

// Mendapatkan quantity_stock berdasarkan nama produk
const getQuantityStockByProductName = async (req, res) => {
  try {
    const { productName } = req.params;
    const stock = await QuantityStock.findOne({ where: { productName } });
    if (stock) {
      return res.status(200).json(stock);
    } else {
      return res
        .status(404)
        .json({ message: "Quantity stock untuk produk ini tidak ditemukan" });
    }
  } catch (error) {
    console.error(
      "Error mendapatkan quantity stock berdasarkan nama produk:",
      error
    );
    return res
      .status(500)
      .json({ message: "Gagal mengambil data quantity stock" });
  }
};

// Membuat quantity_stock baru
const createQuantityStock = async (req, res) => {
  try {
    const { productName, quantity, reorderPoint, status } = req.body;
    const newStock = await QuantityStock.create({
      // ID otomatis diatur oleh database
      productName,
      quantity,
      reorderPoint,
      status: status || "received",
    });
    return res
      .status(201)
      .json({ message: "Quantity stock berhasil dibuat", stock: newStock });
  } catch (error) {
    console.error("Error membuat quantity stock:", error);
    return res.status(500).json({ message: "Gagal membuat quantity stock" });
  }
};

// Memperbarui quantity_stock
const updateQuantityStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, quantity, reorderPoint, status } = req.body;
    const [updatedRows] = await QuantityStock.update(
      {
        productName,
        quantity,
        reorderPoint,
        status,
      },
      { where: { id } }
    );
    if (updatedRows > 0) {
      const updatedStock = await QuantityStock.findByPk(id);
      return res.status(200).json({
        message: "Quantity stock berhasil diperbarui",
        stock: updatedStock,
      });
    } else {
      return res
        .status(404)
        .json({ message: "Quantity stock tidak ditemukan" });
    }
  } catch (error) {
    console.error("Error memperbarui quantity stock:", error);
    return res
      .status(500)
      .json({ message: "Gagal memperbarui quantity stock" });
  }
};

// Menghapus quantity_stock
const deleteQuantityStock = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await QuantityStock.destroy({ where: { id } });
    if (deletedRows > 0) {
      return res
        .status(200)
        .json({ message: "Quantity stock berhasil dihapus" });
    } else {
      return res
        .status(404)
        .json({ message: "Quantity stock tidak ditemukan" });
    }
  } catch (error) {
    console.error("Error menghapus quantity stock:", error);
    return res.status(500).json({ message: "Gagal menghapus quantity stock" });
  }
};

module.exports = {
  getAllQuantityStock,
  getQuantityStockById,
  getQuantityStockByProductName,
  createQuantityStock,
  updateQuantityStock,
  deleteQuantityStock,
};
