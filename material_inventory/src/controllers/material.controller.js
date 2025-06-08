/**
 * Controller Material
 * 
 * Mengelola operasi CRUD untuk material bahan baku
 */
const db = require('../models');
const Material = db.Material;
const Supplier = db.Supplier;
const MaterialTransaction = db.MaterialTransaction;
const { Op } = require('sequelize');

/**
 * Mendapatkan semua material
 */
exports.getAllMaterials = async (req, res) => {
  try {
    // Filter berdasarkan parameter query
    const { 
      category, 
      type, 
      status, 
      supplierId, 
      search,
      lowStock
    } = req.query;
    
    // Membangun kondisi WHERE
    const where = {};
    
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    
    // Pencarian berdasarkan nama atau deskripsi
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { materialId: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter stok rendah (di bawah reorder level)
    if (lowStock === 'true') {
      where.stockQuantity = {
        [Op.lte]: db.sequelize.col('reorderLevel')
      };
    }
    
    // Dapatkan data material dengan supplier
    const materials = await Material.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplierInfo',
          attributes: ['id', 'supplierId', 'name', 'contactPerson', 'phone', 'email']
        }
      ],
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    return res.status(200).json(materials);
  } catch (error) {
    console.error('Error pada getAllMaterials:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Mendapatkan satu material berdasarkan ID
 */
exports.getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Dapatkan material dengan supplier dan transaksi terbaru
    const material = await Material.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplierInfo',
          attributes: ['id', 'supplierId', 'name', 'contactPerson', 'phone', 'email', 'address']
        },
        {
          model: MaterialTransaction,
          as: 'transactions',
          limit: 10,
          order: [['transactionDate', 'DESC']]
        }
      ]
    });
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material tidak ditemukan'
      });
    }
    
    return res.status(200).json(material);
  } catch (error) {
    console.error('Error pada getMaterialById:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Membuat material baru
 */
exports.createMaterial = async (req, res) => {
  try {
    const {
      materialId,
      name,
      description,
      category,
      type,
      unit,
      stockQuantity,
      reorderLevel,
      price,
      leadTime,
      location,
      supplier,
      supplierId,
      status,
      notes
    } = req.body;
    
    // Validasi input
    if (!name || !category || !type || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Nama, kategori, tipe, dan satuan harus diisi'
      });
    }
    
    // Cek jika materialId sudah ada
    if (materialId) {
      const existingMaterial = await Material.findOne({
        where: { materialId }
      });
      
      if (existingMaterial) {
        return res.status(400).json({
          success: false,
          message: 'Material ID sudah digunakan'
        });
      }
    }
    
    // Generate materialId jika tidak disediakan
    const newMaterialId = materialId || `MAT-${Date.now().toString().slice(-6)}`;
    
    // Buat material baru
    const newMaterial = await Material.create({
      materialId: newMaterialId,
      name,
      description,
      category,
      type,
      unit,
      stockQuantity: stockQuantity || 0,
      reorderLevel: reorderLevel || 10,
      price,
      leadTime,
      location,
      supplier,
      supplierId,
      status: status || 'active',
      notes
    });
    
    // Buat transaksi awal jika stockQuantity > 0
    if (stockQuantity && stockQuantity > 0) {
      await MaterialTransaction.create({
        transactionId: `TR-${Date.now().toString().slice(-6)}`,
        materialId: newMaterial.id,
        type: 'receipt',
        quantity: stockQuantity,
        unit,
        price,
        supplierId,
        receivedBy: req.user ? req.user.username : 'system',
        previousQuantity: 0,
        newQuantity: stockQuantity,
        transactionDate: new Date(),
        notes: 'Stok awal',
        status: 'completed',
        location
      });
    }
    
    return res.status(201).json({
      success: true,
      message: 'Material berhasil dibuat',
      data: newMaterial
    });
  } catch (error) {
    console.error('Error pada createMaterial:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Memperbarui material
 */
exports.updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      type,
      unit,
      reorderLevel,
      price,
      leadTime,
      location,
      supplier,
      supplierId,
      status,
      notes,
      stockAdjustment,
      adjustmentReason
    } = req.body;
    
    // Cari material yang akan diupdate
    const material = await Material.findByPk(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material tidak ditemukan'
      });
    }
    
    // Simpan stok sebelumnya
    const previousQuantity = material.stockQuantity;
    
    // Hitung stok baru jika ada penyesuaian
    let newQuantity = previousQuantity;
    if (stockAdjustment !== undefined) {
      newQuantity = parseFloat(stockAdjustment);
      
      // Buat transaksi penyesuaian stok
      if (newQuantity !== previousQuantity) {
        await MaterialTransaction.create({
          transactionId: `TR-${Date.now().toString().slice(-6)}`,
          materialId: material.id,
          type: 'adjustment',
          quantity: newQuantity - previousQuantity,
          unit: material.unit,
          previousQuantity,
          newQuantity,
          transactionDate: new Date(),
          notes: adjustmentReason || 'Penyesuaian stok manual',
          issuedBy: req.user ? req.user.username : 'system',
          status: 'completed',
          location: material.location
        });
      }
    }
    
    // Update material
    await material.update({
      name: name || material.name,
      description: description !== undefined ? description : material.description,
      category: category || material.category,
      type: type || material.type,
      unit: unit || material.unit,
      stockQuantity: newQuantity,
      reorderLevel: reorderLevel !== undefined ? reorderLevel : material.reorderLevel,
      price: price !== undefined ? price : material.price,
      leadTime: leadTime !== undefined ? leadTime : material.leadTime,
      location: location !== undefined ? location : material.location,
      supplier: supplier !== undefined ? supplier : material.supplier,
      supplierId: supplierId !== undefined ? supplierId : material.supplierId,
      status: status || material.status,
      notes: notes !== undefined ? notes : material.notes
    });
    
    return res.status(200).json({
      success: true,
      message: 'Material berhasil diperbarui',
      data: material
    });
  } catch (error) {
    console.error('Error pada updateMaterial:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Menghapus material
 */
exports.deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cari material yang akan dihapus
    const material = await Material.findByPk(id);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material tidak ditemukan'
      });
    }
    
    // Cek apakah material memiliki transaksi
    const transactionCount = await MaterialTransaction.count({
      where: { materialId: id }
    });
    
    if (transactionCount > 0) {
      // Jangan hapus, cukup set status jadi discontinued
      await material.update({ status: 'discontinued' });
      
      return res.status(200).json({
        success: true,
        message: 'Material telah dinonaktifkan karena memiliki riwayat transaksi'
      });
    } else {
      // Hapus material jika tidak ada transaksi
      await material.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Material berhasil dihapus'
      });
    }
  } catch (error) {
    console.error('Error pada deleteMaterial:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Mendapatkan semua kategori material
 */
exports.getMaterialCategories = async (req, res) => {
  try {
    const categories = await Material.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    }).then(categories => categories.map(c => c.category));
    
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error pada getMaterialCategories:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Mendapatkan semua tipe material
 */
exports.getMaterialTypes = async (req, res) => {
  try {
    const types = await Material.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('type')), 'type']],
      order: [['type', 'ASC']]
    }).then(types => types.map(t => t.type));
    
    return res.status(200).json(types);
  } catch (error) {
    console.error('Error pada getMaterialTypes:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Pemeriksaan stok material
 */
exports.checkMaterialStock = async (req, res) => {
  try {
    const { materials } = req.body;
    
    // Validasi input
    if (!materials || !Array.isArray(materials)) {
      return res.status(400).json({
        success: false,
        message: 'Data material tidak valid'
      });
    }
    
    // Cari semua materialId yang diminta
    const materialIds = materials.map(item => item.materialId);
    
    // Dapatkan material dari database
    const dbMaterials = await Material.findAll({
      where: { 
        [Op.or]: [
          { materialId: { [Op.in]: materialIds } },
          { id: { [Op.in]: materialIds.filter(id => !isNaN(id)) } }
        ]
      }
    });
    
    // Periksa ketersediaan stok
    const stockCheck = materials.map(reqMaterial => {
      const dbMaterial = dbMaterials.find(
        m => m.materialId === reqMaterial.materialId || m.id.toString() === reqMaterial.materialId
      );
      
      if (!dbMaterial) {
        return {
          materialId: reqMaterial.materialId,
          name: 'Unknown',
          requested: reqMaterial.quantity,
          available: 0,
          unit: 'Unknown',
          sufficient: false,
          status: 'not_found'
        };
      }
      
      const sufficient = dbMaterial.stockQuantity >= reqMaterial.quantity;
      
      return {
        materialId: dbMaterial.materialId,
        name: dbMaterial.name,
        requested: reqMaterial.quantity,
        available: dbMaterial.stockQuantity,
        unit: dbMaterial.unit,
        sufficient,
        status: sufficient ? 'available' : 'insufficient'
      };
    });
    
    // Cek apakah semua material memiliki stok yang cukup
    const allSufficient = stockCheck.every(item => item.sufficient);
    
    return res.status(200).json({
      success: true,
      allSufficient,
      materials: stockCheck
    });
  } catch (error) {
    console.error('Error pada checkMaterialStock:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Membuat transaksi pengeluaran material
 */
exports.issueMaterials = async (req, res) => {
  try {
    const {
      materials,
      productionOrderId,
      referenceNumber,
      notes
    } = req.body;
    
    // Validasi input
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data material tidak valid'
      });
    }
    
    // Mulai transaksi database
    const t = await db.sequelize.transaction();
    
    try {
      // Proses setiap material
      const transactionResults = [];
      
      for (const item of materials) {
        // Cari material
        const material = await Material.findOne({
          where: { 
            [Op.or]: [
              { materialId: item.materialId },
              { id: item.materialId }
            ]
          },
          transaction: t
        });
        
        if (!material) {
          throw new Error(`Material dengan ID ${item.materialId} tidak ditemukan`);
        }
        
        // Validasi stok
        if (material.stockQuantity < item.quantity) {
          throw new Error(`Stok tidak cukup untuk material ${material.name}`);
        }
        
        // Hitung stok baru
        const previousQuantity = material.stockQuantity;
        const newQuantity = previousQuantity - item.quantity;
        
        // Update stok material
        await material.update(
          { stockQuantity: newQuantity },
          { transaction: t }
        );
        
        // Buat transaksi pengeluaran
        const transaction = await MaterialTransaction.create({
          transactionId: `TRO-${Date.now().toString().slice(-6)}-${transactionResults.length + 1}`,
          materialId: material.id,
          type: 'issue',
          quantity: -item.quantity, // Negatif untuk pengeluaran
          unit: material.unit,
          price: material.price,
          previousQuantity,
          newQuantity,
          referenceNumber,
          productionOrderId,
          issuedBy: req.user ? req.user.username : 'system',
          transactionDate: new Date(),
          notes: item.notes || notes || 'Pengeluaran untuk produksi',
          status: 'completed',
          location: material.location
        }, { transaction: t });
        
        transactionResults.push({
          material: {
            id: material.id,
            materialId: material.materialId,
            name: material.name
          },
          quantity: item.quantity,
          unit: material.unit,
          transactionId: transaction.transactionId
        });
        
        // Cek jika stok di bawah reorder level
        if (newQuantity <= material.reorderLevel) {
          // TODO: Kirim notifikasi stok rendah
          console.log(`Stok ${material.name} di bawah reorder level`);
        }
      }
      
      // Commit transaksi jika semua berhasil
      await t.commit();
      
      return res.status(200).json({
        success: true,
        message: 'Pengeluaran material berhasil',
        transactionDate: new Date(),
        referenceNumber,
        productionOrderId,
        transactions: transactionResults
      });
    } catch (error) {
      // Rollback transaksi jika terjadi kesalahan
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error pada issueMaterials:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Membuat transaksi penerimaan material
 */
exports.receiveMaterials = async (req, res) => {
  try {
    const {
      materials,
      supplierId,
      referenceNumber,
      notes
    } = req.body;
    
    // Validasi input
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data material tidak valid'
      });
    }
    
    // Mulai transaksi database
    const t = await db.sequelize.transaction();
    
    try {
      // Proses setiap material
      const transactionResults = [];
      
      for (const item of materials) {
        // Cari material
        const material = await Material.findOne({
          where: { 
            [Op.or]: [
              { materialId: item.materialId },
              { id: item.materialId }
            ]
          },
          transaction: t
        });
        
        if (!material) {
          throw new Error(`Material dengan ID ${item.materialId} tidak ditemukan`);
        }
        
        // Hitung stok baru
        const previousQuantity = material.stockQuantity;
        const newQuantity = previousQuantity + item.quantity;
        
        // Update stok material
        await material.update(
          { 
            stockQuantity: newQuantity,
            // Update harga jika ada perubahan
            price: item.price || material.price
          },
          { transaction: t }
        );
        
        // Buat transaksi penerimaan
        const transaction = await MaterialTransaction.create({
          transactionId: `TRI-${Date.now().toString().slice(-6)}-${transactionResults.length + 1}`,
          materialId: material.id,
          type: 'receipt',
          quantity: item.quantity,
          unit: material.unit,
          price: item.price || material.price,
          batchNumber: item.batchNumber,
          previousQuantity,
          newQuantity,
          referenceNumber,
          supplierId,
          receivedBy: req.user ? req.user.username : 'system',
          transactionDate: new Date(),
          notes: item.notes || notes || 'Penerimaan material',
          status: 'completed',
          location: item.location || material.location
        }, { transaction: t });
        
        transactionResults.push({
          material: {
            id: material.id,
            materialId: material.materialId,
            name: material.name
          },
          quantity: item.quantity,
          unit: material.unit,
          transactionId: transaction.transactionId
        });
      }
      
      // Commit transaksi jika semua berhasil
      await t.commit();
      
      return res.status(200).json({
        success: true,
        message: 'Penerimaan material berhasil',
        transactionDate: new Date(),
        referenceNumber,
        supplierId,
        transactions: transactionResults
      });
    } catch (error) {
      // Rollback transaksi jika terjadi kesalahan
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error pada receiveMaterials:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Kesalahan server internal',
      error: error.message
    });
  }
};

/**
 * Mendapatkan laporan stok material
 */
exports.getMaterialStockReport = async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    
    // Membangun kondisi WHERE
    const where = {};
    
    if (category) where.category = category;
    
    // Filter stok rendah (di bawah reorder level)
    if (lowStock === 'true') {
      where.stockQuantity = {
        [Op.lte]: db.sequelize.col('reorderLevel')
      };
    }
    
    // Dapatkan semua material dengan filter
    const materials = await Material.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplierInfo',
          attributes: ['id', 'name', 'contactPerson', 'phone', 'email']
        }
      ],
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    // Hitung nilai total persediaan
    const totalInventoryValue = materials.reduce((sum, material) => {
      return sum + (material.price || 0) * material.stockQuantity;
    }, 0);
    
    // Hitung jumlah material dengan stok rendah
    const lowStockCount = materials.filter(material => 
      material.stockQuantity <= material.reorderLevel
    ).length;
    
    return res.status(200).json({
      success: true,
      totalMaterials: materials.length,
      totalInventoryValue,
      lowStockCount,
      materials
    });
  } catch (error) {
    console.error('Error pada getMaterialStockReport:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      error: error.message
    });
  }
};
