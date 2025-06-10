/**
 * Resolver Feedback untuk GraphQL API
 * 
 * Implementasi resolver untuk ProductionFeedback
 */
const { 
  ProductionFeedback,
  QuantityStock,
  Sequelize
} = require('../../models');
const { Op } = Sequelize;
const axios = require('axios');

// Resolver untuk tipe ProductionFeedback
const feedbackResolvers = {
  ProductionFeedback: {
    // Resolver untuk relasi dengan QuantityStock
    quantityStocks: async (parent) => {
      return await QuantityStock.findAll({
        where: { feedbackId: parent.feedbackId }
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
        if (filters.productName) whereCondition.productName = { [Op.like]: `%${filters.productName}%` };
        
        if (filters.startDate && filters.endDate) {
          whereCondition.createdAt = {
            [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
          };
        } else if (filters.startDate) {
          whereCondition.createdAt = {
            [Op.gte]: new Date(filters.startDate)
          };
        } else if (filters.endDate) {
          whereCondition.createdAt = {
            [Op.lte]: new Date(filters.endDate)
          };
        }
      }
      
      // Dapatkan total count dan data dengan paginasi
      const { count, rows } = await ProductionFeedback.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      
      return {
        items: rows,
        totalCount: count,
        pageInfo: {
          hasNextPage: offset + rows.length < count,
          hasPreviousPage: page > 1
        }
      };
    },
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat feedback baru
    createFeedback: async (_, { input }, context) => {
      try {
        // Generate feedback ID
        const feedbackId = `FB-${Date.now()}`;
        
        // Jika batchId ada tapi productName tidak ada, coba ambil dari machine_queue service
        if (input.batchId && !input.productName) {
          try {
            const machineQueueServiceUrl = process.env.MACHINE_QUEUE_URL || 'http://localhost:5003';
            const response = await axios.get(`${machineQueueServiceUrl}/api/queues/batch/${input.batchId}?status=completed`);
            
            if (response.data && response.data.success && response.data.data.length > 0) {
              // Ambil data dari queue yang completed
              const completedQueue = response.data.data[0];
              input.productName = completedQueue.product_name || 'Unknown Product';
              console.log(`Retrieved product name from machine queue: ${input.productName}`);
            }
          } catch (error) {
            console.error('Error fetching data from machine queue service:', error);
            // Lanjutkan meskipun gagal mendapatkan data dari service lain
          }
        }
        
        // Validasi productName harus ada
        if (!input.productName) {
          throw new Error('Product name is required');
        }
        
        // Buat feedback baru
        const feedback = await ProductionFeedback.create({
          ...input,
          feedbackId,
          createdBy: context.user?.username || 'system',
          updatedBy: context.user?.username || 'system'
        });
        
        // Dapatkan data tambahan dari machine queue jika diperlukan
        try {
          const machineQueueServiceUrl = process.env.MACHINE_QUEUE_URL || 'http://localhost:5003';
          const response = await axios.get(`${machineQueueServiceUrl}/api/queues/batch/${input.batchId}?status=completed`);
          
          if (response.data && response.data.success && response.data.data.length > 0) {
            // Update data tambahan dari machine queue jika diperlukan
            const completedQueue = response.data.data[0];
            await feedback.update({
              productionPlanId: completedQueue.production_plan_id || null
            });
          }
        } catch (error) {
          console.error('Error fetching additional data from machine queue service:', error);
          // Lanjutkan meskipun gagal mendapatkan data dari service lain
        }
        
        return feedback;
      } catch (error) {
        console.error('Error creating feedback:', error);
        throw new Error(`Failed to create feedback: ${error.message}`);
      }
    },
    
    // Memperbarui feedback
    updateFeedback: async (_, { id, input }, context) => {
      try {
        const feedback = await ProductionFeedback.findByPk(id);
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        // Update feedback
        await feedback.update({
          ...input,
          updatedBy: context.user?.username || 'system'
        });
        
        return feedback;
      } catch (error) {
        console.error('Error updating feedback:', error);
        throw new Error(`Failed to update feedback: ${error.message}`);
      }
    },
    
    // Memperbarui status feedback
    updateFeedbackStatus: async (_, { id, status }, context) => {
      try {
        const feedback = await ProductionFeedback.findByPk(id);
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        // Update status
        await feedback.update({
          status,
          updatedBy: context.user?.username || 'system'
        });
        
        return feedback;
      } catch (error) {
        console.error('Error updating feedback status:', error);
        throw new Error(`Failed to update feedback status: ${error.message}`);
      }
    },
    
    // Memperbarui kuantitas feedback (aktual dan cacat)
    updateFeedbackQuantities: async (_, { id, actualQuantity, defectQuantity }, context) => {
      try {
        const feedback = await ProductionFeedback.findByPk(id);
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        // Siapkan data update
        const updateData = {
          updatedBy: context.user?.username || 'system'
        };
        
        // Hanya update field yang diberikan
        if (actualQuantity !== undefined) {
          updateData.actualQuantity = actualQuantity;
        }
        
        if (defectQuantity !== undefined) {
          updateData.defectQuantity = defectQuantity;
        }
        
        // Update kuantitas
        await feedback.update(updateData);
        
        return feedback;
      } catch (error) {
        console.error('Error updating feedback quantities:', error);
        throw new Error(`Failed to update feedback quantities: ${error.message}`);
      }
    },
    
    // Menghapus feedback
    deleteFeedback: async (_, { id }) => {
      try {
        const feedback = await ProductionFeedback.findByPk(id);
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        // Hapus feedback
        await feedback.destroy();
        
        return { success: true, message: 'Feedback deleted successfully' };
      } catch (error) {
        console.error('Error deleting feedback:', error);
        throw new Error(`Failed to delete feedback: ${error.message}`);
      }
    },
    
    // Mengirim update ke marketplace
    sendMarketplaceUpdate: async (_, { feedbackId }) => {
      try {
        const feedback = await ProductionFeedback.findOne({
          where: { feedbackId }
        });
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        // Implementasi pengiriman update ke marketplace
        // Ini hanya contoh implementasi, sesuaikan dengan kebutuhan
        try {
          const marketplaceServiceUrl = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:5005';
          await axios.post(`${marketplaceServiceUrl}/api/update`, {
            feedbackId: feedback.feedbackId,
            batchId: feedback.batchId,
            status: feedback.status,
            actualQuantity: feedback.actualQuantity,
            defectQuantity: feedback.defectQuantity,
            updatedAt: feedback.updatedAt
          });
          
          return { success: true, message: 'Marketplace update sent successfully' };
        } catch (error) {
          console.error('Error sending marketplace update:', error);
          throw new Error(`Failed to send marketplace update: ${error.message}`);
        }
      } catch (error) {
        console.error('Error in sendMarketplaceUpdate:', error);
        throw new Error(`Failed to process marketplace update: ${error.message}`);
      }
    }
  }
};

module.exports = feedbackResolvers;
