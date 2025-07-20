const { User, Department, Enterprise, Roster, Shift, ShiftAssignment, SwapRequest, Notification } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * Get dashboard analytics for enterprise admin
 */
const getEnterpriseAnalytics = async (req, res) => {
  try {
    const { user } = req;
    
    if (!user.enterprise_id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Enterprise ID is required'
      });
    }

    // Get total users in the enterprise
    const totalUsers = await User.count({
      where: { enterprise_id: user.enterprise_id }
    });

    // Get active users (is_active = true)
    const activeUsers = await User.count({
      where: { 
        enterprise_id: user.enterprise_id,
        is_active: true
      }
    });

    // Get inactive users
    const inactiveUsers = totalUsers - activeUsers;

    // Get total departments
    const totalDepartments = await Department.count({
      where: { enterprise_id: user.enterprise_id }
    });

    // Get departments with managers
    const departmentsWithManagers = await Department.count({
      where: { 
        enterprise_id: user.enterprise_id,
        manager_id: { [Op.not]: null }
      }
    });

    // Get departments without managers
    const departmentsWithoutManagers = totalDepartments - departmentsWithManagers;

    // Get managers count
    const totalManagers = await User.count({
      where: { 
        enterprise_id: user.enterprise_id,
        role: 'manager'
      }
    });

    // Get employees count
    const totalEmployees = await User.count({
      where: { 
        enterprise_id: user.enterprise_id,
        role: 'employee'
      }
    });

    // Get users by department
    const usersByDepartment = await Department.findAll({
      where: { enterprise_id: user.enterprise_id },
      attributes: ['id', 'name'],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'role', 'is_active'],
          required: false
        }
      ]
    });

    // Process department breakdown
    const departmentBreakdown = usersByDepartment.map(dept => ({
      id: dept.id,
      name: dept.name,
      total_users: dept.users.length,
      active_users: dept.users.filter(u => u.is_active).length,
      managers: dept.users.filter(u => u.role === 'manager').length,
      employees: dept.users.filter(u => u.role === 'employee').length
    }));

    // Get unassigned users
    const unassignedUsers = await User.count({
      where: { 
        enterprise_id: user.enterprise_id,
        department_id: null
      }
    });

    const analytics = {
      // Main stats
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalDepartments,
      departmentsWithManagers,
      departmentsWithoutManagers,
      totalManagers,
      totalEmployees,
      unassignedUsers,
      
      // Department breakdown
      departmentBreakdown,
      
      // Additional metrics
      userActivityRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      departmentCoverage: totalDepartments > 0 ? Math.round((departmentsWithManagers / totalDepartments) * 100) : 0
    };

    res.json({
      message: 'Analytics retrieved successfully',
      analytics
    });

  } catch (error) {
    console.error('Get enterprise analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve analytics'
    });
  }
};

/**
 * Get system-wide analytics for system admin
 */
const getSystemAnalytics = async (req, res) => {
  try {
    // Get total enterprises
    const totalEnterprises = await Enterprise.count();

    // Get total users across all enterprises
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const inactiveUsers = totalUsers - activeUsers;

    // Get total departments across all enterprises
    const totalDepartments = await Department.count();

    // Get role breakdown
    const totalSystemAdmins = await User.count({
      where: { role: 'systemAdmin' }
    });

    const totalEnterpriseAdmins = await User.count({
      where: { role: 'enterpriseAdmin' }
    });

    const totalManagers = await User.count({
      where: { role: 'manager' }
    });

    const totalEmployees = await User.count({
      where: { role: 'employee' }
    });

    // Get departments with and without managers
    const departmentsWithManagers = await Department.count({
      include: [
        {
          model: User,
          as: 'manager',
          where: { role: 'manager' },
          required: true
        }
      ]
    });

    const departmentsWithoutManagers = totalDepartments - departmentsWithManagers;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get total rosters across all enterprises
    const totalRosters = await Roster.count();
    const recentRosters = await Roster.count({
      where: { created_at: { [Op.gte]: thirtyDaysAgo } }
    });

    // Get total shifts across all enterprises
    const totalShifts = await Shift.count({
      where: { date: { [Op.gte]: thirtyDaysAgo } }
    });

    const assignedShifts = await ShiftAssignment.count({
      include: [
        {
          model: Shift,
          as: 'shift',
          where: { date: { [Op.gte]: thirtyDaysAgo } }
        }
      ]
    });

    // Get swap requests
    const totalSwapRequests = await SwapRequest.count();
    const recentSwapRequests = await SwapRequest.count({
      where: { created_at: { [Op.gte]: thirtyDaysAgo } }
    });

    const pendingSwapRequests = await SwapRequest.count({
      where: { status: 'pending' }
    });

    // Get enterprise breakdown with detailed stats
    const enterpriseBreakdown = await Enterprise.findAll({
      attributes: ['id', 'name', 'created_at'],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'role', 'is_active', 'created_at'],
          required: false
        },
        {
          model: Department,
          as: 'departments',
          attributes: ['id', 'name', 'created_at'],
          include: [
            {
              model: User,
              as: 'manager',
              attributes: ['id', 'full_name'],
              required: false
            }
          ],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const processedEnterprises = enterpriseBreakdown.map(ent => {
      const users = ent.users || [];
      const departments = ent.departments || [];

      return {
        id: ent.id,
        name: ent.name,
        is_active: true, // Default to active since there's no is_active column
        created_at: ent.created_at,
        user_count: users.length,
        active_users: users.filter(u => u.is_active).length,
        inactive_users: users.filter(u => !u.is_active).length,
        department_count: departments.length,
        departments_with_managers: departments.filter(d => d.manager).length,
        departments_without_managers: departments.filter(d => !d.manager).length,
        managers: users.filter(u => u.role === 'manager').length,
        employees: users.filter(u => u.role === 'employee').length,
        enterprise_admins: users.filter(u => u.role === 'enterpriseAdmin').length,
        recent_users: users.filter(u => new Date(u.created_at) >= thirtyDaysAgo).length,
        health_score: Math.round(
          (users.filter(u => u.is_active).length / Math.max(users.length, 1)) *
          (departments.filter(d => d.manager).length / Math.max(departments.length, 1)) * 100
        )
      };
    });

    // Calculate system health metrics
    const systemHealth = {
      userActivityRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      departmentCoverage: totalDepartments > 0 ? Math.round((departmentsWithManagers / totalDepartments) * 100) : 0,
      shiftCoverageRate: totalShifts > 0 ? Math.round((assignedShifts / totalShifts) * 100) : 0,
      enterpriseUtilization: totalEnterprises > 0 ? Math.round((totalEnterprises / totalEnterprises) * 100) : 0 // All enterprises are considered active
    };

    // Recent activity summary
    const recentActivity = {
      newRosters: recentRosters,
      newSwapRequests: recentSwapRequests,
      totalShiftsScheduled: totalShifts,
      shiftsAssigned: assignedShifts
    };

    const analytics = {
      // Main stats
      totalEnterprises,
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalDepartments,
      totalRosters,

      // Role breakdown
      totalSystemAdmins,
      totalEnterpriseAdmins,
      totalManagers,
      totalEmployees,

      // Department stats
      departmentsWithManagers,
      departmentsWithoutManagers,

      // Activity stats
      totalShifts,
      assignedShifts,
      totalSwapRequests,
      pendingSwapRequests,

      // Health metrics
      systemHealth,

      // Recent activity
      recentActivity,

      // Enterprise breakdown
      enterpriseBreakdown: processedEnterprises,

      // Summary insights
      insights: [
        `${totalEnterprises} enterprises managing ${totalUsers} users`,
        `${systemHealth.userActivityRate}% user activity rate across the platform`,
        `${departmentsWithoutManagers} departments need manager assignment`,
        `${pendingSwapRequests} swap requests pending approval`,
        `${recentRosters} new rosters created in the last 30 days`
      ]
    };

    res.json({
      message: 'System analytics retrieved successfully',
      analytics
    });

  } catch (error) {
    console.error('Get system analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve system analytics'
    });
  }
};

/**
 * Get dashboard analytics for manager
 */
const getManagerAnalytics = async (req, res) => {
  try {
    const { user } = req;

    if (!user.department_id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Department ID is required for managers'
      });
    }

    // Get department info
    const department = await Department.findByPk(user.department_id, {
      include: [
        {
          model: Enterprise,
          as: 'enterprise',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!department) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Department not found'
      });
    }

    // Get team members in the department
    const totalTeamMembers = await User.count({
      where: { department_id: user.department_id }
    });

    const activeTeamMembers = await User.count({
      where: {
        department_id: user.department_id,
        is_active: true
      }
    });

    // Get employees (excluding managers)
    const totalEmployees = await User.count({
      where: {
        department_id: user.department_id,
        role: 'employee'
      }
    });

    // Get rosters for this department
    const totalRosters = await Roster.count({
      where: { department_id: user.department_id }
    });

    const pendingRosters = await Roster.count({
      where: {
        department_id: user.department_id,
        status: 'draft'
      }
    });

    const publishedRosters = await Roster.count({
      where: {
        department_id: user.department_id,
        status: 'published'
      }
    });

    // Get shifts for this department (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalShifts = await Shift.count({
      include: [
        {
          model: Roster,
          as: 'roster',
          where: { department_id: user.department_id },
          attributes: []
        }
      ],
      where: {
        date: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Get shift assignments
    const assignedShifts = await ShiftAssignment.count({
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: { [Op.gte]: thirtyDaysAgo }
          },
          include: [
            {
              model: Roster,
              as: 'roster',
              where: { department_id: user.department_id },
              attributes: []
            }
          ]
        }
      ]
    });

    const confirmedShifts = await ShiftAssignment.count({
      where: { status: 'confirmed' },
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: { [Op.gte]: thirtyDaysAgo }
          },
          include: [
            {
              model: Roster,
              as: 'roster',
              where: { department_id: user.department_id },
              attributes: []
            }
          ]
        }
      ]
    });

    // Get swap requests for this department
    const totalSwapRequests = await SwapRequest.count({
      include: [
        {
          model: Shift,
          as: 'shift',
          include: [
            {
              model: Roster,
              as: 'roster',
              where: { department_id: user.department_id },
              attributes: []
            }
          ],
          attributes: []
        }
      ]
    });

    const pendingSwapRequests = await SwapRequest.count({
      where: { status: 'pending' },
      include: [
        {
          model: Shift,
          as: 'shift',
          include: [
            {
              model: Roster,
              as: 'roster',
              where: { department_id: user.department_id },
              attributes: []
            }
          ],
          attributes: []
        }
      ]
    });



    // Get team members with details
    const teamMembers = await User.findAll({
      where: { department_id: user.department_id },
      attributes: ['id', 'full_name', 'email', 'role', 'is_active', 'created_at'],
      order: [['role', 'ASC'], ['full_name', 'ASC']]
    });

    // Get recent rosters
    const recentRosters = await Roster.findAll({
      where: { department_id: user.department_id },
      attributes: ['id', 'name', 'status', 'start_date', 'end_date', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    const analytics = {
      // Department info
      department: {
        id: department.id,
        name: department.name,
        enterprise: department.enterprise
      },

      // Team stats
      totalTeamMembers,
      activeTeamMembers,
      totalEmployees,
      inactiveMembers: totalTeamMembers - activeTeamMembers,

      // Roster stats
      totalRosters,
      pendingRosters,
      publishedRosters,

      // Shift stats (last 30 days)
      totalShifts,
      assignedShifts,
      confirmedShifts,
      unassignedShifts: totalShifts - assignedShifts,

      // Swap request stats
      totalSwapRequests,
      pendingSwapRequests,



      // Coverage metrics
      shiftCoverageRate: totalShifts > 0 ? Math.round((confirmedShifts / totalShifts) * 100) : 0,
      teamActivityRate: totalTeamMembers > 0 ? Math.round((activeTeamMembers / totalTeamMembers) * 100) : 0,

      // Detailed data
      teamMembers,
      recentRosters
    };

    res.json({
      message: 'Manager analytics retrieved successfully',
      analytics
    });

  } catch (error) {
    console.error('Get manager analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve manager analytics'
    });
  }
};

/**
 * Get dashboard analytics for employee
 */
const getEmployeeAnalytics = async (req, res) => {
  try {
    const { user } = req;

    // Get employee's department info
    const department = await Department.findByPk(user.department_id, {
      include: [
        {
          model: Enterprise,
          as: 'enterprise',
          attributes: ['id', 'name']
        }
      ]
    });

    // Get upcoming shifts (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingShifts = await ShiftAssignment.findAll({
      where: { employee_id: user.id },
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: {
              [Op.between]: [today, nextWeek]
            }
          },
          attributes: ['id', 'date', 'start_time', 'end_time', 'shift_type', 'description']
        }
      ],
      order: [[{ model: Shift, as: 'shift' }, 'date', 'ASC']]
    });

    // Get recent shifts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentShifts = await ShiftAssignment.count({
      where: { employee_id: user.id },
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: { [Op.gte]: thirtyDaysAgo }
          }
        }
      ]
    });

    const confirmedShifts = await ShiftAssignment.count({
      where: {
        employee_id: user.id,
        status: 'confirmed'
      },
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: { [Op.gte]: thirtyDaysAgo }
          }
        }
      ]
    });

    const pendingShifts = await ShiftAssignment.count({
      where: {
        employee_id: user.id,
        status: 'assigned'  // 'assigned' represents pending/unconfirmed assignments
      },
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: { [Op.gte]: thirtyDaysAgo }
          }
        }
      ]
    });

    // Get swap requests made by employee
    const swapRequestsMade = await SwapRequest.count({
      where: { requested_by: user.id }
    });

    const pendingSwapRequests = await SwapRequest.count({
      where: {
        requested_by: user.id,
        status: 'pending'
      }
    });

    // Get swap requests targeting this employee
    const swapRequestsReceived = await SwapRequest.count({
      where: { target_employee_id: user.id }
    });



    // Get unread notifications
    const unreadNotifications = await Notification.count({
      where: {
        user_id: user.id,
        read_at: null  // null means unread
      }
    });

    // Calculate total hours worked (last 30 days)
    const shiftsWithHours = await ShiftAssignment.findAll({
      where: {
        employee_id: user.id,
        status: 'confirmed'
      },
      include: [
        {
          model: Shift,
          as: 'shift',
          where: {
            date: { [Op.gte]: thirtyDaysAgo }
          },
          attributes: ['start_time', 'end_time']
        }
      ]
    });

    let totalHours = 0;
    shiftsWithHours.forEach(assignment => {
      const shift = assignment.shift;
      const start = new Date(`1970-01-01T${shift.start_time}`);
      const end = new Date(`1970-01-01T${shift.end_time}`);
      const hours = (end - start) / (1000 * 60 * 60);
      totalHours += hours;
    });

    // Get recent swap requests with details
    const recentSwapRequests = await SwapRequest.findAll({
      where: {
        [Op.or]: [
          { requested_by: user.id },
          { target_employee_id: user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'full_name']
        },
        {
          model: User,
          as: 'target_employee',
          attributes: ['id', 'full_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    const analytics = {
      // Personal info
      employee: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        department: department ? {
          id: department.id,
          name: department.name,
          enterprise: department.enterprise
        } : null
      },

      // Shift stats (last 30 days)
      recentShifts,
      confirmedShifts,
      pendingShifts,
      totalHours: Math.round(totalHours * 10) / 10,

      // Upcoming schedule
      upcomingShiftsCount: upcomingShifts.length,

      // Swap request stats
      swapRequestsMade,
      pendingSwapRequests,
      swapRequestsReceived,

      // Engagement stats
      unreadNotifications,

      // Performance metrics
      shiftAcceptanceRate: recentShifts > 0 ? Math.round((confirmedShifts / recentShifts) * 100) : 0,
      avgHoursPerWeek: Math.round((totalHours / 4) * 10) / 10,

      // Detailed data
      upcomingShifts: upcomingShifts.map(assignment => ({
        id: assignment.id,
        status: assignment.status,
        shift: assignment.shift
      })),
      recentSwapRequests
    };

    res.json({
      message: 'Employee analytics retrieved successfully',
      analytics
    });

  } catch (error) {
    console.error('Get employee analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve employee analytics'
    });
  }
};

module.exports = {
  getEnterpriseAnalytics,
  getSystemAnalytics,
  getManagerAnalytics,
  getEmployeeAnalytics
};
