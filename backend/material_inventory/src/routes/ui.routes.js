/**
 * Routes UI untuk Material Inventory Service
 * 
 * Mendefinisikan halaman UI dan pengelolaan sesi
 */
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { Material, Supplier, MaterialTransaction } = require('../models');
const { Op } = require('sequelize');

// Middleware untuk memeriksa sesi/autentikasi
const checkAuth = async (req, res, next) => {
  try {
    // Cek apakah pengguna memiliki cookie token
    const token = req.cookies.token;

    if (!token) {
      return res.redirect('/login');
    }

    try {
      // Verifikasi token dengan User Service
      const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/auth/verify`, { token });
      
      // Simpan data pengguna di req untuk digunakan dalam tampilan
      req.user = response.data.user;
      
      next();
    } catch (error) {
      // Token tidak valid atau kedaluwarsa
      res.clearCookie('token');
      return res.redirect('/login');
    }
  } catch (error) {
    console.error('Error pada middleware autentikasi UI:', error);
    return res.status(500).render('error', {
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
};

// Middleware untuk memeriksa role
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/login');
    }

    const userRole = req.user.role;
    
    if (roles.length > 0 && !roles.includes(userRole)) {
      return res.status(403).render('error', {
        user: req.user,
        error: {
          status: 403,
          message: 'Anda tidak memiliki izin untuk mengakses halaman ini'
        }
      });
    }
    
    next();
  };
};

// Login
router.get('/login', (req, res) => {
  // Jika sudah memiliki token yang valid, redirect ke dashboard
  if (req.cookies.token) {
    return res.redirect('/');
  }
  
  res.render('login', {
    title: 'Login - Material Inventory Service',
    error: req.query.error,
    success: req.query.success
  });
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.redirect('/login?error=Username dan password harus diisi');
    }
    
    try {
      // Autentikasi melalui User Service
      const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/auth/login`, {
        username,
        password
      });
      
      // Set token sebagai cookie
      res.cookie('token', response.data.token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 hari
      });
      
      return res.redirect('/');
    } catch (error) {
      let errorMessage = 'Gagal login';
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      return res.redirect(`/login?error=${errorMessage}`);
    }
  } catch (error) {
    console.error('Error pada login:', error);
    return res.redirect('/login?error=Kesalahan server internal');
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.redirect('/login?success=Berhasil logout');
});

// Dashboard - halaman utama setelah login
router.get('/', checkAuth, async (req, res) => {
  try {
    // Dapatkan statistik inventory
    const [
      totalMaterials, 
      totalSuppliers, 
      lowStockMaterials,
      totalTransactionsToday
    ] = await Promise.all([
      Material.count(),
      Supplier.count(),
      Material.count({ 
        where: db.sequelize.literal('stockQuantity <= reorderLevel') 
      }),
      MaterialTransaction.count({
        where: {
          transactionDate: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);
    
    // Dapatkan 5 material dengan stok terendah
    const lowStockItems = await Material.findAll({
      where: db.sequelize.literal('stockQuantity <= reorderLevel'),
      order: [
        [db.sequelize.literal('stockQuantity / reorderLevel'), 'ASC']
      ],
      limit: 5,
      include: [
        {
          model: Supplier,
          as: 'supplierInfo',
          attributes: ['id', 'name', 'contactPerson', 'phone']
        }
      ]
    });
    
    // Dapatkan 5 transaksi terbaru
    const recentTransactions = await MaterialTransaction.findAll({
      order: [['transactionDate', 'DESC']],
      limit: 5,
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'materialId', 'name', 'category']
        }
      ]
    });
    
    res.render('dashboard', {
      title: 'Dashboard - Material Inventory Service',
      user: req.user,
      stats: {
        totalMaterials,
        totalSuppliers,
        lowStockMaterials,
        totalTransactionsToday
      },
      lowStockItems,
      recentTransactions
    });
  } catch (error) {
    console.error('Error pada dashboard:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Material: Daftar material
router.get('/materials', checkAuth, async (req, res) => {
  try {
    const { category, type, status, supplierId, search, lowStock } = req.query;
    
    // Filter
    const where = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    
    // Pencarian
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { materialId: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter stok rendah
    if (lowStock === 'true') {
      where.stockQuantity = {
        [Op.lte]: db.sequelize.col('reorderLevel')
      };
    }
    
    // Dapatkan kategori untuk filter
    const categories = await Material.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    }).then(categories => categories.map(c => c.category));
    
    // Dapatkan daftar supplier untuk filter
    const suppliers = await Supplier.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
    
    // Dapatkan daftar material
    const materials = await Material.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplierInfo',
          attributes: ['id', 'name']
        }
      ],
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    res.render('materials/list', {
      title: 'Daftar Material - Material Inventory Service',
      user: req.user,
      materials,
      categories,
      suppliers,
      filters: {
        category: category || '',
        type: type || '',
        status: status || '',
        supplierId: supplierId || '',
        search: search || '',
        lowStock: lowStock === 'true'
      }
    });
  } catch (error) {
    console.error('Error pada daftar material:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Material: Detail material
router.get('/materials/:id', checkAuth, async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: 'supplierInfo'
        }
      ]
    });
    
    if (!material) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Material tidak ditemukan'
        }
      });
    }
    
    // Dapatkan transaksi terbaru
    const transactions = await MaterialTransaction.findAll({
      where: { materialId: material.id },
      order: [['transactionDate', 'DESC']],
      limit: 10
    });
    
    res.render('materials/detail', {
      title: `Material ${material.name} - Material Inventory Service`,
      user: req.user,
      material,
      transactions
    });
  } catch (error) {
    console.error('Error pada detail material:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Material: Formulir tambah material
router.get('/materials/add', checkAuth, checkRole(['admin', 'inventory_manager']), async (req, res) => {
  try {
    // Dapatkan daftar supplier untuk dropdown
    const suppliers = await Supplier.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
    
    // Dapatkan daftar kategori untuk dropdown
    const categories = await Material.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    }).then(categories => categories.map(c => c.category));
    
    // Dapatkan daftar tipe untuk dropdown
    const types = await Material.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('type')), 'type']],
      order: [['type', 'ASC']]
    }).then(types => types.map(t => t.type));
    
    res.render('materials/form', {
      title: 'Tambah Material - Material Inventory Service',
      user: req.user,
      material: null,
      suppliers,
      categories,
      types,
      formAction: '/materials/add',
      isEdit: false
    });
  } catch (error) {
    console.error('Error pada form tambah material:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Material: Proses tambah material
router.post('/materials/add', checkAuth, checkRole(['admin', 'inventory_manager']), async (req, res) => {
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
      supplierId,
      notes
    } = req.body;
    
    // Validasi data masukan
    if (!name || !category || !type || !unit) {
      // Dapatkan kembali data yang diperlukan untuk form
      const suppliers = await Supplier.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']]
      });
      
      const categories = await Material.findAll({
        attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
        order: [['category', 'ASC']]
      }).then(categories => categories.map(c => c.category));
      
      const types = await Material.findAll({
        attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('type')), 'type']],
        order: [['type', 'ASC']]
      }).then(types => types.map(t => t.type));
      
      return res.status(400).render('materials/form', {
        title: 'Tambah Material - Material Inventory Service',
        user: req.user,
        material: req.body,
        suppliers,
        categories,
        types,
        formAction: '/materials/add',
        isEdit: false,
        error: 'Nama, kategori, tipe, dan satuan harus diisi'
      });
    }
    
    // Buat material baru via API
    const token = req.cookies.token;
    await axios.post(`${process.env.SERVICE_URL}/api/materials`, {
      materialId,
      name,
      description,
      category,
      type,
      unit,
      stockQuantity: stockQuantity ? parseFloat(stockQuantity) : 0,
      reorderLevel: reorderLevel ? parseFloat(reorderLevel) : 10,
      price: price ? parseFloat(price) : null,
      leadTime: leadTime ? parseInt(leadTime) : null,
      location,
      supplierId,
      notes
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return res.redirect('/materials?success=Material berhasil ditambahkan');
  } catch (error) {
    console.error('Error pada tambah material:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Material: Formulir edit material
router.get('/materials/:id/edit', checkAuth, checkRole(['admin', 'inventory_manager']), async (req, res) => {
  try {
    const material = await Material.findByPk(req.params.id);
    
    if (!material) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Material tidak ditemukan'
        }
      });
    }
    
    // Dapatkan daftar supplier untuk dropdown
    const suppliers = await Supplier.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
    
    // Dapatkan daftar kategori untuk dropdown
    const categories = await Material.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    }).then(categories => categories.map(c => c.category));
    
    // Dapatkan daftar tipe untuk dropdown
    const types = await Material.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('type')), 'type']],
      order: [['type', 'ASC']]
    }).then(types => types.map(t => t.type));
    
    res.render('materials/form', {
      title: `Edit Material ${material.name} - Material Inventory Service`,
      user: req.user,
      material,
      suppliers,
      categories,
      types,
      formAction: `/materials/${material.id}/edit`,
      isEdit: true
    });
  } catch (error) {
    console.error('Error pada form edit material:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Supplier: Daftar supplier
router.get('/suppliers', checkAuth, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Filter
    const where = {};
    if (status) where.status = status;
    
    // Pencarian
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { contactPerson: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { supplierId: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Dapatkan daftar supplier
    const suppliers = await Supplier.findAll({
      where,
      order: [['name', 'ASC']]
    });
    
    res.render('suppliers/list', {
      title: 'Daftar Supplier - Material Inventory Service',
      user: req.user,
      suppliers,
      filters: {
        status: status || '',
        search: search || ''
      }
    });
  } catch (error) {
    console.error('Error pada daftar supplier:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Supplier: Detail supplier
router.get('/suppliers/:id', checkAuth, async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    
    if (!supplier) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Supplier tidak ditemukan'
        }
      });
    }
    
    // Dapatkan material dari supplier
    const materials = await Material.findAll({
      where: { supplierId: supplier.id },
      order: [['name', 'ASC']]
    });
    
    res.render('suppliers/detail', {
      title: `Supplier ${supplier.name} - Material Inventory Service`,
      user: req.user,
      supplier,
      materials
    });
  } catch (error) {
    console.error('Error pada detail supplier:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Transactions: Daftar transaksi
router.get('/transactions', checkAuth, async (req, res) => {
  try {
    const { type, materialId, startDate, endDate } = req.query;
    
    // Filter
    const where = {};
    if (type) where.type = type;
    if (materialId) where.materialId = materialId;
    
    // Filter tanggal
    if (startDate || endDate) {
      where.transactionDate = {};
      
      if (startDate) {
        where.transactionDate[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        where.transactionDate[Op.lt] = endDateTime;
      }
    }
    
    // Dapatkan daftar material untuk filter
    const materials = await Material.findAll({
      order: [['name', 'ASC']]
    });
    
    // Dapatkan daftar transaksi
    const transactions = await MaterialTransaction.findAll({
      where,
      include: [
        {
          model: Material,
          as: 'material',
          attributes: ['id', 'materialId', 'name', 'category', 'unit']
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['id', 'name']
        }
      ],
      order: [['transactionDate', 'DESC']],
      limit: 100 // Batasi jumlah untuk performa
    });
    
    res.render('transactions/list', {
      title: 'Daftar Transaksi - Material Inventory Service',
      user: req.user,
      transactions,
      materials,
      filters: {
        type: type || '',
        materialId: materialId || '',
        startDate: startDate || '',
        endDate: endDate || ''
      }
    });
  } catch (error) {
    console.error('Error pada daftar transaksi:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Transaksi: Formulir penerimaan material
router.get('/transactions/receive', checkAuth, checkRole(['admin', 'inventory_manager', 'inventory_staff']), async (req, res) => {
  try {
    // Dapatkan daftar supplier untuk dropdown
    const suppliers = await Supplier.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
    
    // Dapatkan daftar material untuk dropdown
    const materials = await Material.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']]
    });
    
    res.render('transactions/receive-form', {
      title: 'Penerimaan Material - Material Inventory Service',
      user: req.user,
      suppliers,
      materials
    });
  } catch (error) {
    console.error('Error pada form penerimaan material:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Transaksi: Formulir pengeluaran material
router.get('/transactions/issue', checkAuth, checkRole(['admin', 'inventory_manager', 'inventory_staff']), async (req, res) => {
  try {
    // Dapatkan daftar material untuk dropdown
    const materials = await Material.findAll({
      where: { 
        status: 'active',
        stockQuantity: { [Op.gt]: 0 }
      },
      order: [['name', 'ASC']]
    });
    
    res.render('transactions/issue-form', {
      title: 'Pengeluaran Material - Material Inventory Service',
      user: req.user,
      materials
    });
  } catch (error) {
    console.error('Error pada form pengeluaran material:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Laporan: Laporan stok
router.get('/reports/stock', checkAuth, checkRole(['admin', 'inventory_manager', 'manager']), async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    
    // Filter
    const where = {};
    if (category) where.category = category;
    
    // Filter stok rendah
    if (lowStock === 'true') {
      where.stockQuantity = {
        [Op.lte]: db.sequelize.col('reorderLevel')
      };
    }
    
    // Dapatkan kategori untuk filter
    const categories = await Material.findAll({
      attributes: [[db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    }).then(categories => categories.map(c => c.category));
    
    // Dapatkan data material
    const materials = await Material.findAll({
      where,
      include: [
        {
          model: Supplier,
          as: 'supplierInfo',
          attributes: ['id', 'name', 'contactPerson', 'phone']
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
    
    res.render('reports/stock', {
      title: 'Laporan Stok - Material Inventory Service',
      user: req.user,
      materials,
      categories,
      totalInventoryValue,
      filters: {
        category: category || '',
        lowStock: lowStock === 'true'
      }
    });
  } catch (error) {
    console.error('Error pada laporan stok:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Routes lainnya untuk supplier, transaksi, laporan, dll.

module.exports = router;
