const { SwapRequest, Shift, ShiftAssignment, User, Roster, Department } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const EventTriggerService = require('../services/EventTriggerService');

/**
 * Get swap requests for an employee (both sent and received)
 */
const getMySwapRequests = async (req, res) => {
  try {
    const { status, type = 'all', page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build where clause based on type and user role
    let whereClause = {};

    if (type === 'sent') {
      whereClause.requested_by = userId;
    } else if (type === 'received') {
      whereClause.target_employee_id = userId;
    } else if (type === 'managed' && ['manager', 'enterpriseAdmin', 'systemAdmin'].includes(userRole)) {
      // Managers can see swap requests for their department
      whereClause.manager_id = userId;
    } else {
      // All requests (sent, received, or managed)
      const orConditions = [
        { requested_by: userId },
        { target_employee_id: userId }
      ];

      // If user is a manager, also include requests they manage
      if (['manager', 'enterpriseAdmin', 'systemAdmin'].includes(userRole)) {
        orConditions.push({ manager_id: userId });
      }

      whereClause[Op.or] = orConditions;
    }

    if (status) {
      whereClause.status = status;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get swap requests
    const { count, rows: swapRequests } = await SwapRequest.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Shift,
          as: 'shift',
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
            }
          ]
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'target_employee',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: Shift,
          as: 'swap_with_shift',
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
      message: 'Swap requests retrieved successfully',
      swap_requests: swapRequests,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get my swap requests error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch swap requests'
    });
  }
};

/**
 * Create a new swap request
 */
const createSwapRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      shift_id,
      target_employee_id,
      swap_with_shift_id,
      request_type = 'swap',
      reason,
      message,
      priority = 'normal',
      compensation_offered
    } = req.body;

    const employeeId = req.user.id;

    // Validation
    if (!shift_id) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Shift ID is required'
      });
    }

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
              attributes: ['id', 'name', 'manager_id']
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

    // Check if employee is assigned to this shift
    const assignment = await ShiftAssignment.findOne({
      where: {
        shift_id,
        employee_id: employeeId,
        status: ['assigned', 'confirmed']
      },
      transaction
    });

    if (!assignment) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You must be assigned to this shift to request a swap'
      });
    }

    // Check if roster is published
    if (shift.roster.status !== 'published') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Can only request swaps for published rosters'
      });
    }

    // Check if there's already a pending swap request for this shift
    const existingRequest = await SwapRequest.findOne({
      where: {
        shift_id,
        requested_by: employeeId,
        status: 'pending'
      },
      transaction
    });

    if (existingRequest) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Conflict',
        message: 'You already have a pending swap request for this shift'
      });
    }

    // Validate target employee if specified
    if (target_employee_id) {
      const targetEmployee = await User.findByPk(target_employee_id, { transaction });
      if (!targetEmployee) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Not found',
          message: 'Target employee not found'
        });
      }

      // Check if target employee is in the same enterprise
      if (targetEmployee.enterprise_id !== req.user.enterprise_id) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Validation error',
          message: 'Target employee must be in the same enterprise'
        });
      }

      // Check if target employee is not the same as requester
      if (target_employee_id === employeeId) {
        await transaction.rollback();
        return res.status(400).json({
          error: 'Validation error',
          message: 'Cannot request swap with yourself'
        });
      }
    }

    // Validate swap_with_shift if specified
    if (swap_with_shift_id) {
      const swapWithShift = await Shift.findByPk(swap_with_shift_id, { transaction });
      if (!swapWithShift) {
        await transaction.rollback();
        return res.status(404).json({
          error: 'Not found',
          message: 'Swap target shift not found'
        });
      }

      // Check if target employee is assigned to the swap shift
      if (target_employee_id) {
        const targetAssignment = await ShiftAssignment.findOne({
          where: {
            shift_id: swap_with_shift_id,
            employee_id: target_employee_id,
            status: ['assigned', 'confirmed']
          },
          transaction
        });

        if (!targetAssignment) {
          await transaction.rollback();
          return res.status(400).json({
            error: 'Validation error',
            message: 'Target employee is not assigned to the specified swap shift'
          });
        }
      }
    }

    // Create the swap request
    const swapRequest = await SwapRequest.create({
      shift_id,
      requested_by: employeeId,
      target_employee_id,
      swap_with_shift_id,
      request_type,
      reason,
      message,
      priority,
      compensation_offered: compensation_offered || { type: 'none', amount: 0 },
      manager_id: shift.roster.department.manager_id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }, { transaction });

    await transaction.commit();

    // Fetch the created swap request with includes
    const createdSwapRequest = await SwapRequest.findByPk(swapRequest.id, {
      include: [
        {
          model: Shift,
          as: 'shift',
          include: [
            {
              model: Roster,
              as: 'roster',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'target_employee',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    // Send swap request notification
    try {
      await EventTriggerService.onSwapRequestCreated(createdSwapRequest);
    } catch (notificationError) {
      console.error('Error sending swap request notification:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.status(201).json({
      message: 'Swap request created successfully',
      swap_request: createdSwapRequest
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create swap request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create swap request'
    });
  }
};

/**
 * Respond to a swap request (accept/decline)
 */
const respondToSwapRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { swapRequestId } = req.params;
    const { response, message } = req.body;
    const employeeId = req.user.id;

    // Validation
    const validResponses = ['accepted', 'declined'];
    if (!validResponses.includes(response)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Response must be either "accepted" or "declined"'
      });
    }

    // Find the swap request
    const swapRequest = await SwapRequest.findByPk(swapRequestId, {
      include: [
        {
          model: Shift,
          as: 'shift'
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      transaction
    });

    if (!swapRequest) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Swap request not found'
      });
    }

    // Check if the employee is the target of this swap request
    if (swapRequest.target_employee_id !== employeeId) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only respond to swap requests directed to you'
      });
    }

    // Check if swap request is still pending
    if (swapRequest.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Swap request is no longer pending'
      });
    }

    // Check if swap request has expired
    if (swapRequest.expires_at && new Date() > swapRequest.expires_at) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Swap request has expired'
      });
    }

    // Update the swap request
    await swapRequest.update({
      target_response: response,
      target_response_at: new Date(),
      target_message: message || null
    }, { transaction });

    await transaction.commit();

    // Fetch updated swap request
    const updatedSwapRequest = await SwapRequest.findByPk(swapRequestId, {
      include: [
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'date', 'start_time', 'end_time', 'title']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'target_employee',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    res.json({
      message: `Swap request ${response} successfully`,
      swap_request: updatedSwapRequest
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Respond to swap request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to respond to swap request'
    });
  }
};

/**
 * Cancel a swap request
 */
const cancelSwapRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { swapRequestId } = req.params;
    const employeeId = req.user.id;

    // Find the swap request
    const swapRequest = await SwapRequest.findByPk(swapRequestId, { transaction });

    if (!swapRequest) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Swap request not found'
      });
    }

    // Check if the employee is the requester
    if (swapRequest.requested_by !== employeeId) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only cancel your own swap requests'
      });
    }

    // Check if swap request can be cancelled
    if (!['pending'].includes(swapRequest.status)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Can only cancel pending swap requests'
      });
    }

    // Update the swap request status
    await swapRequest.update({
      status: 'cancelled'
    }, { transaction });

    await transaction.commit();

    res.json({
      message: 'Swap request cancelled successfully'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Cancel swap request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to cancel swap request'
    });
  }
};

/**
 * Manager approve or reject swap request
 */
const managerApproveSwapRequest = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { swapRequestId } = req.params;
    const { action, message } = req.body; // action: 'approve' or 'reject'
    const managerId = req.user.id;

    // Validation
    const validActions = ['approve', 'reject'];
    if (!validActions.includes(action)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Action must be either "approve" or "reject"'
      });
    }

    // Find the swap request
    const swapRequest = await SwapRequest.findByPk(swapRequestId, {
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
                  attributes: ['id', 'name', 'manager_id']
                }
              ]
            }
          ]
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      transaction
    });

    if (!swapRequest) {
      await transaction.rollback();
      return res.status(404).json({
        error: 'Not found',
        message: 'Swap request not found'
      });
    }

    // Check if user is the manager for this swap request
    if (req.user.role === 'manager' && swapRequest.manager_id !== managerId) {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only approve/reject swap requests for your department'
      });
    }

    // Check if swap request is in a state that can be approved/rejected
    if (!['pending', 'employee_approved'].includes(swapRequest.status)) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'Swap request cannot be approved/rejected in its current state'
      });
    }

    // Update the swap request with correct field names
    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      manager_notes: message || null,
      decision_date: new Date()
    };

    await swapRequest.update(updateData, { transaction });

    // If approved, handle the shift assignment changes based on request type
    if (action === 'approve') {
      await handleApprovedSwapRequest(swapRequest, transaction);
    }

    await transaction.commit();

    // Fetch updated swap request
    const updatedSwapRequest = await SwapRequest.findByPk(swapRequestId, {
      include: [
        {
          model: Shift,
          as: 'shift',
          attributes: ['id', 'date', 'start_time', 'end_time', 'title']
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'target_employee',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    // Send approval/rejection notification
    try {
      if (action === 'approve') {
        await EventTriggerService.onSwapRequestApproved(updatedSwapRequest);
      } else {
        await EventTriggerService.onSwapRequestRejected(updatedSwapRequest, message);
      }
    } catch (notificationError) {
      console.error('Error sending swap request decision notification:', notificationError);
      // Don't fail the request if notifications fail
    }

    res.json({
      message: `Swap request ${action}d successfully`,
      swap_request: updatedSwapRequest
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Manager approve swap request error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process swap request'
    });
  }
};

/**
 * Handle approved swap request - update shift assignments based on request type
 */
const handleApprovedSwapRequest = async (swapRequest, transaction) => {
  const { request_type, shift_id, requested_by, target_employee_id, swap_with_shift_id } = swapRequest;

  try {
    switch (request_type) {
      case 'cover':
        // Cover request: Remove the requesting employee from the shift
        await handleCoverRequest(shift_id, requested_by, transaction);
        break;

      case 'swap':
        // Swap request: Exchange shift assignments between two employees
        if (target_employee_id && swap_with_shift_id) {
          await handleSwapRequest(shift_id, swap_with_shift_id, requested_by, target_employee_id, transaction);
        } else {
          // If no specific target, just remove from shift (like cover)
          await handleCoverRequest(shift_id, requested_by, transaction);
        }
        break;

      case 'trade':
        // Trade request: Permanently reassign the shift to target employee
        if (target_employee_id) {
          await handleTradeRequest(shift_id, requested_by, target_employee_id, transaction);
        } else {
          // If no target, remove from shift
          await handleCoverRequest(shift_id, requested_by, transaction);
        }
        break;

      default:
        console.log(`Unknown request type: ${request_type}`);
        break;
    }
  } catch (error) {
    console.error('Error handling approved swap request:', error);
    throw error;
  }
};

/**
 * Handle cover request - remove employee from shift
 */
const handleCoverRequest = async (shiftId, employeeId, transaction) => {
  // Find and remove the shift assignment
  const assignment = await ShiftAssignment.findOne({
    where: {
      shift_id: shiftId,
      employee_id: employeeId,
      status: { [Op.in]: ['assigned', 'confirmed'] }
    },
    transaction
  });

  if (assignment) {
    // Remove the assignment
    await assignment.destroy({ transaction });

    // Update shift assigned_staff count
    await Shift.decrement('assigned_staff', {
      where: { id: shiftId },
      transaction
    });

    console.log(`Removed employee ${employeeId} from shift ${shiftId} (cover request)`);
  }
};

/**
 * Handle swap request - exchange assignments between two employees
 */
const handleSwapRequest = async (shift1Id, shift2Id, employee1Id, employee2Id, transaction) => {
  // Find both assignments
  const assignment1 = await ShiftAssignment.findOne({
    where: {
      shift_id: shift1Id,
      employee_id: employee1Id,
      status: { [Op.in]: ['assigned', 'confirmed'] }
    },
    transaction
  });

  const assignment2 = await ShiftAssignment.findOne({
    where: {
      shift_id: shift2Id,
      employee_id: employee2Id,
      status: { [Op.in]: ['assigned', 'confirmed'] }
    },
    transaction
  });

  if (assignment1 && assignment2) {
    // Swap the assignments
    await assignment1.update({
      shift_id: shift2Id,
      employee_id: employee2Id
    }, { transaction });

    await assignment2.update({
      shift_id: shift1Id,
      employee_id: employee1Id
    }, { transaction });

    console.log(`Swapped assignments: Employee ${employee1Id} moved to shift ${shift2Id}, Employee ${employee2Id} moved to shift ${shift1Id}`);
  } else if (assignment1) {
    // Only first assignment exists, move employee1 to shift2 and remove from shift1
    await assignment1.update({
      shift_id: shift2Id
    }, { transaction });

    // Update shift counts
    await Shift.decrement('assigned_staff', {
      where: { id: shift1Id },
      transaction
    });

    await Shift.increment('assigned_staff', {
      where: { id: shift2Id },
      transaction
    });

    console.log(`Moved employee ${employee1Id} from shift ${shift1Id} to shift ${shift2Id}`);
  }
};

/**
 * Handle trade request - permanently reassign shift to target employee
 */
const handleTradeRequest = async (shiftId, fromEmployeeId, toEmployeeId, transaction) => {
  // Find the original assignment
  const assignment = await ShiftAssignment.findOne({
    where: {
      shift_id: shiftId,
      employee_id: fromEmployeeId,
      status: { [Op.in]: ['assigned', 'confirmed'] }
    },
    transaction
  });

  if (assignment) {
    // Update assignment to new employee
    await assignment.update({
      employee_id: toEmployeeId,
      status: 'assigned',
      assigned_at: new Date(),
      notes: `Traded from employee ${fromEmployeeId}`
    }, { transaction });

    console.log(`Traded shift ${shiftId} from employee ${fromEmployeeId} to employee ${toEmployeeId}`);
  } else {
    // Create new assignment if original doesn't exist
    await ShiftAssignment.create({
      shift_id: shiftId,
      employee_id: toEmployeeId,
      status: 'assigned',
      assigned_at: new Date(),
      notes: `Assigned via trade request`
    }, { transaction });

    // Update shift assigned_staff count
    await Shift.increment('assigned_staff', {
      where: { id: shiftId },
      transaction
    });

    console.log(`Created new assignment for shift ${shiftId} to employee ${toEmployeeId} (trade)`);
  }
};

module.exports = {
  getMySwapRequests,
  createSwapRequest,
  respondToSwapRequest,
  cancelSwapRequest,
  managerApproveSwapRequest
};
