const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Shift = require('../models/Shift');
const ShiftAssignment = require('../models/ShiftAssignment');
const User = require('../models/User');
const Availability = require('../models/Availability');

/**
 * Conflict Detection Service
 * Detects and prevents scheduling conflicts for staff assignments
 */

/**
 * Check for conflicts before assigning staff to a shift
 */
const checkAssignmentConflicts = async (req, res) => {
  try {
    const { employee_id, shift_id } = req.body;

    if (!employee_id || !shift_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'employee_id and shift_id are required'
      });
    }

    const conflicts = await detectConflicts(employee_id, shift_id);

    res.json({
      message: 'Conflict check completed',
      has_conflicts: conflicts.length > 0,
      conflicts,
      can_assign: conflicts.filter(c => c.severity === 'blocking').length === 0
    });

  } catch (error) {
    console.error('Check assignment conflicts error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to check conflicts'
    });
  }
};

/**
 * Assign staff to shift with conflict detection
 */
const assignStaffWithConflictCheck = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { employee_id, shift_id, role, force_assign = false } = req.body;

    // Get the shift details
    const shift = await Shift.findByPk(shift_id, {
      include: [{
        model: require('../models/Roster'),
        as: 'roster',
        include: [{
          model: require('../models/Department'),
          as: 'department'
        }]
      }]
    });

    if (!shift) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Shift not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'systemAdmin' && 
        req.user.enterprise_id !== shift.roster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this shift'
      });
    }

    // Check if shift is already full
    const currentAssignments = await ShiftAssignment.count({
      where: { shift_id },
      transaction
    });

    if (currentAssignments >= shift.required_staff) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Shift full',
        message: 'This shift is already fully staffed'
      });
    }

    // Check for conflicts
    const conflicts = await detectConflicts(employee_id, shift_id);
    const blockingConflicts = conflicts.filter(c => c.severity === 'blocking');

    if (blockingConflicts.length > 0 && !force_assign) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Scheduling conflict',
        message: 'Cannot assign due to scheduling conflicts',
        conflicts: blockingConflicts,
        can_force: req.user.role === 'systemAdmin' || req.user.role === 'enterpriseAdmin'
      });
    }

    // Check if already assigned
    const existingAssignment = await ShiftAssignment.findOne({
      where: { employee_id, shift_id },
      transaction
    });

    if (existingAssignment) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Already assigned',
        message: 'Employee is already assigned to this shift'
      });
    }

    // Create the assignment
    const assignment = await ShiftAssignment.create({
      shift_id,
      employee_id,
      role: role || 'staff',
      status: 'assigned',
      assigned_by: req.user.id,
      assigned_at: new Date(),
      notes: force_assign ? 'Force assigned despite conflicts' : null
    }, { transaction });

    // Update shift assigned_staff count
    await shift.increment('assigned_staff', { transaction });

    await transaction.commit();

    // Fetch the complete assignment
    const completeAssignment = await ShiftAssignment.findByPk(assignment.id, {
      include: [
        {
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name', 'email', 'role']
        },
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'date', 'start_time', 'end_time', 'title', 'shift_type']
        }
      ]
    });

    res.status(201).json({
      message: 'Staff assigned successfully',
      assignment: completeAssignment,
      conflicts: conflicts.filter(c => c.severity === 'warning'),
      forced: force_assign && blockingConflicts.length > 0
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Assign staff with conflict check error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to assign staff'
    });
  }
};

/**
 * Get all conflicts for a department or roster
 */
const getConflicts = async (req, res) => {
  try {
    const { department_id, roster_id, employee_id } = req.query;

    let whereClause = {};
    let includeClause = [];

    if (roster_id) {
      whereClause.roster_id = roster_id;
    }

    if (department_id) {
      includeClause.push({
        model: require('../models/Roster'),
        as: 'roster',
        where: { department_id },
        include: [{
          model: require('../models/Department'),
          as: 'department'
        }]
      });
    }

    // Get all shifts in the scope
    const shifts = await Shift.findAll({
      where: whereClause,
      include: [
        ...includeClause,
        {
          model: ShiftAssignment,
          as: 'assignments',
          include: [{
            model: User,
            as: 'employee',
            attributes: ['id', 'full_name', 'email', 'role']
          }],
          required: false
        }
      ]
    });

    // Detect conflicts for all assignments
    const allConflicts = [];
    
    for (const shift of shifts) {
      for (const assignment of shift.assignments) {
        if (!employee_id || assignment.employee_id == employee_id) {
          const conflicts = await detectConflicts(assignment.employee_id, shift.id);
          allConflicts.push(...conflicts.map(conflict => ({
            ...conflict,
            assignment_id: assignment.id,
            shift_id: shift.id,
            employee: assignment.employee
          })));
        }
      }
    }

    // Remove duplicates and sort by severity
    const uniqueConflicts = allConflicts.filter((conflict, index, self) =>
      index === self.findIndex(c => c.id === conflict.id)
    ).sort((a, b) => {
      const severityOrder = { blocking: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    res.json({
      message: 'Conflicts retrieved successfully',
      conflicts: uniqueConflicts,
      total: uniqueConflicts.length,
      blocking: uniqueConflicts.filter(c => c.severity === 'blocking').length,
      warnings: uniqueConflicts.filter(c => c.severity === 'warning').length
    });

  } catch (error) {
    console.error('Get conflicts error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve conflicts'
    });
  }
};

/**
 * Core conflict detection logic
 */
const detectConflicts = async (employeeId, shiftId) => {
  const conflicts = [];

  try {
    // Get the target shift
    const targetShift = await Shift.findByPk(shiftId);
    if (!targetShift) {
      return conflicts;
    }

    // Get employee details
    const employee = await User.findByPk(employeeId);
    if (!employee) {
      return conflicts;
    }

    // 1. Check for time overlap conflicts
    const overlappingAssignments = await ShiftAssignment.findAll({
      where: { employee_id: employeeId },
      include: [{
        model: Shift,
        as: 'shift',
        where: {
          date: targetShift.date,
          id: { [Op.ne]: shiftId },
          [Op.or]: [
            {
              start_time: { [Op.lt]: targetShift.end_time },
              end_time: { [Op.gt]: targetShift.start_time }
            }
          ]
        }
      }]
    });

    for (const assignment of overlappingAssignments) {
      conflicts.push({
        id: `overlap_${assignment.id}`,
        type: 'Time Overlap',
        severity: 'blocking',
        description: `Employee is already assigned to another shift during this time`,
        details: `Conflicts with ${assignment.shift.title} (${assignment.shift.start_time} - ${assignment.shift.end_time})`,
        shift_id: assignment.shift.id,
        assignment_id: assignment.id
      });
    }

    // 2. Check availability preferences
    const availability = await Availability.findOne({
      where: {
        employee_id: employeeId,
        date: targetShift.date,
        availability_type: 'unavailable'
      }
    });

    if (availability) {
      conflicts.push({
        id: `availability_${availability.id}`,
        type: 'Availability Conflict',
        severity: 'warning',
        description: 'Employee marked as unavailable for this date',
        details: availability.reason || 'No reason provided',
        availability_id: availability.id
      });
    }

    // 3. Check maximum consecutive days
    const maxConsecutiveDays = 5; // This could be configurable
    const consecutiveDays = await getConsecutiveDaysWorked(employeeId, targetShift.date);
    
    if (consecutiveDays >= maxConsecutiveDays) {
      conflicts.push({
        id: `consecutive_${employeeId}_${targetShift.date}`,
        type: 'Consecutive Days Limit',
        severity: 'warning',
        description: `Employee would exceed maximum consecutive working days (${maxConsecutiveDays})`,
        details: `Currently scheduled for ${consecutiveDays} consecutive days`,
        consecutive_days: consecutiveDays
      });
    }

    // 4. Check weekly hour limits
    const weeklyHours = await getWeeklyHours(employeeId, targetShift.date);
    const shiftHours = calculateShiftHours(targetShift);
    const maxWeeklyHours = employee.max_weekly_hours || 40;

    if (weeklyHours + shiftHours > maxWeeklyHours) {
      conflicts.push({
        id: `hours_${employeeId}_${targetShift.date}`,
        type: 'Weekly Hours Limit',
        severity: 'warning',
        description: `Assignment would exceed weekly hour limit (${maxWeeklyHours}h)`,
        details: `Current: ${weeklyHours}h + Shift: ${shiftHours}h = ${weeklyHours + shiftHours}h`,
        weekly_hours: weeklyHours,
        shift_hours: shiftHours,
        total_hours: weeklyHours + shiftHours
      });
    }

    // 5. Check minimum rest time between shifts
    const minRestHours = 8; // Minimum 8 hours between shifts
    const previousShift = await getLastShiftBefore(employeeId, targetShift.date, targetShift.start_time);
    
    if (previousShift) {
      const restHours = calculateRestTime(previousShift, targetShift);
      if (restHours < minRestHours) {
        conflicts.push({
          id: `rest_${previousShift.id}_${shiftId}`,
          type: 'Insufficient Rest Time',
          severity: 'blocking',
          description: `Insufficient rest time between shifts (minimum ${minRestHours}h required)`,
          details: `Only ${restHours.toFixed(1)}h rest between shifts`,
          previous_shift_id: previousShift.id,
          rest_hours: restHours
        });
      }
    }

  } catch (error) {
    console.error('Conflict detection error:', error);
    conflicts.push({
      id: `error_${Date.now()}`,
      type: 'Detection Error',
      severity: 'warning',
      description: 'Error occurred during conflict detection',
      details: error.message
    });
  }

  return conflicts;
};

/**
 * Helper functions
 */
const getConsecutiveDaysWorked = async (employeeId, targetDate) => {
  const date = new Date(targetDate);
  let consecutiveDays = 0;
  
  // Check backwards from target date
  for (let i = 1; i <= 10; i++) { // Check up to 10 days back
    const checkDate = new Date(date);
    checkDate.setDate(checkDate.getDate() - i);
    
    const hasShift = await ShiftAssignment.findOne({
      include: [{
        model: Shift,
        as: 'shift',
        where: { date: checkDate.toISOString().split('T')[0] }
      }],
      where: { employee_id: employeeId }
    });
    
    if (hasShift) {
      consecutiveDays++;
    } else {
      break;
    }
  }
  
  return consecutiveDays;
};

const getWeeklyHours = async (employeeId, targetDate) => {
  const date = new Date(targetDate);
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const assignments = await ShiftAssignment.findAll({
    where: { employee_id: employeeId },
    include: [{
      model: Shift,
      as: 'shift',
      where: {
        date: {
          [Op.between]: [
            weekStart.toISOString().split('T')[0],
            weekEnd.toISOString().split('T')[0]
          ]
        }
      }
    }]
  });
  
  return assignments.reduce((total, assignment) => {
    return total + calculateShiftHours(assignment.shift);
  }, 0);
};

const getLastShiftBefore = async (employeeId, targetDate, targetTime) => {
  const assignments = await ShiftAssignment.findAll({
    where: { employee_id: employeeId },
    include: [{
      model: Shift,
      as: 'shift',
      where: {
        [Op.or]: [
          { date: { [Op.lt]: targetDate } },
          {
            date: targetDate,
            end_time: { [Op.lte]: targetTime }
          }
        ]
      }
    }],
    order: [['shift', 'date', 'DESC'], ['shift', 'end_time', 'DESC']],
    limit: 1
  });
  
  return assignments.length > 0 ? assignments[0].shift : null;
};

const calculateShiftHours = (shift) => {
  const start = new Date(`2000-01-01T${shift.start_time}`);
  const end = new Date(`2000-01-01T${shift.end_time}`);
  
  // Handle overnight shifts
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

const calculateRestTime = (previousShift, nextShift) => {
  const prevEnd = new Date(`${previousShift.date}T${previousShift.end_time}`);
  const nextStart = new Date(`${nextShift.date}T${nextShift.start_time}`);
  
  return (nextStart.getTime() - prevEnd.getTime()) / (1000 * 60 * 60);
};

module.exports = {
  checkAssignmentConflicts,
  assignStaffWithConflictCheck,
  getConflicts,
  detectConflicts
};
