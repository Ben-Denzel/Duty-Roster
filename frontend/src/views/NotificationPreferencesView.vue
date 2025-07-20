<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <router-link
            to="/notifications"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </router-link>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Notification Preferences</h1>
            <p class="text-gray-600 mt-1">Customize how you receive notifications</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading preferences...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="text-red-500 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="fetchPreferences"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>

      <!-- Preferences Form -->
      <form v-else-if="preferences" @submit.prevent="savePreferences" class="space-y-8">
        <!-- General Settings -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Email Notifications</label>
                <p class="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <input
                v-model="preferences.email_enabled"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Push Notifications</label>
                <p class="text-sm text-gray-500">Receive real-time notifications</p>
              </div>
              <input
                v-model="preferences.push_enabled"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Sound Notifications</label>
                <p class="text-sm text-gray-500">Play sound when notifications arrive</p>
              </div>
              <input
                v-model="preferences.sound_enabled"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Desktop Notifications</label>
                <p class="text-sm text-gray-500">Show browser notifications</p>
              </div>
              <input
                v-model="preferences.desktop_enabled"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>
          </div>
        </div>

        <!-- Notification Types -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Notification Types</h2>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Roster Published</label>
                <p class="text-sm text-gray-500">When new rosters are published</p>
              </div>
              <input
                v-model="preferences.roster_published"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Shift Assignments</label>
                <p class="text-sm text-gray-500">When you're assigned or unassigned from shifts</p>
              </div>
              <input
                v-model="preferences.shift_assigned"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Swap Requests</label>
                <p class="text-sm text-gray-500">When you receive or respond to swap requests</p>
              </div>
              <input
                v-model="preferences.swap_request_received"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Approval Requests</label>
                <p class="text-sm text-gray-500">When rosters need your approval</p>
              </div>
              <input
                v-model="preferences.roster_needs_approval"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">System Announcements</label>
                <p class="text-sm text-gray-500">Important system-wide announcements</p>
              </div>
              <input
                v-model="preferences.system_announcement"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>
          </div>
        </div>

        <!-- Email Settings -->
        <div v-if="preferences.email_enabled" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Email Settings</h2>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">Email Frequency</label>
              <select
                v-model="preferences.email_frequency"
                class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="immediate">Immediate</option>
                <option value="hourly">Hourly Digest</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Digest</option>
              </select>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <label class="text-sm font-medium text-gray-900">Email Digest</label>
                <p class="text-sm text-gray-500">Receive digest emails instead of individual emails</p>
              </div>
              <input
                v-model="preferences.email_digest"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
            </div>
          </div>
        </div>

        <!-- Admin Cleanup Panel (System Admin Only) -->
        <NotificationCleanupPanel v-if="isSystemAdmin" />

        <!-- Save Button -->
        <div class="flex justify-end space-x-4">
          <router-link
            to="/notifications"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </router-link>
          <button
            type="submit"
            :disabled="saving"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import NotificationCleanupPanel from '@/components/NotificationCleanupPanel.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const { showSuccess, showError } = useToast()

// Local state
const saving = ref(false)

// Computed properties
const preferences = computed(() => notificationStore.preferences)
const loading = computed(() => notificationStore.loading)
const error = computed(() => notificationStore.error)
const isSystemAdmin = computed(() => authStore.user?.role === 'systemAdmin')

// Methods
const fetchPreferences = async () => {
  await notificationStore.fetchPreferences()
}

const savePreferences = async () => {
  if (!preferences.value) return

  try {
    saving.value = true
    await notificationStore.updatePreferences(preferences.value)
    showSuccess('Preferences saved', 'Your notification preferences have been updated successfully.')
    router.push('/notifications')
  } catch (err: any) {
    showError('Failed to save preferences', err.response?.data?.message || 'An error occurred while saving your preferences.')
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (!preferences.value) {
    fetchPreferences()
  }
})
</script>
