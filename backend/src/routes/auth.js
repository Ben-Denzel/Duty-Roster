const express = require('express');
const { register, login, getProfile, updateProfile, createUser, createSystemAdmin } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

// Admin-only routes
router.post('/create-user', authenticate, authorize(['systemAdmin', 'enterpriseAdmin']), createUser);

// Special system admin creation route (no authentication required)
router.post('/create-system-admin', createSystemAdmin);

module.exports = router;
