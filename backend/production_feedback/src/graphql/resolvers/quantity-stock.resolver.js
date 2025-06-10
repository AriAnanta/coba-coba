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
    // Resolver untuk relasi dengan ProductionFeedback berdasarkan productName
    feedback: async (parent) => {
      if (!parent.productName) return null;
      
      return await ProductionFeedback.findOne({
        where: { productName: parent.productName }
      });
    }
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan quantity stock berdasarkan ID
    getQuantityStockById: async (_, { id }) => {
      return await QuantityStock.findByPk(id);
    },
    
    // Mendapatkan semua quantity stock dengan paginasi dan filter
    getAllQuantityStocks: async (_, { pagination = { page: 1, limit: 10 }, filters = {} }) => {
      const { page, limit } = pagination;
      const offset = (page - 1) * limit;
      
      // Membangun kondisi filter
      const whereCondition = {};
      
      if (filters.status) {
        whereCondition.status = filters.status;
      }
      
      if (filters.productName) {
        whereCondition.productName = { [Op.like]: `%${filters.productName}%` };
      }
      
      if (filters.productName) {
        whereCondition.productName = { [Op.like]: `%${filters.productName}%` };
      }
      
      // Mengambil data dengan paginasi
      const { count, rows } = await QuantityStock.findAndCountAll({
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
    
    // Mendapatkan quantity stock berdasarkan productName
    getQuantityStocksByFeedbackId: async (_, { feedbackId }) => {
      // Cari feedback terlebih dahulu untuk mendapatkan productName
      const feedback = await ProductionFeedback.findOne({
        where: { feedbackId }
      });
      
      if (!feedback) return [];
      
      // Kemudian cari quantity stock berdasarkan productName
      return await QuantityStock.findAll({
        where: { productName: feedback.productName }
      });
    },
    
    // Mendapatkan quantity stock berdasarkan productName
    getQuantityStocksByProductName: async (_, { productName }) => {
      return await QuantityStock.findAll({
        where: {
          productName: { [Op.like]: `%${productName}%` }
        }
      });
    },
    
    // Mendapatkan item dengan stok rendah
    getLowStockItems: async (_, { threshold = 10 }) => {
      return await QuantityStock.findAll({
        where: {
          quantity: { [Op.lte]: threshold },
          reorderPoint: { [Op.not]: null },
          quantity: { [Op.lte]: Sequelize.col('reorder_point') }
        }
      });
    }
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat quantity stock baru
    createQuantityStock: async (_, { input }, context) => {
      try {
        // Validasi productName
        if (input.productName) {
          // Opsional: Validasi apakah productName ada di tabel ProductionFeedback
          const feedback = await ProductionFeedback.findOne({
            where: { productName: input.productName }
          });
          
          // Kita tidak perlu throw error jika tidak ditemukan, karena productName bisa saja baru
        }
        
        // Buat quantity stock baru
        const quantityStock = await QuantityStock.create(input);
        
        return quantityStock;
      } catch (error) {
        console.error('Error creating quantity stock:', error);
        throw new Error(`Failed to create quantity stock: ${error.message}`);
      }
    },
    
    // Memperbarui quantity stock
    updateQuantityStock: async (_, { id, quantity, reorderPoint, status }) => {
      try {
        const quantityStock = await QuantityStock.findByPk(id);
        
        if (!quantityStock) {
          throw new Error('Quantity stock not found');
        }
        
        // Update quantity stock
        const updateData = {};
        
        if (quantity !== undefined) updateData.quantity = quantity;
        if (reorderPoint !== undefined) updateData.reorderPoint = reorderPoint;
        if (status !== undefined) updateData.status = status;
        
        await quantityStock.update(updateData);
        
        return quantityStock;
      } catch (error) {
        console.error('Error updating quantity stock:', error);
        throw new Error(`Failed to update quantity stock: ${error.message}`);
      }
    },
    
    // Memperbarui status quantity stock
    updateQuantityStockStatus: async (_, { id, status }) => {
      try {
        const quantityStock = await QuantityStock.findByPk(id);
        
        if (!quantityStock) {
          throw new Error('Quantity stock not found');
        }
        
        // Update status
        await quantityStock.update({ status });
        
        return quantityStock;
      } catch (error) {
        console.error('Error updating quantity stock status:', error);
        throw new Error(`Failed to update quantity stock status: ${error.message}`);
      }
    },
    
    // Menyesuaikan jumlah quantity stock
    adjustQuantityStock: async (_, { id, adjustmentQuantity, notes }) => {
      try {
        const quantityStock = await QuantityStock.findByPk(id);
        
        if (!quantityStock) {
          throw new Error('Quantity stock not found');
        }
        
        // Hitung jumlah baru
        const newQuantity = quantityStock.quantity + adjustmentQuantity;
        
        if (newQuantity < 0) {
          throw new Error('Adjustment would result in negative quantity');
        }
        
        // Update quantity
        await quantityStock.update({ 
          quantity: newQuantity,
          notes: notes || quantityStock.notes
        });
        
        return quantityStock;
      } catch (error) {
        console.error('Error adjusting quantity stock:', error);
        throw new Error(`Failed to adjust quantity stock: ${error.message}`);
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
    }
  }
};

module.exports = quantityStockResolvers;