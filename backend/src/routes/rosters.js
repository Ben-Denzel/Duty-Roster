const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getRosters,
  getRoster,
  createRoster,
  updateRoster,
  deleteRoster,
  updateRosterStatus,
  copyRoster
} = require('../controllers/rosterController');

// Middleware to check department access for managers
const checkDepartmentAccess = async (req, res, next) => {
  if (req.user.role === 'manager') {
    const departmentId = parseInt(req.params.departmentId);
    if (req.user.department_id !== departmentId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }
  }
  next();
};

// Get all rosters for a department
router.get(
  '/department/:departmentId',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  checkDepartmentAccess,
  getRosters
);

// Get all rosters across departments (with proper permissions) - MUST BE BEFORE /:id route
router.get('/all', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, start_date, end_date, search } = req.query;
    const offset = (page - 1) * limit;
    const { Op } = require('sequelize');
    const Department = require('../models/Department');
    const Enterprise = require('../models/Enterprise');
    const User = require('../models/User');
    const Shift = require('../models/Shift');
    const Roster = require('../models/Roster');

    // Build where clause for filtering
    let whereClause = {};
    if (status) whereClause.status = status;
    if (start_date) whereClause.start_date = { [Op.gte]: start_date };
    if (end_date) whereClause.end_date = { [Op.lte]: end_date };
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Build department access filter based on user role
    let departmentFilter = {};
    if (req.user.role === 'systemAdmin') {
      // System admin can see all rosters
      departmentFilter = {};
    } else if (req.user.role === 'enterpriseAdmin') {
      // Enterprise admin can see rosters from their enterprise
      departmentFilter = { enterprise_id: req.user.enterprise_id };
    } else if (req.user.role === 'manager') {
      // Manager can see rosters from their department or enterprise
      if (req.user.department_id) {
        departmentFilter = { id: req.user.department_id };
      } else {
        departmentFilter = { enterprise_id: req.user.enterprise_id };
      }
    } else {
      // Regular employees can only see rosters from their department
      if (req.user.department_id) {
        departmentFilter = { id: req.user.department_id };
      } else {
        // If no department, return empty
        return res.json({
          message: 'Rosters retrieved successfully',
          rosters: [],
          pagination: {
            current_page: parseInt(page),
            total_pages: 0,
            total_items: 0,
            items_per_page: parseInt(limit)
          }
        });
      }
    }

    // Get rosters with department filtering
    const { count, rows: rosters } = await Roster.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          where: departmentFilter,
          attributes: ['id', 'name', 'enterprise_id'],
          include: [{
            model: Enterprise,
            as: 'enterprise',
            attributes: ['id', 'name']
          }]
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Shift,
          as: 'shifts',
          attributes: ['id', 'date', 'start_time', 'end_time', 'shift_type', 'required_staff', 'assigned_staff'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      distinct: true
    });

    // Calculate pagination
    const totalPages = Math.ceil(count / limit);

    res.json({
      message: 'Rosters retrieved successfully',
      rosters,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get all rosters error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve rosters'
    });
  }
});

// Get a specific roster by ID
router.get(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager', 'employee']),
  getRoster
);

// Create a new roster
router.post(
  '/',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  createRoster
);

// Update a roster
router.put(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  updateRoster
);

// Delete a roster
router.delete(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  deleteRoster
);

// Update roster status (workflow management)
router.patch(
  '/:id/status',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  updateRosterStatus
);

// Copy an existing roster
router.post(
  '/:id/copy',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  copyRoster
);

module.exports = router;
