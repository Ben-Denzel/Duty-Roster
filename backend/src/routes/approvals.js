const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getPendingApprovals,
  approveRoster,
  rejectRoster,
  getApprovalHistory,
  submitForApproval
} = require('../controllers/approvalController');

// Submit roster for approval
router.post(
  '/rosters/:roster_id/submit',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  submitForApproval
);

// Get pending approvals for a manager
router.get(
  '/pending',
  authenticate,
  authorize(['systemAdmin', 'manager']),
  getPendingApprovals
);

// Approve a roster
router.post(
  '/rosters/:rosterId/approve',
  authenticate,
  authorize(['systemAdmin', 'manager']),
  approveRoster
);

// Reject a roster
router.post(
  '/rosters/:rosterId/reject',
  authenticate,
  authorize(['systemAdmin', 'manager']),
  rejectRoster
);

// Get approval history for a roster
router.get(
  '/rosters/:rosterId/history',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  getApprovalHistory
);

module.exports = router;
