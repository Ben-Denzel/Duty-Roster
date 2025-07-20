const { sequelize } = require('../config/database');
const { seedNotificationTemplates } = require('../seeders/notificationTemplates');
const { setupNotificationTables } = require('./setupNotificationTables');

/**
 * Initialize notification system
 * - Sync database tables
 * - Seed notification templates
 */
async function initializeNotifications() {
  try {
    console.log('🔄 Initializing notification system...');

    // Setup notification tables manually to avoid Sequelize sync issues
    console.log('📊 Setting up notification tables...');
    await setupNotificationTables();
    console.log('✅ Notification tables setup completed');

    // Seed notification templates
    console.log('📧 Seeding notification templates...');
    await seedNotificationTemplates();
    console.log('✅ Notification templates seeded successfully');

    console.log('🎉 Notification system initialized successfully!');

  } catch (error) {
    console.error('❌ Error initializing notification system:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  initializeNotifications()
    .then(() => {
      console.log('✅ Initialization complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeNotifications };
