/**
 * Routes UI untuk Production Feedback Service
 * 
 * Mendefinisikan routing untuk UI halaman Production Feedback
 */
const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const { ProductionFeedback, ProductionStep, QualityCheck } = require('../models');
const axios = require('axios');
require('dotenv').config();

// Middleware untuk memverifikasi autentikasi UI
const verifyAuthentication = async (req, res, next) => {
  try {
    // Cek apakah ada token di cookie
    const token = req.cookies.token;
    
    if (!token) {
      return res.redirect('/login');
    }
    
    // Verifikasi token dengan User Service
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/auth/verify-token`,
      { token },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data && response.data.valid) {
      // Simpan data user di req untuk digunakan di controller
      req.user = response.data.user;
      next();
    } else {
      // Hapus cookie jika token tidak valid
      res.clearCookie('token');
      return res.redirect('/login');
    }
  } catch (error) {
    console.error('Error verifikasi token:', error);
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Routes untuk halaman autentikasi
router.get('/login', (req, res) => {
  res.render('auth/login', { 
    title: 'Login',
    error: req.query.error || null
  });
});

router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Registrasi Pengguna Baru',
    error: req.query.error || null
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  return res.redirect('/login');
});

// Routes yang membutuhkan autentikasi
router.use(verifyAuthentication);

// Dashboard
router.get(['/', '/dashboard'], async (req, res) => {
  try {
    // Ambil data untuk dashboard
    const [
      totalFeedback,
      pendingFeedback,
      completedFeedback,
      highPriorityIssues
    ] = await Promise.all([
      ProductionFeedback.count(),
      ProductionFeedback.count({ where: { status: ['in_production', 'on_hold'] } }),
      ProductionFeedback.count({ where: { status: 'completed' } }),
      ProductionFeedback.count({ where: { qualityScore: { [Op.lt]: 70 } } })
    ]);
    
    // Ambil feedback terbaru
    const recentFeedback = await ProductionFeedback.findAll({
      limit: 5,
      order: [['updatedAt', 'DESC']],
      attributes: ['id', 'feedbackId', 'batchId', 'productName', 'status', 'qualityScore', 'updatedAt']
    });
    
    res.render('dashboard', {
      title: 'Dashboard Feedback Produksi',
      user: req.user,
      stats: {
        totalFeedback,
        pendingFeedback,
        completedFeedback,
        highPriorityIssues
      },
      recentFeedback
    });
  } catch (error) {
    console.error('Error dashboard:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat dashboard',
      error
    });
  }
});

// Daftar semua feedback produksi
router.get('/feedback', async (req, res) => {
  try {
    // Ambil parameter paginasi dan filter
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || null;
    const search = req.query.search || null;
    
    // Siapkan kondisi where
    const whereCondition = {};
    
    if (status) {
      whereCondition.status = status;
    }
    
    if (search) {
      whereCondition[Op.or] = [
        { productName: { [Op.like]: `%${search}%` } },
        { batchId: { [Op.like]: `%${search}%` } },
        { orderId: { [Op.like]: `%${search}%` } },
        { feedbackId: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Ambil data feedback dengan paginasi
    const { count, rows: feedbacks } = await ProductionFeedback.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [['updatedAt', 'DESC']]
    });
    
    // Hitung jumlah halaman
    const totalPages = Math.ceil(count / limit);
    
    res.render('feedback/list', {
      title: 'Daftar Feedback Produksi',
      user: req.user,
      feedbacks,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages
      },
      filters: {
        status,
        search
      }
    });
  } catch (error) {
    console.error('Error list feedback:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat daftar feedback',
      error
    });
  }
});

// Detail feedback produksi
router.get('/feedback/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ambil data feedback beserta data terkait
    const feedback = await ProductionFeedback.findByPk(id, {
      include: [
        { model: ProductionStep, as: 'steps' },
        { model: QualityCheck, as: 'qualityChecks' }
      ]
    });
    
    if (!feedback) {
      return res.render('error', {
        title: 'Error',
        message: 'Feedback tidak ditemukan',
        error: { status: 404 }
      });
    }
    
    res.render('feedback/detail', {
      title: `Detail Feedback: ${feedback.productName}`,
      user: req.user,
      feedback
    });
  } catch (error) {
    console.error('Error detail feedback:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat detail feedback',
      error
    });
  }
});

// Form tambah feedback baru
router.get('/feedback/create', checkRole(['production_manager', 'production_operator', 'admin']), async (req, res) => {
  try {
    res.render('feedback/create', {
      title: 'Tambah Feedback Produksi Baru',
      user: req.user
    });
  } catch (error) {
    console.error('Error form tambah feedback:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat form tambah feedback',
      error
    });
  }
});

// Form edit feedback
router.get('/feedback/:id/edit', checkRole(['production_manager', 'production_operator', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ambil data feedback
    const feedback = await ProductionFeedback.findByPk(id);
    
    if (!feedback) {
      return res.render('error', {
        title: 'Error',
        message: 'Feedback tidak ditemukan',
        error: { status: 404 }
      });
    }
    
    res.render('feedback/edit', {
      title: `Edit Feedback: ${feedback.productName}`,
      user: req.user,
      feedback
    });
  } catch (error) {
    console.error('Error form edit feedback:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat form edit feedback',
      error
    });
  }
});

// Halaman langkah produksi
router.get('/steps/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    // Ambil data feedback
    const feedback = await ProductionFeedback.findByPk(feedbackId);
    
    if (!feedback) {
      return res.render('error', {
        title: 'Error',
        message: 'Feedback tidak ditemukan',
        error: { status: 404 }
      });
    }
    
    // Ambil data langkah produksi
    const steps = await ProductionStep.findAll({
      where: { feedbackId },
      order: [['stepOrder', 'ASC']]
    });
    
    res.render('steps/list', {
      title: `Langkah Produksi: ${feedback.productName}`,
      user: req.user,
      feedback,
      steps
    });
  } catch (error) {
    console.error('Error langkah produksi:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat langkah produksi',
      error
    });
  }
});

// Halaman pemeriksaan kualitas
router.get('/quality/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    // Ambil data feedback
    const feedback = await ProductionFeedback.findByPk(feedbackId);
    
    if (!feedback) {
      return res.render('error', {
        title: 'Error',
        message: 'Feedback tidak ditemukan',
        error: { status: 404 }
      });
    }
    
    // Ambil data pemeriksaan kualitas
    const qualityChecks = await QualityCheck.findAll({
      where: { feedbackId },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('quality/list', {
      title: `Pemeriksaan Kualitas: ${feedback.productName}`,
      user: req.user,
      feedback,
      qualityChecks
    });
  } catch (error) {
    console.error('Error pemeriksaan kualitas:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat pemeriksaan kualitas',
      error
    });
  }
});

// Halaman gambar feedback
router.get('/images/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    // Ambil data feedback
    const feedback = await ProductionFeedback.findByPk(feedbackId);
    
    if (!feedback) {
      return res.render('error', {
        title: 'Error',
        message: 'Feedback tidak ditemukan',
        error: { status: 404 }
      });
    }
    
    // Ambil data gambar
    const images = await FeedbackImage.findAll({
      where: { feedbackId },
      order: [['uploadDate', 'DESC']]
    });
    
    res.render('images/list', {
      title: `Gambar Produksi: ${feedback.productName}`,
      user: req.user,
      feedback,
      images
    });
  } catch (error) {
    console.error('Error gambar feedback:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat gambar feedback',
      error
    });
  }
});

// Halaman komentar feedback
router.get('/comments/:feedbackId', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    
    // Ambil data feedback
    const feedback = await ProductionFeedback.findByPk(feedbackId);
    
    if (!feedback) {
      return res.render('error', {
        title: 'Error',
        message: 'Feedback tidak ditemukan',
        error: { status: 404 }
      });
    }
    
    // Ambil data komentar
    const comments = await FeedbackComment.findAll({
      where: { 
        feedbackId,
        parentCommentId: null,
        isDeleted: false
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('comments/list', {
      title: `Komentar Produksi: ${feedback.productName}`,
      user: req.user,
      feedback,
      comments
    });
  } catch (error) {
    console.error('Error komentar feedback:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat komentar feedback',
      error
    });
  }
});

// Halaman notifikasi
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Ambil notifikasi berdasarkan user dan role
    const userNotifications = await FeedbackNotification.findAll({
      where: {
        recipientType: 'user',
        recipientId: userId
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    const roleNotifications = await FeedbackNotification.findAll({
      where: {
        recipientType: 'role',
        recipientId: userRole
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    // Gabungkan dan urutkan notifikasi
    const notifications = [...userNotifications, ...roleNotifications].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    res.render('notifications/list', {
      title: 'Notifikasi',
      user: req.user,
      notifications
    });
  } catch (error) {
    console.error('Error notifikasi:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat notifikasi',
      error
    });
  }
});

// Halaman profil pengguna
router.get('/profile', (req, res) => {
  try {
    res.render('profile', {
      title: 'Profil Pengguna',
      user: req.user
    });
  } catch (error) {
    console.error('Error profil:', error);
    res.render('error', {
      title: 'Error',
      message: 'Terjadi kesalahan saat memuat profil',
      error
    });
  }
});

module.exports = router;
