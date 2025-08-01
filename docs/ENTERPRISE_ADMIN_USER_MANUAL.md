# SchedulaX Enterprise Administrator User Manual

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Department Management](#department-management)
5. [User Management](#user-management)
6. [Roster Management](#roster-management)
7. [Shift Template Management](#shift-template-management)
8. [Analytics & Reporting](#analytics--reporting)
9. [Notification Management](#notification-management)
10. [Settings & Configuration](#settings--configuration)

## Overview

As an Enterprise Administrator, you manage all aspects of your organization within SchedulaX. You have comprehensive control over departments, users, rosters, and organizational settings.

### Key Responsibilities
- **Department Management**: Create and manage organizational departments
- **User Administration**: Manage all users within your enterprise
- **Roster Oversight**: Oversee all duty rosters across departments
- **Template Management**: Create and maintain shift templates
- **Analytics**: Monitor enterprise performance and usage
- **Configuration**: Configure enterprise-specific settings

### Access Level
Enterprise Administrators have access to:
- All departments within their enterprise
- All users in their organization
- All rosters and schedules
- Enterprise-level analytics and reports
- Configuration and settings management

## Getting Started

### Initial Login
1. Navigate to the SchedulaX login page
2. Enter your Enterprise Administrator credentials
3. You'll be redirected to the Enterprise Dashboard

### First-Time Setup Checklist
After your initial login, complete these essential tasks:

1. **Update Your Profile**
   - Navigate to Profile Settings
   - Update your personal information
   - Change default password if needed
   - Set notification preferences

2. **Review Enterprise Information**
   - Verify enterprise details are correct
   - Update contact information if needed
   - Set enterprise-specific preferences

3. **Create Departments**
   - Set up your organizational structure
   - Create departments based on your organization
   - Assign department managers

4. **Add Users**
   - Import or create user accounts
   - Assign users to appropriate departments
   - Set user roles and permissions

5. **Configure Shift Templates**
   - Create shift patterns for your organization
   - Set up standard working hours
   - Define shift types and requirements

## Dashboard Overview

The Enterprise Administrator Dashboard provides a comprehensive view of your organization:

### Key Metrics
- **Total Departments**: Number of departments in your enterprise
- **Total Users**: All users in your organization
- **Active Rosters**: Currently active duty rosters
- **Pending Approvals**: Rosters awaiting manager approval

### Department Overview
- **Department List**: All departments with key statistics
- **Manager Assignment**: Departments with/without assigned managers
- **User Distribution**: Users per department
- **Recent Activity**: Latest department activities

### User Statistics
- **Role Distribution**: Breakdown of users by role
- **Active Users**: Recently active users
- **New Registrations**: Recently added users
- **Inactive Users**: Users who haven't logged in recently

### Quick Actions
- **Create Department**: Set up a new department
- **Add User**: Create a new user account
- **Manage Rosters**: Access roster management
- **View Reports**: Generate enterprise reports

## Department Management

### Creating a New Department

1. **Navigate to Department Management**
   - Click "Department Management" in the sidebar
   - Click "Create New Department" button

2. **Fill Department Details**
   ```
   Department Name: [e.g., "Human Resources", "Engineering"]
   Description: [Brief description of department function]
   Location: [Physical location or building]
   Cost Center: [Budget/accounting code]
   Working Hours: [Standard department hours]
   ```

3. **Assign Department Manager**
   - Select an existing user as manager
   - Or create a new manager account
   - Set manager permissions and responsibilities

4. **Configure Department Settings**
   - **Shift Requirements**: Minimum staffing levels
   - **Working Patterns**: Standard shift patterns
   - **Approval Workflow**: Roster approval requirements
   - **Notification Settings**: Department-specific notifications

### Managing Existing Departments

#### Department Overview
View comprehensive department information:
- **Basic Details**: Name, description, location
- **Manager Information**: Assigned manager and contact details
- **User Count**: Total users and role distribution
- **Roster Statistics**: Active rosters and completion rates
- **Performance Metrics**: Department efficiency indicators

#### Department Actions
- **Edit Details**: Update department information
- **Change Manager**: Assign a different manager
- **Manage Users**: Add/remove users from department
- **View Rosters**: See all department rosters
- **Generate Reports**: Create department-specific reports

#### User Assignment
- **Add Users**: Assign existing users to department
- **Transfer Users**: Move users between departments
- **Remove Users**: Unassign users from department
- **Bulk Operations**: Manage multiple users simultaneously

### Department Analytics
- **Staffing Levels**: Current vs. required staffing
- **Roster Completion**: Percentage of completed rosters
- **User Activity**: Login frequency and engagement
- **Shift Coverage**: Percentage of shifts with assigned staff
- **Manager Effectiveness**: Approval times and decision quality

## User Management

### User Overview Dashboard
- **Total Users**: All users in your enterprise
- **Role Distribution**: Breakdown by role (managers, employees)
- **Department Assignment**: Users per department
- **Account Status**: Active, inactive, and suspended accounts
- **Recent Activity**: Latest user logins and activities

### Creating New Users

#### Individual User Creation
1. **Navigate to User Management**
   - Click "User Management" in sidebar
   - Click "Create New User" button

2. **Fill User Information**
   ```
   Full Name: [User's complete name]
   Email: [Work email address]
   Role: [Manager/Employee]
   Department: [Select from dropdown]
   Employee ID: [Optional employee identifier]
   Phone: [Contact phone number]
   Start Date: [Employment start date]
   ```

3. **Set Account Details**
   - **Password**: Generate secure password or let user set on first login
   - **Account Status**: Active/Inactive
   - **Permissions**: Role-specific permissions
   - **Notification Preferences**: Default notification settings

#### Bulk User Import
1. **Prepare CSV File**
   - Download the user import template
   - Fill in user information following the format
   - Include required fields: name, email, role, department

2. **Import Process**
   - Click "Import Users" button
   - Upload your CSV file
   - Review import preview
   - Confirm import and send welcome emails

### Managing Existing Users

#### User Search and Filtering
- **Search by Name/Email**: Quick user lookup
- **Filter by Department**: View users in specific departments
- **Filter by Role**: Show only managers or employees
- **Filter by Status**: Active, inactive, or suspended users
- **Sort Options**: By name, department, role, or last login

#### User Profile Management
For each user, you can:
- **View Profile**: Complete user information and activity
- **Edit Details**: Update personal and work information
- **Change Role**: Promote/demote between employee and manager
- **Transfer Department**: Move user to different department
- **Reset Password**: Force password reset for security
- **Suspend Account**: Temporarily disable access
- **Reactivate Account**: Restore suspended accounts

#### Bulk User Operations
- **Bulk Role Changes**: Change roles for multiple users
- **Bulk Department Transfer**: Move multiple users
- **Bulk Notifications**: Send messages to selected users
- **Bulk Suspension**: Suspend multiple accounts
- **Bulk Export**: Export user data for reporting

### User Activity Monitoring
- **Login History**: Track when users access the system
- **Feature Usage**: Monitor which features users utilize
- **Roster Participation**: User engagement with roster assignments
- **Shift Swap Activity**: Frequency of shift swap requests
- **Notification Engagement**: Response to notifications

## Roster Management

### Roster Overview
- **All Rosters**: View rosters across all departments
- **Roster Status**: Draft, published, approved, archived
- **Coverage Analysis**: Shift coverage percentages
- **Approval Queue**: Rosters pending manager approval
- **Recent Changes**: Latest roster modifications

### Creating New Rosters

#### Basic Roster Creation
1. **Navigate to Roster Management**
   - Click "Roster Management" in sidebar
   - Click "Create New Roster" button

2. **Set Roster Parameters**
   ```
   Roster Name: [Descriptive name for the roster]
   Department: [Select target department]
   Start Date: [Roster period start]
   End Date: [Roster period end]
   Description: [Optional roster description]
   ```

3. **Choose Shift Template**
   - Select from existing shift templates
   - Or create custom shift pattern
   - Configure shift times and requirements

4. **Configure Auto-Assignment**
   - **Auto-Generate Shifts**: Automatically create shifts based on template
   - **Auto-Assign Staff**: Automatically assign available employees
   - **Assignment Strategy**: Balanced, random, or preference-based
   - **Constraints**: Maximum shifts per person, rest periods

#### Advanced Roster Options
- **Shift Requirements**: Minimum staffing levels per shift
- **Skill Requirements**: Required qualifications for shifts
- **Preference Consideration**: Factor in employee preferences
- **Conflict Avoidance**: Prevent scheduling conflicts
- **Overtime Management**: Control overtime assignments

### Managing Existing Rosters

#### Roster Actions
- **Edit Roster**: Modify roster details and settings
- **Manage Shifts**: Add, edit, or remove individual shifts
- **Staff Assignment**: Assign or reassign employees to shifts
- **Publish Roster**: Make roster visible to employees
- **Submit for Approval**: Send to managers for approval
- **Archive Roster**: Move completed rosters to archive

#### Shift Management
- **Add Shifts**: Create additional shifts as needed
- **Edit Shift Times**: Modify start and end times
- **Change Requirements**: Update staffing or skill requirements
- **Assign Staff**: Manually assign employees to shifts
- **Handle Conflicts**: Resolve scheduling conflicts
- **Manage Swaps**: Oversee shift swap requests

### Roster Analytics
- **Coverage Reports**: Shift coverage percentages
- **Staffing Analysis**: Actual vs. required staffing levels
- **Employee Workload**: Hours and shift distribution per employee
- **Approval Metrics**: Time to approval and approval rates
- **Cost Analysis**: Labor costs and overtime tracking

## Shift Template Management

### Template Overview
Shift templates define reusable patterns for roster creation:
- **Standard Templates**: Common shift patterns (8-hour, 12-hour, etc.)
- **Custom Templates**: Organization-specific patterns
- **Department Templates**: Templates specific to departments
- **Seasonal Templates**: Templates for different seasons or periods

### Creating Shift Templates

1. **Navigate to Template Management**
   - Access through Roster Management or Settings
   - Click "Create New Template" button

2. **Define Template Basics**
   ```
   Template Name: [Descriptive name]
   Department: [Target department or "All"]
   Description: [Template purpose and usage]
   Template Type: [Fixed, Rotating, Flexible]
   ```

3. **Configure Shift Pattern**
   - **Shift Duration**: Length of each shift
   - **Start Times**: When shifts begin
   - **Days of Week**: Which days the pattern applies
   - **Rotation Cycle**: How often the pattern repeats
   - **Break Times**: Scheduled breaks within shifts

4. **Set Requirements**
   - **Minimum Staff**: Required number of employees per shift
   - **Maximum Staff**: Maximum employees per shift
   - **Skill Requirements**: Required qualifications
   - **Role Requirements**: Specific roles needed

### Template Management
- **Edit Templates**: Modify existing templates
- **Clone Templates**: Create copies for customization
- **Archive Templates**: Remove unused templates
- **Share Templates**: Make available to other departments
- **Import/Export**: Transfer templates between systems

## Analytics & Reporting

### Enterprise Analytics Dashboard
- **User Engagement**: Login frequency and feature usage
- **Roster Performance**: Completion rates and approval times
- **Department Efficiency**: Comparative department performance
- **Resource Utilization**: Staff allocation and coverage
- **Trend Analysis**: Performance trends over time

### Standard Reports

#### User Reports
- **User Activity Report**: Login patterns and engagement
- **Role Distribution Report**: Users by role and department
- **New User Report**: Recent registrations and onboarding
- **Inactive User Report**: Users requiring attention

#### Roster Reports
- **Roster Completion Report**: Completion rates by department
- **Coverage Analysis Report**: Shift coverage percentages
- **Approval Timeline Report**: Time to roster approval
- **Overtime Report**: Overtime hours and costs

#### Department Reports
- **Department Performance Report**: Comparative analysis
- **Staffing Level Report**: Current vs. required staffing
- **Manager Effectiveness Report**: Manager performance metrics
- **Cost Center Report**: Department-wise cost analysis

### Custom Report Builder
Create tailored reports with:
- **Data Selection**: Choose specific data sets
- **Date Ranges**: Define reporting periods
- **Filters**: Apply department, role, or status filters
- **Visualizations**: Charts, graphs, and tables
- **Export Options**: PDF, Excel, or CSV formats
- **Scheduled Reports**: Automatic report generation

### Performance Metrics
- **Key Performance Indicators (KPIs)**:
  - Roster completion rate
  - Average time to approval
  - Employee satisfaction scores
  - Shift coverage percentage
  - Cost per employee hour

## Notification Management

### Enterprise Notification Settings
- **Default Preferences**: Standard notification settings for new users
- **Notification Types**: Configure which notifications are sent
- **Delivery Methods**: Email, in-app, or both
- **Frequency Settings**: Immediate, daily digest, or weekly summary
- **Escalation Rules**: When to escalate unread notifications

### Broadcast Communications
Send messages to groups of users:
- **All Enterprise Users**: Company-wide announcements
- **Department-Specific**: Messages to specific departments
- **Role-Based**: Target managers or employees specifically
- **Custom Groups**: Messages to selected users

### Notification Templates
Customize standard notification messages:
- **Welcome Messages**: New user onboarding
- **Roster Notifications**: Roster publication and updates
- **Approval Requests**: Manager approval notifications
- **System Updates**: Feature updates and maintenance notices

## Settings & Configuration

### Enterprise Settings
- **Basic Information**: Enterprise name, description, contact details
- **Time Zone**: Default time zone for the organization
- **Working Hours**: Standard business hours
- **Holiday Calendar**: Organizational holidays and non-working days
- **Branding**: Logo and color scheme customization

### Security Settings
- **Password Policy**: Password requirements for enterprise users
- **Session Management**: Session timeout and security settings
- **Two-Factor Authentication**: Enable/require 2FA for users
- **Access Controls**: IP restrictions and access policies

### Integration Settings
- **Email Configuration**: SMTP settings for notifications
- **Calendar Integration**: Sync with external calendar systems
- **HR System Integration**: Connect with existing HR systems
- **API Access**: Configure external system integrations

### Backup and Data Management
- **Data Export**: Export enterprise data for backup
- **Data Retention**: Configure data retention policies
- **Archive Settings**: Automatic archiving of old data
- **Compliance**: GDPR and data protection settings

---

## Quick Reference

### Daily Tasks
- Review pending roster approvals
- Check user activity and engagement
- Monitor department performance metrics
- Respond to user support requests

### Weekly Tasks
- Analyze roster completion rates
- Review user feedback and suggestions
- Update shift templates as needed
- Generate weekly performance reports

### Monthly Tasks
- Conduct comprehensive analytics review
- Update enterprise settings and policies
- Review and optimize notification settings
- Plan for upcoming organizational changes

### Key Shortcuts
- **Dashboard**: `/dashboard`
- **Departments**: `/departments`
- **Users**: `/users`
- **Rosters**: `/rosters`
- **Analytics**: `/analytics`

For additional assistance, refer to the system documentation or contact your system administrator.
