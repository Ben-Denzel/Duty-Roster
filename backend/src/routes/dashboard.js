const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getEnterpriseAnalytics, getSystemAnalytics } = require('../controllers/dashboardController');

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

module.exports = router;
