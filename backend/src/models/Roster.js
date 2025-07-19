const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Roster = sequelize.define('Roster', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'departments',
      key: 'id'
    }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true
    }
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true,
      isAfterStartDate(value) {
        if (value <= this.start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'review', 'approved', 'published'),
    allowNull: false,
    defaultValue: 'draft',
    validate: {
      isIn: [['draft', 'review', 'approved', 'published']]
    }
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      allow_self_assignment: false,
      require_manager_approval: true,
      auto_assign_shifts: false,
      notification_settings: {
        notify_on_publish: true,
        notify_on_changes: true,
        notify_managers: true
      }
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      total_shifts: 0,
      assigned_shifts: 0,
      coverage_percentage: 0,
      last_modified_by: null,
      last_modified_at: null
    }
  }
}, {
  tableName: 'rosters',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeUpdate: (roster, options) => {
      // Update metadata when roster is modified
      if (roster.changed()) {
        roster.metadata = {
          ...roster.metadata,
          last_modified_by: options.user_id || null,
          last_modified_at: new Date()
        };
      }
    },
    beforeSave: (roster, options) => {
      // Auto-set approval and publish timestamps
      if (roster.changed('status')) {
        if (roster.status === 'approved' && !roster.approved_at) {
          roster.approved_at = new Date();
          roster.approved_by = options.user_id || null;
        }
        if (roster.status === 'published' && !roster.published_at) {
          roster.published_at = new Date();
        }
      }
    }
  }
});

module.exports = Roster;
