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
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    res.json({
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user profile'
    });
  }
};



module.exports = {
  register,
  login,
  getProfile,
  createUser
};
