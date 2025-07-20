const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get notifications for authenticated user
 * @access  Private
 * @query   page, limit, unread_only, type, include_expired
 */
router.get('/', getNotifications);

/**
 * @route   GET /api/notifications/count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/count', getUnreadCount);

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:notificationId/read', markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', markAllAsRead);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:notificationId', deleteNotification);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get notification preferences
 * @access  Private
 */
router.get('/preferences', getPreferences);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put('/preferences', updatePreferences);

/**
 * @route   POST /api/notifications/test
 * @desc    Create a test notification (for development)
 * @access  Private (System Admin only)
 */
router.post('/test', authorize(['systemAdmin']), createTestNotification);

/**
 * @route   GET /api/notifications/stats
 * @desc    Get notification statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authorize(['systemAdmin', 'enterpriseAdmin']), getNotificationStats);

/**
 * @route   POST /api/notifications/cleanup
 * @desc    Cleanup old notifications
 * @access  Private (System Admin only)
 */
router.post('/cleanup', authorize(['systemAdmin']), cleanupNotifications);

module.exports = router;
