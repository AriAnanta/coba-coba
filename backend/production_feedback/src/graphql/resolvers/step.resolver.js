/**
 * Resolver Step untuk GraphQL API
 * 
 * Implementasi resolver untuk ProductionStep
 */
const { 
  ProductionStep,
  ProductionFeedback,
  QualityCheck,
  FeedbackImage,
  Sequelize
} = require('../../models');

// Resolver untuk tipe ProductionStep
const stepResolvers = {
  ProductionStep: {
    // Resolver untuk relasi
    feedback: async (parent) => {
      return await ProductionFeedback.findByPk(parent.feedbackId);
    },
    qualityChecks: async (parent) => {
      return await QualityCheck.findAll({
        where: { stepId: parent.id }
      });
    },
    images: async (parent) => {
      return await FeedbackImage.findAll({
        where: { stepId: parent.id }
      });
    }
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan langkah produksi berdasarkan ID
    getStepById: async (_, { id }) => {
      return await ProductionStep.findByPk(id);
    },
    
    // Mendapatkan langkah produksi berdasarkan stepId
    getStepByStepId: async (_, { stepId }) => {
      return await ProductionStep.findOne({
        where: { stepId }
      });
    },
    
    // Mendapatkan semua langkah produksi untuk feedback tertentu
    getStepsByFeedbackId: async (_, { feedbackId }) => {
      return await ProductionStep.findAll({
        where: { feedbackId },
        order: [['stepOrder', 'ASC']]
      });
    }
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat langkah produksi baru
    createStep: async (_, { input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Buat ID unik untuk langkah produksi
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
      
      // Buat langkah produksi baru
      const step = await ProductionStep.create({
        ...input,
        stepId: generateUniqueId('STEP')
      });
      
      // Update status feedback jika perlu
      if (feedback.status === 'pending') {
        await feedback.update({
          status: 'in_production',
          updatedBy: context.user.username
        });
      }
      
      return step;
    },
    
    // Membuat beberapa langkah produksi sekaligus
    createBatchSteps: async (_, { steps }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Buat ID unik untuk langkah produksi
      const generateUniqueId = (prefix, index) => {
        const timestamp = new Date().getTime().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 2 + 4);
        return `${prefix}-${timestamp}-${random}-${index}`;
      };
      
      // Cek apakah semua langkah memiliki feedback yang sama
      if (steps.length === 0) {
        throw new Error('Tidak ada langkah untuk dibuat');
      }
      
      const feedbackId = steps[0].feedbackId;
      const allSameFeedback = steps.every(step => step.feedbackId === feedbackId);
      
      if (!allSameFeedback) {
        throw new Error('Semua langkah harus memiliki feedbackId yang sama');
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      // Buat langkah produksi
      const createdSteps = await Promise.all(
        steps.map(async (stepInput, index) => {
          return await ProductionStep.create({
            ...stepInput,
            stepId: generateUniqueId('STEP', index + 1)
          });
        })
      );
      
      // Update status feedback jika perlu
      if (feedback.status === 'pending') {
        await feedback.update({
          status: 'in_production',
          updatedBy: context.user.username
        });
      }
      
      return createdSteps;
    },
    
    // Mengupdate langkah produksi
    updateStep: async (_, { id, input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah langkah produksi ada
      const step = await ProductionStep.findByPk(id);
      if (!step) {
        throw new Error('Langkah produksi tidak ditemukan');
      }
      
      // Update langkah produksi
      await step.update(input);
      
      return await ProductionStep.findByPk(id);
    },
    
    // Mengupdate status langkah produksi
    updateStepStatus: async (_, { id, status }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah langkah produksi ada
      const step = await ProductionStep.findByPk(id);
      if (!step) {
        throw new Error('Langkah produksi tidak ditemukan');
      }
      
      // Update status
      await step.update({ status });
      
      // Jika status adalah completed, set endTime jika belum ada
      if (status === 'completed' && !step.endTime) {
        await step.update({ endTime: new Date() });
      }
      
      // Cek apakah perlu update status feedback
      await updateFeedbackStatus(step.feedbackId);
      
      return await ProductionStep.findByPk(id);
    },
    
    // Mengupdate waktu langkah produksi
    updateStepTiming: async (_, { id, startTime, endTime }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah langkah produksi ada
      const step = await ProductionStep.findByPk(id);
      if (!step) {
        throw new Error('Langkah produksi tidak ditemukan');
      }
      
      // Siapkan data update
      const updateData = {};
      
      if (startTime) {
        updateData.startTime = new Date(startTime);
        
        // Jika status masih pending, ubah ke in_progress
        if (step.status === 'pending') {
          updateData.status = 'in_progress';
        }
      }
      
      if (endTime) {
        updateData.endTime = new Date(endTime);
        
        // Jika endTime diisi, hitung durasi
        if (updateData.startTime || step.startTime) {
          const start = updateData.startTime || new Date(step.startTime);
          const end = new Date(endTime);
          updateData.duration = Math.floor((end - start) / (1000 * 60)); // Durasi dalam menit
        }
        
        // Jika endTime diisi dan status bukan completed/failed/skipped, ubah ke completed
        if (!['completed', 'failed', 'skipped'].includes(step.status)) {
          updateData.status = 'completed';
        }
      }
      
      // Update langkah produksi
      await step.update(updateData);
      
      // Cek apakah perlu update status feedback
      await updateFeedbackStatus(step.feedbackId);
      
      return await ProductionStep.findByPk(id);
    },
    
    // Menghapus langkah produksi
    deleteStep: async (_, { id }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah langkah produksi ada
      const step = await ProductionStep.findByPk(id);
      if (!step) {
        throw new Error('Langkah produksi tidak ditemukan');
      }
      
      // Ambil feedbackId untuk update status nanti
      const feedbackId = step.feedbackId;
      
      // Hapus langkah produksi
      await step.destroy();
      
      // Update status feedback
      await updateFeedbackStatus(feedbackId);
      
      return {
        success: true,
        message: 'Langkah produksi berhasil dihapus',
        id
      };
    }
  }
};

// Fungsi helper untuk mengupdate status feedback berdasarkan langkah-langkah produksi
async function updateFeedbackStatus(feedbackId) {
  try {
    // Ambil data feedback
    const feedback = await ProductionFeedback.findByPk(feedbackId);
    
    if (!feedback) return;
    
    // Ambil semua langkah produksi untuk feedback ini
    const steps = await ProductionStep.findAll({
      where: { feedbackId }
    });
    
    if (steps.length === 0) return;
    
    // Hitung jumlah langkah untuk setiap status
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      skipped: 0,
      failed: 0
    };
    
    steps.forEach(step => {
      if (statusCounts[step.status] !== undefined) {
        statusCounts[step.status]++;
      }
    });
    
    // Tentukan status feedback berdasarkan status langkah-langkah
    let newStatus = feedback.status;
    
    // Jika semua langkah selesai (completed atau skipped)
    if (statusCounts.completed + statusCounts.skipped === steps.length) {
      newStatus = 'completed';
    }
    // Jika ada langkah yang gagal
    else if (statusCounts.failed > 0) {
      newStatus = 'on_hold';
    }
    // Jika ada langkah yang sedang in_progress
    else if (statusCounts.in_progress > 0) {
      newStatus = 'in_production';
    }
    // Jika semua langkah masih pending
    else if (statusCounts.pending === steps.length) {
      newStatus = 'pending';
    }
    
    // Update status feedback jika berbeda
    if (newStatus !== feedback.status) {
      await feedback.update({ status: newStatus });
    }
    
    return newStatus;
  } catch (error) {
    console.error('Error mengupdate status feedback:', error);
    return null;
  }
}

module.exports = stepResolvers;
