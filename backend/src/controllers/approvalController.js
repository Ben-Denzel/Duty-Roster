const { Roster, Department, User, Shift, ShiftAssignment } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const EventTriggerService = require('../services/EventTriggerService');

/**
 * Get pending approvals for a manager
 */
const getPendingApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Check if user is a manager
    if (req.user.role !== 'manager' && req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only managers can view pending approvals'
      });
    }

    // Build where clause based on user role
    let whereClause = { status: 'review' };
    
    if (req.user.role === 'manager') {
      // Managers can only see rosters for their department
      whereClause.department_id = req.user.department_id;
    } else if (req.user.role === 'systemAdmin') {
      // System admins can see all pending approvals
      // No additional filter needed
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Fetch pending rosters
    const { count, rows: rosters } = await Roster.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id'],
          where: req.user.role === 'systemAdmin' ? {} : { enterprise_id: req.user.enterprise_id }
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Shift,
          as: 'shifts',
          attributes: ['id', 'date', 'shift_type', 'required_staff', 'assigned_staff'],
          required: false
        }
      ],
      order: [['created_at', 'ASC']], // Oldest first for approval queue
      limit: parseInt(limit),
      offset: offset
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / limit);

    // Calculate summary statistics
    const summaryStats = await Promise.all(
      rosters.map(async (roster) => {
        const totalShifts = roster.shifts.length;
        const fullyStaffedShifts = roster.shifts.filter(shift => shift.assigned_staff >= shift.required_staff).length;
        const coveragePercentage = totalShifts > 0 ? Math.round((fullyStaffedShifts / totalShifts) * 100) : 0;
        
        return {
          ...roster.toJSON(),
          summary: {
            total_shifts: totalShifts,
            fully_staffed_shifts: fullyStaffedShifts,
            coverage_percentage: coveragePercentage
          }
        };
      })
    );

    res.json({
      message: 'Pending approvals retrieved successfully',
      rosters: summaryStats,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch pending approvals'
    });
  }
};

/**
 * Approve a roster
 */
const approveRoster = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { rosterId } = req.params;
    const { notes, conditions } = req.body;

    // Find the roster
    const roster = await Roster.findByPk(rosterId, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id', 'manager_id']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
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

    // Check if roster is in review status
    if (roster.status !== 'review') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Roster must be in review status to be approved'
      });
    }

    // Check access permissions
    if (req.user.role === 'manager') {
      // Manager can only approve rosters for their department
      if (req.user.department_id !== roster.department_id || req.user.id !== roster.department.manager_id) {
        await transaction.rollback();
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only approve rosters for your department'
        });
      }
    } else if (req.user.role !== 'systemAdmin') {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only managers and system administrators can approve rosters'
      });
    }

    // Update roster status to approved
    await roster.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date(),
      metadata: {
        ...roster.metadata,
        approval_notes: notes || null,
        approval_conditions: conditions || null,
        approved_by_name: req.user.full_name,
        approved_at: new Date()
      }
    }, { 
      transaction,
      user_id: req.user.id
    });

    await transaction.commit();

    // Fetch updated roster
    const updatedRoster = await Roster.findByPk(rosterId, {
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
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    // Send approval notification
    try {
      await EventTriggerService.onRosterApproved(updatedRoster);
    } catch (notificationError) {
      console.error('Error sending approval notification:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.json({
      message: 'Roster approved successfully',
      roster: updatedRoster
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Approve roster error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to approve roster'
    });
  }
};

/**
 * Reject a roster
 */
const rejectRoster = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { rosterId } = req.params;
    const { notes, required_changes } = req.body;

    // Validation
    if (!notes) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Rejection notes are required'
      });
    }

    // Find the roster
    const roster = await Roster.findByPk(rosterId, {
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'enterprise_id', 'manager_id']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
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

    // Check if roster is in review status
    if (roster.status !== 'review') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Roster must be in review status to be rejected'
      });
    }

    // Check access permissions
    if (req.user.role === 'manager') {
      // Manager can only reject rosters for their department
      if (req.user.department_id !== roster.department_id || req.user.id !== roster.department.manager_id) {
        await transaction.rollback();
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only reject rosters for your department'
        });
      }
    } else if (req.user.role !== 'systemAdmin') {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only managers and system administrators can reject rosters'
      });
    }

    // Update roster status back to draft with rejection notes
    await roster.update({
      status: 'draft',
      metadata: {
        ...roster.metadata,
        rejection_notes: notes,
        required_changes: required_changes || null,
        rejected_by: req.user.id,
        rejected_by_name: req.user.full_name,
        rejected_at: new Date(),
        rejection_count: (roster.metadata?.rejection_count || 0) + 1
      }
    }, { 
      transaction,
      user_id: req.user.id
    });

    await transaction.commit();

    // Fetch updated roster
    const updatedRoster = await Roster.findByPk(rosterId, {
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
        }
      ]
    });

    // Send rejection notification
    try {
      await EventTriggerService.onRosterRejected(updatedRoster, notes);
    } catch (notificationError) {
      console.error('Error sending rejection notification:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.json({
      message: 'Roster rejected and returned to draft status',
      roster: updatedRoster
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Reject roster error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reject roster'
    });
  }
};

/**
 * Get approval history for a roster
 */
const getApprovalHistory = async (req, res) => {
  try {
    const { rosterId } = req.params;

    // Find the roster
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

    // Extract approval history from metadata
    const metadata = roster.metadata || {};
    const history = [];

    // Add creation event
    history.push({
      action: 'created',
      timestamp: roster.created_at,
      user: metadata.created_by_name || 'Unknown',
      notes: 'Roster created'
    });

    // Add submission for review event
    if (roster.status !== 'draft') {
      history.push({
        action: 'submitted_for_review',
        timestamp: metadata.submitted_for_review_at || roster.updated_at,
        user: metadata.submitted_by_name || 'Unknown',
        notes: 'Submitted for manager review'
      });
    }

    // Add rejection events
    if (metadata.rejection_count > 0) {
      history.push({
        action: 'rejected',
        timestamp: metadata.rejected_at,
        user: metadata.rejected_by_name || 'Unknown',
        notes: metadata.rejection_notes || 'No notes provided',
        required_changes: metadata.required_changes
      });
    }

    // Add approval event
    if (roster.approved_at) {
      history.push({
        action: 'approved',
        timestamp: roster.approved_at,
        user: metadata.approved_by_name || 'Unknown',
        notes: metadata.approval_notes || 'No notes provided',
        conditions: metadata.approval_conditions
      });
    }

    // Add publication event
    if (roster.published_at) {
      history.push({
        action: 'published',
        timestamp: roster.published_at,
        user: metadata.published_by_name || 'Unknown',
        notes: 'Roster published to employees'
      });
    }

    // Sort by timestamp
    history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      message: 'Approval history retrieved successfully',
      history,
      roster: {
        id: roster.id,
        name: roster.name,
        status: roster.status,
        current_rejection_count: metadata.rejection_count || 0
      }
    });

  } catch (error) {
    console.error('Get approval history error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch approval history'
    });
  }
};

/**
 * Submit roster for approval with enhanced workflow
 */
const submitForApproval = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { roster_id } = req.params;
    const { message, priority = 'normal', approval_type = 'standard' } = req.body;

    // Get roster with complete details
    const roster = await Roster.findByPk(roster_id, {
      include: [
        {
          model: Department,
          as: 'department'
        },
        {
          model: Shift,
          as: 'shifts',
          include: [{
            model: ShiftAssignment,
            as: 'assignments',
            include: [{
              model: User,
              as: 'employee',
              attributes: ['id', 'full_name', 'role']
            }]
          }]
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

    // Check permissions
    if (req.user.role !== 'systemAdmin' &&
        req.user.enterprise_id !== roster.department.enterprise_id) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this roster'
      });
    }

    // Check if roster is in correct status
    if (!['draft', 'rejected'].includes(roster.status)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Only draft or rejected rosters can be submitted for approval'
      });
    }

    // Validate roster completeness
    const validation = validateRosterForApproval(roster);
    if (!validation.isValid && approval_type !== 'force') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Roster validation failed',
        issues: validation.issues,
        can_force: req.user.role === 'systemAdmin'
      });
    }

    // Calculate roster statistics
    const stats = calculateRosterStats(roster);

    // Update roster status
    await roster.update({
      status: 'review',
      metadata: {
        ...roster.metadata,
        submitted_for_approval_at: new Date(),
        submitted_by: req.user.id,
        approval_statistics: stats,
        approval_message: message,
        approval_priority: priority
      }
    }, { transaction });

    await transaction.commit();

    // Send approval request notification
    try {
      const rosterWithIncludes = await Roster.findByPk(roster.id, {
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name', 'enterprise_id']
          },
          { model: User, as: 'creator' }
        ]
      });
      await EventTriggerService.onRosterNeedsApproval(rosterWithIncludes);
    } catch (notificationError) {
      console.error('Error sending approval request notification:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.status(200).json({
      message: 'Roster submitted for approval successfully',
      roster: {
        id: roster.id,
        name: roster.name,
        status: 'review'
      },
      statistics: stats,
      validation: validation
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Submit for approval error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit roster for approval'
    });
  }
};

/**
 * Validate roster for approval
 */
const validateRosterForApproval = (roster) => {
  const issues = [];

  // Check if roster has shifts
  if (!roster.shifts || roster.shifts.length === 0) {
    issues.push({
      type: 'error',
      message: 'Roster has no shifts defined',
      severity: 'high'
    });
  }

  // Check shift coverage
  const totalShifts = roster.shifts.length;
  const fullyStaffedShifts = roster.shifts.filter(shift =>
    shift.assigned_staff >= shift.required_staff
  ).length;

  const coveragePercentage = totalShifts > 0 ? (fullyStaffedShifts / totalShifts) * 100 : 0;

  if (coveragePercentage < 80) {
    issues.push({
      type: 'warning',
      message: `Low shift coverage: ${coveragePercentage.toFixed(1)}%`,
      severity: 'medium'
    });
  }

  // Check for unassigned shifts
  const unassignedShifts = roster.shifts.filter(shift => shift.assigned_staff === 0);
  if (unassignedShifts.length > 0) {
    issues.push({
      type: 'warning',
      message: `${unassignedShifts.length} shifts have no staff assigned`,
      severity: 'medium'
    });
  }

  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    issues,
    coveragePercentage
  };
};

/**
 * Calculate roster statistics
 */
const calculateRosterStats = (roster) => {
  const totalShifts = roster.shifts.length;
  const assignedShifts = roster.shifts.filter(shift => shift.assigned_staff > 0).length;
  const fullyStaffedShifts = roster.shifts.filter(shift =>
    shift.assigned_staff >= shift.required_staff
  ).length;

  const totalRequiredStaff = roster.shifts.reduce((sum, shift) => sum + shift.required_staff, 0);
  const totalAssignedStaff = roster.shifts.reduce((sum, shift) => sum + shift.assigned_staff, 0);

  const coveragePercentage = totalShifts > 0 ? (fullyStaffedShifts / totalShifts) * 100 : 0;
  const staffingPercentage = totalRequiredStaff > 0 ? (totalAssignedStaff / totalRequiredStaff) * 100 : 0;

  return {
    total_shifts: totalShifts,
    assigned_shifts: assignedShifts,
    fully_staffed_shifts: fullyStaffedShifts,
    unassigned_shifts: totalShifts - assignedShifts,
    understaffed_shifts: totalShifts - fullyStaffedShifts,
    total_required_staff: totalRequiredStaff,
    total_assigned_staff: totalAssignedStaff,
    coverage_percentage: Math.round(coveragePercentage * 100) / 100,
    staffing_percentage: Math.round(staffingPercentage * 100) / 100
  };
};

module.exports = {
  getPendingApprovals,
  approveRoster,
  rejectRoster,
  getApprovalHistory,
  submitForApproval,
  validateRosterForApproval,
  calculateRosterStats
};
