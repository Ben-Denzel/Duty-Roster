# SchedulaX Database Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Core Tables](#core-tables)
4. [Relationships](#relationships)
5. [Indexes and Constraints](#indexes-and-constraints)
6. [Data Types and Validation](#data-types-and-validation)
7. [Migration System](#migration-system)
8. [Seed Data](#seed-data)
9. [Database Setup](#database-setup)
10. [Performance Considerations](#performance-considerations)

## Overview

SchedulaX uses PostgreSQL as its primary database with Sequelize ORM for data modeling and migrations. The database is designed to support multi-tenant enterprise architecture with role-based access control.

### Database Information
- **Database Engine**: PostgreSQL 12+
- **ORM**: Sequelize 6.37.7
- **Character Set**: UTF-8
- **Timezone**: UTC (recommended)
- **Default Database Name**: `duty_roster`

### Key Features
- **Multi-tenant Support**: Isolated data per enterprise
- **Role-based Access**: Hierarchical user permissions
- **Audit Trails**: Timestamps on all records
- **Data Integrity**: Foreign key constraints and validations
- **Notification System**: Comprehensive notification management
- **Flexible JSON Fields**: Settings and metadata storage

## Database Schema

### Entity Relationship Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Enterprises   │    │   Departments   │    │     Users       │
│                 │    │                 │    │                 │
│ • id (PK)       │◄──┤ • id (PK)       │◄──┤ • id (PK)       │
│ • name          │    │ • name          │    │ • full_name     │
│ • created_by    │    │ • enterprise_id │    │ • email         │
│ • created_at    │    │ • manager_id    │    │ • role          │
│ • updated_at    │    │ • created_at    │    │ • enterprise_id │
└─────────────────┘    │ • updated_at    │    │ • department_id │
                       └─────────────────┘    │ • created_at    │
                                              └─────────────────┘
                                                       │
                       ┌─────────────────┐            │
                       │    Rosters      │            │
                       │                 │            │
                       │ • id (PK)       │            │
                       │ • name          │            │
                       │ • department_id │◄───────────┘
                       │ • start_date    │
                       │ • end_date      │
                       │ • status        │
                       │ • created_by    │
                       │ • settings      │
                       │ • metadata      │
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │     Shifts      │
                       │                 │
                       │ • id (PK)       │
                       │ • roster_id     │◄───────────┘
                       │ • date          │
                       │ • start_time    │
                       │ • end_time      │
                       │ • title         │
                       │ • required_staff│
                       └─────────────────┘
                                │
                       ┌─────────────────┐
                       │ShiftAssignments │
                       │                 │
                       │ • id (PK)       │
                       │ • shift_id      │◄───────────┘
                       │ • employee_id   │
                       │ • status        │
                       │ • assigned_at   │
                       └─────────────────┘
```

## Core Tables

### enterprises
Stores enterprise/organization information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique enterprise identifier |
| name | VARCHAR(100) | NOT NULL | Enterprise name |
| created_by | INTEGER | FOREIGN KEY → users(id) | User who created the enterprise |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### users
Stores all user accounts across all enterprises.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| full_name | VARCHAR(100) | NOT NULL | User's full name |
| email | VARCHAR(100) | UNIQUE, NOT NULL | User's email address |
| password_hash | TEXT | NOT NULL | Hashed password |
| role | VARCHAR(20) | NOT NULL, CHECK | User role (systemAdmin, enterpriseAdmin, manager, employee) |
| gender | VARCHAR(10) | NULL | User's gender |
| enterprise_id | INTEGER | FOREIGN KEY → enterprises(id) | Associated enterprise |
| department_id | INTEGER | FOREIGN KEY → departments(id) | Associated department |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Role Constraints:**
```sql
CHECK (role IN ('systemAdmin', 'enterpriseAdmin', 'manager', 'employee'))
```

### departments
Stores department information within enterprises.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique department identifier |
| name | VARCHAR(100) | NOT NULL | Department name |
| enterprise_id | INTEGER | NOT NULL, FOREIGN KEY → enterprises(id) | Parent enterprise |
| manager_id | INTEGER | FOREIGN KEY → users(id) | Department manager |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### rosters
Stores duty roster information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique roster identifier |
| name | VARCHAR(200) | NOT NULL | Roster name |
| description | TEXT | NULL | Roster description |
| department_id | INTEGER | NOT NULL, FOREIGN KEY → departments(id) | Associated department |
| start_date | DATE | NOT NULL | Roster start date |
| end_date | DATE | NOT NULL | Roster end date |
| status | VARCHAR(20) | DEFAULT 'draft' | Roster status |
| created_by | INTEGER | NOT NULL, FOREIGN KEY → users(id) | Creator user |
| settings | JSONB | DEFAULT '{}' | Roster configuration |
| metadata | JSONB | DEFAULT '{}' | Roster metadata |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Status Constraints:**
```sql
CHECK (status IN ('draft', 'published', 'approved', 'archived'))
```

### shifts
Stores individual shift information within rosters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique shift identifier |
| roster_id | INTEGER | NOT NULL, FOREIGN KEY → rosters(id) | Parent roster |
| date | DATE | NOT NULL | Shift date |
| start_time | TIME | NOT NULL | Shift start time |
| end_time | TIME | NOT NULL | Shift end time |
| title | VARCHAR(100) | NOT NULL | Shift title |
| description | TEXT | NULL | Shift description |
| location | VARCHAR(100) | NULL | Shift location |
| required_staff | INTEGER | DEFAULT 1 | Required number of staff |
| skills_required | JSONB | DEFAULT '[]' | Required skills |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### shift_assignments
Stores employee assignments to shifts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique assignment identifier |
| shift_id | INTEGER | NOT NULL, FOREIGN KEY → shifts(id) | Associated shift |
| employee_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) | Assigned employee |
| status | VARCHAR(20) | DEFAULT 'pending' | Assignment status |
| assigned_by | INTEGER | FOREIGN KEY → users(id) | User who made assignment |
| assigned_at | TIMESTAMP | DEFAULT NOW() | Assignment timestamp |
| confirmed_at | TIMESTAMP | NULL | Confirmation timestamp |
| notes | TEXT | NULL | Assignment notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Status Constraints:**
```sql
CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled'))
```

### swap_requests
Stores shift swap requests between employees.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique swap request identifier |
| shift_id | INTEGER | NOT NULL, FOREIGN KEY → shifts(id) | Original shift |
| requested_by | INTEGER | NOT NULL, FOREIGN KEY → users(id) | Requesting employee |
| target_employee_id | INTEGER | FOREIGN KEY → users(id) | Target employee |
| swap_with_shift_id | INTEGER | FOREIGN KEY → shifts(id) | Swap target shift |
| request_type | VARCHAR(20) | DEFAULT 'swap' | Type of request |
| reason | TEXT | NULL | Reason for swap |
| message | TEXT | NULL | Message to target employee |
| status | VARCHAR(20) | DEFAULT 'pending' | Request status |
| manager_response | VARCHAR(20) | DEFAULT 'pending' | Manager approval status |
| target_response | VARCHAR(20) | DEFAULT 'pending' | Target employee response |
| priority | VARCHAR(10) | DEFAULT 'normal' | Request priority |
| compensation_offered | JSONB | DEFAULT '{}' | Compensation details |
| metadata | JSONB | DEFAULT '{}' | Additional metadata |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

## Notification System Tables

### notifications
Stores user notifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique notification identifier |
| user_id | INTEGER | NOT NULL, FOREIGN KEY → users(id) | Target user |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(200) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| data | JSONB | DEFAULT '{}' | Additional data |
| priority | VARCHAR(10) | DEFAULT 'normal' | Notification priority |
| read_at | TIMESTAMP | NULL | Read timestamp |
| email_sent | BOOLEAN | DEFAULT FALSE | Email sent flag |
| email_sent_at | TIMESTAMP | NULL | Email sent timestamp |
| action_url | VARCHAR(500) | NULL | Action URL |
| expires_at | TIMESTAMP | NULL | Expiration timestamp |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Type Constraints:**
```sql
CHECK (type IN (
  'roster_published', 'shift_assigned', 'shift_unassigned',
  'swap_request_received', 'swap_request_approved', 'swap_request_rejected',
  'roster_needs_approval', 'roster_approved', 'schedule_changed',
  'system_announcement', 'welcome'
))
```

### notification_preferences
Stores user notification preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique preference identifier |
| user_id | INTEGER | UNIQUE, NOT NULL, FOREIGN KEY → users(id) | Associated user |
| roster_published | BOOLEAN | DEFAULT TRUE | Roster publication notifications |
| shift_assigned | BOOLEAN | DEFAULT TRUE | Shift assignment notifications |
| swap_request_received | BOOLEAN | DEFAULT TRUE | Swap request notifications |
| email_frequency | VARCHAR(20) | DEFAULT 'immediate' | Email frequency |
| email_digest | BOOLEAN | DEFAULT FALSE | Email digest preference |
| quiet_hours_enabled | BOOLEAN | DEFAULT FALSE | Quiet hours enabled |
| quiet_hours_start | TIME | DEFAULT '22:00:00' | Quiet hours start |
| quiet_hours_end | TIME | DEFAULT '08:00:00' | Quiet hours end |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

### notification_templates
Stores notification message templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique template identifier |
| type | VARCHAR(50) | UNIQUE, NOT NULL | Template type |
| title_template | VARCHAR(200) | NOT NULL | Title template |
| message_template | TEXT | NOT NULL | Message template |
| email_subject_template | VARCHAR(200) | NULL | Email subject template |
| email_template | TEXT | NULL | Email body template |
| priority | VARCHAR(10) | DEFAULT 'normal' | Default priority |
| action_url_template | VARCHAR(500) | NULL | Action URL template |
| is_active | BOOLEAN | DEFAULT TRUE | Template status |
| expires_after_days | INTEGER | NULL | Expiration days |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

## Relationships

### Primary Relationships

#### Enterprise → Departments (One-to-Many)
```sql
ALTER TABLE departments
ADD CONSTRAINT fk_departments_enterprise
FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE;
```

#### Enterprise → Users (One-to-Many)
```sql
ALTER TABLE users
ADD CONSTRAINT fk_users_enterprise
FOREIGN KEY (enterprise_id) REFERENCES enterprises(id) ON DELETE CASCADE;
```

#### Department → Users (One-to-Many)
```sql
ALTER TABLE users
ADD CONSTRAINT fk_users_department
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
```

#### Department → Manager (Many-to-One)
```sql
ALTER TABLE departments
ADD CONSTRAINT fk_departments_manager
FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;
```

#### Department → Rosters (One-to-Many)
```sql
ALTER TABLE rosters
ADD CONSTRAINT fk_rosters_department
FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE;
```

#### Roster → Shifts (One-to-Many)
```sql
ALTER TABLE shifts
ADD CONSTRAINT fk_shifts_roster
FOREIGN KEY (roster_id) REFERENCES rosters(id) ON DELETE CASCADE;
```

#### Shift → Assignments (One-to-Many)
```sql
ALTER TABLE shift_assignments
ADD CONSTRAINT fk_assignments_shift
FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE;
```

#### User → Assignments (One-to-Many)
```sql
ALTER TABLE shift_assignments
ADD CONSTRAINT fk_assignments_employee
FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Notification Relationships

#### User → Notifications (One-to-Many)
```sql
ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

#### User → Notification Preferences (One-to-One)
```sql
ALTER TABLE notification_preferences
ADD CONSTRAINT fk_preferences_user
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

### Swap Request Relationships

#### Shift → Swap Requests (One-to-Many)
```sql
ALTER TABLE swap_requests
ADD CONSTRAINT fk_swap_requests_shift
FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE;
```

#### User → Swap Requests (One-to-Many)
```sql
ALTER TABLE swap_requests
ADD CONSTRAINT fk_swap_requests_requester
FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE;
```

## Indexes and Constraints

### Primary Indexes
All tables have primary key indexes automatically created:
- `enterprises_pkey` on `enterprises(id)`
- `users_pkey` on `users(id)`
- `departments_pkey` on `departments(id)`
- `rosters_pkey` on `rosters(id)`
- `shifts_pkey` on `shifts(id)`
- `shift_assignments_pkey` on `shift_assignments(id)`

### Performance Indexes
```sql
-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_enterprise_id ON users(enterprise_id);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Department indexes
CREATE INDEX idx_departments_enterprise_id ON departments(enterprise_id);
CREATE INDEX idx_departments_manager_id ON departments(manager_id);

-- Roster indexes
CREATE INDEX idx_rosters_department_id ON rosters(department_id);
CREATE INDEX idx_rosters_status ON rosters(status);
CREATE INDEX idx_rosters_dates ON rosters(start_date, end_date);
CREATE INDEX idx_rosters_created_by ON rosters(created_by);

-- Shift indexes
CREATE INDEX idx_shifts_roster_id ON shifts(roster_id);
CREATE INDEX idx_shifts_date ON shifts(date);
CREATE INDEX idx_shifts_time ON shifts(start_time, end_time);

-- Assignment indexes
CREATE INDEX idx_assignments_shift_id ON shift_assignments(shift_id);
CREATE INDEX idx_assignments_employee_id ON shift_assignments(employee_id);
CREATE INDEX idx_assignments_status ON shift_assignments(status);
CREATE INDEX idx_assignments_date ON shift_assignments(assigned_at);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read_at);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_expires ON notifications(expires_at);

-- Swap request indexes
CREATE INDEX idx_swap_requests_shift_id ON swap_requests(shift_id);
CREATE INDEX idx_swap_requests_requester ON swap_requests(requested_by);
CREATE INDEX idx_swap_requests_target ON swap_requests(target_employee_id);
CREATE INDEX idx_swap_requests_status ON swap_requests(status);
```

### Unique Constraints
```sql
-- Ensure unique email addresses
ALTER TABLE users ADD CONSTRAINT unique_users_email UNIQUE (email);

-- Ensure unique notification preferences per user
ALTER TABLE notification_preferences ADD CONSTRAINT unique_preferences_user UNIQUE (user_id);

-- Ensure unique notification template types
ALTER TABLE notification_templates ADD CONSTRAINT unique_template_type UNIQUE (type);
```

### Check Constraints
```sql
-- User role validation
ALTER TABLE users ADD CONSTRAINT check_user_role
CHECK (role IN ('systemAdmin', 'enterpriseAdmin', 'manager', 'employee'));

-- Roster status validation
ALTER TABLE rosters ADD CONSTRAINT check_roster_status
CHECK (status IN ('draft', 'published', 'approved', 'archived'));

-- Assignment status validation
ALTER TABLE shift_assignments ADD CONSTRAINT check_assignment_status
CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled'));

-- Notification priority validation
ALTER TABLE notifications ADD CONSTRAINT check_notification_priority
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Date validation
ALTER TABLE rosters ADD CONSTRAINT check_roster_dates
CHECK (end_date >= start_date);

-- Time validation
ALTER TABLE shifts ADD CONSTRAINT check_shift_times
CHECK (end_time > start_time OR (start_time > end_time AND end_time < '12:00:00'));
```

## Data Types and Validation

### Sequelize Model Validations

#### User Model Validations
```javascript
// User.js
{
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  role: {
    type: DataTypes.ENUM('systemAdmin', 'enterpriseAdmin', 'manager', 'employee'),
    allowNull: false,
    validate: {
      isIn: [['systemAdmin', 'enterpriseAdmin', 'manager', 'employee']]
    }
  }
}
```

#### Roster Model Validations
```javascript
// Roster.js
{
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: '2020-01-01'
    }
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterStartDate(value) {
        if (value <= this.start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  }
}
```

### JSON Field Schemas

#### Roster Settings Schema
```json
{
  "auto_assign": boolean,
  "assignment_strategy": "balanced" | "random" | "preference",
  "max_shifts_per_person": number,
  "min_rest_hours": number,
  "allow_overtime": boolean,
  "notification_settings": {
    "notify_on_assignment": boolean,
    "notify_on_changes": boolean
  }
}
```

#### Roster Metadata Schema
```json
{
  "total_shifts": number,
  "assigned_shifts": number,
  "coverage_percentage": number,
  "last_modified_at": "ISO 8601 timestamp",
  "auto_generated": boolean,
  "template_used": string
}
```

#### Swap Request Compensation Schema
```json
{
  "type": "none" | "monetary" | "time_off" | "future_favor",
  "amount": number,
  "description": string,
  "terms": string
}
```

## Migration System

### Migration Files Structure
Migrations are stored in `backend/src/migrations/` and follow the naming convention:
`YYYYMMDD-HHMMSS-description.js`

#### Example Migration File
```javascript
// 20250118-add-is-active-to-users.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });

    // Add index for performance
    await queryInterface.addIndex('users', ['is_active'], {
      name: 'idx_users_active'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'idx_users_active');
    await queryInterface.removeColumn('users', 'is_active');
  }
};
```

### Running Migrations
```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo

# Rollback all migrations
npx sequelize-cli db:migrate:undo:all

# Check migration status
npx sequelize-cli db:migrate:status
```

### Migration Best Practices
1. **Always provide rollback**: Include `down` method for reversibility
2. **Test migrations**: Test both up and down migrations
3. **Backup before production**: Always backup before running migrations in production
4. **Incremental changes**: Make small, incremental changes
5. **Index management**: Add/remove indexes as needed for performance

## Seed Data

### Notification Templates Seeding
The system includes comprehensive notification templates:

```javascript
// backend/src/seeders/notificationTemplates.js
const defaultTemplates = [
  {
    type: 'roster_published',
    title_template: 'New Roster Published: {{roster_name}}',
    message_template: 'A new duty roster "{{roster_name}}" has been published...',
    email_subject_template: 'New Duty Roster Published - {{roster_name}}',
    priority: 'normal'
  },
  {
    type: 'shift_assigned',
    title_template: 'New Shift Assignment',
    message_template: 'You have been assigned to {{shift_title}} on {{shift_date}}...',
    priority: 'high'
  }
  // ... more templates
];
```

### Sample Data for Development
```sql
-- Sample enterprises
INSERT INTO enterprises (name) VALUES
  ('Tech Solutions Inc'),
  ('Healthcare Systems Ltd'),
  ('Manufacturing Corp');

-- Sample departments
INSERT INTO departments (name, enterprise_id) VALUES
  ('Engineering', 1),
  ('Human Resources', 1),
  ('Emergency Department', 2),
  ('Production', 3);
```

### Seeding Commands
```bash
# Seed notification templates
node backend/src/scripts/setupNotificationTables.js

# Run custom seeders
npx sequelize-cli db:seed:all

# Undo all seeds
npx sequelize-cli db:seed:undo:all
```

## Database Setup

### Initial Setup Script
```bash
#!/bin/bash
# setup-database.sh

# Create database
createdb duty_roster

# Run schema creation
psql -d duty_roster -f database/schema.sql

# Or use Sequelize sync
node backend/scripts/setupDatabase.js

# Seed notification templates
node backend/src/scripts/setupNotificationTables.js
```

### Environment Configuration
```bash
# .env file
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duty_roster
DB_USER=postgres
DB_PASSWORD=your_password

# For production with SSL
DB_SSL=true
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### Connection Configuration
```javascript
// backend/src/config/database.js
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'duty_roster',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000,
    idle: 10000
  }
});
```

## Performance Considerations

### Query Optimization

#### Efficient Queries
```javascript
// Good: Use includes for related data
const rosters = await Roster.findAll({
  include: [
    {
      model: Department,
      as: 'department',
      attributes: ['id', 'name']
    },
    {
      model: Shift,
      as: 'shifts',
      include: [{
        model: ShiftAssignment,
        as: 'assignments',
        include: [{
          model: User,
          as: 'employee',
          attributes: ['id', 'full_name']
        }]
      }]
    }
  ],
  where: {
    status: 'published'
  },
  order: [['start_date', 'DESC']]
});
```

#### Pagination Implementation
```javascript
// Efficient pagination
const { count, rows } = await User.findAndCountAll({
  where: {
    enterprise_id: enterpriseId,
    is_active: true
  },
  limit: parseInt(limit) || 10,
  offset: (parseInt(page) - 1) * parseInt(limit) || 0,
  order: [['created_at', 'DESC']]
});
```

### Index Usage Guidelines

#### When to Add Indexes
- **Foreign Keys**: Always index foreign key columns
- **Search Columns**: Columns used in WHERE clauses
- **Sort Columns**: Columns used in ORDER BY
- **Join Columns**: Columns used in JOIN operations
- **Unique Constraints**: Enforce uniqueness efficiently

#### Index Monitoring
```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

### Connection Pool Management
```javascript
// Optimal pool configuration
pool: {
  max: 5,          // Maximum connections
  min: 0,          // Minimum connections
  acquire: 60000,  // Maximum time to get connection
  idle: 10000      // Maximum idle time
}
```

### Backup and Maintenance

#### Regular Backup Script
```bash
#!/bin/bash
# backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="duty_roster_backup_$DATE.sql"

pg_dump -h localhost -U postgres -d duty_roster > $BACKUP_FILE
gzip $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Maintenance Tasks
```sql
-- Analyze tables for query optimization
ANALYZE;

-- Vacuum to reclaim space
VACUUM;

-- Reindex for performance
REINDEX DATABASE duty_roster;

-- Check database size
SELECT
  pg_size_pretty(pg_database_size('duty_roster')) as database_size;
```

---

## Troubleshooting

### Common Issues

#### Connection Problems
```bash
# Test connection
psql -h localhost -U postgres -d duty_roster

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check port availability
netstat -an | grep 5432
```

#### Migration Issues
```bash
# Check migration status
npx sequelize-cli db:migrate:status

# Force migration state
npx sequelize-cli db:migrate:undo:all
npx sequelize-cli db:migrate
```

#### Performance Issues
```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

For additional database support, refer to the PostgreSQL documentation and Sequelize guides.
```
