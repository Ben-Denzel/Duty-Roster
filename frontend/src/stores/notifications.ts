import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { notificationAPI, type Notification, type NotificationPreferences } from '@/services/api'
import websocketService from '@/services/websocket'
import { useAuthStore } from '@/stores/auth'

export const useNotificationStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const preferences = ref<NotificationPreferences | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 20
  })

  // Getters
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.read_at)
  )

  const readNotifications = computed(() =>
    notifications.value.filter(n => n.read_at)
  )

  const hasUnread = computed(() => unreadCount.value > 0)

  const recentNotifications = computed(() =>
    notifications.value.slice(0, 5)
  )

  // Actions
  const fetchNotifications = async (params?: {
    page?: number
    limit?: number
    unread_only?: boolean
    type?: string
    include_expired?: boolean
  }) => {
    try {
      loading.value = true
      error.value = null

      const response = await notificationAPI.getNotifications(params)

      if (params?.page === 1 || !params?.page) {
        // Replace notifications for first page or no page specified
        notifications.value = response.notifications
      } else {
        // Append notifications for subsequent pages
        notifications.value.push(...response.notifications)
      }

      pagination.value = response.pagination
      unreadCount.value = response.unread_count

    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      unreadCount.value = response.unread_count
    } catch (err: any) {
      console.error('Error fetching unread count:', err)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationAPI.markAsRead(notificationId)

      // Update local state
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.read_at) {
        notification.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      // Sync with WebSocket
      websocketService.markNotificationAsRead(notificationId)

    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to mark notification as read'
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()

      // Update local state
      notifications.value.forEach(notification => {
        if (!notification.read_at) {
          notification.read_at = new Date().toISOString()
        }
      })
      unreadCount.value = 0

    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to mark all notifications as read'
      console.error('Error marking all notifications as read:', err)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await notificationAPI.deleteNotification(notificationId)

      // Remove from local state
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        const notification = notifications.value[index]
        if (!notification.read_at) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
        pagination.value.total_items = Math.max(0, pagination.value.total_items - 1)
      }

    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete notification'
      console.error('Error deleting notification:', err)
    }
  }

  const fetchPreferences = async () => {
    try {
      const response = await notificationAPI.getPreferences()
      preferences.value = response.preferences
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch notification preferences'
      console.error('Error fetching notification preferences:', err)
    }
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await notificationAPI.updatePreferences(newPreferences)
      preferences.value = response.preferences
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update notification preferences'
      console.error('Error updating notification preferences:', err)
      throw err
    }
  }

  const addNotification = (notification: Notification) => {
    // Add new notification to the beginning of the list
    notifications.value.unshift(notification)

    // Update unread count if notification is unread
    if (!notification.read_at) {
      unreadCount.value += 1
    }

    // Update pagination
    pagination.value.total_items += 1
  }

  const clearError = () => {
    error.value = null
  }

  const clearNotifications = () => {
    notifications.value = []
    unreadCount.value = 0
    pagination.value = {
      current_page: 1,
      total_pages: 1,
      total_items: 0,
      items_per_page: 20
    }
  }

  // Initialize store
  const initialize = async () => {
    await Promise.all([
      fetchNotifications({ limit: 20 }),
      fetchPreferences()
    ])

    // Initialize WebSocket connection
    await initializeWebSocket()
  }

  // Initialize WebSocket connection
  const initializeWebSocket = async () => {
    try {
      const authStore = useAuthStore()
      const token = authStore.token

      if (!token) {
        console.warn('No auth token available for WebSocket connection')
        return
      }

      // Connect to WebSocket
      await websocketService.connect(token)

      // Set up event handlers
      websocketService.on('new_notification', handleNewNotification)
      websocketService.on('notification_read_sync', handleNotificationReadSync)
      websocketService.on('system_announcement', handleSystemAnnouncement)
      websocketService.on('notification_click', handleNotificationClick)

      // Request browser notification permission
      await websocketService.requestNotificationPermission()

      console.log('WebSocket initialized for notifications')
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }

  // Handle new notification from WebSocket
  const handleNewNotification = (notification: Notification) => {
    // Add to notifications list
    addNotification(notification)

    // Play sound if enabled (you could add sound preferences)
    playNotificationSound()
  }

  // Handle notification read sync from other sessions
  const handleNotificationReadSync = (data: { notificationId: number; readAt: string }) => {
    const notification = notifications.value.find(n => n.id === data.notificationId)
    if (notification && !notification.read_at) {
      notification.read_at = data.readAt
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  // Handle system announcements
  const handleSystemAnnouncement = (announcement: any) => {
    // You could show a special UI for system announcements
    console.log('System announcement received:', announcement)
  }

  // Handle notification click from browser notification
  const handleNotificationClick = (notification: Notification) => {
    // This would be handled by the router in the component
    console.log('Notification clicked:', notification)
  }

  // Play notification sound
  const playNotificationSound = () => {
    // Only play if preferences allow and user hasn't disabled sounds
    if (preferences.value?.sound_enabled) {
      try {
        // You could add a notification sound file to public folder
        const audio = new Audio('/notification-sound.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {
          // Ignore errors (user might not have interacted with page yet)
        })
      } catch (error) {
        // Ignore sound errors
      }
    }
  }

  // Cleanup WebSocket connection
  const cleanupWebSocket = () => {
    websocketService.off('new_notification', handleNewNotification)
    websocketService.off('notification_read_sync', handleNotificationReadSync)
    websocketService.off('system_announcement', handleSystemAnnouncement)
    websocketService.off('notification_click', handleNotificationClick)
    websocketService.disconnect()
  }

  // Periodic refresh of unread count (fallback for when WebSocket is not available)
  const startPeriodicRefresh = () => {
    const interval = setInterval(() => {
      // Only refresh if WebSocket is not connected
      if (!websocketService.isConnected) {
        fetchUnreadCount()
      }
    }, 60000) // Refresh every minute as fallback

    // Return cleanup function
    return () => clearInterval(interval)
  }

  return {
    // State
    notifications,
    unreadCount,
    preferences,
    loading,
    error,
    pagination,

    // Getters
    unreadNotifications,
    readNotifications,
    hasUnread,
    recentNotifications,

    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchPreferences,
    updatePreferences,
    addNotification,
    clearError,
    clearNotifications,
    initialize,
    initializeWebSocket,
    cleanupWebSocket,
    startPeriodicRefresh
  }
})
