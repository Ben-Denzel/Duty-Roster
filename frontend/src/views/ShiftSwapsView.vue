<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Shift Swaps</h1>
            <p class="mt-2 text-gray-600">Manage your shift swap requests and respond to others</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-white rounded-lg shadow px-4 py-2">
              <div class="text-sm text-gray-500">Pending</div>
              <div class="text-2xl font-bold text-orange-600">{{ pendingCount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="mb-6 bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="filters.type"
              @change="fetchSwapRequests"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Requests</option>
              <option value="sent">Sent by Me</option>
              <option value="received">Received by Me</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filters.status"
              @change="fetchSwapRequests"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="fetchSwapRequests"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-lg shadow p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Swap Requests List -->
      <div v-else-if="swapRequests.length > 0" class="space-y-4">
        <div
          v-for="request in swapRequests"
          :key="request.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <!-- Request Header -->
                <div class="flex items-center space-x-3 mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ getRequestTitle(request) }}
                  </h3>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClass(request.status)"
                  >
                    {{ getStatusLabel(request.status) }}
                  </span>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getPriorityClass(request.priority)"
                  >
                    {{ request.priority }}
                  </span>
                </div>

                <!-- Shift Details -->
                <div class="bg-gray-50 rounded-lg p-4 mb-4">
                  <div class="flex items-center space-x-4 text-sm text-gray-600">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1"/>
                      </svg>
                      {{ formatDate(request.shift.date) }}
                    </span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ request.shift.start_time }} - {{ request.shift.end_time }}
                    </span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      {{ request.shift.roster?.name }}
                    </span>
                  </div>
                  <h4 class="font-medium text-gray-900 mt-2">
                    {{ request.shift.title || `${request.shift.shift_type} Shift` }}
                  </h4>
                </div>

                <!-- Request Details -->
                <div class="space-y-3">
                  <div class="flex items-center space-x-4 text-sm text-gray-600">
                    <span>
                      <strong>Requested by:</strong> {{ request.requester.full_name }}
                    </span>
                    <span v-if="request.target_employee">
                      <strong>Target:</strong> {{ request.target_employee.full_name }}
                    </span>
                    <span>
                      <strong>Type:</strong> {{ request.request_type }}
                    </span>
                  </div>

                  <div v-if="request.reason" class="text-sm">
                    <strong class="text-gray-900">Reason:</strong>
                    <p class="text-gray-700 mt-1">{{ request.reason }}</p>
                  </div>

                  <div v-if="request.message" class="text-sm">
                    <strong class="text-gray-900">Message:</strong>
                    <p class="text-gray-700 mt-1">{{ request.message }}</p>
                  </div>

                  <!-- Target Response -->
                  <div v-if="request.target_response !== 'pending'" class="text-sm">
                    <strong class="text-gray-900">Response:</strong>
                    <span
                      class="ml-2 px-2 py-1 text-xs font-medium rounded-full"
                      :class="getTargetResponseClass(request.target_response)"
                    >
                      {{ request.target_response }}
                    </span>
                    <p v-if="request.target_message" class="text-gray-700 mt-1">{{ request.target_message }}</p>
                  </div>

                  <!-- Manager Notes -->
                  <div v-if="request.manager_notes" class="text-sm">
                    <strong class="text-gray-900">Manager Notes:</strong>
                    <p class="text-gray-700 mt-1">{{ request.manager_notes }}</p>
                    <p v-if="request.decision_date" class="text-xs text-gray-500 mt-1">
                      Decision made: {{ formatDateTime(request.decision_date) }}
                    </p>
                  </div>

                  <!-- Timestamps -->
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {{ formatDateTime(request.created_at) }}</span>
                    <span v-if="request.expires_at">Expires: {{ formatDateTime(request.expires_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col space-y-2 ml-4">
                <!-- For requests received by current user -->
                <div v-if="isTargetEmployee(request) && request.status === 'pending' && request.target_response === 'pending'">
                  <button
                    @click="respondToRequest(request, 'accepted')"
                    class="w-full px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200"
                  >
                    Accept
                  </button>
                  <button
                    @click="respondToRequest(request, 'declined')"
                    class="w-full px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200 mt-2"
                  >
                    Decline
                  </button>
                </div>

                <!-- For manager approval (new) -->
                <div v-if="isManager(request) && request.status === 'pending'">
                  <button
                    @click="managerAction(request, 'approve')"
                    class="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    Approve
                  </button>
                  <button
                    @click="managerAction(request, 'reject')"
                    class="w-full px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200 mt-2"
                  >
                    Reject
                  </button>
                </div>

                <!-- For requests sent by current user -->
                <div v-if="isRequester(request) && request.status === 'pending'">
                  <button
                    @click="cancelRequest(request)"
                    class="w-full px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total_pages > 1" class="flex justify-center">
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {{ pagination.current_page }} of {{ pagination.total_pages }}
            </span>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.total_pages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No swap requests</h3>
        <p class="mt-1 text-sm text-gray-500">You don't have any shift swap requests at the moment.</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { employeeAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'

const authStore = useAuthStore()

// Reactive data
const swapRequests = ref([])
const loading = ref(false)

// Filters
const filters = ref({
  type: 'all',
  status: ''
})

// Pagination
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  total_items: 0,
  items_per_page: 20
})

// Computed
const pendingCount = computed(() => {
  return swapRequests.value.filter(request => request.status === 'pending').length
})

// Methods
const fetchSwapRequests = async () => {
  loading.value = true
  try {
    const params: {
      type?: 'all' | 'sent' | 'received'
      status?: string
      page: number
      limit: number
    } = {
      type: filters.value.type as 'all' | 'sent' | 'received',
      page: pagination.value.current_page,
      limit: pagination.value.items_per_page
    }

    if (filters.value.status) {
      params.status = filters.value.status
    }

    const response = await employeeAPI.getSwapRequests(params)
    swapRequests.value = response.swap_requests || []
    pagination.value = response.pagination || pagination.value
  } catch (error) {
    console.error('Failed to fetch swap requests:', error)
    swapRequests.value = []
  } finally {
    loading.value = false
  }
}

const respondToRequest = async (request: any, response: 'accepted' | 'declined') => {
  const message = response === 'declined' ?
    prompt('Please provide a reason for declining:') :
    prompt('Optional message:')

  if (response === 'declined' && !message) return

  try {
    await employeeAPI.respondToSwapRequest(request.id, {
      response,
      message: message || undefined
    })
    await fetchSwapRequests()
  } catch (error) {
    console.error('Failed to respond to swap request:', error)
  }
}

const cancelRequest = async (request: any) => {
  if (!confirm('Are you sure you want to cancel this swap request?')) {
    return
  }

  try {
    await employeeAPI.cancelSwapRequest(request.id)
    await fetchSwapRequests()
  } catch (error) {
    console.error('Failed to cancel swap request:', error)
  }
}

const managerAction = async (request: any, action: 'approve' | 'reject') => {
  const message = action === 'reject' ?
    prompt('Please provide a reason for rejection:') :
    prompt('Optional approval message:')

  if (action === 'reject' && !message) {
    alert('A reason is required for rejection.')
    return
  }

  if (!confirm(`Are you sure you want to ${action} this swap request?`)) {
    return
  }

  try {
    await employeeAPI.managerActionSwapRequest(request.id, {
      action,
      message: message || undefined
    })
    await fetchSwapRequests()
    alert(`Swap request ${action}d successfully!`)
  } catch (error) {
    console.error(`Failed to ${action} swap request:`, error)
    alert(`Failed to ${action} swap request. Please try again.`)
  }
}

const isRequester = (request: any) => {
  return request.requested_by === authStore.user?.id
}

const isTargetEmployee = (request: any) => {
  return request.target_employee_id === authStore.user?.id
}

const isManager = (request: any) => {
  return request.manager_id === authStore.user?.id &&
         ['manager', 'enterpriseAdmin', 'systemAdmin'].includes(authStore.user?.role || '')
}

const getRequestTitle = (request: any) => {
  if (isRequester(request)) {
    return `Swap Request to ${request.target_employee?.full_name || 'Anyone'}`
  } else {
    return `Swap Request from ${request.requester.full_name}`
  }
}

const getStatusClass = (status: string) => {
  const classes = {
    pending: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    expired: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    expired: 'Expired'
  }
  return labels[status] || status
}

const getPriorityClass = (priority: string) => {
  const classes = {
    low: 'bg-blue-100 text-blue-800',
    normal: 'bg-gray-100 text-gray-800',
    high: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const getTargetResponseClass = (response: string) => {
  const classes = {
    pending: 'bg-orange-100 text-orange-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800'
  }
  return classes[response] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.total_pages) {
    pagination.value.current_page = page
    fetchSwapRequests()
  }
}

// Lifecycle
onMounted(() => {
  fetchSwapRequests()
})
</script>
