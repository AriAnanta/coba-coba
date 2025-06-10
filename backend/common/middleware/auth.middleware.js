/**
 * Authentication Middleware
 *
 * Middleware for handling authentication and authorization across microservices
 */
const axios = require("axios");
require("dotenv").config();

/**
 * Middleware to verify authentication token
 * Extracts token from Authorization header or cookies
 */
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Tidak ada token yang disediakan." });
  }

  try {
    // Panggil user_service untuk memverifikasi token
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/users/verify-token`,
      { token }
    );

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      return res.status(403).json({ message: "Token tidak valid." });
    }
  } catch (error) {
    console.error("Verifikasi token gagal:", error.message);
    return res.status(500).json({ message: "Gagal mengautentikasi token." });
  }
};

/**
 * Middleware for role-based access control
 * @param {string|string[]} roles - Required role(s) for access
 */
const checkRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Peran tidak mencukupi." });
  }
  next();
};

module.exports = { verifyToken, checkRole };
