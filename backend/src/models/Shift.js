const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shift = sequelize.define('Shift', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roster_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rosters',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      notEmpty: true
    }
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notEmpty: true,
      isAfterStartTime(value) {
        // Handle overnight shifts (e.g., 22:00 to 06:00)
        const startTime = this.start_time;
        if (startTime && value) {
          const startHour = parseInt(startTime.split(':')[0]);
          const startMinute = parseInt(startTime.split(':')[1]);
          const endHour = parseInt(value.split(':')[0]);
          const endMinute = parseInt(value.split(':')[1]);

          const startTotalMinutes = startHour * 60 + startMinute;
          const endTotalMinutes = endHour * 60 + endMinute;

          // If end time is same or before start time, check if it's a valid overnight shift
          if (endTotalMinutes <= startTotalMinutes) {
            // Allow overnight shifts where start is after 15:00 (3 PM) and end is before 12:00 (noon)
            // This covers typical overnight shifts like 17:00-01:00, 22:00-06:00, etc.
            if (!(startHour >= 15 && endHour <= 12)) {
              throw new Error('End time must be after start time for same-day shifts');
            }
          }
        }
      }
    }
  },
  shift_type: {
    type: DataTypes.ENUM('day', 'night', 'weekend', 'holiday'),
    allowNull: false,
    validate: {
      isIn: [['day', 'night', 'weekend', 'holiday']]
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: [0, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  required_staff: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 50
    }
  },
  assigned_staff: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  responsible_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    validate: {
      len: [0, 200]
    }
  },
  requirements: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      skills: [],
      certifications: [],
      experience_level: 'any',
      gender_preference: 'any',
      min_age: null,
      max_age: null
    }
  },
  break_schedule: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      breaks: [],
      lunch_break: null,
      total_break_minutes: 0
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'open', 'filled', 'cancelled'),
    allowNull: false,
    defaultValue: 'draft',
    validate: {
      isIn: [['draft', 'open', 'filled', 'cancelled']]
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'normal',
    validate: {
      isIn: [['low', 'normal', 'high', 'critical']]
    }
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    validate: {
      is: /^#[0-9A-F]{6}$/i // Hex color validation
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'shifts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    afterCreate: async (shift, options) => {
      // Update roster metadata when shift is created
      const Roster = require('./Roster');
      const roster = await Roster.findByPk(shift.roster_id);
      if (roster) {
        const totalShifts = (roster.metadata?.total_shifts || 0) + 1;
        await roster.update({
          metadata: {
            ...roster.metadata,
            total_shifts: totalShifts
          }
        });
      }
    },
    afterDestroy: async (shift, options) => {
      // Update roster metadata when shift is deleted
      const Roster = require('./Roster');
      const roster = await Roster.findByPk(shift.roster_id);
      if (roster) {
        const totalShifts = Math.max((roster.metadata?.total_shifts || 1) - 1, 0);
        await roster.update({
          metadata: {
            ...roster.metadata,
            total_shifts: totalShifts
          }
        });
      }
    }
  }
});

module.exports = Shift;
