<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Roster Approvals</h1>
            <p class="mt-2 text-gray-600">Review and approve duty rosters for your department</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="bg-white rounded-lg shadow px-4 py-2">
              <div class="text-sm text-gray-500">Pending Approvals</div>
              <div class="text-2xl font-bold text-orange-600">{{ pendingCount }}</div>
            </div>
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

      <!-- Pending Rosters -->
      <div v-else-if="rosters.length > 0" class="space-y-6">
        <div
          v-for="roster in rosters"
          :key="roster.id"
          class="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
        >
          <div class="p-6">
            <!-- Roster Header -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{{ roster.name }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ roster.department.name }}</p>
                <div class="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6m-6 0a1 1 0 00-1 1v10a1 1 0 001 1h6a1 1 0 001-1V8a1 1 0 00-1-1"/>
                    </svg>
                    {{ formatDate(roster.start_date) }} - {{ formatDate(roster.end_date) }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Created by {{ roster.creator.full_name }}
                  </span>
                  <span class="flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ formatDateTime(roster.created_at) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span class="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                  Pending Review
                </span>
              </div>
            </div>

            <!-- Roster Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-sm text-blue-600 font-medium">Total Shifts</div>
                <div class="text-2xl font-bold text-blue-900">{{ roster.summary.total_shifts }}</div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <div class="text-sm text-green-600 font-medium">Fully Staffed</div>
                <div class="text-2xl font-bold text-green-900">{{ roster.summary.fully_staffed_shifts }}</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <div class="text-sm text-purple-600 font-medium">Coverage</div>
                <div class="text-2xl font-bold text-purple-900">{{ roster.summary.coverage_percentage }}%</div>
              </div>
            </div>

            <!-- Description -->
            <div v-if="roster.description" class="mb-6">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Description</h4>
              <p class="text-gray-700">{{ roster.description }}</p>
            </div>

            <!-- Coverage Warning -->
            <div v-if="roster.summary.coverage_percentage < 80" class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <div>
                  <h4 class="text-sm font-medium text-yellow-800">Low Coverage Warning</h4>
                  <p class="text-sm text-yellow-700">This roster has {{ roster.summary.coverage_percentage }}% coverage. Consider requesting improvements before approval.</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                @click="viewRosterDetails(roster)"
                class="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                View Details
              </button>
              <div class="flex space-x-3">
                <button
                  @click="rejectRoster(roster)"
                  class="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  Reject
                </button>
                <button
                  @click="approveRoster(roster)"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Approve
                </button>
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
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
        <p class="mt-1 text-sm text-gray-500">All rosters have been reviewed and processed.</p>
      </div>

      <!-- Approval Modal -->
      <ApprovalModal
        v-if="showApprovalModal"
        :roster="selectedRoster"
        :action="modalAction"
        @close="closeModal"
        @confirmed="handleApprovalAction"
      />

      <!-- Roster Details Modal -->
      <RosterDetailsModal
        v-if="showDetailsModal"
        :roster="selectedRoster"
        @close="showDetailsModal = false"
        @approve="approveRoster"
        @reject="rejectRoster"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { approvalAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import ApprovalModal from '@/components/ApprovalModal.vue'
import RosterDetailsModal from '@/components/RosterDetailsModal.vue'

const authStore = useAuthStore()

// Reactive data
const rosters = ref([])
const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showApprovalModal = ref(false)
const showDetailsModal = ref(false)
const selectedRoster = ref(null)
const modalAction = ref('approve')

// Pagination
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  total_items: 0,
  items_per_page: 10
})

// Computed
const pendingCount = computed(() => {
  return pagination.value.total_items
})

// Methods
const fetchPendingApprovals = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value
    }

    const response = await approvalAPI.getPending(params)
    rosters.value = response.rosters
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to fetch pending approvals:', error)
    // Handle error (show toast, etc.)
  } finally {
    loading.value = false
  }
}

const approveRoster = (roster: any) => {
  selectedRoster.value = roster
  modalAction.value = 'approve'
  showApprovalModal.value = true
}

const rejectRoster = (roster: any) => {
  selectedRoster.value = roster
  modalAction.value = 'reject'
  showApprovalModal.value = true
}

const viewRosterDetails = (roster: any) => {
  selectedRoster.value = roster
  showDetailsModal.value = true
}

const handleApprovalAction = async (data: any) => {
  try {
    if (modalAction.value === 'approve') {
      await approvalAPI.approve(selectedRoster.value.id, data)
    } else {
      await approvalAPI.reject(selectedRoster.value.id, data)
    }
    
    closeModal()
    await fetchPendingApprovals()
    // Show success message
  } catch (error) {
    console.error('Failed to process approval action:', error)
    // Show error message
  }
}

const closeModal = () => {
  showApprovalModal.value = false
  showDetailsModal.value = false
  selectedRoster.value = null
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.total_pages) {
    currentPage.value = page
    fetchPendingApprovals()
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

// Lifecycle
onMounted(() => {
  fetchPendingApprovals()
})
</script>
