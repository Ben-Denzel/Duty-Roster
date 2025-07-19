const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createUser, updateUser } = require('../controllers/userController');

// Create a new user
router.post(
  '/',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  createUser
);

// Update a user
router.put(
  '/:id',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  updateUser
);

module.exports = router;
