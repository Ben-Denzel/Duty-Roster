<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ department?.name }}</h3>
            <p v-if="department?.description" class="text-sm text-gray-600 mt-1">{{ department.description }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="$emit('edit', department)"
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
            >
              Edit
            </button>
            <button
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="mt-6 space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Department Manager</h4>
              <div v-if="department?.manager" class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
                    {{ department.manager.full_name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ department.manager.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ department.manager.email }}</div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-400 italic">No manager assigned</div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Department Statistics</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Total Users:</span>
                  <span class="text-sm font-medium text-gray-900">{{ department?.user_count || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Managers:</span>
                  <span class="text-sm font-medium text-gray-900">{{ department?.manager_count || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Employees:</span>
                  <span class="text-sm font-medium text-gray-900">{{ department?.employee_count || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Status:</span>
                  <span :class="department?.is_active ? 'text-green-600' : 'text-red-600'" 
                        class="text-sm font-medium">
                    {{ department?.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Working Hours -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Working Hours</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="(day, dayKey) in department?.working_hours"
                :key="dayKey"
                class="flex items-center justify-between p-2 bg-white rounded border"
              >
                <span class="text-sm font-medium text-gray-700 capitalize">{{ dayKey }}</span>
                <span v-if="day.enabled" class="text-sm text-gray-600">
                  {{ day.start }} - {{ day.end }}
                </span>
                <span v-else class="text-sm text-gray-400 italic">Closed</span>
              </div>
            </div>
          </div>

          <!-- Shift Patterns -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Shift Patterns</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                v-for="(shift, shiftKey) in department?.shift_patterns"
                :key="shiftKey"
                class="flex items-center justify-between p-2 bg-white rounded border"
              >
                <span class="text-sm font-medium text-gray-700 capitalize">{{ shiftKey }}</span>
                <span v-if="shift.enabled" class="text-sm text-gray-600">
                  {{ shift.start }} - {{ shift.end }}
                </span>
                <span v-else class="text-sm text-gray-400 italic">Disabled</span>
              </div>
            </div>
          </div>

          <!-- Department Settings -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Department Settings</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Max Consecutive Days:</span>
                  <span class="text-sm font-medium text-gray-900">{{ department?.settings?.max_consecutive_days || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Min Rest Hours:</span>
                  <span class="text-sm font-medium text-gray-900">{{ department?.settings?.min_rest_hours || 'N/A' }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Allow Overtime:</span>
                  <span :class="department?.settings?.allow_overtime ? 'text-green-600' : 'text-red-600'" 
                        class="text-sm font-medium">
                    {{ department?.settings?.allow_overtime ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Require Manager Approval:</span>
                  <span :class="department?.settings?.require_manager_approval ? 'text-green-600' : 'text-red-600'" 
                        class="text-sm font-medium">
                    {{ department?.settings?.require_manager_approval ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Department Users -->
          <div v-if="department?.users && department.users.length > 0" class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Department Users</h4>
            <div class="space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="user in department.users"
                :key="user.id"
                class="flex items-center justify-between p-2 bg-white rounded border"
              >
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-white">
                      {{ user.full_name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                    <div class="text-xs text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
                <span :class="getRoleColor(user.role)" 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ formatRole(user.role) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Department Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-gray-600">Created:</span>
                <span class="ml-2 text-gray-900">{{ formatDate(department?.created_at) }}</span>
              </div>
              <div>
                <span class="text-gray-600">Last Updated:</span>
                <span class="ml-2 text-gray-900">{{ formatDate(department?.updated_at) }}</span>
              </div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  department?: any
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [department: any]
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

const formatRole = (role: string) => {
  switch (role) {
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

const getRoleColor = (role: string) => {
  switch (role) {
    case 'enterpriseAdmin':
      return 'bg-purple-100 text-purple-800'
    case 'manager':
      return 'bg-blue-100 text-blue-800'
    case 'employee':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>
