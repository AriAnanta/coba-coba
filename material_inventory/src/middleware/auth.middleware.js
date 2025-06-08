/**
 * Middleware Autentikasi
 * 
 * Memverifikasi token JWT dan mengatur informasi pengguna
 */
const axios = require('axios');

/**
 * Middleware untuk memverifikasi token JWT melalui User Service
 */
const verifyToken = async (req, res, next) => {
  try {
    // Periksa header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }
    
    // Format token: Bearer [token]
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Format token tidak valid'
      });
    }
    
    try {
      // Verifikasi token melalui User Service
      const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/auth/verify`, { token });
      
      // Tambahkan informasi pengguna ke request
      req.user = response.data.user;
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau kedaluwarsa'
      });
    }
  } catch (error) {
    console.error('Error pada verifikasi token:', error);
    return res.status(500).json({
      success: false,
      message: 'Kesalahan server internal'
    });
  }
};

module.exports = {
  verifyToken
};
