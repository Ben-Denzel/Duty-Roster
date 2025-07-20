import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: number
  full_name: string
  email: string
  role: 'systemAdmin' | 'enterpriseAdmin' | 'manager' | 'employee'
  gender?: string
  enterprise_id?: number
  department_id?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  full_name: string
  email: string
  password: string
  role: 'systemAdmin' | 'enterpriseAdmin' | 'manager' | 'employee'
  gender?: string
  enterprise_id?: number
  department_id?: number
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/auth/login', data).then(res => res.data),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/auth/register', data).then(res => res.data),

  createUser: (data: RegisterRequest): Promise<{ message: string; user: User }> =>
    api.post('/auth/create-user', data).then(res => res.data),

  getProfile: (): Promise<{ user: User & {
    stats: any;
    recentNotifications: any[];
    unreadNotifications: number;
    enterprise?: { id: number; name: string; created_at: string };
    department?: { id: number; name: string; description: string; manager?: { id: number; full_name: string; email: string } };
  } }> =>
    api.get('/auth/profile').then(res => res.data),

  updateProfile: (data: {
    full_name: string;
    email: string;
    gender?: string;
    current_password?: string;
    new_password?: string;
  }): Promise<{ message: string; user: User }> =>
    api.put('/auth/profile', data).then(res => res.data),

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }
}

// Enterprise API
export const enterpriseAPI = {
  create: (data: {
    enterprise_name: string
    admin_name: string
    admin_email: string
    admin_password: string
    admin_gender?: string
  }) => api.post('/enterprises', data).then(res => res.data),

  getAll: () => api.get('/enterprises').then(res => res.data),

  getById: (id: number) => api.get(`/enterprises/${id}`).then(res => res.data)
}

// User Management API
export const userAPI = {
  // Get users for an enterprise (uses enterprise endpoint)
  getByEnterprise: (enterpriseId: number) =>
    api.get(`/enterprises/${enterpriseId}`).then(res => res.data),

  // Update a user
  update: (id: number, data: {
    full_name?: string
    email?: string
    role?: string
    gender?: string
    department_id?: number | null
    is_active?: boolean
    reset_password?: boolean
  }) => api.put(`/users/${id}`, data).then(res => res.data),
}

// Dashboard Analytics API
export const dashboardAPI = {
  // Get enterprise analytics (for enterprise admins)
  getEnterpriseAnalytics: () =>
    api.get('/dashboard/enterprise').then(res => res.data),

  // Get system analytics (for system admins)
  getSystemAnalytics: () =>
    api.get('/dashboard/system').then(res => res.data),

  // Get manager analytics (for managers)
  getManagerAnalytics: () =>
    api.get('/dashboard/manager').then(res => res.data),

  // Get employee analytics (for employees)
  getEmployeeAnalytics: () =>
    api.get('/dashboard/employee').then(res => res.data),
}

// Department API
export const departmentAPI = {
  // Get all departments (for current user's enterprise)
  getAll: async (params?: {
    page?: number
    limit?: number
    search?: string
    include_inactive?: boolean
  }) => {
    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('No user found in localStorage')
      }

      const user = JSON.parse(userStr)
      const enterpriseId = user.enterprise_id

      if (!enterpriseId) {
        // For system admins without enterprise_id, try to get from first available enterprise
        const enterprisesRes = await api.get('/enterprises')
        const enterprises = enterprisesRes.data.enterprises || []

        if (enterprises.length > 0) {
          const response = await api.get(`/departments/enterprise/${enterprises[0].id}`, { params })
          return response.data
        } else {
          return { departments: [] }
        }
      } else {
        // Use the user's enterprise_id
        const response = await api.get(`/departments/enterprise/${enterpriseId}`, { params })
        return response.data
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      return { departments: [] }
    }
  },

  // Get all departments for an enterprise
  getByEnterprise: (enterpriseId: number, params?: {
    page?: number
    limit?: number
    search?: string
    include_inactive?: boolean
  }) => api.get(`/departments/enterprise/${enterpriseId}`, { params }).then(res => res.data),

  // Get department analytics for an enterprise
  getAnalytics: (enterpriseId: number) =>
    api.get(`/departments/enterprise/${enterpriseId}/analytics`).then(res => res.data),

  // Get a specific department
  getById: (id: number) =>
    api.get(`/departments/${id}`).then(res => res.data),

  // Create a new department
  create: (data: {
    name: string
    description?: string
    enterprise_id: number
    manager_id?: number
    working_hours?: any
    shift_patterns?: any
    settings?: any
  }) => api.post('/departments', data).then(res => res.data),

  // Update a department
  update: (id: number, data: {
    name?: string
    description?: string
    manager_id?: number
    working_hours?: any
    shift_patterns?: any
    settings?: any
    is_active?: boolean
  }) => api.put(`/departments/${id}`, data).then(res => res.data),

  // Delete a department
  delete: (id: number) =>
    api.delete(`/departments/${id}`).then(res => res.data),

  // Assign users to a department
  assignUsers: (id: number, userIds: number[]) =>
    api.post(`/departments/${id}/users`, { user_ids: userIds }).then(res => res.data),

  // Remove users from a department
  removeUsers: (id: number, userIds: number[]) =>
    api.delete(`/departments/${id}/users`, { data: { user_ids: userIds } }).then(res => res.data)
}

// Shift Template API
export const shiftTemplateAPI = {
  // Get default templates
  getDefaults: () =>
    api.get('/shift-templates/defaults').then(res => res.data),

  // Get templates for a department
  getByDepartment: (departmentId: number) =>
    api.get(`/shift-templates/department/${departmentId}`).then(res => res.data),

  // Save a template (create or update)
  save: (departmentId: number, template: {
    id: string
    name: string
    start: string
    end: string
    enabled?: boolean
    required_staff?: number
    break_schedule?: any
    color?: string
    description?: string
  }) => api.post(`/shift-templates/department/${departmentId}`, template).then(res => res.data),

  // Delete a template
  delete: (departmentId: number, templateId: string) =>
    api.delete(`/shift-templates/department/${departmentId}/${templateId}`).then(res => res.data)
}

// Roster API
export const rosterAPI = {
  // Get all rosters across departments (with permissions)
  getAll: (params?: {
    page?: number
    limit?: number
    status?: string
    start_date?: string
    end_date?: string
    search?: string
  }) => api.get('/rosters/all', { params }).then(res => res.data),

  // Get rosters for a department
  getByDepartment: (departmentId: number, params?: {
    page?: number
    limit?: number
    status?: string
    start_date?: string
    end_date?: string
    search?: string
  }) => api.get(`/rosters/department/${departmentId}`, { params }).then(res => res.data),

  // Get a specific roster
  getById: (id: number) =>
    api.get(`/rosters/${id}`).then(res => res.data),

  // Create a new roster (old method - basic roster without shifts)
  create: (data: {
    name: string
    description?: string
    department_id: number
    start_date: string
    end_date: string
    settings?: any
  }) => api.post('/rosters', data).then(res => res.data),

  // Create a new roster with auto-generated shifts (NEW - recommended method)
  createWithShifts: (data: {
    name: string
    description?: string
    department_id: number
    start_date: string
    end_date: string
    shift_template?: 'standard' | 'hospital' | 'security'
    auto_generate_shifts?: boolean
  }) => api.post('/shift-management/rosters', data).then(res => res.data),

  // Update a roster
  update: (id: number, data: {
    name?: string
    description?: string
    start_date?: string
    end_date?: string
    settings?: any
  }) => api.put(`/rosters/${id}`, data).then(res => res.data),

  // Delete a roster
  delete: (id: number) =>
    api.delete(`/rosters/${id}`).then(res => res.data),

  // Update roster status
  updateStatus: (id: number, data: {
    status: 'draft' | 'review' | 'approved' | 'published'
    notes?: string
  }) => api.patch(`/rosters/${id}/status`, data).then(res => res.data),

  // Copy a roster
  copy: (id: number, data: {
    name: string
    start_date: string
    end_date: string
    copy_shifts?: boolean
  }) => api.post(`/rosters/${id}/copy`, data).then(res => res.data)
}

// Shift API
export const shiftAPI = {
  // Get shifts for a roster
  getByRoster: (rosterId: number, params?: {
    date?: string
    shift_type?: string
    status?: string
  }) => api.get(`/shifts/roster/${rosterId}`, { params }).then(res => res.data),

  // Create a new shift
  create: (data: {
    roster_id: number
    date: string
    start_time: string
    end_time: string
    shift_type: 'day' | 'night' | 'weekend' | 'holiday'
    title?: string
    description?: string
    required_staff?: number
    responsible_id?: number
    location?: string
    requirements?: any
    break_schedule?: any
    priority?: 'low' | 'normal' | 'high' | 'critical'
    color?: string
    notes?: string
  }) => api.post('/shifts', data).then(res => res.data),

  // Update a shift
  update: (id: number, data: any) =>
    api.put(`/shifts/${id}`, data).then(res => res.data),

  // Delete a shift
  delete: (id: number) =>
    api.delete(`/shifts/${id}`).then(res => res.data),

  // Get assignments for a shift
  getAssignments: (shiftId: number) =>
    api.get(`/shifts/${shiftId}/assignments`).then(res => res.data),

  // Get available employees for a shift
  getAvailableEmployees: (shiftId: number) =>
    api.get(`/shifts/${shiftId}/available-employees`).then(res => res.data),

  // Assign employee to shift
  assignEmployee: (shiftId: number, data: {
    employee_id: number
    role?: string
    notes?: string
  }) => api.post(`/shifts/${shiftId}/assignments`, data).then(res => res.data),

  // Unassign employee from shift
  unassignEmployee: (assignmentId: number) =>
    api.delete(`/shifts/assignments/${assignmentId}`).then(res => res.data),

  // Bulk assign employees
  bulkAssign: (assignments: Array<{
    shift_id: number
    employee_id: number
    role?: string
    notes?: string
  }>) => api.post('/shifts/bulk-assign', { assignments }).then(res => res.data)
}

// Approval API
export const approvalAPI = {
  // Submit roster for approval
  submit: (rosterId: number, data?: {
    message?: string
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    approval_type?: 'standard' | 'force'
  }) => api.post(`/approvals/rosters/${rosterId}/submit`, data || {}).then(res => res.data),

  // Get pending approvals for manager
  getPending: (params?: {
    page?: number
    limit?: number
  }) => api.get('/approvals/pending', { params }).then(res => res.data),

  // Approve a roster
  approve: (rosterId: number, data?: {
    notes?: string
    conditions?: string[]
  }) => api.post(`/approvals/rosters/${rosterId}/approve`, data || {}).then(res => res.data),

  // Reject a roster
  reject: (rosterId: number, data: {
    notes: string
    required_changes?: string[]
  }) => api.post(`/approvals/rosters/${rosterId}/reject`, data).then(res => res.data),

  // Get approval history for a roster
  getHistory: (rosterId: number) =>
    api.get(`/approvals/rosters/${rosterId}/history`).then(res => res.data)
}

// Employee API
export const employeeAPI = {
  // Get personal schedule
  getMySchedule: (params?: {
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
  }) => api.get('/employee/my-schedule', { params }).then(res => res.data),

  // Update assignment status (confirm/decline)
  updateAssignmentStatus: (assignmentId: number, data: {
    status: 'confirmed' | 'declined'
    notes?: string
  }) => api.patch(`/employee/assignments/${assignmentId}/status`, data).then(res => res.data),



  // Get swap requests
  getSwapRequests: (params?: {
    status?: string
    type?: 'all' | 'sent' | 'received'
    page?: number
    limit?: number
  }) => api.get('/employee/swap-requests', { params }).then(res => res.data),

  // Create swap request
  createSwapRequest: (data: {
    shift_id: number
    target_employee_id?: number
    swap_with_shift_id?: number
    request_type?: 'swap' | 'cover' | 'trade'
    reason?: string
    message?: string
    priority?: 'low' | 'normal' | 'high' | 'urgent'
    compensation_offered?: any
  }) => api.post('/employee/swap-requests', data).then(res => res.data),

  // Respond to swap request
  respondToSwapRequest: (swapRequestId: number, data: {
    response: 'accepted' | 'declined'
    message?: string
  }) => api.patch(`/employee/swap-requests/${swapRequestId}/respond`, data).then(res => res.data),

  // Cancel swap request
  cancelSwapRequest: (swapRequestId: number) =>
    api.patch(`/employee/swap-requests/${swapRequestId}/cancel`).then(res => res.data),

  // Manager approve/reject swap request
  managerActionSwapRequest: (swapRequestId: number, data: {
    action: 'approve' | 'reject'
    message?: string
  }) => api.patch(`/employee/swap-requests/${swapRequestId}/manager-action`, data).then(res => res.data)
}

// Notification interfaces
export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  data?: any
  priority: 'low' | 'normal' | 'high' | 'urgent'
  read_at?: string
  email_sent: boolean
  email_sent_at?: string
  action_url?: string
  expires_at?: string
  days_until_cleanup?: number | null
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  id: number
  user_id: number
  email_enabled: boolean
  push_enabled: boolean
  sound_enabled: boolean
  desktop_enabled: boolean
  roster_published: boolean
  shift_assigned: boolean
  shift_unassigned: boolean
  swap_request_received: boolean
  swap_request_approved: boolean
  swap_request_rejected: boolean
  swap_request_cancelled: boolean
  roster_needs_approval: boolean
  roster_approved: boolean
  roster_rejected: boolean
  schedule_changed: boolean

  approval_reminder: boolean
  system_announcement: boolean
  welcome: boolean
  email_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  email_digest: boolean
  quiet_hours_enabled: boolean
  quiet_hours_start?: string
  quiet_hours_end?: string
  created_at: string
  updated_at: string
}

export interface NotificationResponse {
  message: string
  notifications: Notification[]
  pagination: {
    current_page: number
    total_pages: number
    total_items: number
    items_per_page: number
  }
  unread_count: number
}

// Notification API
export const notificationAPI = {
  // Get notifications
  getNotifications: (params?: {
    page?: number
    limit?: number
    unread_only?: boolean
    type?: string
    include_expired?: boolean
  }) => api.get<NotificationResponse>('/notifications', { params }).then(res => res.data),

  // Get unread count
  getUnreadCount: () => api.get<{ unread_count: number }>('/notifications/count').then(res => res.data),

  // Mark notification as read
  markAsRead: (notificationId: number) =>
    api.put(`/notifications/${notificationId}/read`).then(res => res.data),

  // Mark all notifications as read
  markAllAsRead: () => api.put('/notifications/read-all').then(res => res.data),

  // Delete notification
  deleteNotification: (notificationId: number) =>
    api.delete(`/notifications/${notificationId}`).then(res => res.data),

  // Get notification preferences
  getPreferences: () => api.get<{ preferences: NotificationPreferences }>('/notifications/preferences').then(res => res.data),

  // Update notification preferences
  updatePreferences: (preferences: Partial<NotificationPreferences>) =>
    api.put('/notifications/preferences', preferences).then(res => res.data),

  // Create test notification (admin only)
  createTestNotification: (data: { type: string; variables?: any; overrides?: any }) =>
    api.post('/notifications/test', data).then(res => res.data),

  // Get notification statistics (admin only)
  getStats: () => api.get('/notifications/stats').then(res => res.data),

  // Cleanup old notifications (system admin only)
  cleanup: (options?: { days_after_read?: number; days_unread?: number }) =>
    api.post('/notifications/cleanup', options).then(res => res.data)
}

// Health check
export const healthAPI = {
  check: () => api.get('/health').then(res => res.data)
}

// System Settings API
export const systemSettingsAPI = {
  getSettings: (): Promise<{
    message: string;
    settings: {
      statistics: any;
      configuration: any;
    };
  }> =>
    api.get('/system-settings').then(res => res.data),

  updateSettings: (configuration: any): Promise<{ message: string; updatedSections: string[] }> =>
    api.put('/system-settings', { configuration }).then(res => res.data),

  performMaintenance: (task: string, parameters?: any): Promise<{ message: string; result: any }> =>
    api.post('/system-settings/maintenance', { task, parameters }).then(res => res.data),

  getLogs: (params?: { limit?: number; level?: string }): Promise<{ message: string; logs: any[] }> =>
    api.get('/system-settings/logs', { params }).then(res => res.data)
}

export default api
