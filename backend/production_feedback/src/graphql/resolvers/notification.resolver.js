/**
 * Resolver Notification untuk GraphQL API
 * 
 * Implementasi resolver untuk FeedbackNotification
 */
const { 
  FeedbackNotification,
  ProductionFeedback,
  Sequelize
} = require('../../models');
const axios = require('axios');
const { Op } = Sequelize;

// Resolver untuk tipe FeedbackNotification
const notificationResolvers = {
  FeedbackNotification: {
    // Resolver untuk relasi
    feedback: async (parent) => {
      if (!parent.feedbackId) return null;
      return await ProductionFeedback.findByPk(parent.feedbackId);
    }
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan notifikasi berdasarkan ID
    getNotificationById: async (_, { id }) => {
      return await FeedbackNotification.findByPk(id);
    },
    
    // Mendapatkan notifikasi berdasarkan notificationId
    getNotificationByNotificationId: async (_, { notificationId }) => {
      return await FeedbackNotification.findOne({
        where: { notificationId }
      });
    },
    
    // Mendapatkan semua notifikasi untuk feedback tertentu
    getNotificationsByFeedbackId: async (_, { feedbackId, pagination }) => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await FeedbackNotification.findAndCountAll({
        where: { feedbackId },
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
    
    // Mendapatkan notifikasi untuk penerima tertentu
    getNotificationsByRecipient: async (_, { recipientType, recipientId, pagination }) => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const whereCondition = {};
      
      if (recipientType) {
        whereCondition.recipientType = recipientType;
      }
      
      if (recipientId) {
        whereCondition.recipientId = recipientId;
      }
      
      const { count, rows } = await FeedbackNotification.findAndCountAll({
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
    
    // Mendapatkan notifikasi untuk user dan role tertentu
    getNotificationsForUser: async (_, { userId, roles, isRead, pagination }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Gunakan userId dari token jika tidak disediakan
      const targetUserId = userId || context.user.id;
      
      // Gunakan roles dari token jika tidak disediakan
      const targetRoles = roles || (context.user.roles ? context.user.roles : [context.user.role]);
      
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      // Buat kondisi where
      const whereCondition = {
        [Op.or]: [
          // Notifikasi untuk user
          {
            recipientType: 'user',
            recipientId: targetUserId
          }
        ]
      };
      
      // Tambahkan notifikasi untuk roles jika ada
      if (targetRoles && targetRoles.length > 0) {
        whereCondition[Op.or].push({
          recipientType: 'role',
          recipientRole: {
            [Op.in]: targetRoles
          }
        });
      }
      
      // Filter berdasarkan status read jika ditentukan
      if (isRead !== undefined) {
        whereCondition.isRead = isRead;
      }
      
      // Query dengan paginasi
      const { count, rows } = await FeedbackNotification.findAndCountAll({
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
    
    // Mendapatkan jumlah notifikasi yang belum dibaca
    getUnreadNotificationCount: async (_, { userId, roles }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Gunakan userId dari token jika tidak disediakan
      const targetUserId = userId || context.user.id;
      
      // Gunakan roles dari token jika tidak disediakan
      const targetRoles = roles || (context.user.roles ? context.user.roles : [context.user.role]);
      
      // Buat kondisi where
      const whereCondition = {
        isRead: false,
        [Op.or]: [
          // Notifikasi untuk user
          {
            recipientType: 'user',
            recipientId: targetUserId
          }
        ]
      };
      
      // Tambahkan notifikasi untuk roles jika ada
      if (targetRoles && targetRoles.length > 0) {
        whereCondition[Op.or].push({
          recipientType: 'role',
          recipientRole: {
            [Op.in]: targetRoles
          }
        });
      }
      
      // Hitung jumlah notifikasi yang belum dibaca
      const count = await FeedbackNotification.count({
        where: whereCondition
      });
      
      return { count };
    }
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat notifikasi baru
    createNotification: async (_, { input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Buat ID unik untuk notifikasi
      const generateUniqueId = (prefix) => {
        const timestamp = new Date().getTime().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 2 + 8);
        return `${prefix}-${timestamp}-${random}`;
      };
      
      // Cek apakah feedback ada jika disediakan
      if (input.feedbackId) {
        const feedback = await ProductionFeedback.findByPk(input.feedbackId);
        if (!feedback) {
          throw new Error('Feedback tidak ditemukan');
        }
      }
      
      // Buat notifikasi baru
      const notification = await FeedbackNotification.create({
        ...input,
        notificationId: input.notificationId || generateUniqueId('NOTIF'),
        isRead: false,
        isDelivered: false,
        createdBy: context.user.username
      });
      
      // Kirim email notifikasi jika metode pengiriman adalah email atau both
      if (notification.deliveryMethod === 'email' || notification.deliveryMethod === 'both') {
        try {
          await sendEmailNotification(notification);
        } catch (error) {
          console.error('Error mengirim email notifikasi:', error);
        }
      }
      
      return notification;
    },
    
    // Menandai notifikasi sebagai sudah dibaca
    markNotificationAsRead: async (_, { id }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah notifikasi ada
      const notification = await FeedbackNotification.findByPk(id);
      if (!notification) {
        throw new Error('Notifikasi tidak ditemukan');
      }
      
      // Cek apakah user adalah penerima notifikasi
      const isRecipient = (
        // Notifikasi untuk user
        (notification.recipientType === 'user' && notification.recipientId === context.user.id) ||
        // Notifikasi untuk role
        (notification.recipientType === 'role' && (
          // User memiliki role yang sesuai
          context.user.role === notification.recipientRole ||
          // Atau user memiliki array roles yang berisi role yang sesuai
          (context.user.roles && context.user.roles.includes(notification.recipientRole))
        ))
      );
      
      if (!isRecipient && context.user.role !== 'admin') {
        throw new Error('Anda tidak memiliki izin untuk menandai notifikasi ini sebagai dibaca');
      }
      
      // Update notifikasi
      await notification.update({
        isRead: true,
        readAt: new Date()
      });
      
      return await FeedbackNotification.findByPk(id);
    },
    
    // Menandai beberapa notifikasi sebagai sudah dibaca
    markMultipleNotificationsAsRead: async (_, { ids }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      if (!ids || ids.length === 0) {
        throw new Error('Tidak ada ID notifikasi yang disediakan');
      }
      
      // Update notifikasi
      await FeedbackNotification.update(
        {
          isRead: true,
          readAt: new Date()
        },
        {
          where: {
            id: {
              [Op.in]: ids
            },
            [Op.or]: [
              // Notifikasi untuk user
              {
                recipientType: 'user',
                recipientId: context.user.id
              },
              // Notifikasi untuk role
              {
                recipientType: 'role',
                recipientRole: context.user.role
              }
            ]
          }
        }
      );
      
      return {
        success: true,
        message: `${ids.length} notifikasi telah ditandai sebagai dibaca`,
        ids
      };
    },
    
    // Menandai semua notifikasi sebagai sudah dibaca
    markAllNotificationsAsRead: async (_, __, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Gunakan roles dari token jika tersedia
      const targetRoles = context.user.roles ? context.user.roles : [context.user.role];
      
      // Buat kondisi where
      const whereCondition = {
        isRead: false,
        [Op.or]: [
          // Notifikasi untuk user
          {
            recipientType: 'user',
            recipientId: context.user.id
          }
        ]
      };
      
      // Tambahkan notifikasi untuk roles jika ada
      if (targetRoles && targetRoles.length > 0) {
        whereCondition[Op.or].push({
          recipientType: 'role',
          recipientRole: {
            [Op.in]: targetRoles
          }
        });
      }
      
      // Update notifikasi
      const result = await FeedbackNotification.update(
        {
          isRead: true,
          readAt: new Date()
        },
        {
          where: whereCondition
        }
      );
      
      return {
        success: true,
        message: `${result[0]} notifikasi telah ditandai sebagai dibaca`,
        count: result[0]
      };
    },
    
    // Menghapus notifikasi
    deleteNotification: async (_, { id }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah notifikasi ada
      const notification = await FeedbackNotification.findByPk(id);
      if (!notification) {
        throw new Error('Notifikasi tidak ditemukan');
      }
      
      // Cek apakah user adalah penerima notifikasi atau admin
      const isRecipient = (
        notification.recipientType === 'user' && notification.recipientId === context.user.id
      );
      
      if (!isRecipient && context.user.role !== 'admin') {
        throw new Error('Anda tidak memiliki izin untuk menghapus notifikasi ini');
      }
      
      // Hapus notifikasi
      await notification.destroy();
      
      return {
        success: true,
        message: 'Notifikasi berhasil dihapus',
        id
      };
    },
    
    // Mengirim ulang email notifikasi
    resendEmailNotification: async (_, { id }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah user adalah admin atau production manager
      if (!['admin', 'production_manager'].includes(context.user.role)) {
        throw new Error('Anda tidak memiliki izin untuk mengirim ulang notifikasi');
      }
      
      // Cek apakah notifikasi ada
      const notification = await FeedbackNotification.findByPk(id);
      if (!notification) {
        throw new Error('Notifikasi tidak ditemukan');
      }
      
      try {
        // Kirim email notifikasi
        await sendEmailNotification(notification);
        
        // Update status pengiriman
        await notification.update({
          isDelivered: true
        });
        
        return {
          success: true,
          message: 'Email notifikasi berhasil dikirim ulang',
          id
        };
      } catch (error) {
        console.error('Error mengirim ulang email notifikasi:', error);
        return {
          success: false,
          message: `Gagal mengirim ulang email notifikasi: ${error.message}`,
          id
        };
      }
    }
  }
};

// Fungsi helper untuk mengirim email notifikasi
async function sendEmailNotification(notification) {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:5006';
    const apiKey = process.env.INTERNAL_API_KEY || 'default-internal-key';
    
    // Siapkan data untuk API User Service
    const emailData = {
      recipientType: notification.recipientType,
      recipientId: notification.recipientId,
      subject: notification.title,
      message: notification.message,
      priority: notification.priority || 'normal'
    };
    
    // Kirim email melalui User Service API
    const response = await axios.post(
      `${userServiceUrl}/api/users/send-email`,
      emailData,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      }
    );
    
    // Update status pengiriman notifikasi
    await notification.update({
      isDelivered: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Error mengirim email notifikasi:', error);
    throw error;
  }
}

module.exports = notificationResolvers;
