<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Notification Cleanup</h3>
    
    <div class="space-y-4">
      <!-- Cleanup Settings -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Days after read to delete
          </label>
          <input
            v-model.number="daysAfterRead"
            type="number"
            min="1"
            max="365"
            class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <p class="text-xs text-gray-500 mt-1">
            Read notifications will be deleted after this many days
          </p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Days to keep unread notifications
          </label>
          <input
            v-model.number="daysUnread"
            type="number"
            min="1"
            max="365"
            class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
          <p class="text-xs text-gray-500 mt-1">
            Unread notifications older than this will be deleted
          </p>
        </div>
      </div>

      <!-- Current Settings Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <h4 class="text-sm font-medium text-blue-800">Automatic Cleanup</h4>
            <p class="text-sm text-blue-700 mt-1">
              The system automatically runs cleanup every 24 hours. Current settings: 
              <strong>{{ daysAfterRead }} days after read</strong>, 
              <strong>{{ daysUnread }} days for unread</strong>.
            </p>
          </div>
        </div>
      </div>

      <!-- Manual Cleanup Button -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <h4 class="text-sm font-medium text-gray-900">Manual Cleanup</h4>
          <p class="text-sm text-gray-500">Run cleanup now with current settings</p>
        </div>
        <button
          @click="runCleanup"
          :disabled="loading"
          class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Running...</span>
          <span v-else>Run Cleanup</span>
        </button>
      </div>

      <!-- Last Cleanup Result -->
      <div v-if="lastResult" class="bg-gray-50 border border-gray-200 rounded-md p-4">
        <h4 class="text-sm font-medium text-gray-900 mb-2">Last Cleanup Result</h4>
        <div class="text-sm text-gray-600 space-y-1">
          <p>• {{ lastResult.deletedReadCount }} read notifications deleted</p>
          <p>• {{ lastResult.deletedUnreadCount }} unread notifications deleted</p>
          <p class="font-medium">Total: {{ lastResult.totalDeleted }} notifications deleted</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <h4 class="text-sm font-medium text-red-800">Error</h4>
            <p class="text-sm text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { notificationAPI } from '@/services/api'

// State
const loading = ref(false)
const error = ref<string | null>(null)
const lastResult = ref<any>(null)
const daysAfterRead = ref(5)
const daysUnread = ref(30)

// Methods
const runCleanup = async () => {
  try {
    loading.value = true
    error.value = null
    
    const result = await notificationAPI.cleanup({
      days_after_read: daysAfterRead.value,
      days_unread: daysUnread.value
    })
    
    lastResult.value = result.result
    
    // Show success message
    if (result.result.totalDeleted > 0) {
      console.log(`Cleanup completed: ${result.result.totalDeleted} notifications deleted`)
    } else {
      console.log('Cleanup completed: No notifications to delete')
    }
    
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to run cleanup'
    console.error('Cleanup error:', err)
  } finally {
    loading.value = false
  }
}
</script>
