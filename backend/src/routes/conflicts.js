const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  checkAssignmentConflicts,
  assignStaffWithConflictCheck,
  getConflicts
} = require('../controllers/conflictDetectionController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/conflicts/check
 * @desc    Check for conflicts before assigning staff to a shift
 * @access  Enterprise Admin, System Admin, Manager
 */
router.post('/check', 
  authorize(['enterpriseAdmin', 'systemAdmin', 'manager']), 
  checkAssignmentConflicts
);

/**
 * @route   POST /api/conflicts/assign
 * @desc    Assign staff to shift with conflict detection
 * @access  Enterprise Admin, System Admin, Manager
 */
router.post('/assign', 
  authorize(['enterpriseAdmin', 'systemAdmin', 'manager']), 
  assignStaffWithConflictCheck
);

/**
 * @route   GET /api/conflicts
 * @desc    Get all conflicts for a department or roster
 * @access  Enterprise Admin, System Admin, Manager, Employee (own conflicts)
 */
router.get('/', getConflicts);

module.exports = router;
