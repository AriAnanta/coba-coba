import axios from 'axios';

// Base URLs for each microservice
const BASE_URLS = {
  auth: 'http://localhost:3002/api',
  production: 'http://localhost:3003/api',
  machineQueue: 'http://localhost:5003/api',
  materialInventory: 'http://localhost:3004/api',
  productionFeedback: 'http://localhost:3005/api',
  machineQueueManagement: 'http://localhost:5001/api'
};

// Create axios instances for each service
const createApiInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// API instances
const authAPI = createApiInstance(BASE_URLS.auth);
const productionAPI = createApiInstance(BASE_URLS.production);
const machineQueueAPIInstance = createApiInstance(BASE_URLS.machineQueue);
const materialInventoryAPI = createApiInstance(BASE_URLS.materialInventory);
const productionFeedbackAPI = createApiInstance(BASE_URLS.productionFeedback);
const machineQueueManagementAPI = createApiInstance(BASE_URLS.machineQueueManagement);

// Auth API endpoints
export const authApiService = {
  login: (credentials) => authAPI.post('/auth/login', credentials),
  register: (userData) => authAPI.post('/auth/register', userData),
  logout: () => authAPI.post('/auth/logout'),
  verifyToken: () => authAPI.get('/auth/verify'),
  refreshToken: () => authAPI.post('/auth/refresh'),
  
  // User management
  getUsers: (params) => authAPI.get('/users', { params }),
  getUserById: (id) => authAPI.get(`/users/${id}`),
  updateUser: (id, data) => authAPI.put(`/users/${id}`, data),
  deleteUser: (id) => authAPI.delete(`/users/${id}`),
  createUser: (data) => authAPI.post('/users', data),
  
  // Profile management
  getProfile: () => authAPI.get('/auth/profile'),
  updateProfile: (data) => authAPI.put('/auth/profile', data),
  changePassword: (data) => authAPI.put('/auth/change-password', data),
};

// Production Management API endpoints
export const productionApiService = {
  // Production requests
  getProductionRequests: (params) => productionAPI.get('/production-requests', { params }),
  getProductionRequestById: (id) => productionAPI.get(`/production-requests/${id}`),
  createProductionRequest: (data) => productionAPI.post('/production-requests', data),
  updateProductionRequest: (id, data) => productionAPI.put(`/production-requests/${id}`, data),
  deleteProductionRequest: (id) => productionAPI.delete(`/production-requests/${id}`),
  approveProductionRequest: (id) => productionAPI.put(`/production-requests/${id}/approve`),
  rejectProductionRequest: (id, reason) => productionAPI.put(`/production-requests/${id}/reject`, { reason }),
  
  // Production batches
  getProductionBatches: (params) => productionAPI.get('/production-batches', { params }),
  getProductionBatchById: (id) => productionAPI.get(`/production-batches/${id}`),
  createProductionBatch: (data) => productionAPI.post('/production-batches', data),
  updateProductionBatch: (id, data) => productionAPI.put(`/production-batches/${id}`, data),
  deleteProductionBatch: (id) => productionAPI.delete(`/production-batches/${id}`),
  startProductionBatch: (id) => productionAPI.put(`/production-batches/${id}/start`),
  completeProductionBatch: (id) => productionAPI.put(`/production-batches/${id}/complete`),
  
  // Production steps
  getProductionSteps: (batchId) => productionAPI.get(`/production-batches/${batchId}/steps`),
  updateProductionStep: (batchId, stepId, data) => productionAPI.put(`/production-batches/${batchId}/steps/${stepId}`, data),
  
  // Reports
  getProductionReport: (params) => productionAPI.get('/reports/production', { params }),
  getEfficiencyReport: (params) => productionAPI.get('/reports/efficiency', { params }),
};

// Machine Queue API endpoints
export const machineQueueAPI = {
  // Machines
  getAllMachines: (params) => machineQueueAPIInstance.get('/machines', { params }),
  getMachineById: (id) => machineQueueAPIInstance.get(`/machines/${id}`),
  createMachine: (data) => machineQueueAPIInstance.post('/machines', data),
  updateMachine: (id, data) => machineQueueAPIInstance.put(`/machines/${id}`, data),
  deleteMachine: (id) => machineQueueAPIInstance.delete(`/machines/${id}`),
  getMachinesByType: (type) => machineQueueAPIInstance.get(`/machines/type/${type}`),
  getMachineTypes: () => machineQueueAPIInstance.get('/machine-types'),
  getMachinesForProduct: (params) => machineQueueAPIInstance.get('/machines-for-product', { params }),
  checkCapacity: (data) => machineQueueAPIInstance.post('/machines/check-capacity', data),
  
  // Queue management
  getAllQueues: (params) => machineQueueAPIInstance.get('/queues', { params }),
  getQueueById: (id) => machineQueueAPIInstance.get(`/queues/${id}`),
  addToQueue: (data) => machineQueueAPIInstance.post('/queues', data),
  updateQueue: (id, data) => machineQueueAPIInstance.put(`/queues/${id}`, data),
  removeFromQueue: (id) => machineQueueAPIInstance.delete(`/queues/${id}`),
  getMachineQueue: (machineId) => machineQueueAPIInstance.get(`/machines/${machineId}/queue`),
  getAvailableMachines: () => machineQueueAPIInstance.get('/machines/available'),
  
  // Queue operations
  startQueueItem: (id, data) => machineQueueAPIInstance.put(`/queues/${id}/start`, data),
  completeQueueItem: (id, data) => machineQueueAPIInstance.put(`/queues/${id}/complete`, data),
  cancelQueueItem: (id, reason) => machineQueueAPIInstance.put(`/queues/${id}/cancel`, { reason }),
  reorderQueue: (id, newPosition) => machineQueueAPIInstance.post(`/queues/${id}/reorder`, { newPosition }),
};

// Machine Queue Management API endpoints
export const machineQueueManagementApiService = {
  // Queue Management
  getAllQueues: () => machineQueueManagementAPI.get('/queue'),
  getQueueById: (id) => machineQueueManagementAPI.get(`/queue/${id}`),
  addToQueue: (data) => machineQueueManagementAPI.post('/queue', data),
  updateQueue: (id, data) => machineQueueManagementAPI.put(`/queue/${id}`, data),
  deleteQueue: (id) => machineQueueManagementAPI.delete(`/queue/${id}`),
  updateQueueStatus: (id, status) => machineQueueManagementAPI.patch(`/queue/${id}/status`, { status }),
  getMachineQueue: (machineId) => machineQueueManagementAPI.get(`/queue/machine/${machineId}`),

  // Machine Management
  getAllMachines: () => machineQueueManagementAPI.get('/machines'),
  getMachineById: (id) => machineQueueManagementAPI.get(`/machines/${id}`),
  createMachine: (data) => machineQueueManagementAPI.post('/machines', data),
  updateMachine: (id, data) => machineQueueManagementAPI.put(`/machines/${id}`, data),
  deleteMachine: (id) => machineQueueManagementAPI.delete(`/machines/${id}`),
  updateMachineStatus: (id, status) => machineQueueManagementAPI.patch(`/machines/${id}/status`, { status }),
};

// Material Inventory API endpoints
export const materialInventoryApiService = {
  // Materials
  getMaterials: (params) => materialInventoryAPI.get('/materials', { params }),
  getMaterialById: (id) => materialInventoryAPI.get(`/materials/${id}`),
  createMaterial: (data) => materialInventoryAPI.post('/materials', data),
  updateMaterial: (id, data) => materialInventoryAPI.put(`/materials/${id}`, data),
  deleteMaterial: (id) => materialInventoryAPI.delete(`/materials/${id}`),
  
  // Suppliers
  getSuppliers: (params) => materialInventoryAPI.get('/suppliers', { params }),
  getSupplierById: (id) => materialInventoryAPI.get(`/suppliers/${id}`),
  createSupplier: (data) => materialInventoryAPI.post('/suppliers', data),
  updateSupplier: (id, data) => materialInventoryAPI.put(`/suppliers/${id}`, data),
  deleteSupplier: (id) => materialInventoryAPI.delete(`/suppliers/${id}`),
  
  // Transactions
  getTransactions: (params) => materialInventoryAPI.get('/transactions', { params }),
  getTransactionById: (id) => materialInventoryAPI.get(`/transactions/${id}`),
  createTransaction: (data) => materialInventoryAPI.post('/transactions', data),
  updateTransaction: (id, data) => materialInventoryAPI.put(`/transactions/${id}`, data),
  
  // Stock operations
  addStock: (materialId, data) => materialInventoryAPI.post(`/materials/${materialId}/add-stock`, data),
  reduceStock: (materialId, data) => materialInventoryAPI.post(`/materials/${materialId}/reduce-stock`, data),
  checkStock: (materialId) => materialInventoryAPI.get(`/materials/${materialId}/stock`),
  
  // Reports
  getInventoryReport: (params) => materialInventoryAPI.get('/reports/inventory', { params }),
  getLowStockReport: () => materialInventoryAPI.get('/reports/low-stock'),
};

// Production Feedback API endpoints
export const productionFeedbackApiService = {
  // Feedback
  getFeedback: (params) => productionFeedbackAPI.get('/feedback', { params }),
  getFeedbackById: (id) => productionFeedbackAPI.get(`/feedback/${id}`),
  createFeedback: (data) => productionFeedbackAPI.post('/feedback', data),
  updateFeedback: (id, data) => productionFeedbackAPI.put(`/feedback/${id}`, data),
  deleteFeedback: (id) => productionFeedbackAPI.delete(`/feedback/${id}`),
  
  // Quality checks
  getQualityChecks: (params) => productionFeedbackAPI.get('/quality-checks', { params }),
  getQualityCheckById: (id) => productionFeedbackAPI.get(`/quality-checks/${id}`),
  createQualityCheck: (data) => productionFeedbackAPI.post('/quality-checks', data),
  updateQualityCheck: (id, data) => productionFeedbackAPI.put(`/quality-checks/${id}`, data),
  deleteQualityCheck: (id) => productionFeedbackAPI.delete(`/quality-checks/${id}`),
  
  // Reports
  getQualityReport: (params) => productionFeedbackAPI.get('/reports/quality', { params }),
  getPerformanceReport: (params) => productionFeedbackAPI.get('/reports/performance', { params }),
};


// Default export
export default {
  auth: authApiService,
  production: productionApiService,
  machineQueue: machineQueueAPI,
  materialInventory: materialInventoryApiService,
  productionFeedback: productionFeedbackApiService,
  machineQueueManagement: machineQueueManagementApiService,
};
