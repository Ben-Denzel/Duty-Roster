const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  data: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: 'Additional data related to the notification (roster_id, shift_id, etc.)'
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
    validate: {
      isIn: [['low', 'normal', 'high', 'urgent']]
    }
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email_sent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  email_sent_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  action_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: [0, 500]
    },
    comment: 'URL to navigate to when notification is clicked'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Optional expiration date for time-sensitive notifications'
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['read_at']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['expires_at']
    }
  ],
  scopes: {
    unread: {
      where: {
        read_at: null
      }
    },
    read: {
      where: {
        read_at: {
          [sequelize.Sequelize.Op.not]: null
        }
      }
    },
    active: {
      where: {
        [sequelize.Sequelize.Op.or]: [
          { expires_at: null },
          { expires_at: { [sequelize.Sequelize.Op.gt]: new Date() } }
        ]
      }
    },
    byPriority: (priority) => ({
      where: { priority }
    }),
    byType: (type) => ({
      where: { type }
    })
  }
});

// Instance methods
Notification.prototype.markAsRead = function() {
  this.read_at = new Date();
  return this.save();
};

Notification.prototype.markAsUnread = function() {
  this.read_at = null;
  return this.save();
};

Notification.prototype.isRead = function() {
  return this.read_at !== null;
};

Notification.prototype.isExpired = function() {
  return this.expires_at && this.expires_at < new Date();
};

module.exports = Notification;
