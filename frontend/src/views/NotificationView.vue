<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Notifications</h1>
        <p class="text-gray-600 mt-1">Manage your notifications and preferences</p>
      </div>

      <!-- Actions Bar -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <!-- Filters -->
          <div class="flex items-center space-x-4">
            <select
              v-model="selectedFilter"
              @change="applyFilters"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            <select
              v-model="selectedType"
              @change="applyFilters"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="roster_published">Roster Published</option>
              <option value="shift_assigned">Shift Assigned</option>
              <option value="swap_request_received">Swap Requests</option>
              <option value="roster_needs_approval">Approval Needed</option>
              <option value="system_announcement">Announcements</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex items-center space-x-3">
            <button
              v-if="hasUnread"
              @click="markAllAsRead"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Mark all as read
            </button>
            <router-link
              to="/notifications/preferences"
              class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Preferences
            </router-link>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && notifications.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-500">Loading notifications...</p>
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
          @click="fetchNotifications"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>

      <!-- Notifications List -->
      <div v-else-if="notifications.length > 0" class="space-y-4">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          :class="{ 'border-l-4 border-l-blue-500 bg-blue-50': !notification.read_at }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Header -->
              <div class="flex items-center space-x-3 mb-2">
                <div
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  :class="{
                    'bg-red-500': notification.priority === 'urgent',
                    'bg-orange-500': notification.priority === 'high',
                    'bg-blue-500': notification.priority === 'normal',
                    'bg-gray-400': notification.priority === 'low'
                  }"
                ></div>
                <h3 class="text-lg font-semibold text-gray-900">{{ notification.title }}</h3>
                <span
                  v-if="!notification.read_at"
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  New
                </span>
              </div>

              <!-- Content -->
              <p class="text-gray-700 mb-3">{{ notification.message }}</p>

              <!-- Metadata -->
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <span>{{ formatDate(notification.created_at) }}</span>
                <span class="capitalize">{{ notification.type.replace(/_/g, ' ') }}</span>
                <span class="capitalize">{{ notification.priority }} priority</span>
                <span v-if="notification.days_until_cleanup !== null && notification.days_until_cleanup !== undefined"
                      class="text-orange-600 font-medium"
                      :class="{ 'text-red-600': notification.days_until_cleanup <= 1 }">
                  {{ notification.days_until_cleanup === 0 ? 'Deletes today' :
                     notification.days_until_cleanup === 1 ? 'Deletes tomorrow' :
                     `Deletes in ${notification.days_until_cleanup} days` }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2 ml-4">
              <button
                v-if="!notification.read_at"
                @click="markAsRead(notification.id)"
                class="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                title="Mark as read"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </button>

              <button
                v-if="notification.action_url"
                @click="navigateToAction(notification)"
                class="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                title="View details"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
              </button>

              <button
                @click="deleteNotification(notification.id)"
                class="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                title="Delete notification"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="pagination.current_page < pagination.total_pages" class="text-center pt-6">
          <button
            @click="loadMore"
            :disabled="loading"
            class="px-6 py-3 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <span v-if="loading">Loading...</span>
            <span v-else>Load More</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div class="text-gray-400 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25H2.25v-2.25L4.5 12V9.75a6 6 0 0 1 6-6z"/>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
        <p class="text-gray-500">You're all caught up! No notifications to show.</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const notificationStore = useNotificationStore()

// Local state
const selectedFilter = ref('all')
const selectedType = ref('')

// Computed properties
const notifications = computed(() => notificationStore.notifications)
const loading = computed(() => notificationStore.loading)
const error = computed(() => notificationStore.error)
const hasUnread = computed(() => notificationStore.hasUnread)
const pagination = computed(() => notificationStore.pagination)

// Methods
const fetchNotifications = () => {
  const params: any = { page: 1, limit: 20 }

  if (selectedFilter.value === 'unread') {
    params.unread_only = true
  }

  if (selectedType.value) {
    params.type = selectedType.value
  }

  notificationStore.fetchNotifications(params)
}

const applyFilters = () => {
  fetchNotifications()
}

const loadMore = () => {
  const params: any = {
    page: pagination.value.current_page + 1,
    limit: 20
  }

  if (selectedFilter.value === 'unread') {
    params.unread_only = true
  }

  if (selectedType.value) {
    params.type = selectedType.value
  }

  notificationStore.fetchNotifications(params)
}

const markAsRead = async (notificationId: number) => {
  await notificationStore.markAsRead(notificationId)
}

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const deleteNotification = async (notificationId: number) => {
  if (confirm('Are you sure you want to delete this notification?')) {
    await notificationStore.deleteNotification(notificationId)
  }
}

const navigateToAction = async (notification: any) => {
  // Mark as read if unread
  if (!notification.read_at) {
    await markAsRead(notification.id)
  }

  // Navigate to action URL
  if (notification.action_url) {
    router.push(notification.action_url)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  fetchNotifications()
})
</script>
