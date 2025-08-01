# Software Requirements Specification (SRS)
## SchedulaX: Duty Roster Management System

**Version**: 1.0 | **Date**: January 2024 | **Project**: SchedulaX Web-Based Duty Roster Management System

---

## 1. Introduction

### 1.1 Purpose
SchedulaX is a web-based duty roster management system for multi-tenant enterprise environments. This SRS defines functional and non-functional requirements for development, testing, and deployment.

**Target Audience**: Development team, stakeholders, QA engineers, system administrators

### 1.2 Product Scope
**Objective**: Automate workforce scheduling with intelligent assignment algorithms, real-time collaboration, and mobile accessibility.

**Key Benefits**:
- 75% reduction in scheduling time
- Automated conflict detection and resolution
- Fair shift distribution algorithms
- Real-time notifications and updates
- Mobile-responsive design

### 1.3 System Overview
- **Architecture**: Multi-tenant web application
- **Technology**: Vue.js 3 frontend, Node.js backend, PostgreSQL database
- **Users**: System Admin, Enterprise Admin, Manager, Employee
- **Deployment**: Cloud-based SaaS platform

---

## 2. System Overview

### 2.1 User Roles
| Role | Access Level | Primary Functions |
|------|-------------|-------------------|
| **System Admin** | Platform-wide | Enterprise management, system configuration |
| **Enterprise Admin** | Organization-wide | User management, department oversight |
| **Manager** | Department-level | Roster creation, shift assignment |
| **Employee** | Personal | View schedule, request shift swaps |

### 2.2 Core Functions
1. **User Management**: Authentication, authorization, role-based access
2. **Enterprise Management**: Multi-tenant organization structure
3. **Roster Creation**: Automated/manual duty roster generation
4. **Shift Management**: Shift creation, assignment, modification
5. **Notification System**: Real-time alerts and email notifications
6. **Analytics**: Dashboards and reporting
7. **Mobile Access**: Responsive design for all devices

### 2.3 Technology Stack
- **Frontend**: Vue.js 3, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: PostgreSQL with Sequelize ORM
- **Deployment**: Docker, cloud platforms (AWS, Azure, GCP)

### 2.4 System Constraints
- **Performance**: Page load < 3s, API response < 2s
- **Capacity**: 1,000 concurrent users, 100 enterprises
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Compliance**: GDPR, WCAG 2.1 AA, OWASP Top 10

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization (Priority: High)

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-1.1 | User Login | Secure JWT-based authentication with email/password |
| FR-1.2 | Role-Based Access | Four user roles with hierarchical permissions |
| FR-1.3 | Password Reset | Email-based password reset functionality |
| FR-1.4 | Session Management | Secure session handling with token expiration |

### 3.2 Enterprise Management (Priority: High)

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-2.1 | Multi-Tenant Support | Complete data isolation between enterprises |
| FR-2.2 | Enterprise CRUD | Create, read, update, delete enterprise operations |
| FR-2.3 | Department Management | Hierarchical department structure within enterprises |
| FR-2.4 | User Assignment | Assign users to departments with role validation |

### 3.3 Roster Management (Priority: High)

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-3.1 | Roster Creation | Create rosters with date range and department assignment |
| FR-3.2 | Automated Generation | Generate shifts based on templates and patterns |
| FR-3.3 | Drag-Drop Interface | Visual calendar for manual roster management |
| FR-3.4 | Conflict Detection | Automatic detection of scheduling conflicts |
| FR-3.5 | Intelligent Assignment | Fair distribution algorithms for shift assignment |

### 3.4 Shift Management (Priority: High)

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-4.1 | Shift Creation | Create shifts with time, location, staffing requirements |
| FR-4.2 | Employee Assignment | Assign employees to shifts with validation |
| FR-4.3 | Status Tracking | Track assignment status (pending, confirmed, declined) |
| FR-4.4 | Shift Modification | Modify shift details with proper authorization |

### 3.5 Shift Swapping (Priority: Medium)

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-5.1 | Swap Requests | Employee-initiated shift exchange requests |
| FR-5.2 | Approval Workflow | Manager approval for shift swaps |
| FR-5.3 | Skill Matching | Ensure qualified coverage for swapped shifts |
| FR-5.4 | Fair Distribution | Prevent abuse with swap frequency limits |

### 3.6 Notification System (Priority: High)

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-6.1 | Real-Time Notifications | WebSocket-based live updates |
| FR-6.2 | Email Notifications | SMTP integration for email alerts |
| FR-6.3 | User Preferences | Configurable notification settings |
| FR-6.4 | Priority Levels | Support for urgent, high, normal, low priorities |

### 3.7 Analytics & Reporting (Priority: Medium)

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-7.1 | Role-Based Dashboards | Customized dashboards for each user role |
| FR-7.2 | Standard Reports | Pre-built reports (attendance, workload, coverage) |
| FR-7.3 | Data Export | Export reports in PDF, Excel, CSV formats |
| FR-7.4 | Real-Time Metrics | Live KPIs and performance indicators |

### 3.8 Mobile Support (Priority: High)

| ID | Requirement | Description |
|----|-------------|-------------|
| FR-8.1 | Responsive Design | Mobile-first responsive web design |
| FR-8.2 | Touch Interface | Optimized touch interactions for mobile |
| FR-8.3 | Feature Parity | Full functionality across all device types |

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-1.1 | Page Load Time | < 3 seconds | High |
| NFR-1.2 | API Response Time | < 2 seconds (95% of requests) | High |
| NFR-1.3 | Real-time Notifications | < 5 seconds delivery | High |
| NFR-1.4 | Concurrent Users | 1,000 simultaneous users | High |
| NFR-1.5 | Database Capacity | 100,000+ records per table | Medium |

### 4.2 Security Requirements

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| NFR-2.1 | Authentication | JWT-based secure authentication | High |
| NFR-2.2 | Authorization | Role-based access control | High |
| NFR-2.3 | Data Encryption | TLS 1.2+ for transit, encryption at rest | High |
| NFR-2.4 | Input Validation | Comprehensive input sanitization | High |
| NFR-2.5 | Audit Logging | Complete user action logging | Medium |
| NFR-2.6 | OWASP Compliance | Protection against OWASP Top 10 | High |

### 4.3 Reliability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-3.1 | System Uptime | 99.5% during business hours | High |
| NFR-3.2 | Recovery Time | < 15 minutes from failure | High |
| NFR-3.3 | Data Backup | Daily automated backups | High |
| NFR-3.4 | Error Handling | Graceful error handling and logging | Medium |

### 4.4 Usability Requirements

| ID | Requirement | Target | Priority |
|----|-------------|--------|----------|
| NFR-4.1 | Learning Time | < 30 minutes for basic tasks | High |
| NFR-4.2 | User Satisfaction | 90% satisfaction rating | Medium |
| NFR-4.3 | Accessibility | WCAG 2.1 AA compliance | High |
| NFR-4.4 | Mobile Support | Full functionality on mobile devices | High |

### 4.5 Compatibility Requirements

| ID | Requirement | Description | Priority |
|----|-------------|-------------|----------|
| NFR-5.1 | Browser Support | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | High |
| NFR-5.2 | Operating Systems | Windows 10+, macOS 10.15+, Linux, iOS 13+, Android 8+ | High |
| NFR-5.3 | Screen Resolutions | 320px (mobile) to 4K desktop | High |
| NFR-5.4 | Network Requirements | Minimum 1 Mbps broadband connection | Medium |

---

## 5. System Interfaces

### 5.1 User Interfaces
- **Design**: Modern, responsive web interface
- **Accessibility**: WCAG 2.1 AA compliant
- **Navigation**: Role-based navigation and dashboards
- **Components**: Standardized UI components and patterns

### 5.2 External Interfaces
- **Database**: PostgreSQL with Sequelize ORM
- **Email**: SMTP integration for notifications
- **API**: RESTful endpoints for potential integrations
- **WebSocket**: Real-time communication protocol

### 5.3 Communication Protocols
- **HTTP/HTTPS**: Secure web communication
- **WebSocket**: Real-time bidirectional communication
- **SMTP**: Email delivery protocol
- **JWT**: Token-based authentication



---

## 6. Business Rules & Constraints

### 6.1 Organizational Rules
- Users belong to one enterprise and one department
- Department managers can only manage their department
- System administrators have platform-wide access
- Enterprise administrators manage their organization only

### 6.2 Scheduling Rules
- No overlapping shift assignments for employees
- Minimum 8-hour rest period between shifts (configurable)
- Maximum weekly hours per labor regulations (configurable)
- Shift swaps require manager approval

### 6.3 Compliance Requirements
- **GDPR/CCPA**: Data protection and privacy compliance
- **WCAG 2.1 AA**: Accessibility standards compliance
- **OWASP Top 10**: Security vulnerability protection
- **Audit Logging**: Complete user action tracking

---

## 7. Appendices

### 7.1 Glossary
- **Enterprise**: Organization using SchedulaX
- **Roster**: Schedule showing employee work assignments
- **Shift**: Specific work period assigned to employee
- **Multi-tenant**: Single system serving multiple organizations
- **JWT**: JSON Web Token for authentication
- **WebSocket**: Real-time communication protocol

### 7.2 Requirements Traceability

| ID | Requirement | Priority | Verification |
|----|-------------|----------|--------------|
| FR-1.1 | User Authentication | High | Unit Testing |
| FR-2.1 | Multi-tenant Support | High | Integration Testing |
| FR-3.1 | Roster Creation | High | User Acceptance Testing |
| FR-6.1 | Real-time Notifications | High | Integration Testing |
| NFR-1.1 | Page Load < 3s | High | Performance Testing |
| NFR-2.1 | JWT Authentication | High | Security Testing |

### 7.3 Approval

**Document Version**: 1.0
**Date**: January 2024
**Status**: Draft

**Stakeholder Approval**:
- [ ] Project Manager
- [ ] Technical Lead
- [ ] Academic Supervisor

---

*This SRS document defines the complete requirements for the SchedulaX duty roster management system. All requirements are traceable and testable.*
