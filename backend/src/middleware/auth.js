const { verifyToken, extractToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = verifyToken(token);
    
    // Fetch user from database to ensure they still exist
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not found'
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      enterprise_id: user.enterprise_id,
      department_id: user.department_id,
      full_name: user.full_name
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Access denied',
      message: error.message
    });
  }
};

/**
 * Middleware to authorize specific roles
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user belongs to specific enterprise
 */
const checkEnterpriseAccess = (req, res, next) => {
  const enterpriseId = parseInt(req.params.enterpriseId || req.body.enterprise_id);

  if (req.user.role === 'systemAdmin') {
    return next(); // System admin has access to all enterprises
  }

  if (req.user.enterprise_id !== enterpriseId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied to this enterprise'
    });
  }

  next();
};

/**
 * Middleware to check if user has access to specific department
 */
const checkDepartmentAccess = (req, res, next) => {
  const departmentId = parseInt(req.params.departmentId || req.params.id || req.body.department_id);

  if (req.user.role === 'systemAdmin') {
    return next(); // System admin has access to all departments
  }

  if (req.user.role === 'enterpriseAdmin') {
    // Enterprise admin can access all departments in their enterprise
    // This will be validated in the controller by checking department.enterprise_id
    return next();
  }

  if (req.user.role === 'manager') {
    // Managers can only access their own department
    if (req.user.department_id !== departmentId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }
    return next();
  }

  if (req.user.role === 'employee') {
    // Employees can only view their own department (read-only)
    if (req.user.department_id !== departmentId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Insufficient permissions'
  });
};

/**
 * Middleware to check if user can manage users (create, update, delete)
 */
const checkUserManagementAccess = (req, res, next) => {
  if (req.user.role === 'systemAdmin' || req.user.role === 'enterpriseAdmin') {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Insufficient permissions for user management'
  });
};

/**
 * Middleware to check if user can manage departments (create, update, delete)
 */
const checkDepartmentManagementAccess = (req, res, next) => {
  if (req.user.role === 'systemAdmin' || req.user.role === 'enterpriseAdmin') {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Insufficient permissions for department management'
  });
};

/**
 * Middleware to check if user can view department data
 */
const checkDepartmentViewAccess = (req, res, next) => {
  if (['systemAdmin', 'enterpriseAdmin', 'manager'].includes(req.user.role)) {
    return next();
  }

  return res.status(403).json({
    error: 'Forbidden',
    message: 'Insufficient permissions to view department data'
  });
};

module.exports = {
  authenticate,
  authorize,
  checkEnterpriseAccess,
  checkDepartmentAccess,
  checkUserManagementAccess,
  checkDepartmentManagementAccess,
  checkDepartmentViewAccess
};
