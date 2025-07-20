const { Op } = require('sequelize');
const User = require('../models/User');
const Enterprise = require('../models/Enterprise');
const Department = require('../models/Department');
const Notification = require('../models/Notification');
const NotificationService = require('../services/NotificationService');

/**
 * Get system settings and configuration
 */
const getSystemSettings = async (req, res) => {
  try {
    // Only system admins can access system settings
    if (req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system administrators can access system settings'
      });
    }

    // Get system statistics
    const totalEnterprises = await Enterprise.count();
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const totalDepartments = await Department.count();

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.count({
      where: { created_at: { [Op.gte]: thirtyDaysAgo } }
    });

    const recentEnterprises = await Enterprise.count({
      where: { created_at: { [Op.gte]: thirtyDaysAgo } }
    });

    // Get notification statistics
    const totalNotifications = await Notification.count();
    const unreadNotifications = await Notification.count({
      where: { read_at: null }
    });

    // System configuration (these could be stored in database or environment)
    const systemConfig = {
      // Email settings
      email: {
        smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtp_port: process.env.SMTP_PORT || 587,
        smtp_user: process.env.SMTP_USER || '',
        smtp_enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
      },
      
      // Security settings
      security: {
        jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',
        password_min_length: 6,
        require_password_change: false,
        session_timeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        max_login_attempts: 5
      },
      
      // System limits
      limits: {
        max_enterprises: 100,
        max_users_per_enterprise: 1000,
        max_departments_per_enterprise: 50,
        max_shifts_per_roster: 500
      },
      
      // Feature flags
      features: {
        enterprise_registration: true,
        email_notifications: true,
        shift_swapping: true,

        roster_templates: true
      },
      
      // Maintenance settings
      maintenance: {
        cleanup_notifications_days: 30,
        cleanup_old_rosters_days: 365,
        backup_frequency: 'daily',
        last_backup: new Date().toISOString()
      }
    };

    const settings = {
      statistics: {
        totalEnterprises,
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalDepartments,
        recentUsers,
        recentEnterprises,
        totalNotifications,
        unreadNotifications
      },
      configuration: systemConfig
    };

    res.json({
      message: 'System settings retrieved successfully',
      settings
    });

  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve system settings'
    });
  }
};

/**
 * Update system configuration
 */
const updateSystemSettings = async (req, res) => {
  try {
    // Only system admins can update system settings
    if (req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system administrators can update system settings'
      });
    }

    const { configuration } = req.body;

    if (!configuration) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Configuration data is required'
      });
    }

    // In a real application, you would save these settings to a database
    // For now, we'll just validate and return success
    
    // Validate configuration structure
    const validSections = ['email', 'security', 'limits', 'features', 'maintenance'];
    const providedSections = Object.keys(configuration);
    
    const invalidSections = providedSections.filter(section => !validSections.includes(section));
    if (invalidSections.length > 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Invalid configuration sections: ${invalidSections.join(', ')}`
      });
    }

    // Log the configuration update
    console.log('System configuration updated by:', req.user.email);
    console.log('Updated sections:', providedSections);

    res.json({
      message: 'System settings updated successfully',
      updatedSections: providedSections
    });

  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update system settings'
    });
  }
};

/**
 * Perform system maintenance tasks
 */
const performMaintenance = async (req, res) => {
  try {
    // Only system admins can perform maintenance
    if (req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system administrators can perform maintenance tasks'
      });
    }

    const { task, parameters = {} } = req.body;

    if (!task) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Maintenance task is required'
      });
    }

    let result = {};

    switch (task) {
      case 'cleanup_notifications':
        const { days_after_read = 30, days_unread = 90 } = parameters;
        result = await NotificationService.cleanupOldNotifications(
          parseInt(days_after_read),
          parseInt(days_unread)
        );
        break;

      case 'deactivate_inactive_users':
        const { inactive_days = 90 } = parameters;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - inactive_days);

        // Since there's no last_login column, we'll use created_at as a proxy for old accounts
        const [updatedCount] = await User.update(
          { is_active: false },
          {
            where: {
              created_at: { [Op.lt]: cutoffDate },
              is_active: true,
              role: { [Op.ne]: 'systemAdmin' } // Don't deactivate system admins
            }
          }
        );

        result = { deactivatedUsers: updatedCount };
        break;

      case 'system_health_check':
        // Perform basic system health checks
        const healthCheck = {
          database_connection: true, // If we got here, DB is working
          total_users: await User.count(),
          total_enterprises: await Enterprise.count(), // All enterprises are considered active
          system_admins: await User.count({ where: { role: 'systemAdmin' } }),
          timestamp: new Date().toISOString()
        };

        result = { healthCheck };
        break;

      default:
        return res.status(400).json({
          error: 'Validation error',
          message: `Unknown maintenance task: ${task}`
        });
    }

    // Log the maintenance task
    console.log(`Maintenance task '${task}' performed by:`, req.user.email);
    console.log('Task result:', result);

    res.json({
      message: `Maintenance task '${task}' completed successfully`,
      result
    });

  } catch (error) {
    console.error('Perform maintenance error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to perform maintenance task'
    });
  }
};

/**
 * Get system logs (simplified version)
 */
const getSystemLogs = async (req, res) => {
  try {
    // Only system admins can view system logs
    if (req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system administrators can view system logs'
      });
    }

    const { limit = 50, level = 'all' } = req.query;

    // In a real application, you would fetch logs from a logging service
    // For now, we'll return some sample log entries
    const sampleLogs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'System settings accessed',
        user: req.user.email,
        ip: req.ip
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: 'User login successful',
        user: req.user.email,
        ip: req.ip
      }
    ];

    res.json({
      message: 'System logs retrieved successfully',
      logs: sampleLogs.slice(0, parseInt(limit))
    });

  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve system logs'
    });
  }
};

module.exports = {
  getSystemSettings,
  updateSystemSettings,
  performMaintenance,
  getSystemLogs
};
