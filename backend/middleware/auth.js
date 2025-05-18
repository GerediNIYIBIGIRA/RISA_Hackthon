// middleware/auth.js - Authentication middleware

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate user requests
 * Verifies JWT token and attaches user to request object
 */
exports.authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_jwt_key_change_in_production');
    
    // Find user by ID from token
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check if token is in user's tokens array
    if (!user.tokens.includes(token)) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Attach user to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check admin role
 * Must be used after authenticateUser middleware
 */
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

/**
 * Middleware to check data analyst role
 * Must be used after authenticateUser middleware
 */
exports.requireDataAnalyst = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'data_analyst')) {
    return res.status(403).json({ error: 'Access denied. Data analyst privileges required.' });
  }
  
  next();
};

/**
 * Middleware to check for dashboard access
 * Must be used after authenticateUser middleware
 */
exports.requireDashboardAccess = (req, res, next) => {
  if (!req.user || !req.user.permissions.includes('dashboard_access')) {
    return res.status(403).json({ error: 'Access denied. Dashboard access required.' });
  }
  
  next();
};

/**
 * Middleware to check for reports access
 * Must be used after authenticateUser middleware
 */
exports.requireReportsAccess = (req, res, next) => {
  if (!req.user || !req.user.permissions.includes('reports_access')) {
    return res.status(403).json({ error: 'Access denied. Reports access required.' });
  }
  
  next();
};

/**
 * Middleware to log user activity
 */
exports.logActivity = async (req, res, next) => {
  if (req.user) {
    const UserActivity = require('../models/UserActivity');
    
    try {
      await UserActivity.create({
        user: req.user._id,
        action: req.method,
        resource: req.originalUrl,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } catch (err) {
      console.error('Error logging user activity:', err);
      // Don't block the request if logging fails
    }
  }
  
  next();
};