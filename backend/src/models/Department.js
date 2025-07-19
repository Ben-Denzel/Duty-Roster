const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
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
  enterprise_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'enterprises',
      key: 'id'
    }
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  working_hours: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      monday: { start: '09:00', end: '17:00', enabled: true },
      tuesday: { start: '09:00', end: '17:00', enabled: true },
      wednesday: { start: '09:00', end: '17:00', enabled: true },
      thursday: { start: '09:00', end: '17:00', enabled: true },
      friday: { start: '09:00', end: '17:00', enabled: true },
      saturday: { start: '09:00', end: '17:00', enabled: false },
      sunday: { start: '09:00', end: '17:00', enabled: false }
    }
  },
  shift_patterns: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      morning: { start: '06:00', end: '14:00', enabled: true },
      afternoon: { start: '14:00', end: '22:00', enabled: true },
      night: { start: '22:00', end: '06:00', enabled: false }
    }
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      max_consecutive_days: 7,
      min_rest_hours: 12,
      allow_overtime: true,
      require_manager_approval: true
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'departments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Department;
