/**
 * Controller Notification untuk Production Feedback Service
 * 
 * Mengelola logika bisnis untuk notifikasi terkait produksi
 */
const { 
  FeedbackNotification, 
  ProductionFeedback
} = require('../models');
const axios = require('axios');
require('dotenv').config();

// Membuat ID unik dengan format khusus
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

// Fungsi untuk mengirim notifikasi melalui email
const sendEmailNotification = async (notification) => {
  try {
    // Konfigurasi email berdasarkan environment variables
    const emailConfig = {
      emailServer: process.env.SMTP_SERVER,
      emailPort: process.env.SMTP_PORT,
      emailUser: process.env.SMTP_USER,
      emailPass: process.env.SMTP_PASS,
      emailFrom: process.env.EMAIL_FROM
    };
    
    // Jika konfigurasi email tidak lengkap, skip pengiriman
    if (!emailConfig.emailServer || !emailConfig.emailUser) {
      console.warn('Konfigurasi email tidak lengkap, skip pengiriman email');
      return false;
    }
    
    // Cek feedback untuk informasi tambahan
    const feedback = await ProductionFeedback.findByPk(notification.feedbackId);
    
    // Kirim email melalui layanan email internal atau eksternal
    // Di sini kita menggunakan contoh pengiriman melalui API User Service
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/notifications/send-email`,
      {
        to: notification.recipientId,
        subject: notification.title,
        body: `
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          ${feedback ? `<p>Terkait dengan produksi: ${feedback.productName} (Batch: ${feedback.batchId})</p>` : ''}
          <p>Silakan login ke sistem untuk melihat detail lebih lanjut.</p>
        `,
        priority: notification.priority
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
        }
      }
    );
    
    if (response.data && response.data.success) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error mengirim notifikasi email:', error);
    return false;
  }
};

// Controller untuk operasi CRUD pada notifikasi
const notificationController = {
  // Mendapatkan semua notifikasi untuk feedback tertentu
  getNotificationsByFeedbackId: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      const notifications = await FeedbackNotification.findAll({
        where: { feedbackId },
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error mengambil notifikasi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil notifikasi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan notifikasi berdasarkan notificationId
  getNotificationById: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      const notification = await FeedbackNotification.findOne({
        where: { notificationId }
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notifikasi tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error mengambil notifikasi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil notifikasi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan notifikasi berdasarkan recipientId (user atau role)
  getNotificationsByRecipient: async (req, res) => {
    try {
      const { recipientType, recipientId } = req.params;
      
      // Validasi input
      if (!['user', 'role'].includes(recipientType) || !recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Parameter tidak valid. recipientType harus "user" atau "role"'
        });
      }
      
      // Ambil notifikasi
      const notifications = await FeedbackNotification.findAll({
        where: {
          recipientType,
          recipientId
        },
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      console.error('Error mengambil notifikasi berdasarkan penerima:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil notifikasi berdasarkan penerima',
        error: error.message
      });
    }
  },
  
  // Membuat notifikasi baru
  createNotification: async (req, res) => {
    try {
      const {
        feedbackId,
        type,
        title,
        message,
        recipientType,
        recipientId,
        priority,
        deliveryMethod
      } = req.body;
      
      // Validasi input
      if (!feedbackId || !title || !message || !recipientType || !recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. Harap isi semua field yang diperlukan'
        });
      }
      
      // Validasi recipientType
      if (!['user', 'role', 'email'].includes(recipientType)) {
        return res.status(400).json({
          success: false,
          message: 'recipientType tidak valid. Nilai yang diperbolehkan: user, role, atau email'
        });
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Buat notifikasi baru
      const notification = await FeedbackNotification.create({
        notificationId: generateUniqueId('NOTIF'),
        feedbackId,
        type: type || 'system',
        title,
        message,
        recipientType,
        recipientId,
        isRead: false,
        isDelivered: false,
        priority: priority || 'medium',
        deliveryMethod: deliveryMethod || 'in_app',
        createdBy: req.user ? req.user.username : 'system'
      });
      
      // Jika metode pengiriman adalah email, kirim email
      let emailSent = false;
      if (deliveryMethod === 'email' || deliveryMethod === 'both') {
        emailSent = await sendEmailNotification(notification);
      }
      
      // Update status pengiriman jika berhasil dikirim
      if (emailSent) {
        await FeedbackNotification.update(
          { isDelivered: true },
          { where: { id: notification.id } }
        );
        notification.isDelivered = true;
      }
      
      return res.status(201).json({
        success: true,
        message: 'Notifikasi berhasil dibuat',
        data: notification,
        emailSent
      });
    } catch (error) {
      console.error('Error membuat notifikasi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat notifikasi',
        error: error.message
      });
    }
  },
  
  // Menandai notifikasi sebagai sudah dibaca
  markAsRead: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      // Cek apakah notifikasi ada
      const notification = await FeedbackNotification.findOne({
        where: { notificationId }
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notifikasi tidak ditemukan'
        });
      }
      
      // Update status dibaca
      await FeedbackNotification.update(
        { isRead: true },
        { where: { notificationId } }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Notifikasi berhasil ditandai sebagai sudah dibaca'
      });
    } catch (error) {
      console.error('Error menandai notifikasi sebagai dibaca:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menandai notifikasi sebagai dibaca',
        error: error.message
      });
    }
  },
  
  // Menandai beberapa notifikasi sebagai sudah dibaca
  markMultipleAsRead: async (req, res) => {
    try {
      const { notificationIds } = req.body;
      
      if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak valid. Harap sediakan array notificationIds'
        });
      }
      
      // Update status dibaca untuk semua notifikasi yang diberikan
      await FeedbackNotification.update(
        { isRead: true },
        { where: { notificationId: notificationIds } }
      );
      
      return res.status(200).json({
        success: true,
        message: `${notificationIds.length} notifikasi berhasil ditandai sebagai sudah dibaca`
      });
    } catch (error) {
      console.error('Error menandai beberapa notifikasi sebagai dibaca:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menandai beberapa notifikasi sebagai dibaca',
        error: error.message
      });
    }
  },
  
  // Mendapatkan jumlah notifikasi yang belum dibaca untuk pengguna
  getUnreadCount: async (req, res) => {
    try {
      const { recipientType, recipientId } = req.params;
      
      // Validasi input
      if (!['user', 'role'].includes(recipientType) || !recipientId) {
        return res.status(400).json({
          success: false,
          message: 'Parameter tidak valid. recipientType harus "user" atau "role"'
        });
      }
      
      // Hitung notifikasi yang belum dibaca
      const count = await FeedbackNotification.count({
        where: {
          recipientType,
          recipientId,
          isRead: false
        }
      });
      
      return res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Error menghitung notifikasi yang belum dibaca:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghitung notifikasi yang belum dibaca',
        error: error.message
      });
    }
  },
  
  // Mengirim notifikasi melalui email (bisa dipanggil oleh service lain)
  sendEmailNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      // Cek apakah notifikasi ada
      const notification = await FeedbackNotification.findOne({
        where: { notificationId }
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notifikasi tidak ditemukan'
        });
      }
      
      // Kirim email
      const emailSent = await sendEmailNotification(notification);
      
      if (!emailSent) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengirim email notifikasi'
        });
      }
      
      // Update status pengiriman
      await FeedbackNotification.update(
        { isDelivered: true },
        { where: { notificationId } }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Email notifikasi berhasil dikirim'
      });
    } catch (error) {
      console.error('Error mengirim email notifikasi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim email notifikasi',
        error: error.message
      });
    }
  },
  
  // Menghapus notifikasi
  deleteNotification: async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      // Cek apakah notifikasi ada
      const notification = await FeedbackNotification.findOne({
        where: { notificationId }
      });
      
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notifikasi tidak ditemukan'
        });
      }
      
      // Hapus notifikasi
      await FeedbackNotification.destroy({
        where: { notificationId }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Notifikasi berhasil dihapus'
      });
    } catch (error) {
      console.error('Error menghapus notifikasi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus notifikasi',
        error: error.message
      });
    }
  }
};

module.exports = notificationController;
