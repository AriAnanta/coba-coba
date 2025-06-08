/**
 * Controller Comment untuk Production Feedback Service
 * 
 * Mengelola logika bisnis untuk komentar terkait produksi
 */
const { 
  FeedbackComment, 
  ProductionFeedback,
  FeedbackNotification
} = require('../models');

// Membuat ID unik dengan format khusus
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

// Fungsi untuk membuat notifikasi saat ada komentar baru
const createCommentNotification = async (comment, feedbackData) => {
  try {
    // Tentukan penerima notifikasi
    let recipientType = 'role';
    let recipientId = 'production_manager';
    
    // Jika komentar adalah balasan, kirim notifikasi ke pembuat komentar asli
    if (comment.parentCommentId) {
      const parentComment = await FeedbackComment.findByPk(comment.parentCommentId);
      if (parentComment && parentComment.userId) {
        recipientType = 'user';
        recipientId = parentComment.userId;
      }
    }
    
    // Buat judul notifikasi
    const title = comment.isImportant 
      ? 'Komentar Penting Baru'
      : 'Komentar Baru';
    
    // Buat pesan notifikasi
    const message = `${comment.userName || 'Seseorang'} menambahkan komentar ${comment.isImportant ? 'penting ' : ''}pada produksi ${feedbackData.productName} (Batch: ${feedbackData.batchId})`;
    
    // Buat notifikasi
    await FeedbackNotification.create({
      notificationId: generateUniqueId('NOTIF'),
      feedbackId: comment.feedbackId,
      type: 'comment',
      title,
      message,
      recipientType,
      recipientId,
      priority: comment.isImportant ? 'high' : 'medium',
      deliveryMethod: 'in_app'
    });
  } catch (error) {
    console.error('Error membuat notifikasi komentar:', error);
    // Kita hanya log error tanpa mengganggu flow utama aplikasi
  }
};

// Controller untuk operasi CRUD pada komentar
const commentController = {
  // Mendapatkan semua komentar untuk feedback tertentu
  getCommentsByFeedbackId: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      const comments = await FeedbackComment.findAll({
        where: { 
          feedbackId,
          isDeleted: false
        },
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Error mengambil komentar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil komentar',
        error: error.message
      });
    }
  },
  
  // Mendapatkan komentar berdasarkan ID
  getCommentById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const comment = await FeedbackComment.findOne({
        where: { 
          id,
          isDeleted: false
        }
      });
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Komentar tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: comment
      });
    } catch (error) {
      console.error('Error mengambil detail komentar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail komentar',
        error: error.message
      });
    }
  },
  
  // Membuat komentar baru
  createComment: async (req, res) => {
    try {
      const {
        feedbackId,
        commentType,
        content,
        isImportant,
        parentCommentId,
        visibleToCustomer,
        visibleToMarketplace
      } = req.body;
      
      // Validasi input
      if (!feedbackId || !content) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. Harap isi semua field yang diperlukan'
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
      
      // Cek apakah parent comment ada jika disediakan
      if (parentCommentId) {
        const parentComment = await FeedbackComment.findOne({
          where: { 
            id: parentCommentId,
            isDeleted: false
          }
        });
        
        if (!parentComment) {
          return res.status(404).json({
            success: false,
            message: 'Komentar induk tidak ditemukan'
          });
        }
      }
      
      // Buat komentar baru
      const comment = await FeedbackComment.create({
        commentId: generateUniqueId('COMM'),
        feedbackId,
        commentType: commentType || 'internal',
        content,
        userId: req.user ? req.user.id : null,
        userName: req.user ? req.user.username : null,
        userRole: req.user ? req.user.role : null,
        isImportant: isImportant === true || isImportant === 'true',
        parentCommentId: parentCommentId || null,
        isEdited: false,
        isDeleted: false,
        visibleToCustomer: visibleToCustomer === true || visibleToCustomer === 'true',
        visibleToMarketplace: visibleToMarketplace === true || visibleToMarketplace === 'true'
      });
      
      // Buat notifikasi untuk komentar baru
      await createCommentNotification(comment, feedback);
      
      return res.status(201).json({
        success: true,
        message: 'Komentar berhasil dibuat',
        data: comment
      });
    } catch (error) {
      console.error('Error membuat komentar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat komentar',
        error: error.message
      });
    }
  },
  
  // Mengupdate komentar
  updateComment: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        content,
        isImportant,
        visibleToCustomer,
        visibleToMarketplace
      } = req.body;
      
      // Cek apakah komentar ada
      const comment = await FeedbackComment.findOne({
        where: { 
          id,
          isDeleted: false
        }
      });
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Komentar tidak ditemukan'
        });
      }
      
      // Cek apakah user yang mengupdate adalah pemilik komentar
      if (req.user && comment.userId && req.user.id !== comment.userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk mengubah komentar ini'
        });
      }
      
      // Persiapkan data untuk update
      const updateData = {
        ...(content && { content }),
        ...(isImportant !== undefined && { isImportant: isImportant === true || isImportant === 'true' }),
        ...(visibleToCustomer !== undefined && { visibleToCustomer: visibleToCustomer === true || visibleToCustomer === 'true' }),
        ...(visibleToMarketplace !== undefined && { visibleToMarketplace: visibleToMarketplace === true || visibleToMarketplace === 'true' }),
        isEdited: true
      };
      
      // Update komentar
      await FeedbackComment.update(updateData, {
        where: { id }
      });
      
      // Ambil data komentar yang sudah diupdate
      const updatedComment = await FeedbackComment.findByPk(id);
      
      return res.status(200).json({
        success: true,
        message: 'Komentar berhasil diperbarui',
        data: updatedComment
      });
    } catch (error) {
      console.error('Error mengupdate komentar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui komentar',
        error: error.message
      });
    }
  },
  
  // Menghapus komentar (soft delete)
  deleteComment: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Cek apakah komentar ada
      const comment = await FeedbackComment.findByPk(id);
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Komentar tidak ditemukan'
        });
      }
      
      // Cek apakah user yang menghapus adalah pemilik komentar
      if (req.user && comment.userId && req.user.id !== comment.userId && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk menghapus komentar ini'
        });
      }
      
      // Soft delete komentar
      await FeedbackComment.update({
        isDeleted: true
      }, {
        where: { id }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Komentar berhasil dihapus'
      });
    } catch (error) {
      console.error('Error menghapus komentar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus komentar',
        error: error.message
      });
    }
  },
  
  // Mendapatkan komentar publik untuk marketplace
  getPublicComments: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Ambil komentar publik
      const publicComments = await FeedbackComment.findAll({
        where: {
          feedbackId,
          isDeleted: false,
          visibleToMarketplace: true
        },
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: publicComments
      });
    } catch (error) {
      console.error('Error mengambil komentar publik:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil komentar publik',
        error: error.message
      });
    }
  },
  
  // Mendapatkan komentar untuk pelanggan
  getCustomerComments: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Ambil komentar untuk pelanggan
      const customerComments = await FeedbackComment.findAll({
        where: {
          feedbackId,
          isDeleted: false,
          visibleToCustomer: true
        },
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: customerComments
      });
    } catch (error) {
      console.error('Error mengambil komentar untuk pelanggan:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil komentar untuk pelanggan',
        error: error.message
      });
    }
  },
  
  // Mendapatkan balasan untuk komentar tertentu
  getCommentReplies: async (req, res) => {
    try {
      const { parentCommentId } = req.params;
      
      // Cek apakah komentar induk ada
      const parentComment = await FeedbackComment.findOne({
        where: { 
          id: parentCommentId,
          isDeleted: false
        }
      });
      
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Komentar induk tidak ditemukan'
        });
      }
      
      // Ambil balasan komentar
      const replies = await FeedbackComment.findAll({
        where: {
          parentCommentId,
          isDeleted: false
        },
        order: [['createdAt', 'ASC']]
      });
      
      return res.status(200).json({
        success: true,
        data: replies
      });
    } catch (error) {
      console.error('Error mengambil balasan komentar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil balasan komentar',
        error: error.message
      });
    }
  }
};

module.exports = commentController;
