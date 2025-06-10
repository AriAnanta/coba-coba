/**
 * Middleware Autentikasi
 * 
 * Memverifikasi token JWT dan role pengguna melalui User Service
 */
const axios = require('axios');

/**
 * Middleware untuk memverifikasi token JWT
 */
module.exports = async (req, res, next) => {
  try {
    // Dapatkan token dari header atau query parameter atau cookie
    const token = req.headers.authorization?.split(' ')[1] || 
                  req.query.token || 
                  req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ message: 'Tidak ada token yang diberikan' });
    }
    
    try {
      // Verifikasi token melalui User Service
      const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/auth/verify`, { token });
      
      // Tetapkan data pengguna ke objek request
      req.user = response.data.user;
      
      next();
    } catch (error) {
      console.error('Token tidak valid:', error.message);
      return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
    }
  } catch (error) {
    console.error('Error pada middleware autentikasi:', error);
    return res.status(500).json({ message: 'Kesalahan server internal' });
  }
};
