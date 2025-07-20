const { sequelize } = require('../config/database');
const User = require('./User');
const Enterprise = require('./Enterprise');
const Department = require('./Department');
const Roster = require('./Roster');
const Shift = require('./Shift');
const ShiftAssignment = require('./ShiftAssignment');
const SwapRequest = require('./SwapRequest');

const Notification = require('./Notification');
const NotificationPreferences = require('./NotificationPreferences');
const NotificationTemplate = require('./NotificationTemplate');

// Define associations
Enterprise.hasMany(User, { foreignKey: 'enterprise_id', as: 'users' });
Enterprise.hasMany(Department, { foreignKey: 'enterprise_id', as: 'departments' });
Enterprise.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.belongsTo(Enterprise, { foreignKey: 'enterprise_id', as: 'enterprise' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

Department.belongsTo(Enterprise, { foreignKey: 'enterprise_id', as: 'enterprise' });
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });
Department.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

// Roster associations
Roster.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Roster.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Roster.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
Roster.hasMany(Shift, { foreignKey: 'roster_id', as: 'shifts' });

Department.hasMany(Roster, { foreignKey: 'department_id', as: 'rosters' });
User.hasMany(Roster, { foreignKey: 'created_by', as: 'created_rosters' });
User.hasMany(Roster, { foreignKey: 'approved_by', as: 'approved_rosters' });

// Shift associations
Shift.belongsTo(Roster, { foreignKey: 'roster_id', as: 'roster' });
Shift.belongsTo(User, { foreignKey: 'responsible_id', as: 'responsible' });
Shift.hasMany(ShiftAssignment, { foreignKey: 'shift_id', as: 'assignments' });
Shift.hasMany(SwapRequest, { foreignKey: 'shift_id', as: 'swap_requests' });

User.hasMany(Shift, { foreignKey: 'responsible_id', as: 'responsible_shifts' });

// ShiftAssignment associations
ShiftAssignment.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });
ShiftAssignment.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });

User.hasMany(ShiftAssignment, { foreignKey: 'employee_id', as: 'shift_assignments' });

// SwapRequest associations
SwapRequest.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });
SwapRequest.belongsTo(Shift, { foreignKey: 'swap_with_shift_id', as: 'swap_with_shift' });
SwapRequest.belongsTo(User, { foreignKey: 'requested_by', as: 'requester' });
SwapRequest.belongsTo(User, { foreignKey: 'target_employee_id', as: 'target_employee' });
SwapRequest.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

User.hasMany(SwapRequest, { foreignKey: 'requested_by', as: 'requested_swaps' });
User.hasMany(SwapRequest, { foreignKey: 'target_employee_id', as: 'target_swaps' });
User.hasMany(SwapRequest, { foreignKey: 'manager_id', as: 'managed_swaps' });



// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// NotificationPreferences associations
NotificationPreferences.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(NotificationPreferences, { foreignKey: 'user_id', as: 'notification_preferences' });

module.exports = {
  sequelize,
  User,
  Enterprise,
  Department,
  Roster,
  Shift,
  ShiftAssignment,
  SwapRequest,

  Notification,
  NotificationPreferences,
  NotificationTemplate
};
