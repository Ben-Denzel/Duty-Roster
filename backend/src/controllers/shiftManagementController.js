const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Roster = require('../models/Roster');
const Shift = require('../models/Shift');
const ShiftAssignment = require('../models/ShiftAssignment');
const User = require('../models/User');
const Department = require('../models/Department');

/**
 * Create a complete roster with shifts
 * This is the main function that creates a roster and populates it with shifts
 */
const createRosterWithShifts = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      description,
      department_id,
      start_date,
      end_date,
      shift_template = 'standard', // standard, hospital, security
      auto_generate_shifts = true,
      auto_assign_staff = false,
      assignment_strategy = 'balanced', // balanced, seniority, availability, random
      prefer_full_time = true,
      avoid_consecutive_nights = true,
      max_shifts_per_person = null
    } = req.body;

    // Validation
    if (!name || !department_id || !start_date || !end_date) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name, department_id, start_date, and end_date are required'
      });
    }

    // Verify department exists and user has access
    const department = await Department.findByPk(department_id);
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

    // Create the roster
    const roster = await Roster.create({
      name,
      description,
      department_id,
      start_date,
      end_date,
      created_by: req.user.id,
      status: 'draft',
      settings: {
        shift_template,
        auto_assign: false,
        allow_overtime: true,
        max_consecutive_days: 5
      },
      metadata: {
        total_shifts: 0,
        assigned_shifts: 0,
        coverage_percentage: 0,
        last_modified_by: req.user.id,
        last_modified_at: new Date()
      }
    }, { transaction });

    let shifts = [];

    // Auto-generate shifts if requested
    if (auto_generate_shifts) {
      shifts = await generateShiftsForRoster(roster, shift_template, transaction);
    }

    // Auto-assign staff if requested
    let assignmentResults = null;
    if (auto_assign_staff && shifts.length > 0) {
      assignmentResults = await autoAssignStaffToRoster(
        roster,
        shifts,
        {
          strategy: assignment_strategy,
          prefer_full_time,
          avoid_consecutive_nights,
          max_shifts_per_person
        },
        transaction
      );
    }

    await transaction.commit();

    // Fetch the complete roster with shifts
    const completeRoster = await Roster.findByPk(roster.id, {
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
          attributes: ['id', 'date', 'start_time', 'end_time', 'shift_type', 'title', 'required_staff', 'assigned_staff'],
          required: false
        }
      ]
    });

    res.status(201).json({
      message: 'Roster created successfully with shifts',
      roster: completeRoster,
      shifts_created: shifts.length,
      auto_assignment: assignmentResults ? {
        enabled: true,
        assignments_created: assignmentResults.assignments_created,
        coverage_achieved: assignmentResults.coverage_percentage,
        strategy_used: assignment_strategy,
        conflicts_detected: assignmentResults.conflicts.length,
        unassigned_shifts: assignmentResults.unassigned_shifts
      } : { enabled: false }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create roster with shifts error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create roster with shifts',
      details: error.message
    });
  }
};

/**
 * Generate shifts for a roster based on template
 */
const generateShiftsForRoster = async (roster, template, transaction) => {
  const shifts = [];
  const startDate = new Date(roster.start_date);
  const endDate = new Date(roster.end_date);

  // Define shift templates
  const shiftTemplates = {
    standard: [
      { name: 'Morning Shift', start_time: '08:00', end_time: '16:00', shift_type: 'day', required_staff: 2 },
      { name: 'Evening Shift', start_time: '16:00', end_time: '00:00', shift_type: 'evening', required_staff: 2 },
      { name: 'Night Shift', start_time: '00:00', end_time: '08:00', shift_type: 'night', required_staff: 1 }
    ],
    hospital: [
      { name: 'Day Shift', start_time: '07:00', end_time: '19:00', shift_type: 'day', required_staff: 4 },
      { name: 'Night Shift', start_time: '19:00', end_time: '07:00', shift_type: 'night', required_staff: 2 }
    ],
    security: [
      { name: 'Day Security', start_time: '06:00', end_time: '18:00', shift_type: 'day', required_staff: 2 },
      { name: 'Night Security', start_time: '18:00', end_time: '06:00', shift_type: 'night', required_staff: 1 }
    ]
  };

  const selectedTemplate = shiftTemplates[template] || shiftTemplates.standard;

  // Generate shifts for each day
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateString = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    for (const shiftTemplate of selectedTemplate) {
      const shift = await Shift.create({
        roster_id: roster.id,
        date: dateString,
        start_time: shiftTemplate.start_time,
        end_time: shiftTemplate.end_time,
        shift_type: isWeekend ? 'weekend' : shiftTemplate.shift_type,
        title: shiftTemplate.name,
        description: `${shiftTemplate.name} for ${dateString}`,
        required_staff: shiftTemplate.required_staff,
        assigned_staff: 0,
        status: 'open',
        location: null,
        notes: null,
        color: getShiftColor(shiftTemplate.shift_type)
      }, { transaction });

      shifts.push(shift);
    }
  }

  // Update roster metadata
  await roster.update({
    metadata: {
      ...roster.metadata,
      total_shifts: shifts.length,
      assigned_shifts: 0,
      coverage_percentage: 0,
      last_modified_by: roster.created_by,
      last_modified_at: new Date()
    }
  }, { transaction });

  return shifts;
};

/**
 * Get shift color based on type
 */
const getShiftColor = (shiftType) => {
  const colors = {
    day: '#3B82F6',      // Blue
    evening: '#F59E0B',  // Orange
    night: '#6366F1',    // Indigo
    weekend: '#8B5CF6',  // Purple
    holiday: '#EF4444'   // Red
  };
  return colors[shiftType] || colors.day;
};

/**
 * Add a single shift to a roster
 */
const addShiftToRoster = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { roster_id } = req.params;
    const {
      date,
      start_time,
      end_time,
      shift_type,
      title,
      description,
      required_staff = 1,
      location
    } = req.body;

    // Verify roster exists and user has access
    const roster = await Roster.findByPk(roster_id, {
      include: [{
        model: Department,
        as: 'department'
      }]
    });

    if (!roster) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Roster not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== roster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this roster'
      });
    }

    // Create the shift
    const shift = await Shift.create({
      roster_id,
      date,
      start_time,
      end_time,
      shift_type,
      title: title || `${shift_type} Shift`,
      description,
      required_staff,
      assigned_staff: 0,
      status: 'open',
      location,
      color: getShiftColor(shift_type)
    }, { transaction });

    // Update roster metadata
    const totalShifts = await Shift.count({
      where: { roster_id },
      transaction
    });

    await roster.update({
      metadata: {
        ...roster.metadata,
        total_shifts: totalShifts,
        last_modified_by: req.user.id,
        last_modified_at: new Date()
      }
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Shift added successfully',
      shift
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Add shift error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add shift'
    });
  }
};

/**
 * Get all shifts for a roster
 */
const getRosterShifts = async (req, res) => {
  try {
    const { roster_id } = req.params;
    const { date, shift_type, status } = req.query;

    const whereClause = { roster_id };
    
    if (date) whereClause.date = date;
    if (shift_type) whereClause.shift_type = shift_type;
    if (status) whereClause.status = status;

    const shifts = await Shift.findAll({
      where: whereClause,
      include: [
        {
          model: ShiftAssignment,
          as: 'assignments',
          include: [{
            model: User,
            as: 'employee',
            attributes: ['id', 'full_name', 'email']
          }],
          required: false
        }
      ],
      order: [['date', 'ASC'], ['start_time', 'ASC']]
    });

    res.json({
      message: 'Shifts retrieved successfully',
      shifts,
      total: shifts.length
    });

  } catch (error) {
    console.error('Get roster shifts error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve shifts'
    });
  }
};

/**
 * Automatically assign staff to roster shifts using intelligent algorithms
 */
const autoAssignStaffToRoster = async (roster, shifts, options, transaction) => {
  const { strategy, prefer_full_time, avoid_consecutive_nights, max_shifts_per_person } = options;

  try {
    // Get available staff for the department
    const availableStaff = await User.findAll({
      where: {
        department_id: roster.department_id,
        is_active: true
      },
      attributes: ['id', 'full_name', 'email', 'role', 'created_at'],
      transaction
    });

    if (availableStaff.length === 0) {
      return {
        assignments_created: 0,
        coverage_percentage: 0,
        conflicts: [],
        unassigned_shifts: shifts.length,
        message: 'No available staff found in department'
      };
    }

    console.log(`Auto-assigning staff using ${strategy} strategy for ${shifts.length} shifts with ${availableStaff.length} staff members`);

    // Sort staff based on strategy
    const sortedStaff = sortStaffByStrategy(availableStaff, strategy);

    // Group shifts by date for better assignment logic
    const shiftsByDate = groupShiftsByDate(shifts);

    // Track assignments and workload
    const staffWorkload = {};
    const assignments = [];
    const conflicts = [];
    let assignmentsCreated = 0;

    // Initialize staff workload tracking
    sortedStaff.forEach(staff => {
      staffWorkload[staff.id] = {
        shifts_assigned: 0,
        consecutive_days: 0,
        last_shift_date: null,
        last_shift_type: null,
        weekly_hours: 0
      };
    });

    // Process each date
    for (const [date, dateShifts] of Object.entries(shiftsByDate)) {
      console.log(`Processing ${dateShifts.length} shifts for date: ${date}`);

      // Sort shifts by priority (day shifts first, then evening, then night)
      const sortedShifts = dateShifts.sort((a, b) => {
        const priority = { day: 1, evening: 2, night: 3 };
        return (priority[a.shift_type] || 4) - (priority[b.shift_type] || 4);
      });

      for (const shift of sortedShifts) {
        const requiredStaff = shift.required_staff;
        let assignedToShift = 0;

        console.log(`Assigning staff to ${shift.title} on ${date} (needs ${requiredStaff} staff)`);

        // Try to assign staff to this shift
        for (const staff of sortedStaff) {
          if (assignedToShift >= requiredStaff) break;

          // Check if this staff member can be assigned
          const canAssign = await canAssignStaffToShift(
            staff,
            shift,
            staffWorkload[staff.id],
            options,
            transaction
          );

          if (canAssign.allowed) {
            try {
              // Create the assignment
              const assignment = await ShiftAssignment.create({
                shift_id: shift.id,
                employee_id: staff.id,
                role: determineStaffRole(staff),
                status: 'assigned',
                assigned_by: roster.created_by,
                assigned_at: new Date(),
                notes: `Auto-assigned using ${strategy} strategy`
              }, { transaction });

              // Update shift assigned_staff count
              await shift.increment('assigned_staff', { transaction });

              // Update staff workload tracking
              updateStaffWorkload(staffWorkload[staff.id], shift, date);

              assignments.push(assignment);
              assignedToShift++;
              assignmentsCreated++;

              console.log(`✓ Assigned ${staff.full_name} to ${shift.title} on ${date}`);

            } catch (error) {
              console.error(`Failed to assign ${staff.full_name} to shift ${shift.id}:`, error.message);
              conflicts.push({
                staff_id: staff.id,
                shift_id: shift.id,
                error: error.message
              });
            }
          } else {
            console.log(`✗ Cannot assign ${staff.full_name} to ${shift.title}: ${canAssign.reason}`);
          }
        }

        // Log assignment results for this shift
        if (assignedToShift < requiredStaff) {
          console.log(`⚠ Shift ${shift.title} on ${date} is understaffed: ${assignedToShift}/${requiredStaff}`);
        }
      }
    }

    // Calculate final statistics
    const totalRequiredStaff = shifts.reduce((sum, shift) => sum + shift.required_staff, 0);
    const coveragePercentage = totalRequiredStaff > 0 ? (assignmentsCreated / totalRequiredStaff) * 100 : 0;

    // Count unassigned shifts (shifts with no staff assigned)
    let unassignedShiftsCount = 0;
    for (const shift of shifts) {
      // Refresh shift data to get current assigned_staff count
      await shift.reload({ transaction });
      if (shift.assigned_staff === 0) {
        unassignedShiftsCount++;
      }
    }

    console.log(`Auto-assignment complete: ${assignmentsCreated} assignments created, ${coveragePercentage.toFixed(1)}% coverage`);

    return {
      assignments_created: assignmentsCreated,
      coverage_percentage: Math.round(coveragePercentage * 100) / 100,
      conflicts,
      unassigned_shifts: unassignedShiftsCount,
      total_shifts: shifts.length,
      staff_utilization: calculateStaffUtilization(staffWorkload, availableStaff)
    };

  } catch (error) {
    console.error('Auto-assignment error:', error);
    throw error;
  }
};

/**
 * Sort staff based on assignment strategy
 */
const sortStaffByStrategy = (staff, strategy) => {
  switch (strategy) {
    case 'seniority':
      return staff.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    case 'availability':
      // Sort by role priority (doctors first, then nurses, etc.)
      const rolePriority = { doctor: 1, nurse: 2, technician: 3, employee: 4 };
      return staff.sort((a, b) => {
        const aPriority = rolePriority[a.role] || 5;
        const bPriority = rolePriority[b.role] || 5;
        return aPriority - bPriority;
      });

    case 'random':
      return staff.sort(() => Math.random() - 0.5);

    case 'balanced':
    default:
      // Balanced approach: mix of role priority and randomness
      return staff.sort((a, b) => {
        const rolePriority = { doctor: 1, nurse: 2, technician: 3, employee: 4 };
        const aPriority = rolePriority[a.role] || 5;
        const bPriority = rolePriority[b.role] || 5;
        // Add some randomness for fairness within same role
        const aScore = aPriority + Math.random() * 0.5;
        const bScore = bPriority + Math.random() * 0.5;
        return aScore - bScore;
      });
  }
};

/**
 * Group shifts by date
 */
const groupShiftsByDate = (shifts) => {
  return shifts.reduce((groups, shift) => {
    const date = shift.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(shift);
    return groups;
  }, {});
};

/**
 * Check if staff can be assigned to a shift
 */
const canAssignStaffToShift = async (staff, shift, workload, options, transaction) => {
  const { avoid_consecutive_nights, max_shifts_per_person } = options;

  // Check max shifts per person limit
  if (max_shifts_per_person && workload.shifts_assigned >= max_shifts_per_person) {
    return { allowed: false, reason: `Exceeds max shifts limit (${max_shifts_per_person})` };
  }

  // Check consecutive nights rule
  if (avoid_consecutive_nights &&
      shift.shift_type === 'night' &&
      workload.last_shift_type === 'night' &&
      workload.last_shift_date) {

    const lastDate = new Date(workload.last_shift_date);
    const currentDate = new Date(shift.date);
    const daysDiff = (currentDate - lastDate) / (1000 * 60 * 60 * 24);

    if (daysDiff <= 1) {
      return { allowed: false, reason: 'Consecutive night shifts not allowed' };
    }
  }

  // Check for existing assignment to this shift
  const existingAssignment = await ShiftAssignment.findOne({
    where: {
      shift_id: shift.id,
      employee_id: staff.id
    },
    transaction
  });

  if (existingAssignment) {
    return { allowed: false, reason: 'Already assigned to this shift' };
  }

  // Check for time conflicts on the same date
  const conflictingAssignments = await ShiftAssignment.findAll({
    where: { employee_id: staff.id },
    include: [{
      model: Shift,
      as: 'shift',
      where: {
        date: shift.date,
        id: { [Op.ne]: shift.id }
      }
    }],
    transaction
  });

  for (const assignment of conflictingAssignments) {
    if (isTimeOverlap(assignment.shift, shift)) {
      return { allowed: false, reason: 'Time conflict with another shift' };
    }
  }

  return { allowed: true, reason: 'No conflicts detected' };
};

/**
 * Check if two shifts have overlapping times
 */
const isTimeOverlap = (shift1, shift2) => {
  const start1 = new Date(`2000-01-01T${shift1.start_time}`);
  const end1 = new Date(`2000-01-01T${shift1.end_time}`);
  const start2 = new Date(`2000-01-01T${shift2.start_time}`);
  const end2 = new Date(`2000-01-01T${shift2.end_time}`);

  // Handle overnight shifts
  if (end1 < start1) end1.setDate(end1.getDate() + 1);
  if (end2 < start2) end2.setDate(end2.getDate() + 1);

  return start1 < end2 && start2 < end1;
};

/**
 * Update staff workload tracking
 */
const updateStaffWorkload = (workload, shift, date) => {
  workload.shifts_assigned++;
  workload.last_shift_date = date;
  workload.last_shift_type = shift.shift_type;

  // Calculate shift hours
  const start = new Date(`2000-01-01T${shift.start_time}`);
  const end = new Date(`2000-01-01T${shift.end_time}`);
  if (end < start) end.setDate(end.getDate() + 1);
  const hours = (end - start) / (1000 * 60 * 60);

  workload.weekly_hours += hours;
};

/**
 * Determine staff role based on their profile
 */
const determineStaffRole = (staff) => {
  const roleMapping = {
    'doctor': 'doctor',
    'nurse': 'nurse',
    'technician': 'technician',
    'manager': 'supervisor'
  };

  return roleMapping[staff.role] || 'staff';
};

/**
 * Calculate staff utilization statistics
 */
const calculateStaffUtilization = (staffWorkload, availableStaff) => {
  const utilization = {};

  availableStaff.forEach(staff => {
    const workload = staffWorkload[staff.id];
    utilization[staff.id] = {
      name: staff.full_name,
      role: staff.role,
      shifts_assigned: workload.shifts_assigned,
      weekly_hours: Math.round(workload.weekly_hours * 100) / 100,
      // Assume 40 hours as standard full-time
      utilization_percentage: Math.round((workload.weekly_hours / 40) * 100)
    };
  });

  return utilization;
};

module.exports = {
  createRosterWithShifts,
  addShiftToRoster,
  getRosterShifts,
  generateShiftsForRoster,
  autoAssignStaffToRoster
};
