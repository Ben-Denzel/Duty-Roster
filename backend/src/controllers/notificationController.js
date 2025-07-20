const { Notification, NotificationPreferences, User } = require('../models');
const { Op } = require('sequelize');
const NotificationService = require('../services/NotificationService');

/**
 * Get notifications for the authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unread_only = false,
      type = null,
      include_expired = false
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await NotificationService.getUserNotifications(req.user.id, {
      limit: parseInt(limit),
      offset,
      unreadOnly: unread_only === 'true',
      type,
      includeExpired: include_expired === 'true'
    });

    res.json({
      message: 'Notifications retrieved successfully',
      notifications: result.notifications,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(result.total / parseInt(limit)),
        total_items: result.total,
        items_per_page: parseInt(limit)
      },
      unread_count: result.unread_count
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Get unread notification count
 */
const getUnreadCount = async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);

    res.json({
      unread_count: count
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get unread count'
    });
  }
};

/**
 * Mark a notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const success = await NotificationService.markAsRead(notificationId, req.user.id);

    if (!success) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Notification not found or already read'
      });
    }

    res.json({
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const updatedCount = await NotificationService.markAllAsRead(req.user.id);

    res.json({
      message: `${updatedCount} notifications marked as read`
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to mark notifications as read'
    });
  }
};

/**
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const deleted = await Notification.destroy({
      where: {
        id: notificationId,
        user_id: req.user.id
      }
    });

    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Notification not found'
      });
    }

    res.json({
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete notification'
    });
  }
};

/**
 * Get notification preferences for the authenticated user
 */
const getPreferences = async (req, res) => {
  try {
    const preferences = await NotificationService.getUserPreferences(req.user.id);

    res.json({
      message: 'Notification preferences retrieved successfully',
      preferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch notification preferences'
    });
  }
};

/**
 * Update notification preferences for the authenticated user
 */
const updatePreferences = async (req, res) => {
  try {
    const preferences = await NotificationService.getUserPreferences(req.user.id);

    // Update preferences with provided data
    await preferences.update(req.body);

    res.json({
      message: 'Notification preferences updated successfully',
      preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update notification preferences'
    });
  }
};

/**
 * Create a test notification (for development/testing)
 */
const createTestNotification = async (req, res) => {
  try {
    // Only allow system admins to create test notifications
    if (req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system administrators can create test notifications'
      });
    }

    const { type, variables = {}, overrides = {} } = req.body;

    const notification = await NotificationService.createNotification({
      userId: req.user.id,
      type,
      variables,
      overrides
    });

    if (!notification) {
      return res.status(400).json({
        error: 'Failed to create notification',
        message: 'Notification type may be disabled for this user'
      });
    }

    res.status(201).json({
      message: 'Test notification created successfully',
      notification
    });

  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create test notification'
    });
  }
};

/**
 * Get notification statistics (for admins)
 */
const getNotificationStats = async (req, res) => {
  try {
    // Only allow admins to view stats
    if (!['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only administrators can view notification statistics'
      });
    }

    const stats = await Notification.findAll({
      attributes: [
        'type',
        [Notification.sequelize.fn('COUNT', '*'), 'total'],
        [Notification.sequelize.fn('COUNT', Notification.sequelize.col('read_at')), 'read'],
        [Notification.sequelize.fn('COUNT', Notification.sequelize.literal('CASE WHEN read_at IS NULL THEN 1 END')), 'unread']
      ],
      group: ['type'],
      raw: true
    });

    res.json({
      message: 'Notification statistics retrieved successfully',
      stats
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch notification statistics'
    });
  }
};

/**
 * Cleanup old notifications (for admins)
 */
const cleanupNotifications = async (req, res) => {
  try {
    // Only allow system admins to run cleanup
    if (req.user.role !== 'systemAdmin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only system administrators can run notification cleanup'
      });
    }

    const { days_after_read = 5, days_unread = 30 } = req.body;

    const result = await NotificationService.cleanupOldNotifications(
      parseInt(days_after_read),
      parseInt(days_unread)
    );

    res.json({
      message: 'Notification cleanup completed successfully',
      result
    });

  } catch (error) {
    console.error('Cleanup notifications error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to cleanup notifications'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  createTestNotification,
  getNotificationStats,
  cleanupNotifications
};
