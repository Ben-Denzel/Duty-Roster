<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">User Management</h1>
        <p class="mt-2 text-gray-600">Create and manage user accounts for your enterprise</p>
      </div>

       <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Users</p>
              <p class="text-2xl font-bold text-gray-900">{{ users.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Managers</p>
              <p class="text-2xl font-bold text-gray-900">{{ managerCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Employees</p>
              <p class="text-2xl font-bold text-gray-900">{{ employeeCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow-lg rounded-xl border border-gray-100 p-6">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Departments</p>
              <p class="text-2xl font-bold text-gray-900">{{ departments.length }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Users List -->
      <div class="bg-white shadow-lg rounded-xl border border-gray-100 mb-8">
        <div class="px-6 py-5 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Enterprise Users</h2>
              <p class="text-sm text-gray-600">Manage all users in your enterprise</p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="text-sm text-gray-500">
                {{ filteredUsers.length }} of {{ users.length }} users
                <span v-if="lastRefresh" class="text-xs text-gray-400 ml-2">
                  (Updated: {{ lastRefresh }})
                </span>
              </div>
              <button
                @click="refreshData"
                :disabled="usersLoading"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                title="Refresh user list"
              >
                <svg class="w-4 h-4" :class="{ 'animate-spin': usersLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
              <button
                @click="showCreateModal = true"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add User
              </button>
            </div>
          </div>

          <!-- Search and Filter Bar -->
          <div class="mt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div class="flex-1">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search users by name, email, or role..."
                >
              </div>
            </div>
            <div class="flex space-x-3">
              <select
                v-model="roleFilter"
                class="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="manager">Managers</option>
                <option value="employee">Employees</option>
              </select>
              <select
                v-model="departmentFilter"
                class="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                <option
                  v-for="department in departments"
                  :key="department.id"
                  :value="department.id"
                >
                  {{ department.name }}
                </option>
              </select>

            <select
              v-model="statusFilter"
              class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Users</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="usersLoading" class="flex justify-center py-8">
            <svg class="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>

          <div v-else-if="users.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p class="text-gray-600 mb-4">Get started by adding your first user to the enterprise.</p>
            <button
              @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add First User
            </button>
          </div>

          <div v-else-if="filteredUsers.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No users match your search</h3>
            <p class="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
            <button
              @click="clearFilters"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>

          <!-- Users Table -->
          <div v-else class="overflow-hidden">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      @click="sortBy('full_name')"
                    >
                      <div class="flex items-center space-x-1">
                        <span>User</span>
                        <span class="text-gray-400">{{ getSortIcon('full_name') }}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      @click="sortBy('role')"
                    >
                      <div class="flex items-center space-x-1">
                        <span>Role</span>
                        <span class="text-gray-400">{{ getSortIcon('role') }}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      @click="sortBy('department')"
                    >
                      <div class="flex items-center space-x-1">
                        <span>Department</span>
                        <span class="text-gray-400">{{ getSortIcon('department') }}</span>
                      </div>
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                      @click="sortBy('created_at')"
                    >
                      <div class="flex items-center space-x-1">
                        <span>Joined</span>
                        <span class="text-gray-400">{{ getSortIcon('created_at') }}</span>
                      </div>
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="(user, index) in filteredUsers"
                    :key="user.id"
                    class="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <!-- Row Number -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ index + 1 }}
                    </td>

                    <!-- User Info -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span class="text-sm font-medium text-white">
                            {{ user.full_name.charAt(0).toUpperCase() }}
                          </span>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Role -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getRoleBadgeClass(user.role)"
                      >
                        {{ getRoleDisplay(user.role) }}
                      </span>
                    </td>

                    <!-- Department -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{ user.department?.name || 'Not assigned' }}
                      </div>
                      <div v-if="user.department" class="text-sm text-gray-500">
                        ID: {{ user.department.id }}
                      </div>
                    </td>

                    <!-- Joined Date -->
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ formatDate(user.created_at) }}
                    </td>

                    <!-- Status -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="user.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      >
                        {{ user.is_active !== false ? 'Active' : 'Inactive' }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div class="flex items-center justify-end space-x-2">
                        <button
                          @click="viewUser(user)"
                          class="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          title="View user details"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button
                          @click="editUser(user)"
                          class="text-green-600 hover:text-green-900 transition-colors duration-200"
                          title="Edit user"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- User Create Modal -->
    <UserCreateModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleUserCreated"
    />

    <!-- User Details Modal -->
    <UserDetailsModal
      v-if="showDetailsModal"
      :user="selectedUser"
      @close="showDetailsModal = false"
      @edit="handleEditUser"
    />

    <!-- User Edit Modal -->
    <UserEditModal
      v-if="showEditModal"
      :user="selectedUser"
      @close="showEditModal = false"
      @updated="handleUserUpdated"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userAPI, departmentAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import UserCreateModal from '@/components/UserCreateModal.vue'
import UserDetailsModal from '@/components/UserDetailsModal.vue'
import UserEditModal from '@/components/UserEditModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const users = ref([])
const usersLoading = ref(false)
const departments = ref([])
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const showEditModal = ref(false)
const selectedUser = ref(null)

// Search and filter state
const searchQuery = ref('')
const roleFilter = ref('')
const departmentFilter = ref('')
const statusFilter = ref('')
const lastRefresh = ref('')

// Table sorting state
const sortField = ref('full_name')
const sortDirection = ref('asc')

// Computed properties
const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((user: any) =>
      user.full_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      getRoleDisplay(user.role).toLowerCase().includes(query) ||
      (user.department?.name || '').toLowerCase().includes(query)
    )
  }

  // Apply role filter
  if (roleFilter.value) {
    filtered = filtered.filter((user: any) => user.role === roleFilter.value)
  }

  // Apply department filter
  if (departmentFilter.value) {
    filtered = filtered.filter((user: any) => user.department_id == departmentFilter.value)
  }

  // Apply status filter
  if (statusFilter.value) {
    if (statusFilter.value === 'active') {
      filtered = filtered.filter((user: any) => user.is_active !== false)
    } else if (statusFilter.value === 'inactive') {
      filtered = filtered.filter((user: any) => user.is_active === false)
    }
  }

  // Apply sorting
  filtered.sort((a: any, b: any) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]

    // Handle special cases
    if (sortField.value === 'department') {
      aValue = a.department?.name || 'ZZZ' // Put unassigned at the end
      bValue = b.department?.name || 'ZZZ'
    } else if (sortField.value === 'role') {
      aValue = getRoleDisplay(a.role)
      bValue = getRoleDisplay(b.role)
    } else if (sortField.value === 'created_at') {
      aValue = new Date(a.created_at).getTime()
      bValue = new Date(b.created_at).getTime()
    }

    // Convert to string for comparison if not already
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
    }
    if (typeof bValue === 'string') {
      bValue = bValue.toLowerCase()
    }

    if (sortDirection.value === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return filtered
})

const managerCount = computed(() =>
  users.value.filter((user: any) => user.role === 'manager').length
)

const employeeCount = computed(() =>
  users.value.filter((user: any) => user.role === 'employee').length
)

// Functions
const fetchUsers = async () => {
  if (!authStore.user?.enterprise_id) return

  try {
    usersLoading.value = true
    const response = await userAPI.getByEnterprise(authStore.user.enterprise_id)
    console.log("Response: "+response.enterprise?.users)
    users.value = response.enterprise?.users || []
    lastRefresh.value = new Date().toLocaleTimeString()
  } catch (err) {
    console.error('Failed to fetch users:', err)
  } finally {
    usersLoading.value = false
  }
}

const fetchDepartments = async () => {
  if (!authStore.user?.enterprise_id) return

  try {
    const response = await departmentAPI.getByEnterprise(authStore.user.enterprise_id)
    departments.value = response.departments || []
  } catch (err) {
    console.error('Failed to fetch departments:', err)
  }
}

const handleUserCreated = () => {
  showCreateModal.value = false
  fetchUsers()
}

const clearFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  departmentFilter.value = ''
  statusFilter.value = ''
}

const handleEditUser = (user: any) => {
  selectedUser.value = user
  showDetailsModal.value = false
  showEditModal.value = true
}

const handleUserUpdated = () => {
  showEditModal.value = false
  selectedUser.value = null
  fetchUsers()
}

const refreshData = () => {
  fetchUsers()
  fetchDepartments()
}

const sortBy = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field: string) => {
  if (sortField.value !== field) return ''
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const getRoleDisplay = (role: string) => {
  switch (role) {
    case 'systemAdmin':
      return 'System Admin'
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

const getRoleBadgeClass = (role: string) => {
  switch (role) {
    case 'systemAdmin':
      return 'bg-red-100 text-red-800'
    case 'enterpriseAdmin':
      return 'bg-blue-100 text-blue-800'
    case 'manager':
      return 'bg-green-100 text-green-800'
    case 'employee':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewUser = (user: any) => {
  selectedUser.value = user
  showDetailsModal.value = true
}

const editUser = (user: any) => {
  selectedUser.value = user
  showEditModal.value = true
}

onMounted(() => {
  // Check if user has permission to access this page
  if (!authStore.isEnterpriseAdmin) {
    router.push('/dashboard')
    return
  }

  // Fetch data
  fetchUsers()
  fetchDepartments()
})

// Add visibility change listener to refresh data when user returns to tab
const handleVisibilityChange = () => {
  if (!document.hidden) {
    // Tab became visible, refresh data
    fetchUsers()
  }
}

// Add focus listener to refresh data when window gets focus
const handleWindowFocus = () => {
  fetchUsers()
}

onMounted(() => {
  // Add event listeners for automatic refresh
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWindowFocus)
})

onUnmounted(() => {
  // Clean up event listeners
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('focus', handleWindowFocus)
})
</script>
