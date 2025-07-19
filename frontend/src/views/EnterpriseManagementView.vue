<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Enterprise Management</h1>
        <p class="mt-2 text-gray-600">Create and manage enterprises with their administrators</p>
      </div>

      <!-- Existing Enterprises -->
      <div class="mb-8">
        <div class="bg-white shadow-lg rounded-xl border border-gray-100">
          <div class="px-6 py-5 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Existing Enterprises</h2>
                <p class="text-sm text-gray-600">Manage all enterprises in the system</p>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-500">
                  Total: {{ enterprises.length }}
                </div>
                <button
                  @click="showCreateModal = true"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Enterprise
                </button>
              </div>
            </div>
          </div>
          <div class="p-6">
            <div v-if="enterprisesLoading" class="text-center py-8">
              <div class="inline-flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading enterprises...
              </div>
            </div>

            <div v-else-if="enterprises.length === 0" class="text-center py-8 text-gray-500">
              No enterprises created yet
            </div>

            <div v-else class="space-y-4">
              <div
                v-for="enterprise in enterprises"
                :key="enterprise.id"
                class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {{ enterprise.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div>
                        <h3 class="text-lg font-medium text-gray-900">{{ enterprise.name }}</h3>
                        <div class="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Created: {{ formatDate(enterprise.created_at) }}</span>
                          <span v-if="enterprise.creator">
                            by {{ enterprise.creator.full_name }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-4">
                    <div class="text-right">
                      <div class="text-sm font-medium text-gray-900">
                        {{ enterprise.user_count || 0 }} users
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ enterprise.department_count || 0 }} departments
                      </div>
                    </div>
                    <button
                      @click="viewEnterprise(enterprise)"
                      class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow-lg rounded-xl border border-gray-100">
            <div class="px-6 py-5 border-b border-gray-200">
              <h2 class="text-xl font-semibold text-gray-900">Enterprise Management</h2>
              <p class="text-sm text-gray-600">Manage enterprises and their organizational structure</p>
            </div>
            <div class="p-6">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Create New Enterprise</h3>
                <p class="text-gray-600 mb-6">Click the "Add Enterprise" button above to create a new enterprise with its administrator.</p>
                <button
                  @click="showCreateModal = true"
                  class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                  Add Enterprise
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <!-- <div class="space-y-6">
          <div class="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Enterprise Setup</h3>
            <div class="space-y-3 text-sm text-gray-600">
              <div class="flex items-start space-x-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <span class="font-medium">Enterprise:</span> Creates the organization structure
                </div>
              </div>
              <div class="flex items-start space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <span class="font-medium">Admin:</span> Manages all users within the enterprise
                </div>
              </div>
              <div class="flex items-start space-x-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <span class="font-medium">Access:</span> Admin gets full enterprise control
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <p>1. Enterprise admin logs in</p>
              <p>2. Creates departments</p>
              <p>3. Adds managers and employees</p>
              <p>4. Sets up duty rosters</p>
            </div>
          </div>
        </div>
      </div> -->
    </div> 

    <!-- Enterprise Details Modal -->
    <EnterpriseDetailsModal
      v-if="showDetailsModal"
      :enterprise="selectedEnterprise"
      @close="showDetailsModal = false"
    />

    <!-- Enterprise Create Modal -->
    <EnterpriseCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleEnterpriseCreated"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { enterpriseAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import EnterpriseDetailsModal from '@/components/EnterpriseDetailsModal.vue'
import EnterpriseCreateModal from '@/components/EnterpriseCreateModal.vue'

const router = useRouter()
const authStore = useAuthStore()



// Enterprise list state
const enterprises = ref([])
const enterprisesLoading = ref(false)

// Modal state
const showDetailsModal = ref(false)
const showCreateModal = ref(false)
const selectedEnterprise = ref(null)



const fetchEnterprises = async () => {
  try {
    enterprisesLoading.value = true
    const response = await enterpriseAPI.getAll()
    enterprises.value = response.enterprises || []
  } catch (err: any) {
    console.error('Failed to fetch enterprises:', err)
  } finally {
    enterprisesLoading.value = false
  }
}

const viewEnterprise = (enterprise: any) => {
  selectedEnterprise.value = enterprise
  showDetailsModal.value = true
}

const handleEnterpriseCreated = () => {
  showCreateModal.value = false
  fetchEnterprises()
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

onMounted(() => {
  // Check if user has permission to access this page
  if (!authStore.isSystemAdmin) {
    router.push('/dashboard')
    return
  }

  // Fetch existing enterprises
  fetchEnterprises()
})
</script>
