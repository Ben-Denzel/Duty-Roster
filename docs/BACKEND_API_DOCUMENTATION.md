# SchedulaX Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Conventions](#api-conventions)
4. [Authentication Endpoints](#authentication-endpoints)
5. [User Management](#user-management)
6. [Enterprise Management](#enterprise-management)
7. [Department Management](#department-management)
8. [Roster Management](#roster-management)
9. [Shift Management](#shift-management)
10. [Employee Endpoints](#employee-endpoints)
11. [Notification System](#notification-system)
12. [Dashboard Analytics](#dashboard-analytics)

## Overview

The SchedulaX API is a RESTful web service that provides comprehensive duty roster management functionality. All endpoints return JSON responses and follow standard HTTP status codes.

### Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### API Version
Current API version: `v1` (implicit in all endpoints)

## Authentication

### JWT Token Authentication
The API uses JSON Web Tokens (JWT) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Structure
```json
{
  "id": 123,
  "email": "user@example.com",
  "role": "manager",
  "enterprise_id": 1,
  "department_id": 5,
  "iat": 1640995200,
  "exp": 1641081600,
  "iss": "schedulax-api"
}
```

### Role-based Access Control
- **systemAdmin**: Full platform access
- **enterpriseAdmin**: Enterprise-wide access
- **manager**: Department-level access
- **employee**: Personal data access only

## API Conventions

### Request Format
- **Content-Type**: `application/json`
- **Character Encoding**: UTF-8
- **Date Format**: ISO 8601 (`YYYY-MM-DD` for dates, `YYYY-MM-DDTHH:mm:ss.sssZ` for timestamps)

### Response Format
All API responses follow a consistent structure:

#### Success Response
```json
{
  "message": "Operation successful",
  "data": { /* response data */ },
  "meta": { /* pagination, etc. */ }
}
```

#### Error Response
```json
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

### Pagination
For endpoints that return lists, pagination is implemented:

```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 95,
    "items_per_page": 10
  }
}
```

Query parameters for pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

## Authentication Endpoints

### POST /api/auth/register
Register a new user (public endpoint for initial setup).

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "employee",
  "gender": "male",
  "enterprise_id": 1,
  "department_id": 5
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 123,
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "enterprise_id": 1,
    "department_id": 5,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 123,
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "enterprise_id": 1,
    "department_id": 5
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/auth/profile
Get current user profile information.

**Headers:**
```http
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "id": 123,
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "employee",
    "enterprise_id": 1,
    "department_id": 5,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT /api/auth/profile
Update current user profile.

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "gender": "male"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 123,
    "full_name": "John Smith",
    "email": "john@example.com",
    "role": "employee",
    "gender": "male",
    "enterprise_id": 1,
    "department_id": 5
  }
}
```

### POST /api/auth/create-system-admin
Create the first system administrator (no authentication required).

**Request Body:**
```json
{
  "full_name": "System Administrator",
  "email": "admin@system.com",
  "password": "secureAdminPassword123"
}
```

**Response (201 Created):**
```json
{
  "message": "System administrator created successfully",
  "user": {
    "id": 1,
    "full_name": "System Administrator",
    "email": "admin@system.com",
    "role": "systemAdmin",
    "enterprise_id": null,
    "department_id": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## User Management

### POST /api/users
Create a new user (Admin only).

**Authorization:** `systemAdmin`, `enterpriseAdmin`

**Request Body:**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "manager",
  "gender": "female",
  "enterprise_id": 1,
  "department_id": 5,
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 124,
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "role": "manager",
    "enterprise_id": 1,
    "department_id": 5,
    "is_active": true,
    "created_at": "2024-01-15T11:00:00.000Z"
  }
}
```

### PUT /api/users/:id
Update an existing user.

**Authorization:** `systemAdmin`, `enterpriseAdmin`

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "role": "enterpriseAdmin",
  "department_id": null,
  "is_active": true
}
```

**Response (200 OK):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": 124,
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "role": "enterpriseAdmin",
    "enterprise_id": 1,
    "department_id": null,
    "is_active": true,
    "updated_at": "2024-01-15T11:30:00.000Z"
  }
}
```

## Enterprise Management

### POST /api/enterprises
Create a new enterprise (System Admin only).

**Authorization:** `systemAdmin`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "description": "A leading technology company"
}
```

**Response (201 Created):**
```json
{
  "message": "Enterprise created successfully",
  "enterprise": {
    "id": 2,
    "name": "Acme Corporation",
    "description": "A leading technology company",
    "created_by": 1,
    "created_at": "2024-01-15T12:00:00.000Z"
  }
}
```

### GET /api/enterprises
Get all enterprises (System Admin only).

**Authorization:** `systemAdmin`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by name

**Response (200 OK):**
```json
{
  "message": "Enterprises retrieved successfully",
  "enterprises": [
    {
      "id": 1,
      "name": "Tech Solutions Inc",
      "created_at": "2024-01-10T09:00:00.000Z",
      "user_count": 45,
      "department_count": 8
    },
    {
      "id": 2,
      "name": "Acme Corporation",
      "created_at": "2024-01-15T12:00:00.000Z",
      "user_count": 0,
      "department_count": 0
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 2,
    "items_per_page": 10
  }
}
```

### GET /api/enterprises/:id
Get specific enterprise details.

**Authorization:** `systemAdmin`, `enterpriseAdmin` (own enterprise only)

**Response (200 OK):**
```json
{
  "message": "Enterprise retrieved successfully",
  "enterprise": {
    "id": 1,
    "name": "Tech Solutions Inc",
    "description": "Technology consulting company",
    "created_at": "2024-01-10T09:00:00.000Z",
    "departments": [
      {
        "id": 1,
        "name": "Engineering",
        "user_count": 25
      },
      {
        "id": 2,
        "name": "Human Resources",
        "user_count": 5
      }
    ],
    "total_users": 45,
    "active_users": 42
  }
}
```

## Department Management

### POST /api/departments
Create a new department.

**Authorization:** `systemAdmin`, `enterpriseAdmin`

**Request Body:**
```json
{
  "name": "Marketing",
  "enterprise_id": 1,
  "manager_id": 124,
  "description": "Marketing and communications department"
}
```

**Response (201 Created):**
```json
{
  "message": "Department created successfully",
  "department": {
    "id": 10,
    "name": "Marketing",
    "enterprise_id": 1,
    "manager_id": 124,
    "description": "Marketing and communications department",
    "created_at": "2024-01-15T13:00:00.000Z"
  }
}
```

### GET /api/departments/enterprise/:enterpriseId
Get all departments for an enterprise.

**Authorization:** `systemAdmin`, `enterpriseAdmin`, `manager`, `employee`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by department name

**Response (200 OK):**
```json
{
  "message": "Departments retrieved successfully",
  "departments": [
    {
      "id": 1,
      "name": "Engineering",
      "enterprise_id": 1,
      "manager": {
        "id": 125,
        "full_name": "Tech Lead",
        "email": "lead@example.com"
      },
      "user_count": 25,
      "active_rosters": 3
    },
    {
      "id": 2,
      "name": "Human Resources",
      "enterprise_id": 1,
      "manager": null,
      "user_count": 5,
      "active_rosters": 1
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 2,
    "items_per_page": 10
  }
}
```

## Roster Management

### POST /api/rosters
Create a new roster.

**Authorization:** `systemAdmin`, `enterpriseAdmin`

**Request Body:**
```json
{
  "name": "January 2024 Engineering Roster",
  "description": "Monthly duty roster for engineering team",
  "department_id": 1,
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "settings": {
    "auto_assign": true,
    "assignment_strategy": "balanced",
    "max_shifts_per_person": 20
  },
  "auto_generate_shifts": true,
  "shift_template": "standard_8hour"
}
```

**Response (201 Created):**
```json
{
  "message": "Roster created successfully",
  "roster": {
    "id": 50,
    "name": "January 2024 Engineering Roster",
    "description": "Monthly duty roster for engineering team",
    "department_id": 1,
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "status": "draft",
    "created_by": 1,
    "settings": {
      "auto_assign": true,
      "assignment_strategy": "balanced",
      "max_shifts_per_person": 20
    },
    "metadata": {
      "total_shifts": 0,
      "assigned_shifts": 0,
      "coverage_percentage": 0
    },
    "created_at": "2024-01-15T14:00:00.000Z"
  }
}
```

### GET /api/rosters/all
Get all rosters with filtering and pagination.

**Authorization:** `systemAdmin`, `enterpriseAdmin`, `manager`, `employee`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (`draft`, `published`, `approved`, `archived`)
- `start_date`: Filter rosters starting after this date
- `end_date`: Filter rosters ending before this date
- `search`: Search by roster name

**Response (200 OK):**
```json
{
  "message": "Rosters retrieved successfully",
  "rosters": [
    {
      "id": 50,
      "name": "January 2024 Engineering Roster",
      "department": {
        "id": 1,
        "name": "Engineering"
      },
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "status": "published",
      "total_shifts": 62,
      "assigned_shifts": 58,
      "coverage_percentage": 93.5,
      "created_at": "2024-01-15T14:00:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 47,
    "items_per_page": 10
  }
}
```

### GET /api/rosters/:id
Get specific roster details.

**Authorization:** `systemAdmin`, `enterpriseAdmin`, `manager`, `employee`

**Response (200 OK):**
```json
{
  "message": "Roster retrieved successfully",
  "roster": {
    "id": 50,
    "name": "January 2024 Engineering Roster",
    "description": "Monthly duty roster for engineering team",
    "department": {
      "id": 1,
      "name": "Engineering",
      "enterprise_id": 1
    },
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "status": "published",
    "created_by": 1,
    "creator": {
      "id": 1,
      "full_name": "System Administrator"
    },
    "settings": {
      "auto_assign": true,
      "assignment_strategy": "balanced"
    },
    "metadata": {
      "total_shifts": 62,
      "assigned_shifts": 58,
      "coverage_percentage": 93.5,
      "last_modified_at": "2024-01-15T16:30:00.000Z"
    },
    "shifts": [
      {
        "id": 100,
        "date": "2024-01-01",
        "start_time": "08:00",
        "end_time": "16:00",
        "title": "Day Shift",
        "required_staff": 3,
        "assigned_staff": 3,
        "assignments": [
          {
            "id": 200,
            "employee": {
              "id": 123,
              "full_name": "John Doe"
            },
            "status": "confirmed"
          }
        ]
      }
    ],
    "created_at": "2024-01-15T14:00:00.000Z",
    "updated_at": "2024-01-15T16:30:00.000Z"
  }
}
```

### PATCH /api/rosters/:id/status
Update roster status.

**Authorization:** `systemAdmin`, `enterpriseAdmin`, `manager`

**Request Body:**
```json
{
  "status": "published"
}
```

**Response (200 OK):**
```json
{
  "message": "Roster status updated to published",
  "roster": {
    "id": 50,
    "name": "January 2024 Engineering Roster",
    "status": "published",
    "updated_at": "2024-01-15T17:00:00.000Z"
  }
}
```

## Shift Management

### GET /api/shifts/roster/:rosterId
Get all shifts for a specific roster.

**Authorization:** `systemAdmin`, `enterpriseAdmin`, `manager`, `employee`

**Query Parameters:**
- `date`: Filter by specific date (YYYY-MM-DD)
- `start_date`: Filter shifts starting after this date
- `end_date`: Filter shifts ending before this date

**Response (200 OK):**
```json
{
  "message": "Shifts retrieved successfully",
  "shifts": [
    {
      "id": 100,
      "roster_id": 50,
      "date": "2024-01-01",
      "start_time": "08:00",
      "end_time": "16:00",
      "title": "Day Shift",
      "description": "Regular day shift coverage",
      "required_staff": 3,
      "assigned_staff": 3,
      "location": "Main Office",
      "assignments": [
        {
          "id": 200,
          "employee_id": 123,
          "employee": {
            "id": 123,
            "full_name": "John Doe",
            "email": "john@example.com"
          },
          "status": "confirmed",
          "assigned_at": "2024-01-15T14:30:00.000Z"
        }
      ],
      "created_at": "2024-01-15T14:00:00.000Z"
    }
  ]
}
```

### POST /api/shifts
Create a new shift.

**Authorization:** `systemAdmin`, `enterpriseAdmin`

**Request Body:**
```json
{
  "roster_id": 50,
  "date": "2024-01-02",
  "start_time": "22:00",
  "end_time": "06:00",
  "title": "Night Shift",
  "description": "Overnight coverage",
  "required_staff": 2,
  "location": "Main Office"
}
```

**Response (201 Created):**
```json
{
  "message": "Shift created successfully",
  "shift": {
    "id": 101,
    "roster_id": 50,
    "date": "2024-01-02",
    "start_time": "22:00",
    "end_time": "06:00",
    "title": "Night Shift",
    "description": "Overnight coverage",
    "required_staff": 2,
    "assigned_staff": 0,
    "location": "Main Office",
    "created_at": "2024-01-15T17:30:00.000Z"
  }
}
```

## Employee Endpoints

### GET /api/employee/my-schedule
Get personal schedule for the authenticated employee.

**Authorization:** `employee`, `manager`, `enterpriseAdmin`, `systemAdmin`

**Query Parameters:**
- `start_date`: Filter assignments starting after this date
- `end_date`: Filter assignments ending before this date
- `status`: Filter by assignment status (`pending`, `confirmed`, `declined`)

**Response (200 OK):**
```json
{
  "message": "Schedule retrieved successfully",
  "schedule": {
    "employee": {
      "id": 123,
      "full_name": "John Doe",
      "department": "Engineering"
    },
    "assignments": [
      {
        "id": 200,
        "shift": {
          "id": 100,
          "date": "2024-01-01",
          "start_time": "08:00",
          "end_time": "16:00",
          "title": "Day Shift",
          "location": "Main Office",
          "roster": {
            "id": 50,
            "name": "January 2024 Engineering Roster"
          }
        },
        "status": "confirmed",
        "assigned_at": "2024-01-15T14:30:00.000Z"
      }
    ],
    "summary": {
      "total_assignments": 15,
      "confirmed_assignments": 14,
      "pending_assignments": 1,
      "total_hours": 120
    }
  }
}
```

### PATCH /api/employee/assignments/:assignmentId/status
Update assignment status (confirm/decline).

**Authorization:** `employee`, `manager`, `enterpriseAdmin`, `systemAdmin`

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Confirmed availability for this shift"
}
```

**Response (200 OK):**
```json
{
  "message": "Assignment status updated successfully",
  "assignment": {
    "id": 200,
    "status": "confirmed",
    "notes": "Confirmed availability for this shift",
    "updated_at": "2024-01-15T18:00:00.000Z"
  }
}
```

### GET /api/employee/swap-requests
Get swap requests for the authenticated employee.

**Authorization:** `employee`, `manager`, `enterpriseAdmin`, `systemAdmin`

**Query Parameters:**
- `status`: Filter by status (`pending`, `approved`, `rejected`, `cancelled`)
- `type`: Filter by type (`outgoing`, `incoming`)

**Response (200 OK):**
```json
{
  "message": "Swap requests retrieved successfully",
  "swap_requests": [
    {
      "id": 10,
      "requester": {
        "id": 123,
        "full_name": "John Doe"
      },
      "target_employee": {
        "id": 124,
        "full_name": "Jane Smith"
      },
      "shift": {
        "id": 100,
        "date": "2024-01-01",
        "start_time": "08:00",
        "end_time": "16:00",
        "title": "Day Shift"
      },
      "target_shift": {
        "id": 101,
        "date": "2024-01-02",
        "start_time": "08:00",
        "end_time": "16:00",
        "title": "Day Shift"
      },
      "status": "pending",
      "reason": "Personal appointment",
      "created_at": "2024-01-15T16:00:00.000Z"
    }
  ]
}
```

### POST /api/employee/swap-requests
Create a new shift swap request.

**Authorization:** `employee`, `manager`, `enterpriseAdmin`, `systemAdmin`

**Request Body:**
```json
{
  "shift_id": 100,
  "target_employee_id": 124,
  "target_shift_id": 101,
  "reason": "Personal appointment",
  "message": "Would like to swap shifts due to a medical appointment"
}
```

**Response (201 Created):**
```json
{
  "message": "Swap request created successfully",
  "swap_request": {
    "id": 11,
    "requester_id": 123,
    "target_employee_id": 124,
    "shift_id": 100,
    "target_shift_id": 101,
    "status": "pending",
    "reason": "Personal appointment",
    "message": "Would like to swap shifts due to a medical appointment",
    "created_at": "2024-01-15T18:30:00.000Z"
  }
}
```

## Notification System

### GET /api/notifications
Get notifications for the authenticated user.

**Authorization:** All authenticated users

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `read`: Filter by read status (`true`, `false`)
- `type`: Filter by notification type
- `priority`: Filter by priority (`low`, `normal`, `high`, `urgent`)

**Response (200 OK):**
```json
{
  "message": "Notifications retrieved successfully",
  "notifications": [
    {
      "id": 500,
      "type": "roster_published",
      "title": "New Roster Published",
      "message": "January 2024 Engineering Roster has been published",
      "priority": "normal",
      "read_at": null,
      "action_url": "/rosters/50",
      "data": {
        "roster_id": 50,
        "roster_name": "January 2024 Engineering Roster"
      },
      "expires_at": "2024-02-15T18:00:00.000Z",
      "created_at": "2024-01-15T18:00:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 45,
    "items_per_page": 20
  },
  "unread_count": 12
}
```

### PATCH /api/notifications/:id/read
Mark a notification as read.

**Authorization:** All authenticated users

**Response (200 OK):**
```json
{
  "message": "Notification marked as read",
  "notification": {
    "id": 500,
    "read_at": "2024-01-15T19:00:00.000Z"
  }
}
```

### POST /api/notifications/mark-all-read
Mark all notifications as read for the authenticated user.

**Authorization:** All authenticated users

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read",
  "marked_count": 12
}
```

## Dashboard Analytics

### GET /api/dashboard/stats
Get dashboard statistics based on user role.

**Authorization:** All authenticated users

**Response varies by role:**

#### System Admin Response (200 OK):
```json
{
  "message": "Dashboard stats retrieved successfully",
  "stats": {
    "total_enterprises": 5,
    "total_users": 1250,
    "active_users": 1180,
    "total_rosters": 45,
    "system_health": "excellent",
    "recent_activity": [
      {
        "type": "enterprise_created",
        "description": "New enterprise 'Global Corp' created",
        "timestamp": "2024-01-15T17:00:00.000Z"
      }
    ]
  }
}
```

#### Enterprise Admin Response (200 OK):
```json
{
  "message": "Dashboard stats retrieved successfully",
  "stats": {
    "total_departments": 8,
    "total_users": 245,
    "active_users": 230,
    "total_rosters": 12,
    "pending_approvals": 3,
    "department_breakdown": [
      {
        "id": 1,
        "name": "Engineering",
        "total_users": 25,
        "active_users": 24,
        "active_rosters": 2
      }
    ]
  }
}
```

#### Manager Response (200 OK):
```json
{
  "message": "Dashboard stats retrieved successfully",
  "stats": {
    "team_size": 25,
    "active_rosters": 2,
    "pending_approvals": 1,
    "upcoming_shifts": 45,
    "team_members": [
      {
        "id": 123,
        "full_name": "John Doe",
        "upcoming_shifts": 5,
        "last_login": "2024-01-15T16:00:00.000Z"
      }
    ]
  }
}
```

#### Employee Response (200 OK):
```json
{
  "message": "Dashboard stats retrieved successfully",
  "stats": {
    "upcoming_shifts": 5,
    "this_week_hours": 32,
    "this_month_hours": 120,
    "pending_swaps": 1,
    "unread_notifications": 3,
    "next_shift": {
      "id": 100,
      "date": "2024-01-16",
      "start_time": "08:00",
      "end_time": "16:00",
      "title": "Day Shift"
    }
  }
}
```

---

## Error Handling

### Common Error Responses

#### Validation Error (400 Bad Request):
```json
{
  "error": "Validation error",
  "message": "Full name, email, password, and role are required",
  "details": {
    "missing_fields": ["full_name", "email"]
  }
}
```

#### Authentication Error (401 Unauthorized):
```json
{
  "error": "Authentication failed",
  "message": "Invalid email or password"
}
```

#### Authorization Error (403 Forbidden):
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions for this operation"
}
```

#### Resource Not Found (404 Not Found):
```json
{
  "error": "Not found",
  "message": "Roster not found"
}
```

#### Conflict Error (409 Conflict):
```json
{
  "error": "Conflict",
  "message": "A roster already exists for this date range"
}
```

#### Server Error (500 Internal Server Error):
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Bulk operations**: 20 requests per minute per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995260
```

## WebSocket Events

For real-time features, the API also supports WebSocket connections at `/socket.io/`:

### Client Events
- `connection`: Establish WebSocket connection
- `notification_read`: Mark notification as read

### Server Events
- `new_notification`: New notification received
- `roster_updated`: Roster has been updated
- `shift_assigned`: New shift assignment
- `swap_request`: New swap request received

For detailed WebSocket documentation, refer to the technical documentation.
```
```
