const express = require('express');
const { createEnterprise, getEnterprises, getEnterprise } = require('../controllers/enterpriseController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// System admin only routes
router.post('/', authorize(['systemAdmin']), createEnterprise);
router.get('/', authorize(['systemAdmin']), getEnterprises);

// Enterprise-specific routes
router.get('/:id', getEnterprise);

module.exports = router;
