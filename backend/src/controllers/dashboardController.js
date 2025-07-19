const { User, Department, Enterprise } = require('../models');
const { Op } = require('sequelize');

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

    // Get total departments across all enterprises
    const totalDepartments = await Department.count();

    // Get total admins (system + enterprise)
    const totalSystemAdmins = await User.count({
      where: { role: 'systemAdmin' }
    });

    const totalEnterpriseAdmins = await User.count({
      where: { role: 'enterpriseAdmin' }
    });

    // Get enterprise breakdown
    const enterpriseBreakdown = await Enterprise.findAll({
      attributes: ['id', 'name', 'created_at'],
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'role', 'is_active'],
          required: false
        },
        {
          model: Department,
          as: 'departments',
          attributes: ['id'],
          required: false
        }
      ]
    });

    const processedEnterprises = enterpriseBreakdown.map(ent => ({
      id: ent.id,
      name: ent.name,
      created_at: ent.created_at,
      user_count: ent.users.length,
      active_users: ent.users.filter(u => u.is_active).length,
      department_count: ent.departments.length,
      managers: ent.users.filter(u => u.role === 'manager').length,
      employees: ent.users.filter(u => u.role === 'employee').length
    }));

    const analytics = {
      // Main stats
      totalEnterprises,
      totalUsers,
      totalDepartments,
      totalSystemAdmins,
      totalEnterpriseAdmins,
      
      // Enterprise breakdown
      enterpriseBreakdown: processedEnterprises
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

module.exports = {
  getEnterpriseAnalytics,
  getSystemAnalytics
};
