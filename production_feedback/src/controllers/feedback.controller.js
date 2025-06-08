/**
 * Feedback Controller
 * Handles production feedback, notifications, and customer communication
 */

/**
 * Controller Feedback untuk Production Feedback Service
 * 
 * Mengelola logika bisnis untuk feedback produksi
 */
const { Op, sequelize } = require('sequelize');
const { 
  ProductionFeedback, 
  ProductionStep, 
  QualityCheck, 
  FeedbackImage,
  FeedbackComment,
  FeedbackNotification
} = require('../models');
const axios = require('axios');
require('dotenv').config();

// Mock data for demonstration (replace with actual database models)
let statusUpdates = [];
let notifications = [];
let issues = [];
let progressTracking = [];
let nextStatusId = 1;
let nextNotificationId = 1;
let nextIssueId = 1;

// Membuat ID unik dengan format khusus
const generateUniqueId = (prefix, length = 8) => {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 2 + length);
  return `${prefix}-${timestamp}-${random}`;
};

// Fungsi untuk mengirim notifikasi
const createNotification = async (feedbackId, type, title, message, recipientType, recipientId, priority = 'medium') => {
  try {
    return await FeedbackNotification.create({
      notificationId: generateUniqueId('NOTIF'),
      feedbackId,
      type,
      title,
      message,
      recipientType,
      recipientId,
      priority,
      deliveryMethod: 'in_app'
    });
  } catch (error) {
    console.error('Error membuat notifikasi:', error);
    // Kita hanya log error tanpa mengganggu flow utama aplikasi
  }
};

// Fungsi untuk meng-update status ke marketplace
const updateMarketplace = async (feedback) => {
  try {
    // Hanya kirim update jika sudah ada batchId dan status feedback sudah bukan 'pending'
    if (!feedback.batchId || feedback.status === 'pending') {
      return {
        success: false,
        message: 'Belum dapat mengirim update ke marketplace'
      };
    }

    // Menyiapkan data untuk dikirim ke marketplace
    const marketplaceData = {
      production_id: feedback.productionId,
      batch_id: feedback.batchId,
      product_id: feedback.productId,
      status: feedback.status,
      completion_percentage: feedback.completionPercentage,
      quantity_produced: feedback.quantityProduced,
      quantity_rejected: feedback.quantityRejected,
      estimated_completion: feedback.endDate,
      notes: feedback.customerNotes || feedback.notes
    };

    // Mengirim data ke marketplace API
    const response = await axios.post(
      `${process.env.MARKETPLACE_API_URL}/production/update`,
      marketplaceData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MARKETPLACE_API_KEY}`
        }
      }
    );

    // Update status marketplace di database
    await ProductionFeedback.update(
      {
        marketplaceUpdateStatus: 'sent',
        marketplaceLastUpdate: new Date()
      },
      { where: { id: feedback.id } }
    );

    return {
      success: true,
      message: 'Berhasil mengirim update ke marketplace',
      data: response.data
    };
  } catch (error) {
    console.error('Error mengupdate marketplace:', error);
    
    // Update status marketplace di database sebagai failed
    await ProductionFeedback.update(
      {
        marketplaceUpdateStatus: 'failed',
        marketplaceLastUpdate: new Date()
      },
      { where: { id: feedback.id } }
    );
    
    return {
      success: false,
      message: `Gagal mengirim update ke marketplace: ${error.message}`,
      error: error.response ? error.response.data : error.message
    };
  }
};

// Helper functions
function calculateProgressPercentage(statusHistory) {
  const statusWeights = {
    'pending': 0,
    'planned': 20,
    'in_production': 50,
    'completed': 100,
    'cancelled': 0
  };
  
  if (statusHistory.length === 0) return 0;
  
  const latestStatus = statusHistory[statusHistory.length - 1].status;
  return statusWeights[latestStatus] || 0;
}

function calculateEstimatedCompletion(statusHistory) {
  // Simple estimation based on progress (would be more sophisticated in real implementation)
  if (statusHistory.length === 0) return null;
  
  const latestStatus = statusHistory[statusHistory.length - 1].status;
  if (latestStatus === 'completed') return 'Completed';
  
  // Mock estimation
  const now = new Date();
  const estimatedDate = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // +24 hours
  return estimatedDate.toISOString();
}

function calculateAverageResolutionTime(issues) {
  const resolvedIssues = issues.filter(i => i.status === 'resolved' && i.resolvedAt);
  
  if (resolvedIssues.length === 0) return 0;
  
  const totalTime = resolvedIssues.reduce((acc, issue) => {
    const resolutionTime = new Date(issue.resolvedAt) - new Date(issue.createdAt);
    return acc + resolutionTime;
  }, 0);
  
  return Math.round(totalTime / resolvedIssues.length / (1000 * 60 * 60)); // hours
}

// Status update controller
const feedbackStatusController = {
  // Receive status update from other services
  receiveStatusUpdate: async (req, res) => {
    try {
      const { requestId, status, notes, timestamp, source } = req.body;
      
      const statusUpdate = {
        id: nextStatusId++,
        requestId,
        status,
        notes,
        timestamp: timestamp || new Date(),
        source: source || 'unknown',
        createdAt: new Date()
      };
      
      statusUpdates.push(statusUpdate);
      
      // Create notification for customer
      const notification = {
        id: nextNotificationId++,
        type: 'status_update',
        title: `Production Status Update - Request ${requestId}`,
        message: `Production status changed to: ${status}. ${notes || ''}`,
        requestId,
        status,
        priority: status === 'completed' ? 'high' : 'medium',
        isRead: false,
        createdAt: new Date()
      };
      
      notifications.push(notification);
      
      console.log(`📢 Status update received for request ${requestId}: ${status}`);
      
      res.status(200).json({
        success: true,
        message: 'Status update received successfully',
        data: statusUpdate
      });
    } catch (error) {
      console.error('Error receiving status update:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get status history for a request
  getStatusHistory: async (req, res) => {
    try {
      const requestId = req.params.requestId;
      const history = statusUpdates.filter(update => update.requestId === requestId);
      
      res.status(200).json({
        success: true,
        data: history,
        requestId,
        total: history.length
      });
    } catch (error) {
      console.error('Error fetching status history:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get production progress
  getProductionProgress: async (req, res) => {
    try {
      const requestId = req.params.requestId;
      
      // Calculate progress based on status updates
      const requestStatusHistory = statusUpdates.filter(update => update.requestId === requestId);
      
      const progressData = {
        requestId,
        currentStatus: requestStatusHistory.length > 0 ? requestStatusHistory[requestStatusHistory.length - 1].status : 'unknown',
        progressPercentage: calculateProgressPercentage(requestStatusHistory),
        milestones: requestStatusHistory.map(update => ({
          status: update.status,
          timestamp: update.timestamp,
          notes: update.notes
        })),
        estimatedCompletion: calculateEstimatedCompletion(requestStatusHistory),
        lastUpdated: requestStatusHistory.length > 0 ? requestStatusHistory[requestStatusHistory.length - 1].timestamp : null
      };
      
      res.status(200).json({
        success: true,
        data: progressData
      });
    } catch (error) {
      console.error('Error fetching production progress:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Update progress
  updateProgress: async (req, res) => {
    try {
      const { requestId, batchId, stepId, progressPercentage, notes } = req.body;
      
      const progressUpdate = {
        requestId,
        batchId,
        stepId,
        progressPercentage,
        notes,
        timestamp: new Date()
      };
      
      progressTracking.push(progressUpdate);
      
      res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: progressUpdate
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get status summary report
  getStatusSummary: async (req, res) => {
    try {
      const statusCounts = statusUpdates.reduce((acc, update) => {
        acc[update.status] = (acc[update.status] || 0) + 1;
        return acc;
      }, {});
      
      const summary = {
        totalUpdates: statusUpdates.length,
        statusBreakdown: statusCounts,
        activeRequests: new Set(statusUpdates.map(u => u.requestId)).size,
        issueCount: issues.length,
        openIssues: issues.filter(i => i.status === 'open').length
      };
      
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error generating status summary:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get completion time report
  getCompletionTimeReport: async (req, res) => {
    try {
      // Group status updates by request and calculate completion times
      const requestGroups = statusUpdates.reduce((acc, update) => {
        if (!acc[update.requestId]) {
          acc[update.requestId] = [];
        }
        acc[update.requestId].push(update);
        return acc;
      }, {});
      
      const completionData = Object.entries(requestGroups).map(([requestId, updates]) => {
        const sortedUpdates = updates.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const startTime = sortedUpdates[0]?.timestamp;
        const completedUpdate = sortedUpdates.find(u => u.status === 'completed');
        
        return {
          requestId,
          startTime,
          completionTime: completedUpdate?.timestamp || null,
          duration: completedUpdate ? 
            Math.round((new Date(completedUpdate.timestamp) - new Date(startTime)) / (1000 * 60 * 60)) : null, // hours
          status: sortedUpdates[sortedUpdates.length - 1]?.status
        };
      });
      
      res.status(200).json({
        success: true,
        data: completionData,
        total: completionData.length
      });
    } catch (error) {
      console.error('Error generating completion time report:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get customer updates
  getCustomerUpdates: async (req, res) => {
    try {
      const customerId = req.params.customerId;
      
      const customerUpdates = statusUpdates.filter(update => {
        // In real implementation, you'd join with customer data
        return update.customerId === customerId;
      });
      
      res.status(200).json({
        success: true,
        data: customerUpdates,
        customerId,
        total: customerUpdates.length
      });
    } catch (error) {
      console.error('Error fetching customer updates:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
};

// Notification controller
const notificationController = {
  // Get all notifications
  getAllNotifications: async (req, res) => {
    try {
      const { status, priority, limit = 50 } = req.query;
      
      let filteredNotifications = notifications;
      
      if (status) {
        filteredNotifications = filteredNotifications.filter(n => n.status === status);
      }
      
      if (priority) {
        filteredNotifications = filteredNotifications.filter(n => n.priority === priority);
      }
      
      // Sort by creation date (newest first)
      filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Limit results
      const limitedNotifications = filteredNotifications.slice(0, parseInt(limit));
      
      res.status(200).json({
        success: true,
        data: limitedNotifications,
        total: filteredNotifications.length,
        showing: limitedNotifications.length
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get notifications for specific customer
  getCustomerNotifications: async (req, res) => {
    try {
      const customerId = req.params.customerId;
      
      // Filter notifications for this customer (would need customer mapping in real implementation)
      const customerNotifications = notifications.filter(n => n.customerId === customerId);
      
      res.status(200).json({
        success: true,
        data: customerNotifications,
        customerId,
        total: customerNotifications.length
      });
    } catch (error) {
      console.error('Error fetching customer notifications:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Send notification
  sendNotification: async (req, res) => {
    try {
      const { 
        type, 
        title, 
        message, 
        requestId, 
        customerId, 
        priority = 'medium' 
      } = req.body;
      
      const notification = {
        id: nextNotificationId++,
        type,
        title,
        message,
        requestId,
        customerId,
        priority,
        isRead: false,
        sentAt: new Date(),
        createdAt: new Date()
      };
      
      notifications.push(notification);
      
      console.log(`📧 Notification sent: ${title}`);
      
      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: notification
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (req, res) => {
    try {
      const notification = notifications.find(n => n.id === parseInt(req.params.id));
      
      if (!notification) {
        return res.status(404).json({ 
          success: false, 
          message: 'Notification not found' 
        });
      }
      
      notification.isRead = true;
      notification.readAt = new Date();
      
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Notify customer
  notifyCustomer: async (req, res) => {
    try {
      const { customerId, requestId, message, type = 'update' } = req.body;
      
      const notification = {
        id: nextNotificationId++,
        type: 'customer_notification',
        customerId,
        requestId,
        message,
        notificationType: type,
        sentAt: new Date(),
        createdAt: new Date()
      };
      
      notifications.push(notification);
      
      console.log(`📱 Customer ${customerId} notified about request ${requestId}`);
      
      res.status(200).json({
        success: true,
        message: 'Customer notified successfully',
        data: notification
      });
    } catch (error) {
      console.error('Error notifying customer:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
};

// Issue controller
const issueController = {
  // Report an issue
  reportIssue: async (req, res) => {
    try {
      const { 
        requestId, 
        batchId, 
        issueType, 
        severity, 
        description, 
        reportedBy 
      } = req.body;
      
      const issue = {
        id: nextIssueId++,
        requestId,
        batchId,
        issueType,
        severity: severity || 'medium',
        description,
        reportedBy,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      issues.push(issue);
      
      // Create high-priority notification for issues
      const notification = {
        id: nextNotificationId++,
        type: 'issue',
        title: `Production Issue Reported - ${issueType}`,
        message: `Severity: ${severity}. ${description}`,
        requestId,
        priority: severity === 'critical' ? 'high' : 'medium',
        isRead: false,
        createdAt: new Date()
      };
      
      notifications.push(notification);
      
      console.log(`⚠️  Issue reported for request ${requestId}: ${issueType}`);
      
      res.status(201).json({
        success: true,
        message: 'Issue reported successfully',
        data: issue
      });
    } catch (error) {
      console.error('Error reporting issue:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get all issues
  getAllIssues: async (req, res) => {
    try {
      const { status, severity, requestId } = req.query;
      
      let filteredIssues = issues;
      
      if (status) {
        filteredIssues = filteredIssues.filter(i => i.status === status);
      }
      
      if (severity) {
        filteredIssues = filteredIssues.filter(i => i.severity === severity);
      }
      
      if (requestId) {
        filteredIssues = filteredIssues.filter(i => i.requestId === requestId);
      }
      
      res.status(200).json({
        success: true,
        data: filteredIssues,
        total: filteredIssues.length
      });
    } catch (error) {
      console.error('Error fetching issues:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get issue by ID
  getIssueById: async (req, res) => {
    try {
      const issue = issues.find(i => i.id === parseInt(req.params.issueId));
      
      if (!issue) {
        return res.status(404).json({ 
          success: false, 
          message: 'Issue not found' 
        });
      }
      
      res.status(200).json({
        success: true,
        data: issue
      });
    } catch (error) {
      console.error('Error fetching issue:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Update issue
  updateIssue: async (req, res) => {
    try {
      const issue = issues.find(i => i.id === parseInt(req.params.issueId));
      
      if (!issue) {
        return res.status(404).json({ 
          success: false, 
          message: 'Issue not found' 
        });
      }
      
      Object.assign(issue, req.body, { updatedAt: new Date() });
      
      res.status(200).json({
        success: true,
        message: 'Issue updated successfully',
        data: issue
      });
    } catch (error) {
      console.error('Error updating issue:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  // Get issue analytics
  getIssueAnalytics: async (req, res) => {
    try {
      const analytics = {
        totalIssues: issues.length,
        issuesBySeverity: issues.reduce((acc, issue) => {
          acc[issue.severity] = (acc[issue.severity] || 0) + 1;
          return acc;
        }, {}),
        issuesByType: issues.reduce((acc, issue) => {
          acc[issue.issueType] = (acc[issue.issueType] || 0) + 1;
          return acc;
        }, {}),
        issuesByStatus: issues.reduce((acc, issue) => {
          acc[issue.status] = (acc[issue.status] || 0) + 1;
          return acc;
        }, {}),
        averageResolutionTime: calculateAverageResolutionTime(issues)
      };
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error generating issue analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
};

// CRUD controller for feedback
const feedbackCrudController = {
  // Mendapatkan semua feedback produksi
  getAllFeedback: async (req, res) => {
    try {
      const { 
        status, 
        startDate, 
        endDate, 
        productId, 
        batchId,
        search,
        page = 1,
        limit = 10
      } = req.query;
      
      const where = {};
      
      // Filter berdasarkan status
      if (status) {
        where.status = status;
      }
      
      // Filter berdasarkan tanggal
      if (startDate || endDate) {
        where.createdAt = {};
        
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        
        if (endDate) {
          const endDateTime = new Date(endDate);
          endDateTime.setHours(23, 59, 59, 999);
          where.createdAt[Op.lte] = endDateTime;
        }
      }
      
      // Filter berdasarkan productId
      if (productId) {
        where.productId = productId;
      }
      
      // Filter berdasarkan batchId
      if (batchId) {
        where.batchId = batchId;
      }
      
      // Filter berdasarkan pencarian
      if (search) {
        where[Op.or] = [
          { feedbackId: { [Op.like]: `%${search}%` } },
          { productionId: { [Op.like]: `%${search}%` } },
          { batchId: { [Op.like]: `%${search}%` } },
          { productId: { [Op.like]: `%${search}%` } },
          { productName: { [Op.like]: `%${search}%` } }
        ];
      }
      
      // Hitung jumlah total data
      const totalItems = await ProductionFeedback.count({ where });
      
      // Hitung offset untuk pagination
      const offset = (page - 1) * limit;
      
      // Ambil data dengan pagination
      const feedbacks = await ProductionFeedback.findAll({
        where,
        include: [
          {
            model: ProductionStep,
            as: 'productionSteps',
            attributes: ['id', 'stepId', 'stepName', 'status', 'startTime', 'endTime']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        success: true,
        data: feedbacks,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error mengambil data feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data feedback',
        error: error.message
      });
    }
  },
  
  // Mendapatkan feedback berdasarkan ID
  getFeedbackById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const feedback = await ProductionFeedback.findByPk(id, {
        include: [
          {
            model: ProductionStep,
            as: 'productionSteps',
            include: [
              {
                model: QualityCheck,
                as: 'qualityChecks'
              }
            ]
          },
          {
            model: QualityCheck,
            as: 'qualityChecks'
          },
          {
            model: FeedbackImage,
            as: 'images'
          },
          {
            model: FeedbackComment,
            as: 'comments',
            where: { isDeleted: false },
            required: false,
            order: [['createdAt', 'DESC']]
          }
        ]
      });
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error mengambil detail feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail feedback',
        error: error.message
      });
    }
  },
  
  // Mendapatkan feedback berdasarkan feedbackId
  getFeedbackByFeedbackId: async (req, res) => {
    try {
      const { feedbackId } = req.params;
      
      const feedback = await ProductionFeedback.findOne({
        where: { feedbackId },
        include: [
          {
            model: ProductionStep,
            as: 'productionSteps',
            include: [
              {
                model: QualityCheck,
                as: 'qualityChecks'
              }
            ]
          },
          {
            model: QualityCheck,
            as: 'qualityChecks'
          },
          {
            model: FeedbackImage,
            as: 'images'
          },
          {
            model: FeedbackComment,
            as: 'comments',
            where: { isDeleted: false },
            required: false,
            order: [['createdAt', 'DESC']]
          }
        ]
      });
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error mengambil detail feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail feedback',
        error: error.message
      });
    }
  },
  
  // Mendapatkan feedback berdasarkan productionId
  getFeedbackByProductionId: async (req, res) => {
    try {
      const { productionId } = req.params;
      
      const feedback = await ProductionFeedback.findOne({
        where: { productionId },
        include: [
          {
            model: ProductionStep,
            as: 'productionSteps'
          }
        ]
      });
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error mengambil feedback berdasarkan productionId:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil feedback',
        error: error.message
      });
    }
  },
  
  // Mendapatkan feedback berdasarkan batchId
  getFeedbackByBatchId: async (req, res) => {
    try {
      const { batchId } = req.params;
      
      const feedback = await ProductionFeedback.findOne({
        where: { batchId },
        include: [
          {
            model: ProductionStep,
            as: 'productionSteps'
          }
        ]
      });
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Error mengambil feedback berdasarkan batchId:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil feedback',
        error: error.message
      });
    }
  },
  
  // Membuat feedback produksi baru
  createFeedback: async (req, res) => {
    try {
      const {
        productionId,
        batchId,
        productId,
        productName,
        quantityOrdered,
        startDate,
        notes
      } = req.body;
      
      // Validasi input
      if (!productionId || !batchId || !productId || !productName || !quantityOrdered) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. Harap isi semua field yang diperlukan'
        });
      }
      
      // Cek apakah feedback dengan productionId sudah ada
      const existingFeedback = await ProductionFeedback.findOne({
        where: { productionId }
      });
      
      if (existingFeedback) {
        return res.status(409).json({
          success: false,
          message: 'Feedback untuk produksi ini sudah ada',
          data: {
            existingFeedbackId: existingFeedback.feedbackId
          }
        });
      }
      
      // Buat feedback baru
      const feedback = await ProductionFeedback.create({
        feedbackId: generateUniqueId('FB'),
        productionId,
        batchId,
        productId,
        productName,
        status: 'pending',
        startDate: startDate || new Date(),
        quantityOrdered,
        completionPercentage: 0,
        notes,
        createdBy: req.user ? req.user.username : null
      });
      
      // Buat notifikasi untuk feedback baru
      await createNotification(
        feedback.id,
        'status_update',
        'Feedback Produksi Baru',
        `Feedback produksi baru telah dibuat untuk ${productName} (Batch: ${batchId})`,
        'role',
        'production_manager',
        'medium'
      );
      
      return res.status(201).json({
        success: true,
        message: 'Feedback produksi berhasil dibuat',
        data: feedback
      });
    } catch (error) {
      console.error('Error membuat feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat feedback produksi',
        error: error.message
      });
    }
  },
  
  // Mengupdate feedback produksi
  updateFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        status,
        endDate,
        quantityProduced,
        quantityRejected,
        completionPercentage,
        qualityScore,
        notes,
        customerNotes
      } = req.body;
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(id);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Hitung persentase penyelesaian jika tidak disediakan
      let calculatedCompletionPercentage = completionPercentage;
      if (quantityProduced !== undefined && !completionPercentage) {
        calculatedCompletionPercentage = Math.min(
          100,
          Math.round((quantityProduced / feedback.quantityOrdered) + 100)
        );
      }
      
      // Persiapkan data untuk update
      const updateData = {
        ...(status && { status }),
        ...(endDate && { endDate }),
        ...(quantityProduced !== undefined && { quantityProduced }),
        ...(quantityRejected !== undefined && { quantityRejected }),
        ...(calculatedCompletionPercentage !== undefined && { completionPercentage: calculatedCompletionPercentage }),
        ...(qualityScore !== undefined && { qualityScore }),
        ...(notes && { notes }),
        ...(customerNotes && { customerNotes }),
        updatedBy: req.user ? req.user.username : null
      };
      
      // Jika status berubah menjadi completed dan tidak ada endDate, tambahkan endDate sekarang
      if (status === 'completed' && !endDate && !feedback.endDate) {
        updateData.endDate = new Date();
      }
      
      // Update feedback
      await ProductionFeedback.update(updateData, {
        where: { id }
      });
      
      // Ambil data feedback yang sudah diupdate
      const updatedFeedback = await ProductionFeedback.findByPk(id);
      
      // Jika status berubah, buat notifikasi
      if (status && status !== feedback.status) {
        const statusMessages = {
          in_progress: 'Produksi telah dimulai',
          completed: 'Produksi telah selesai',
          failed: 'Produksi mengalami kegagalan',
          cancelled: 'Produksi telah dibatalkan'
        };
        
        await createNotification(
          feedback.id,
          'status_update',
          `Status Produksi: ${status.toUpperCase()}`,
          statusMessages[status] || `Status produksi telah berubah menjadi ${status}`,
          'role',
          'production_manager',
          status === 'failed' ? 'high' : 'medium'
        );
      }
      
      // Jika status 'completed', 'failed', atau 'cancelled', kirim update ke marketplace
      if (['completed', 'failed', 'cancelled'].includes(updatedFeedback.status)) {
        const marketplaceUpdateResult = await updateMarketplace(updatedFeedback);
        
        // Tambahkan hasil update marketplace ke respons
        return res.status(200).json({
          success: true,
          message: 'Feedback produksi berhasil diperbarui',
          data: updatedFeedback,
          marketplaceUpdate: marketplaceUpdateResult
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Feedback produksi berhasil diperbarui',
        data: updatedFeedback
      });
    } catch (error) {
      console.error('Error mengupdate feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui feedback produksi',
        error: error.message
      });
    }
  },
  
  // Menghapus feedback produksi (soft delete)
  deleteFeedback: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(id);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Hapus feedback (implementasi soft delete karena feedback seharusnya hanya dihapus dalam kasus tertentu)
      await ProductionFeedback.update(
        {
          status: 'cancelled',
          notes: `${feedback.notes || ''}\nDihapus pada ${new Date().toISOString()} oleh ${req.user ? req.user.username : 'sistem'}`
        },
        { where: { id } }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Feedback produksi berhasil dihapus (soft delete)'
      });
    } catch (error) {
      console.error('Error menghapus feedback:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus feedback produksi',
        error: error.message
      });
    }
  },
  
  // Mengirim update status ke marketplace
  sendMarketplaceUpdate: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Cek apakah feedback ada
      const feedback = await ProductionFeedback.findByPk(id);
      
      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback tidak ditemukan'
        });
      }
      
      // Kirim update ke marketplace
      const result = await updateMarketplace(feedback);
      
      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'Gagal mengirim update ke marketplace',
          error: result.message,
          details: result.error
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Update berhasil dikirim ke marketplace',
        data: result.data
      });
    } catch (error) {
      console.error('Error mengirim update marketplace:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengirim update ke marketplace',
        error: error.message
      });
    }
  },
  
  // Mendapatkan ringkasan status produksi
  getProductionSummary: async (req, res) => {
    try {
      // Hitung jumlah feedback per status
      const statusCounts = await ProductionFeedback.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });
      
      // Hitung total feedback
      const totalFeedbacks = await ProductionFeedback.count();
      
      // Hitung produksi selesai dalam 30 hari terakhir
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const completedRecently = await ProductionFeedback.count({
        where: {
          status: 'completed',
          endDate: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });
      
      // Hitung total kuantitas yang dipesan dan diproduksi
      const quantities = await ProductionFeedback.findAll({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('quantityOrdered')), 'totalOrdered'],
          [sequelize.fn('SUM', sequelize.col('quantityProduced')), 'totalProduced'],
          [sequelize.fn('SUM', sequelize.col('quantityRejected')), 'totalRejected']
        ]
      });
      
      // Hitung persentase penyelesaian rata-rata
      const avgCompletion = await ProductionFeedback.findAll({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('completionPercentage')), 'avgCompletion']
        ],
        where: {
          status: {
            [Op.ne]: 'cancelled'
          }
        }
      });
      
      // Format data ringkasan
      const summary = {
        totalFeedbacks,
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item.status] = parseInt(item.get('count'));
          return acc;
        }, {}),
        completedRecently,
        quantities: {
          totalOrdered: parseInt(quantities[0].get('totalOrdered') || 0),
          totalProduced: parseInt(quantities[0].get('totalProduced') || 0),
          totalRejected: parseInt(quantities[0].get('totalRejected') || 0)
        },
        avgCompletion: parseFloat(avgCompletion[0].get('avgCompletion') || 0).toFixed(2)
      };
      
      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error mendapatkan ringkasan produksi:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mendapatkan ringkasan produksi',
        error: error.message
      });
    }
  },

  // Mendapatkan status update marketplace untuk feedback tertentu
  getMarketplaceStatus: async (req, res) => {
    try {
      const { id } = req.params; // Ini adalah ID dari tabel ProductionFeedback, bukan feedbackId
      const feedback = await ProductionFeedback.findByPk(id, {
        attributes: ['productionId', 'feedbackId', 'marketplaceUpdateStatus', 'marketplaceLastUpdate']
      });

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback tidak ditemukan' });
      }

      res.status(200).json({
        message: `Status marketplace untuk feedback ID ${feedback.feedbackId} (internal ID: ${id}) berhasil diambil`,
        productionId: feedback.productionId,
        feedbackId: feedback.feedbackId,
        status: feedback.marketplaceUpdateStatus,
        lastUpdate: feedback.marketplaceLastUpdate
      });
    } catch (error) {
      console.error('Error mendapatkan status marketplace:', error);
      res.status(500).json({ message: 'Gagal mendapatkan status marketplace', error: error.message });
    }
  }
}; // Penutup untuk feedbackCrudController

// Combine all controllers into a single export
module.exports = {
  ...feedbackStatusController,
  ...notificationController,
  ...issueController,
  ...feedbackCrudController
};

