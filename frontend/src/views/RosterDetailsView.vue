<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Loading State -->
      <div v-if="loading" class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div class="space-y-4">
          <div class="h-32 bg-gray-200 rounded"></div>
          <div class="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Roster Details -->
      <div v-else-if="roster">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">{{ roster.name }}</h1>
              <p class="mt-2 text-gray-600">{{ roster.department?.name }}</p>
              <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{{ formatDate(roster.start_date) }} - {{ formatDate(roster.end_date) }}</span>
                <span>Created by {{ roster.creator?.full_name }}</span>
                <span>{{ formatDateTime(roster.created_at) }}</span>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span
                class="px-3 py-1 text-sm font-medium rounded-full"
                :class="getStatusClass(roster.status)"
              >
                {{ getStatusLabel(roster.status) }}
              </span>
              <button
                v-if="canPublishRoster"
                @click="publishRoster"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
                Publish Roster
              </button>
              <button
                @click="$router.go(-1)"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="roster.description" class="mb-8 bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p class="text-gray-700">{{ roster.description }}</p>
        </div>

        <!-- Rejection Information -->
        <div v-if="roster.metadata?.rejection_notes && roster.status === 'draft'" class="mb-8 bg-red-50 border border-red-200 rounded-lg shadow p-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <div class="ml-3 flex-1">
              <h3 class="text-lg font-semibold text-red-800 mb-3">Roster Rejected</h3>
              <div class="mb-4">
                <h4 class="text-sm font-medium text-red-700 mb-2">Rejection Reason:</h4>
                <p class="text-sm text-red-700 bg-white rounded p-3 border border-red-200">{{ roster.metadata.rejection_notes }}</p>
              </div>

              <div v-if="roster.metadata?.required_changes && roster.metadata.required_changes.length > 0" class="mb-4">
                <h4 class="text-sm font-medium text-red-700 mb-2">Required Changes:</h4>
                <ul class="text-sm text-red-700 bg-white rounded p-3 border border-red-200 space-y-1">
                  <li v-for="(change, index) in roster.metadata.required_changes" :key="index" class="flex items-start">
                    <span class="text-red-500 mr-2">•</span>
                    <span>{{ change }}</span>
                  </li>
                </ul>
              </div>

              <div class="text-xs text-red-600">
                <span v-if="roster.metadata?.rejected_by_name">Rejected by {{ roster.metadata.rejected_by_name }}</span>
                <span v-if="roster.metadata?.rejected_at"> on {{ formatDateTime(roster.metadata.rejected_at) }}</span>
                <span v-if="roster.metadata?.rejection_count"> (Rejection #{{ roster.metadata.rejection_count }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Roster Summary -->
        <div class="mb-8 bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Roster Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-blue-50 rounded-lg p-4">
              <div class="text-sm text-blue-600 font-medium">Total Shifts</div>
              <div class="text-2xl font-bold text-blue-900">{{ roster.shifts?.length || 0 }}</div>
            </div>
            <div class="bg-green-50 rounded-lg p-4">
              <div class="text-sm text-green-600 font-medium">Assigned Shifts</div>
              <div class="text-2xl font-bold text-green-900">{{ getAssignedShiftsCount() }}</div>
            </div>
            <div class="bg-purple-50 rounded-lg p-4">
              <div class="text-sm text-purple-600 font-medium">Coverage</div>
              <div class="text-2xl font-bold text-purple-900">{{ getCoveragePercentage() }}%</div>
            </div>
            <div class="bg-orange-50 rounded-lg p-4">
              <div class="text-sm text-orange-600 font-medium">Total Staff</div>
              <div class="text-2xl font-bold text-orange-900">{{ getUniqueStaffCount() }}</div>
            </div>
          </div>
        </div>

        <!-- Shifts List -->
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Shifts</h3>
          </div>
          
          <div v-if="roster.shifts && roster.shifts.length > 0" class="divide-y divide-gray-200">
            <div
              v-for="shift in sortedShifts"
              :key="shift.id"
              class="p-6 hover:bg-gray-50 transition-colors duration-200"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center space-x-3">
                    <h4 class="text-lg font-medium text-gray-900">
                      {{ shift.title || `${shift.shift_type} Shift` }}
                    </h4>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="getShiftTypeClass(shift.shift_type)"
                    >
                      {{ shift.shift_type }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1"/>
                      </svg>
                      {{ formatDate(shift.date) }}
                    </span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ shift.start_time }} - {{ shift.end_time }}
                    </span>
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      {{ shift.assigned_staff || 0 }}/{{ shift.required_staff }} staff
                    </span>
                    <span v-if="shift.location" class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {{ shift.location }}
                    </span>
                  </div>

                  <p v-if="shift.description" class="text-gray-700 mt-2">{{ shift.description }}</p>

                  <!-- Assigned Staff -->
                  <div v-if="shift.assignments && shift.assignments.length > 0" class="mt-3">
                    <div class="text-sm font-medium text-gray-900 mb-2">Assigned Staff:</div>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="assignment in shift.assignments"
                        :key="assignment.id"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {{ assignment.employee?.full_name }}
                        <span v-if="assignment.role" class="ml-1 text-blue-600">({{ assignment.role }})</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2 ml-4">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getShiftStatusClass(shift)"
                  >
                    {{ getShiftStatusLabel(shift) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Shifts State -->
          <div v-else class="p-12 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No shifts defined</h3>
            <p class="mt-1 text-sm text-gray-500">This roster doesn't have any shifts yet.</p>
          </div>
        </div>

        <!-- Approval History -->
        <div v-if="roster.status !== 'draft'" class="mt-8 bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Approval History</h3>
          <div class="text-sm text-gray-600">
            <p v-if="roster.approved_by">
              Approved by {{ roster.approver?.full_name }} on {{ formatDateTime(roster.approved_at) }}
            </p>
            <p v-if="roster.published_at">
              Published on {{ formatDateTime(roster.published_at) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Roster not found</h3>
        <p class="mt-1 text-sm text-gray-500">The requested roster could not be found.</p>
        <div class="mt-6">
          <button
            @click="$router.push('/rosters')"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Rosters
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { rosterAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'

const route = useRoute()

// Reactive data
const roster = ref(null)
const loading = ref(false)

// Computed
const sortedShifts = computed(() => {
  if (!roster.value?.shifts) return []
  
  return [...roster.value.shifts].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.start_time}`)
    const dateB = new Date(`${b.date}T${b.start_time}`)
    return dateA.getTime() - dateB.getTime()
  })
})

// Methods
const fetchRoster = async () => {
  loading.value = true
  try {
    const rosterId = parseInt(route.params.id as string)
    const response = await rosterAPI.getById(rosterId)
    roster.value = response.roster
  } catch (error) {
    console.error('Failed to fetch roster:', error)
    roster.value = null
  } finally {
    loading.value = false
  }
}

const getAssignedShiftsCount = () => {
  if (!roster.value?.shifts) return 0
  return roster.value.shifts.filter(shift => 
    shift.assignments && shift.assignments.length > 0
  ).length
}

const getCoveragePercentage = () => {
  if (!roster.value?.shifts || roster.value.shifts.length === 0) return 0
  
  const fullyStaffedShifts = roster.value.shifts.filter(shift => 
    (shift.assigned_staff || 0) >= (shift.required_staff || 1)
  ).length
  
  return Math.round((fullyStaffedShifts / roster.value.shifts.length) * 100)
}

const getUniqueStaffCount = () => {
  if (!roster.value?.shifts) return 0
  
  const staffIds = new Set()
  roster.value.shifts.forEach(shift => {
    if (shift.assignments) {
      shift.assignments.forEach(assignment => {
        staffIds.add(assignment.employee_id)
      })
    }
  })
  
  return staffIds.size
}

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

const getShiftTypeClass = (type: string) => {
  const classes = {
    day: 'bg-yellow-100 text-yellow-800',
    night: 'bg-indigo-100 text-indigo-800',
    weekend: 'bg-purple-100 text-purple-800',
    holiday: 'bg-red-100 text-red-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getShiftStatusClass = (shift: any) => {
  const assignedStaff = shift.assigned_staff || 0
  const requiredStaff = shift.required_staff || 1
  
  if (assignedStaff >= requiredStaff) {
    return 'bg-green-100 text-green-800'
  } else if (assignedStaff > 0) {
    return 'bg-orange-100 text-orange-800'
  } else {
    return 'bg-red-100 text-red-800'
  }
}

const getShiftStatusLabel = (shift: any) => {
  const assignedStaff = shift.assigned_staff || 0
  const requiredStaff = shift.required_staff || 1
  
  if (assignedStaff >= requiredStaff) {
    return 'Fully Staffed'
  } else if (assignedStaff > 0) {
    return 'Partially Staffed'
  } else {
    return 'Unstaffed'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Computed properties for permissions
const canPublishRoster = computed(() => {
  return roster.value?.status === 'approved'
})

// Publish roster function
const publishRoster = async () => {
  if (!roster.value) return

  const confirmed = confirm(
    `Publish "${roster.value.name}"?\n\n` +
    `This will make the roster visible to all employees in ${roster.value.department?.name || 'the department'}.\n\n` +
    `Once published, the roster cannot be modified. Are you sure you want to continue?`
  )

  if (!confirmed) {
    return
  }

  try {
    console.log('Publishing roster:', roster.value.id)

    const response = await rosterAPI.updateStatus(roster.value.id, {
      status: 'published',
      notes: 'Roster published to employees'
    })

    console.log('Roster published successfully:', response)

    // Show success message
    alert(
      `Roster "${roster.value.name}" has been published successfully!\n\n` +
      `All employees in ${roster.value.department?.name || 'the department'} can now view their schedules.`
    )

    // Refresh the roster data to show updated status
    await fetchRoster()

  } catch (error: any) {
    console.error('Error publishing roster:', error)

    // Show error message
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error'
    alert(`Failed to publish roster:\n${errorMessage}`)
  }
}

// Lifecycle
onMounted(() => {
  fetchRoster()
})
</script>
