const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NotificationPreferences = sequelize.define('NotificationPreferences', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  email_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether user wants to receive email notifications'
  },
  push_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether user wants to receive push notifications'
  },
  sound_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether to play sound for notifications'
  },
  desktop_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether to show desktop notifications'
  },
  // Notification type preferences
  roster_published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  shift_assigned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  shift_unassigned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  swap_request_received: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  swap_request_approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  swap_request_rejected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  swap_request_cancelled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  roster_needs_approval: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  roster_approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  roster_rejected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  schedule_changed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  availability_reminder: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  approval_reminder: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  system_announcement: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  welcome: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // Email-specific preferences
  email_frequency: {
    type: DataTypes.ENUM('immediate', 'hourly', 'daily', 'weekly'),
    allowNull: false,
    defaultValue: 'immediate',
    validate: {
      isIn: [['immediate', 'hourly', 'daily', 'weekly']]
    }
  },
  email_digest: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether to receive digest emails instead of individual emails'
  },
  quiet_hours_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  quiet_hours_start: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '22:00:00'
  },
  quiet_hours_end: {
    type: DataTypes.TIME,
    allowNull: true,
    defaultValue: '08:00:00'
  }
}, {
  tableName: 'notification_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id'],
      unique: true
    }
  ]
});

// Instance methods
NotificationPreferences.prototype.isTypeEnabled = function(notificationType) {
  return this[notificationType] === true;
};

NotificationPreferences.prototype.isInQuietHours = function() {
  if (!this.quiet_hours_enabled) return false;
  
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 8);
  
  // Handle cases where quiet hours span midnight
  if (this.quiet_hours_start > this.quiet_hours_end) {
    return currentTime >= this.quiet_hours_start || currentTime <= this.quiet_hours_end;
  } else {
    return currentTime >= this.quiet_hours_start && currentTime <= this.quiet_hours_end;
  }
};

NotificationPreferences.prototype.shouldSendEmail = function(notificationType) {
  return this.email_enabled && this.isTypeEnabled(notificationType);
};

NotificationPreferences.prototype.shouldSendPush = function(notificationType) {
  return this.push_enabled && this.isTypeEnabled(notificationType) && !this.isInQuietHours();
};

// Class methods
NotificationPreferences.getDefaultPreferences = function() {
  return {
    email_enabled: true,
    push_enabled: true,
    sound_enabled: true,
    desktop_enabled: true,
    roster_published: true,
    shift_assigned: true,
    shift_unassigned: true,
    swap_request_received: true,
    swap_request_approved: true,
    swap_request_rejected: true,
    swap_request_cancelled: true,
    roster_needs_approval: true,
    roster_approved: true,
    roster_rejected: true,
    schedule_changed: true,
    availability_reminder: true,
    approval_reminder: true,
    system_announcement: true,
    welcome: true,
    email_frequency: 'immediate',
    email_digest: false,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00:00',
    quiet_hours_end: '08:00:00'
  };
};

module.exports = NotificationPreferences;
