<template>
  <AppLayout>
    <div class="p-6 sm:p-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">System Settings</h1>
        <p class="mt-2 text-gray-600">Manage system configuration and perform maintenance tasks</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-gray-600">Loading system settings...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Settings Content -->
      <div v-else-if="settings" class="space-y-8">
        <!-- System Statistics -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">System Statistics</h3>
            <p class="text-sm text-gray-600">Current platform usage and activity</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div class="text-center">
                <div class="text-3xl font-bold text-blue-600">{{ settings.statistics.totalEnterprises }}</div>
                <div class="text-sm text-gray-600">Total Enterprises</div>
                <div class="text-xs text-gray-500 mt-1">{{ settings.statistics.recentEnterprises }} new this month</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-green-600">{{ settings.statistics.totalUsers }}</div>
                <div class="text-sm text-gray-600">Total Users</div>
                <div class="text-xs text-gray-500 mt-1">{{ settings.statistics.activeUsers }} active</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-purple-600">{{ settings.statistics.totalDepartments }}</div>
                <div class="text-sm text-gray-600">Total Departments</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-orange-600">{{ settings.statistics.totalNotifications }}</div>
                <div class="text-sm text-gray-600">Total Notifications</div>
                <div class="text-xs text-gray-500 mt-1">{{ settings.statistics.unreadNotifications }} unread</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration Tabs -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">System Configuration</h3>
            <p class="text-sm text-gray-600">Manage system settings and preferences</p>
          </div>

          <!-- Tab Navigation -->
          <div class="border-b border-gray-200">
            <nav class="flex space-x-8 px-6" aria-label="Tabs">
              <button
                v-for="tab in configTabs"
                :key="tab.id"
                @click="activeTab = tab.id"
                class="py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
                :class="activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Email Settings -->
            <div v-if="activeTab === 'email'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                  <input
                    v-model="configForm.email.smtp_host"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                  <input
                    v-model="configForm.email.smtp_port"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">SMTP User</label>
                  <input
                    v-model="configForm.email.smtp_user"
                    type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div class="flex items-center">
                  <input
                    v-model="configForm.email.smtp_enabled"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Enable Email Notifications</label>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div v-if="activeTab === 'security'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">JWT Expires In</label>
                  <input
                    v-model="configForm.security.jwt_expires_in"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="7d"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password Min Length</label>
                  <input
                    v-model="configForm.security.password_min_length"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="6"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                  <input
                    v-model="configForm.security.max_login_attempts"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="3"
                  />
                </div>
                <div class="flex items-center">
                  <input
                    v-model="configForm.security.require_password_change"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Require Password Change</label>
                </div>
              </div>
            </div>

            <!-- System Limits -->
            <div v-if="activeTab === 'limits'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Enterprises</label>
                  <input
                    v-model="configForm.limits.max_enterprises"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Users per Enterprise</label>
                  <input
                    v-model="configForm.limits.max_users_per_enterprise"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Departments per Enterprise</label>
                  <input
                    v-model="configForm.limits.max_departments_per_enterprise"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Shifts per Roster</label>
                  <input
                    v-model="configForm.limits.max_shifts_per_roster"
                    type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Feature Flags -->
            <div v-if="activeTab === 'features'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center">
                  <input
                    v-model="configForm.features.enterprise_registration"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Enterprise Registration</label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="configForm.features.email_notifications"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Email Notifications</label>
                </div>
                <div class="flex items-center">
                  <input
                    v-model="configForm.features.shift_swapping"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Shift Swapping</label>
                </div>

                <div class="flex items-center">
                  <input
                    v-model="configForm.features.roster_templates"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label class="ml-2 block text-sm text-gray-900">Roster Templates</label>
                </div>
              </div>
            </div>

            <!-- Save Configuration Button -->
            <div class="mt-6 flex justify-end">
              <button
                @click="saveConfiguration"
                :disabled="saving"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <span v-if="saving">Saving...</span>
                <span v-else>Save Configuration</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Maintenance Tasks -->
        <div class="bg-white rounded-xl shadow-lg border border-gray-100">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Maintenance Tasks</h3>
            <p class="text-sm text-gray-600">Perform system maintenance and cleanup operations</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                @click="performMaintenance('cleanup_notifications')"
                :disabled="maintenanceLoading"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <div class="text-center">
                  <svg class="w-8 h-8 mx-auto mb-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd"/>
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                  </svg>
                  <div class="font-medium text-gray-900">Clean Notifications</div>
                  <div class="text-sm text-gray-600">Remove old notifications</div>
                </div>
              </button>

              <button
                @click="performMaintenance('deactivate_inactive_users')"
                :disabled="maintenanceLoading"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <div class="text-center">
                  <svg class="w-8 h-8 mx-auto mb-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                  </svg>
                  <div class="font-medium text-gray-900">Deactivate Inactive Users</div>
                  <div class="text-sm text-gray-600">Deactivate long-inactive users</div>
                </div>
              </button>

              <button
                @click="performMaintenance('system_health_check')"
                :disabled="maintenanceLoading"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                <div class="text-center">
                  <svg class="w-8 h-8 mx-auto mb-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <div class="font-medium text-gray-900">System Health Check</div>
                  <div class="text-sm text-gray-600">Check system status</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
        {{ successMessage }}
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { systemSettingsAPI } from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'

// State
const loading = ref(false)
const saving = ref(false)
const maintenanceLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const settings = ref(null)
const activeTab = ref('email')

// Configuration form
const configForm = reactive({
  email: {
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_enabled: false
  },
  security: {
    jwt_expires_in: '7d',
    password_min_length: 6,
    require_password_change: false,
    max_login_attempts: 5
  },
  limits: {
    max_enterprises: 100,
    max_users_per_enterprise: 1000,
    max_departments_per_enterprise: 50,
    max_shifts_per_roster: 500
  },
  features: {
    enterprise_registration: true,
    email_notifications: true,
    shift_swapping: true,

    roster_templates: true
  }
})

// Tab configuration
const configTabs = [
  { id: 'email', name: 'Email Settings' },
  { id: 'security', name: 'Security' },
  { id: 'limits', name: 'System Limits' },
  { id: 'features', name: 'Features' }
]

// Functions
const fetchSettings = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await systemSettingsAPI.getSettings()
    settings.value = response.settings

    // Populate form with current configuration
    if (response.settings.configuration) {
      Object.assign(configForm, response.settings.configuration)
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load system settings'
  } finally {
    loading.value = false
  }
}

const saveConfiguration = async () => {
  try {
    saving.value = true
    await systemSettingsAPI.updateSettings(configForm)
    showSuccess('Configuration saved successfully!')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save configuration'
  } finally {
    saving.value = false
  }
}

const performMaintenance = async (task: string) => {
  try {
    maintenanceLoading.value = true
    const response = await systemSettingsAPI.performMaintenance(task)
    showSuccess(`Maintenance task completed: ${response.message}`)

    // Refresh settings to show updated statistics
    await fetchSettings()
  } catch (err: any) {
    error.value = err.response?.data?.message || `Failed to perform ${task}`
  } finally {
    maintenanceLoading.value = false
  }
}

const showSuccess = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

// Lifecycle
onMounted(() => {
  fetchSettings()
})
</script>
