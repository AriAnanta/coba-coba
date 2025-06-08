/**
 * Controller Step untuk Production Feedback Service
 * 
 * Mengelola logika bisnis untuk langkah produksi
 */
const { Op } = require('sequelize');
const { 
  ProductionStep, 
  ProductionFeedback,
  QualityCheck, 
  FeedbackImage 
} = require('../models');

// Membuat ID unik dengan format khusus
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

// Menghitung durasi dalam menit antara dua waktu
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Hitung selisih dalam milidetik dan konversi ke menit
  return Math.round((end - start) / (1000 * 60));
};

// Memperbarui status feedback berdasarkan langkah-langkahnya
const updateFeedbackStatus = async (feedbackId) => {
  try {
    // Dapatkan semua langkah untuk feedback ini
    const steps = await ProductionStep.findAll({
      where: { feedbackId }
    });
    
    if (!steps || steps.length === 0) {
      return;
    }
    
    // Hitung persentase penyelesaian berdasarkan langkah-langkah
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => 
      step.status === 'completed'
    ).length;
    const failedSteps = steps.filter(step => 
      step.status === 'failed'
    ).length;
    
    // Hitung persentase penyelesaian
    const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
    
    // Tentukan status feedback berdasarkan langkah-langkah
    let status = 'pending';
    
    // Jika ada langkah yang in_progress, status feedback adalah in_progress
    if (steps.some(step => step.status === 'in_progress')) {
      status = 'in_progress';
    } 
    // Jika semua langkah selesai, status feedback adalah completed
    else if (completedSteps === totalSteps) {
      status = 'completed';
    } 
    // Jika ada langkah yang gagal dan tidak ada langkah yang in_progress, status feedback adalah failed
    else if (failedSteps > 0 && !steps.some(step => step.status === 'in_progress')) {
      status = 'failed';
    }
    
    // Dapatkan feedback
    const feedback = await ProductionFeedback.findByPk(feedbackId);
    
    if (!feedback) {
      return;
    }
    
    // Hitung kuantitas yang diproduksi dan ditolak dari langkah-langkah
    const totalProduced = steps.reduce((sum, step) => 
      sum + (step.quantityPassed || 0), 0
    );
    
    const totalRejected = steps.reduce((sum, step) => 
      sum + (step.quantityRejected || 0), 0
    );
    
    // Update feedback
    await ProductionFeedback.update({
      status,
      completionPercentage,
      quantityProduced: totalProduced > 0 ? totalProduced : feedback.quantityProduced,
      quantityRejected: totalRejected > 0 ? totalRejected : feedback.quantityRejected,
      ...(status === 'completed' && !feedback.endDate ? { endDate: new Date() } : {})
    }, {
      where: { id: feedbackId }
    });
  } catch (error) {
    console.error('Error saat memperbarui status feedback:', error);
  }
};

// Controller untuk operasi CRUD pada langkah produksi
const stepController = {
  // Mendapatkan semua langkah untuk feedback tertentu
  getStepsByFeedbackId: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      const steps = await ProductionStep.findAll({
        where: { feedbackId },
        include: [
          {
            model: QualityCheck,
            as: 'qualityChecks'
          },
          {
            model: FeedbackImage,
            as: 'images'
          }
        ],
        order: [['stepOrder', 'ASC']]
      });
      
      return res.status(200).json({
        success: true,
        data: steps
      });
    } catch (error) {
      console.error('Error mengambil langkah produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil langkah produksi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan langkah berdasarkan ID
  getStepById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const step = await ProductionStep.findByPk(id, {
        include: [
          {
            model: QualityCheck,
            as: 'qualityChecks'
          },
          {
            model: FeedbackImage,
            as: 'images'
          }
        ]
      });
      
      if (!step) {
        return res.status(404).json({
          success: false,
          message: 'Langkah produksi tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: step
      });
    } catch (error) {
      console.error('Error mengambil detail langkah produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail langkah produksi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan langkah berdasarkan stepId
  getStepByStepId: async (req, res) => {
    try {
      const { stepId } = req.params;
      
      const step = await ProductionStep.findOne({
        where: { stepId },
        include: [
          {
            model: QualityCheck,
            as: 'qualityChecks'
          },
          {
            model: FeedbackImage,
            as: 'images'
          }
        ]
      });
      
      if (!step) {
        return res.status(404).json({
          success: false,
          message: 'Langkah produksi tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: step
      });
    } catch (error) {
      console.error('Error mengambil detail langkah produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail langkah produksi',
        error: error.message
      });
    }
  },
  
  // Membuat langkah produksi baru
  createStep: async (req, res) => {
    try {
      const {
        feedbackId,
        machineId,
        machineName,
        operatorId,
        operatorName,
        stepName,
        stepOrder,
        expectedDuration,
        materialsUsed,
        notes
      } = req.body;
      
      // Validasi input
      if (!feedbackId || !stepName || stepOrder === undefined) {
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
      
      // Cek apakah langkah dengan urutan yang sama sudah ada
      const existingStep = await ProductionStep.findOne({
        where: {
          feedbackId,
          stepOrder
        }
      });
      
      if (existingStep) {
        return res.status(409).json({
          success: false,
          message: 'Langkah dengan urutan yang sama sudah ada untuk feedback ini'
        });
      }
      
      // Buat langkah baru
      const step = await ProductionStep.create({
        stepId: generateUniqueId('STEP'),
        feedbackId,
        machineId,
        machineName,
        operatorId,
        operatorName,
        stepName,
        stepOrder,
        status: 'pending',
        expectedDuration,
        materialsUsed: materialsUsed ? JSON.stringify(materialsUsed) : null,
        notes
      });
      
      return res.status(201).json({
        success: true,
        message: 'Langkah produksi berhasil dibuat',
        data: step
      });
    } catch (error) {
      console.error('Error membuat langkah produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat langkah produksi',
        error: error.message
      });
    }
  },
  
  // Mengupdate langkah produksi
  updateStep: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        machineId,
        machineName,
        operatorId,
        operatorName,
        stepName,
        stepOrder,
        status,
        startTime,
        endTime,
        expectedDuration,
        materialsUsed,
        quantityProcessed,
        quantityPassed,
        quantityRejected,
        issuesEncountered,
        actionsTaken,
        notes
      } = req.body;
      
      // Cek apakah langkah ada
      const step = await ProductionStep.findByPk(id);
      
      if (!step) {
        return res.status(404).json({
          success: false,
          message: 'Langkah produksi tidak ditemukan'
        });
      }
      
      // Cek apakah urutan baru sudah digunakan oleh langkah lain
      if (stepOrder !== undefined && stepOrder !== step.stepOrder) {
        const existingStep = await ProductionStep.findOne({
          where: {
            feedbackId: step.feedbackId,
            stepOrder,
            id: {
              [Op.ne]: id
            }
          }
        });
        
        if (existingStep) {
          return res.status(409).json({
            success: false,
            message: 'Langkah dengan urutan yang sama sudah ada untuk feedback ini'
          });
        }
      }
      
      // Hitung durasi jika startTime dan endTime disediakan
      let duration = null;
      if (startTime && endTime) {
        duration = calculateDuration(startTime, endTime);
      } else if (startTime && status === 'completed' && !endTime) {
        // Jika status completed tetapi endTime tidak disediakan, gunakan waktu sekarang
        duration = calculateDuration(startTime, new Date());
      }
      
      // Persiapkan data untuk update
      const updateData = {
        ...(machineId && { machineId }),
        ...(machineName && { machineName }),
        ...(operatorId && { operatorId }),
        ...(operatorName && { operatorName }),
        ...(stepName && { stepName }),
        ...(stepOrder !== undefined && { stepOrder }),
        ...(status && { status }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(duration !== null && { duration }),
        ...(expectedDuration && { expectedDuration }),
        ...(materialsUsed && { materialsUsed: JSON.stringify(materialsUsed) }),
        ...(quantityProcessed !== undefined && { quantityProcessed }),
        ...(quantityPassed !== undefined && { quantityPassed }),
        ...(quantityRejected !== undefined && { quantityRejected }),
        ...(issuesEncountered && { issuesEncountered }),
        ...(actionsTaken && { actionsTaken }),
        ...(notes && { notes })
      };
      
      // Jika status berubah menjadi in_progress dan tidak ada startTime, tambahkan startTime sekarang
      if (status === 'in_progress' && !startTime && !step.startTime) {
        updateData.startTime = new Date();
      }
      
      // Jika status berubah menjadi completed dan tidak ada endTime, tambahkan endTime sekarang
      if (status === 'completed' && !endTime && !step.endTime) {
        updateData.endTime = new Date();
        
        // Hitung durasi jika startTime ada
        if (step.startTime || updateData.startTime) {
          updateData.duration = calculateDuration(
            step.startTime || updateData.startTime,
            updateData.endTime
          );
        }
      }
      
      // Update langkah
      await ProductionStep.update(updateData, {
        where: { id }
      });
      
      // Ambil data langkah yang sudah diupdate
      const updatedStep = await ProductionStep.findByPk(id);
      
      // Update status feedback berdasarkan langkah-langkah
      await updateFeedbackStatus(step.feedbackId);
      
      return res.status(200).json({
        success: true,
        message: 'Langkah produksi berhasil diperbarui',
        data: updatedStep
      });
    } catch (error) {
      console.error('Error mengupdate langkah produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui langkah produksi',
        error: error.message
      });
    }
  },
  
  // Menghapus langkah produksi
  deleteStep: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Cek apakah langkah ada
      const step = await ProductionStep.findByPk(id);
      
      if (!step) {
        return res.status(404).json({
          success: false,
          message: 'Langkah produksi tidak ditemukan'
        });
      }
      
      // Simpan feedbackId untuk update nanti
      const feedbackId = step.feedbackId;
      
      // Hapus langkah
      await ProductionStep.destroy({
        where: { id }
      });
      
      // Update status feedback berdasarkan langkah-langkah yang tersisa
      await updateFeedbackStatus(feedbackId);
      
      return res.status(200).json({
        success: true,
        message: 'Langkah produksi berhasil dihapus'
      });
    } catch (error) {
      console.error('Error menghapus langkah produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus langkah produksi',
        error: error.message
      });
    }
  },
  
  // Membuat beberapa langkah produksi sekaligus
  createMultipleSteps: async (req, res) => {
    try {
      const { feedbackId, steps } = req.body;
      
      // Validasi input
      if (!feedbackId || !steps || !Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. Harap sediakan feedbackId dan array steps'
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
      
      // Cek urutan langkah yang sudah ada
      const existingSteps = await ProductionStep.findAll({
        where: { feedbackId },
        attributes: ['stepOrder']
      });
      
      const existingOrders = existingSteps.map(step => step.stepOrder);
      
      // Cek apakah ada urutan yang duplikat
      const newOrders = steps.map(step => step.stepOrder);
      const duplicateOrders = newOrders.filter(order => 
        existingOrders.includes(order) || 
        newOrders.filter(o => o === order).length > 1
      );
      
      if (duplicateOrders.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Terdapat urutan langkah yang duplikat',
          duplicateOrders
        });
      }
      
      // Buat langkah-langkah baru
      const createdSteps = [];
      
      for (const stepData of steps) {
        const {
          machineId,
          machineName,
          operatorId,
          operatorName,
          stepName,
          stepOrder,
          expectedDuration,
          materialsUsed,
          notes
        } = stepData;
        
        if (!stepName || stepOrder === undefined) {
          continue; // Lewati data yang tidak lengkap
        }
        
        const step = await ProductionStep.create({
          stepId: generateUniqueId('STEP'),
          feedbackId,
          machineId,
          machineName,
          operatorId,
          operatorName,
          stepName,
          stepOrder,
          status: 'pending',
          expectedDuration,
          materialsUsed: materialsUsed ? JSON.stringify(materialsUsed) : null,
          notes
        });
        
        createdSteps.push(step);
      }
      
      // Update status feedback
      await updateFeedbackStatus(feedbackId);
      
      return res.status(201).json({
        success: true,
        message: `${createdSteps.length} langkah produksi berhasil dibuat`,
        data: createdSteps
      });
    } catch (error) {
      console.error('Error membuat multiple langkah produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat langkah produksi',
        error: error.message
      });
    }
  },
  
  // Memperbarui status langkah produksi
  updateStepStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, operatorId, operatorName, notes } = req.body;
      
      // Validasi input
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status baru harus disediakan'
        });
      }
      
      // Cek apakah langkah ada
      const step = await ProductionStep.findByPk(id);
      
      if (!step) {
        return res.status(404).json({
          success: false,
          message: 'Langkah produksi tidak ditemukan'
        });
      }
      
      // Persiapkan data update
      const updateData = {
        status,
        ...(operatorId && { operatorId }),
        ...(operatorName && { operatorName }),
        ...(notes && { notes: step.notes ? `${step.notes}\n${notes}` : notes })
      };
      
      // Update waktu mulai atau selesai berdasarkan status
      if (status === 'in_progress' && !step.startTime) {
        updateData.startTime = new Date();
      } else if (status === 'completed' && !step.endTime) {
        updateData.endTime = new Date();
        
        // Hitung durasi jika startTime ada
        if (step.startTime) {
          updateData.duration = calculateDuration(step.startTime, updateData.endTime);
        }
      }
      
      // Update langkah
      await ProductionStep.update(updateData, {
        where: { id }
      });
      
      // Ambil data langkah yang sudah diupdate
      const updatedStep = await ProductionStep.findByPk(id);
      
      // Update status feedback berdasarkan langkah-langkah
      await updateFeedbackStatus(step.feedbackId);
      
      return res.status(200).json({
        success: true,
        message: 'Status langkah produksi berhasil diperbarui',
        data: updatedStep
      });
    } catch (error) {
      console.error('Error memperbarui status langkah produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui status langkah produksi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan langkah berdasarkan machineId
  getStepsByMachineId: async (req, res) => {
    try {
      const { machineId } = req.params;
      
      const steps = await ProductionStep.findAll({
        where: { machineId },
        include: [
          {
            model: ProductionFeedback,
            as: 'productionFeedback',
            attributes: ['id', 'feedbackId', 'productionId', 'batchId', 'productId', 'productName', 'status']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: steps
      });
    } catch (error) {
      console.error('Error mengambil langkah produksi berdasarkan machineId:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil langkah produksi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan langkah berdasarkan operatorId
  getStepsByOperatorId: async (req, res) => {
    try {
      const { operatorId } = req.params;
      
      const steps = await ProductionStep.findAll({
        where: { operatorId },
        include: [
          {
            model: ProductionFeedback,
            as: 'productionFeedback',
            attributes: ['id', 'feedbackId', 'productionId', 'batchId', 'productId', 'productName', 'status']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: steps
      });
    } catch (error) {
      console.error('Error mengambil langkah produksi berdasarkan operatorId:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil langkah produksi',
        error: error.message
      });
    }
  }
};

module.exports = stepController;
