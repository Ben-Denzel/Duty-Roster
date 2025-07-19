const { Shift, Roster, Department, User, ShiftAssignment } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Get all shifts for a roster
 */
const getShifts = async (req, res) => {
  try {
    const { rosterId } = req.params;
    const { date, shift_type, status } = req.query;

    // Find the roster and check access
    const roster = await Roster.findByPk(rosterId, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id']
        }
      ]
    });

    if (!roster) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Roster not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== roster.department.enterprise_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this roster'
      });
    }

    // Build where clause
    const whereClause = { roster_id: rosterId };
    
    if (date) {
      whereClause.date = date;
    }
    
    if (shift_type) {
      whereClause.shift_type = shift_type;
    }
    
    if (status) {
      whereClause.status = status;
    }

    // Get shifts
    const shifts = await Shift.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'responsible',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: ShiftAssignment,
          as: 'assignments',
          include: [
            {
              model: User,
              as: 'employee',
              attributes: ['id', 'full_name', 'email', 'role']
            }
          ]
        }
      ],
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json({
      message: 'Shifts retrieved successfully',
      shifts,
      roster: {
        id: roster.id,
        name: roster.name,
        status: roster.status
      }
    });

  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch shifts'
    });
  }
};

/**
 * Create a new shift
 */
const createShift = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      roster_id,
      date,
      start_time,
      end_time,
      shift_type,
      title,
      description,
      required_staff,
      responsible_id,
      location,
      requirements,
      break_schedule,
      priority,
      color,
      notes
    } = req.body;

    // Validation
    if (!roster_id || !date || !start_time || !end_time || !shift_type) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Roster ID, date, start time, end time, and shift type are required'
      });
    }

    // Find the roster
    const roster = await Roster.findByPk(roster_id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id']
        }
      ],
      transaction
    });

    if (!roster) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Roster not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== roster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this roster'
      });
    }

    // Only allow creation if roster is not published
    if (roster.status === 'published') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Cannot add shifts to published rosters'
      });
    }

    // Validate date is within roster range
    const shiftDate = new Date(date);
    const rosterStart = new Date(roster.start_date);
    const rosterEnd = new Date(roster.end_date);

    if (shiftDate < rosterStart || shiftDate > rosterEnd) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Shift date must be within roster date range'
      });
    }

    // Validate responsible person if provided
    if (responsible_id) {
      const responsible = await User.findByPk(responsible_id, { transaction });
      if (!responsible || responsible.enterprise_id !== roster.department.enterprise_id) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid responsible person'
        });
      }
    }

    // Create the shift
    const shift = await Shift.create({
      roster_id,
      date,
      start_time,
      end_time,
      shift_type,
      title: title || null,
      description: description || null,
      required_staff: required_staff || 1,
      responsible_id: responsible_id || null,
      location: location || null,
      requirements: requirements || {},
      break_schedule: break_schedule || {},
      priority: priority || 'normal',
      color: color || null,
      notes: notes || null
    }, { transaction });

    await transaction.commit();

    // Fetch the created shift with includes
    const createdShift = await Shift.findByPk(shift.id, {
      include: [
        {
          model: User,
          as: 'responsible',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    res.status(201).json({
      message: 'Shift created successfully',
      shift: createdShift
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create shift error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create shift'
    });
  }
};

/**
 * Update a shift
 */
const updateShift = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the shift
    const shift = await Shift.findByPk(id, {
      include: [
        {
          model: Roster,
          as: 'roster',
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name', 'enterprise_id']
            }
          ]
        }
      ],
      transaction
    });

    if (!shift) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Shift not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== shift.roster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this shift'
      });
    }

    // Only allow updates if roster is not published
    if (shift.roster.status === 'published') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Cannot modify shifts in published rosters'
      });
    }

    // Validate responsible person if being updated
    if (updateData.responsible_id) {
      const responsible = await User.findByPk(updateData.responsible_id, { transaction });
      if (!responsible || responsible.enterprise_id !== shift.roster.department.enterprise_id) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid responsible person'
        });
      }
    }

    // Update the shift
    await shift.update(updateData, { transaction });

    await transaction.commit();

    // Fetch updated shift
    const updatedShift = await Shift.findByPk(id, {
      include: [
        {
          model: User,
          as: 'responsible',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    res.json({
      message: 'Shift updated successfully',
      shift: updatedShift
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update shift error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update shift'
    });
  }
};

/**
 * Delete a shift
 */
const deleteShift = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Find the shift
    const shift = await Shift.findByPk(id, {
      include: [
        {
          model: Roster,
          as: 'roster',
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name', 'enterprise_id']
            }
          ]
        }
      ],
      transaction
    });

    if (!shift) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Shift not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== shift.roster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this shift'
      });
    }

    // Only allow deletion if roster is not published
    if (shift.roster.status === 'published') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Cannot delete shifts from published rosters'
      });
    }

    // Delete the shift (this will cascade delete assignments)
    await shift.destroy({ transaction });

    await transaction.commit();

    res.json({
      message: 'Shift deleted successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Delete shift error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete shift'
    });
  }
};

module.exports = {
  getShifts,
  createShift,
  updateShift,
  deleteShift
};
