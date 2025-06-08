/**
 * Authentication Middleware
 * 
 * Middleware for handling authentication and authorization across microservices
 */
const { verifyTokenWithUserService } = require('../auth/auth');

/**
 * Middleware to verify authentication token
 * Extracts token from Authorization header or cookies
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }
    
    // Verify token with user service
    const result = await verifyTokenWithUserService(token);
    
    if (!result.valid) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Attach user data to request
    req.user = result.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Middleware for role-based access control
 * @param {string|string[]} roles - Required role(s) for access
 */
const roleRequired = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Allow if user has any of the required roles
    const roleArray = Array.isArray(roles) ? roles : [roles];
    
    if (roleArray.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  };
};

module.exports = {
  verifyToken,
  roleRequired
};
