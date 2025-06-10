/**
 * Resolver Image untuk GraphQL API
 * 
 * Implementasi resolver untuk FeedbackImage
 */
const { 
  FeedbackImage,
  ProductionFeedback,
  ProductionStep,
  QualityCheck,
  Sequelize
} = require('../../models');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Resolver untuk tipe FeedbackImage
const imageResolvers = {
  FeedbackImage: {
    // Resolver untuk relasi
    feedback: async (parent) => {
      if (!parent.feedbackId) return null;
      return await ProductionFeedback.findByPk(parent.feedbackId);
    },
    step: async (parent) => {
      if (!parent.stepId) return null;
      return await ProductionStep.findByPk(parent.stepId);
    },
    qualityCheck: async (parent) => {
      if (!parent.qualityCheckId) return null;
      return await QualityCheck.findByPk(parent.qualityCheckId);
    },
    // Resolver untuk URL gambar
    imageUrl: (parent) => {
      // Pastikan root URL diambil dari environment variable jika tersedia
      const baseUrl = process.env.SERVICE_URL || 'http://localhost:5000';
      
      // Buat URL lengkap
      return `${baseUrl}/images/${parent.filename}`;
    }
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan gambar berdasarkan ID
    getImageById: async (_, { id }) => {
      return await FeedbackImage.findByPk(id);
    },
    
    // Mendapatkan gambar berdasarkan imageId
    getImageByImageId: async (_, { imageId }) => {
      return await FeedbackImage.findOne({
        where: { imageId }
      });
    },
    
    // Mendapatkan semua gambar untuk feedback tertentu
    getImagesByFeedbackId: async (_, { feedbackId }) => {
      return await FeedbackImage.findAll({
        where: { feedbackId },
        order: [['createdAt', 'DESC']]
      });
    },
    
    // Mendapatkan semua gambar untuk langkah produksi tertentu
    getImagesByStepId: async (_, { stepId }) => {
      return await FeedbackImage.findAll({
        where: { stepId },
        order: [['createdAt', 'DESC']]
      });
    },
    
    // Mendapatkan semua gambar untuk pemeriksaan kualitas tertentu
    getImagesByQualityCheckId: async (_, { qualityCheckId }) => {
      return await FeedbackImage.findAll({
        where: { qualityCheckId },
        order: [['createdAt', 'DESC']]
      });
    },
    
    // Mendapatkan semua gambar publik
    getPublicImages: async (_, { pagination }) => {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = (page - 1) * limit;
      
      const { count, rows } = await FeedbackImage.findAndCountAll({
        where: { isPublic: true },
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
    // Catatan: Upload gambar ditangani oleh REST API dan multer middleware
    // Di sini hanya implementasi untuk update data dan hapus gambar
    
    // Mengupdate metadata gambar
    updateImageMetadata: async (_, { id, input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah gambar ada
      const image = await FeedbackImage.findByPk(id);
      if (!image) {
        throw new Error('Gambar tidak ditemukan');
      }
      
      // Update gambar
      await image.update({
        ...input,
        updatedBy: context.user.username
      });
      
      return await FeedbackImage.findByPk(id);
    },
    
    // Mengupdate status publik gambar
    toggleImagePublicStatus: async (_, { id, isPublic }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah gambar ada
      const image = await FeedbackImage.findByPk(id);
      if (!image) {
        throw new Error('Gambar tidak ditemukan');
      }
      
      // Update status publik
      await image.update({
        isPublic,
        updatedBy: context.user.username
      });
      
      return await FeedbackImage.findByPk(id);
    },
    
    // Menghapus gambar
    deleteImage: async (_, { id }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah gambar ada
      const image = await FeedbackImage.findByPk(id);
      if (!image) {
        throw new Error('Gambar tidak ditemukan');
      }
      
      try {
        // Hapus file fisik
        const uploadsDir = process.env.UPLOAD_DIR || 'uploads';
        const imagePath = path.join(process.cwd(), uploadsDir, image.filename);
        
        // Periksa apakah file ada sebelum dihapus
        if (fs.existsSync(imagePath)) {
          await unlinkAsync(imagePath);
        }
        
        // Hapus data dari database
        await image.destroy();
        
        return {
          success: true,
          message: 'Gambar berhasil dihapus',
          id
        };
      } catch (error) {
        console.error('Error menghapus gambar:', error);
        return {
          success: false,
          message: `Gagal menghapus gambar: ${error.message}`,
          id
        };
      }
    },
    
    // Mengaitkan gambar dengan feedback
    associateImageWithFeedback: async (_, { id, feedbackId }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah gambar ada
      const image = await FeedbackImage.findByPk(id);
      if (!image) {
        throw new Error('Gambar tidak ditemukan');
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      // Update gambar
      await image.update({
        feedbackId,
        updatedBy: context.user.username
      });
      
      return await FeedbackImage.findByPk(id);
    },
    
    // Mengaitkan gambar dengan langkah produksi
    associateImageWithStep: async (_, { id, stepId }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah gambar ada
      const image = await FeedbackImage.findByPk(id);
      if (!image) {
        throw new Error('Gambar tidak ditemukan');
      }
      
      // Cek apakah langkah produksi ada
      const step = await ProductionStep.findByPk(stepId);
      if (!step) {
        throw new Error('Langkah produksi tidak ditemukan');
      }
      
      // Update gambar dan pastikan feedbackId konsisten
      await image.update({
        stepId,
        feedbackId: step.feedbackId,
        updatedBy: context.user.username
      });
      
      return await FeedbackImage.findByPk(id);
    },
    
    // Mengaitkan gambar dengan pemeriksaan kualitas
    associateImageWithQualityCheck: async (_, { id, qualityCheckId }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah gambar ada
      const image = await FeedbackImage.findByPk(id);
      if (!image) {
        throw new Error('Gambar tidak ditemukan');
      }
      
      // Cek apakah pemeriksaan kualitas ada
      const qualityCheck = await QualityCheck.findByPk(qualityCheckId);
      if (!qualityCheck) {
        throw new Error('Pemeriksaan kualitas tidak ditemukan');
      }
      
      // Update gambar dan pastikan feedbackId konsisten
      await image.update({
        qualityCheckId,
        feedbackId: qualityCheck.feedbackId,
        stepId: qualityCheck.stepId || null,
        updatedBy: context.user.username
      });
      
      return await FeedbackImage.findByPk(id);
    }
  }
};

module.exports = imageResolvers;
