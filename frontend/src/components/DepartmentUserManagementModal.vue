<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-medium text-gray-900">Manage Users - {{ department?.name }}</h3>
            <p class="text-sm text-gray-600 mt-1">Assign or remove users from this department</p>
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
        <div class="mt-6">
          <!-- Tabs -->
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                @click="activeTab = 'current'"
                :class="activeTab === 'current' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
              >
                Current Users ({{ currentUsers.length }})
              </button>
              <button
                @click="activeTab = 'available'"
                :class="activeTab === 'available' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
                class="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
              >
                Available Users ({{ availableUsers.length }})
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="mt-6">
            <!-- Current Users Tab -->
            <div v-if="activeTab === 'current'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="text-md font-medium text-gray-900">Users in {{ department?.name }}</h4>
                <button
                  v-if="selectedCurrentUsers.length > 0"
                  @click="removeSelectedUsers"
                  :disabled="loading"
                  class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Remove Selected ({{ selectedCurrentUsers.length }})
                </button>
              </div>

              <div v-if="currentUsers.length === 0" class="text-center py-8 text-gray-500">
                No users assigned to this department
              </div>

              <div v-else class="space-y-2 max-h-96 overflow-y-auto">
                <div
                  v-for="user in currentUsers"
                  :key="user.id"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div class="flex items-center">
                    <input
                      v-model="selectedCurrentUsers"
                      :value="user.id"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <div class="ml-3 flex items-center">
                      <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {{ user.full_name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="getRoleColor(user.role)"
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ formatRole(user.role) }}
                    </span>
                    <button
                      @click="removeUser(user)"
                      :disabled="loading"
                      class="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="Remove from department"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Available Users Tab -->
            <div v-if="activeTab === 'available'" class="space-y-4">
              <div class="flex justify-between items-center">
                <h4 class="text-md font-medium text-gray-900">Available Users</h4>
                <button
                  v-if="selectedAvailableUsers.length > 0"
                  @click="assignSelectedUsers"
                  :disabled="loading"
                  class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Assign Selected ({{ selectedAvailableUsers.length }})
                </button>
              </div>

              <!-- Search -->
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search available users..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>

              <div v-if="filteredAvailableUsers.length === 0" class="text-center py-8 text-gray-500">
                No available users found
              </div>

              <div v-else class="space-y-2 max-h-96 overflow-y-auto">
                <div
                  v-for="user in filteredAvailableUsers"
                  :key="user.id"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div class="flex items-center">
                    <input
                      v-model="selectedAvailableUsers"
                      :value="user.id"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <div class="ml-3 flex items-center">
                      <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-white">
                          {{ user.full_name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900">{{ user.full_name }}</div>
                        <div class="text-sm text-gray-500">{{ user.email }}</div>
                        <div v-if="user.department" class="text-xs text-gray-400">
                          Currently in: {{ user.department.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span :class="getRoleColor(user.role)"
                          class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ formatRole(user.role) }}
                    </span>
                    <button
                      @click="assignUser(user)"
                      :disabled="loading"
                      class="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      title="Assign to department"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { departmentAPI, enterpriseAPI } from '@/services/api'

interface Props {
  department?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const authStore = useAuthStore()
const loading = ref(false)
const activeTab = ref('current')
const searchQuery = ref('')
const currentUsers = ref([])
const availableUsers = ref([])
const selectedCurrentUsers = ref([])
const selectedAvailableUsers = ref([])

const filteredAvailableUsers = computed(() => {
  if (!searchQuery.value) return availableUsers.value

  const query = searchQuery.value.toLowerCase()
  return availableUsers.value.filter(user =>
    user.full_name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const fetchCurrentUsers = async () => {
  if (!props.department?.id) return

  try {
    const response = await departmentAPI.getById(props.department.id)
    currentUsers.value = response.department.users || []
  } catch (error) {
    console.error('Failed to fetch current users:', error)
  }
}

const fetchAvailableUsers = async () => {
  if (!authStore.user?.enterprise_id) return

  try {
    const response = await enterpriseAPI.getById(authStore.user.enterprise_id)
    // Filter out users already in this department
    availableUsers.value = (response.users || []).filter(user =>
      user.department_id !== props.department?.id
    )
  } catch (error) {
    console.error('Failed to fetch available users:', error)
  }
}

const assignUser = async (user: any) => {
  if (!props.department?.id) return

  loading.value = true
  try {
    await departmentAPI.assignUsers(props.department.id, [user.id])

    // Move user from available to current
    availableUsers.value = availableUsers.value.filter(u => u.id !== user.id)
    currentUsers.value.push(user)

    emit('updated')
  } catch (error) {
    console.error('Failed to assign user:', error)
  } finally {
    loading.value = false
  }
}

const removeUser = async (user: any) => {
  if (!props.department?.id) return

  loading.value = true
  try {
    await departmentAPI.removeUsers(props.department.id, [user.id])

    // Move user from current to available
    currentUsers.value = currentUsers.value.filter(u => u.id !== user.id)
    availableUsers.value.push(user)

    emit('updated')
  } catch (error) {
    console.error('Failed to remove user:', error)
  } finally {
    loading.value = false
  }
}

const assignSelectedUsers = async () => {
  if (!props.department?.id || selectedAvailableUsers.value.length === 0) return

  loading.value = true
  try {
    await departmentAPI.assignUsers(props.department.id, selectedAvailableUsers.value)

    // Move selected users from available to current
    const selectedUsers = availableUsers.value.filter(user =>
      selectedAvailableUsers.value.includes(user.id)
    )

    availableUsers.value = availableUsers.value.filter(user =>
      !selectedAvailableUsers.value.includes(user.id)
    )

    currentUsers.value.push(...selectedUsers)
    selectedAvailableUsers.value = []

    emit('updated')
  } catch (error) {
    console.error('Failed to assign users:', error)
  } finally {
    loading.value = false
  }
}

const removeSelectedUsers = async () => {
  if (!props.department?.id || selectedCurrentUsers.value.length === 0) return

  loading.value = true
  try {
    await departmentAPI.removeUsers(props.department.id, selectedCurrentUsers.value)

    // Move selected users from current to available
    const selectedUsers = currentUsers.value.filter(user =>
      selectedCurrentUsers.value.includes(user.id)
    )

    currentUsers.value = currentUsers.value.filter(user =>
      !selectedCurrentUsers.value.includes(user.id)
    )

    availableUsers.value.push(...selectedUsers)
    selectedCurrentUsers.value = []

    emit('updated')
  } catch (error) {
    console.error('Failed to remove users:', error)
  } finally {
    loading.value = false
  }
}

const formatRole = (role: string) => {
  switch (role) {
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

const getRoleColor = (role: string) => {
  switch (role) {
    case 'enterpriseAdmin':
      return 'bg-purple-100 text-purple-800'
    case 'manager':
      return 'bg-blue-100 text-blue-800'
    case 'employee':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  fetchCurrentUsers()
  fetchAvailableUsers()
})
</script>
