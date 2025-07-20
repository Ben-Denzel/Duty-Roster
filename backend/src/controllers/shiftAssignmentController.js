const { Shift, ShiftAssignment, User, Roster, Department, Availability } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const EventTriggerService = require('../services/EventTriggerService');

/**
 * Get all assignments for a shift
 */
const getShiftAssignments = async (req, res) => {
  try {
    const { shiftId } = req.params;

    // Find the shift and check access
    const shift = await Shift.findByPk(shiftId, {
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
      ]
    });

    if (!shift) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Shift not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== shift.roster.department.enterprise_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this shift'
      });
    }

    // Get assignments
    const assignments = await ShiftAssignment.findAll({
      where: { shift_id: shiftId },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name', 'email', 'role', 'department_id']
        },
        {
          model: User,
          as: 'assigned_by_user',
          attributes: ['id', 'full_name', 'email'],
          foreignKey: 'assigned_by',
          required: false
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json({
      message: 'Shift assignments retrieved successfully',
      assignments,
      shift: {
        id: shift.id,
        date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        required_staff: shift.required_staff,
        assigned_staff: shift.assigned_staff
      }
    });

  } catch (error) {
    console.error('Get shift assignments error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch shift assignments'
    });
  }
};

/**
 * Assign an employee to a shift
 */
const assignEmployee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { shiftId } = req.params;
    const { employee_id, role, notes } = req.body;

    // Validation
    if (!employee_id) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Employee ID is required'
      });
    }

    // Find the shift
    const shift = await Shift.findByPk(shiftId, {
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

    // Only allow assignments if roster is not published
    if (shift.roster.status === 'published') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Cannot modify assignments for published rosters'
      });
    }

    // Find the employee
    const employee = await User.findByPk(employee_id, { transaction });
    if (!employee) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Employee not found'
      });
    }

    // Check if employee belongs to the same enterprise
    if (employee.enterprise_id !== shift.roster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Employee must belong to the same enterprise'
      });
    }

    // Check if employee is already assigned to this shift
    const existingAssignment = await ShiftAssignment.findOne({
      where: {
        shift_id: shiftId,
        employee_id: employee_id
      },
      transaction
    });

    if (existingAssignment) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Conflict',
        message: 'Employee is already assigned to this shift'
      });
    }

    // Check for conflicts with other shifts on the same date
    const conflictingAssignments = await ShiftAssignment.findAll({
      where: {
        employee_id: employee_id
      },
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: shift.date,
            id: { [Op.ne]: shiftId }
          }
        }
      ],
      transaction
    });

    // Check for time conflicts
    for (const conflictAssignment of conflictingAssignments) {
      const conflictShift = conflictAssignment.shift;
      
      // Simple time overlap check
      const currentStart = shift.start_time;
      const currentEnd = shift.end_time;
      const conflictStart = conflictShift.start_time;
      const conflictEnd = conflictShift.end_time;
      
      if (timeOverlap(currentStart, currentEnd, conflictStart, conflictEnd)) {
        await transaction.rollback();
        return res.status(409).json({
          error: 'Conflict',
          message: `Employee has a conflicting shift from ${conflictStart} to ${conflictEnd} on ${shift.date}`
        });
      }
    }

    // Check shift capacity
    if (shift.assigned_staff >= shift.required_staff) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Capacity exceeded',
        message: 'Shift is already fully staffed'
      });
    }

    // Check employee availability (if availability system is being used)
    const availability = await Availability.findOne({
      where: {
        employee_id: employee_id,
        date: shift.date,
        availability_type: 'unavailable'
      },
      transaction
    });

    if (availability) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Availability conflict',
        message: 'Employee is marked as unavailable for this date'
      });
    }

    // Create the assignment
    const assignment = await ShiftAssignment.create({
      shift_id: shiftId,
      employee_id: employee_id,
      assigned_by: req.user.id,
      role: role || null,
      notes: notes || null,
      status: 'assigned'
    }, { transaction });

    // Fetch the created assignment with includes before committing
    const createdAssignment = await ShiftAssignment.findByPk(assignment.id, {
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name', 'email', 'role']
        },
        {
          model: User,
          as: 'assigned_by_user',
          attributes: ['id', 'full_name', 'email'],
          foreignKey: 'assigned_by',
          required: false
        }
      ],
      transaction
    });

    await transaction.commit();

    // Send assignment notification
    try {
      await EventTriggerService.onShiftAssigned(createdAssignment);
    } catch (notificationError) {
      console.error('Error sending assignment notification:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.status(201).json({
      message: 'Employee assigned to shift successfully',
      assignment: createdAssignment
    });

  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Assign employee error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to assign employee to shift'
    });
  }
};

/**
 * Helper function to check time overlap
 */
function timeOverlap(start1, end1, start2, end2) {
  // Convert time strings to minutes for easier comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1Min = timeToMinutes(start1);
  const end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  const end2Min = timeToMinutes(end2);

  // Handle overnight shifts (end time is less than start time)
  const end1Adjusted = end1Min < start1Min ? end1Min + 24 * 60 : end1Min;
  const end2Adjusted = end2Min < start2Min ? end2Min + 24 * 60 : end2Min;

  // Check for overlap
  return (start1Min < end2Adjusted && end1Adjusted > start2Min);
}

/**
 * Unassign an employee from a shift
 */
const unassignEmployee = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { assignmentId } = req.params;

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
              include: [
                {
                  model: Department,
                  as: 'department',
                  attributes: ['id', 'name', 'enterprise_id']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name', 'email']
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

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== assignment.shift.roster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this assignment'
      });
    }

    // Only allow unassignment if roster is not published
    if (assignment.shift.roster.status === 'published') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Cannot modify assignments for published rosters'
      });
    }

    // Send unassignment notification before deleting
    try {
      await EventTriggerService.onShiftUnassigned(assignment);
    } catch (notificationError) {
      console.error('Error sending unassignment notification:', notificationError);
      // Don't fail the request if notifications fail
    }

    // Delete the assignment
    await assignment.destroy({ transaction });

    await transaction.commit();

    res.json({
      message: 'Employee unassigned from shift successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Unassign employee error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to unassign employee from shift'
    });
  }
};

/**
 * Get available employees for a shift
 */
const getAvailableEmployees = async (req, res) => {
  try {
    const { shiftId } = req.params;

    // Find the shift
    const shift = await Shift.findByPk(shiftId, {
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
      ]
    });

    if (!shift) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Shift not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== shift.roster.department.enterprise_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this shift'
      });
    }

    // Get all employees in the same enterprise
    const allEmployees = await User.findAll({
      where: {
        enterprise_id: shift.roster.department.enterprise_id,
        role: ['employee', 'manager'],
        is_active: true
      },
      attributes: ['id', 'full_name', 'email', 'role', 'department_id']
    });

    // Get employees already assigned to this shift
    const assignedEmployees = await ShiftAssignment.findAll({
      where: { shift_id: shiftId },
      attributes: ['employee_id']
    });

    const assignedEmployeeIds = assignedEmployees.map(a => a.employee_id);

    // Get employees with conflicting shifts on the same date
    const conflictingAssignments = await ShiftAssignment.findAll({
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: shift.date,
            id: { [Op.ne]: shiftId }
          }
        }
      ],
      attributes: ['employee_id']
    });

    // Filter out conflicting employees based on time overlap
    const conflictingEmployeeIds = new Set();

    for (const conflictAssignment of conflictingAssignments) {
      const conflictShift = conflictAssignment.shift;

      if (timeOverlap(shift.start_time, shift.end_time, conflictShift.start_time, conflictShift.end_time)) {
        conflictingEmployeeIds.add(conflictAssignment.employee_id);
      }
    }

    // Get employees marked as unavailable for this date
    const unavailableEmployees = await Availability.findAll({
      where: {
        date: shift.date,
        availability_type: 'unavailable'
      },
      attributes: ['employee_id']
    });

    const unavailableEmployeeIds = unavailableEmployees.map(a => a.employee_id);

    // Filter available employees
    const availableEmployees = allEmployees.filter(employee => {
      return !assignedEmployeeIds.includes(employee.id) &&
             !conflictingEmployeeIds.has(employee.id) &&
             !unavailableEmployeeIds.includes(employee.id);
    });

    // Get preferred employees (those who marked this date as preferred)
    const preferredEmployees = await Availability.findAll({
      where: {
        date: shift.date,
        availability_type: 'preferred',
        employee_id: availableEmployees.map(e => e.id)
      },
      attributes: ['employee_id']
    });

    const preferredEmployeeIds = preferredEmployees.map(a => a.employee_id);

    // Add preference flag to employees
    const employeesWithPreference = availableEmployees.map(employee => ({
      ...employee.toJSON(),
      is_preferred: preferredEmployeeIds.includes(employee.id)
    }));

    // Sort by preference first, then by name
    employeesWithPreference.sort((a, b) => {
      if (a.is_preferred && !b.is_preferred) return -1;
      if (!a.is_preferred && b.is_preferred) return 1;
      return a.full_name.localeCompare(b.full_name);
    });

    res.json({
      message: 'Available employees retrieved successfully',
      employees: employeesWithPreference,
      shift: {
        id: shift.id,
        date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        required_staff: shift.required_staff,
        assigned_staff: shift.assigned_staff
      }
    });

  } catch (error) {
    console.error('Get available employees error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch available employees'
    });
  }
};

/**
 * Bulk assign employees to multiple shifts
 */
const bulkAssignEmployees = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { assignments } = req.body;

    // Validation
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Assignments array is required'
      });
    }

    const results = [];
    const errors = [];

    for (const assignment of assignments) {
      try {
        const { shift_id, employee_id, role, notes } = assignment;

        // Find the shift
        const shift = await Shift.findByPk(shift_id, {
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
          errors.push({
            shift_id,
            employee_id,
            error: 'Shift not found'
          });
          continue;
        }

        // Check access permissions
        if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== shift.roster.department.enterprise_id) {
          errors.push({
            shift_id,
            employee_id,
            error: 'Access denied to this shift'
          });
          continue;
        }

        // Check if employee exists
        const employee = await User.findByPk(employee_id, { transaction });
        if (!employee) {
          errors.push({
            shift_id,
            employee_id,
            error: 'Employee not found'
          });
          continue;
        }

        // Check for existing assignment
        const existingAssignment = await ShiftAssignment.findOne({
          where: {
            shift_id,
            employee_id
          },
          transaction
        });

        if (existingAssignment) {
          errors.push({
            shift_id,
            employee_id,
            error: 'Employee already assigned to this shift'
          });
          continue;
        }

        // Create the assignment
        const newAssignment = await ShiftAssignment.create({
          shift_id,
          employee_id,
          assigned_by: req.user.id,
          role: role || null,
          notes: notes || null,
          status: 'assigned'
        }, { transaction });

        results.push({
          shift_id,
          employee_id,
          assignment_id: newAssignment.id,
          status: 'success'
        });

      } catch (error) {
        errors.push({
          shift_id: assignment.shift_id,
          employee_id: assignment.employee_id,
          error: error.message
        });
      }
    }

    await transaction.commit();

    res.json({
      message: 'Bulk assignment completed',
      successful_assignments: results.length,
      failed_assignments: errors.length,
      results,
      errors
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Bulk assign employees error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to perform bulk assignment'
    });
  }
};

module.exports = {
  getShiftAssignments,
  assignEmployee,
  unassignEmployee,
  getAvailableEmployees,
  bulkAssignEmployees
};
