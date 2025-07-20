-- Create database (run this manually in PostgreSQL)
-- CREATE DATABASE duty_roster;

-- ENTERPRISES
CREATE TABLE IF NOT EXISTS enterprises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('systemAdmin', 'enterpriseAdmin', 'manager', 'employee')) NOT NULL,
  gender VARCHAR(10),
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  department_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraint for enterprises.created_by after users table is created
ALTER TABLE enterprises ADD CONSTRAINT fk_enterprises_created_by 
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  manager_id INTEGER,
  working_hours JSON DEFAULT '{"monday":{"start":"09:00","end":"17:00","enabled":true},"tuesday":{"start":"09:00","end":"17:00","enabled":true},"wednesday":{"start":"09:00","end":"17:00","enabled":true},"thursday":{"start":"09:00","end":"17:00","enabled":true},"friday":{"start":"09:00","end":"17:00","enabled":true},"saturday":{"start":"09:00","end":"17:00","enabled":false},"sunday":{"start":"09:00","end":"17:00","enabled":false}}',
  shift_patterns JSON DEFAULT '{"morning":{"start":"06:00","end":"14:00","enabled":true},"afternoon":{"start":"14:00","end":"22:00","enabled":true},"night":{"start":"22:00","end":"06:00","enabled":false}}',
  settings JSON DEFAULT '{"max_consecutive_days":7,"min_rest_hours":12,"allow_overtime":true,"require_manager_approval":true}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraint for users.department_id after departments table is created
ALTER TABLE users ADD CONSTRAINT fk_users_department_id
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;

-- Add foreign key constraint for departments.manager_id after users table is created
ALTER TABLE departments ADD CONSTRAINT fk_departments_manager_id
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- ROSTERS
CREATE TABLE IF NOT EXISTS rosters (
  id SERIAL PRIMARY KEY,
  enterprise_id INTEGER REFERENCES enterprises(id) ON DELETE CASCADE,
  department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published')) DEFAULT 'draft',
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  validated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  validated_at TIMESTAMP,
  rejection_comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SHIFTS
CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  roster_id INTEGER REFERENCES rosters(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type VARCHAR(20) CHECK (shift_type IN ('day', 'night', 'weekend', 'holiday')) NOT NULL,
  responsible_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- SHIFT ASSIGNMENTS
CREATE TABLE IF NOT EXISTS shift_assignments (
  id SERIAL PRIMARY KEY,
  shift_id INTEGER REFERENCES shifts(id) ON DELETE CASCADE,
  employee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(shift_id, employee_id)
);

-- AVAILABILITY
CREATE TABLE IF NOT EXISTS availability (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')) NOT NULL,
  available_from TIME NOT NULL,
  available_to TIME NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, day_of_week)
);

-- SWAP REQUESTS
CREATE TABLE IF NOT EXISTS swap_requests (
  id SERIAL PRIMARY KEY,
  shift_id INTEGER REFERENCES shifts(id) ON DELETE CASCADE,
  requested_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  target_employee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  decision_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) CHECK (type IN (
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
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSON DEFAULT '{}',
  priority VARCHAR(10) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  read_at TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  action_url VARCHAR(500),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATION PREFERENCES
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

-- NOTIFICATION TEMPLATES
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_enterprise_id ON users(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_users_department_id ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_rosters_enterprise_id ON rosters(enterprise_id);
CREATE INDEX IF NOT EXISTS idx_rosters_department_id ON rosters(department_id);
CREATE INDEX IF NOT EXISTS idx_rosters_status ON rosters(status);
CREATE INDEX IF NOT EXISTS idx_shifts_roster_id ON shifts(roster_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(date);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift_id ON shift_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_employee_id ON shift_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_availability_employee_id ON availability(employee_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_shift_id ON swap_requests(shift_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON swap_requests(status);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Notification preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Notification templates indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);
