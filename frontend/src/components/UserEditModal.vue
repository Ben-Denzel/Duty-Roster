<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-200">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
              <span class="text-lg font-medium text-white">
                {{ form.full_name?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">Edit User</h3>
              <p class="text-sm text-gray-600">Update user information</p>
            </div>
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

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="mt-6 space-y-6">
          <!-- User Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="edit_full_name" class="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                id="edit_full_name"
                v-model="form.full_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full name"
              >
            </div>

            <div>
              <label for="edit_email" class="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                id="edit_email"
                v-model="form.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              >
            </div>

            <div>
              <label for="edit_role" class="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                id="edit_role"
                v-model="form.role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a role</option>
                <option value="manager">Department Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div>
              <label for="edit_department_id" class="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                id="edit_department_id"
                v-model="form.department_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select department</option>
                <option
                  v-for="department in departments"
                  :key="department.id"
                  :value="department.id"
                >
                  {{ department.name }}
                </option>
              </select>
            </div>

            <div>
              <label for="edit_gender" class="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                id="edit_gender"
                v-model="form.gender"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>


          </div>

          <!-- Account Status Section -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <div class="flex items-center">
              <input
                id="edit_is_active"
                v-model="form.is_active"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="edit_is_active" class="ml-2 block text-sm text-gray-900">
                Active User
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500">
              Inactive users cannot log in to the system
            </p>
          </div>

          <!-- Password Reset Section -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              <h4 class="text-sm font-medium text-yellow-800">Password Reset</h4>
            </div>
            <div class="flex items-center">
              <input
                id="reset_password"
                v-model="form.reset_password"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="reset_password" class="ml-2 block text-sm text-yellow-800">
                Reset user password (user will need to set a new password on next login)
              </label>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-red-800">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="success" class="bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <div class="ml-3">
                <p class="text-sm text-green-800">{{ success }}</p>
              </div>
            </div>
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
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
              <span v-else>Update User</span>
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
import { departmentAPI, userAPI } from '@/services/api'

interface Props {
  user?: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: []
}>()

const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const success = ref('')
const departments = ref([])

const form = reactive({
  full_name: '',
  email: '',
  role: '' as 'manager' | 'employee' | '',
  gender: '',
  department_id: null as number | null,
  is_active: true,
  reset_password: false
})

const fetchDepartments = async () => {
  if (!authStore.user?.enterprise_id) return

  try {
    const response = await departmentAPI.getByEnterprise(authStore.user.enterprise_id)
    departments.value = response.departments || []
  } catch (err) {
    console.error('Failed to fetch departments:', err)
  }
}

const populateForm = () => {
  if (props.user) {
    form.full_name = props.user.full_name || ''
    form.email = props.user.email || ''
    form.role = props.user.role || ''
    form.gender = props.user.gender || ''
    form.department_id = props.user.department_id || null
    form.is_active = props.user.is_active !== false
    form.reset_password = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    if (!props.user?.id) {
      throw new Error('User ID is required')
    }

    // Prepare update data
    const updateData = {
      full_name: form.full_name,
      email: form.email,
      role: form.role,
      gender: form.gender || null,
      department_id: form.department_id,
      is_active: form.is_active,
      reset_password: form.reset_password
    }

    console.log('Updating user:', props.user.id, updateData)

    // Call the API to update the user
    const result = await userAPI.update(props.user.id, updateData)

    console.log('User update result:', result)

    success.value = 'User updated successfully!'

    // Wait a moment to show success message, then emit updated event
    setTimeout(() => {
      emit('updated')
    }, 1500)

  } catch (err: any) {
    console.error('User update error:', err)
    error.value = err.response?.data?.message || 'Failed to update user. Please try again.'
  } finally {
    loading.value = false
  }
}

watch(() => props.user, () => {
  populateForm()
}, { immediate: true })

onMounted(() => {
  fetchDepartments()
  populateForm()
})
</script>
