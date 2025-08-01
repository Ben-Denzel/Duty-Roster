# SchedulaX System Administrator User Manual

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Enterprise Management](#enterprise-management)
5. [System-Wide User Management](#system-wide-user-management)
6. [Platform Analytics](#platform-analytics)
7. [System Settings](#system-settings)
8. [Notification Management](#notification-management)
9. [Security & Access Control](#security--access-control)
10. [Troubleshooting](#troubleshooting)

## Overview

As a System Administrator, you have the highest level of access in SchedulaX. You are responsible for:
- Managing multiple enterprises across the platform
- Overseeing system-wide operations and analytics
- Configuring global system settings
- Monitoring platform health and performance
- Managing system-level security and access controls

### Key Responsibilities
- **Enterprise Oversight**: Create, manage, and monitor all enterprises
- **Platform Analytics**: Monitor system-wide usage and performance metrics
- **User Management**: Oversee all users across all enterprises
- **System Configuration**: Configure global settings and policies
- **Security Management**: Manage access controls and security policies

## Getting Started

### Initial Login
1. Navigate to the SchedulaX login page
2. Use your system administrator credentials:
   - **Email**: `admin@system.com`
   - **Password**: `password123` (change immediately after first login)
3. You'll be redirected to the System Administrator Dashboard

### First-Time Setup
After your initial login, complete these essential setup tasks:
1. **Change Default Password**: Update your password in Profile Settings
2. **Review System Settings**: Configure global platform settings
3. **Create First Enterprise**: Set up your first enterprise organization
4. **Configure Notifications**: Set up system-wide notification preferences
5. **Review Security Settings**: Configure access controls and policies

## Dashboard Overview

The System Administrator Dashboard provides a comprehensive view of the entire platform:

### Key Metrics Section
- **Total Enterprises**: Number of active enterprises on the platform
- **Total Users**: System-wide user count across all enterprises
- **Active Sessions**: Current logged-in users
- **System Health**: Overall platform health status

### Enterprise Overview
- **Enterprise List**: All enterprises with key metrics
- **Recent Activity**: Latest enterprise activities and changes
- **Health Scores**: Enterprise health indicators
- **Growth Metrics**: User growth and activity trends

### Platform Analytics
- **Usage Statistics**: Daily/weekly/monthly platform usage
- **Performance Metrics**: System response times and uptime
- **Resource Utilization**: Server and database performance
- **Error Monitoring**: System errors and issues

### Quick Actions
- **Create New Enterprise**: Set up a new organization
- **View System Logs**: Access detailed system logs
- **Manage Global Settings**: Configure platform-wide settings
- **User Management**: Access system-wide user management

## Enterprise Management

### Creating a New Enterprise

1. **Navigate to Enterprise Management**
   - Click "Enterprise Management" in the sidebar
   - Click "Create New Enterprise" button

2. **Fill Enterprise Details**
   ```
   Enterprise Name: [Company/Organization Name]
   Description: [Brief description of the organization]
   Industry: [Select from dropdown]
   Size: [Small/Medium/Large/Enterprise]
   Contact Email: [Primary contact email]
   Phone: [Contact phone number]
   Address: [Physical address]
   ```

3. **Configure Initial Settings**
   - **Time Zone**: Set the enterprise's primary time zone
   - **Working Hours**: Define standard working hours
   - **Notification Preferences**: Set default notification settings
   - **Security Policies**: Configure access and security policies

4. **Assign Enterprise Administrator**
   - Create or assign an Enterprise Administrator user
   - Set their permissions and access levels
   - Send welcome email with login credentials

### Managing Existing Enterprises

#### Enterprise Overview
- **Enterprise List**: View all enterprises with key metrics
- **Search & Filter**: Find enterprises by name, status, or industry
- **Sort Options**: Sort by creation date, user count, or activity level

#### Enterprise Details
For each enterprise, you can view:
- **Basic Information**: Name, description, contact details
- **User Statistics**: Total users, active users, role distribution
- **Department Structure**: Number of departments and their managers
- **Activity Metrics**: Recent logins, roster activity, shift assignments
- **Health Score**: Overall enterprise health indicator

#### Enterprise Actions
- **Edit Details**: Update enterprise information
- **Manage Users**: View and manage all users in the enterprise
- **View Departments**: See department structure and management
- **Access Rosters**: View all rosters and schedules
- **Generate Reports**: Create enterprise-specific reports
- **Suspend/Activate**: Temporarily disable or reactivate enterprise

### Enterprise Health Monitoring

#### Health Score Calculation
The health score is calculated based on:
- **User Activity**: Login frequency and engagement
- **Department Management**: Departments with assigned managers
- **Roster Completion**: Percentage of completed rosters
- **System Usage**: Feature adoption and utilization
- **Data Quality**: Completeness of user and department data

#### Health Indicators
- **Green (80-100%)**: Excellent health, fully operational
- **Yellow (60-79%)**: Good health, minor issues to address
- **Orange (40-59%)**: Fair health, attention needed
- **Red (0-39%)**: Poor health, immediate action required

#### Improvement Recommendations
The system provides automated recommendations:
- **Missing Managers**: Departments without assigned managers
- **Inactive Users**: Users who haven't logged in recently
- **Incomplete Rosters**: Rosters with low completion rates
- **Underutilized Features**: Features that could improve efficiency

## System-Wide User Management

### User Overview Dashboard
- **Total User Count**: All users across all enterprises
- **User Distribution**: Breakdown by role and enterprise
- **Recent Registrations**: Newly created user accounts
- **Active Sessions**: Currently logged-in users
- **Inactive Users**: Users who haven't logged in recently

### User Search and Filtering
Advanced search capabilities:
- **By Enterprise**: Filter users by specific enterprise
- **By Role**: Filter by system role (admin, manager, employee)
- **By Status**: Active, inactive, or suspended users
- **By Department**: Users in specific departments
- **By Registration Date**: Users created within date ranges

### User Management Actions

#### Individual User Management
- **View Profile**: Complete user information and activity
- **Edit Details**: Update user information
- **Change Role**: Modify user's system role
- **Reset Password**: Force password reset
- **Suspend Account**: Temporarily disable user access
- **Delete Account**: Permanently remove user (with confirmation)

#### Bulk User Operations
- **Bulk Import**: Import users from CSV files
- **Bulk Export**: Export user data for reporting
- **Bulk Role Changes**: Change roles for multiple users
- **Bulk Notifications**: Send messages to multiple users
- **Bulk Suspension**: Suspend multiple accounts

### User Activity Monitoring
- **Login History**: Track user login patterns
- **Feature Usage**: Monitor which features users access
- **Session Duration**: Average session lengths
- **Error Reports**: User-reported issues and errors
- **Security Events**: Failed login attempts and security alerts

## Platform Analytics

### Usage Analytics

#### Daily/Weekly/Monthly Reports
- **Active Users**: Unique users per time period
- **Session Statistics**: Login frequency and duration
- **Feature Adoption**: Most and least used features
- **Peak Usage Times**: Busiest hours and days
- **Geographic Distribution**: User locations (if available)

#### Enterprise Comparison
- **Performance Benchmarks**: Compare enterprises by key metrics
- **Growth Rates**: User growth across different enterprises
- **Feature Utilization**: Feature usage by enterprise
- **Health Score Trends**: Enterprise health over time

### System Performance

#### Technical Metrics
- **Response Times**: API and page load performance
- **Uptime Statistics**: System availability metrics
- **Error Rates**: Application and system errors
- **Database Performance**: Query performance and optimization
- **Resource Utilization**: CPU, memory, and storage usage

#### Capacity Planning
- **Growth Projections**: Predicted user and data growth
- **Resource Requirements**: Future infrastructure needs
- **Scaling Recommendations**: When to scale system resources
- **Performance Bottlenecks**: Areas needing optimization

### Custom Reports

#### Report Builder
Create custom reports with:
- **Data Sources**: Choose from available data sets
- **Filters**: Apply date ranges, enterprises, or user segments
- **Visualizations**: Charts, graphs, and tables
- **Export Options**: PDF, Excel, or CSV formats
- **Scheduled Reports**: Automatic report generation and delivery

#### Standard Report Templates
- **Executive Summary**: High-level platform overview
- **Enterprise Performance**: Detailed enterprise analytics
- **User Engagement**: User activity and adoption metrics
- **System Health**: Technical performance and issues
- **Security Report**: Security events and compliance status

## System Settings

### Global Configuration

#### Platform Settings
- **Application Name**: Customize the platform branding
- **Default Time Zone**: System-wide default time zone
- **Date/Time Formats**: Standardize date and time display
- **Language Settings**: Default language and localization
- **Session Timeout**: Global session timeout settings

#### Security Configuration
- **Password Policies**: Minimum requirements for user passwords
- **Session Management**: Session duration and security settings
- **Two-Factor Authentication**: Enable/disable 2FA requirements
- **IP Restrictions**: Whitelist or blacklist IP addresses
- **API Rate Limiting**: Control API request rates

#### Notification Settings
- **Email Configuration**: SMTP settings for system emails
- **Default Templates**: Standard email and notification templates
- **Retention Policies**: How long to keep notifications
- **Delivery Settings**: Notification delivery preferences
- **Emergency Alerts**: Critical system notification settings

### Feature Management

#### Feature Flags
Control platform-wide features:
- **Shift Swapping**: Enable/disable shift swap functionality
- **Real-time Notifications**: WebSocket notification system
- **Dark Mode**: Allow users to switch themes
- **Mobile App**: Enable mobile application access
- **API Access**: External API integration capabilities

#### Module Configuration
- **Roster Management**: Configure roster creation and management
- **User Management**: User registration and profile settings
- **Department Management**: Department structure and hierarchy
- **Reporting**: Available reports and analytics
- **Integration**: Third-party system integrations

### Data Management

#### Backup Configuration
- **Automatic Backups**: Schedule regular data backups
- **Backup Retention**: How long to keep backup files
- **Backup Location**: Local or cloud storage settings
- **Recovery Procedures**: Data recovery and restoration
- **Backup Verification**: Ensure backup integrity

#### Data Retention
- **User Data**: How long to keep user information
- **Activity Logs**: Log retention periods
- **Notification History**: Notification cleanup schedules
- **Roster Archives**: Historical roster data retention
- **Audit Trails**: Security and compliance logging

## Notification Management

### System-Wide Notifications

#### Broadcast Messages
Send messages to all users or specific groups:
- **All Users**: Platform-wide announcements
- **By Enterprise**: Messages to specific enterprises
- **By Role**: Target specific user roles
- **By Department**: Department-specific communications
- **Emergency Alerts**: Critical system notifications

#### Notification Templates
Manage standard notification templates:
- **Welcome Messages**: New user onboarding
- **Password Resets**: Security-related notifications
- **System Maintenance**: Planned downtime notifications
- **Feature Updates**: New feature announcements
- **Policy Changes**: Terms of service or policy updates

### Notification Analytics
- **Delivery Rates**: Successful notification delivery
- **Open Rates**: How many users read notifications
- **Click-through Rates**: User engagement with notifications
- **Unsubscribe Rates**: Users opting out of notifications
- **Response Times**: How quickly users respond to notifications

### Email System Management

#### SMTP Configuration
- **Server Settings**: SMTP server configuration
- **Authentication**: Email server credentials
- **Security**: SSL/TLS encryption settings
- **Rate Limiting**: Email sending rate limits
- **Bounce Handling**: Manage failed email deliveries

#### Email Templates
- **HTML Templates**: Rich email formatting
- **Plain Text**: Fallback text-only emails
- **Personalization**: Dynamic content insertion
- **Branding**: Company logos and styling
- **Compliance**: Legal disclaimers and unsubscribe links

## Security & Access Control

### User Authentication

#### Authentication Methods
- **Email/Password**: Standard login credentials
- **Two-Factor Authentication**: Optional 2FA for enhanced security
- **Single Sign-On (SSO)**: Integration with enterprise identity providers
- **API Keys**: Programmatic access for integrations
- **Session Management**: Secure session handling and timeout

#### Password Policies
Configure system-wide password requirements:
- **Minimum Length**: 8-12 characters minimum
- **Complexity**: Uppercase, lowercase, numbers, special characters
- **History**: Prevent reuse of recent passwords
- **Expiration**: Force periodic password changes
- **Lockout**: Account lockout after failed attempts

### Access Control

#### Role-Based Permissions
- **System Administrator**: Full platform access
- **Enterprise Administrator**: Enterprise-wide management
- **Manager**: Department and roster management
- **Employee**: Personal schedule and limited features

#### Permission Matrix
```
Feature                 | SysAdmin | EntAdmin | Manager | Employee
------------------------|----------|----------|---------|----------
Enterprise Management   |    ✓     |    ✗     |    ✗    |    ✗
User Management         |    ✓     |    ✓     |    ✗    |    ✗
Department Management   |    ✓     |    ✓     |    ✗    |    ✗
Roster Creation         |    ✓     |    ✓     |    ✓    |    ✗
Shift Assignment        |    ✓     |    ✓     |    ✓    |    ✗
Personal Schedule       |    ✓     |    ✓     |    ✓    |    ✓
Shift Swaps            |    ✓     |    ✓     |    ✓    |    ✓
Notifications          |    ✓     |    ✓     |    ✓    |    ✓
```

### Security Monitoring

#### Audit Logs
Monitor all system activities:
- **User Actions**: Login, logout, data changes
- **Administrative Actions**: User creation, role changes, settings updates
- **Security Events**: Failed logins, suspicious activities
- **System Events**: Errors, performance issues, maintenance
- **Data Access**: Who accessed what data and when

#### Security Alerts
Automated alerts for:
- **Multiple Failed Logins**: Potential brute force attacks
- **Unusual Access Patterns**: Access from new locations or devices
- **Privilege Escalation**: Unauthorized role changes
- **Data Export**: Large data downloads or exports
- **System Errors**: Critical system failures or errors

### Compliance & Data Protection

#### Data Privacy
- **GDPR Compliance**: European data protection regulations
- **Data Minimization**: Collect only necessary information
- **Right to Deletion**: User data removal capabilities
- **Data Portability**: Export user data on request
- **Consent Management**: Track and manage user consents

#### Audit Trail
Maintain comprehensive audit trails for:
- **User Activities**: All user actions and changes
- **Administrative Changes**: System configuration updates
- **Data Access**: Who accessed sensitive information
- **Security Events**: Authentication and authorization events
- **System Changes**: Software updates and maintenance

## Troubleshooting

### Common Issues

#### User Access Problems
**Issue**: Users cannot log in
**Solutions**:
1. Check if user account is active and not suspended
2. Verify password hasn't expired
3. Check for account lockout due to failed attempts
4. Ensure user has correct role and permissions
5. Verify enterprise is active and not suspended

**Issue**: Users missing features or permissions
**Solutions**:
1. Verify user role is correct for required features
2. Check enterprise-level feature settings
3. Ensure user is assigned to correct department
4. Review system-wide feature flags
5. Check for browser cache issues

#### System Performance Issues
**Issue**: Slow response times
**Solutions**:
1. Check system resource utilization
2. Review database performance metrics
3. Analyze network connectivity
4. Check for high user load
5. Review recent system changes

**Issue**: Notification delivery problems
**Solutions**:
1. Verify SMTP configuration
2. Check email server connectivity
3. Review notification queue status
4. Verify user email addresses
5. Check spam/junk folder settings

### System Maintenance

#### Regular Maintenance Tasks
- **Database Optimization**: Weekly database maintenance
- **Log Cleanup**: Regular log file rotation and cleanup
- **Backup Verification**: Ensure backups are working correctly
- **Security Updates**: Apply security patches promptly
- **Performance Monitoring**: Review system performance metrics

#### Emergency Procedures
- **System Outage**: Steps to restore service quickly
- **Data Corruption**: Data recovery procedures
- **Security Breach**: Incident response protocols
- **User Lockout**: Emergency access procedures
- **Communication**: How to notify users of issues

### Getting Support

#### Internal Resources
- **System Documentation**: Comprehensive technical documentation
- **User Manuals**: Role-specific user guides
- **FAQ Database**: Common questions and solutions
- **Video Tutorials**: Step-by-step instructional videos
- **Best Practices**: Recommended system usage guidelines

#### External Support
- **Technical Support**: Contact information for technical issues
- **Training Resources**: Additional training materials
- **Community Forums**: User community discussions
- **Feature Requests**: How to request new features
- **Bug Reports**: How to report system issues

---

## Quick Reference

### Essential System Admin Tasks
1. **Daily**: Monitor system health and user activity
2. **Weekly**: Review enterprise health scores and user reports
3. **Monthly**: Analyze platform analytics and performance metrics
4. **Quarterly**: Review security settings and access controls
5. **Annually**: Conduct comprehensive system audit and planning

### Emergency Contacts
- **Technical Support**: [Contact Information]
- **Security Team**: [Contact Information]
- **Database Administrator**: [Contact Information]
- **Network Operations**: [Contact Information]

### Key Shortcuts
- **Dashboard**: `/dashboard`
- **Enterprise Management**: `/enterprises`
- **System Settings**: `/system-settings`
- **User Management**: `/users`
- **Analytics**: `/analytics`

For additional assistance, refer to the technical documentation or contact the support team.
