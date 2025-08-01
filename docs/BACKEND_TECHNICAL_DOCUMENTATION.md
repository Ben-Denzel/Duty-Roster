# SchedulaX Backend Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Layer](#database-layer)
6. [Authentication & Authorization](#authentication--authorization)
7. [API Layer](#api-layer)
8. [Services Layer](#services-layer)
9. [Real-time Communication](#real-time-communication)
10. [Middleware](#middleware)
11. [Error Handling](#error-handling)
12. [Development Setup](#development-setup)

## Overview

The SchedulaX backend is a robust Node.js application built with Express.js that provides a comprehensive API for duty roster management. It supports multi-tenant enterprise architecture with role-based access control, real-time notifications, and automated shift management.

### Key Features
- **Multi-tenant Architecture**: Support for multiple enterprises with isolated data
- **Role-based Access Control**: Granular permissions for different user types
- **Real-time Notifications**: WebSocket-based live updates
- **Automated Shift Assignment**: Intelligent staff allocation algorithms
- **Email Integration**: Automated email notifications
- **RESTful API**: Comprehensive REST API with proper HTTP semantics
- **Database Migrations**: Structured database schema management

## Architecture

The backend follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Routes    │    │   Controllers   │    │    Services     │
│                 │    │                 │    │                 │
│ - Authentication│    │ - Business      │    │ - Email         │
│ - Enterprises   │    │   Logic         │    │ - WebSocket     │
│ - Users         │    │ - Validation    │    │ - Notification  │
│ - Rosters       │    │ - Error         │    │ - Cleanup       │
│ - Shifts        │    │   Handling      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │                 │
                    │ - Sequelize ORM │
                    │ - PostgreSQL    │
                    │ - Models        │
                    │ - Migrations    │
                    └─────────────────┘
```

### Request Flow
1. **HTTP Request** → Express.js Router
2. **Authentication** → JWT Middleware
3. **Authorization** → Role-based Middleware
4. **Controller** → Business Logic Processing
5. **Service Layer** → External Services (Email, WebSocket)
6. **Data Layer** → Database Operations via Sequelize
7. **Response** → JSON API Response

## Technology Stack

### Core Technologies
- **Node.js 18+**: JavaScript runtime environment
- **Express.js 4.21.2**: Web application framework
- **PostgreSQL 12+**: Relational database
- **Sequelize 6.37.7**: Object-Relational Mapping (ORM)

### Security & Authentication
- **JWT (jsonwebtoken 9.0.2)**: Token-based authentication
- **bcrypt 6.0.0**: Password hashing
- **Helmet 8.1.0**: Security headers middleware
- **CORS 2.8.5**: Cross-Origin Resource Sharing

### Communication & Notifications
- **Socket.IO 4.7.4**: Real-time WebSocket communication
- **Nodemailer 6.10.1**: Email service integration
- **Morgan 1.10.0**: HTTP request logging

### Development & Utilities
- **Nodemon 3.1.10**: Development auto-reload
- **dotenv 17.2.0**: Environment variable management
- **Jest 30.0.4**: Testing framework
- **Supertest 7.1.3**: HTTP assertion testing

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # Database configuration
│   ├── controllers/            # Request handlers and business logic
│   │   ├── authController.js   # Authentication logic
│   │   ├── userController.js   # User management
│   │   ├── rosterController.js # Roster operations
│   │   ├── shiftController.js  # Shift management
│   │   └── ...
│   ├── middleware/             # Express middleware
│   │   └── auth.js            # Authentication & authorization
│   ├── models/                # Sequelize database models
│   │   ├── User.js            # User model
│   │   ├── Enterprise.js      # Enterprise model
│   │   ├── Department.js      # Department model
│   │   ├── Roster.js          # Roster model
│   │   ├── Shift.js           # Shift model
│   │   └── index.js           # Model associations
│   ├── routes/                # API route definitions
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User management routes
│   │   ├── rosters.js         # Roster management routes
│   │   └── ...
│   ├── services/              # Business services
│   │   ├── EmailService.js    # Email notifications
│   │   ├── WebSocketService.js # Real-time communication
│   │   ├── NotificationService.js # Notification management
│   │   └── NotificationCleanupService.js # Cleanup automation
│   ├── utils/                 # Utility functions
│   │   └── jwt.js             # JWT token utilities
│   ├── scripts/               # Database and setup scripts
│   ├── migrations/            # Database migration files
│   └── server.js              # Application entry point
├── tests/                     # Test files
├── package.json               # Dependencies and scripts
├── .env.example              # Environment variables template
└── README.md                 # Project documentation
```

## Database Layer

### Database Configuration
The application uses PostgreSQL with Sequelize ORM for database operations:

```javascript
// config/database.js
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

### Core Models

#### User Model
```javascript
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password_hash: { type: DataTypes.TEXT, allowNull: false },
  role: { 
    type: DataTypes.ENUM('systemAdmin', 'enterpriseAdmin', 'manager', 'employee'),
    allowNull: false 
  },
  enterprise_id: { type: DataTypes.INTEGER, allowNull: true },
  department_id: { type: DataTypes.INTEGER, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});
```

#### Enterprise Model
```javascript
const Enterprise = sequelize.define('Enterprise', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  created_by: { type: DataTypes.INTEGER, allowNull: true }
});
```

#### Department Model
```javascript
const Department = sequelize.define('Department', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  enterprise_id: { type: DataTypes.INTEGER, allowNull: false },
  manager_id: { type: DataTypes.INTEGER, allowNull: true }
});
```

#### Roster Model
```javascript
const Roster = sequelize.define('Roster', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  department_id: { type: DataTypes.INTEGER, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { 
    type: DataTypes.ENUM('draft', 'published', 'approved', 'archived'),
    defaultValue: 'draft' 
  },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
  settings: { type: DataTypes.JSONB, defaultValue: {} },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
});
```

### Model Associations
```javascript
// User associations
User.belongsTo(Enterprise, { foreignKey: 'enterprise_id', as: 'enterprise' });
User.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

// Enterprise associations
Enterprise.hasMany(User, { foreignKey: 'enterprise_id', as: 'users' });
Enterprise.hasMany(Department, { foreignKey: 'enterprise_id', as: 'departments' });

// Department associations
Department.belongsTo(Enterprise, { foreignKey: 'enterprise_id', as: 'enterprise' });
Department.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
Department.hasMany(User, { foreignKey: 'department_id', as: 'users' });

// Roster associations
Roster.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
Roster.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Roster.hasMany(Shift, { foreignKey: 'roster_id', as: 'shifts' });
```

## Authentication & Authorization

### JWT Token System
The application uses JSON Web Tokens for stateless authentication:

```javascript
// utils/jwt.js
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    enterprise_id: user.enterprise_id,
    department_id: user.department_id
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'schedulax-api'
  });
};
```

### Authentication Middleware
```javascript
// middleware/auth.js
const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);
    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      enterprise_id: user.enterprise_id,
      department_id: user.department_id
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Access denied' });
  }
};
```

### Role-based Authorization
```javascript
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Usage in routes
router.post('/rosters', 
  authenticate, 
  authorize(['systemAdmin', 'enterpriseAdmin', 'manager']), 
  createRoster
);
```

### Permission Hierarchy
```
systemAdmin > enterpriseAdmin > manager > employee

Access Levels:
- systemAdmin: Full platform access
- enterpriseAdmin: Enterprise-wide access
- manager: Department-level access
- employee: Personal data access only
```

## API Layer

### Route Organization
API routes are organized by functional domains:

```javascript
// server.js - Route registration
app.use('/api/auth', authRoutes);
app.use('/api/enterprises', enterpriseRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rosters', rosterRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
```

### Controller Pattern
Controllers handle HTTP requests and coordinate business logic:

```javascript
// controllers/rosterController.js
const createRoster = async (req, res) => {
  try {
    const { name, department_id, start_date, end_date } = req.body;

    // Validation
    if (!name || !department_id || !start_date || !end_date) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Required fields missing'
      });
    }

    // Business logic
    const roster = await Roster.create({
      name,
      department_id,
      start_date,
      end_date,
      created_by: req.user.id
    });

    // Response
    res.status(201).json({
      message: 'Roster created successfully',
      roster: roster.toJSON()
    });

  } catch (error) {
    console.error('Create roster error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create roster'
    });
  }
};
```

### API Response Format
Standardized JSON response format:

```javascript
// Success Response
{
  "message": "Operation successful",
  "data": { /* response data */ },
  "meta": { /* pagination, etc. */ }
}

// Error Response
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": { /* additional error details */ }
}
```

### HTTP Status Codes
- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict
- **500 Internal Server Error**: Server errors

## Services Layer

### Email Service
Handles all email communications:

```javascript
// services/EmailService.js
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendNotificationEmail({ to, subject, htmlTemplate, variables }) {
    const html = this.renderTemplate(htmlTemplate, variables);

    return await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
  }
}
```

### Notification Service
Manages system notifications:

```javascript
// services/NotificationService.js
class NotificationService {
  async createNotification({ userId, type, variables, overrides }) {
    // Get notification template
    const template = await NotificationTemplate.findOne({
      where: { type, is_active: true }
    });

    // Render notification content
    const notification = await Notification.create({
      user_id: userId,
      type,
      title: template.renderTitle(variables),
      message: template.renderMessage(variables),
      data: variables,
      priority: template.priority
    });

    // Send real-time notification
    WebSocketService.sendNotificationToUser(userId, notification);

    // Send email if enabled
    const preferences = await this.getUserPreferences(userId);
    if (preferences.shouldSendEmail(type)) {
      await this.sendEmailNotification(notification, template, variables);
    }

    return notification;
  }
}
```

### WebSocket Service
Handles real-time communication:

```javascript
// services/WebSocketService.js
class WebSocketService {
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      socket.userId = user.id;
      socket.user = user;
      next();
    });

    this.io.on('connection', this.handleConnection.bind(this));
  }

  sendNotificationToUser(userId, notification) {
    this.io.to(`user_${userId}`).emit('new_notification', {
      notification,
      timestamp: new Date().toISOString()
    });
  }
}
```

## Real-time Communication

### WebSocket Events
The system supports various real-time events:

#### Client → Server Events
- **connection**: User connects to WebSocket
- **notification_read**: Mark notification as read
- **join_room**: Join specific rooms (department, enterprise)

#### Server → Client Events
- **new_notification**: New notification received
- **roster_updated**: Roster changes
- **shift_assigned**: New shift assignment
- **swap_request**: Shift swap request
- **system_announcement**: System-wide announcements

### Room Management
Users are automatically joined to relevant rooms:

```javascript
// User-specific room
socket.join(`user_${userId}`);

// Department room
if (user.department_id) {
  socket.join(`department_${user.department_id}`);
}

// Enterprise room
if (user.enterprise_id) {
  socket.join(`enterprise_${user.enterprise_id}`);
}

// Role-based room
socket.join(`role_${user.role}`);
```

### Broadcasting Strategies
- **Personal**: Send to specific user
- **Department**: Send to all department members
- **Enterprise**: Send to all enterprise users
- **Role-based**: Send to users with specific roles
- **System-wide**: Broadcast to all connected users

## Middleware

### Security Middleware
```javascript
// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Request logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### Custom Middleware
```javascript
// Enterprise access control
const checkEnterpriseAccess = (req, res, next) => {
  const enterpriseId = parseInt(req.params.enterpriseId);

  if (req.user.role === 'systemAdmin') {
    return next();
  }

  if (req.user.enterprise_id !== enterpriseId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied to this enterprise'
    });
  }

  next();
};

// Department access control
const checkDepartmentAccess = (req, res, next) => {
  const departmentId = parseInt(req.params.departmentId);

  if (['systemAdmin', 'enterpriseAdmin'].includes(req.user.role)) {
    return next();
  }

  if (req.user.role === 'manager' && req.user.department_id !== departmentId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied to this department'
    });
  }

  next();
};
```

## Error Handling

### Global Error Handler
```javascript
// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: error.errors.map(e => e.message).join(', ')
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication error',
      message: 'Invalid token'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});
```

### Error Types
- **Validation Errors**: Input validation failures
- **Authentication Errors**: JWT token issues
- **Authorization Errors**: Permission denied
- **Database Errors**: Sequelize/PostgreSQL errors
- **Business Logic Errors**: Application-specific errors
- **External Service Errors**: Email, WebSocket failures

## Development Setup

### Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duty_roster
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="SchedulaX <noreply@schedulax.com>"

# Application URL
APP_URL=http://localhost:5173
```

### Development Scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "db:setup": "node scripts/setupDatabase.js",
    "notifications:setup": "node src/scripts/setupNotificationTables.js"
  }
}
```

### Database Setup
```bash
# Create database
createdb duty_roster

# Run migrations
npm run db:setup

# Setup notification system
npm run notifications:setup

# Start development server
npm run dev
```

---

## Performance Considerations

### Database Optimization
- **Indexes**: Proper indexing on frequently queried columns
- **Connection Pooling**: Configured connection pool for optimal performance
- **Query Optimization**: Efficient Sequelize queries with proper includes
- **Pagination**: Implemented pagination for large data sets

### Caching Strategy
- **In-memory Caching**: Cache frequently accessed data
- **Query Result Caching**: Cache expensive database queries
- **Session Caching**: Efficient session management

### Monitoring & Logging
- **Request Logging**: Morgan middleware for HTTP request logging
- **Error Logging**: Comprehensive error logging and tracking
- **Performance Metrics**: Monitor response times and throughput
- **Database Monitoring**: Track query performance and connection usage

For additional technical details, refer to the API documentation and database schema documentation.
