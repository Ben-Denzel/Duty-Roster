const { Department, User, Enterprise } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all departments for an enterprise
 */
const getDepartments = async (req, res) => {
  try {
    const { enterpriseId } = req.params;
    const { page = 1, limit = 10, search = '', include_inactive = false } = req.query;

    // Check enterprise access
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== parseInt(enterpriseId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this enterprise'
      });
    }

    const whereClause = {
      enterprise_id: enterpriseId
    };

    if (search) {
      whereClause.name = {
        [Op.iLike]: `%${search}%`
      };
    }

    if (!include_inactive) {
      whereClause.is_active = true;
    }

    const offset = (page - 1) * limit;

    const { count, rows: departments } = await Department.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'users',
          attributes: ['id', 'full_name', 'email', 'role'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['name', 'ASC']]
    });

    // Calculate user counts for each department
    const departmentsWithStats = departments.map(dept => {
      const deptData = dept.toJSON();
      deptData.user_count = deptData.users ? deptData.users.length : 0;
      deptData.manager_count = deptData.users ? 
        deptData.users.filter(user => user.role === 'manager').length : 0;
      deptData.employee_count = deptData.users ? 
        deptData.users.filter(user => user.role === 'employee').length : 0;
      return deptData;
    });

    res.json({
      departments: departmentsWithStats,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch departments'
    });
  }
};

/**
 * Get a specific department by ID
 */
const getDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
          required: false
        },
        {
          model: User,
          as: 'users',
          attributes: ['id', 'full_name', 'email', 'role', 'gender'],
          required: false
        },
        {
          model: Enterprise,
          as: 'enterprise',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

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

    // If user is a manager, they can only see their own department
    if (req.user.role === 'manager' && req.user.department_id !== department.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }

    const departmentData = department.toJSON();
    departmentData.user_count = departmentData.users ? departmentData.users.length : 0;
    departmentData.manager_count = departmentData.users ? 
      departmentData.users.filter(user => user.role === 'manager').length : 0;
    departmentData.employee_count = departmentData.users ? 
      departmentData.users.filter(user => user.role === 'employee').length : 0;

    res.json({
      department: departmentData
    });

  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch department'
    });
  }
};

/**
 * Create a new department
 */
const createDepartment = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      enterprise_id, 
      manager_id, 
      working_hours, 
      shift_patterns, 
      settings 
    } = req.body;

    // Validation
    if (!name || !enterprise_id) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and enterprise_id are required'
      });
    }

    // Check enterprise access
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== parseInt(enterprise_id)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this enterprise'
      });
    }

    // Check if department name already exists in the enterprise
    const existingDepartment = await Department.findOne({
      where: {
        name,
        enterprise_id,
        is_active: true
      }
    });

    if (existingDepartment) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Department with this name already exists in the enterprise'
      });
    }

    // If manager_id is provided, validate the manager
    if (manager_id) {
      const manager = await User.findByPk(manager_id);
      if (!manager || manager.enterprise_id !== parseInt(enterprise_id)) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid manager or manager not in the same enterprise'
        });
      }
    }

    const department = await Department.create({
      name,
      description,
      enterprise_id,
      manager_id,
      working_hours,
      shift_patterns,
      settings
    });

    // If a manager was assigned, update their department_id
    if (manager_id) {
      await User.update(
        { department_id: department.id },
        { where: { id: manager_id } }
      );
    }

    // Fetch the created department with associations
    const createdDepartment = await Department.findByPk(department.id, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    res.status(201).json({
      message: 'Department created successfully',
      department: createdDepartment
    });

  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create department'
    });
  }
};

/**
 * Update a department
 */
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      manager_id, 
      working_hours, 
      shift_patterns, 
      settings,
      is_active 
    } = req.body;

    const department = await Department.findByPk(id);
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

    // Check if new name conflicts with existing departments
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({
        where: {
          name,
          enterprise_id: department.enterprise_id,
          id: { [Op.ne]: id },
          is_active: true
        }
      });

      if (existingDepartment) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Department with this name already exists in the enterprise'
        });
      }
    }

    // If manager_id is being changed, validate the new manager
    if (manager_id !== undefined && manager_id !== department.manager_id) {
      if (manager_id) {
        const manager = await User.findByPk(manager_id);
        if (!manager || manager.enterprise_id !== department.enterprise_id) {
          return res.status(400).json({
            error: 'Validation error',
            message: 'Invalid manager or manager not in the same enterprise'
          });
        }
      }

      // Update old manager's department_id if they were assigned to this department
      if (department.manager_id) {
        const oldManager = await User.findByPk(department.manager_id);
        if (oldManager && oldManager.department_id === department.id) {
          await User.update(
            { department_id: null },
            { where: { id: department.manager_id } }
          );
        }
      }

      // Update new manager's department_id
      if (manager_id) {
        await User.update(
          { department_id: department.id },
          { where: { id: manager_id } }
        );
      }
    }

    // Update department
    await department.update({
      name: name || department.name,
      description: description !== undefined ? description : department.description,
      manager_id: manager_id !== undefined ? manager_id : department.manager_id,
      working_hours: working_hours || department.working_hours,
      shift_patterns: shift_patterns || department.shift_patterns,
      settings: settings || department.settings,
      is_active: is_active !== undefined ? is_active : department.is_active
    });

    // Fetch updated department with associations
    const updatedDepartment = await Department.findByPk(id, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
          required: false
        }
      ]
    });

    res.json({
      message: 'Department updated successfully',
      department: updatedDepartment
    });

  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update department'
    });
  }
};

/**
 * Delete a department (soft delete)
 */
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await Department.findByPk(id);
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

    // Check if department has users
    const userCount = await User.count({
      where: { department_id: id }
    });

    if (userCount > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Cannot delete department with assigned users. Please reassign users first.'
      });
    }

    // Soft delete the department
    await department.update({ is_active: false });

    res.json({
      message: 'Department deleted successfully'
    });

  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete department'
    });
  }
};

/**
 * Assign users to a department
 */
const assignUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_ids } = req.body;

    if (!user_ids || !Array.isArray(user_ids)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'user_ids array is required'
      });
    }

    const department = await Department.findByPk(id);
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

    // Validate all users belong to the same enterprise
    const users = await User.findAll({
      where: {
        id: user_ids,
        enterprise_id: department.enterprise_id
      }
    });

    if (users.length !== user_ids.length) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Some users not found or not in the same enterprise'
      });
    }

    // Update users' department_id
    await User.update(
      { department_id: id },
      { where: { id: user_ids } }
    );

    res.json({
      message: 'Users assigned to department successfully',
      assigned_count: users.length
    });

  } catch (error) {
    console.error('Assign users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to assign users to department'
    });
  }
};

/**
 * Remove users from a department
 */
const removeUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_ids } = req.body;

    if (!user_ids || !Array.isArray(user_ids)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'user_ids array is required'
      });
    }

    const department = await Department.findByPk(id);
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

    // Update users' department_id to null
    const result = await User.update(
      { department_id: null },
      {
        where: {
          id: user_ids,
          department_id: id
        }
      }
    );

    res.json({
      message: 'Users removed from department successfully',
      removed_count: result[0]
    });

  } catch (error) {
    console.error('Remove users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove users from department'
    });
  }
};

/**
 * Get department analytics
 */
const getDepartmentAnalytics = async (req, res) => {
  try {
    const { enterpriseId } = req.params;

    // Check enterprise access
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== parseInt(enterpriseId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this enterprise'
      });
    }

    const departments = await Department.findAll({
      where: {
        enterprise_id: enterpriseId,
        is_active: true
      },
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'role'],
          required: false
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'full_name'],
          required: false
        }
      ]
    });

    const analytics = {
      total_departments: departments.length,
      departments_with_managers: departments.filter(d => d.manager_id).length,
      departments_without_managers: departments.filter(d => !d.manager_id).length,
      total_users: 0,
      total_managers: 0,
      total_employees: 0,
      department_breakdown: []
    };

    departments.forEach(dept => {
      const users = dept.users || [];
      const managers = users.filter(u => u.role === 'manager');
      const employees = users.filter(u => u.role === 'employee');

      analytics.total_users += users.length;
      analytics.total_managers += managers.length;
      analytics.total_employees += employees.length;

      analytics.department_breakdown.push({
        id: dept.id,
        name: dept.name,
        manager: dept.manager ? dept.manager.full_name : null,
        user_count: users.length,
        manager_count: managers.length,
        employee_count: employees.length
      });
    });

    res.json({
      analytics
    });

  } catch (error) {
    console.error('Get department analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch department analytics'
    });
  }
};

module.exports = {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignUsers,
  removeUsers,
  getDepartmentAnalytics
};
