<template>
  <div class="relative">
    <!-- Notification Bell Button -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors duration-200"
      :class="{ 'text-blue-600': hasUnread }"
      title="Notifications"
    >
      <!-- Bell Icon -->
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        :class="{ 'animate-pulse': hasUnread }"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25H2.25v-2.25L4.5 12V9.75a6 6 0 0 1 6-6z"
        />
      </svg>

      <!-- Unread Count Badge -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px] h-5"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div
      v-if="showDropdown"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      @click.stop
    >
      <!-- Header -->
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Notifications</h3>
        <div class="flex items-center space-x-2">
          <button
            v-if="hasUnread"
            @click="markAllAsRead"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            :disabled="loading"
          >
            Mark all read
          </button>
          <router-link
            to="/notifications"
            class="text-sm text-gray-600 hover:text-gray-800"
            @click="closeDropdown"
          >
            View all
          </router-link>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="px-4 py-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-sm text-gray-500 mt-2">Loading notifications...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="px-4 py-6 text-center">
        <div class="text-red-500 mb-2">
          <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <p class="text-sm text-gray-600">{{ error }}</p>
        <button
          @click="fetchNotifications"
          class="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          Try again
        </button>
      </div>

      <!-- Notifications List -->
      <div v-else-if="recentNotifications.length > 0" class="max-h-96 overflow-y-auto">
        <div
          v-for="notification in recentNotifications"
          :key="notification.id"
          class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
          :class="{ 'bg-blue-50': !notification.read_at }"
          @click="handleNotificationClick(notification)"
        >
          <div class="flex items-start space-x-3">
            <!-- Priority Indicator -->
            <div class="flex-shrink-0 mt-1">
              <div
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-red-500': notification.priority === 'urgent',
                  'bg-orange-500': notification.priority === 'high',
                  'bg-blue-500': notification.priority === 'normal',
                  'bg-gray-400': notification.priority === 'low'
                }"
              ></div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ notification.title }}
              </p>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                {{ notification.message }}
              </p>
              <div class="flex items-center justify-between mt-1">
                <p class="text-xs text-gray-400">
                  {{ formatRelativeTime(notification.created_at) }}
                </p>
                <p v-if="notification.days_until_cleanup !== null && notification.days_until_cleanup !== undefined"
                   class="text-xs text-orange-500 font-medium"
                   :class="{ 'text-red-500': notification.days_until_cleanup <= 1 }">
                  {{ notification.days_until_cleanup === 0 ? 'Deletes today' :
                     notification.days_until_cleanup === 1 ? 'Tomorrow' :
                     `${notification.days_until_cleanup}d` }}
                </p>
              </div>
            </div>

            <!-- Unread Indicator -->
            <div v-if="!notification.read_at" class="flex-shrink-0">
              <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="px-4 py-8 text-center">
        <div class="text-gray-400 mb-2">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25H2.25v-2.25L4.5 12V9.75a6 6 0 0 1 6-6z"/>
          </svg>
        </div>
        <p class="text-sm text-gray-500">No notifications yet</p>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <router-link
          to="/notifications"
          class="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          @click="closeDropdown"
        >
          View all notifications
        </router-link>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      v-if="showDropdown"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'

const router = useRouter()
const notificationStore = useNotificationStore()

// Local state
const showDropdown = ref(false)
let refreshInterval: (() => void) | null = null

// Computed properties
const unreadCount = computed(() => notificationStore.unreadCount)
const hasUnread = computed(() => notificationStore.hasUnread)
const recentNotifications = computed(() => notificationStore.recentNotifications)
const loading = computed(() => notificationStore.loading)
const error = computed(() => notificationStore.error)

// Methods
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    fetchNotifications()
  }
}

const closeDropdown = () => {
  showDropdown.value = false
}

const fetchNotifications = () => {
  notificationStore.fetchNotifications({ limit: 5 })
}

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead()
}

const handleNotificationClick = async (notification: any) => {
  // Mark as read if unread
  if (!notification.read_at) {
    await notificationStore.markAsRead(notification.id)
  }

  // Navigate to action URL if available
  if (notification.action_url) {
    router.push(notification.action_url)
  }

  closeDropdown()
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  }
}

// Lifecycle
onMounted(() => {
  // Initialize notifications
  notificationStore.initialize()

  // Start periodic refresh
  refreshInterval = notificationStore.startPeriodicRefresh()
})

onUnmounted(() => {
  // Cleanup periodic refresh
  if (refreshInterval) {
    refreshInterval()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
