const express = require('express');
const { 
  getSystemSettings, 
  updateSystemSettings, 
  performMaintenance, 
  getSystemLogs 
} = require('../controllers/systemSettingsController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and system admin role
router.use(authenticate);
router.use(authorize(['systemAdmin']));

// Get system settings and configuration
router.get('/', getSystemSettings);

// Update system configuration
router.put('/', updateSystemSettings);

// Perform maintenance tasks
router.post('/maintenance', performMaintenance);

// Get system logs
router.get('/logs', getSystemLogs);

module.exports = router;
