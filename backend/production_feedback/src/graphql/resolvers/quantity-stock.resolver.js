/**
 * Resolver QuantityStock untuk GraphQL API
 * 
 * Implementasi resolver untuk QuantityStock
 */
const { 
  QuantityStock,
  ProductionFeedback,
  Sequelize
} = require('../../models');
const { Op } = Sequelize;

// Resolver untuk tipe QuantityStock
const quantityStockResolvers = {
  QuantityStock: {
    // Resolver untuk relasi dengan ProductionFeedback
    feedback: async (parent) => {
      return await ProductionFeedback.findOne({
        where: { feedbackId: parent.feedbackId }
      });
    }
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan quantity stock berdasarkan ID
    getQuantityStockById: async (_, { id }) => {
      return await QuantityStock.findByPk(id);
    },
    
    // Mendapatkan quantity stock berdasarkan feedbackId
    getQuantityStocksByFeedbackId: async (_, { feedbackId }) => {
      return await QuantityStock.findAll({
        where: { feedbackId }
      });
    },
    
    // Mendapatkan quantity stock berdasarkan materialId
    getQuantityStocksByMaterialId: async (_, { materialId }) => {
      return await QuantityStock.findAll({
        where: { materialId }
      });
    }
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat quantity stock baru
    createQuantityStock: async (_, { input }, context) => {
      try {
        // Validasi feedbackId
        const feedback = await ProductionFeedback.findOne({
          where: { feedbackId: input.feedbackId }
        });
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        // Buat quantity stock baru
        const quantityStock = await QuantityStock.create({
          ...input,
          createdBy: context.user?.username || 'system',
          updatedBy: context.user?.username || 'system'
        });
        
        return quantityStock;
      } catch (error) {
        console.error('Error creating quantity stock:', error);
        throw new Error(`Failed to create quantity stock: ${error.message}`);
      }
    },
    
    // Memperbarui quantity stock
    updateQuantityStock: async (_, { id, usedQuantity, notes }, context) => {
      try {
        const quantityStock = await QuantityStock.findByPk(id);
        
        if (!quantityStock) {
          throw new Error('Quantity stock not found');
        }
        
        // Update quantity stock
        await quantityStock.update({
          usedQuantity,
          notes: notes !== undefined ? notes : quantityStock.notes,
          updatedBy: context.user?.username || 'system'
        });
        
        return quantityStock;
      } catch (error) {
        console.error('Error updating quantity stock:', error);
        throw new Error(`Failed to update quantity stock: ${error.message}`);
      }
    },
    
    // Menghapus quantity stock
    deleteQuantityStock: async (_, { id }) => {
      try {
        const quantityStock = await QuantityStock.findByPk(id);
        
        if (!quantityStock) {
          throw new Error('Quantity stock not found');
        }
        
        // Hapus quantity stock
        await quantityStock.destroy();
        
        return { success: true, message: 'Quantity stock deleted successfully' };
      } catch (error) {
        console.error('Error deleting quantity stock:', error);
        throw new Error(`Failed to delete quantity stock: ${error.message}`);
      }
    },
    
    // Membuat batch quantity stocks
    createBatchQuantityStocks: async (_, { stocks }, context) => {
      try {
        // Validasi semua feedbackId
        const feedbackIds = [...new Set(stocks.map(stock => stock.feedbackId))];
        const feedbacks = await ProductionFeedback.findAll({
          where: { feedbackId: { [Op.in]: feedbackIds } }
        });
        
        if (feedbacks.length !== feedbackIds.length) {
          throw new Error('One or more feedback IDs are invalid');
        }
        
        // Buat semua quantity stocks
        const createdStocks = await Promise.all(
          stocks.map(async (stockInput) => {
            return await QuantityStock.create({
              ...stockInput,
              createdBy: context.user?.username || 'system',
              updatedBy: context.user?.username || 'system'
            });
          })
        );
        
        return createdStocks;
      } catch (error) {
        console.error('Error creating batch quantity stocks:', error);
        throw new Error(`Failed to create batch quantity stocks: ${error.message}`);
      }
    }
  }
};

module.exports = quantityStockResolvers;