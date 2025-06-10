/**
 * UI Routes
 * 
 * Routes for web user interface
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../models');

// Middleware to check if user is authenticated for UI routes
const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/login');
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Login page
router.get('/login', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.render('login', { error: null });
});

// Handle login form submission
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.scope('withPassword').findOne({
      where: { username, isActive: true }
    });
    
    if (!user) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );
    
    // Update last login
    await user.update({ lastLogin: new Date() });
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production'
    });
    
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return res.render('login', { error: 'An error occurred' });
  }
});

// Register page
router.get('/register', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.render('register', { error: null });
});

// Dashboard - requires authentication
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.render('dashboard', { user: req.user });
});

// User profile page
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});

// User management page - Admin only
router.get('/admin/users', isAuthenticated, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.redirect('/dashboard');
  }
  
  try {
    const users = await User.findAll();
    res.render('admin/users', { users, user: req.user });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.render('admin/users', { users: [], user: req.user, error: 'Failed to fetch users' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Root path redirect to dashboard or login
router.get('/', (req, res) => {
  if (req.cookies.token) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

module.exports = router;
