const { Department, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all shift templates for a department
 */
const getShiftTemplates = async (req, res) => {
  try {
    const { departmentId } = req.params;

    // Find the department
    const department = await Department.findByPk(departmentId, {
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'full_name', 'email'],
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

    // Additional check for managers - they can only access their own department
    if (req.user.role === 'manager' && req.user.department_id !== parseInt(departmentId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied to this department'
      });
    }

    // Convert shift_patterns object to array format for easier frontend handling
    const shiftPatterns = department.shift_patterns || {};
    const templates = Object.keys(shiftPatterns).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      ...shiftPatterns[key],
      department_id: department.id
    }));

    res.json({
      message: 'Shift templates retrieved successfully',
      templates,
      department: {
        id: department.id,
        name: department.name,
        manager: department.manager
      }
    });

  } catch (error) {
    console.error('Get shift templates error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch shift templates'
    });
  }
};

/**
 * Create or update a shift template
 */
const saveShiftTemplate = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { 
      id, 
      name, 
      start, 
      end, 
      enabled, 
      required_staff, 
      break_schedule, 
      color,
      description 
    } = req.body;

    // Validation
    if (!id || !name || !start || !end) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Template ID, name, start time, and end time are required'
      });
    }

    // Find the department
    const department = await Department.findByPk(departmentId);
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

    // Only enterprise admins and system admins can modify templates
    if (!['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can modify shift templates'
      });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Invalid time format. Use HH:MM format'
      });
    }

    // Get current shift patterns
    const currentPatterns = department.shift_patterns || {};

    // Create the new template
    const template = {
      start,
      end,
      enabled: enabled !== undefined ? enabled : true,
      required_staff: required_staff || 1,
      break_schedule: break_schedule || {
        breaks: [],
        lunch_break: null,
        total_break_minutes: 0
      },
      color: color || '#3B82F6',
      description: description || '',
      updated_at: new Date().toISOString(),
      updated_by: req.user.id
    };

    // Update the patterns
    currentPatterns[id] = template;

    // Save to database
    await department.update({
      shift_patterns: currentPatterns
    });

    res.json({
      message: 'Shift template saved successfully',
      template: {
        id,
        name,
        ...template,
        department_id: department.id
      }
    });

  } catch (error) {
    console.error('Save shift template error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save shift template'
    });
  }
};

/**
 * Delete a shift template
 */
const deleteShiftTemplate = async (req, res) => {
  try {
    const { departmentId, templateId } = req.params;

    // Find the department
    const department = await Department.findByPk(departmentId);
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

    // Only enterprise admins and system admins can delete templates
    if (!['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can delete shift templates'
      });
    }

    // Get current shift patterns
    const currentPatterns = department.shift_patterns || {};

    // Check if template exists
    if (!currentPatterns[templateId]) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Shift template not found'
      });
    }

    // Remove the template
    delete currentPatterns[templateId];

    // Save to database
    await department.update({
      shift_patterns: currentPatterns
    });

    res.json({
      message: 'Shift template deleted successfully'
    });

  } catch (error) {
    console.error('Delete shift template error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete shift template'
    });
  }
};

/**
 * Get default shift templates
 */
const getDefaultTemplates = async (req, res) => {
  try {
    const defaultTemplates = [
      {
        id: 'morning',
        name: 'Morning Shift',
        start: '06:00',
        end: '14:00',
        enabled: true,
        required_staff: 2,
        color: '#F59E0B',
        description: 'Standard morning shift',
        break_schedule: {
          breaks: [
            { start: '09:00', end: '09:15', name: 'Morning Break' }
          ],
          lunch_break: { start: '12:00', end: '12:30', name: 'Lunch' },
          total_break_minutes: 45
        }
      },
      {
        id: 'afternoon',
        name: 'Afternoon Shift',
        start: '14:00',
        end: '22:00',
        enabled: true,
        required_staff: 2,
        color: '#3B82F6',
        description: 'Standard afternoon shift',
        break_schedule: {
          breaks: [
            { start: '17:00', end: '17:15', name: 'Afternoon Break' }
          ],
          lunch_break: { start: '19:00', end: '19:30', name: 'Dinner' },
          total_break_minutes: 45
        }
      },
      {
        id: 'night',
        name: 'Night Shift',
        start: '22:00',
        end: '06:00',
        enabled: false,
        required_staff: 1,
        color: '#6366F1',
        description: 'Overnight shift',
        break_schedule: {
          breaks: [
            { start: '01:00', end: '01:15', name: 'Night Break' }
          ],
          lunch_break: { start: '03:00', end: '03:30', name: 'Night Meal' },
          total_break_minutes: 45
        }
      }
    ];

    res.json({
      message: 'Default templates retrieved successfully',
      templates: defaultTemplates
    });

  } catch (error) {
    console.error('Get default templates error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch default templates'
    });
  }
};

module.exports = {
  getShiftTemplates,
  saveShiftTemplate,
  deleteShiftTemplate,
  getDefaultTemplates
};
