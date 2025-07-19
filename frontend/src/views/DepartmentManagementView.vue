<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Department Management</h1>
          <p class="mt-2 text-gray-600">Manage departments and organizational structure</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Create Department
        </button>
      </div>
    </div>

    <!-- Analytics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Departments</p>
            <p class="text-2xl font-bold text-gray-900">{{ analytics.total_departments || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">With Managers</p>
            <p class="text-2xl font-bold text-gray-900">{{ analytics.departments_with_managers || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <svg class="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Need Managers</p>
            <p class="text-2xl font-bold text-gray-900">{{ analytics.departments_without_managers || 0 }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-2xl font-bold text-gray-900">{{ analytics.total_users || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow mb-6">
      <div class="p-6 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search departments..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="debouncedSearch"
              >
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
          <div class="flex gap-2">
            <label class="flex items-center">
              <input
                v-model="includeInactive"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                @change="fetchDepartments"
              >
              <span class="ml-2 text-sm text-gray-700">Include inactive</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Departments Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">Loading departments...</td>
            </tr>
            <tr v-else-if="departments.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">No departments found</td>
            </tr>
            <tr v-else v-for="department in departments" :key="department.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ department.name }}</div>
                  <div v-if="department.description" class="text-sm text-gray-500">{{ department.description }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="department.manager" class="flex items-center">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-white">
                      {{ department.manager.full_name.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">{{ department.manager.full_name }}</div>
                    <div class="text-sm text-gray-500">{{ department.manager.email }}</div>
                  </div>
                </div>
                <span v-else class="text-sm text-gray-400 italic">No manager assigned</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  <span class="font-medium">{{ department.user_count }}</span> total
                </div>
                <div class="text-xs text-gray-500">
                  {{ department.manager_count }} managers, {{ department.employee_count }} employees
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="department.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ department.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="viewDepartment(department)"
                    class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                    title="View Details"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button
                    @click="editDepartment(department)"
                    class="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    @click="manageDepartmentUsers(department)"
                    class="text-green-600 hover:text-green-900 transition-colors duration-200"
                    title="Manage Users"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                    </svg>
                  </button>
                  <button
                    @click="manageShiftTemplates(department)"
                    class="text-purple-600 hover:text-purple-900 transition-colors duration-200"
                    title="Manage Shift Templates"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                  <button
                    @click="deleteDepartment(department)"
                    class="text-red-600 hover:text-red-900 transition-colors duration-200"
                    title="Delete"
                    :disabled="department.user_count > 0"
                    :class="{ 'opacity-50 cursor-not-allowed': department.user_count > 0 }"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total_pages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.total_pages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ (pagination.current_page - 1) * pagination.items_per_page + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items) }}</span>
                of
                <span class="font-medium">{{ pagination.total_items }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="changePage(pagination.current_page - 1)"
                  :disabled="pagination.current_page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                  </svg>
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="changePage(page)"
                  :class="page === pagination.current_page ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  {{ page }}
                </button>
                <button
                  @click="changePage(pagination.current_page + 1)"
                  :disabled="pagination.current_page === pagination.total_pages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Department Modal -->
    <DepartmentModal
      v-if="showCreateModal || showEditModal"
      :department="selectedDepartment"
      :is-edit="showEditModal"
      @close="closeModal"
      @saved="handleDepartmentSaved"
    />

    <!-- Department Details Modal -->
    <DepartmentDetailsModal
      v-if="showDetailsModal"
      :department="selectedDepartment"
      @close="showDetailsModal = false"
      @edit="editDepartment"
    />

    <!-- User Management Modal -->
    <DepartmentUserManagementModal
      v-if="showUserManagementModal"
      :department="selectedDepartment"
      @close="showUserManagementModal = false"
      @updated="handleUsersUpdated"
    />

    <!-- Shift Template Management Modal -->
    <div v-if="showShiftTemplateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
        <div class="flex justify-between items-center pb-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">
            Shift Templates - {{ selectedDepartment?.name }}
          </h3>
          <button
            @click="showShiftTemplateModal = false"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="mt-6">
          <ShiftTemplateManager :department="selectedDepartment" />
        </div>
      </div>
    </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { departmentAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import DepartmentModal from '@/components/DepartmentModal.vue'
import DepartmentDetailsModal from '@/components/DepartmentDetailsModal.vue'
import DepartmentUserManagementModal from '@/components/DepartmentUserManagementModal.vue'
import ShiftTemplateManager from '@/components/ShiftTemplateManager.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const departments = ref([])
const analytics = ref({})
const loading = ref(false)
const searchQuery = ref('')
const includeInactive = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailsModal = ref(false)
const showUserManagementModal = ref(false)
const showShiftTemplateModal = ref(false)
const selectedDepartment = ref(null)

// Pagination
const pagination = ref({
  current_page: 1,
  total_pages: 1,
  total_items: 0,
  items_per_page: 10
})

// Computed properties
const visiblePages = computed(() => {
  const pages = []
  const totalPages = pagination.value.total_pages
  const current = pagination.value.current_page

  // Show up to 5 pages around current page
  const start = Math.max(1, current - 2)
  const end = Math.min(totalPages, current + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const fetchDepartments = async () => {
  if (!authStore.user?.enterprise_id) return

  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: searchQuery.value,
      include_inactive: includeInactive.value
    }

    const response = await departmentAPI.getByEnterprise(authStore.user.enterprise_id, params)
    departments.value = response.departments
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to fetch departments:', error)
    // Handle error (show toast, etc.)
  } finally {
    loading.value = false
  }
}

const fetchAnalytics = async () => {
  if (!authStore.user?.enterprise_id) return

  try {
    const response = await departmentAPI.getAnalytics(authStore.user.enterprise_id)
    analytics.value = response.analytics
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
  }
}

const debouncedSearch = (() => {
  let timeout: NodeJS.Timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      currentPage.value = 1
      fetchDepartments()
    }, 300)
  }
})()

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.total_pages) {
    currentPage.value = page
    fetchDepartments()
  }
}

const viewDepartment = (department: any) => {
  selectedDepartment.value = department
  showDetailsModal.value = true
}

const editDepartment = (department: any) => {
  selectedDepartment.value = department
  showEditModal.value = true
  showDetailsModal.value = false
}

const manageDepartmentUsers = (department: any) => {
  selectedDepartment.value = department
  showUserManagementModal.value = true
}

const manageShiftTemplates = (department: any) => {
  selectedDepartment.value = department
  showShiftTemplateModal.value = true
}

const deleteDepartment = async (department: any) => {
  if (department.user_count > 0) {
    alert('Cannot delete department with assigned users. Please reassign users first.')
    return
  }

  if (!confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
    return
  }

  try {
    await departmentAPI.delete(department.id)
    await fetchDepartments()
    await fetchAnalytics()
    // Show success message
  } catch (error) {
    console.error('Failed to delete department:', error)
    // Show error message
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  selectedDepartment.value = null
}

const handleDepartmentSaved = () => {
  closeModal()
  fetchDepartments()
  fetchAnalytics()
}

const handleUsersUpdated = () => {
  showUserManagementModal.value = false
  fetchDepartments()
  fetchAnalytics()
}

// Lifecycle
onMounted(() => {
  // Check if user has permission to access this page
  if (!authStore.isEnterpriseAdmin) {
    router.push('/dashboard')
    return
  }

  fetchDepartments()
  fetchAnalytics()
})
</script>
