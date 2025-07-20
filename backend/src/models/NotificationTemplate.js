const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationTemplate = sequelize.define('NotificationTemplate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM(
      'roster_published',
      'shift_assigned',
      'shift_unassigned',
      'swap_request_received',
      'swap_request_approved',
      'swap_request_rejected',
      'swap_request_cancelled',
      'roster_needs_approval',
      'roster_approved',
      'roster_rejected',
      'schedule_changed',
      'availability_reminder',
      'approval_reminder',
      'system_announcement',
      'welcome'
    ),
    allowNull: false,
    validate: {
      isIn: [[
        'roster_published',
        'shift_assigned',
        'shift_unassigned',
        'swap_request_received',
        'swap_request_approved',
        'swap_request_rejected',
        'swap_request_cancelled',
        'roster_needs_approval',
        'roster_approved',
        'roster_rejected',
        'schedule_changed',
        'availability_reminder',
        'approval_reminder',
        'system_announcement',
        'welcome'
      ]]
    }
  },
  title_template: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    },
    comment: 'Template for notification title with placeholders like {{roster_name}}'
  },
  message_template: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    },
    comment: 'Template for notification message with placeholders'
  },
  email_subject_template: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: [0, 200]
    },
    comment: 'Template for email subject line'
  },
  email_template: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'HTML template for email notifications'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
    validate: {
      isIn: [['low', 'normal', 'high', 'urgent']]
    }
  },
  action_url_template: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: [0, 500]
    },
    comment: 'Template for action URL with placeholders'
  },
  expires_in_hours: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 8760 // 1 year
    },
    comment: 'Number of hours after which notification expires'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  variables: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of available variables for this template'
  }
}, {
  tableName: 'notification_templates',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['type'],
      unique: true,
      name: 'notification_templates_type_unique'
    },
    {
      fields: ['is_active']
    }
  ]
});

// Instance methods
NotificationTemplate.prototype.renderTitle = function(variables = {}) {
  return this.renderTemplate(this.title_template, variables);
};

NotificationTemplate.prototype.renderMessage = function(variables = {}) {
  return this.renderTemplate(this.message_template, variables);
};

NotificationTemplate.prototype.renderEmailSubject = function(variables = {}) {
  if (!this.email_subject_template) return this.renderTitle(variables);
  return this.renderTemplate(this.email_subject_template, variables);
};

NotificationTemplate.prototype.renderEmailBody = function(variables = {}) {
  if (!this.email_template) return this.renderMessage(variables);
  return this.renderTemplate(this.email_template, variables);
};

NotificationTemplate.prototype.renderActionUrl = function(variables = {}) {
  if (!this.action_url_template) return null;
  return this.renderTemplate(this.action_url_template, variables);
};

NotificationTemplate.prototype.renderTemplate = function(template, variables = {}) {
  let rendered = template;
  
  // Replace placeholders like {{variable_name}} with actual values
  Object.keys(variables).forEach(key => {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(placeholder, variables[key] || '');
  });
  
  return rendered;
};

NotificationTemplate.prototype.getExpirationDate = function() {
  if (!this.expires_in_hours) return null;
  
  const now = new Date();
  return new Date(now.getTime() + (this.expires_in_hours * 60 * 60 * 1000));
};

// Class methods
NotificationTemplate.getDefaultTemplates = function() {
  return [
    {
      type: 'roster_published',
      title_template: 'New Roster Published: {{roster_name}}',
      message_template: 'A new duty roster "{{roster_name}}" has been published for {{department_name}}. Please check your assigned shifts.',
      email_subject_template: 'New Duty Roster Published - {{roster_name}}',
      email_template: '<h2>New Roster Published</h2><p>Hello {{user_name}},</p><p>A new duty roster "<strong>{{roster_name}}</strong>" has been published for {{department_name}}.</p><p>Period: {{start_date}} to {{end_date}}</p><p>Please review your assigned shifts and confirm your availability.</p>',
      priority: 'normal',
      action_url_template: '/rosters/{{roster_id}}',
      expires_in_hours: 168, // 1 week
      variables: ['roster_name', 'department_name', 'user_name', 'start_date', 'end_date', 'roster_id']
    },
    {
      type: 'shift_assigned',
      title_template: 'New Shift Assignment',
      message_template: 'You have been assigned to a shift on {{shift_date}} from {{start_time}} to {{end_time}}.',
      email_subject_template: 'New Shift Assignment - {{shift_date}}',
      email_template: '<h2>New Shift Assignment</h2><p>Hello {{user_name}},</p><p>You have been assigned to a new shift:</p><ul><li><strong>Date:</strong> {{shift_date}}</li><li><strong>Time:</strong> {{start_time}} - {{end_time}}</li><li><strong>Position:</strong> {{position}}</li><li><strong>Location:</strong> {{location}}</li></ul>',
      priority: 'high',
      action_url_template: '/my-schedule',
      expires_in_hours: 72, // 3 days
      variables: ['user_name', 'shift_date', 'start_time', 'end_time', 'position', 'location', 'shift_id']
    },
    {
      type: 'swap_request_received',
      title_template: 'Shift Swap Request',
      message_template: '{{requester_name}} has requested to swap shifts with you on {{shift_date}}.',
      email_subject_template: 'Shift Swap Request from {{requester_name}}',
      email_template: '<h2>Shift Swap Request</h2><p>Hello {{user_name}},</p><p><strong>{{requester_name}}</strong> has requested to swap shifts with you.</p><p><strong>Original Shift:</strong> {{shift_date}} {{start_time}} - {{end_time}}</p><p>Please review and respond to this request.</p>',
      priority: 'high',
      action_url_template: '/shift-swaps/{{swap_request_id}}',
      expires_in_hours: 48, // 2 days
      variables: ['user_name', 'requester_name', 'shift_date', 'start_time', 'end_time', 'swap_request_id']
    }
  ];
};

module.exports = NotificationTemplate;
