const NotificationService = require('./NotificationService');
const {
  User,
  Roster,
  Shift,
  ShiftAssignment,
  SwapRequest,
  Department,
  Enterprise
} = require('../models');

class EventTriggerService {
  /**
   * Trigger notifications when a roster is published
   * @param {Roster} roster - The published roster
   */
  async onRosterPublished(roster) {
    try {
      // Get all employees in the department
      const employees = await User.findAll({
        where: {
          department_id: roster.department_id,
          role: 'employee'
        }
      });

      // Get department info
      const department = await Department.findByPk(roster.department_id);

      const variables = {
        roster_name: roster.name,
        roster_id: roster.id,
        department_name: department?.name || 'Unknown Department',
        start_date: roster.start_date,
        end_date: roster.end_date
      };

      // Create notifications for all employees
      const userIds = employees.map(emp => emp.id);
      await NotificationService.createBulkNotifications({
        userIds,
        type: 'roster_published',
        variables
      });

      console.log(`Roster published notifications sent to ${userIds.length} employees`);
    } catch (error) {
      console.error('Error triggering roster published notifications:', error);
    }
  }

  /**
   * Trigger notifications when a roster needs approval
   * @param {Roster} roster - The roster needing approval
   */
  async onRosterNeedsApproval(roster) {
    try {
      // Get department manager
      const department = await Department.findByPk(roster.department_id, {
        include: [{ model: User, as: 'manager' }]
      });

      if (!department?.manager) {
        console.log('No manager found for department, skipping approval notification');
        return;
      }

      const variables = {
        roster_name: roster.name,
        roster_id: roster.id,
        department_name: department.name,
        start_date: roster.start_date,
        end_date: roster.end_date,
        created_by_name: roster.creator?.full_name || 'Unknown'
      };

      // Notify ONLY the department manager (not enterprise admins)
      await NotificationService.createNotification({
        userId: department.manager.id,
        type: 'roster_needs_approval',
        variables
      });

      console.log(`Roster approval notification sent to manager: ${department.manager.full_name}`);
    } catch (error) {
      console.error('Error triggering roster approval notification:', error);
    }
  }

  /**
   * Trigger notifications when a roster is approved
   * @param {Roster} roster - The approved roster
   */
  async onRosterApproved(roster) {
    try {
      const variables = {
        roster_name: roster.name,
        roster_id: roster.id,
        approved_by_name: roster.approver?.full_name || 'Manager',
        department_name: roster.department?.name || 'Unknown Department'
      };

      // Notify the creator
      await NotificationService.createNotification({
        userId: roster.created_by,
        type: 'roster_approved',
        variables
      });

      // Notify enterprise admin(s) in the same enterprise
      if (roster.department?.enterprise_id) {
        const enterpriseAdmins = await User.findAll({
          where: {
            role: 'enterpriseAdmin',
            enterprise_id: roster.department.enterprise_id
          }
        });

        for (const admin of enterpriseAdmins) {
          // Don't notify if the admin is the one who approved it
          if (admin.id !== roster.approved_by) {
            await NotificationService.createNotification({
              userId: admin.id,
              type: 'roster_approved',
              variables: {
                ...variables,
                notification_context: 'enterprise_admin' // To distinguish in template if needed
              }
            });
          }
        }

        console.log(`Roster approved notifications sent to creator and ${enterpriseAdmins.filter(admin => admin.id !== roster.approved_by).length} enterprise admin(s)`);
      } else {
        console.log(`Roster approved notification sent to creator`);
      }
    } catch (error) {
      console.error('Error triggering roster approved notification:', error);
    }
  }

  /**
   * Trigger notifications when a roster is rejected
   * @param {Roster} roster - The rejected roster
   * @param {string} reason - Rejection reason
   */
  async onRosterRejected(roster, reason = '') {
    try {
      const variables = {
        roster_name: roster.name,
        roster_id: roster.id,
        rejected_by_name: roster.approver?.full_name || 'Manager',
        reason: reason,
        department_name: roster.department?.name || 'Unknown Department'
      };

      // Notify the creator
      await NotificationService.createNotification({
        userId: roster.created_by,
        type: 'roster_rejected',
        variables
      });

      // Notify enterprise admin(s) in the same enterprise
      if (roster.department?.enterprise_id) {
        const enterpriseAdmins = await User.findAll({
          where: {
            role: 'enterpriseAdmin',
            enterprise_id: roster.department.enterprise_id
          }
        });

        for (const admin of enterpriseAdmins) {
          // Don't notify if the admin is the one who rejected it
          if (admin.id !== roster.approved_by) {
            await NotificationService.createNotification({
              userId: admin.id,
              type: 'roster_rejected',
              variables: {
                ...variables,
                notification_context: 'enterprise_admin'
              }
            });
          }
        }

        console.log(`Roster rejected notifications sent to creator and ${enterpriseAdmins.filter(admin => admin.id !== roster.approved_by).length} enterprise admin(s)`);
      } else {
        console.log(`Roster rejected notification sent to creator`);
      }
    } catch (error) {
      console.error('Error triggering roster rejected notification:', error);
    }
  }

  /**
   * Trigger notifications when an employee is assigned to a shift
   * @param {ShiftAssignment} assignment - The shift assignment
   */
  async onShiftAssigned(assignment) {
    try {
      // Get shift and related data
      const shift = await Shift.findByPk(assignment.shift_id, {
        include: [
          { 
            model: Roster, 
            as: 'roster',
            include: [{ model: Department, as: 'department' }]
          }
        ]
      });

      if (!shift) {
        console.log('Shift not found for assignment notification');
        return;
      }

      const variables = {
        shift_id: shift.id,
        shift_date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        position: shift.position || 'Staff',
        location: shift.location || shift.roster?.department?.name || 'Unknown',
        roster_name: shift.roster?.name || 'Unknown Roster'
      };

      await NotificationService.createNotification({
        userId: assignment.employee_id,
        type: 'shift_assigned',
        variables
      });

      console.log(`Shift assigned notification sent to employee ${assignment.employee_id}`);
    } catch (error) {
      console.error('Error triggering shift assigned notification:', error);
    }
  }

  /**
   * Trigger notifications when an employee is unassigned from a shift
   * @param {ShiftAssignment} assignment - The shift assignment that was removed
   */
  async onShiftUnassigned(assignment) {
    try {
      // Get shift and related data
      const shift = await Shift.findByPk(assignment.shift_id, {
        include: [
          { 
            model: Roster, 
            as: 'roster',
            include: [{ model: Department, as: 'department' }]
          }
        ]
      });

      if (!shift) {
        console.log('Shift not found for unassignment notification');
        return;
      }

      const variables = {
        shift_id: shift.id,
        shift_date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        position: shift.position || 'Staff',
        location: shift.location || shift.roster?.department?.name || 'Unknown',
        roster_name: shift.roster?.name || 'Unknown Roster'
      };

      await NotificationService.createNotification({
        userId: assignment.employee_id,
        type: 'shift_unassigned',
        variables
      });

      console.log(`Shift unassigned notification sent to employee ${assignment.employee_id}`);
    } catch (error) {
      console.error('Error triggering shift unassigned notification:', error);
    }
  }

  /**
   * Trigger notifications when a swap request is created
   * @param {SwapRequest} swapRequest - The swap request
   */
  async onSwapRequestCreated(swapRequest) {
    try {
      // Get requester and shift info
      const requester = await User.findByPk(swapRequest.requested_by);
      const shift = await Shift.findByPk(swapRequest.shift_id);

      if (!requester || !shift) {
        console.log('Missing data for swap request notification');
        return;
      }

      const variables = {
        swap_request_id: swapRequest.id,
        requester_name: requester.full_name,
        shift_date: shift.date,
        start_time: shift.start_time,
        end_time: shift.end_time,
        request_type: swapRequest.request_type
      };

      // Notify target employee if specified
      if (swapRequest.target_employee_id) {
        await NotificationService.createNotification({
          userId: swapRequest.target_employee_id,
          type: 'swap_request_received',
          variables
        });
      }

      // Notify manager
      if (swapRequest.manager_id) {
        await NotificationService.createNotification({
          userId: swapRequest.manager_id,
          type: 'swap_request_received',
          variables: {
            ...variables,
            requires_approval: true
          }
        });
      }

      console.log(`Swap request notifications sent`);
    } catch (error) {
      console.error('Error triggering swap request created notification:', error);
    }
  }

  /**
   * Trigger notifications when a swap request is approved
   * @param {SwapRequest} swapRequest - The approved swap request
   */
  async onSwapRequestApproved(swapRequest) {
    try {
      const variables = {
        swap_request_id: swapRequest.id,
        approved_by_name: swapRequest.manager?.full_name || 'Manager'
      };

      // Notify requester
      await NotificationService.createNotification({
        userId: swapRequest.requested_by,
        type: 'swap_request_approved',
        variables
      });

      // Notify target employee if different from requester
      if (swapRequest.target_employee_id && swapRequest.target_employee_id !== swapRequest.requested_by) {
        await NotificationService.createNotification({
          userId: swapRequest.target_employee_id,
          type: 'swap_request_approved',
          variables
        });
      }

      console.log(`Swap request approved notifications sent`);
    } catch (error) {
      console.error('Error triggering swap request approved notification:', error);
    }
  }

  /**
   * Trigger notifications when a swap request is rejected
   * @param {SwapRequest} swapRequest - The rejected swap request
   * @param {string} reason - Rejection reason
   */
  async onSwapRequestRejected(swapRequest, reason = '') {
    try {
      const variables = {
        swap_request_id: swapRequest.id,
        rejected_by_name: swapRequest.manager?.full_name || 'Manager',
        reason: reason
      };

      // Notify requester
      await NotificationService.createNotification({
        userId: swapRequest.requested_by,
        type: 'swap_request_rejected',
        variables
      });

      // Notify target employee if different from requester
      if (swapRequest.target_employee_id && swapRequest.target_employee_id !== swapRequest.requested_by) {
        await NotificationService.createNotification({
          userId: swapRequest.target_employee_id,
          type: 'swap_request_rejected',
          variables
        });
      }

      console.log(`Swap request rejected notifications sent`);
    } catch (error) {
      console.error('Error triggering swap request rejected notification:', error);
    }
  }

  /**
   * Trigger welcome notification for new users
   * @param {User} user - The new user
   */
  async onUserCreated(user) {
    try {
      const variables = {
        user_name: user.full_name,
        user_email: user.email,
        role: user.role
      };

      await NotificationService.createNotification({
        userId: user.id,
        type: 'welcome',
        variables
      });

      console.log(`Welcome notification sent to new user: ${user.full_name}`);
    } catch (error) {
      console.error('Error triggering welcome notification:', error);
    }
  }
}

module.exports = new EventTriggerService();
