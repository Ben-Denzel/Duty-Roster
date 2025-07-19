const { User, Enterprise, Department } = require('../models');
const { sequelize } = require('../models');

/**
 * Create a new enterprise with enterprise admin
 */
const createEnterprise = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      enterprise_name, 
      admin_name, 
      admin_email, 
      admin_password, 
      admin_gender 
    } = req.body;

    // Validation
    if (!enterprise_name || !admin_name || !admin_email || !admin_password) {
      await transaction.rollback();
      return res.status(400).json({
        error: 'Validation error',
        message: 'Enterprise name, admin name, email, and password are required'
      });
    }

    // Check if user has permission (only system admin)
    if (req.user.role !== 'systemAdmin') {
      await transaction.rollback();
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system administrators can create enterprises'
      });
    }

    // Check if enterprise name already exists
    const existingEnterprise = await Enterprise.findOne({ 
      where: { name: enterprise_name },
      transaction 
    });
    if (existingEnterprise) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Conflict',
        message: 'Enterprise with this name already exists'
      });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ 
      where: { email: admin_email },
      transaction 
    });
    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    }

    // Create enterprise first
    const enterprise = await Enterprise.create({
      name: enterprise_name,
      created_by: req.user.id
    }, { transaction });

    // Create enterprise admin
    const enterpriseAdmin = await User.create({
      full_name: admin_name,
      email: admin_email,
      password_hash: admin_password, // Will be hashed by model hook
      role: 'enterpriseAdmin',
      gender: admin_gender || null,
      enterprise_id: enterprise.id
    }, { transaction });

    // Update enterprise with created_by reference
    await enterprise.update({
      created_by: enterpriseAdmin.id
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      message: 'Enterprise and administrator created successfully',
      enterprise: {
        id: enterprise.id,
        name: enterprise.name,
        created_at: enterprise.created_at
      },
      admin: enterpriseAdmin.toJSON()
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Enterprise creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create enterprise'
    });
  }
};

/**
 * Get all enterprises (system admin only)
 */
const getEnterprises = async (req, res) => {
  try {
    // Check if user has permission (only system admin)
    if (req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system administrators can view all enterprises'
      });
    }

    const enterprises = await Enterprise.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'users',
          attributes: ['id', 'role'],
          required: false
        },
        {
          model: Department,
          as: 'departments',
          attributes: ['id', 'name', 'is_active'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate statistics for each enterprise
    const enterprisesWithStats = enterprises.map(enterprise => {
      const enterpriseData = enterprise.toJSON();
      enterpriseData.user_count = enterpriseData.users ? enterpriseData.users.length : 0;
      enterpriseData.department_count = enterpriseData.departments ?
        enterpriseData.departments.filter(dept => dept.is_active).length : 0;
      enterpriseData.admin_count = enterpriseData.users ?
        enterpriseData.users.filter(user => user.role === 'enterpriseAdmin').length : 0;
      enterpriseData.manager_count = enterpriseData.users ?
        enterpriseData.users.filter(user => user.role === 'manager').length : 0;
      enterpriseData.employee_count = enterpriseData.users ?
        enterpriseData.users.filter(user => user.role === 'employee').length : 0;

      // Remove the detailed users and departments arrays to keep response clean
      delete enterpriseData.users;
      delete enterpriseData.departments;

      return enterpriseData;
    });

    res.json({
      enterprises: enterprisesWithStats
    });

  } catch (error) {
    console.error('Get enterprises error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch enterprises'
    });
  }
};

/**
 * Get enterprise details
 */
const getEnterprise = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has permission
    if (req.user.role !== 'systemAdmin' && req.user.enterprise_id !== parseInt(id)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this enterprise'
      });
    }

    const enterprise = await Enterprise.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: User,
          as: 'users',
          attributes: ['id', 'full_name', 'email', 'role', 'gender', 'department_id', 'is_active', 'created_at', 'updated_at'],
          where: { enterprise_id: id },
          required: false,
          include: [
            {
              model: Department,
              as: 'department',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        }
      ]
    });

    if (!enterprise) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Enterprise not found'
      });
    }

    res.json({
      enterprise
    });

  } catch (error) {
    console.error('Get enterprise error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch enterprise'
    });
  }
};

module.exports = {
  createEnterprise,
  getEnterprises,
  getEnterprise
};
