const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getShiftTemplates,
  saveShiftTemplate,
  deleteShiftTemplate,
  getDefaultTemplates
} = require('../controllers/shiftTemplateController');

// Middleware to check department access for managers
const checkDepartmentAccess = async (req, res, next) => {
  if (req.user.role === 'manager') {
    const departmentId = parseInt(req.params.departmentId);
    if (req.user.department_id !== departmentId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }
  }
  next();
};

// Get default shift templates (for reference)
router.get(
  '/defaults',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  getDefaultTemplates
);

// Get all shift templates for a department
router.get(
  '/department/:departmentId',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']),
  checkDepartmentAccess,
  getShiftTemplates
);

// Create or update a shift template
router.post(
  '/department/:departmentId',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  saveShiftTemplate
);

// Update a shift template
router.put(
  '/department/:departmentId/:templateId',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  saveShiftTemplate
);

// Delete a shift template
router.delete(
  '/department/:departmentId/:templateId',
  authenticate,
  authorize(['systemAdmin', 'enterpriseAdmin']),
  deleteShiftTemplate
);

module.exports = router;
