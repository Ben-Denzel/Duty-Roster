<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div class="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
        <!-- Logo -->
        <div class="flex items-center flex-shrink-0 px-6">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h1 class="text-xl font-bold text-gray-900">DutyRoster</h1>
            <p class="text-xs text-gray-500">Enterprise Management</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="mt-8 flex-1 px-3 space-y-1">
          <!-- Dashboard -->
          <router-link
            to="/dashboard"
            class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
            :class="$route.path === '/dashboard' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
          >
            <svg class="mr-3 h-5 w-5" :class="$route.path === '/dashboard' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            Dashboard
          </router-link>

          <!-- System Admin Section -->
          <div v-if="authStore.isSystemAdmin" class="space-y-1">
            <div class="px-3 py-2">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">System Administration</h3>
            </div>

            <router-link
              to="/enterprises"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/enterprises' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/enterprises' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"/>
              </svg>
              Enterprises
            </router-link>

            <router-link
              to="/system-settings"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/system-settings' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/system-settings' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
              </svg>
              System Settings
            </router-link>
          </div>

          <!-- Enterprise Admin Section -->
          <div v-if="authStore.isEnterpriseAdmin" class="space-y-1">
            <div class="px-3 py-2">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enterprise Management</h3>
            </div>

            <router-link
              to="/users"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/users' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/users' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
              User Management
            </router-link>

            <router-link
              to="/departments"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/departments' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/departments' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
              Departments
            </router-link>

            <router-link
              to="/rosters"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/rosters' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/rosters' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              Duty Rosters
            </router-link>
          </div>

          <!-- Manager Section -->
          <div v-if="authStore.isManager" class="space-y-1">
            <div class="px-3 py-2">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department Management</h3>
            </div>

            <router-link
              to="/roster-approvals"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/roster-approvals' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/roster-approvals' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              Roster Approvals
            </router-link>

            <router-link
              to="/shift-swaps"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/shift-swaps' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/shift-swaps' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
              </svg>
              Shift Swaps
            </router-link>


          </div>

          <!-- Employee Section -->
          <div v-if="authStore.isEmployee" class="space-y-1">
            <div class="px-3 py-2">
              <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee Portal</h3>
            </div>

            <router-link
              to="/my-schedule"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/my-schedule' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/my-schedule' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
              </svg>
              My Schedule
            </router-link>

            <router-link
              to="/availability"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/availability' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/availability' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
              </svg>
              Availability
            </router-link>

            <router-link
              to="/shift-swaps"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/shift-swaps' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/shift-swaps' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
              </svg>
              Shift Swaps
            </router-link>

            <router-link
              to="/my-analytics"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/my-analytics' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/my-analytics' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
              My Analytics
            </router-link>
          </div>

          <!-- Common Section -->
          <div class="space-y-1 pt-4 border-t border-gray-200">
            <router-link
              to="/notifications"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/notifications' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/notifications' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
              Notifications
            </router-link>

            <router-link
              to="/profile"
              class="group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
              :class="$route.path === '/profile' ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'"
            >
              <svg class="mr-3 h-5 w-5" :class="$route.path === '/profile' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              Profile
            </router-link>
          </div>
        </nav>

        <!-- User Info -->
        <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div class="flex items-center w-full">
            <router-link
              to="/profile"
              class="flex items-center flex-1 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
            >
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ authStore.user?.full_name?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.user?.full_name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ roleDisplay }}</p>
              </div>
            </router-link>
            <button
              @click="handleLogout"
              class="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="Logout"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu button -->
    <div class="lg:hidden">
      <div class="flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
            </svg>
          </div>
          <h1 class="ml-2 text-lg font-bold text-gray-900">DutyRoster</h1>
        </div>
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div class="lg:pl-64 flex flex-col flex-1">
      <!-- Top bar -->
      <div class="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">{{ pageTitle }}</h1>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <NotificationBell />

              <!-- User menu -->
              <div class="hidden lg:flex items-center space-x-3">
                <div class="text-right">
                  <div class="text-sm font-medium text-gray-900">{{ authStore.user?.full_name }}</div>
                  <div class="text-xs text-gray-500">{{ roleDisplay }}</div>
                </div>
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
                    {{ authStore.user?.full_name?.charAt(0).toUpperCase() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import NotificationBell from './NotificationBell.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mobileMenuOpen = ref(false)

const roleDisplay = computed(() => {
  switch (authStore.user?.role) {
    case 'systemAdmin':
      return 'System Administrator'
    case 'enterpriseAdmin':
      return 'Enterprise Administrator'
    case 'manager':
      return 'Department Manager'
    case 'employee':
      return 'Employee'
    default:
      return 'Unknown'
  }
})

const pageTitle = computed(() => {
  switch (route.path) {
    case '/dashboard':
      return 'Dashboard'
    case '/enterprises':
      return 'Enterprise Management'
    case '/users':
      return 'User Management'
    case '/departments':
      return 'Department Management'
    case '/rosters':
      return 'Duty Rosters'
    case '/roster-approvals':
      return 'Roster Approvals'
    case '/shift-swaps':
      return 'Shift Swaps'
    case '/my-schedule':
      return 'My Schedule'
    case '/availability':
      return 'Availability'
    case '/notifications':
      return 'Notifications'
    case '/profile':
      return 'Profile'
    case '/system-settings':
      return 'System Settings'
    default:
      return 'DutyRoster'
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
