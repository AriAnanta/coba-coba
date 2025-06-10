/**
 * Resolver Quality untuk GraphQL API
 * 
 * Implementasi resolver untuk QualityCheck
 */
const { 
  QualityCheck,
  ProductionFeedback,
  ProductionStep,
  FeedbackImage,
  FeedbackNotification,
  Sequelize
} = require('../../models');

// Resolver untuk tipe QualityCheck
const qualityResolvers = {
  QualityCheck: {
    // Resolver untuk relasi
    feedback: async (parent) => {
      return await ProductionFeedback.findByPk(parent.feedbackId);
    },
    step: async (parent) => {
      if (!parent.stepId) return null;
      return await ProductionStep.findByPk(parent.stepId);
    },
    images: async (parent) => {
      return await FeedbackImage.findAll({
        where: { qualityCheckId: parent.id }
      });
    }
  },
  
  // Resolver untuk Query
  Query: {
    // Mendapatkan pemeriksaan kualitas berdasarkan ID
    getQualityCheckById: async (_, { id }) => {
      return await QualityCheck.findByPk(id);
    },
    
    // Mendapatkan pemeriksaan kualitas berdasarkan checkId
    getQualityCheckByCheckId: async (_, { checkId }) => {
      return await QualityCheck.findOne({
        where: { checkId }
      });
    },
    
    // Mendapatkan semua pemeriksaan kualitas untuk feedback tertentu
    getQualityChecksByFeedbackId: async (_, { feedbackId }) => {
      return await QualityCheck.findAll({
        where: { feedbackId },
        order: [['checkDate', 'DESC']]
      });
    },
    
    // Mendapatkan semua pemeriksaan kualitas untuk langkah produksi tertentu
    getQualityChecksByStepId: async (_, { stepId }) => {
      return await QualityCheck.findAll({
        where: { stepId },
        order: [['checkDate', 'DESC']]
      });
    },
    
    // Mendapatkan ringkasan kualitas untuk feedback tertentu
    getQualitySummary: async (_, { feedbackId }) => {
      // Ambil semua pemeriksaan kualitas untuk feedback ini
      const qualityChecks = await QualityCheck.findAll({
        where: { feedbackId }
      });
      
      if (qualityChecks.length === 0) {
        return null;
      }
      
      // Hitung jumlah pemeriksaan untuk setiap hasil
      const resultCounts = {
        pending: 0,
        pass: 0,
        fail: 0,
        conditional_pass: 0,
        needs_rework: 0
      };
      
      qualityChecks.forEach(check => {
        if (resultCounts[check.result] !== undefined) {
          resultCounts[check.result]++;
        }
      });
      
      // Hitung skor kualitas (persentase pass + conditional_pass)
      const totalChecks = qualityChecks.length;
      const passChecks = resultCounts.pass + resultCounts.conditional_pass;
      const qualityScore = totalChecks > 0 ? (passChecks / totalChecks) * 100 : 0;
      
      // Update skor kualitas di feedback
      await ProductionFeedback.update(
        { qualityScore },
        { where: { id: feedbackId } }
      );
      
      // Buat objek ringkasan
      const summary = {
        id: `summary-${feedbackId}`,
        checkId: `summary-${feedbackId}`,
        feedbackId,
        stepId: null,
        checkName: 'Ringkasan Kualitas',
        checkType: 'summary',
        checkDate: new Date(),
        inspectorId: null,
        inspectorName: 'Sistem',
        result: qualityScore >= 80 ? 'pass' : qualityScore >= 60 ? 'conditional_pass' : 'needs_rework',
        measurements: JSON.stringify(resultCounts),
        standardValue: '100',
        actualValue: qualityScore.toFixed(2),
        tolerance: '20',
        deviationPercentage: 100 - qualityScore,
        notes: `Total ${totalChecks} pemeriksaan: ${resultCounts.pass} lulus, ${resultCounts.conditional_pass} lulus bersyarat, ${resultCounts.fail} gagal, ${resultCounts.needs_rework} perlu perbaikan, ${resultCounts.pending} tertunda.`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return summary;
    }
  },
  
  // Resolver untuk Mutation
  Mutation: {
    // Membuat pemeriksaan kualitas baru
    createQualityCheck: async (_, { input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Buat ID unik untuk pemeriksaan kualitas
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
      
      // Cek apakah step ada jika disediakan
      if (input.stepId) {
        const step = await ProductionStep.findByPk(input.stepId);
        if (!step) {
          throw new Error('Langkah produksi tidak ditemukan');
        }
      }
      
      // Buat pemeriksaan kualitas baru
      const qualityCheck = await QualityCheck.create({
        ...input,
        checkId: generateUniqueId('QC'),
        inspectorId: context.user.id,
        inspectorName: context.user.username
      });
      
      // Buat notifikasi jika hasil pemeriksaan adalah fail atau needs_rework
      if (qualityCheck.result === 'fail' || qualityCheck.result === 'needs_rework') {
        try {
          await FeedbackNotification.create({
            notificationId: generateUniqueId('NOTIF'),
            feedbackId: qualityCheck.feedbackId,
            type: 'quality_issue',
            title: 'Masalah Kualitas Terdeteksi',
            message: `Pemeriksaan kualitas "${qualityCheck.checkName}" menunjukkan hasil ${qualityCheck.result}. Harap segera ditindaklanjuti.`,
            recipientType: 'role',
            recipientId: 'production_manager',
            isRead: false,
            isDelivered: false,
            priority: 'high',
            deliveryMethod: 'in_app',
            createdBy: context.user.username
          });
        } catch (error) {
          console.error('Error membuat notifikasi:', error);
        }
      }
      
      // Update skor kualitas di feedback
      await updateQualityScore(qualityCheck.feedbackId);
      
      return qualityCheck;
    },
    
    // Membuat beberapa pemeriksaan kualitas sekaligus
    createBatchQualityChecks: async (_, { checks }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Buat ID unik untuk pemeriksaan kualitas
      const generateUniqueId = (prefix, index) => {
        const timestamp = new Date().getTime().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 2 + 4);
        return `${prefix}-${timestamp}-${random}-${index}`;
      };
      
      // Cek apakah semua pemeriksaan memiliki feedback yang sama
      if (checks.length === 0) {
        throw new Error('Tidak ada pemeriksaan untuk dibuat');
      }
      
      const feedbackId = checks[0].feedbackId;
      const allSameFeedback = checks.every(check => check.feedbackId === feedbackId);
      
      if (!allSameFeedback) {
        throw new Error('Semua pemeriksaan harus memiliki feedbackId yang sama');
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      if (!feedback) {
        throw new Error('Feedback tidak ditemukan');
      }
      
      // Buat pemeriksaan kualitas
      const createdChecks = await Promise.all(
        checks.map(async (checkInput, index) => {
          // Cek apakah step ada jika disediakan
          if (checkInput.stepId) {
            const step = await ProductionStep.findByPk(checkInput.stepId);
            if (!step) {
              throw new Error(`Langkah produksi dengan id ${checkInput.stepId} tidak ditemukan`);
            }
          }
          
          return await QualityCheck.create({
            ...checkInput,
            checkId: generateUniqueId('QC', index + 1),
            inspectorId: context.user.id,
            inspectorName: context.user.username
          });
        })
      );
      
      // Buat notifikasi untuk pemeriksaan yang gagal atau perlu perbaikan
      const failedChecks = createdChecks.filter(check => 
        check.result === 'fail' || check.result === 'needs_rework'
      );
      
      if (failedChecks.length > 0) {
        try {
          await FeedbackNotification.create({
            notificationId: generateUniqueId('NOTIF', 1),
            feedbackId,
            type: 'quality_issue',
            title: 'Beberapa Masalah Kualitas Terdeteksi',
            message: `${failedChecks.length} dari ${createdChecks.length} pemeriksaan kualitas menunjukkan hasil yang perlu ditindaklanjuti.`,
            recipientType: 'role',
            recipientId: 'production_manager',
            isRead: false,
            isDelivered: false,
            priority: 'high',
            deliveryMethod: 'in_app',
            createdBy: context.user.username
          });
        } catch (error) {
          console.error('Error membuat notifikasi:', error);
        }
      }
      
      // Update skor kualitas di feedback
      await updateQualityScore(feedbackId);
      
      return createdChecks;
    },
    
    // Mengupdate pemeriksaan kualitas
    updateQualityCheck: async (_, { id, input }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah pemeriksaan kualitas ada
      const qualityCheck = await QualityCheck.findByPk(id);
      if (!qualityCheck) {
        throw new Error('Pemeriksaan kualitas tidak ditemukan');
      }
      
      // Update pemeriksaan kualitas
      await qualityCheck.update(input);
      
      // Update skor kualitas di feedback
      await updateQualityScore(qualityCheck.feedbackId);
      
      return await QualityCheck.findByPk(id);
    },
    
    // Mengupdate hasil pemeriksaan kualitas
    updateQualityResult: async (_, { id, result, notes }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah pemeriksaan kualitas ada
      const qualityCheck = await QualityCheck.findByPk(id);
      if (!qualityCheck) {
        throw new Error('Pemeriksaan kualitas tidak ditemukan');
      }
      
      // Update hasil
      await qualityCheck.update({
        result,
        notes: notes || qualityCheck.notes
      });
      
      // Buat notifikasi jika hasil berubah menjadi fail atau needs_rework
      if ((result === 'fail' || result === 'needs_rework') && 
          (qualityCheck.result !== 'fail' && qualityCheck.result !== 'needs_rework')) {
        try {
          // Buat ID unik untuk notifikasi
          const generateUniqueId = (prefix) => {
            const timestamp = new Date().getTime().toString().slice(-8);
            const random = Math.random().toString(36).substring(2, 2 + 8);
            return `${prefix}-${timestamp}-${random}`;
          };
          
          await FeedbackNotification.create({
            notificationId: generateUniqueId('NOTIF'),
            feedbackId: qualityCheck.feedbackId,
            type: 'quality_issue',
            title: 'Hasil Pemeriksaan Kualitas Diperbarui',
            message: `Pemeriksaan kualitas "${qualityCheck.checkName}" diperbarui ke hasil ${result}. Harap segera ditindaklanjuti.`,
            recipientType: 'role',
            recipientId: 'production_manager',
            isRead: false,
            isDelivered: false,
            priority: 'high',
            deliveryMethod: 'in_app',
            createdBy: context.user.username
          });
        } catch (error) {
          console.error('Error membuat notifikasi:', error);
        }
      }
      
      // Update skor kualitas di feedback
      await updateQualityScore(qualityCheck.feedbackId);
      
      return await QualityCheck.findByPk(id);
    },
    
    // Menghapus pemeriksaan kualitas
    deleteQualityCheck: async (_, { id }, context) => {
      // Cek apakah user diautentikasi
      if (!context.user) {
        throw new Error('Autentikasi diperlukan');
      }
      
      // Cek apakah pemeriksaan kualitas ada
      const qualityCheck = await QualityCheck.findByPk(id);
      if (!qualityCheck) {
        throw new Error('Pemeriksaan kualitas tidak ditemukan');
      }
      
      // Ambil feedbackId untuk update skor nanti
      const feedbackId = qualityCheck.feedbackId;
      
      // Hapus pemeriksaan kualitas
      await qualityCheck.destroy();
      
      // Update skor kualitas di feedback
      await updateQualityScore(feedbackId);
      
      return {
        success: true,
        message: 'Pemeriksaan kualitas berhasil dihapus',
        id
      };
    }
  }
};

// Fungsi helper untuk mengupdate skor kualitas di feedback
async function updateQualityScore(feedbackId) {
  try {
    // Ambil semua pemeriksaan kualitas untuk feedback ini
    const qualityChecks = await QualityCheck.findAll({
      where: { feedbackId }
    });
    
    if (qualityChecks.length === 0) {
      // Tidak ada pemeriksaan, set skor ke null
      await ProductionFeedback.update(
        { qualityScore: null },
        { where: { id: feedbackId } }
      );
      return null;
    }
    
    // Hitung jumlah pemeriksaan untuk setiap hasil
    const resultCounts = {
      pending: 0,
      pass: 0,
      fail: 0,
      conditional_pass: 0,
      needs_rework: 0
    };
    
    qualityChecks.forEach(check => {
      if (resultCounts[check.result] !== undefined) {
        resultCounts[check.result]++;
      }
    });
    
    // Hitung skor kualitas (persentase pass + conditional_pass)
    const totalChecks = qualityChecks.length;
    const passChecks = resultCounts.pass + resultCounts.conditional_pass;
    const qualityScore = (passChecks / totalChecks) * 100;
    
    // Update skor kualitas di feedback
    await ProductionFeedback.update(
      { qualityScore },
      { where: { id: feedbackId } }
    );
    
    return qualityScore;
  } catch (error) {
    console.error('Error mengupdate skor kualitas:', error);
    return null;
  }
}

module.exports = qualityResolvers;
