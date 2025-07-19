<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ enterprise?.name }}</h3>
            <p class="text-sm text-gray-600 mt-1">Enterprise Details</p>
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
              <h4 class="text-sm font-medium text-gray-900 mb-3">Enterprise Information</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Name:</span>
                  <span class="text-sm font-medium text-gray-900">{{ enterprise?.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Created:</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDate(enterprise?.created_at) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Last Updated:</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDate(enterprise?.updated_at) }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="text-sm font-medium text-gray-900 mb-3">Creator Information</h4>
              <div v-if="enterprise?.creator" class="flex items-center">
                <div class="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span class="text-sm font-medium text-white">
                    {{ enterprise.creator.full_name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium text-gray-900">{{ enterprise.creator.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ enterprise.creator.email }}</div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-400 italic">No creator information</div>
            </div>
          </div>

          <!-- Statistics -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Enterprise Statistics</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">{{ enterprise?.user_count || 0 }}</div>
                <div class="text-xs text-gray-600">Total Users</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ enterprise?.department_count || 0 }}</div>
                <div class="text-xs text-gray-600">Departments</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-600">{{ enterprise?.admin_count || 0 }}</div>
                <div class="text-xs text-gray-600">Admins</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-orange-600">{{ enterprise?.manager_count || 0 }}</div>
                <div class="text-xs text-gray-600">Managers</div>
              </div>
            </div>
          </div>

          <!-- User Breakdown -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="text-sm font-medium text-gray-900 mb-3">User Breakdown</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Enterprise Administrators:</span>
                <span class="text-sm font-medium text-gray-900">{{ enterprise?.admin_count || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Department Managers:</span>
                <span class="text-sm font-medium text-gray-900">{{ enterprise?.manager_count || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Employees:</span>
                <span class="text-sm font-medium text-gray-900">{{ enterprise?.employee_count || 0 }}</span>
              </div>
              <div class="border-t border-gray-200 pt-2 mt-2">
                <div class="flex justify-between items-center font-medium">
                  <span class="text-sm text-gray-900">Total Users:</span>
                  <span class="text-sm text-gray-900">{{ enterprise?.user_count || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 class="text-sm font-medium text-blue-900 mb-3">Quick Actions</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                @click="viewUsers"
                class="inline-flex items-center justify-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
                View Users
              </button>
              <button
                @click="viewDepartments"
                class="inline-flex items-center justify-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                </svg>
                View Departments
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  enterprise?: any
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
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

const viewUsers = () => {
  // For now, show an alert. In the future, this could navigate to a filtered user view
  alert('Navigate to user management for this enterprise')
}

const viewDepartments = () => {
  // For now, show an alert. In the future, this could navigate to a filtered department view
  alert('Navigate to department management for this enterprise')
}
</script>
