/**
 * Controller Quality untuk Production Feedback Service
 * 
 * Mengelola logika bisnis untuk pemeriksaan kualitas
 */
const { 
  QualityCheck, 
  ProductionFeedback, 
  ProductionStep, 
  FeedbackImage 
} = require('../models');

// Membuat ID unik dengan format khusus
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

// Memperbarui status feedback berdasarkan hasil pemeriksaan kualitas
const updateFeedbackQualityScore = async (feedbackId) => {
  try {
    // Dapatkan semua pemeriksaan kualitas untuk feedback ini
    const qualityChecks = await QualityCheck.findAll({
      where: { feedbackId }
    });
    
    if (!qualityChecks || qualityChecks.length === 0) {
      return;
    }
    
    // Hitung skor kualitas berdasarkan hasil pemeriksaan
    const totalChecks = qualityChecks.length;
    const passedChecks = qualityChecks.filter(check => 
      check.result === 'passed'
    ).length;
    
    // Hitung skor kualitas (0-100)
    const qualityScore = Math.round((passedChecks / totalChecks) * 100);
    
    // Update feedback dengan skor kualitas baru
    await ProductionFeedback.update({
      qualityScore
    }, {
      where: { id: feedbackId }
    });
  } catch (error) {
    console.error('Error saat memperbarui skor kualitas feedback:', error);
  }
};

// Controller untuk operasi CRUD pada pemeriksaan kualitas
const qualityController = {
  // Mendapatkan semua pemeriksaan kualitas untuk feedback tertentu
  getQualityChecksByFeedbackId: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      const qualityChecks = await QualityCheck.findAll({
        where: { feedbackId },
        include: [
          {
            model: FeedbackImage,
            as: 'images'
          }
        ],
        order: [['checkDate', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: qualityChecks
      });
    } catch (error) {
      console.error('Error mengambil pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Mendapatkan pemeriksaan kualitas untuk langkah produksi tertentu
  getQualityChecksByStepId: async (req, res) => {
    try {
      const { stepId } = req.params;
      
      const qualityChecks = await QualityCheck.findAll({
        where: { stepId },
        include: [
          {
            model: FeedbackImage,
            as: 'images'
          }
        ],
        order: [['checkDate', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: qualityChecks
      });
    } catch (error) {
      console.error('Error mengambil pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Mendapatkan pemeriksaan kualitas berdasarkan ID
  getQualityCheckById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const qualityCheck = await QualityCheck.findByPk(id, {
        include: [
          {
            model: FeedbackImage,
            as: 'images'
          }
        ]
      });
      
      if (!qualityCheck) {
        return res.status(404).json({
          success: false,
          message: 'Pemeriksaan kualitas tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: qualityCheck
      });
    } catch (error) {
      console.error('Error mengambil detail pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Mendapatkan pemeriksaan kualitas berdasarkan checkId
  getQualityCheckByCheckId: async (req, res) => {
    try {
      const { checkId } = req.params;
      
      const qualityCheck = await QualityCheck.findOne({
        where: { checkId },
        include: [
          {
            model: FeedbackImage,
            as: 'images'
          }
        ]
      });
      
      if (!qualityCheck) {
        return res.status(404).json({
          success: false,
          message: 'Pemeriksaan kualitas tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: qualityCheck
      });
    } catch (error) {
      console.error('Error mengambil detail pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Membuat pemeriksaan kualitas baru
  createQualityCheck: async (req, res) => {
    try {
      const {
        feedbackId,
        stepId,
        inspectorId,
        inspectorName,
        checkType,
        checkName,
        checkDescription,
        standard,
        quantityChecked,
        measurementValue,
        measurementUnit,
        toleranceMin,
        toleranceMax,
        result,
        quantityPassed,
        quantityRejected,
        defects,
        correctiveActions,
        notes
      } = req.body;
      
      // Validasi input
      if (!feedbackId || !checkType || !checkName) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. Harap isi semua field yang diperlukan'
        });
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Cek apakah langkah ada jika stepId disediakan
      if (stepId) {
        const step = await ProductionStep.findByPk(stepId);
        
        if (!step) {
          return res.status(404).json({
            success: false,
            message: 'Langkah produksi tidak ditemukan'
          });
        }
      }
      
      // Tentukan hasil berdasarkan pengukuran jika tidak disediakan
      let determinedResult = result;
      if (!determinedResult && measurementValue !== undefined && toleranceMin !== undefined && toleranceMax !== undefined) {
        determinedResult = (measurementValue >= toleranceMin && measurementValue <= toleranceMax) ? 'passed' : 'failed';
      }
      
      // Buat pemeriksaan kualitas baru
      const qualityCheck = await QualityCheck.create({
        checkId: generateUniqueId('QC'),
        feedbackId,
        stepId,
        inspectorId,
        inspectorName,
        checkType,
        checkName,
        checkDescription,
        standard,
        result: determinedResult || 'pending',
        quantityChecked: quantityChecked || 0,
        quantityPassed: quantityPassed || 0,
        quantityRejected: quantityRejected || 0,
        measurementValue,
        measurementUnit,
        toleranceMin,
        toleranceMax,
        checkDate: new Date(),
        defects,
        correctiveActions,
        notes
      });
      
      // Update skor kualitas feedback
      await updateFeedbackQualityScore(feedbackId);
      
      return res.status(201).json({
        success: true,
        message: 'Pemeriksaan kualitas berhasil dibuat',
        data: qualityCheck
      });
    } catch (error) {
      console.error('Error membuat pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Mengupdate pemeriksaan kualitas
  updateQualityCheck: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        inspectorId,
        inspectorName,
        checkType,
        checkName,
        checkDescription,
        standard,
        result,
        quantityChecked,
        quantityPassed,
        quantityRejected,
        measurementValue,
        measurementUnit,
        toleranceMin,
        toleranceMax,
        defects,
        correctiveActions,
        notes
      } = req.body;
      
      // Cek apakah pemeriksaan kualitas ada
      const qualityCheck = await QualityCheck.findByPk(id);
      
      if (!qualityCheck) {
        return res.status(404).json({
          success: false,
          message: 'Pemeriksaan kualitas tidak ditemukan'
        });
      }
      
      // Tentukan hasil berdasarkan pengukuran jika tidak disediakan tetapi pengukuran diperbarui
      let determinedResult = result;
      if (!determinedResult && 
          measurementValue !== undefined && 
          (toleranceMin !== undefined || qualityCheck.toleranceMin) &&
          (toleranceMax !== undefined || qualityCheck.toleranceMax)) {
        
        const min = toleranceMin !== undefined ? toleranceMin : qualityCheck.toleranceMin;
        const max = toleranceMax !== undefined ? toleranceMax : qualityCheck.toleranceMax;
        
        determinedResult = (measurementValue >= min && measurementValue <= max) ? 'passed' : 'failed';
      }
      
      // Persiapkan data untuk update
      const updateData = {
        ...(inspectorId && { inspectorId }),
        ...(inspectorName && { inspectorName }),
        ...(checkType && { checkType }),
        ...(checkName && { checkName }),
        ...(checkDescription && { checkDescription }),
        ...(standard && { standard }),
        ...(determinedResult && { result: determinedResult }),
        ...(quantityChecked !== undefined && { quantityChecked }),
        ...(quantityPassed !== undefined && { quantityPassed }),
        ...(quantityRejected !== undefined && { quantityRejected }),
        ...(measurementValue !== undefined && { measurementValue }),
        ...(measurementUnit && { measurementUnit }),
        ...(toleranceMin !== undefined && { toleranceMin }),
        ...(toleranceMax !== undefined && { toleranceMax }),
        ...(defects && { defects }),
        ...(correctiveActions && { correctiveActions }),
        ...(notes && { notes })
      };
      
      // Update pemeriksaan kualitas
      await QualityCheck.update(updateData, {
        where: { id }
      });
      
      // Ambil data pemeriksaan kualitas yang sudah diupdate
      const updatedQualityCheck = await QualityCheck.findByPk(id);
      
      // Update skor kualitas feedback
      await updateFeedbackQualityScore(qualityCheck.feedbackId);
      
      return res.status(200).json({
        success: true,
        message: 'Pemeriksaan kualitas berhasil diperbarui',
        data: updatedQualityCheck
      });
    } catch (error) {
      console.error('Error mengupdate pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Menghapus pemeriksaan kualitas
  deleteQualityCheck: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Cek apakah pemeriksaan kualitas ada
      const qualityCheck = await QualityCheck.findByPk(id);
      
      if (!qualityCheck) {
        return res.status(404).json({
          success: false,
          message: 'Pemeriksaan kualitas tidak ditemukan'
        });
      }
      
      // Simpan feedbackId untuk update nanti
      const feedbackId = qualityCheck.feedbackId;
      
      // Hapus pemeriksaan kualitas
      await QualityCheck.destroy({
        where: { id }
      });
      
      // Update skor kualitas feedback
      await updateFeedbackQualityScore(feedbackId);
      
      return res.status(200).json({
        success: true,
        message: 'Pemeriksaan kualitas berhasil dihapus'
      });
    } catch (error) {
      console.error('Error menghapus pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Memperbarui hasil pemeriksaan kualitas
  updateQualityCheckResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        result, 
        quantityPassed, 
        quantityRejected, 
        defects, 
        correctiveActions 
      } = req.body;
      
      // Validasi input
      if (!result) {
        return res.status(400).json({
          success: false,
          message: 'Hasil pemeriksaan harus disediakan'
        });
      }
      
      // Cek apakah pemeriksaan kualitas ada
      const qualityCheck = await QualityCheck.findByPk(id);
      
      if (!qualityCheck) {
        return res.status(404).json({
          success: false,
          message: 'Pemeriksaan kualitas tidak ditemukan'
        });
      }
      
      // Persiapkan data update
      const updateData = {
        result,
        ...(quantityPassed !== undefined && { quantityPassed }),
        ...(quantityRejected !== undefined && { quantityRejected }),
        ...(defects && { defects }),
        ...(correctiveActions && { correctiveActions })
      };
      
      // Update pemeriksaan kualitas
      await QualityCheck.update(updateData, {
        where: { id }
      });
      
      // Ambil data pemeriksaan kualitas yang sudah diupdate
      const updatedQualityCheck = await QualityCheck.findByPk(id);
      
      // Update skor kualitas feedback
      await updateFeedbackQualityScore(qualityCheck.feedbackId);
      
      return res.status(200).json({
        success: true,
        message: 'Hasil pemeriksaan kualitas berhasil diperbarui',
        data: updatedQualityCheck
      });
    } catch (error) {
      console.error('Error memperbarui hasil pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui hasil pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Membuat beberapa pemeriksaan kualitas sekaligus
  createMultipleQualityChecks: async (req, res) => {
    try {
      const { feedbackId, stepId, qualityChecks } = req.body;
      
      // Validasi input
      if (!feedbackId || !qualityChecks || !Array.isArray(qualityChecks) || qualityChecks.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. Harap sediakan feedbackId dan array qualityChecks'
        });
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Cek apakah langkah ada jika stepId disediakan
      if (stepId) {
        const step = await ProductionStep.findByPk(stepId);
        
        if (!step) {
          return res.status(404).json({
            success: false,
            message: 'Langkah produksi tidak ditemukan'
          });
        }
      }
      
      // Buat pemeriksaan kualitas baru
      const createdChecks = [];
      
      for (const checkData of qualityChecks) {
        const {
          inspectorId,
          inspectorName,
          checkType,
          checkName,
          checkDescription,
          standard,
          result,
          quantityChecked,
          quantityPassed,
          quantityRejected,
          measurementValue,
          measurementUnit,
          toleranceMin,
          toleranceMax,
          defects,
          correctiveActions,
          notes
        } = checkData;
        
        if (!checkType || !checkName) {
          continue; // Lewati data yang tidak lengkap
        }
        
        // Tentukan hasil berdasarkan pengukuran jika tidak disediakan
        let determinedResult = result;
        if (!determinedResult && measurementValue !== undefined && toleranceMin !== undefined && toleranceMax !== undefined) {
          determinedResult = (measurementValue >= toleranceMin && measurementValue <= toleranceMax) ? 'passed' : 'failed';
        }
        
        const qualityCheck = await QualityCheck.create({
          checkId: generateUniqueId('QC'),
          feedbackId,
          stepId,
          inspectorId,
          inspectorName,
          checkType,
          checkName,
          checkDescription,
          standard,
          result: determinedResult || 'pending',
          quantityChecked: quantityChecked || 0,
          quantityPassed: quantityPassed || 0,
          quantityRejected: quantityRejected || 0,
          measurementValue,
          measurementUnit,
          toleranceMin,
          toleranceMax,
          checkDate: new Date(),
          defects,
          correctiveActions,
          notes
        });
        
        createdChecks.push(qualityCheck);
      }
      
      // Update skor kualitas feedback
      await updateFeedbackQualityScore(feedbackId);
      
      return res.status(201).json({
        success: true,
        message: `${createdChecks.length} pemeriksaan kualitas berhasil dibuat`,
        data: createdChecks
      });
    } catch (error) {
      console.error('Error membuat multiple pemeriksaan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat pemeriksaan kualitas',
        error: error.message
      });
    }
  },
  
  // Mendapatkan ringkasan kualitas untuk feedback tertentu
  getQualitySummaryByFeedbackId: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Dapatkan semua pemeriksaan kualitas untuk feedback ini
      const qualityChecks = await QualityCheck.findAll({
        where: { feedbackId }
      });
      
      // Hitung ringkasan berdasarkan hasil pemeriksaan
      const totalChecks = qualityChecks.length;
      const checksByResult = qualityChecks.reduce((acc, check) => {
        acc[check.result] = (acc[check.result] || 0) + 1;
        return acc;
      }, {});
      
      const checksByType = qualityChecks.reduce((acc, check) => {
        if (!acc[check.checkType]) {
          acc[check.checkType] = {
            total: 0,
            passed: 0,
            failed: 0,
            pending: 0,
            waived: 0
          };
        }
        
        acc[check.checkType].total += 1;
        acc[check.checkType][check.result] += 1;
        
        return acc;
      }, {});
      
      // Hitung jumlah unit yang diperiksa, lulus, dan ditolak
      const quantitySummary = qualityChecks.reduce((acc, check) => {
        acc.checked += check.quantityChecked || 0;
        acc.passed += check.quantityPassed || 0;
        acc.rejected += check.quantityRejected || 0;
        return acc;
      }, { checked: 0, passed: 0, rejected: 0 });
      
      // Hitung skor kualitas
      const passedChecks = qualityChecks.filter(check => check.result === 'passed').length;
      const qualityScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
      
      // Format data ringkasan
      const summary = {
        feedbackId: feedback.feedbackId,
        productionId: feedback.productionId,
        batchId: feedback.batchId,
        totalChecks,
        checksByResult,
        checksByType,
        quantities: quantitySummary,
        qualityScore,
        lastCheckDate: qualityChecks.length > 0 ? 
          qualityChecks.sort((a, b) => new Date(b.checkDate) - new Date(a.checkDate))[0].checkDate : 
          null
      };
      
      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error mendapatkan ringkasan kualitas:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mendapatkan ringkasan kualitas',
        error: error.message
      });
    }
  }
};

module.exports = qualityController;
