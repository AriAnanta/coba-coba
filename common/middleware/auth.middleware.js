/**
 * Authentication Middleware
 *
 * Middleware for handling authentication and authorization across microservices
 */
const { verifyTokenWithUserService } = require("../auth/auth");
const axios = require("axios");
require("dotenv").config();

/**
 * Middleware to verify authentication token
 * Extracts token from Authorization header or cookies
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Tidak ada token otentikasi yang diberikan" });
    }

    // Verify token with user service
    const response = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/auth/verify`,
      { token }
    );

    if (!response.data.valid) {
      return res
        .status(401)
        .json({ message: "Token tidak valid atau kedaluwarsa" });
    }

    // Attach user data to request
    req.user = response.data.user;
    next();
  } catch (error) {
    console.error("Kesalahan otentikasi:", error.message);
    return res.status(401).json({ message: "Otentikasi gagal" });
  }
};

/**
 * Middleware for role-based access control
 * @param {string|string[]} roles - Required role(s) for access
 */
const roleRequired = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Allow if user has any of the required roles
    const roleArray = Array.isArray(roles) ? roles : [roles];

    if (roleArray.includes(req.user.role)) {
      return next();
    }

    return res
      .status(403)
      .json({ message: "Access denied: insufficient permissions" });
  };
};

module.exports = {
  verifyToken,
  roleRequired,
};
