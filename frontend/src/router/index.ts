import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },

    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/enterprises',
      name: 'enterprises',
      component: () => import('../views/EnterpriseManagementView.vue'),
      meta: { requiresAuth: true, requiresSystemAdmin: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UserManagementView.vue'),
      meta: { requiresAuth: true, requiresEnterpriseAdmin: true }
    },
    {
      path: '/departments',
      name: 'departments',
      component: () => import('../views/DepartmentManagementView.vue'),
      meta: { requiresAuth: true, requiresEnterpriseAdmin: true }
    },
    {
      path: '/rosters',
      name: 'rosters',
      component: () => import('../views/RosterManagementView.vue'),
      meta: { requiresAuth: true, requiresEnterpriseAdmin: true }
    },
    {
      path: '/rosters/:id',
      name: 'roster-details',
      component: () => import('../views/RosterDetailsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/roster-approvals',
      name: 'roster-approvals',
      component: () => import('../views/RosterApprovalsView.vue'),
      meta: { requiresAuth: true, requiresManager: true }
    },
    {
      path: '/my-schedule',
      name: 'my-schedule',
      component: () => import('../views/MyScheduleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/shift-swaps',
      name: 'shift-swaps',
      component: () => import('../views/ShiftSwapsView.vue'),
      meta: { requiresAuth: true }
    },

    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/iamasystemadmin',
      name: 'create-system-admin',
      component: () => import('../views/CreateSystemAdminView.vue'),
      meta: { requiresAuth: false } // No auth required for this special endpoint
    },
    {
      path: '/notifications/preferences',
      name: 'notification-preferences',
      component: () => import('../views/NotificationPreferencesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/system-settings',
      name: 'system-settings',
      component: () => import('../views/SystemSettingsView.vue'),
      meta: { requiresAuth: true, requiresRole: 'systemAdmin' }
    },

  ],
})

// Route guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  // Check if route requires system admin access
  if (to.meta.requiresSystemAdmin && !authStore.isSystemAdmin) {
    next('/dashboard')
    return
  }

  // Check if route requires enterprise admin access
  if (to.meta.requiresEnterpriseAdmin && !authStore.isEnterpriseAdmin) {
    next('/dashboard')
    return
  }

  // Check if route requires manager access
  if (to.meta.requiresManager && !authStore.isManager && !authStore.isSystemAdmin) {
    next('/dashboard')
    return
  }

  // Check if route requires any admin access
  if (to.meta.requiresAdmin && !authStore.isSystemAdmin && !authStore.isEnterpriseAdmin) {
    next('/dashboard')
    return
  }

  next()
})

export default router
