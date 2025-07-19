<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">My Availability</h1>
            <p class="mt-2 text-gray-600">Set your availability preferences for shift scheduling</p>
          </div>
          <button
            @click="showSetAvailabilityModal = true"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Set Availability
          </button>
        </div>
      </div>

      <!-- Date Range Filter -->
      <div class="mb-6 bg-white rounded-lg shadow p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              v-model="filters.start_date"
              @change="fetchAvailability"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              v-model="filters.end_date"
              @change="fetchAvailability"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              v-model="filters.type"
              @change="fetchAvailability"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="preferred">Preferred</option>
              <option value="limited">Limited</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="setCurrentMonth"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Current Month
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

      <!-- Availability List -->
      <div v-else-if="availability.length > 0" class="space-y-4">
        <div
          v-for="item in sortedAvailability"
          :key="item.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ formatDateHeader(item.date) }}
                  </h3>
                  <span
                    class="px-3 py-1 text-sm font-medium rounded-full"
                    :class="getAvailabilityTypeClass(item.availability_type)"
                  >
                    {{ getAvailabilityTypeLabel(item.availability_type) }}
                  </span>
                  <span
                    v-if="item.is_recurring"
                    class="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
                  >
                    Recurring
                  </span>
                </div>

                <!-- Time Range (for limited availability) -->
                <div v-if="item.availability_type === 'limited' && item.start_time && item.end_time" class="mb-2">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Available: {{ item.start_time }} - {{ item.end_time }}
                  </div>
                </div>

                <!-- Max Hours -->
                <div v-if="item.max_hours" class="mb-2">
                  <div class="flex items-center text-sm text-gray-600">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    Max hours: {{ item.max_hours }}
                  </div>
                </div>

                <!-- Shift Types -->
                <div v-if="item.shift_types && item.shift_types.length > 0" class="mb-2">
                  <div class="text-sm text-gray-600 mb-1">Shift types:</div>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="type in item.shift_types"
                      :key="type"
                      class="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800"
                    >
                      {{ type }}
                    </span>
                  </div>
                </div>

                <!-- Reason -->
                <div v-if="item.reason" class="mb-2">
                  <div class="text-sm">
                    <strong class="text-gray-900">Reason:</strong>
                    <p class="text-gray-700 mt-1">{{ item.reason }}</p>
                  </div>
                </div>

                <!-- Notes -->
                <div v-if="item.notes" class="mb-2">
                  <div class="text-sm">
                    <strong class="text-gray-900">Notes:</strong>
                    <p class="text-gray-700 mt-1">{{ item.notes }}</p>
                  </div>
                </div>

                <!-- Status and Approval -->
                <div class="flex items-center space-x-4 text-xs text-gray-500 mt-3">
                  <span>Status: {{ item.status }}</span>
                  <span v-if="item.approved_by_user">
                    Approved by {{ item.approved_by_user.full_name }}
                  </span>
                  <span v-if="item.expires_at">
                    Expires: {{ formatDate(item.expires_at) }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center space-x-2 ml-4">
                <button
                  @click="editAvailability(item)"
                  class="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No availability set</h3>
        <p class="mt-1 text-sm text-gray-500">You haven't set any availability preferences yet.</p>
        <div class="mt-6">
          <button
            @click="showSetAvailabilityModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Set Availability
          </button>
        </div>
      </div>

      <!-- Set Availability Modal -->
      <div v-if="showSetAvailabilityModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
          <div class="flex justify-between items-center pb-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Set Availability</h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitAvailability" class="mt-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  v-model="availabilityForm.date"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Availability Type *</label>
                <select
                  v-model="availabilityForm.availability_type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="preferred">Preferred</option>
                  <option value="limited">Limited Availability</option>
                </select>
              </div>

              <!-- Time Range (for limited availability) -->
              <div v-if="availabilityForm.availability_type === 'limited'" class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    v-model="availabilityForm.start_time"
                    type="time"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    v-model="availabilityForm.end_time"
                    type="time"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  v-model="availabilityForm.reason"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional reason for this availability setting..."
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {{ submitting ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { employeeAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'

// Reactive data
const availability = ref([])
const loading = ref(false)
const showSetAvailabilityModal = ref(false)
const submitting = ref(false)

// Filters
const filters = ref({
  start_date: '',
  end_date: '',
  type: ''
})

// Form
const availabilityForm = reactive({
  date: '',
  availability_type: 'available',
  start_time: '',
  end_time: '',
  reason: ''
})

// Computed
const sortedAvailability = computed(() => {
  return [...availability.value].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
})

// Methods
const fetchAvailability = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.start_date) params.start_date = filters.value.start_date
    if (filters.value.end_date) params.end_date = filters.value.end_date
    if (filters.value.type) params.type = filters.value.type

    const response = await employeeAPI.getMyAvailability(params)
    availability.value = response.availability || []
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    availability.value = []
  } finally {
    loading.value = false
  }
}

const setCurrentMonth = () => {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  filters.value.start_date = startOfMonth.toISOString().split('T')[0]
  filters.value.end_date = endOfMonth.toISOString().split('T')[0]
  
  fetchAvailability()
}

const submitAvailability = async () => {
  submitting.value = true
  try {
    const data = {
      date: availabilityForm.date,
      availability_type: availabilityForm.availability_type,
      reason: availabilityForm.reason || undefined
    }

    if (availabilityForm.availability_type === 'limited') {
      data.start_time = availabilityForm.start_time
      data.end_time = availabilityForm.end_time
    }

    await employeeAPI.setAvailability(data)
    closeModal()
    await fetchAvailability()
  } catch (error) {
    console.error('Failed to set availability:', error)
  } finally {
    submitting.value = false
  }
}

const editAvailability = (item: any) => {
  // TODO: Implement edit functionality
  console.log('Edit availability:', item.id)
}

const closeModal = () => {
  showSetAvailabilityModal.value = false
  Object.assign(availabilityForm, {
    date: '',
    availability_type: 'available',
    start_time: '',
    end_time: '',
    reason: ''
  })
}

const getAvailabilityTypeClass = (type: string) => {
  const classes = {
    available: 'bg-green-100 text-green-800',
    unavailable: 'bg-red-100 text-red-800',
    preferred: 'bg-blue-100 text-blue-800',
    limited: 'bg-orange-100 text-orange-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getAvailabilityTypeLabel = (type: string) => {
  const labels = {
    available: 'Available',
    unavailable: 'Unavailable',
    preferred: 'Preferred',
    limited: 'Limited'
  }
  return labels[type] || type
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateHeader = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Lifecycle
onMounted(() => {
  setCurrentMonth()
})
</script>
