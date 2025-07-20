const { sequelize } = require('../config/database');

/**
 * Manually create notification tables using raw SQL
 * This avoids Sequelize sync issues with ENUM types
 */
async function setupNotificationTables() {
  try {
    console.log('🔄 Setting up notification tables...');

    // Create notification_templates table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notification_templates (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) UNIQUE CHECK (type IN (
          'roster_published',
          'shift_assigned',
          'shift_unassigned',
          'swap_request_received',
          'swap_request_approved',
          'swap_request_rejected',
          'swap_request_cancelled',
          'roster_needs_approval',
          'roster_approved',
          'roster_rejected',
          'schedule_changed',
          'availability_reminder',
          'approval_reminder',
          'system_announcement',
          'welcome'
        )) NOT NULL,
        title_template VARCHAR(200) NOT NULL,
        message_template TEXT NOT NULL,
        email_subject_template VARCHAR(200),
        email_template TEXT,
        priority VARCHAR(10) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
        action_url_template VARCHAR(500),
        expires_in_hours INTEGER CHECK (expires_in_hours > 0 AND expires_in_hours <= 8760),
        is_active BOOLEAN DEFAULT TRUE,
        variables JSON DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ notification_templates table created');

    // Create notification_preferences table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        email_enabled BOOLEAN DEFAULT TRUE,
        push_enabled BOOLEAN DEFAULT TRUE,
        sound_enabled BOOLEAN DEFAULT TRUE,
        desktop_enabled BOOLEAN DEFAULT TRUE,
        roster_published BOOLEAN DEFAULT TRUE,
        shift_assigned BOOLEAN DEFAULT TRUE,
        shift_unassigned BOOLEAN DEFAULT TRUE,
        swap_request_received BOOLEAN DEFAULT TRUE,
        swap_request_approved BOOLEAN DEFAULT TRUE,
        swap_request_rejected BOOLEAN DEFAULT TRUE,
        swap_request_cancelled BOOLEAN DEFAULT TRUE,
        roster_needs_approval BOOLEAN DEFAULT TRUE,
        roster_approved BOOLEAN DEFAULT TRUE,
        roster_rejected BOOLEAN DEFAULT TRUE,
        schedule_changed BOOLEAN DEFAULT TRUE,
        availability_reminder BOOLEAN DEFAULT TRUE,
        approval_reminder BOOLEAN DEFAULT TRUE,
        system_announcement BOOLEAN DEFAULT TRUE,
        welcome BOOLEAN DEFAULT TRUE,
        email_frequency VARCHAR(20) CHECK (email_frequency IN ('immediate', 'hourly', 'daily', 'weekly')) DEFAULT 'immediate',
        email_digest BOOLEAN DEFAULT FALSE,
        quiet_hours_enabled BOOLEAN DEFAULT FALSE,
        quiet_hours_start TIME DEFAULT '22:00:00',
        quiet_hours_end TIME DEFAULT '08:00:00',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ notification_preferences table created');

    // Update notifications table to match our enhanced model
    await sequelize.query(`
      -- Add new columns if they don't exist
      DO $$ 
      BEGIN
        -- Add title column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='title') THEN
          ALTER TABLE notifications ADD COLUMN title VARCHAR(200);
        END IF;
        
        -- Add data column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='data') THEN
          ALTER TABLE notifications ADD COLUMN data JSON DEFAULT '{}';
        END IF;
        
        -- Add priority column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='priority') THEN
          ALTER TABLE notifications ADD COLUMN priority VARCHAR(10) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal';
        END IF;
        
        -- Add read_at column if it doesn't exist (rename from read if needed)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read_at') THEN
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='read') THEN
            -- Convert boolean read to timestamp read_at
            ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;
            UPDATE notifications SET read_at = NOW() WHERE read = TRUE;
            ALTER TABLE notifications DROP COLUMN read;
          ELSE
            ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;
          END IF;
        END IF;
        
        -- Add email_sent column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='email_sent') THEN
          ALTER TABLE notifications ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
        END IF;
        
        -- Add email_sent_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='email_sent_at') THEN
          ALTER TABLE notifications ADD COLUMN email_sent_at TIMESTAMP;
        END IF;
        
        -- Add action_url column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='action_url') THEN
          ALTER TABLE notifications ADD COLUMN action_url VARCHAR(500);
        END IF;
        
        -- Add expires_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='expires_at') THEN
          ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP;
        END IF;
      END $$;
    `);
    console.log('✅ notifications table updated');

    // Update type column constraint if needed
    await sequelize.query(`
      DO $$ 
      BEGIN
        -- Update type column constraint to include new notification types
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='type') THEN
          ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
          ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
            'roster_published',
            'shift_assigned',
            'shift_unassigned',
            'swap_request_received',
            'swap_request_approved',
            'swap_request_rejected',
            'swap_request_cancelled',
            'roster_needs_approval',
            'roster_approved',
            'roster_rejected',
            'schedule_changed',
            'availability_reminder',
            'approval_reminder',
            'system_announcement',
            'welcome'
          ));
        END IF;
      END $$;
    `);
    console.log('✅ notifications type constraint updated');

    // Create indexes for better performance
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
      CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
      CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
      CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
      CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);
    `);
    console.log('✅ Indexes created');

    console.log('🎉 Notification tables setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up notification tables:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  setupNotificationTables()
    .then(() => {
      console.log('✅ Setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupNotificationTables };
