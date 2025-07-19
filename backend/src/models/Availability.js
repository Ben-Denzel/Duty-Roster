const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Availability = sequelize.define('Availability', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
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
  day_of_week: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0, // Sunday = 0
      max: 6  // Saturday = 6
    }
  },
  availability_type: {
    type: DataTypes.ENUM('available', 'unavailable', 'preferred', 'limited'),
    allowNull: false,
    defaultValue: 'available',
    validate: {
      isIn: [['available', 'unavailable', 'preferred', 'limited']]
    }
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: true,
    validate: {
      isAfterStartTime(value) {
        if (this.start_time && value && value <= this.start_time) {
          throw new Error('End time must be after start time');
        }
      }
    }
  },
  shift_types: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: ['day', 'night', 'weekend', 'holiday'],
    validate: {
      isValidShiftTypes(value) {
        if (value && Array.isArray(value)) {
          const validTypes = ['day', 'night', 'weekend', 'holiday'];
          const invalidTypes = value.filter(type => !validTypes.includes(type));
          if (invalidTypes.length > 0) {
            throw new Error(`Invalid shift types: ${invalidTypes.join(', ')}`);
          }
        }
      }
    }
  },
  max_hours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 24
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  recurrence_pattern: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      type: 'none', // 'weekly', 'monthly', 'custom'
      interval: 1,
      days_of_week: [],
      end_date: null,
      exceptions: []
    }
  },
  priority: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
      max: 10
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'cancelled'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'expired', 'cancelled']]
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
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'availability',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['employee_id', 'date']
    },
    {
      fields: ['employee_id', 'day_of_week']
    },
    {
      fields: ['date', 'availability_type']
    },
    {
      fields: ['expires_at']
    },
    {
      unique: true,
      fields: ['employee_id', 'date', 'availability_type'],
      name: 'unique_employee_date_type'
    }
  ],
  hooks: {
    beforeCreate: (availability, options) => {
      // Set day_of_week based on date
      if (availability.date) {
        const date = new Date(availability.date);
        availability.day_of_week = date.getDay();
      }
      
      // Set expiration date for temporary availability
      if (!availability.expires_at && !availability.is_recurring) {
        const expirationDate = new Date(availability.date);
        expirationDate.setDate(expirationDate.getDate() + 1);
        availability.expires_at = expirationDate;
      }
    },
    beforeUpdate: (availability, options) => {
      // Update day_of_week if date changed
      if (availability.changed('date')) {
        const date = new Date(availability.date);
        availability.day_of_week = date.getDay();
      }
    }
  },
  validate: {
    // Ensure time range is valid for limited availability
    validTimeRange() {
      if (this.availability_type === 'limited') {
        if (!this.start_time || !this.end_time) {
          throw new Error('Limited availability must have start and end times');
        }
      }
    },
    
    // Ensure date is not in the past for new availability
    notInPast() {
      if (this.isNewRecord && this.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const availabilityDate = new Date(this.date);
        
        if (availabilityDate < today) {
          throw new Error('Cannot set availability for past dates');
        }
      }
    },
    
    // Ensure recurring pattern is valid
    validRecurrencePattern() {
      if (this.is_recurring && this.recurrence_pattern) {
        const pattern = this.recurrence_pattern;
        if (pattern.type === 'weekly' && (!pattern.days_of_week || pattern.days_of_week.length === 0)) {
          throw new Error('Weekly recurrence must specify days of week');
        }
      }
    }
  }
});

module.exports = Availability;
