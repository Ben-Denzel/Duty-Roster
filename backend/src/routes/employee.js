const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getMySchedule,
  updateAssignmentStatus,
  getMyAvailability,
  setAvailability
} = require('../controllers/employeeController');
const {
  getMySwapRequests,
  createSwapRequest,
  respondToSwapRequest,
  cancelSwapRequest,
  managerApproveSwapRequest
} = require('../controllers/swapRequestController');

// Personal Schedule Routes
router.get(
  '/my-schedule',
  authenticate,
  authorize(['employee', 'manager', 'enterpriseAdmin', 'systemAdmin']),
  getMySchedule
);

// Assignment Status Routes
router.patch(
  '/assignments/:assignmentId/status',
  authenticate,
  authorize(['employee', 'manager', 'enterpriseAdmin', 'systemAdmin']),
  updateAssignmentStatus
);

// Availability Routes
router.get(
  '/my-availability',
  authenticate,
  authorize(['employee', 'manager', 'enterpriseAdmin', 'systemAdmin']),
  getMyAvailability
);

router.post(
  '/availability',
  authenticate,
  authorize(['employee', 'manager', 'enterpriseAdmin', 'systemAdmin']),
  setAvailability
);

// Swap Request Routes
router.get(
  '/swap-requests',
  authenticate,
  authorize(['employee', 'manager', 'enterpriseAdmin', 'systemAdmin']),
  getMySwapRequests
);

router.post(
  '/swap-requests',
  authenticate,
  authorize(['employee', 'manager', 'enterpriseAdmin', 'systemAdmin']),
  createSwapRequest
);

router.patch(
  '/swap-requests/:swapRequestId/respond',
  authenticate,
  authorize(['employee', 'manager', 'enterpriseAdmin', 'systemAdmin']),
  respondToSwapRequest
);

router.patch(
  '/swap-requests/:swapRequestId/cancel',
  authenticate,
  authorize(['employee', 'manager', 'enterpriseAdmin', 'systemAdmin']),
  cancelSwapRequest
);

// Manager approve/reject swap request
router.patch(
  '/swap-requests/:swapRequestId/manager-action',
  authenticate,
  authorize(['manager', 'enterpriseAdmin', 'systemAdmin']),
  managerApproveSwapRequest
);

module.exports = router;
