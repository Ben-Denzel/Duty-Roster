import { ref } from 'vue'
import type { Toast } from '@/components/ToastNotification.vue'

// Global toast state
const toastComponent = ref<any>(null)

export function useToast() {
  const setToastComponent = (component: any) => {
    toastComponent.value = component
  }

  const showToast = (toast: Omit<Toast, 'id'>) => {
    if (toastComponent.value) {
      return toastComponent.value.addToast(toast)
    } else {
      console.warn('Toast component not initialized')
      return null
    }
  }

  const showSuccess = (title: string, message?: string, duration?: number) => {
    return showToast({
      type: 'success',
      title,
      message,
      duration
    })
  }

  const showError = (title: string, message?: string, duration?: number) => {
    return showToast({
      type: 'error',
      title,
      message,
      duration: duration || 8000 // Errors stay longer by default
    })
  }

  const showWarning = (title: string, message?: string, duration?: number) => {
    return showToast({
      type: 'warning',
      title,
      message,
      duration
    })
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    return showToast({
      type: 'info',
      title,
      message,
      duration
    })
  }

  const showNotificationToast = (notification: any) => {
    const priorityDuration = {
      urgent: 10000,
      high: 8000,
      normal: 5000,
      low: 3000
    }

    return showToast({
      type: notification.priority === 'urgent' ? 'error' : 
            notification.priority === 'high' ? 'warning' : 'info',
      title: notification.title,
      message: notification.message,
      duration: priorityDuration[notification.priority as keyof typeof priorityDuration],
      action: notification.action_url ? {
        label: 'View',
        handler: () => {
          // This would be handled by the router
          window.location.href = notification.action_url
        }
      } : undefined
    })
  }

  const removeToast = (id: string) => {
    if (toastComponent.value) {
      toastComponent.value.removeToast(id)
    }
  }

  const clearAllToasts = () => {
    if (toastComponent.value) {
      toastComponent.value.clearAll()
    }
  }

  return {
    setToastComponent,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotificationToast,
    removeToast,
    clearAllToasts
  }
}
