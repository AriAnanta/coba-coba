/**
 * Resolver Comment untuk GraphQL API
 * 
 * Implementasi resolver untuk FeedbackComment
 */
const { 
  FeedbackComment,
  ProductionFeedback,
  FeedbackNotification,
  Sequelize
} = require('../../models');
const { Op } = Sequelize;

// Resolver untuk tipe FeedbackComment
const commentResolvers = {
  FeedbackComment: {
    // Resolver untuk relasi
    feedback: async (parent) => {
      return await ProductionFeedback.findByPk(parent.feedbackId);
    },
    replies: async (parent) => {
      return await FeedbackComment.findAll({
        where: { 
          parentCommentId: parent.id,
          isDeleted: false
        },
        order: [['createdAt', 'ASC']]
      });
    },
    parentComment: async (parent) => {
      if (!parent.parentCommentId) return null;
      return await FeedbackComment.findByPk(parent.parentCommentId);
    }
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan komentar berdasarkan ID
    getCommentById: async (_, { id }) => {
      return await FeedbackComment.findOne({
        where: {
          id,
          isDeleted: false
        }
      });
    },
    
    // Mendapatkan komentar berdasarkan commentId
    getCommentByCommentId: async (_, { commentId }) => {
      return await FeedbackComment.findOne({
        where: {
          commentId,
          isDeleted: false
        }
      });
    },
    
    // Mendapatkan semua komentar untuk feedback tertentu
    getCommentsByFeedbackId: async (_, { feedbackId, visibility }) => {
      const whereCondition = {
        feedbackId,
        isDeleted: false
      };
      
      // Filter berdasarkan visibility jika ditentukan
      if (visibility) {
        whereCondition.visibility = visibility;
      }
      
      return await FeedbackComment.findAll({
        where: whereCondition,
        order: [['createdAt', 'DESC']]
      });
    },
    
    // Mendapatkan semua balasan untuk komentar tertentu
    getRepliesByCommentId: async (_, { commentId }) => {
      const comment = await FeedbackComment.findOne({
        where: {
          commentId,
          isDeleted: false
        }
      });
      
      if (!comment) {
        throw new Error('Komentar tidak ditemukan');
      }
      
      return await FeedbackComment.findAll({
        where: {
          parentCommentId: comment.id,
          isDeleted: false
        },
        order: [['createdAt', 'ASC']]
      });
    },
    
    // Mendapatkan semua komentar oleh pengguna tertentu
    getCommentsByUser: async (_, { userId, username, pagination }) => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const whereCondition = {
        isDeleted: false
      };
      
      if (userId) {
        whereCondition.userId = userId;
      } else if (username) {
        whereCondition.username = username;
      } else {
        throw new Error('userId atau username harus disediakan');
      }
      
      const { count, rows } = await FeedbackComment.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        items: rows
      };
    },
    
    // Mendapatkan semua komentar publik
    getPublicComments: async (_, { pagination }) => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await FeedbackComment.findAndCountAll({
        where: {
          visibility: 'public',
          isDeleted: false
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        items: rows
      };
    },
    
    // Mencari komentar berdasarkan teks
    searchComments: async (_, { searchText, pagination }) => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await FeedbackComment.findAndCountAll({
        where: {
          content: {
            [Op.like]: `%${searchText}%`
          },
          isDeleted: false
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        items: rows
      };
    }
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat komentar baru
    createComment: async (_, { input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Buat ID unik untuk komentar
      const generateUniqueId = (prefix) => {
        const timestamp = new Date().getTime().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 2 + 8);
        return `${prefix}-${timestamp}-${random}`;
      };
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(input.feedbackId);
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      // Cek apakah parentComment ada jika disediakan
      if (input.parentCommentId) {
        const parentComment = await FeedbackComment.findOne({
          where: {
            id: input.parentCommentId,
            isDeleted: false
          }
        });
        
        if (!parentComment) {
          throw new Error('Komentar induk tidak ditemukan atau telah dihapus');
        }
      }
      
      // Buat komentar baru
      const comment = await FeedbackComment.create({
        ...input,
        commentId: generateUniqueId('COMMENT'),
        userId: context.user.id,
        username: context.user.username,
        isDeleted: false
      });
      
      // Buat notifikasi untuk komentar baru
      try {
        // Tentukan penerima notifikasi
        let recipientType, recipientId, recipientRole;
        
        if (input.parentCommentId) {
          // Jika ini balasan, kirim notifikasi ke penulis komentar asli
          const parentComment = await FeedbackComment.findByPk(input.parentCommentId);
          recipientType = 'user';
          recipientId = parentComment.userId;
        } else {
          // Jika ini komentar baru, kirim notifikasi ke production manager
          recipientType = 'role';
          recipientId = 'production_manager';
          recipientRole = 'production_manager';
        }
        
        await FeedbackNotification.create({
          notificationId: generateUniqueId('NOTIF'),
          feedbackId: input.feedbackId,
          type: 'new_comment',
          title: 'Komentar Baru',
          message: `${context.user.username} menambahkan komentar baru: "${input.content.substring(0, 50)}${input.content.length > 50 ? '...' : ''}"`,
          recipientType,
          recipientId,
          recipientRole,
          isRead: false,
          isDelivered: false,
          priority: 'normal',
          deliveryMethod: 'in_app',
          createdBy: context.user.username
        });
      } catch (error) {
        console.error('Error membuat notifikasi:', error);
      }
      
      return comment;
    },
    
    // Mengupdate komentar
    updateComment: async (_, { id, content }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah komentar ada
      const comment = await FeedbackComment.findOne({
        where: {
          id,
          isDeleted: false
        }
      });
      
      if (!comment) {
        throw new Error('Komentar tidak ditemukan atau telah dihapus');
      }
      
      // Cek apakah user adalah penulis komentar atau admin
      if (comment.userId !== context.user.id && context.user.role !== 'admin') {
        throw new Error('Anda tidak memiliki izin untuk mengupdate komentar ini');
      }
      
      // Update komentar
      await comment.update({
        content,
        isEdited: true
      });
      
      return await FeedbackComment.findByPk(id);
    },
    
    // Mengupdate visibility komentar
    updateCommentVisibility: async (_, { id, visibility }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah user adalah admin atau production manager
      if (!['admin', 'production_manager'].includes(context.user.role)) {
        throw new Error('Anda tidak memiliki izin untuk mengubah visibility komentar');
      }
      
      // Cek apakah komentar ada
      const comment = await FeedbackComment.findOne({
        where: {
          id,
          isDeleted: false
        }
      });
      
      if (!comment) {
        throw new Error('Komentar tidak ditemukan atau telah dihapus');
      }
      
      // Update visibility
      await comment.update({ visibility });
      
      return await FeedbackComment.findByPk(id);
    },
    
    // Menghapus komentar (soft delete)
    deleteComment: async (_, { id }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah komentar ada
      const comment = await FeedbackComment.findOne({
        where: {
          id,
          isDeleted: false
        }
      });
      
      if (!comment) {
        throw new Error('Komentar tidak ditemukan atau telah dihapus');
      }
      
      // Cek apakah user adalah penulis komentar atau admin
      if (comment.userId !== context.user.id && context.user.role !== 'admin') {
        throw new Error('Anda tidak memiliki izin untuk menghapus komentar ini');
      }
      
      // Soft delete
      await comment.update({
        isDeleted: true,
        content: comment.userId === context.user.id ? 'Komentar ini telah dihapus oleh penulis' : 'Komentar ini telah dihapus oleh admin'
      });
      
      return {
        success: true,
        message: 'Komentar berhasil dihapus',
        id
      };
    }
  }
};

module.exports = commentResolvers;
