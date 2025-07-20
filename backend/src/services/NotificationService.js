const {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
  User
} = require('../models');
const { Op } = require('sequelize');
const EmailService = require('./EmailService');
const WebSocketService = require('./WebSocketService');

class NotificationService {
  /**
   * Create a notification for a user
   * @param {Object} options - Notification options
   * @param {number} options.userId - User ID to send notification to
   * @param {string} options.type - Notification type
   * @param {Object} options.variables - Variables for template rendering
   * @param {Object} options.overrides - Override template values
   * @returns {Promise<Notification>}
   */
  async createNotification({ userId, type, variables = {}, overrides = {} }) {
    try {
      // Get notification template
      const template = await NotificationTemplate.findOne({
        where: { type, is_active: true }
      });

      if (!template) {
        throw new Error(`No active template found for notification type: ${type}`);
      }

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);

      // Check if user wants this type of notification
      if (!preferences.isTypeEnabled(type)) {
        console.log(`User ${userId} has disabled notifications for type: ${type}`);
        return null;
      }

      // Render notification content
      const title = overrides.title || template.renderTitle(variables);
      const message = overrides.message || template.renderMessage(variables);
      const actionUrl = overrides.action_url || template.renderActionUrl(variables);
      const priority = overrides.priority || template.priority;
      const expiresAt = overrides.expires_at || template.getExpirationDate();

      // Create notification
      const notification = await Notification.create({
        user_id: userId,
        type,
        title,
        message,
        data: variables,
        priority,
        action_url: actionUrl,
        expires_at: expiresAt
      });

      // Send email if enabled
      if (preferences.shouldSendEmail(type)) {
        await this.sendEmailNotification(notification, template, variables);
      }

      // Send real-time notification
      try {
        WebSocketService.sendNotificationToUser(userId, notification);
      } catch (wsError) {
        console.error('Error sending real-time notification:', wsError);
        // Don't fail the notification creation if WebSocket fails
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple users
   * @param {Object} options - Notification options
   * @param {number[]} options.userIds - Array of user IDs
   * @param {string} options.type - Notification type
   * @param {Object} options.variables - Variables for template rendering
   * @param {Object} options.overrides - Override template values
   * @returns {Promise<Notification[]>}
   */
  async createBulkNotifications({ userIds, type, variables = {}, overrides = {} }) {
    const notifications = [];
    
    for (const userId of userIds) {
      try {
        const notification = await this.createNotification({
          userId,
          type,
          variables,
          overrides
        });
        if (notification) {
          notifications.push(notification);
        }
      } catch (error) {
        console.error(`Error creating notification for user ${userId}:`, error);
      }
    }

    return notifications;
  }

  /**
   * Get user's notification preferences
   * @param {number} userId - User ID
   * @returns {Promise<NotificationPreferences>}
   */
  async getUserPreferences(userId) {
    let preferences = await NotificationPreferences.findOne({
      where: { user_id: userId }
    });

    // Create default preferences if none exist
    if (!preferences) {
      preferences = await NotificationPreferences.create({
        user_id: userId,
        ...NotificationPreferences.getDefaultPreferences()
      });
    }

    return preferences;
  }

  /**
   * Get notifications for a user
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>}
   */
  async getUserNotifications(userId, options = {}) {
    const {
      limit = 20,
      offset = 0,
      unreadOnly = false,
      type = null,
      includeExpired = false
    } = options;

    const whereClause = { user_id: userId };

    if (unreadOnly) {
      whereClause.read_at = null;
    }

    if (type) {
      whereClause.type = type;
    }

    if (!includeExpired) {
      whereClause[Op.or] = [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ];
    }

    const { count, rows } = await Notification.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    // Add days until cleanup for each notification
    const notificationsWithCleanup = rows.map(notification => {
      const notificationData = notification.toJSON();
      notificationData.days_until_cleanup = this.getDaysUntilCleanup(notification);
      return notificationData;
    });

    return {
      notifications: notificationsWithCleanup,
      total: count,
      unread_count: await this.getUnreadCount(userId)
    };
  }

  /**
   * Get unread notification count for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    return await Notification.count({
      where: {
        user_id: userId,
        read_at: null,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } }
        ]
      }
    });
  }

  /**
   * Mark notification as read
   * @param {number} notificationId - Notification ID
   * @param {number} userId - User ID (for security)
   * @returns {Promise<boolean>}
   */
  async markAsRead(notificationId, userId) {
    const [updatedRows] = await Notification.update(
      { read_at: new Date() },
      {
        where: {
          id: notificationId,
          user_id: userId,
          read_at: null
        }
      }
    );

    return updatedRows > 0;
  }

  /**
   * Mark all notifications as read for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>}
   */
  async markAllAsRead(userId) {
    const [updatedRows] = await Notification.update(
      { read_at: new Date() },
      {
        where: {
          user_id: userId,
          read_at: null
        }
      }
    );

    return updatedRows;
  }

  /**
   * Delete old notifications
   * @param {number} daysAfterRead - Delete notifications X days after they've been read (default: 5)
   * @param {number} daysUnread - Delete unread notifications older than X days (default: 30)
   * @returns {Promise<Object>}
   */
  async cleanupOldNotifications(daysAfterRead = 5, daysUnread = 30) {
    // Delete read notifications that are older than X days after being read
    const readCutoffDate = new Date();
    readCutoffDate.setDate(readCutoffDate.getDate() - daysAfterRead);

    const deletedReadCount = await Notification.destroy({
      where: {
        read_at: {
          [Op.not]: null,
          [Op.lt]: readCutoffDate
        }
      }
    });

    // Delete very old unread notifications (to prevent database bloat)
    const unreadCutoffDate = new Date();
    unreadCutoffDate.setDate(unreadCutoffDate.getDate() - daysUnread);

    const deletedUnreadCount = await Notification.destroy({
      where: {
        read_at: null,
        created_at: { [Op.lt]: unreadCutoffDate }
      }
    });

    console.log(`Notification cleanup: ${deletedReadCount} read notifications deleted (older than ${daysAfterRead} days after read), ${deletedUnreadCount} unread notifications deleted (older than ${daysUnread} days)`);

    return {
      deletedReadCount,
      deletedUnreadCount,
      totalDeleted: deletedReadCount + deletedUnreadCount
    };
  }

  /**
   * Get days remaining before notification cleanup
   * @param {Notification} notification - Notification instance
   * @param {number} daysAfterRead - Days after read before cleanup (default: 5)
   * @returns {number|null} Days remaining, or null if not applicable
   */
  getDaysUntilCleanup(notification, daysAfterRead = 5) {
    if (!notification.read_at) {
      return null; // Unread notifications don't have cleanup countdown
    }

    const readDate = new Date(notification.read_at);
    const cleanupDate = new Date(readDate);
    cleanupDate.setDate(cleanupDate.getDate() + daysAfterRead);

    const now = new Date();
    const msRemaining = cleanupDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

    return Math.max(0, daysRemaining);
  }

  /**
   * Send email notification
   * @param {Notification} notification - Notification instance
   * @param {NotificationTemplate} template - Template instance
   * @param {Object} variables - Template variables
   */
  async sendEmailNotification(notification, template, variables) {
    try {
      // Get user information
      const user = await User.findByPk(notification.user_id, {
        attributes: ['id', 'full_name', 'email']
      });

      if (!user || !user.email) {
        console.log(`No email address found for user ${notification.user_id}`);
        return;
      }

      // Render email content
      const subject = template.renderEmailSubject(variables);
      const htmlTemplate = template.renderEmailBody(variables);

      // Send email
      const result = await EmailService.sendNotificationEmail({
        to: user.email,
        userName: user.full_name,
        subject,
        htmlTemplate,
        variables
      });

      // Mark as email sent
      await notification.update({
        email_sent: result.success,
        email_sent_at: new Date()
      });

      if (result.success) {
        console.log(`Email notification sent to ${user.email}: ${notification.title}`);
      } else {
        console.error(`Failed to send email notification: ${result.error}`);
      }

    } catch (error) {
      console.error('Error sending email notification:', error);

      // Mark as failed
      await notification.update({
        email_sent: false,
        email_sent_at: new Date()
      });
    }
  }
}

module.exports = new NotificationService();
