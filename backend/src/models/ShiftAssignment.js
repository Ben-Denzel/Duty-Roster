const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ShiftAssignment = sequelize.define('ShiftAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shift_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'shifts',
      key: 'id'
    }
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('assigned', 'confirmed', 'declined', 'completed', 'no_show'),
    allowNull: false,
    defaultValue: 'assigned',
    validate: {
      isIn: [['assigned', 'confirmed', 'declined', 'completed', 'no_show']]
    }
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: [0, 50]
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  overtime_hours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 24
    }
  },
  break_taken: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      breaks: [],
      total_minutes: 0,
      lunch_taken: false
    }
  },
  performance_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'shift_assignments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['shift_id', 'employee_id']
    },
    {
      fields: ['employee_id', 'created_at']
    },
    {
      fields: ['shift_id', 'status']
    }
  ],
  hooks: {
    afterCreate: async (assignment, options) => {
      // Update shift assigned_staff count
      const Shift = require('./Shift');
      const shift = await Shift.findByPk(assignment.shift_id);
      if (shift) {
        await shift.increment('assigned_staff');
        
        // Update shift status if fully staffed
        if (shift.assigned_staff + 1 >= shift.required_staff) {
          await shift.update({ status: 'filled' });
        }
      }
    },
    afterDestroy: async (assignment, options) => {
      // Update shift assigned_staff count
      const Shift = require('./Shift');
      const shift = await Shift.findByPk(assignment.shift_id);
      if (shift) {
        await shift.decrement('assigned_staff');
        
        // Update shift status if no longer fully staffed
        if (shift.assigned_staff - 1 < shift.required_staff && shift.status === 'filled') {
          await shift.update({ status: 'open' });
        }
      }
    },
    beforeSave: (assignment, options) => {
      // Auto-set confirmation timestamp
      if (assignment.changed('status') && assignment.status === 'confirmed' && !assignment.confirmed_at) {
        assignment.confirmed_at = new Date();
      }
    }
  },
  validate: {
    // Ensure employee doesn't have conflicting shifts
    async noConflictingShifts() {
      if (this.shift_id && this.employee_id) {
        const Shift = require('./Shift');
        const currentShift = await Shift.findByPk(this.shift_id);
        
        if (currentShift) {
          // Find other assignments for the same employee on the same date
          const conflictingAssignments = await ShiftAssignment.findAll({
            where: {
              employee_id: this.employee_id,
              id: { [require('sequelize').Op.ne]: this.id || 0 }
            },
            include: [{
              model: Shift,
              as: 'shift',
              where: {
                date: currentShift.date
              }
            }]
          });
          
          // Check for time conflicts
          for (const conflictAssignment of conflictingAssignments) {
            const conflictShift = conflictAssignment.shift;
            
            // Simple time overlap check (doesn't handle overnight shifts perfectly)
            const currentStart = currentShift.start_time;
            const currentEnd = currentShift.end_time;
            const conflictStart = conflictShift.start_time;
            const conflictEnd = conflictShift.end_time;
            
            if ((currentStart < conflictEnd && currentEnd > conflictStart)) {
              throw new Error(`Employee already has a conflicting shift on ${currentShift.date}`);
            }
          }
        }
      }
    }
  }
});

module.exports = ShiftAssignment;
