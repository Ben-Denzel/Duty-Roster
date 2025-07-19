const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getShifts,
  createShift,
  updateShift,
  deleteShift
} = require('../controllers/shiftController');
const {
  getShiftAssignments,
  assignEmployee,
  unassignEmployee,
  getAvailableEmployees,
  bulkAssignEmployees
} = require('../controllers/shiftAssignmentController');

// Get all shifts for a roster
router.get(
  '/roster/:rosterId',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager', 'employee']),
  getShifts
);

// Create a new shift
router.post(
  '/',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  createShift
);

// Update a shift
router.put(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  updateShift
);

// Delete a shift
router.delete(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  deleteShift
);

// Get assignments for a specific shift
router.get(
  '/:shiftId/assignments',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  getShiftAssignments
);

// Get available employees for a shift
router.get(
  '/:shiftId/available-employees',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  getAvailableEmployees
);

// Assign an employee to a shift
router.post(
  '/:shiftId/assignments',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  assignEmployee
);

// Unassign an employee from a shift
router.delete(
  '/assignments/:assignmentId',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  unassignEmployee
);

// Bulk assign employees to shifts
router.post(
  '/bulk-assign',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  bulkAssignEmployees
);

module.exports = router;
