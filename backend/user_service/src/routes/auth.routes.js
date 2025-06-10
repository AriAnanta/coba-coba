/**
 * Authentication Routes
 * 
 * Routes for user authentication operations
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Login route
router.post('/login', authController.login);

// Register route
router.post('/register', authController.register);

// Logout route
router.post('/logout', authController.logout);

// Verify token route
router.post('/verify', authController.verifyToken);

module.exports = router;
