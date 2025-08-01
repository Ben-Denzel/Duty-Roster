# SchedulaX Frontend Technical Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Components](#core-components)
6. [Routing System](#routing-system)
7. [State Management](#state-management)
8. [API Integration](#api-integration)
9. [Authentication & Authorization](#authentication--authorization)
10. [Theme System](#theme-system)
11. [Development Setup](#development-setup)
12. [Build & Deployment](#build--deployment)

## Overview

SchedulaX is a professional duty management system built with Vue.js 3, TypeScript, and modern web technologies. The frontend provides a responsive, role-based interface for managing enterprise duty rosters, shift assignments, and employee scheduling.

### Key Features
- **Role-based Access Control**: Different interfaces for System Admins, Enterprise Admins, Managers, and Employees
- **Real-time Notifications**: WebSocket-based notification system with live updates
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Dark/Light Theme**: User-configurable theme system
- **Interactive Calendar**: Drag-and-drop roster management with calendar views
- **Shift Management**: Comprehensive shift creation, assignment, and swap functionality

## Architecture

The frontend follows a component-based architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Views/Pages   │    │   Components    │    │     Stores      │
│                 │    │                 │    │                 │
│ - Dashboard     │    │ - AppLayout     │    │ - Auth Store    │
│ - User Mgmt     │    │ - Calendar      │    │ - Notification  │
│ - Roster Mgmt   │    │ - Modals        │    │ - Theme Store   │
│ - Schedule      │    │ - Forms         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Services  │
                    │                 │
                    │ - HTTP Client   │
                    │ - WebSocket     │
                    │ - Auth Service  │
                    └─────────────────┘
```

## Technology Stack

### Core Technologies
- **Vue.js 3.5.17**: Progressive JavaScript framework with Composition API
- **TypeScript 5.8.0**: Type-safe JavaScript development
- **Vite 7.0.0**: Fast build tool and development server
- **Vue Router 4.5.1**: Client-side routing
- **Pinia 3.0.3**: State management library

### UI & Styling
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **PostCSS 8.5.6**: CSS processing tool
- **Autoprefixer 10.4.21**: CSS vendor prefixing

### Development Tools
- **ESLint 9.29.0**: Code linting and formatting
- **Vue DevTools**: Browser extension for debugging
- **TypeScript Compiler**: Type checking and compilation

### Communication
- **Axios 1.10.0**: HTTP client for API requests
- **Socket.IO Client 4.7.4**: Real-time WebSocket communication

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, global styles
│   │   ├── base.css       # Base Tailwind styles
│   │   ├── main.css       # Main stylesheet
│   │   └── logo.svg       # Application logo
│   ├── components/        # Reusable Vue components
│   │   ├── AppLayout.vue  # Main application layout
│   │   ├── RosterCalendar.vue # Calendar component
│   │   ├── NotificationBell.vue # Notification system
│   │   ├── ThemeToggle.vue # Theme switcher
│   │   └── modals/        # Modal components
│   ├── composables/       # Vue composition functions
│   │   └── useToast.ts    # Toast notification composable
│   ├── router/            # Vue Router configuration
│   │   └── index.ts       # Route definitions and guards
│   ├── services/          # API and external services
│   │   ├── api.ts         # HTTP API client
│   │   └── websocket.ts   # WebSocket service
│   ├── stores/            # Pinia state stores
│   │   ├── auth.ts        # Authentication state
│   │   ├── notifications.ts # Notification state
│   │   └── theme.ts       # Theme state
│   ├── views/             # Page components
│   │   ├── DashboardView.vue
│   │   ├── LoginView.vue
│   │   ├── RosterManagementView.vue
│   │   └── MyScheduleView.vue
│   ├── App.vue            # Root component
│   └── main.ts            # Application entry point
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Core Components

### AppLayout.vue
The main application layout component that provides:
- **Navigation Sidebar**: Role-based navigation menu
- **Header Bar**: User info, notifications, theme toggle
- **Mobile Responsive**: Collapsible sidebar for mobile devices
- **Page Title Management**: Dynamic page titles based on routes

### RosterCalendar.vue
Interactive calendar component featuring:
- **Multiple Views**: Week and month calendar views
- **Drag & Drop**: Shift management with drag-and-drop functionality
- **Shift Visualization**: Color-coded shifts with status indicators
- **Time Slots**: 24-hour time slot management
- **Responsive Design**: Mobile-optimized calendar layout

### NotificationBell.vue
Real-time notification system with:
- **Live Updates**: WebSocket-powered real-time notifications
- **Unread Counter**: Visual indicator for unread notifications
- **Priority Levels**: Color-coded priority indicators (urgent, high, normal, low)
- **Quick Actions**: Mark as read, view details, navigate to related content
- **Auto-cleanup**: Automatic notification cleanup based on retention policies

### ThemeToggle.vue
Theme management component providing:
- **Light/Dark Modes**: Toggle between light and dark themes
- **System Preference**: Automatic theme detection based on system settings
- **Persistent Storage**: Theme preference saved to localStorage
- **Smooth Transitions**: CSS transitions for theme changes

## Routing System

The application uses Vue Router 4 with role-based access control:

### Route Structure
```typescript
const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/enterprises', component: EnterpriseManagementView, 
    meta: { requiresAuth: true, requiresSystemAdmin: true } },
  { path: '/users', component: UserManagementView, 
    meta: { requiresAuth: true, requiresEnterpriseAdmin: true } },
  { path: '/rosters', component: RosterManagementView, 
    meta: { requiresAuth: true, requiresEnterpriseAdmin: true } },
  { path: '/my-schedule', component: MyScheduleView, 
    meta: { requiresAuth: true } }
]
```

### Route Guards
- **Authentication Guard**: Redirects unauthenticated users to login
- **Role-based Guards**: Restricts access based on user roles
- **Guest Guard**: Prevents authenticated users from accessing login page

### Navigation Permissions
- **System Admin**: Full access to all routes
- **Enterprise Admin**: Access to enterprise management features
- **Manager**: Access to department and roster management
- **Employee**: Access to personal schedule and shift swaps

## State Management

The application uses Pinia for centralized state management with three main stores:

### Auth Store (`stores/auth.ts`)
Manages user authentication and authorization:
```typescript
interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
}

// Key methods:
- login(credentials): Authenticate user
- logout(): Clear session and redirect
- refreshToken(): Refresh JWT token
- checkAuth(): Validate current session
```

### Notification Store (`stores/notifications.ts`)
Handles real-time notifications:
```typescript
interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences
  loading: boolean
  pagination: PaginationInfo
}

// Key methods:
- fetchNotifications(): Load notification list
- markAsRead(id): Mark notification as read
- markAllAsRead(): Mark all notifications as read
- initializeWebSocket(): Setup real-time connection
```

### Theme Store (`stores/theme.ts`)
Manages application theming:
```typescript
interface ThemeState {
  currentTheme: 'light' | 'dark' | 'system'
  isDark: boolean
}

// Key methods:
- setTheme(theme): Change application theme
- toggleTheme(): Switch between light/dark
- initializeTheme(): Load saved theme preference
```

## API Integration

The frontend communicates with the backend through a centralized API service layer:

### HTTP Client (`services/api.ts`)
Axios-based HTTP client with:
- **Base Configuration**: Automatic base URL and timeout settings
- **Request Interceptors**: Automatic JWT token attachment
- **Response Interceptors**: Error handling and token refresh
- **Type Safety**: TypeScript interfaces for all API responses

### API Modules
```typescript
// Authentication API
export const authAPI = {
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<TokenResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
}

// User Management API
export const userAPI = {
  getUsers: (params?: UserFilters) => Promise<UsersResponse>
  createUser: (data: CreateUserRequest) => Promise<User>
  updateUser: (id: number, data: UpdateUserRequest) => Promise<User>
  deleteUser: (id: number) => Promise<void>
}

// Roster Management API
export const rosterAPI = {
  getRosters: (params?: RosterFilters) => Promise<RostersResponse>
  createRoster: (data: CreateRosterRequest) => Promise<Roster>
  updateRoster: (id: number, data: UpdateRosterRequest) => Promise<Roster>
  deleteRoster: (id: number) => Promise<void>
  publishRoster: (id: number) => Promise<void>
}
```

### WebSocket Service (`services/websocket.ts`)
Real-time communication using Socket.IO:
- **Connection Management**: Automatic connection/reconnection
- **Event Handling**: Typed event listeners for notifications
- **Authentication**: JWT-based WebSocket authentication
- **Error Recovery**: Automatic reconnection with exponential backoff

## Authentication & Authorization

### JWT Token Management
- **Access Tokens**: Short-lived tokens for API requests
- **Refresh Tokens**: Long-lived tokens for session renewal
- **Automatic Refresh**: Background token refresh before expiration
- **Secure Storage**: Tokens stored in memory (not localStorage)

### Role-Based Access Control (RBAC)
```typescript
enum UserRole {
  SYSTEM_ADMIN = 'systemAdmin',
  ENTERPRISE_ADMIN = 'enterpriseAdmin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee'
}

// Permission hierarchy:
// systemAdmin > enterpriseAdmin > manager > employee
```

### Route Protection
```typescript
// Route guard implementation
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresSystemAdmin && !authStore.isSystemAdmin) {
    next('/dashboard')
  } else if (to.meta.requiresEnterpriseAdmin && !authStore.isEnterpriseAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})
```

## Theme System

### CSS Custom Properties
The theme system uses CSS custom properties for dynamic theming:
```css
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
  --color-text: #1f2937;
}

[data-theme="dark"] {
  --color-primary: #60a5fa;
  --color-background: #111827;
  --color-text: #f9fafb;
}
```

### Tailwind Integration
- **Dark Mode**: Tailwind's dark mode classes (`dark:bg-gray-900`)
- **Custom Colors**: Extended color palette for brand consistency
- **Responsive Design**: Mobile-first responsive utilities

### Theme Persistence
- **localStorage**: Theme preference saved locally
- **System Detection**: Automatic detection of system theme preference
- **Smooth Transitions**: CSS transitions for theme changes

## Development Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Git for version control
- Modern browser with ES6+ support

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd duty/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Access application at http://localhost:5173
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "vite",                    // Start development server
    "build": "run-p type-check \"build-only {@}\" --", // Production build
    "preview": "vite preview",        // Preview production build
    "type-check": "vue-tsc --build",  // TypeScript type checking
    "lint": "eslint . --fix"          // Code linting and formatting
  }
}
```

### Environment Configuration
```bash
# .env.local (create this file)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_APP_NAME=SchedulaX
```

## Build & Deployment

### Production Build
```bash
# Type check and build
npm run build

# Output directory: dist/
# Contains optimized HTML, CSS, JS, and assets
```

### Build Optimization
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and CSS optimization
- **Gzip Compression**: Automatic gzip compression for assets

### Deployment Options
1. **Static Hosting**: Deploy `dist/` folder to any static host
2. **CDN**: Use CDN for global asset distribution
3. **Docker**: Containerized deployment with nginx
4. **CI/CD**: Automated deployment with GitHub Actions/GitLab CI

### Performance Considerations
- **Lazy Loading**: Route-based lazy loading for optimal initial load
- **Bundle Analysis**: Use `npm run build -- --analyze` for bundle analysis
- **Caching**: Proper cache headers for static assets
- **Preloading**: Critical resource preloading for faster navigation

---

## Troubleshooting

### Common Issues
1. **Build Errors**: Check TypeScript errors with `npm run type-check`
2. **API Connection**: Verify backend is running and CORS is configured
3. **WebSocket Issues**: Check network connectivity and firewall settings
4. **Theme Issues**: Clear localStorage and refresh browser

### Debug Tools
- **Vue DevTools**: Browser extension for component inspection
- **Network Tab**: Monitor API requests and responses
- **Console Logs**: Check browser console for errors
- **Vite HMR**: Hot module replacement for development

For additional support, refer to the Vue.js, Vite, and TypeScript documentation.
