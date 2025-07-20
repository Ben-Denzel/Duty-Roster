const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getEnterpriseAnalytics,
  getSystemAnalytics,
  getManagerAnalytics,
  getEmployeeAnalytics
} = require('../controllers/dashboardController');

// Get enterprise analytics (for enterprise admins)
router.get(
  '/enterprise',
  authenticate,
  authorize(['enterpriseAdmin']),
  getEnterpriseAnalytics
);

// Get system analytics (for system admins)
router.get(
  '/system',
  authenticate,
  authorize(['systemAdmin']),
  getSystemAnalytics
);

// Get manager analytics (for managers)
router.get(
  '/manager',
  authenticate,
  authorize(['manager']),
  getManagerAnalytics
);

// Get employee analytics (for employees)
router.get(
  '/employee',
  authenticate,
  authorize(['employee']),
  getEmployeeAnalytics
);

module.exports = router;
