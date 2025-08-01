<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">My Profile</h1>
        <p class="mt-2 text-gray-600">Manage your personal information and account settings</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">Loading profile...</span>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="space-y-8">
        <!-- Profile Header -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span class="text-2xl font-bold text-white">
                {{ profile.full_name?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="flex-1">
              <h2 class="text-2xl font-bold text-gray-900">{{ profile.full_name }}</h2>
              <p class="text-lg text-gray-600">{{ getRoleDisplay(profile.role) }}</p>
              <div class="flex items-center space-x-4 mt-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ profile.is_active ? 'Active' : 'Inactive' }}
                </span>
                <span class="text-sm text-gray-500">
                  Member for {{ profile.stats?.accountAge || 0 }} days
                </span>
              </div>
            </div>
            <button
              @click="showEditModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column - Profile Information -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Personal Information -->
            <div class="bg-white rounded-xl shadow-lg border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p class="text-sm text-gray-900">{{ profile.full_name }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p class="text-sm text-gray-900">{{ profile.email }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <p class="text-sm text-gray-900">{{ profile.gender || 'Not specified' }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getRoleBadgeClass(profile.role)">
                      {{ getRoleDisplay(profile.role) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Work Information -->
            <div v-if="profile.enterprise || profile.department" class="bg-white rounded-xl shadow-lg border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Work Information</h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div v-if="profile.enterprise">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Enterprise</label>
                    <p class="text-sm text-gray-900">{{ profile.enterprise.name }}</p>
                    <p class="text-xs text-gray-500">
                      Joined {{ formatDate(profile.enterprise.created_at) }}
                    </p>
                  </div>
                  <div v-if="profile.department">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <p class="text-sm text-gray-900">{{ profile.department.name }}</p>
                    <p class="text-xs text-gray-500">{{ profile.department.description }}</p>
                  </div>
                  <div v-if="profile.department?.manager">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                    <p class="text-sm text-gray-900">{{ profile.department.manager.full_name }}</p>
                    <p class="text-xs text-gray-500">{{ profile.department.manager.email }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Role-Specific Statistics -->
            <div class="bg-white rounded-xl shadow-lg border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ getRoleStatsTitle(profile.role) }}
                </h3>
              </div>
              <div class="p-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div v-for="(stat, key) in getFilteredStats(profile.stats)" :key="key" 
                       class="text-center p-4 bg-gray-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ stat.value }}</div>
                    <div class="text-sm text-gray-600">{{ stat.label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Activity & Notifications -->
          <div class="space-y-6">
            <!-- Quick Stats -->
            <div class="bg-white rounded-xl shadow-lg border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Account Created</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ formatDate(profile.created_at) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Last Updated</span>
                  <span class="text-sm font-medium text-gray-900">
                    {{ formatDate(profile.updated_at) }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Unread Notifications</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ profile.unreadNotifications || 0 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Notifications -->
            <div v-if="profile.recentNotifications?.length > 0" class="bg-white rounded-xl shadow-lg border border-gray-100">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Recent Notifications</h3>
              </div>
              <div class="p-6">
                <div class="space-y-3">
                  <div v-for="notification in profile.recentNotifications" :key="notification.id"
                       class="flex items-start space-x-3 p-3 rounded-lg"
                       :class="notification.read_at ? 'bg-gray-50' : 'bg-blue-50'">
                    <div class="flex-shrink-0">
                      <div class="w-2 h-2 rounded-full mt-2"
                           :class="notification.read_at ? 'bg-gray-400' : 'bg-blue-500'">
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                      <p class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                      <p class="text-xs text-gray-500 mt-1">
                        {{ formatDate(notification.created_at) }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mt-4 text-center">
                  <router-link
                    to="/notifications"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View all notifications →
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <ProfileEditModal
        v-if="showEditModal"
        :user="profile"
        @close="showEditModal = false"
        @updated="handleProfileUpdated"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import ProfileEditModal from '@/components/ProfileEditModal.vue'

// Type definitions
interface ProfileStats {
  [key: string]: {
    value: string | number
    label: string
  }
}

interface Profile {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
  updated_at: string
  is_active?: boolean
  gender?: string
  enterprise?: {
    id: number
    name: string
    created_at: string
  }
  department?: {
    id: number
    name: string
    description: string
    manager?: {
      full_name: string
      email: string
    }
  }
  unreadNotifications?: number
  recentNotifications?: any[]
  stats?: ProfileStats
}

const authStore = useAuthStore()

// State with proper typing
const profile = ref<Profile | null>(null)
const loading = ref(false)
const showEditModal = ref(false)

// Functions
const fetchProfile = async () => {
  try {
    loading.value = true
    const response = await authAPI.getProfile()
    profile.value = response.user
  } catch (error) {
    console.error('Failed to fetch profile:', error)
  } finally {
    loading.value = false
  }
}

const handleProfileUpdated = () => {
  showEditModal.value = false
  fetchProfile()
  // Update auth store with new user data
  authStore.fetchProfile()
}

const getRoleDisplay = (role: string) => {
  const roleMap: Record<string, string> = {
    systemAdmin: 'System Administrator',
    enterpriseAdmin: 'Enterprise Administrator',
    manager: 'Manager',
    employee: 'Employee'
  }
  return roleMap[role] || role
}

const getRoleBadgeClass = (role: string) => {
  const classMap: Record<string, string> = {
    systemAdmin: 'bg-purple-100 text-purple-800',
    enterpriseAdmin: 'bg-blue-100 text-blue-800',
    manager: 'bg-green-100 text-green-800',
    employee: 'bg-gray-100 text-gray-800'
  }
  return classMap[role] || 'bg-gray-100 text-gray-800'
}

const getRoleStatsTitle = (role: string) => {
  const titleMap: Record<string, string> = {
    systemAdmin: 'Platform Statistics',
    enterpriseAdmin: 'Enterprise Statistics',
    manager: 'Management Statistics',
    employee: 'Work Statistics'
  }
  return titleMap[role] || 'Statistics'
}

const getFilteredStats = (stats: any): ProfileStats => {
  if (!stats) return {}
  
  const filtered: ProfileStats = {}
  Object.keys(stats).forEach(key => {
    if (key !== 'accountAge') {
      const labelMap: Record<string, string> = {
        totalEnterprises: 'Enterprises',
        totalUsers: 'Total Users',
        totalDepartments: 'Departments',
        recentUsers: 'New Users',
        enterpriseUsers: 'Users',
        enterpriseDepartments: 'Departments',
        recentRosters: 'New Rosters',
        teamMembers: 'Team Members',
        myRosters: 'My Rosters',
        pendingApprovals: 'Pending',
        totalAssignments: 'Total Shifts',
        confirmedAssignments: 'Confirmed',
        swapRequestsMade: 'Swap Requests',
        upcomingShifts: 'Upcoming',
        acceptanceRate: 'Acceptance %'
      }
      
      if (labelMap[key]) {
        filtered[key] = {
          value: stats[key],
          label: labelMap[key]
        }
      }
    }
  })
  
  return filtered
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Initialize
onMounted(() => {
  fetchProfile()
})
</script>
