/**
 * Controller Image untuk Production Feedback Service
 * 
 * Mengelola logika bisnis untuk gambar/foto terkait produksi
 */
const fs = require('fs');
const path = require('path');
const { 
  FeedbackImage, 
  ProductionFeedback, 
  ProductionStep, 
  QualityCheck 
} = require('../models');
require('dotenv').config();

// Membuat ID unik dengan format khusus
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

// Membuat direktori jika belum ada
const ensureDirectoryExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

// Hapus file gambar dari sistem file
const removeImageFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(`Error menghapus file gambar ${filePath}:`, error);
  }
};

// Controller untuk operasi CRUD pada gambar produksi
const imageController = {
  // Mendapatkan semua gambar untuk feedback tertentu
  getImagesByFeedbackId: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      const images = await FeedbackImage.findAll({
        where: { feedbackId },
        order: [['uploadDate', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Error mengambil gambar produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil gambar produksi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan gambar untuk langkah produksi tertentu
  getImagesByStepId: async (req, res) => {
    try {
      const { stepId } = req.params;
      
      const images = await FeedbackImage.findAll({
        where: { stepId },
        order: [['uploadDate', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Error mengambil gambar produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil gambar produksi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan gambar untuk pemeriksaan kualitas tertentu
  getImagesByQualityCheckId: async (req, res) => {
    try {
      const { qualityCheckId } = req.params;
      
      const images = await FeedbackImage.findAll({
        where: { qualityCheckId },
        order: [['uploadDate', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: images
      });
    } catch (error) {
      console.error('Error mengambil gambar produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil gambar produksi',
        error: error.message
      });
    }
  },
  
  // Mendapatkan gambar berdasarkan ID
  getImageById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const image = await FeedbackImage.findByPk(id);
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Gambar tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: image
      });
    } catch (error) {
      console.error('Error mengambil detail gambar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail gambar',
        error: error.message
      });
    }
  },
  
  // Mendapatkan gambar berdasarkan imageId
  getImageByImageId: async (req, res) => {
    try {
      const { imageId } = req.params;
      
      const image = await FeedbackImage.findOne({
        where: { imageId }
      });
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Gambar tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: image
      });
    } catch (error) {
      console.error('Error mengambil detail gambar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail gambar',
        error: error.message
      });
    }
  },
  
  // Mengupload gambar baru
  uploadImage: async (req, res) => {
    try {
      // Cek apakah ada file yang diupload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diupload'
        });
      }
      
      const {
        feedbackId,
        stepId,
        qualityCheckId,
        imageType,
        title,
        description,
        isPublic
      } = req.body;
      
      // Validasi input
      if (!feedbackId) {
        // Hapus file yang sudah diupload jika ada error
        if (req.file && req.file.path) {
          removeImageFile(req.file.path);
        }
        
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. feedbackId harus disediakan'
        });
      }
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(feedbackId);
      
      if (!feedback) {
        // Hapus file yang sudah diupload jika ada error
        if (req.file && req.file.path) {
          removeImageFile(req.file.path);
        }
        
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Cek apakah stepId valid jika disediakan
      if (stepId) {
        const step = await ProductionStep.findByPk(stepId);
        
        if (!step) {
          // Hapus file yang sudah diupload jika ada error
          if (req.file && req.file.path) {
            removeImageFile(req.file.path);
          }
          
          return res.status(404).json({
            success: false,
            message: 'Langkah produksi tidak ditemukan'
          });
        }
      }
      
      // Cek apakah qualityCheckId valid jika disediakan
      if (qualityCheckId) {
        const qualityCheck = await QualityCheck.findByPk(qualityCheckId);
        
        if (!qualityCheck) {
          // Hapus file yang sudah diupload jika ada error
          if (req.file && req.file.path) {
            removeImageFile(req.file.path);
          }
          
          return res.status(404).json({
            success: false,
            message: 'Pemeriksaan kualitas tidak ditemukan'
          });
        }
      }
      
      // Ambil informasi file yang diupload
      const { filename, path: filePath, mimetype, size } = req.file;
      
      // Tentukan URL akses file
      const fileUrl = `${process.env.SERVICE_URL}/uploads/${filename}`;
      
      // Buat data gambar baru
      const image = await FeedbackImage.create({
        imageId: generateUniqueId('IMG'),
        feedbackId,
        stepId: stepId || null,
        qualityCheckId: qualityCheckId || null,
        imageType: imageType || 'product',
        title: title || filename,
        description: description || '',
        filePath: filePath.replace(/\\/g, '/'), // Pastikan path menggunakan forward slash
        fileUrl,
        fileType: mimetype,
        fileSize: size,
        uploadedBy: req.user ? req.user.username : null,
        uploadDate: new Date(),
        isPublic: isPublic === 'true' || isPublic === true
      });
      
      return res.status(201).json({
        success: true,
        message: 'Gambar berhasil diupload',
        data: image
      });
    } catch (error) {
      console.error('Error mengupload gambar:', error);
      
      // Hapus file yang sudah diupload jika ada error
      if (req.file && req.file.path) {
        removeImageFile(req.file.path);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Gagal mengupload gambar',
        error: error.message
      });
    }
  },
  
  // Mengupdate informasi gambar
  updateImage: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        imageType,
        title,
        description,
        isPublic
      } = req.body;
      
      // Cek apakah gambar ada
      const image = await FeedbackImage.findByPk(id);
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Gambar tidak ditemukan'
        });
      }
      
      // Persiapkan data untuk update
      const updateData = {
        ...(imageType && { imageType }),
        ...(title && { title }),
        ...(description && { description }),
        ...(isPublic !== undefined && { isPublic: isPublic === 'true' || isPublic === true })
      };
      
      // Update gambar
      await FeedbackImage.update(updateData, {
        where: { id }
      });
      
      // Ambil data gambar yang sudah diupdate
      const updatedImage = await FeedbackImage.findByPk(id);
      
      return res.status(200).json({
        success: true,
        message: 'Informasi gambar berhasil diperbarui',
        data: updatedImage
      });
    } catch (error) {
      console.error('Error mengupdate informasi gambar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui informasi gambar',
        error: error.message
      });
    }
  },
  
  // Menghapus gambar
  deleteImage: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Cek apakah gambar ada
      const image = await FeedbackImage.findByPk(id);
      
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Gambar tidak ditemukan'
        });
      }
      
      // Hapus file gambar dari sistem file
      if (image.filePath) {
        removeImageFile(image.filePath);
      }
      
      // Hapus data gambar dari database
      await FeedbackImage.destroy({
        where: { id }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Gambar berhasil dihapus'
      });
    } catch (error) {
      console.error('Error menghapus gambar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus gambar',
        error: error.message
      });
    }
  },
  
  // Mengambil file gambar fisik
  getImageFile: async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Tentukan path file
      const filePath = path.join(__dirname, '../../uploads', filename);
      
      // Cek apakah file ada
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File gambar tidak ditemukan'
        });
      }
      
      // Kirim file
      return res.sendFile(filePath);
    } catch (error) {
      console.error('Error mengambil file gambar:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil file gambar',
        error: error.message
      });
    }
  },
  
  // Mengambil gambar publik untuk marketplace
  getPublicImages: async (req, res) => {
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
      
      // Ambil gambar publik
      const publicImages = await FeedbackImage.findAll({
        where: {
          feedbackId,
          isPublic: true
        },
        order: [['uploadDate', 'DESC']]
      });
      
      return res.status(200).json({
        success: true,
        data: publicImages
      });
    } catch (error) {
      console.error('Error mengambil gambar publik:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil gambar publik',
        error: error.message
      });
    }
  }
};

module.exports = imageController;
