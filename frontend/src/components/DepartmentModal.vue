<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEdit ? 'Edit Department' : 'Create New Department' }}
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

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="mt-6 space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Department Name *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter department name"
              >
            </div>

            <div>
              <label for="manager" class="block text-sm font-medium text-gray-700 mb-2">
                Department Manager
              </label>
              <select
                id="manager"
                v-model="form.manager_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a manager</option>
                <option
                  v-for="manager in availableManagers"
                  :key="manager.id"
                  :value="manager.id"
                >
                  {{ manager.full_name }} ({{ manager.email }})
                </option>
              </select>
            </div>
          </div>

          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter department description"
            ></textarea>
          </div>

          <!-- Working Hours -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-4">Working Hours</h4>
            <div class="space-y-3">
              <div
                v-for="(day, dayKey) in form.working_hours"
                :key="dayKey"
                class="flex items-center space-x-4"
              >
                <div class="w-24">
                  <label class="flex items-center">
                    <input
                      v-model="day.enabled"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {{ dayKey }}
                    </span>
                  </label>
                </div>
                <div v-if="day.enabled" class="flex items-center space-x-2">
                  <input
                    v-model="day.start"
                    type="time"
                    class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  <span class="text-gray-500">to</span>
                  <input
                    v-model="day.end"
                    type="time"
                    class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Shift Patterns -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-4">Shift Patterns</h4>
            <div class="space-y-3">
              <div
                v-for="(shift, shiftKey) in form.shift_patterns"
                :key="shiftKey"
                class="flex items-center space-x-4"
              >
                <div class="w-24">
                  <label class="flex items-center">
                    <input
                      v-model="shift.enabled"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    >
                    <span class="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {{ shiftKey }}
                    </span>
                  </label>
                </div>
                <div v-if="shift.enabled" class="flex items-center space-x-2">
                  <input
                    v-model="shift.start"
                    type="time"
                    class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                  <span class="text-gray-500">to</span>
                  <input
                    v-model="shift.end"
                    type="time"
                    class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Department Settings -->
          <div>
            <h4 class="text-md font-medium text-gray-900 mb-4">Department Settings</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="max_consecutive_days" class="block text-sm font-medium text-gray-700 mb-2">
                  Max Consecutive Days
                </label>
                <input
                  id="max_consecutive_days"
                  v-model.number="form.settings.max_consecutive_days"
                  type="number"
                  min="1"
                  max="14"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>

              <div>
                <label for="min_rest_hours" class="block text-sm font-medium text-gray-700 mb-2">
                  Min Rest Hours
                </label>
                <input
                  id="min_rest_hours"
                  v-model.number="form.settings.min_rest_hours"
                  type="number"
                  min="8"
                  max="24"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.settings.allow_overtime"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm font-medium text-gray-700">
                    Allow Overtime
                  </span>
                </label>
              </div>

              <div>
                <label class="flex items-center">
                  <input
                    v-model="form.settings.require_manager_approval"
                    type="checkbox"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                  <span class="ml-2 text-sm font-medium text-gray-700">
                    Require Manager Approval
                  </span>
                </label>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div v-if="isEdit">
            <label class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="ml-2 text-sm font-medium text-gray-700">
                Department is active
              </span>
            </label>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEdit ? 'Updating...' : 'Creating...' }}
              </span>
              <span v-else>
                {{ isEdit ? 'Update Department' : 'Create Department' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { departmentAPI, enterpriseAPI } from '@/services/api'

interface Props {
  department?: any
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  department: null,
  isEdit: false
})

const emit = defineEmits<{
  close: []
  saved: []
}>()

const authStore = useAuthStore()
const loading = ref(false)
const availableManagers = ref([])

const defaultForm = {
  name: '',
  description: '',
  manager_id: '',
  working_hours: {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '17:00', enabled: false },
    sunday: { start: '09:00', end: '17:00', enabled: false }
  },
  shift_patterns: {
    morning: { start: '06:00', end: '14:00', enabled: true },
    afternoon: { start: '14:00', end: '22:00', enabled: true },
    night: { start: '22:00', end: '06:00', enabled: false }
  },
  settings: {
    max_consecutive_days: 7,
    min_rest_hours: 12,
    allow_overtime: true,
    require_manager_approval: true
  },
  is_active: true
}

const form = reactive({ ...defaultForm })

const fetchAvailableManagers = async () => {
  if (!authStore.user?.enterprise_id) return

  try {
    // Fetch users with manager role from the enterprise
    const response = await enterpriseAPI.getById(authStore.user.enterprise_id)
    console.log('Enterprise API response:', response)
    // Filter users with manager role - fix the response structure
    const users = response.enterprise?.users || response.users || []
    availableManagers.value = users.filter((user: any) => user.role === 'manager')
    console.log('Available managers:', availableManagers.value)
  } catch (error) {
    console.error('Failed to fetch managers:', error)
  }
}

const handleSubmit = async () => {
  console.log('handleSubmit called!')
  loading.value = true

  try {
    const payload = {
      ...form,
      enterprise_id: authStore.user?.enterprise_id,
      // Convert empty string to null for manager_id and ensure it's a number
      manager_id: form.manager_id ? Number(form.manager_id) : null
    }

    console.log('Submitting department payload:', payload)

    if (props.isEdit && props.department) {
      const result = await departmentAPI.update(props.department.id, payload)
      console.log('Department update result:', result)
    } else {
      const result = await departmentAPI.create(payload)
      console.log('Department create result:', result)
    }

    emit('saved')
  } catch (error) {
    console.error('Failed to save department:', error)
    console.error('Error details:', error.response?.data || error.message)
    // Handle error (show toast, etc.)
  } finally {
    loading.value = false
  }
}

// Initialize form with department data if editing
watch(() => props.department, (department) => {
  if (department && props.isEdit) {
    Object.assign(form, {
      name: department.name || '',
      description: department.description || '',
      manager_id: department.manager_id || '',
      working_hours: department.working_hours || defaultForm.working_hours,
      shift_patterns: department.shift_patterns || defaultForm.shift_patterns,
      settings: department.settings || defaultForm.settings,
      is_active: department.is_active !== undefined ? department.is_active : true
    })
  } else {
    Object.assign(form, defaultForm)
  }
}, { immediate: true })

onMounted(() => {
  fetchAvailableManagers()
})
</script>
