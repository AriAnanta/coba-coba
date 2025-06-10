/**
 * Routes UI untuk Machine Queue Service
 * 
 * Mendefinisikan halaman UI dan pengelolaan sesi
 */
const express = require('express');
const axios = require('axios');
const router = express.Router();
const { Machine, MachineQueue } = require('../models');
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
    title: 'Login - Machine Queue Service',
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
    // Dapatkan statistik mesin
    const [
      totalMachines, 
      operationalMachines, 
      maintenanceMachines, 
      breakdownMachines
    ] = await Promise.all([
      Machine.count(),
      Machine.count({ where: { status: 'operational' } }),
      Machine.count({ where: { status: 'maintenance' } }),
      Machine.count({ where: { status: 'breakdown' } })
    ]);
    
    // Dapatkan statistik antrian
    const [
      totalQueues,
      waitingQueues,
      inProgressQueues,
      completedTodayQueues
    ] = await Promise.all([
      MachineQueue.count({ 
        where: { 
          status: { 
            [Op.ne]: 'completed' 
          } 
        } 
      }),
      MachineQueue.count({ where: { status: 'waiting' } }),
      MachineQueue.count({ where: { status: 'in_progress' } }),
      MachineQueue.count({ 
        where: { 
          status: 'completed',
          actualEndTime: {
            [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        } 
      })
    ]);
    
    // Dapatkan 5 antrian terbaru
    const recentQueues = await MachineQueue.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [
        {
          model: Machine,
          as: 'machine'
        }
      ]
    });
    
    // Dapatkan 5 antrian yang sedang dikerjakan
    const activeQueues = await MachineQueue.findAll({
      where: { status: 'in_progress' },
      order: [['actualStartTime', 'ASC']],
      limit: 5,
      include: [
        {
          model: Machine,
          as: 'machine'
        }
      ]
    });
    
    res.render('dashboard', {
      title: 'Dashboard - Machine Queue Service',
      user: req.user,
      stats: {
        machines: {
          total: totalMachines,
          operational: operationalMachines,
          maintenance: maintenanceMachines,
          breakdown: breakdownMachines
        },
        queues: {
          total: totalQueues,
          waiting: waitingQueues,
          inProgress: inProgressQueues,
          completedToday: completedTodayQueues
        }
      },
      recentQueues,
      activeQueues
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

// Mesin: Daftar mesin
router.get('/machines', checkAuth, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    // Filter
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    
    // Dapatkan semua tipe mesin untuk filter
    const machineTypes = await Machine.findAll({
      attributes: [[Machine.sequelize.fn('DISTINCT', Machine.sequelize.col('type')), 'type']],
      order: [['type', 'ASC']]
    }).then(types => types.map(t => t.type));
    
    // Dapatkan daftar mesin
    const machines = await Machine.findAll({
      where,
      order: [['type', 'ASC'], ['name', 'ASC']]
    });
    
    res.render('machines/list', {
      title: 'Daftar Mesin - Machine Queue Service',
      user: req.user,
      machines,
      machineTypes,
      filters: {
        status: status || '',
        type: type || ''
      }
    });
  } catch (error) {
    console.error('Error pada daftar mesin:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Mesin: Detail mesin
router.get('/machines/:id', checkAuth, async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id, {
      include: [
        {
          model: MachineQueue,
          as: 'queues',
          required: false,
          order: [
            ['status', 'ASC'],
            ['position', 'ASC']
          ]
        }
      ]
    });
    
    if (!machine) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Mesin tidak ditemukan'
        }
      });
    }
    
    // Pisahkan antrian berdasarkan status
    const activeQueue = machine.queues.find(q => q.status === 'in_progress');
    const waitingQueues = machine.queues.filter(q => q.status === 'waiting');
    const completedQueues = await MachineQueue.findAll({
      where: {
        machineId: machine.id,
        status: 'completed'
      },
      order: [['actualEndTime', 'DESC']],
      limit: 10
    });
    
    res.render('machines/detail', {
      title: `Mesin ${machine.name} - Machine Queue Service`,
      user: req.user,
      machine,
      activeQueue,
      waitingQueues,
      completedQueues
    });
  } catch (error) {
    console.error('Error pada detail mesin:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Mesin: Formulir tambah mesin
router.get('/machines/add', checkAuth, checkRole(['admin', 'manager']), (req, res) => {
  res.render('machines/form', {
    title: 'Tambah Mesin - Machine Queue Service',
    user: req.user,
    machine: null,
    formAction: '/machines/add',
    isEdit: false
  });
});

// Mesin: Proses tambah mesin
router.post('/machines/add', checkAuth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const {
      name,
      type,
      manufacturer,
      modelNumber,
      capacity,
      capacityUnit,
      location,
      installationDate,
      hoursPerDay,
      notes
    } = req.body;
    
    // Validasi data masukan
    if (!name || !type) {
      return res.status(400).render('machines/form', {
        title: 'Tambah Mesin - Machine Queue Service',
        user: req.user,
        machine: req.body,
        formAction: '/machines/add',
        isEdit: false,
        error: 'Nama dan tipe mesin diperlukan'
      });
    }
    
    // Buat mesin baru via internal API
    const token = req.cookies.token;
    await axios.post(`${process.env.SERVICE_URL || 'http://localhost:5003'}/api/machines`, {
      name,
      type,
      manufacturer,
      modelNumber,
      capacity: capacity ? parseFloat(capacity) : null,
      capacityUnit,
      location,
      installationDate,
      hoursPerDay: hoursPerDay ? parseFloat(hoursPerDay) : 8.0,
      notes
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return res.redirect('/machines?success=Mesin berhasil ditambahkan');
  } catch (error) {
    console.error('Error pada tambah mesin:', error);
    
    let errorMessage = 'Gagal menambahkan mesin';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    
    return res.status(500).render('machines/form', {
      title: 'Tambah Mesin - Machine Queue Service',
      user: req.user,
      machine: req.body,
      formAction: '/machines/add',
      isEdit: false,
      error: errorMessage
    });
  }
});

// Mesin: Formulir edit mesin
router.get('/machines/:id/edit', checkAuth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const machine = await Machine.findByPk(req.params.id);
    
    if (!machine) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Mesin tidak ditemukan'
        }
      });
    }
    
    res.render('machines/form', {
      title: `Edit Mesin ${machine.name} - Machine Queue Service`,
      user: req.user,
      machine,
      formAction: `/machines/${machine.id}/edit`,
      isEdit: true
    });
  } catch (error) {
    console.error('Error pada form edit mesin:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Mesin: Proses edit mesin
router.post('/machines/:id/edit', checkAuth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const machineId = req.params.id;
    const {
      name,
      type,
      manufacturer,
      modelNumber,
      capacity,
      capacityUnit,
      location,
      installationDate,
      lastMaintenance,
      nextMaintenance,
      status,
      hoursPerDay,
      notes
    } = req.body;
    
    // Validasi data masukan
    if (!name || !type) {
      return res.status(400).render('machines/form', {
        title: 'Edit Mesin - Machine Queue Service',
        user: req.user,
        machine: { id: machineId, ...req.body },
        formAction: `/machines/${machineId}/edit`,
        isEdit: true,
        error: 'Nama dan tipe mesin diperlukan'
      });
    }
    
    // Update mesin via internal API
    const token = req.cookies.token;
    await axios.put(`${process.env.SERVICE_URL || 'http://localhost:5003'}/api/machines/${machineId}`, {
      name,
      type,
      manufacturer,
      modelNumber,
      capacity: capacity ? parseFloat(capacity) : null,
      capacityUnit,
      location,
      installationDate,
      lastMaintenance,
      nextMaintenance,
      status,
      hoursPerDay: hoursPerDay ? parseFloat(hoursPerDay) : 8.0,
      notes
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return res.redirect(`/machines/${machineId}?success=Mesin berhasil diperbarui`);
  } catch (error) {
    console.error('Error pada edit mesin:', error);
    
    let errorMessage = 'Gagal memperbarui mesin';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    
    return res.status(500).render('machines/form', {
      title: 'Edit Mesin - Machine Queue Service',
      user: req.user,
      machine: { id: req.params.id, ...req.body },
      formAction: `/machines/${req.params.id}/edit`,
      isEdit: true,
      error: errorMessage
    });
  }
});

// Mesin: Hapus mesin
router.delete('/machines/:id', checkAuth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const machineId = req.params.id;
    
    // Hapus mesin via internal API
    const token = req.cookies.token;
    await axios.delete(`${process.env.SERVICE_URL || 'http://localhost:5003'}/api/machines/${machineId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Mesin berhasil dihapus'
    });
  } catch (error) {
    console.error('Error pada hapus mesin:', error);
    
    let errorMessage = 'Gagal menghapus mesin';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    
    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});

// Antrian: Daftar antrian
router.get('/queues', checkAuth, async (req, res) => {
  try {
    const { status, machineId } = req.query;
    
    // Filter
    const filter = {};
    if (status) filter.status = status;
    if (machineId) filter.machineId = machineId;
    
    // Dapatkan daftar mesin untuk filter
    const machines = await Machine.findAll({
      order: [['name', 'ASC']]
    });
    
    // Dapatkan daftar antrian dengan filter
    const token = req.cookies.token;
    const response = await axios.get(`${process.env.SERVICE_URL}/api/queues`, {
      params: filter,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const queues = response.data;
    
    res.render('queues/list', {
      title: 'Daftar Antrian - Machine Queue Service',
      user: req.user,
      queues,
      machines,
      filters: {
        status: status || '',
        machineId: machineId || ''
      }
    });
  } catch (error) {
    console.error('Error pada daftar antrian:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Antrian: Detail antrian
router.get('/queues/:id', checkAuth, async (req, res) => {
  try {
    const token = req.cookies.token;
    const response = await axios.get(`${process.env.SERVICE_URL}/api/queues/${req.params.id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const queue = response.data;
    
    if (!queue) {
      return res.status(404).render('error', {
        user: req.user,
        error: {
          status: 404,
          message: 'Antrian tidak ditemukan'
        }
      });
    }
    
    // Mendapatkan detail batch dari Production Management
    let batch = null;
    try {
      const batchResponse = await axios.get(`${process.env.PRODUCTION_MANAGEMENT_URL}/api/batches/${queue.batchId}`);
      batch = batchResponse.data;
    } catch (batchError) {
      console.error('Error mengambil detail batch:', batchError.message);
      // Lanjutkan meskipun detail batch tidak ada
    }
    
    res.render('queues/detail', {
      title: `Detail Antrian - Machine Queue Service`,
      user: req.user,
      queue,
      batch
    });
  } catch (error) {
    console.error('Error pada detail antrian:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Antrian: Formulir tambah antrian
router.get('/queues/add', checkAuth, checkRole(['admin', 'operator', 'manager']), async (req, res) => {
  try {
    // Dapatkan daftar mesin
    const machines = await Machine.findAll({
      where: { status: 'operational' },
      order: [['name', 'ASC']]
    });
    
    // Coba dapatkan daftar batch dari Production Management
    let batches = [];
    try {
      const token = req.cookies.token;
      const batchResponse = await axios.get(`${process.env.PRODUCTION_MANAGEMENT_URL}/api/batches?status=approved`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      batches = batchResponse.data;
    } catch (batchError) {
      console.error('Error mengambil batch:', batchError.message);
      // Lanjutkan meskipun tidak ada data batch
    }
    
    res.render('queues/form', {
      title: 'Tambah Antrian - Machine Queue Service',
      user: req.user,
      machines,
      batches,
      queue: null,
      formAction: '/queues/add',
      isEdit: false
    });
  } catch (error) {
    console.error('Error pada form tambah antrian:', error);
    return res.status(500).render('error', {
      user: req.user,
      error: {
        status: 500,
        message: 'Kesalahan server internal'
      }
    });
  }
});

// Antrian: Proses tambah antrian
router.post('/queues/add', checkAuth, checkRole(['admin', 'operator', 'manager']), async (req, res) => {
  try {
    const {
      machineId,
      batchId,
      batchNumber,
      productName,
      stepId,
      stepName,
      scheduledStartTime,
      scheduledEndTime,
      hoursRequired,
      priority,
      operatorId,
      operatorName,
      setupTime,
      notes
    } = req.body;
    
    // Validasi data masukan
    if (!machineId || !batchId || !batchNumber || !productName || !hoursRequired) {
      const machines = await Machine.findAll({
        where: { status: 'operational' },
        order: [['name', 'ASC']]
      });
      
      return res.status(400).render('queues/form', {
        title: 'Tambah Antrian - Machine Queue Service',
        user: req.user,
        machines,
        batches: [],
        queue: req.body,
        formAction: '/queues/add',
        isEdit: false,
        error: 'Semua field yang diperlukan harus diisi'
      });
    }
    
    // Tambah antrian via internal API
    const token = req.cookies.token;
    await axios.post(`${process.env.SERVICE_URL || 'http://localhost:5003'}/api/queues`, {
      machineId: parseInt(machineId),
      batchId: parseInt(batchId),
      batchNumber,
      productName,
      stepId: stepId ? parseInt(stepId) : null,
      stepName,
      scheduledStartTime,
      scheduledEndTime,
      hoursRequired: parseFloat(hoursRequired),
      priority: priority || 'normal',
      operatorId,
      operatorName,
      setupTime: setupTime ? parseFloat(setupTime) : null,
      notes
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return res.redirect('/queues?success=Antrian berhasil ditambahkan');
  } catch (error) {
    console.error('Error pada tambah antrian:', error);
    
    let errorMessage = 'Gagal menambahkan antrian';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    }
    
    try {
      const machines = await Machine.findAll({
        where: { status: 'operational' },
        order: [['name', 'ASC']]
      });
      
      return res.status(500).render('queues/form', {
        title: 'Tambah Antrian - Machine Queue Service',
        user: req.user,
        machines,
        batches: [],
        queue: req.body,
        formAction: '/queues/add',
        isEdit: false,
        error: errorMessage
      });
    } catch (renderError) {
      console.error('Error rendering form:', renderError);
      return res.status(500).render('error', {
        user: req.user,
        error: {
          status: 500,
          message: 'Kesalahan server internal'
        }
      });
    }
  }
});

// Routes lainnya untuk antrian, operator, dll.

module.exports = router;
