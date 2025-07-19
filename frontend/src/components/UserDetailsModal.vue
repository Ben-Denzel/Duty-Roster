<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <span class="text-lg font-medium text-white">
                {{ user?.full_name?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ user?.full_name }}</h3>
              <p class="text-sm text-gray-600">User Details</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="mt-6 space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Personal Information</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Full Name:</span>
                  <span class="text-sm font-medium text-gray-900">{{ user?.full_name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Email:</span>
                  <span class="text-sm font-medium text-gray-900">{{ user?.email }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Gender:</span>
                  <span class="text-sm font-medium text-gray-900">{{ user?.gender || 'Not specified' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Joined:</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDate(user?.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Work Information</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Role:</span>
                  <span 
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRoleBadgeClass(user?.role)"
                  >
                    {{ getRoleDisplay(user?.role) }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Department:</span>
                  <span class="text-sm font-medium text-gray-900">{{ user?.department?.name || 'Not assigned' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Enterprise:</span>
                  <span class="text-sm font-medium text-gray-900">{{ user?.enterprise?.name || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Status:</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Summary -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Activity Summary</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">0</div>
                <div class="text-xs text-gray-600">Shifts Assigned</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">0</div>
                <div class="text-xs text-gray-600">Hours Worked</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">0</div>
                <div class="text-xs text-gray-600">Requests Made</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600">100%</div>
                <div class="text-xs text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
            <div class="space-y-3">
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                User account created on {{ formatDate(user?.created_at) }}
              </div>
              <div class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                Assigned {{ getRoleDisplay(user?.role) }} role
              </div>
              <div v-if="user?.department" class="flex items-center text-sm text-gray-600">
                <svg class="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                </svg>
                Assigned to {{ user.department.name }} department
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="text-sm font-medium text-blue-900 mb-3">Quick Actions</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                @click="$emit('edit', user)"
                class="inline-flex items-center justify-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Edit User
              </button>
              <button
                @click="resetPassword"
                class="inline-flex items-center justify-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0a2 2 0 002 2h6a2 2 0 002-2m0 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v0"/>
                </svg>
                Reset Password
              </button>
              <button
                @click="viewSchedule"
                class="inline-flex items-center justify-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                View Schedule
              </button>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Close
          </button>
          <button
            @click="$emit('edit', user)"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  user?: any
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [user: any]
}>()

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getRoleDisplay = (role: string) => {
  switch (role) {
    case 'systemAdmin':
      return 'System Admin'
    case 'enterpriseAdmin':
      return 'Enterprise Admin'
    case 'manager':
      return 'Manager'
    case 'employee':
      return 'Employee'
    default:
      return role
  }
}

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'systemAdmin':
      return 'bg-red-100 text-red-800'
    case 'enterpriseAdmin':
      return 'bg-blue-100 text-blue-800'
    case 'manager':
      return 'bg-green-100 text-green-800'
    case 'employee':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const resetPassword = () => {
  alert('Password reset functionality will be implemented soon.')
}

const viewSchedule = () => {
  alert('Schedule view functionality will be implemented soon.')
}
</script>
