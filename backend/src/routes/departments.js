const express = require('express');
const router = express.Router();
const { authenticate, authorize, checkEnterpriseAccess } = require('../middleware/auth');
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignUsers,
  removeUsers,
  getDepartmentAnalytics
} = require('../controllers/departmentController');

// Middleware to check department access for managers
const checkDepartmentAccess = async (req, res, next) => {
  if (req.user.role === 'manager') {
    const departmentId = parseInt(req.params.id);
    if (req.user.department_id !== departmentId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }
  }
  next();
};

// Get all departments for an enterprise
router.get(
  '/enterprise/:enterpriseId',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  checkEnterpriseAccess,
  getDepartments
);

// Get department analytics for an enterprise
router.get(
  '/enterprise/:enterpriseId/analytics',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  checkEnterpriseAccess,
  getDepartmentAnalytics
);

// Get a specific department
router.get(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  checkDepartmentAccess,
  getDepartment
);

// Create a new department
router.post(
  '/',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  createDepartment
);

// Update a department
router.put(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  updateDepartment
);

// Delete a department (soft delete)
router.delete(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  deleteDepartment
);

// Assign users to a department
router.post(
  '/:id/users',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  assignUsers
);

// Remove users from a department
router.delete(
  '/:id/users',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  removeUsers
);

/**
 * @route   GET /api/departments/:id/staff
 * @desc    Get all staff in a department for assignment
 * @access  Enterprise Admin, System Admin, Manager, Employee (own department)
 */
router.get('/:id/staff', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const User = require('../models/User');

    // Get department users
    const users = await User.findAll({
      where: {
        department_id: id,
        is_active: true
      },
      attributes: ['id', 'full_name', 'email', 'role', 'created_at'],
      order: [['full_name', 'ASC']]
    });

    res.json({
      message: 'Department staff retrieved successfully',
      users
    });

  } catch (error) {
    console.error('Get department staff error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve department staff'
    });
  }
});

module.exports = router;
