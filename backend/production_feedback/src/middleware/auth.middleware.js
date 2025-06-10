/**
 * Middleware Autentikasi untuk Production Feedback Service
 * 
 * Memvalidasi token JWT melalui User Service terpusat
 */
const axios = require('axios');
require('dotenv').config();

// Middleware untuk memverifikasi token JWT
const verifyToken = async (req, res, next) => {
  try {
    // Cek header otorisasi
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token autentikasi tidak ditemukan'
      });
    }
    
    // Ekstrak token dari header
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        message: 'Token autentikasi tidak valid'
      });
    }
    
    try {
      // Verifikasi token melalui User Service
      const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/auth/verify`, { token });
      
      // Jika verifikasi berhasil, simpan data pengguna di req
      req.user = response.data.user;
      
      next();
    } catch (error) {
      console.error('Error verifikasi token:', error.message);
      
      return res.status(401).json({
        message: 'Token tidak valid atau kedaluwarsa'
      });
    }
  } catch (error) {
    console.error('Error pada middleware autentikasi:', error);
    
    return res.status(500).json({
      message: 'Kesalahan server internal'
    });
  }
};

// Middleware untuk memeriksa peran pengguna
const checkRole = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Pengguna tidak terautentikasi'
        });
      }
      
      const userRole = req.user.role;
      
      // Jika tidak ada peran yang ditentukan atau pengguna memiliki peran yang diperlukan
      if (roles.length === 0 || roles.includes(userRole)) {
        return next();
      }
      
      return res.status(403).json({
        message: 'Anda tidak memiliki izin untuk mengakses resource ini'
      });
    } catch (error) {
      console.error('Error pada middleware pemeriksaan peran:', error);
      
      return res.status(500).json({
        message: 'Kesalahan server internal'
      });
    }
  };
};

module.exports = {
  verifyToken,
  checkRole
};
