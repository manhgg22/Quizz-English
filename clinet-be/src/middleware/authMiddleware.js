const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as needed
require('dotenv').config();

/**
 * Authentication middleware factory
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAdmin - Require admin role
 * @param {boolean} options.optional - Make authentication optional
 * @param {Array} options.roles - Array of allowed roles
 * @param {boolean} options.checkUser - Check if user exists in database
 * @returns {Function} Express middleware function
 */
const authMiddleware = (options = {}) => {
  const {
    requireAdmin = false,
    optional = false,
    roles = [],
    checkUser = false
  } = options;

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      // If no token and optional auth, continue without user
      if ((!authHeader || !authHeader.startsWith('Bearer ')) && optional) {
        req.user = null;
        return next();
      }

      // If no token and required auth, return error
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token xác thực không được cung cấp',
          code: 'NO_TOKEN'
        });
      }

      const token = authHeader.split(' ')[1];

      // Verify JWT token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        let message = 'Token không hợp lệ';
        let code = 'INVALID_TOKEN';

        if (jwtError.name === 'TokenExpiredError') {
          message = 'Token đã hết hạn';
          code = 'TOKEN_EXPIRED';
        } else if (jwtError.name === 'JsonWebTokenError') {
          message = 'Token không đúng định dạng';
          code = 'MALFORMED_TOKEN';
        }

        return res.status(401).json({
          success: false,
          message,
          code
        });
      }

      // Validate token payload
      if (!decoded.userId) {
        return res.status(401).json({
          success: false,
          message: 'Token thiếu thông tin người dùng',
          code: 'INVALID_PAYLOAD'
        });
      }

      // Check if user exists in database (optional)
      let user = null;
      if (checkUser) {
        try {
          user = await User.findById(decoded.userId).select('-password');
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'Người dùng không tồn tại',
              code: 'USER_NOT_FOUND'
            });
          }

          // Check if user account is active
          if (user.status === 'inactive' || user.status === 'banned') {
            return res.status(403).json({
              success: false,
              message: 'Tài khoản đã bị vô hiệu hóa',
              code: 'ACCOUNT_INACTIVE'
            });
          }
        } catch (dbError) {
          console.error('Database error in auth middleware:', dbError);
          return res.status(500).json({
            success: false,
            message: 'Lỗi hệ thống khi xác thực',
            code: 'DATABASE_ERROR'
          });
        }
      }

      // Check admin requirement
      if (requireAdmin && decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ admin mới có quyền truy cập',
          code: 'ADMIN_REQUIRED'
        });
      }

      // Check specific roles
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập',
          code: 'INSUFFICIENT_ROLE'
        });
      }

      // Attach user info to request
      req.user = {
        id: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        ...(user && { userData: user }) // Include full user data if fetched
      };

      // Log authentication for debugging (optional)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUTH] User ${decoded.userId} authenticated with role: ${decoded.role}`);
      }

      next();

    } catch (error) {
      console.error('Unexpected error in auth middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống trong quá trình xác thực',
        code: 'SYSTEM_ERROR'
      });
    }
  };
};

// Token validation utility function
const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Extract user ID from token without full validation
const extractUserId = (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.decode(token); // Decode without verification
    return decoded?.userId || null;
  } catch (error) {
    return null;
  }
};

// Check if user has specific permission
const hasPermission = (userRole, requiredRoles) => {
  if (!Array.isArray(requiredRoles)) {
    requiredRoles = [requiredRoles];
  }
  return requiredRoles.includes(userRole);
};

// Middleware to check resource ownership
const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceId = req.params.id || req.body[resourceField] || req.query[resourceField];
    if (req.user.id !== resourceId) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập tài nguyên này',
        code: 'ACCESS_DENIED'
      });
    }

    next();
  };
};

// Add utility functions as properties of the main function
authMiddleware.validateToken = validateToken;
authMiddleware.extractUserId = extractUserId;
authMiddleware.hasPermission = hasPermission;
authMiddleware.checkOwnership = checkOwnership;

// Add convenience methods
authMiddleware.auth = authMiddleware();
authMiddleware.authOptional = authMiddleware({ optional: true });
authMiddleware.authAdmin = authMiddleware({ requireAdmin: true });
authMiddleware.authWithUser = authMiddleware({ checkUser: true });
authMiddleware.authTeacher = authMiddleware({ roles: ['teacher', 'admin'] });
authMiddleware.authStudent = authMiddleware({ roles: ['student', 'teacher', 'admin'] });

// Export as default function - this allows your current usage pattern
module.exports = authMiddleware;