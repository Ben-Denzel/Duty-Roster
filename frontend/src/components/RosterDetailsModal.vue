<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
      <!-- Header -->
      <div class="flex justify-between items-center pb-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900">
          Roster Details - {{ roster?.name }}
        </h3>
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
      <div class="mt-6 max-h-96 overflow-y-auto">
        <div v-if="roster" class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Department</h4>
              <p class="text-gray-700">{{ roster.department?.name }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Date Range</h4>
              <p class="text-gray-700">{{ formatDate(roster.start_date) }} - {{ formatDate(roster.end_date) }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Created By</h4>
              <p class="text-gray-700">{{ roster.creator?.full_name }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2">Status</h4>
              <span
                class="px-3 py-1 text-sm font-medium rounded-full"
                :class="getStatusClass(roster.status)"
              >
                {{ getStatusLabel(roster.status) }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <div v-if="roster.description">
            <h4 class="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p class="text-gray-700">{{ roster.description }}</p>
          </div>

          <!-- Summary Stats -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="text-sm text-blue-600 font-medium">Total Shifts</div>
              <div class="text-2xl font-bold text-blue-900">{{ roster.summary?.total_shifts || 0 }}</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4">
              <div class="text-sm text-green-600 font-medium">Fully Staffed</div>
              <div class="text-2xl font-bold text-green-900">{{ roster.summary?.fully_staffed_shifts || 0 }}</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4">
              <div class="text-sm text-purple-600 font-medium">Coverage</div>
              <div class="text-2xl font-bold text-purple-900">{{ roster.summary?.coverage_percentage || 0 }}%</div>
            </div>
          </div>

          <!-- Recent Shifts Preview -->
          <div v-if="roster.shifts && roster.shifts.length > 0">
            <h4 class="text-sm font-medium text-gray-900 mb-3">Recent Shifts ({{ Math.min(5, roster.shifts.length) }} of {{ roster.shifts.length }})</h4>
            <div class="space-y-2">
              <div
                v-for="shift in roster.shifts.slice(0, 5)"
                :key="shift.id"
                class="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div class="font-medium text-gray-900">
                    {{ shift.title || `${shift.shift_type} Shift` }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ formatDate(shift.date) }} • {{ shift.start_time }} - {{ shift.end_time }}
                  </div>
                </div>
                <div class="text-sm text-gray-500">
                  {{ shift.assigned_staff || 0 }}/{{ shift.required_staff }} staff
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          Close
        </button>
        <button
          v-if="canApprove"
          @click="$emit('approve', roster)"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Approve
        </button>
        <button
          v-if="canReject"
          @click="$emit('reject', roster)"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Reject
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

interface Props {
  roster: any
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'approve', 'reject'])

const authStore = useAuthStore()

// Computed
const canApprove = computed(() => {
  return props.roster?.status === 'review' && 
         ['systemAdmin', 'manager'].includes(authStore.user?.role)
})

const canReject = computed(() => {
  return props.roster?.status === 'review' && 
         ['systemAdmin', 'manager'].includes(authStore.user?.role)
})

// Methods
const getStatusClass = (status: string) => {
  const classes = {
    draft: 'bg-gray-100 text-gray-800',
    review: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    published: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const labels = {
    draft: 'Draft',
    review: 'Under Review',
    approved: 'Approved',
    published: 'Published'
  }
  return labels[status] || status
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}
</script>
