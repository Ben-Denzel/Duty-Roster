const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createRosterWithShifts,
  addShiftToRoster,
  getRosterShifts
} = require('../controllers/shiftManagementController');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/shift-management/rosters
 * @desc    Create a new roster with auto-generated shifts
 * @access  Enterprise Admin, System Admin
 */
router.post('/rosters',
  authorize(['enterpriseAdmin', 'systemAdmin']),
  createRosterWithShifts
);

/**
 * @route   POST /api/shift-management/rosters/:roster_id/shifts
 * @desc    Add a single shift to a roster
 * @access  Enterprise Admin, System Admin
 */
router.post('/rosters/:roster_id/shifts',
  authorize(['enterpriseAdmin', 'systemAdmin']),
  addShiftToRoster
);

/**
 * @route   GET /api/shift-management/rosters/:roster_id/shifts
 * @desc    Get all shifts for a roster
 * @access  Enterprise Admin, System Admin, Manager, Employee (own department)
 */
router.get('/rosters/:roster_id/shifts', getRosterShifts);

/**
 * @route   GET /api/shift-management/shifts/:shift_id/assignments
 * @desc    Get all assignments for a shift
 * @access  Enterprise Admin, System Admin, Manager, Employee (own department)
 */
router.get('/shifts/:shift_id/assignments', async (req, res) => {
  try {
    const { shift_id } = req.params;
    const ShiftAssignment = require('../models/ShiftAssignment');
    const User = require('../models/User');

    const assignments = await ShiftAssignment.findAll({
      where: { shift_id },
      include: [{
        model: User,
        as: 'employee',
        attributes: ['id', 'full_name', 'email', 'role']
      }]
    });

    res.json({
      message: 'Assignments retrieved successfully',
      assignments
    });
  } catch (error) {
    console.error('Get shift assignments error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve assignments'
    });
  }
});

/**
 * @route   DELETE /api/shift-management/assignments/:assignment_id
 * @desc    Remove a shift assignment
 * @access  Enterprise Admin, System Admin, Manager
 */
router.delete('/assignments/:assignment_id',
  authorize(['enterpriseAdmin', 'systemAdmin', 'manager']),
  async (req, res) => {
    const transaction = await require('../config/database').sequelize.transaction();

    try {
      const { assignment_id } = req.params;
      const ShiftAssignment = require('../models/ShiftAssignment');
      const Shift = require('../models/Shift');

      const assignment = await ShiftAssignment.findByPk(assignment_id, {
        include: [{
          model: Shift,
          as: 'shift'
        }],
        transaction
      });

      if (!assignment) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Not found',
          message: 'Assignment not found'
        });
      }

      // Remove assignment
      await assignment.destroy({ transaction });

      // Update shift assigned_staff count
      await assignment.shift.decrement('assigned_staff', { transaction });

      await transaction.commit();

      res.json({
        message: 'Assignment removed successfully'
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Remove assignment error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to remove assignment'
      });
    }
  }
);

module.exports = router;
