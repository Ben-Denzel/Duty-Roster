import { io, Socket } from 'socket.io-client'
import type { Notification } from './api'

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  private eventHandlers: Map<string, Function[]> = new Map()

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve()
        return
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'))
        return
      }

      this.isConnecting = true

      const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'

      this.socket = io(serverUrl, {
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      })

      // Connection successful
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server')
        this.isConnecting = false
        this.reconnectAttempts = 0
        resolve()
      })

      // Connection error
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error)
        this.isConnecting = false
        reject(error)
      })

      // Disconnection
      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason)
        
        // Attempt to reconnect if disconnection was not intentional
        if (reason === 'io server disconnect') {
          // Server disconnected us, don't reconnect automatically
          return
        }
        
        this.attemptReconnect(token)
      })

      // Handle new notifications
      this.socket.on('new_notification', (data) => {
        this.handleNewNotification(data)
      })

      // Handle notification read sync
      this.socket.on('notification_read_sync', (data) => {
        this.handleNotificationReadSync(data)
      })

      // Handle system announcements
      this.socket.on('system_announcement', (data) => {
        this.handleSystemAnnouncement(data)
      })

      // Handle connection confirmation
      this.socket.on('connected', (data) => {
        console.log('WebSocket connection confirmed:', data)
      })
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.reconnectAttempts = 0
    this.isConnecting = false
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts)
    this.reconnectAttempts++

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect(token).catch((error) => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  /**
   * Handle new notification
   */
  private handleNewNotification(data: { notification: Notification; timestamp: string }): void {
    console.log('Received new notification:', data.notification)
    
    // Emit to registered handlers
    this.emit('new_notification', data.notification)
    
    // Show browser notification if permission granted
    this.showBrowserNotification(data.notification)
  }

  /**
   * Handle notification read sync
   */
  private handleNotificationReadSync(data: { notificationId: number; readAt: string }): void {
    console.log('Notification read sync:', data)
    this.emit('notification_read_sync', data)
  }

  /**
   * Handle system announcement
   */
  private handleSystemAnnouncement(data: { announcement: any; timestamp: string }): void {
    console.log('System announcement:', data.announcement)
    this.emit('system_announcement', data.announcement)
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification): void {
    // Check if browser notifications are supported and permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: notification.priority === 'urgent'
      })

      // Auto-close after 5 seconds unless it's urgent
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close()
        }, 5000)
      }

      // Handle click
      browserNotification.onclick = () => {
        window.focus()
        browserNotification.close()
        
        // Navigate to action URL if available
        if (notification.action_url) {
          // Emit navigation event
          this.emit('notification_click', notification)
        }
      }
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Browser notifications not supported')
      return 'denied'
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('notification_read', { notificationId })
    }
  }

  /**
   * Register event handler
   */
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }
    this.eventHandlers.get(event)!.push(handler)
  }

  /**
   * Unregister event handler
   */
  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  /**
   * Emit event to registered handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error('Error in event handler:', error)
        }
      })
    }
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Get connection status
   */
  get connectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (this.isConnecting) return 'connecting'
    if (this.socket?.connected) return 'connected'
    return 'disconnected'
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()
export default websocketService
