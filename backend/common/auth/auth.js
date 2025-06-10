/**
 * Common Authentication Utilities
 * 
 * Shared authentication utilities used across all microservices
 */
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');

// Environment configuration
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const SALT_ROUNDS = 10;

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if match, false otherwise
 */
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token
 * @param {Object} user - User object containing id, username, and role
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Validate a JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const validateToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify token with User Service
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - User information if valid
 */
const verifyTokenWithUserService = async (token) => {
  try {
    const response = await axios.post(`${USER_SERVICE_URL}/api/auth/verify`, { token });
    return response.data;
  } catch (error) {
    throw new Error('Failed to verify token with user service');
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  validateToken,
  verifyTokenWithUserService
};
