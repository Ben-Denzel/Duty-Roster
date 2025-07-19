const { User, Department, Enterprise } = require('../models');
const bcrypt = require('bcrypt');

/**
 * Create a new user
 */
const createUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      gender,
      enterprise_id,
      department_id,
      is_active = true
    } = req.body;

    // Validation
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name, email, password, and role are required'
      });
    }

    // Check if user has permission (only system admin and enterprise admin)
    if (!['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can create users'
      });
    }

    // Validate role
    const validRoles = ['systemAdmin', 'enterpriseAdmin', 'manager', 'employee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid role'
      });
    }

    // Only system admin can create system admin
    if (role === 'systemAdmin' && req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system admin can create system admin users'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    // Validate enterprise and department
    if (enterprise_id) {
      const enterprise = await Enterprise.findByPk(enterprise_id);
      if (!enterprise) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Enterprise not found'
        });
      }

      // Enterprise admin can only create users in their enterprise
      if (req.user.role === 'enterpriseAdmin' && req.user.enterprise_id !== enterprise_id) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied to this enterprise'
        });
      }
    }

    if (department_id) {
      const department = await Department.findByPk(department_id);
      if (!department) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Department not found'
        });
      }

      if (enterprise_id && department.enterprise_id !== enterprise_id) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Department does not belong to the specified enterprise'
        });
      }
    }

    // Hash password
    const saltRounds = 12; // Match system admin salt rounds
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      full_name,
      email,
      password_hash,
      role,
      gender,
      enterprise_id,
      department_id,
      is_active
    });

    // Return user without password hash
    const { password_hash: _, ...userResponse } = user.toJSON();

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create user'
    });
  }
};

/**
 * Update a user
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      full_name, 
      email, 
      role, 
      gender, 
      department_id, 
      is_active,
      reset_password 
    } = req.body;

    // Find the user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Check access permissions
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== user.enterprise_id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this user'
      });
    }

    // Validate department if provided
    if (department_id !== undefined && department_id !== null) {
      const department = await Department.findByPk(department_id);
      if (!department || department.enterprise_id !== user.enterprise_id) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Invalid department or department not in the same enterprise'
        });
      }
    }

    // Validate email uniqueness if email is being changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'User with this email already exists'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (gender !== undefined) updateData.gender = gender;
    if (department_id !== undefined) updateData.department_id = department_id;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Handle password reset if requested
    if (reset_password) {
      // Generate a temporary password or use a default one
      // In a real application, you might want to send an email with a reset link
      updateData.password_hash = 'TempPassword123!'; // Will be hashed by model hook
    }

    // Update the user
    await user.update(updateData);

    // Fetch updated user with department information
    const updatedUser = await User.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'role', 'gender', 'department_id', 'is_active', 'created_at', 'updated_at'],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
          required: false
        }
      ]
    });

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user'
    });
  }
};

module.exports = {
  createUser,
  updateUser
};
