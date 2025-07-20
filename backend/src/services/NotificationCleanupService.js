const NotificationService = require('./NotificationService');

class NotificationCleanupService {
  constructor() {
    this.cleanupInterval = null;
    this.isRunning = false;
  }

  /**
   * Start automatic cleanup service
   * @param {number} intervalHours - How often to run cleanup (in hours, default: 24)
   * @param {number} daysAfterRead - Delete notifications X days after read (default: 5)
   * @param {number} daysUnread - Delete unread notifications older than X days (default: 30)
   */
  start(intervalHours = 24, daysAfterRead = 5, daysUnread = 30) {
    if (this.isRunning) {
      console.log('Notification cleanup service is already running');
      return;
    }

    console.log(`Starting notification cleanup service (every ${intervalHours} hours)`);
    console.log(`- Read notifications will be deleted ${daysAfterRead} days after being read`);
    console.log(`- Unread notifications will be deleted after ${daysUnread} days`);

    // Run cleanup immediately on start
    this.runCleanup(daysAfterRead, daysUnread);

    // Schedule recurring cleanup
    this.cleanupInterval = setInterval(() => {
      this.runCleanup(daysAfterRead, daysUnread);
    }, intervalHours * 60 * 60 * 1000); // Convert hours to milliseconds

    this.isRunning = true;
  }

  /**
   * Stop automatic cleanup service
   */
  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('Notification cleanup service stopped');
  }

  /**
   * Run cleanup manually
   * @param {number} daysAfterRead - Delete notifications X days after read
   * @param {number} daysUnread - Delete unread notifications older than X days
   */
  async runCleanup(daysAfterRead = 5, daysUnread = 30) {
    try {
      console.log('Running notification cleanup...');
      const result = await NotificationService.cleanupOldNotifications(daysAfterRead, daysUnread);
      
      if (result.totalDeleted > 0) {
        console.log(`✅ Notification cleanup completed: ${result.totalDeleted} notifications deleted`);
      } else {
        console.log('✅ Notification cleanup completed: No notifications to delete');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error during notification cleanup:', error);
      throw error;
    }
  }

  /**
   * Get cleanup service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasInterval: this.cleanupInterval !== null
    };
  }
}

module.exports = new NotificationCleanupService();
