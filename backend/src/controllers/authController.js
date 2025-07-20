const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new user (public - for initial setup only)
 */
const register = async (req, res) => {
  try {
    const { full_name, email, password, role, gender, enterprise_id, department_id } = req.body;

    // Validation
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name, email, password, and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      full_name,
      email,
      password_hash: password, // Will be hashed by the model hook
      role,
      gender,
      enterprise_id,
      department_id
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
};

/**
 * Create a new user (admin only)
 */
const createUser = async (req, res) => {
  try {
    const { full_name, email, password, role, gender, enterprise_id, department_id } = req.body;

    // Validation
    if (!full_name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name, email, password, and role are required'
      });
    }

    // Check permissions
    const currentUser = req.user;

    // System admin can create any user
    if (currentUser.role === 'systemAdmin') {
      // Can create any user
    }
    // Enterprise admin can only create users in their enterprise
    else if (currentUser.role === 'enterpriseAdmin') {
      if (role === 'systemAdmin' || role === 'enterpriseAdmin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Enterprise admins cannot create system or enterprise admin accounts'
        });
      }
      // Force enterprise_id to current user's enterprise
      req.body.enterprise_id = currentUser.enterprise_id;
    }
    else {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system and enterprise admins can create users'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      full_name,
      email,
      password_hash: password, // Will be hashed by the model hook
      role,
      gender,
      enterprise_id: req.body.enterprise_id,
      department_id
    });

    res.status(201).json({
      message: 'User created successfully',
      user: user.toJSON()
    });

  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create user'
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
};

/**
 * Get current user profile with detailed information
 */
const getProfile = async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const Enterprise = require('../models/Enterprise');
    const Department = require('../models/Department');
    const Roster = require('../models/Roster');
    const ShiftAssignment = require('../models/ShiftAssignment');
    const Shift = require('../models/Shift');
    const SwapRequest = require('../models/SwapRequest');
    const Notification = require('../models/Notification');

    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Enterprise,
          as: 'enterprise',
          attributes: ['id', 'name', 'created_at']
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name', 'description'],
          include: [
            {
              model: User,
              as: 'manager',
              attributes: ['id', 'full_name', 'email']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Get role-specific statistics
    let profileStats = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (user.role === 'systemAdmin') {
      // System admin stats
      const totalEnterprises = await Enterprise.count();
      const totalUsers = await User.count();
      const totalDepartments = await Department.count();
      const recentUsers = await User.count({
        where: { created_at: { [Op.gte]: thirtyDaysAgo } }
      });

      profileStats = {
        totalEnterprises,
        totalUsers,
        totalDepartments,
        recentUsers,
        accountAge: Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
      };

    } else if (user.role === 'enterpriseAdmin') {
      // Enterprise admin stats
      const enterpriseUsers = await User.count({
        where: { enterprise_id: user.enterprise_id }
      });
      const enterpriseDepartments = await Department.count({
        where: { enterprise_id: user.enterprise_id }
      });
      const recentRosters = await Roster.count({
        where: {
          created_at: { [Op.gte]: thirtyDaysAgo },
          department_id: {
            [Op.in]: await Department.findAll({
              where: { enterprise_id: user.enterprise_id },
              attributes: ['id']
            }).then(depts => depts.map(d => d.id))
          }
        }
      });

      profileStats = {
        enterpriseUsers,
        enterpriseDepartments,
        recentRosters,
        accountAge: Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
      };

    } else if (user.role === 'manager') {
      // Manager stats
      const teamMembers = await User.count({
        where: { department_id: user.department_id }
      });
      const myRosters = await Roster.count({
        where: {
          department_id: user.department_id,
          created_by: user.id
        }
      });
      const pendingApprovals = await Roster.count({
        where: {
          department_id: user.department_id,
          status: 'review'
        }
      });

      profileStats = {
        teamMembers,
        myRosters,
        pendingApprovals,
        accountAge: Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
      };

    } else if (user.role === 'employee') {
      // Employee stats
      const totalAssignments = await ShiftAssignment.count({
        where: { employee_id: user.id }
      });
      const confirmedAssignments = await ShiftAssignment.count({
        where: {
          employee_id: user.id,
          status: 'confirmed'
        }
      });
      const swapRequestsMade = await SwapRequest.count({
        where: { requested_by: user.id }
      });
      const upcomingShifts = await ShiftAssignment.count({
        where: {
          employee_id: user.id,
          status: 'confirmed'
        },
        include: [
          {
            model: Shift,
            as: 'shift',
            where: { date: { [Op.gte]: new Date() } }
          }
        ]
      });

      profileStats = {
        totalAssignments,
        confirmedAssignments,
        swapRequestsMade,
        upcomingShifts,
        acceptanceRate: totalAssignments > 0 ? Math.round((confirmedAssignments / totalAssignments) * 100) : 0,
        accountAge: Math.floor((new Date() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
      };
    }

    // Get recent notifications
    const recentNotifications = await Notification.findAll({
      where: { user_id: user.id },
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'message', 'type', 'read_at', 'created_at']
    });

    // Get unread notification count
    const unreadNotifications = await Notification.count({
      where: {
        user_id: user.id,
        read_at: null
      }
    });

    const profileData = {
      ...user.toJSON(),
      stats: profileStats,
      recentNotifications,
      unreadNotifications
    };

    res.json({
      user: profileData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
};



/**
 * Update current user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { full_name, email, gender, current_password, new_password } = req.body;
    const bcrypt = require('bcryptjs');

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Validate input
    if (!full_name || !email) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Full name and email are required'
      });
    }

    // Check if email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email,
          id: { [require('sequelize').Op.ne]: user.id }
        }
      });
      if (existingUser) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email is already taken'
        });
      }
    }

    // Prepare update data
    const updateData = {
      full_name,
      email,
      gender: gender || null
    };

    // Handle password change
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Current password is required to set new password'
        });
      }

      // Verify current password
      const isValidPassword = await user.validatePassword(current_password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      updateData.password_hash = await bcrypt.hash(new_password, 12);
    }

    // Update user
    await user.update(updateData);

    // Return updated user data (without password hash)
    const updatedUser = await User.findByPk(user.id);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.toJSON()
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  createUser
};
