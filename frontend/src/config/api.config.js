/**
 * API Configuration File
 * Manages all API endpoints and services configuration
 */

// User service running on port 5006
const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:5006';

// API Configuration object
const API_CONFIG = {
  auth: {
    register: `${USER_SERVICE_URL}/api/auth/register`,
    login: `${USER_SERVICE_URL}/api/auth/login`,
    logout: `${USER_SERVICE_URL}/api/auth/logout`,
    refresh: `${USER_SERVICE_URL}/api/auth/refresh`,
  },
  users: {
    base: `${USER_SERVICE_URL}/api/users`,
    profile: `${USER_SERVICE_URL}/api/users/profile`,
  },
};

export default API_CONFIG;
