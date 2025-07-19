const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SwapRequest = sequelize.define('SwapRequest', {
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
  requested_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  target_employee_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  swap_with_shift_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'shifts',
      key: 'id'
    }
  },
  request_type: {
    type: DataTypes.ENUM('swap', 'cover', 'trade'),
    allowNull: false,
    defaultValue: 'swap',
    validate: {
      isIn: [['swap', 'cover', 'trade']]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected', 'cancelled', 'expired']]
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  manager_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  decision_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  target_response: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'declined']]
    }
  },
  target_response_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  target_message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'normal',
    validate: {
      isIn: [['low', 'normal', 'high', 'urgent']]
    }
  },
  compensation_offered: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      type: 'none',
      amount: 0,
      description: null
    }
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      notifications_sent: [],
      reminders_sent: 0,
      last_reminder_at: null
    }
  }
}, {
  tableName: 'swap_requests',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['requested_by', 'status']
    },
    {
      fields: ['target_employee_id', 'status']
    },
    {
      fields: ['manager_id', 'status']
    },
    {
      fields: ['shift_id']
    },
    {
      fields: ['expires_at']
    }
  ],
  hooks: {
    beforeCreate: (swapRequest, options) => {
      // Set expiration date if not provided (default 7 days)
      if (!swapRequest.expires_at) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7);
        swapRequest.expires_at = expirationDate;
      }
    },
    beforeSave: (swapRequest, options) => {
      // Auto-set decision timestamp
      if (swapRequest.changed('status') && 
          ['approved', 'rejected'].includes(swapRequest.status) && 
          !swapRequest.decision_date) {
        swapRequest.decision_date = new Date();
      }
      
      // Auto-set target response timestamp
      if (swapRequest.changed('target_response') && 
          ['accepted', 'declined'].includes(swapRequest.target_response) && 
          !swapRequest.target_response_at) {
        swapRequest.target_response_at = new Date();
      }
    }
  },
  validate: {
    // Ensure requester is assigned to the shift they want to swap
    async requesterAssignedToShift() {
      if (this.shift_id && this.requested_by) {
        const ShiftAssignment = require('./ShiftAssignment');
        const assignment = await ShiftAssignment.findOne({
          where: {
            shift_id: this.shift_id,
            employee_id: this.requested_by,
            status: ['assigned', 'confirmed']
          }
        });
        
        if (!assignment) {
          throw new Error('Requester must be assigned to the shift they want to swap');
        }
      }
    },
    
    // Ensure target employee is not the same as requester
    differentEmployees() {
      if (this.requested_by && this.target_employee_id && 
          this.requested_by === this.target_employee_id) {
        throw new Error('Cannot request swap with yourself');
      }
    },
    
    // Ensure swap request is not expired
    notExpired() {
      if (this.expires_at && new Date() > this.expires_at && this.status === 'pending') {
        throw new Error('Cannot modify expired swap request');
      }
    }
  }
});

module.exports = SwapRequest;
