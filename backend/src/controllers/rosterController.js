const { Roster, Shift, ShiftAssignment, Department, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const EventTriggerService = require('../services/EventTriggerService');

/**
 * Get all rosters for a department
 */
const getRosters = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      start_date, 
      end_date,
      search = '' 
    } = req.query;

    // Find the department and check access
    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Department not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== department.enterprise_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }

    // Additional check for managers - they can only access their own department
    if (req.user.role === 'manager' && req.user.department_id !== parseInt(departmentId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }

    // Build where clause
    const whereClause = {
      department_id: departmentId
    };

    if (status) {
      whereClause.status = status;
    }

    if (start_date) {
      whereClause.start_date = {
        [Op.gte]: start_date
      };
    }

    if (end_date) {
      whereClause.end_date = {
        [Op.lte]: end_date
      };
    }

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch rosters
    const { count, rows: rosters } = await Roster.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: Shift,
          as: 'shifts',
          attributes: ['id', 'date', 'shift_type', 'required_staff', 'assigned_staff'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    res.json({
      message: 'Rosters retrieved successfully',
      rosters,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit)
      },
      department: {
        id: department.id,
        name: department.name
      }
    });

  } catch (error) {
    console.error('Get rosters error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch rosters'
    });
  }
};

/**
 * Get a specific roster by ID
 */
const getRoster = async (req, res) => {
  try {
    const { id } = req.params;

    const roster = await Roster.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id'],
          required: true
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: Shift,
          as: 'shifts',
          include: [
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
            },
            {
              model: User,
              as: 'responsible',
              attributes: ['id', 'full_name', 'email'],
              required: false
            }
          ]
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

    // Additional check for managers
    if (req.user.role === 'manager' && req.user.department_id !== roster.department_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this roster'
      });
    }

    res.json({
      message: 'Roster retrieved successfully',
      roster
    });

  } catch (error) {
    console.error('Get roster error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch roster'
    });
  }
};

/**
 * Create a new roster
 */
const createRoster = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      description,
      department_id,
      start_date,
      end_date,
      settings,
      shift_template,
      auto_generate_shifts,
      auto_assign_staff,
      assignment_strategy,
      prefer_full_time,
      max_consecutive_days,
      min_rest_hours
    } = req.body;

    // Validation
    if (!name || !department_id || !start_date || !end_date) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, department_id, start_date, and end_date are required'
      });
    }

    // Find the department and check access
    const department = await Department.findByPk(department_id, { transaction });
    if (!department) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Department not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }

    // Only enterprise admins and system admins can create rosters
    if (!['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can create rosters'
      });
    }

    // Validate date range
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (endDate <= startDate) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'End date must be after start date'
      });
    }

    // Check for overlapping rosters
    const overlappingRoster = await Roster.findOne({
      where: {
        department_id,
        [Op.or]: [
          {
            start_date: {
              [Op.between]: [start_date, end_date]
            }
          },
          {
            end_date: {
              [Op.between]: [start_date, end_date]
            }
          },
          {
            [Op.and]: [
              { start_date: { [Op.lte]: start_date } },
              { end_date: { [Op.gte]: end_date } }
            ]
          }
        ]
      },
      transaction
    });

    if (overlappingRoster) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Conflict',
        message: 'A roster already exists for this date range'
      });
    }

    // Create the roster
    const roster = await Roster.create({
      name,
      description,
      department_id,
      start_date,
      end_date,
      created_by: req.user.id,
      settings: settings || {},
      metadata: {
        total_shifts: 0,
        assigned_shifts: 0,
        coverage_percentage: 0,
        last_modified_by: req.user.id,
        last_modified_at: new Date()
      }
    }, {
      transaction,
      user_id: req.user.id
    });

    // Auto-generate shifts if requested
    if (auto_generate_shifts) {
      try {
        await generateShiftsForRoster(roster, {
          shift_template,
          start_date,
          end_date,
          auto_assign_staff,
          assignment_strategy,
          prefer_full_time,
          max_consecutive_days,
          min_rest_hours
        }, transaction);
      } catch (shiftError) {
        await transaction.rollback();
        console.error('Shift generation error:', shiftError);
        return res.status(500).json({
          error: 'Internal server error',
          message: 'Failed to create roster with shifts',
          details: shiftError.message
        });
      }
    }

    await transaction.commit();

    // Fetch the created roster with includes
    const createdRoster = await Roster.findByPk(roster.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    res.status(201).json({
      message: 'Roster created successfully',
      roster: createdRoster
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create roster error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create roster'
    });
  }
};

/**
 * Update a roster
 */
const updateRoster = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      name,
      description,
      start_date,
      end_date,
      settings
    } = req.body;

    // Find the roster
    const roster = await Roster.findByPk(id, {
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

    // Only allow updates if roster is in draft or review status
    if (!['draft', 'review'].includes(roster.status)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Cannot update roster that is approved or published'
      });
    }

    // Only enterprise admins and system admins can update rosters
    if (!['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can update rosters'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (settings !== undefined) updateData.settings = settings;

    // Validate date range if dates are being updated
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (endDate <= startDate) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Validation error',
          message: 'End date must be after start date'
        });
      }
    }

    // Update the roster
    await roster.update(updateData, {
      transaction,
      user_id: req.user.id
    });

    await transaction.commit();

    // Fetch updated roster
    const updatedRoster = await Roster.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    res.json({
      message: 'Roster updated successfully',
      roster: updatedRoster
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update roster error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update roster'
    });
  }
};

/**
 * Delete a roster
 */
const deleteRoster = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Find the roster
    const roster = await Roster.findByPk(id, {
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

    // Only allow deletion if roster is in draft status
    if (roster.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Can only delete rosters in draft status'
      });
    }

    // Only enterprise admins and system admins can delete rosters
    if (!['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete rosters'
      });
    }

    // Delete the roster (this will cascade delete shifts and assignments)
    await roster.destroy({ transaction });

    await transaction.commit();

    res.json({
      message: 'Roster deleted successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Delete roster error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete roster'
    });
  }
};

/**
 * Update roster status (workflow management)
 */
const updateRosterStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['draft', 'review', 'approved', 'published'];
    if (!validStatuses.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid status'
      });
    }

    // Find the roster
    const roster = await Roster.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id', 'manager_id']
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

    // Validate status transitions
    const currentStatus = roster.status;
    const validTransitions = {
      'draft': ['review'],
      'review': ['approved', 'draft'],
      'approved': ['published', 'review'],
      'published': [] // Cannot change status once published
    };

    if (!validTransitions[currentStatus].includes(status)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    // Check role permissions for status changes
    if (status === 'review' && !['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can submit rosters for review'
      });
    }

    if (status === 'approved' && !['systemAdmin', 'manager'].includes(req.user.role)) {
      // Check if user is the department manager
      if (req.user.role !== 'manager' || req.user.id !== roster.department.manager_id) {
        await transaction.rollback();
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Only department managers can approve rosters'
        });
      }
    }

    if (status === 'published' && !['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can publish rosters'
      });
    }

    // Update the roster status
    const updateData = { status };

    if (status === 'approved') {
      updateData.approved_by = req.user.id;
      updateData.approved_at = new Date();
    }

    if (status === 'published') {
      updateData.published_at = new Date();
    }

    await roster.update(updateData, {
      transaction,
      user_id: req.user.id
    });

    await transaction.commit();

    // Fetch updated roster
    const updatedRoster = await Roster.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    // Trigger notifications based on status change
    try {
      if (status === 'review') {
        await EventTriggerService.onRosterNeedsApproval(updatedRoster);
      } else if (status === 'approved') {
        await EventTriggerService.onRosterApproved(updatedRoster);
      } else if (status === 'published') {
        await EventTriggerService.onRosterPublished(updatedRoster);
      }
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.json({
      message: `Roster status updated to ${status}`,
      roster: updatedRoster
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update roster status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update roster status'
    });
  }
};

/**
 * Copy an existing roster
 */
const copyRoster = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      name,
      start_date,
      end_date,
      copy_shifts = true
    } = req.body;

    // Validation
    if (!name || !start_date || !end_date) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, start_date, and end_date are required'
      });
    }

    // Find the source roster
    const sourceRoster = await Roster.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id']
        },
        {
          model: Shift,
          as: 'shifts',
          required: false
        }
      ],
      transaction
    });

    if (!sourceRoster) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Source roster not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== sourceRoster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this roster'
      });
    }

    // Only enterprise admins and system admins can copy rosters
    if (!['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can copy rosters'
      });
    }

    // Create the new roster
    const newRoster = await Roster.create({
      name,
      description: `Copy of ${sourceRoster.name}`,
      department_id: sourceRoster.department_id,
      start_date,
      end_date,
      created_by: req.user.id,
      settings: sourceRoster.settings,
      metadata: {
        total_shifts: 0,
        assigned_shifts: 0,
        coverage_percentage: 0,
        last_modified_by: req.user.id,
        last_modified_at: new Date(),
        copied_from: sourceRoster.id
      }
    }, {
      transaction,
      user_id: req.user.id
    });

    // Copy shifts if requested
    if (copy_shifts && sourceRoster.shifts.length > 0) {
      const sourceDateRange = new Date(sourceRoster.end_date) - new Date(sourceRoster.start_date);
      const targetDateRange = new Date(end_date) - new Date(start_date);

      // Only copy shifts if date ranges are similar (within 7 days difference)
      if (Math.abs(sourceDateRange - targetDateRange) <= 7 * 24 * 60 * 60 * 1000) {
        const daysDifference = Math.floor((new Date(start_date) - new Date(sourceRoster.start_date)) / (24 * 60 * 60 * 1000));

        for (const sourceShift of sourceRoster.shifts) {
          const newShiftDate = new Date(sourceShift.date);
          newShiftDate.setDate(newShiftDate.getDate() + daysDifference);

          // Only create shift if the new date is within the target range
          if (newShiftDate >= new Date(start_date) && newShiftDate <= new Date(end_date)) {
            await Shift.create({
              roster_id: newRoster.id,
              date: newShiftDate.toISOString().split('T')[0],
              start_time: sourceShift.start_time,
              end_time: sourceShift.end_time,
              shift_type: sourceShift.shift_type,
              title: sourceShift.title,
              description: sourceShift.description,
              required_staff: sourceShift.required_staff,
              location: sourceShift.location,
              requirements: sourceShift.requirements,
              break_schedule: sourceShift.break_schedule,
              priority: sourceShift.priority,
              color: sourceShift.color,
              notes: sourceShift.notes
            }, { transaction });
          }
        }
      }
    }

    await transaction.commit();

    // Fetch the created roster
    const createdRoster = await Roster.findByPk(newRoster.id, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Shift,
          as: 'shifts',
          attributes: ['id', 'date', 'shift_type', 'required_staff'],
          required: false
        }
      ]
    });

    res.status(201).json({
      message: 'Roster copied successfully',
      roster: createdRoster
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Copy roster error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to copy roster'
    });
  }
};

/**
 * Generate shifts for a roster based on template and parameters
 */
const generateShiftsForRoster = async (roster, options, transaction) => {
  const {
    shift_template,
    start_date,
    end_date,
    auto_assign_staff,
    assignment_strategy,
    prefer_full_time,
    max_consecutive_days,
    min_rest_hours
  } = options;

  // Define shift templates
  const shiftTemplates = {
    standard: [
      { shift_type: 'day', start_time: '09:00', end_time: '17:00', required_staff: 2 },
      { shift_type: 'night', start_time: '17:00', end_time: '01:00', required_staff: 1 }
    ],
    '24hour': [
      { shift_type: 'day', start_time: '06:00', end_time: '14:00', required_staff: 3 },
      { shift_type: 'day', start_time: '14:00', end_time: '22:00', required_staff: 2 },
      { shift_type: 'night', start_time: '22:00', end_time: '06:00', required_staff: 1 }
    ],
    weekend: [
      { shift_type: 'weekend', start_time: '10:00', end_time: '18:00', required_staff: 2 }
    ]
  };

  const template = shiftTemplates[shift_template] || shiftTemplates.standard;

  // Generate shifts for each day in the date range
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  const shifts = [];

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Skip weekends for standard template unless it's weekend template
    if (shift_template === 'standard' && (dayOfWeek === 0 || dayOfWeek === 6)) {
      continue;
    }

    // Create shifts for this day based on template
    for (const shiftTemplate of template) {
      const shift = await Shift.create({
        roster_id: roster.id,
        date: dateStr,
        shift_type: shiftTemplate.shift_type,
        start_time: shiftTemplate.start_time,
        end_time: shiftTemplate.end_time,
        required_staff: shiftTemplate.required_staff,
        assigned_staff: 0,
        title: `${shiftTemplate.shift_type.charAt(0).toUpperCase() + shiftTemplate.shift_type.slice(1)} Shift`,
        description: `Auto-generated ${shiftTemplate.shift_type} shift`,
        location: 'Main Office',
        status: 'open'
      }, { transaction });

      shifts.push(shift);
    }
  }

  // If auto-assign is enabled, assign staff to shifts
  if (auto_assign_staff && shifts.length > 0) {
    await autoAssignStaffToShifts(shifts, roster.department_id, {
      assignment_strategy,
      prefer_full_time,
      max_consecutive_days,
      min_rest_hours
    }, transaction);
  }

  return shifts;
};

/**
 * Auto-assign staff to shifts based on strategy with department-wide balanced distribution
 */
const autoAssignStaffToShifts = async (shifts, departmentId, options, transaction) => {
  const { assignment_strategy, prefer_full_time } = options;

  // Get employees from the specific department only (excluding managers)
  const employees = await User.findAll({
    where: {
      department_id: departmentId,
      role: 'employee', // Only employees, no managers
      is_active: true
    },
    attributes: ['id', 'full_name', 'email', 'role', 'department_id'],
    include: [
      {
        model: Department,
        as: 'department',
        attributes: ['id', 'name'],
        required: false
      }
    ],
    transaction
  });

  if (employees.length === 0) {
    console.log('No employees found for auto-assignment');
    return;
  }

  console.log(`Auto-assigning ${shifts.length} shifts to ${employees.length} employees from department`);

  // Track workload for balanced distribution
  const workloadTracker = {};
  employees.forEach(emp => {
    workloadTracker[emp.id] = 0;
  });

  // Balanced round-robin assignment
  for (const shift of shifts) {
    const assignmentsNeeded = shift.required_staff;
    let assigned = 0;

    // Sort employees by current workload (least assigned first)
    const sortedEmployees = employees.sort((a, b) => {
      const aWorkload = workloadTracker[a.id];
      const bWorkload = workloadTracker[b.id];
      if (aWorkload === bWorkload) {
        return Math.random() - 0.5; // Random for fairness
      }
      return aWorkload - bWorkload;
    });

    for (const employee of sortedEmployees) {
      if (assigned >= assignmentsNeeded) break;

      try {
        await ShiftAssignment.create({
          shift_id: shift.id,
          employee_id: employee.id,
          status: 'assigned',
          assigned_by: null, // Auto-assigned
          assigned_at: new Date(),
          notes: `Auto-assigned (department-wide balanced)`
        }, { transaction });

        // Update shift assigned_staff count
        await shift.update({
          assigned_staff: shift.assigned_staff + 1
        }, { transaction });

        // Update workload tracker
        workloadTracker[employee.id]++;
        assigned++;

        console.log(`✓ Assigned ${employee.full_name} to shift ${shift.id} [Workload: ${workloadTracker[employee.id]}]`);

      } catch (error) {
        console.log(`Failed to assign ${employee.full_name} to shift ${shift.id}:`, error.message);
      }
    }

    if (assigned < assignmentsNeeded) {
      console.log(`⚠ Shift ${shift.id} is understaffed: ${assigned}/${assignmentsNeeded}`);
    }
  }

  // Log final workload distribution
  const workloadStats = Object.entries(workloadTracker)
    .map(([empId, workload]) => {
      const emp = employees.find(e => e.id == empId);
      return { name: emp?.full_name, workload };
    })
    .sort((a, b) => b.workload - a.workload);

  console.log('Final workload distribution:', workloadStats.slice(0, 10)); // Show top 10
};

module.exports = {
  getRosters,
  getRoster,
  createRoster,
  updateRoster,
  deleteRoster,
  updateRosterStatus,
  copyRoster
};
