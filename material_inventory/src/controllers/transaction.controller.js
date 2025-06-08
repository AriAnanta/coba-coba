/**
 * Controller Transaksi Material
 * 
 * Mengelola operasi terkait transaksi material (penerimaan, pengeluaran, penyesuaian)
 */
const db = require('../models');
const MaterialTransaction = db.MaterialTransaction;
const Material = db.Material;
const Supplier = db.Supplier;
const { Op } = require('sequelize');

/**
 * Mendapatkan semua transaksi material
 */
exports.getAllTransactions = async (req, res) => {
  try {
    // Filter berdasarkan parameter query
    const { 
      type,
      materialId,
      supplierId,
      startDate,
      endDate,
      productionOrderId,
      referenceNumber
    } = req.query;
    
    // Membangun kondisi WHERE
    const where = {};
    
    if (type) where.type = type;
    if (materialId) where.materialId = materialId;
    if (supplierId) where.supplierId = supplierId;
    if (productionOrderId) where.productionOrderId = productionOrderId;
    if (referenceNumber) where.referenceNumber = referenceNumber;
    
    // Filter berdasarkan rentang tanggal
    if (startDate || endDate) {
      where.transactionDate = {};
      
      if (startDate) {
        where.transactionDate[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        // Tambahkan 1 hari ke endDate untuk mencakup seluruh hari
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        where.transactionDate[Op.lt] = endDateTime;
      }
    }
    
    // Dapatkan data transaksi dengan material dan supplier
    const transactions = await MaterialTransaction.findAll({
      where,
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'materialId', 'name', 'category', 'type', 'unit']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplierId', 'name', 'contactPerson']
        }
      ],
      order: [['transactionDate', 'DESC']]
    });
    
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error pada getAllTransactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Mendapatkan satu transaksi berdasarkan ID
 */
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Dapatkan transaksi dengan material dan supplier
    const transaction = await MaterialTransaction.findByPk(id, {
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'materialId', 'name', 'category', 'type', 'unit', 'stockQuantity']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplierId', 'name', 'contactPerson', 'phone', 'email']
        }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }
    
    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Error pada getTransactionById:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Membuat transaksi penyesuaian stok
 */
exports.createStockAdjustment = async (req, res) => {
  try {
    const {
      materialId,
      newQuantity,
      notes
    } = req.body;
    
    // Validasi input
    if (materialId === undefined || newQuantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'ID material dan jumlah baru harus diisi'
      });
    }
    
    // Cari material
    const material = await Material.findByPk(materialId);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material tidak ditemukan'
      });
    }
    
    // Mulai transaksi database
    const t = await db.sequelize.transaction();
    
    try {
      // Simpan stok sebelumnya
      const previousQuantity = material.stockQuantity;
      const adjustmentQuantity = newQuantity - previousQuantity;
      
      // Hanya lanjutkan jika ada perubahan stok
      if (adjustmentQuantity === 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Tidak ada perubahan stok'
        });
      }
      
      // Update stok material
      await material.update(
        { stockQuantity: newQuantity },
        { transaction: t }
      );
      
      // Buat transaksi penyesuaian
      const transaction = await MaterialTransaction.create({
        transactionId: `TRA-${Date.now().toString().slice(-6)}`,
        materialId: material.id,
        type: 'adjustment',
        quantity: adjustmentQuantity,
        unit: material.unit,
        price: material.price,
        previousQuantity,
        newQuantity,
        issuedBy: req.user ? req.user.username : 'system',
        transactionDate: new Date(),
        notes: notes || 'Penyesuaian stok manual',
        status: 'completed',
        location: material.location
      }, { transaction: t });
      
      // Commit transaksi jika berhasil
      await t.commit();
      
      return res.status(201).json({
        success: true,
        message: 'Penyesuaian stok berhasil',
        data: {
          material: {
            id: material.id,
            materialId: material.materialId,
            name: material.name,
            previousQuantity,
            newQuantity,
            unit: material.unit
          },
          transaction: {
            id: transaction.id,
            transactionId: transaction.transactionId,
            type: transaction.type,
            quantity: transaction.quantity,
            transactionDate: transaction.transactionDate
          }
        }
      });
    } catch (error) {
      // Rollback transaksi jika gagal
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error pada createStockAdjustment:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Mendapatkan riwayat transaksi untuk satu material
 */
exports.getMaterialTransactionHistory = async (req, res) => {
  try {
    const { materialId } = req.params;
    
    // Validasi materialId
    const material = await Material.findByPk(materialId);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material tidak ditemukan'
      });
    }
    
    // Filter berdasarkan parameter query
    const { startDate, endDate, type } = req.query;
    
    // Membangun kondisi WHERE
    const where = { materialId };
    
    if (type) where.type = type;
    
    // Filter berdasarkan rentang tanggal
    if (startDate || endDate) {
      where.transactionDate = {};
      
      if (startDate) {
        where.transactionDate[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        // Tambahkan 1 hari ke endDate untuk mencakup seluruh hari
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        where.transactionDate[Op.lt] = endDateTime;
      }
    }
    
    // Dapatkan riwayat transaksi
    const transactions = await MaterialTransaction.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplierId', 'name']
        }
      ],
      order: [['transactionDate', 'DESC']]
    });
    
    // Hitung ringkasan
    const summary = {
      totalReceipts: 0,
      totalIssues: 0,
      totalAdjustments: 0
    };
    
    transactions.forEach(transaction => {
      if (transaction.type === 'receipt') {
        summary.totalReceipts += transaction.quantity;
      } else if (transaction.type === 'issue') {
        summary.totalIssues += Math.abs(transaction.quantity); // Nilai absolut
      } else if (transaction.type === 'adjustment') {
        summary.totalAdjustments += transaction.quantity;
      }
    });
    
    return res.status(200).json({
      success: true,
      material: {
        id: material.id,
        materialId: material.materialId,
        name: material.name,
        category: material.category,
        type: material.type,
        unit: material.unit,
        currentStock: material.stockQuantity
      },
      summary,
      transactions
    });
  } catch (error) {
    console.error('Error pada getMaterialTransactionHistory:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Mendapatkan laporan transaksi berdasarkan periode
 */
exports.getTransactionReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    // Validasi input
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal awal dan akhir harus diisi'
      });
    }
    
    // Membangun kondisi WHERE
    const where = {};
    
    if (type) where.type = type;
    
    // Filter berdasarkan rentang tanggal
    where.transactionDate = {
      [Op.gte]: new Date(startDate),
      [Op.lt]: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1))
    };
    
    // Dapatkan semua transaksi dalam periode
    const transactions = await MaterialTransaction.findAll({
      where,
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'materialId', 'name', 'category', 'type', 'unit']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'supplierId', 'name']
        }
      ],
      order: [['transactionDate', 'ASC']]
    });
    
    // Hitung ringkasan berdasarkan jenis transaksi
    const summary = {
      totalCount: transactions.length,
      receipt: {
        count: 0,
        totalQuantity: 0,
        totalValue: 0
      },
      issue: {
        count: 0,
        totalQuantity: 0,
        totalValue: 0
      },
      adjustment: {
        count: 0,
        totalPositive: 0,
        totalNegative: 0,
        totalValue: 0
      },
      return: {
        count: 0,
        totalQuantity: 0,
        totalValue: 0
      }
    };
    
    // Hitung ringkasan berdasarkan kategori material
    const categoryStats = {};
    
    transactions.forEach(transaction => {
      const category = transaction.material.category;
      const value = (transaction.price || 0) * Math.abs(transaction.quantity);
      
      // Tambahkan ke statistik kategori
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalValue: 0
        };
      }
      
      categoryStats[category].count++;
      categoryStats[category].totalValue += value;
      
      // Tambahkan ke ringkasan jenis transaksi
      if (transaction.type === 'receipt') {
        summary.receipt.count++;
        summary.receipt.totalQuantity += transaction.quantity;
        summary.receipt.totalValue += value;
      } else if (transaction.type === 'issue') {
        summary.issue.count++;
        summary.issue.totalQuantity += Math.abs(transaction.quantity);
        summary.issue.totalValue += value;
      } else if (transaction.type === 'adjustment') {
        summary.adjustment.count++;
        
        if (transaction.quantity > 0) {
          summary.adjustment.totalPositive += transaction.quantity;
        } else {
          summary.adjustment.totalNegative += Math.abs(transaction.quantity);
        }
        
        summary.adjustment.totalValue += value;
      } else if (transaction.type === 'return') {
        summary.return.count++;
        summary.return.totalQuantity += transaction.quantity;
        summary.return.totalValue += value;
      }
    });
    
    return res.status(200).json({
      success: true,
      period: {
        startDate,
        endDate
      },
      summary,
      categoryStats,
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        transactionId: transaction.transactionId,
        type: transaction.type,
        materialId: transaction.material.materialId,
        materialName: transaction.material.name,
        quantity: transaction.quantity,
        unit: transaction.unit,
        price: transaction.price,
        value: (transaction.price || 0) * Math.abs(transaction.quantity),
        transactionDate: transaction.transactionDate,
        referenceNumber: transaction.referenceNumber,
        supplier: transaction.supplier ? transaction.supplier.name : null
      }))
    });
  } catch (error) {
    console.error('Error pada getTransactionReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};
