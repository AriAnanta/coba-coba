/**
 * UI Routes
 * 
 * Web interface routes for Production Management Service
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ProductionRequest, ProductionBatch, ProductionStep, MaterialAllocation } = require('../models');

// Authentication middleware (defined in app.js)
const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    // Verify token with user service
    const response = await axios.post(`${process.env.USER_SERVICE_URL}/api/auth/verify`, { token });
    
    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.clearCookie('token');
      return res.redirect('/login');
    }
  } catch (error) {
    console.error('Error verifying token with user service:', error.message);
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

// Login page
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Production Management - Login',
    error: null 
  });
});

// Login handler - redirects to User Service for authentication
router.get('/auth/login', (req, res) => {
  res.redirect(`${process.env.USER_SERVICE_URL}/login?redirect=${process.env.SERVICE_URL}/auth/callback`);
});

// Auth callback handler
router.get('/auth/callback', (req, res) => {
  const token = req.query.token;
  
  if (token) {
    // Set token in cookie
    res.cookie('token', token, { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    return res.redirect('/dashboard');
  } else {
    return res.redirect('/login?error=Authentication failed');
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Dashboard page
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Get production requests
    const requests = await ProductionRequest.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Get production batches
    const batches = await ProductionBatch.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{
        model: ProductionRequest,
        as: 'request',
        attributes: ['requestId', 'productName', 'customerId']
      }]
    });
    
    // Get statistics
    const pendingRequests = await ProductionRequest.count({
      where: { status: 'received' }
    });
    
    const inProductionRequests = await ProductionRequest.count({
      where: { status: 'in_production' }
    });
    
    const completedRequests = await ProductionRequest.count({
      where: { status: 'completed' }
    });
    
    const pendingBatches = await ProductionBatch.count({
      where: { status: 'pending' }
    });
    
    const inProgressBatches = await ProductionBatch.count({
      where: { status: 'in_progress' }
    });
    
    const completedBatches = await ProductionBatch.count({
      where: { status: 'completed' }
    });
    
    res.render('dashboard', { 
      title: 'Production Management - Dashboard',
      user: req.user,
      requests,
      batches,
      stats: {
        pendingRequests,
        inProductionRequests,
        completedRequests,
        pendingBatches,
        inProgressBatches,
        completedBatches
      }
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load dashboard data',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Production requests list page
router.get('/production-requests', isAuthenticated, async (req, res) => {
  try {
    // Get production requests with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { count, rows: requests } = await ProductionRequest.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('production-requests', { 
      title: 'Production Requests',
      user: req.user,
      requests,
      pagination: {
        current: page,
        total: totalPages,
        limit
      }
    });
  } catch (error) {
    console.error('Error loading production requests:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load production requests',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Production request detail page
router.get('/production-requests/:id', isAuthenticated, async (req, res) => {
  try {
    const requestId = req.params.id;
    
    // Get production request with batches
    const request = await ProductionRequest.findByPk(requestId, {
      include: [{
        model: ProductionBatch,
        as: 'batches',
        include: [{
          model: ProductionStep,
          as: 'steps',
          order: [['stepOrder', 'ASC']]
        }]
      }]
    });
    
    if (!request) {
      return res.status(404).render('error', { 
        title: 'Not Found',
        message: 'Production request not found',
        error: {}
      });
    }
    
    res.render('request-detail', { 
      title: `Production Request ${request.requestId}`,
      user: req.user,
      request
    });
  } catch (error) {
    console.error('Error loading production request detail:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load production request details',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Production batches list page
router.get('/batches', isAuthenticated, async (req, res) => {
  try {
    // Get production batches with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    const { count, rows: batches } = await ProductionBatch.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      include: [{
        model: ProductionRequest,
        as: 'request',
        attributes: ['requestId', 'productName', 'customerId', 'priority']
      }]
    });
    
    const totalPages = Math.ceil(count / limit);
    
    res.render('batches', { 
      title: 'Production Batches',
      user: req.user,
      batches,
      pagination: {
        current: page,
        total: totalPages,
        limit
      }
    });
  } catch (error) {
    console.error('Error loading production batches:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load production batches',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// Production batch detail page
router.get('/batches/:id', isAuthenticated, async (req, res) => {
  try {
    const batchId = req.params.id;
    
    // Get production batch with details
    const batch = await ProductionBatch.findByPk(batchId, {
      include: [
        {
          model: ProductionRequest,
          as: 'request'
        },
        {
          model: ProductionStep,
          as: 'steps',
          order: [['stepOrder', 'ASC']]
        },
        {
          model: MaterialAllocation,
          as: 'materialAllocations'
        }
      ]
    });
    
    if (!batch) {
      return res.status(404).render('error', { 
        title: 'Not Found',
        message: 'Production batch not found',
        error: {}
      });
    }
    
    res.render('batch-detail', { 
      title: `Batch ${batch.batchNumber}`,
      user: req.user,
      batch
    });
  } catch (error) {
    console.error('Error loading batch detail:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load batch details',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// New production request form
router.get('/new-request', isAuthenticated, (req, res) => {
  res.render('new-request', { 
    title: 'Create Production Request',
    user: req.user
  });
});

// New production batch form
router.get('/new-batch', isAuthenticated, async (req, res) => {
  try {
    // Get all production requests for dropdown
    const requests = await ProductionRequest.findAll({
      where: { status: ['received', 'planned'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.render('new-batch', { 
      title: 'Create Production Batch',
      user: req.user,
      requests
    });
  } catch (error) {
    console.error('Error loading new batch form:', error);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Failed to load form data',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

module.exports = router;
