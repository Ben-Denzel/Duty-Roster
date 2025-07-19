const { User, Shift, ShiftAssignment, Roster, Department, Availability, SwapRequest } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Get employee's personal schedule
 */
const getMySchedule = async (req, res) => {
  try {
    const { start_date, end_date, page = 1, limit = 50 } = req.query;
    const employeeId = req.user.id;

    // Build date filter
    let dateFilter = {};
    if (start_date && end_date) {
      dateFilter = {
        date: {
          [Op.between]: [start_date, end_date]
        }
      };
    } else if (start_date) {
      dateFilter = {
        date: {
          [Op.gte]: start_date
        }
      };
    } else if (end_date) {
      dateFilter = {
        date: {
          [Op.lte]: end_date
        }
      };
    } else {
      // Default to current month if no dates provided
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      dateFilter = {
        date: {
          [Op.between]: [startOfMonth.toISOString().split('T')[0], endOfMonth.toISOString().split('T')[0]]
        }
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get employee's shift assignments
    const { count, rows: assignments } = await ShiftAssignment.findAndCountAll({
      where: {
        employee_id: employeeId
      },
      include: [
        {
          model: Shift,
          as: 'shift',
          where: dateFilter,
          include: [
            {
              model: Roster,
              as: 'roster',
              attributes: ['id', 'name', 'status'],
              include: [
                {
                  model: Department,
                  as: 'department',
                  attributes: ['id', 'name']
                }
              ]
            },
            {
              model: User,
              as: 'responsible',
              attributes: ['id', 'full_name', 'email'],
              required: false
            }
          ]
        }
      ],
      order: [['shift', 'date', 'ASC'], ['shift', 'start_time', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    // Group shifts by date for easier frontend handling
    const shiftsByDate = {};
    assignments.forEach(assignment => {
      const date = assignment.shift.date;
      if (!shiftsByDate[date]) {
        shiftsByDate[date] = [];
      }
      shiftsByDate[date].push({
        assignment_id: assignment.id,
        shift: assignment.shift,
        status: assignment.status,
        role: assignment.role,
        notes: assignment.notes,
        confirmed_at: assignment.confirmed_at
      });
    });

    res.json({
      message: 'Personal schedule retrieved successfully',
      schedule: {
        shifts_by_date: shiftsByDate,
        assignments: assignments
      },
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get my schedule error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch personal schedule'
    });
  }
};

/**
 * Confirm or decline a shift assignment
 */
const updateAssignmentStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { assignmentId } = req.params;
    const { status, notes } = req.body;
    const employeeId = req.user.id;

    // Validate status
    const validStatuses = ['confirmed', 'declined'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be either "confirmed" or "declined"'
      });
    }

    // Find the assignment
    const assignment = await ShiftAssignment.findByPk(assignmentId, {
      include: [
        {
          model: Shift,
          as: 'shift',
          include: [
            {
              model: Roster,
              as: 'roster',
              attributes: ['id', 'name', 'status']
            }
          ]
        }
      ],
      transaction
    });

    if (!assignment) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Assignment not found'
      });
    }

    // Check if assignment belongs to the employee
    if (assignment.employee_id !== employeeId) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own assignments'
      });
    }

    // Check if roster is published (employees can only confirm/decline published rosters)
    if (assignment.shift.roster.status !== 'published') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Can only confirm/decline assignments for published rosters'
      });
    }

    // Check if assignment is in a state that can be updated
    if (!['assigned', 'confirmed', 'declined'].includes(assignment.status)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Assignment cannot be updated in its current state'
      });
    }

    // Update the assignment
    await assignment.update({
      status,
      notes: notes || assignment.notes,
      confirmed_at: status === 'confirmed' ? new Date() : null
    }, { transaction });

    await transaction.commit();

    // Fetch updated assignment
    const updatedAssignment = await ShiftAssignment.findByPk(assignmentId, {
      include: [
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'date', 'start_time', 'end_time', 'title']
        }
      ]
    });

    res.json({
      message: `Assignment ${status} successfully`,
      assignment: updatedAssignment
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update assignment status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update assignment status'
    });
  }
};

/**
 * Get employee's availability preferences
 */
const getMyAvailability = async (req, res) => {
  try {
    const { start_date, end_date, type } = req.query;
    const employeeId = req.user.id;

    // Build where clause
    const whereClause = {
      employee_id: employeeId
    };

    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date]
      };
    } else if (start_date) {
      whereClause.date = {
        [Op.gte]: start_date
      };
    } else if (end_date) {
      whereClause.date = {
        [Op.lte]: end_date
      };
    }

    if (type) {
      whereClause.availability_type = type;
    }

    // Get availability records
    const availability = await Availability.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'approved_by_user',
          attributes: ['id', 'full_name', 'email'],
          foreignKey: 'approved_by',
          required: false
        }
      ],
      order: [['date', 'ASC']]
    });

    res.json({
      message: 'Availability preferences retrieved successfully',
      availability
    });

  } catch (error) {
    console.error('Get my availability error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch availability preferences'
    });
  }
};

/**
 * Set availability preference for a date
 */
const setAvailability = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      date,
      availability_type,
      start_time,
      end_time,
      shift_types,
      max_hours,
      reason,
      notes,
      is_recurring,
      recurrence_pattern
    } = req.body;

    const employeeId = req.user.id;

    // Validation
    if (!date || !availability_type) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Date and availability type are required'
      });
    }

    // Validate availability type
    const validTypes = ['available', 'unavailable', 'preferred', 'limited'];
    if (!validTypes.includes(availability_type)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid availability type'
      });
    }

    // Check if availability already exists for this date
    const existingAvailability = await Availability.findOne({
      where: {
        employee_id: employeeId,
        date,
        availability_type
      },
      transaction
    });

    if (existingAvailability) {
      // Update existing availability
      await existingAvailability.update({
        start_time: start_time || existingAvailability.start_time,
        end_time: end_time || existingAvailability.end_time,
        shift_types: shift_types || existingAvailability.shift_types,
        max_hours: max_hours || existingAvailability.max_hours,
        reason: reason || existingAvailability.reason,
        notes: notes || existingAvailability.notes,
        is_recurring: is_recurring !== undefined ? is_recurring : existingAvailability.is_recurring,
        recurrence_pattern: recurrence_pattern || existingAvailability.recurrence_pattern
      }, { transaction });

      await transaction.commit();

      res.json({
        message: 'Availability preference updated successfully',
        availability: existingAvailability
      });
    } else {
      // Create new availability
      const availability = await Availability.create({
        employee_id: employeeId,
        date,
        availability_type,
        start_time,
        end_time,
        shift_types: shift_types || ['day', 'night', 'weekend', 'holiday'],
        max_hours,
        reason,
        notes,
        is_recurring: is_recurring || false,
        recurrence_pattern: recurrence_pattern || { type: 'none' }
      }, { transaction });

      await transaction.commit();

      res.status(201).json({
        message: 'Availability preference set successfully',
        availability
      });
    }

  } catch (error) {
    await transaction.rollback();
    console.error('Set availability error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to set availability preference'
    });
  }
};

module.exports = {
  getMySchedule,
  updateAssignmentStatus,
  getMyAvailability,
  setAvailability
};
