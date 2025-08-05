const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket.id
    this.userSockets = new Map(); // socket.id -> userId
  }

  /**
   * Initialize Socket.IO server
   * @param {http.Server} server - HTTP server instance
   */
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);
          
          // In development, allow any origin for easier debugging
          if (process.env.NODE_ENV === 'development') {
            console.log(`🌐 WebSocket Development mode - allowing origin: ${origin}`);
            return callback(null, true);
          }
          
          const allowedOrigins = [
            process.env.FRONTEND_URL || "http://localhost:5173",
            'https://schedulax-frontend.onrender.com',
            'https://schedulax.vercel.app',
            'https://schedulax-frontend.vercel.app',
            'https://schedulax.herokuapp.com',
            'https://schedulax.netlify.app',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:8080',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000'
          ];
          
          if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            console.log(`🚫 WebSocket CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded JWT:', decoded); // Debug log

        // Try different possible user ID fields
        const userId = decoded.userId || decoded.id || decoded.user_id;

        if (!userId) {
          console.error('No user ID found in token:', decoded);
          return next(new Error('Invalid token: no user ID'));
        }

        // Get user from database
        const user = await User.findByPk(userId);
        if (!user) {
          console.error('User not found with ID:', userId);
          return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.userId = user.id;
        socket.user = user;

        console.log(`WebSocket authenticated user: ${user.id} (${user.email})`);
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Handle connections
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    console.log('WebSocket service initialized');
  }

  /**
   * Handle new socket connection
   * @param {Socket} socket - Socket instance
   */
  handleConnection(socket) {
    const userId = socket.userId;
    
    console.log(`User ${userId} connected via WebSocket`);
    
    // Store connection mapping
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Join user to their department room if they have one
    if (socket.user.department_id) {
      socket.join(`department_${socket.user.department_id}`);
    }

    // Join user to their enterprise room if they have one
    if (socket.user.enterprise_id) {
      socket.join(`enterprise_${socket.user.enterprise_id}`);
    }

    // Join user to role-based rooms
    socket.join(`role_${socket.user.role}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Handle notification acknowledgment
    socket.on('notification_read', (data) => {
      this.handleNotificationRead(socket, data);
    });

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to notification service',
      userId: userId
    });
  }

  /**
   * Handle socket disconnection
   * @param {Socket} socket - Socket instance
   */
  handleDisconnection(socket) {
    const userId = socket.userId;
    
    console.log(`User ${userId} disconnected from WebSocket`);
    
    // Remove connection mapping
    this.connectedUsers.delete(userId);
    this.userSockets.delete(socket.id);
  }

  /**
   * Handle notification read acknowledgment
   * @param {Socket} socket - Socket instance
   * @param {Object} data - Notification data
   */
  handleNotificationRead(socket, data) {
    const { notificationId } = data;
    console.log(`User ${socket.userId} marked notification ${notificationId} as read`);
    
    // You could emit this to other connected sessions of the same user
    // to sync read status across devices
    this.emitToUser(socket.userId, 'notification_read_sync', {
      notificationId,
      readAt: new Date().toISOString()
    }, socket.id); // Exclude current socket
  }

  /**
   * Send notification to a specific user
   * @param {number} userId - User ID
   * @param {Object} notification - Notification data
   */
  sendNotificationToUser(userId, notification) {
    if (!this.io) {
      console.warn('WebSocket service not initialized');
      return;
    }

    this.io.to(`user_${userId}`).emit('new_notification', {
      notification,
      timestamp: new Date().toISOString()
    });

    console.log(`Sent notification to user ${userId}: ${notification.title}`);
  }

  /**
   * Send notification to multiple users
   * @param {number[]} userIds - Array of user IDs
   * @param {Object} notification - Notification data
   */
  sendNotificationToUsers(userIds, notification) {
    if (!this.io) {
      console.warn('WebSocket service not initialized');
      return;
    }

    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Send notification to all users in a department
   * @param {number} departmentId - Department ID
   * @param {Object} notification - Notification data
   */
  sendNotificationToDepartment(departmentId, notification) {
    if (!this.io) {
      console.warn('WebSocket service not initialized');
      return;
    }

    this.io.to(`department_${departmentId}`).emit('new_notification', {
      notification,
      timestamp: new Date().toISOString()
    });

    console.log(`Sent notification to department ${departmentId}: ${notification.title}`);
  }

  /**
   * Send notification to all users in an enterprise
   * @param {number} enterpriseId - Enterprise ID
   * @param {Object} notification - Notification data
   */
  sendNotificationToEnterprise(enterpriseId, notification) {
    if (!this.io) {
      console.warn('WebSocket service not initialized');
      return;
    }

    this.io.to(`enterprise_${enterpriseId}`).emit('new_notification', {
      notification,
      timestamp: new Date().toISOString()
    });

    console.log(`Sent notification to enterprise ${enterpriseId}: ${notification.title}`);
  }

  /**
   * Send notification to users with specific role
   * @param {string} role - User role
   * @param {Object} notification - Notification data
   */
  sendNotificationToRole(role, notification) {
    if (!this.io) {
      console.warn('WebSocket service not initialized');
      return;
    }

    this.io.to(`role_${role}`).emit('new_notification', {
      notification,
      timestamp: new Date().toISOString()
    });

    console.log(`Sent notification to role ${role}: ${notification.title}`);
  }

  /**
   * Emit event to specific user
   * @param {number} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @param {string} excludeSocketId - Socket ID to exclude (optional)
   */
  emitToUser(userId, event, data, excludeSocketId = null) {
    if (!this.io) {
      console.warn('WebSocket service not initialized');
      return;
    }

    const socketId = this.connectedUsers.get(userId);
    if (socketId && socketId !== excludeSocketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Get connected users count
   * @returns {number} Number of connected users
   */
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  /**
   * Check if user is connected
   * @param {number} userId - User ID
   * @returns {boolean} True if user is connected
   */
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get all connected users
   * @returns {number[]} Array of connected user IDs
   */
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Broadcast system announcement
   * @param {Object} announcement - Announcement data
   */
  broadcastSystemAnnouncement(announcement) {
    if (!this.io) {
      console.warn('WebSocket service not initialized');
      return;
    }

    this.io.emit('system_announcement', {
      announcement,
      timestamp: new Date().toISOString()
    });

    console.log(`Broadcasted system announcement: ${announcement.title}`);
  }
}

module.exports = new WebSocketService();
