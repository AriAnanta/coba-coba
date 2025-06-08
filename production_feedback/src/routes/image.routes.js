/**
 * Routes untuk Feedback Image
 * 
 * Mendefinisikan routing untuk endpoint Feedback Image
 */
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/image.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi penyimpanan untuk upload gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Buat direktori uploads jika belum ada
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Buat nama file yang unik dengan timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

// Filter file untuk memastikan hanya gambar yang diupload
const fileFilter = (req, file, cb) => {
  // Cek tipe file
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

// Inisialisasi multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Batasi ukuran file menjadi 5MB
  }
});

// Route publik untuk mengakses gambar
router.get('/file/:filename', imageController.getImageFile);

// Semua routes di bawah ini membutuhkan autentikasi
router.use(verifyToken);

// Endpoint untuk mendapatkan data gambar
router.get('/feedback/:feedbackId', imageController.getImagesByFeedbackId);
router.get('/step/:stepId', imageController.getImagesByStepId);
router.get('/quality/:qualityCheckId', imageController.getImagesByQualityCheckId);
router.get('/:id', imageController.getImageById);
router.get('/image-id/:imageId', imageController.getImageByImageId);
router.get('/public/:feedbackId', imageController.getPublicImages);

// Endpoint untuk mengelola gambar (memerlukan role tertentu)
router.post('/', 
  checkRole(['production_manager', 'production_operator', 'quality_inspector', 'admin']), 
  upload.single('image'), 
  imageController.uploadImage
);
router.put('/:id', 
  checkRole(['production_manager', 'production_operator', 'quality_inspector', 'admin']), 
  imageController.updateImage
);
router.delete('/:id', 
  checkRole(['production_manager', 'admin']), 
  imageController.deleteImage
);

module.exports = router;
