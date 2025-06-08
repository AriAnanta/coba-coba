/**
 * Resolver Feedback untuk GraphQL API
 * 
 * Implementasi resolver untuk ProductionFeedback
 */
const { 
  ProductionFeedback,
  ProductionStep,
  QualityCheck,
  FeedbackImage,
  FeedbackComment,
  FeedbackNotification,
  Sequelize
} = require('../../models');
const { Op } = Sequelize;

// Resolver untuk tipe ProductionFeedback
const feedbackResolvers = {
  ProductionFeedback: {
    // Resolver untuk relasi
    steps: async (parent) => {
      return await ProductionStep.findAll({
        where: { feedbackId: parent.id },
        order: [['stepOrder', 'ASC']]
      });
    },
    qualityChecks: async (parent) => {
      return await QualityCheck.findAll({
        where: { feedbackId: parent.id }
      });
    },
    images: async (parent) => {
      return await FeedbackImage.findAll({
        where: { feedbackId: parent.id }
      });
    },
    comments: async (parent) => {
      return await FeedbackComment.findAll({
        where: { 
          feedbackId: parent.id,
          isDeleted: false
        }
      });
    },
    notifications: async (parent) => {
      return await FeedbackNotification.findAll({
        where: { feedbackId: parent.id }
      });
    }
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan feedback berdasarkan ID
    getFeedbackById: async (_, { id }) => {
      return await ProductionFeedback.findByPk(id);
    },
    
    // Mendapatkan feedback berdasarkan feedbackId
    getFeedbackByFeedbackId: async (_, { feedbackId }) => {
      return await ProductionFeedback.findOne({
        where: { feedbackId }
      });
    },
    
    // Mendapatkan feedback berdasarkan batchId
    getFeedbackByBatchId: async (_, { batchId }) => {
      return await ProductionFeedback.findOne({
        where: { batchId }
      });
    },
    
    // Mendapatkan feedback berdasarkan orderId
    getFeedbackByOrderId: async (_, { orderId }) => {
      return await ProductionFeedback.findOne({
        where: { orderId }
      });
    },
    
    // Mendapatkan semua feedback dengan paginasi dan filter
    getAllFeedback: async (_, { pagination, filters }) => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      // Siapkan kondisi where berdasarkan filter
      const whereCondition = {};
      
      if (filters) {
        if (filters.status) whereCondition.status = filters.status;
        if (filters.batchId) whereCondition.batchId = { [Op.like]: `%${filters.batchId}%` };
        if (filters.orderId) whereCondition.orderId = { [Op.like]: `%${filters.orderId}%` };
        if (filters.productId) whereCondition.productId = { [Op.like]: `%${filters.productId}%` };
        if (filters.productName) whereCondition.productName = { [Op.like]: `%${filters.productName}%` };
        
        if (filters.startDate && filters.endDate) {
          whereCondition.createdAt = {
            [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
          };
        } else if (filters.startDate) {
          whereCondition.createdAt = { [Op.gte]: new Date(filters.startDate) };
        } else if (filters.endDate) {
          whereCondition.createdAt = { [Op.lte]: new Date(filters.endDate) };
        }
      }
      
      // Query dengan paginasi
      const { count, rows } = await ProductionFeedback.findAndCountAll({
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
    
    // Mendapatkan ringkasan produksi
    getProductionSummary: async (_, { timeframe }) => {
      // Default timeframe adalah 30 hari terakhir
      const endDate = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'day':
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case 'year':
          startDate = new Date(endDate);
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate = new Date(endDate);
          startDate.setMonth(endDate.getMonth() - 1);
          timeframe = 'month';
      }
      
      // Ambil data dalam rentang waktu
      const feedbacks = await ProductionFeedback.findAll({
        where: {
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // Hitung statistik
      const totalBatches = feedbacks.length;
      const completedBatches = feedbacks.filter(f => f.status === 'completed').length;
      const inProductionBatches = feedbacks.filter(f => f.status === 'in_production').length;
      const onHoldBatches = feedbacks.filter(f => f.status === 'on_hold').length;
      const cancelledBatches = feedbacks.filter(f => f.status === 'cancelled' || f.status === 'rejected').length;
      
      const totalPlannedQuantity = feedbacks.reduce((sum, f) => sum + (f.plannedQuantity || 0), 0);
      const totalActualQuantity = feedbacks.reduce((sum, f) => sum + (f.actualQuantity || 0), 0);
      const totalDefectQuantity = feedbacks.reduce((sum, f) => sum + (f.defectQuantity || 0), 0);
      
      // Hitung rata-rata skor kualitas dari data yang ada
      const feedbacksWithQualityScore = feedbacks.filter(f => f.qualityScore !== null);
      const sumQualityScore = feedbacksWithQualityScore.reduce((sum, f) => sum + (f.qualityScore || 0), 0);
      const averageQualityScore = feedbacksWithQualityScore.length > 0 
        ? sumQualityScore / feedbacksWithQualityScore.length 
        : 0;
      
      return {
        totalBatches,
        completedBatches,
        inProductionBatches,
        onHoldBatches,
        cancelledBatches,
        totalPlannedQuantity,
        totalActualQuantity,
        totalDefectQuantity,
        averageQualityScore,
        timeframe
      };
    }
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat feedback baru
    createFeedback: async (_, { input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Buat ID unik untuk feedback
      const generateUniqueId = (prefix) => {
        const timestamp = new Date().getTime().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 2 + 8);
        return `${prefix}-${timestamp}-${random}`;
      };
      
      // Buat feedback baru
      const feedback = await ProductionFeedback.create({
        ...input,
        feedbackId: generateUniqueId('FB'),
        isMarketplaceUpdated: false,
        createdBy: context.user.username,
        updatedBy: context.user.username
      });
      
      return feedback;
    },
    
    // Mengupdate feedback
    updateFeedback: async (_, { id, input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(id);
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      // Update feedback
      await feedback.update({
        ...input,
        updatedBy: context.user.username
      });
      
      return await ProductionFeedback.findByPk(id);
    },
    
    // Mengupdate status feedback
    updateFeedbackStatus: async (_, { id, status }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(id);
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      // Update status
      await feedback.update({
        status,
        updatedBy: context.user.username
      });
      
      return await ProductionFeedback.findByPk(id);
    },
    
    // Mengupdate kuantitas feedback
    updateFeedbackQuantities: async (_, { id, actualQuantity, defectQuantity }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(id);
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      // Siapkan data update
      const updateData = {
        updatedBy: context.user.username
      };
      
      if (actualQuantity !== undefined) {
        updateData.actualQuantity = actualQuantity;
      }
      
      if (defectQuantity !== undefined) {
        updateData.defectQuantity = defectQuantity;
      }
      
      // Update feedback
      await feedback.update(updateData);
      
      return await ProductionFeedback.findByPk(id);
    },
    
    // Menghapus feedback
    deleteFeedback: async (_, { id }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(id);
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      // Soft delete
      await feedback.update({
        isDeleted: true,
        updatedBy: context.user.username
      });
      
      return {
        success: true,
        message: 'Feedback berhasil dihapus',
        id
      };
    },
    
    // Mengirim update ke marketplace
    sendMarketplaceUpdate: async (_, { feedbackId }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findOne({
        where: { feedbackId }
      });
      
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      try {
        // TODO: Implementasi pengiriman data ke marketplace API
        // Di sini hanya contoh update status
        
        await feedback.update({
          isMarketplaceUpdated: true,
          marketplaceUpdateDate: new Date(),
          updatedBy: context.user.username
        });
        
        return {
          success: true,
          message: 'Update marketplace berhasil',
          id: feedback.id
        };
      } catch (error) {
        console.error('Error update marketplace:', error);
        return {
          success: false,
          message: `Gagal update marketplace: ${error.message}`,
          id: feedback.id
        };
      }
    }
  }
};

module.exports = feedbackResolvers;
