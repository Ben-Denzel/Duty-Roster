<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Schedule</h1>
            <p class="mt-2 text-gray-600">View your assigned shifts and manage your schedule</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-white rounded-lg shadow px-4 py-2">
              <div class="text-sm text-gray-500">This Month</div>
              <div class="text-2xl font-bold text-blue-600">{{ monthlyShifts.length }}</div>
              <div class="text-xs text-gray-500">shifts</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="mb-6 bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              v-model="filters.start_date"
              @change="fetchSchedule"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              v-model="filters.end_date"
              @change="fetchSchedule"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="setCurrentMonth"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Next 3 Months
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 5" :key="i" class="bg-white rounded-lg shadow p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Schedule by Date -->
      <div v-else-if="Object.keys(scheduleByDate).length > 0" class="space-y-6">
        <div
          v-for="(shifts, date) in scheduleByDate"
          :key="date"
          class="bg-white rounded-lg shadow"
        >
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold text-gray-900">
                {{ formatDateHeader(date) }}
              </h3>
              <span class="text-sm text-gray-500">
                {{ shifts.length }} shift{{ shifts.length !== 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <div class="divide-y divide-gray-200">
            <div
              v-for="shiftData in shifts"
              :key="shiftData.assignment_id"
              class="p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ shiftData.shift.title || `${shiftData.shift.shift_type} Shift` }}
                    </h4>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getShiftTypeClass(shiftData.shift.shift_type)"
                    >
                      {{ shiftData.shift.shift_type }}
                    </span>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getAssignmentStatusClass(shiftData.status)"
                    >
                      {{ getAssignmentStatusLabel(shiftData.status) }}
                    </span>
                  </div>

                  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ shiftData.shift.start_time }} - {{ shiftData.shift.end_time }}
                    </span>
                    <span v-if="shiftData.shift.location" class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {{ shiftData.shift.location }}
                    </span>
                    <span v-if="shiftData.role" class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      {{ shiftData.role }}
                    </span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                      {{ shiftData.shift.roster?.name }}
                    </span>
                  </div>

                  <p v-if="shiftData.shift.description" class="text-gray-700 mt-2">
                    {{ shiftData.shift.description }}
                  </p>

                  <p v-if="shiftData.notes" class="text-sm text-gray-600 mt-2">
                    <strong>Notes:</strong> {{ shiftData.notes }}
                  </p>
                </div>

                <!-- Actions -->
                <div v-if="canRequestSwap(shiftData)" class="flex items-center space-x-2 ml-4">
                  <button
                    @click="requestSwap(shiftData)"
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    Request Swap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No shifts scheduled</h3>
        <p class="mt-1 text-sm text-gray-500">You don't have any shifts scheduled for the selected period.</p>
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
const schedule = ref([])
const loading = ref(false)

// Filters
const filters = ref({
  start_date: '',
  end_date: ''
})

// Computed
const scheduleByDate = computed(() => {
  const grouped = {}
  schedule.value.forEach(assignment => {
    const date = assignment.shift.date
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(assignment)
  })
  
  // Sort dates
  const sortedDates = Object.keys(grouped).sort()
  const sortedGrouped = {}
  sortedDates.forEach(date => {
    sortedGrouped[date] = grouped[date].sort((a, b) => 
      a.shift.start_time.localeCompare(b.shift.start_time)
    )
  })
  
  return sortedGrouped
})

const monthlyShifts = computed(() => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return schedule.value.filter(assignment => {
    const shiftDate = new Date(assignment.shift.date)
    return shiftDate >= startOfMonth && shiftDate <= endOfMonth
  })
})

// Methods
const fetchSchedule = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date
    
    const response = await employeeAPI.getMySchedule(params)
    schedule.value = response.schedule?.assignments || []
  } catch (error) {
    console.error('Failed to fetch schedule:', error)
    schedule.value = []
  } finally {
    loading.value = false
  }
}

const setCurrentMonth = () => {
  const now = new Date()
  // Show current month plus next 2 months to ensure employees see their assignments
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 3, 0) // 3 months ahead

  filters.value.start_date = startOfMonth.toISOString().split('T')[0]
  filters.value.end_date = endOfPeriod.toISOString().split('T')[0]

  fetchSchedule()
}

// Removed confirm/decline functionality - employees are assigned shifts, not choosing them

const requestSwap = async (shiftData: any) => {
  try {
    // Show confirmation dialog with shift details
    const shiftDate = new Date(shiftData.shift.date).toLocaleDateString()
    const shiftTime = `${shiftData.shift.start_time} - ${shiftData.shift.end_time}`

    const reason = prompt(
      `Request swap for shift on ${shiftDate} (${shiftTime})?\n\n` +
      `Please provide a reason for the swap request:`
    )

    if (!reason) return

    // Create swap request
    await employeeAPI.createSwapRequest({
      shift_id: shiftData.shift.id,
      request_type: 'swap',
      reason: reason,
      message: `Swap request for ${shiftDate} ${shiftTime}`,
      priority: 'normal'
    })

    alert('Swap request submitted successfully! You can track its status in the Shift Swaps page.')

    // Refresh schedule to show updated status
    await fetchSchedule()

  } catch (error: any) {
    console.error('Failed to create swap request:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    alert(`Failed to create swap request:\n${errorMessage}`)
  }
}

const canRequestSwap = (shiftData: any) => {
  return shiftData.shift.roster?.status === 'published' &&
         ['assigned', 'confirmed'].includes(shiftData.status)
}

const getShiftTypeClass = (type: string) => {
  const classes = {
    day: 'bg-yellow-100 text-yellow-800',
    night: 'bg-indigo-100 text-indigo-800',
    weekend: 'bg-purple-100 text-purple-800',
    holiday: 'bg-red-100 text-red-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getAssignmentStatusClass = (status: string) => {
  const classes = {
    assigned: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-green-100 text-green-800',
    no_show: 'bg-red-100 text-red-800',
    swap_requested: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getAssignmentStatusLabel = (status: string) => {
  const labels = {
    assigned: 'Assigned',
    confirmed: 'Assigned',
    completed: 'Completed',
    no_show: 'No Show',
    swap_requested: 'Swap Requested'
  }
  return labels[status] || status
}

const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
}

// Lifecycle
onMounted(() => {
  setCurrentMonth()
})
</script>
