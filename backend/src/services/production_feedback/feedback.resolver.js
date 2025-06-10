/**
 * Resolver Feedback untuk GraphQL API
 * 
 * Implementasi resolver untuk ProductionFeedback
 */
const axios = require('axios');

// Resolver untuk tipe ProductionFeedback
const feedbackResolvers = {
  ProductionFeedback: {
    // Resolver untuk relasi dapat ditambahkan di sini jika diperlukan
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan feedback berdasarkan ID
    getFeedbackById: async (_, { id }, { models }) => {
      try {
        return await models.ProductionFeedback.findByPk(id);
      } catch (error) {
        console.error('Error getting feedback by ID:', error);
        throw new Error(`Failed to get feedback: ${error.message}`);
      }
    },
    
    // Mendapatkan feedback berdasarkan batchId
    getFeedbackByBatchId: async (_, { batchId }, { models }) => {
      try {
        return await models.ProductionFeedback.findOne({
          where: { batchId }
        });
      } catch (error) {
        console.error('Error getting feedback by batch ID:', error);
        throw new Error(`Failed to get feedback: ${error.message}`);
      }
    },
    
    // Mendapatkan semua feedback dengan paginasi dan filter
    getAllFeedback: async (_, { pagination, filter }, { models }) => {
      try {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const offset = (page - 1) * limit;
        
        // Siapkan kondisi where berdasarkan filter
        const whereCondition = {};
        
        if (filter) {
          if (filter.status) whereCondition.status = filter.status;
          if (filter.batchId) whereCondition.batchId = { $like: `%${filter.batchId}%` };
          if (filter.productName) whereCondition.productName = { $like: `%${filter.productName}%` };
          
          if (filter.startDate && filter.endDate) {
            whereCondition.createdAt = {
              $between: [new Date(filter.startDate), new Date(filter.endDate)]
            };
          } else if (filter.startDate) {
            whereCondition.createdAt = {
              $gte: new Date(filter.startDate)
            };
          } else if (filter.endDate) {
            whereCondition.createdAt = {
              $lte: new Date(filter.endDate)
            };
          }
        }
        
        // Dapatkan total count dan data dengan paginasi
        const { count, rows } = await models.ProductionFeedback.findAndCountAll({
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
      } catch (error) {
        console.error('Error getting all feedback:', error);
        throw new Error(`Failed to get feedback list: ${error.message}`);
      }
    },
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat feedback baru
    createFeedback: async (_, { input }, { models, user }) => {
      try {
        // Generate feedback ID
        const feedbackId = `FB-${Date.now()}`;
        
        // Buat feedback baru
        const feedback = await models.ProductionFeedback.create({
          ...input,
          feedbackId,
          createdBy: user?.username || 'system',
          updatedBy: user?.username || 'system'
        });
        
        // Dapatkan data machine queue dari service machine_queue
        try {
          const machineQueueServiceUrl = process.env.MACHINE_QUEUE_SERVICE_URL || 'http://localhost:5003';
          const response = await axios.get(`${machineQueueServiceUrl}/api/queues/batch/${input.batchId}`);
          
          if (response.data && response.data.length > 0) {
            // Update data tambahan dari machine queue jika diperlukan
            await feedback.update({
              productionPlanId: response.data[0].productionPlanId || null
            });
          }
        } catch (error) {
          console.error('Error fetching machine queue data:', error);
          // Lanjutkan meskipun gagal mendapatkan data dari service lain
        }
        
        return feedback;
      } catch (error) {
        console.error('Error creating feedback:', error);
        throw new Error(`Failed to create feedback: ${error.message}`);
      }
    },
    
    // Memperbarui feedback
    updateFeedback: async (_, { id, input }, { models, user }) => {
      try {
        const feedback = await models.ProductionFeedback.findByPk(id);
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        // Update feedback
        await feedback.update({
          ...input,
          updatedBy: user?.username || 'system'
        });
        
        return feedback;
      } catch (error) {
        console.error('Error updating feedback:', error);
        throw new Error(`Failed to update feedback: ${error.message}`);
      }
    },
    
    // Memperbarui status feedback
    updateFeedbackStatus: async (_, { id, status }, { models, user }) => {
      try {
        const feedback = await models.ProductionFeedback.findByPk(id);
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        // Update status
        await feedback.update({
          status,
          updatedBy: user?.username || 'system'
        });
        
        return feedback;
      } catch (error) {
        console.error('Error updating feedback status:', error);
        throw new Error(`Failed to update feedback status: ${error.message}`);
      }
    },
    
    // Menghapus feedback
    deleteFeedback: async (_, { id }, { models }) => {
      try {
        const feedback = await models.ProductionFeedback.findByPk(id);
        
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
    }
  }
};

module.exports = feedbackResolvers;