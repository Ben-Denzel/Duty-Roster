const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Initialize database models
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Duty Roster API is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const enterpriseRoutes = require('./routes/enterprises');
const departmentRoutes = require('./routes/departments');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const shiftTemplateRoutes = require('./routes/shiftTemplates');
const rosterRoutes = require('./routes/rosters');
const shiftRoutes = require('./routes/shifts');
const shiftManagementRoutes = require('./routes/shiftManagement');
const conflictRoutes = require('./routes/conflicts');
const approvalRoutes = require('./routes/approvals');
const employeeRoutes = require('./routes/employee');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/enterprises', enterpriseRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/shift-templates', shiftTemplateRoutes);
app.use('/api/rosters', rosterRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/shift-management', shiftManagementRoutes);
app.use('/api/conflicts', conflictRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/employee', employeeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server with database connection
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized successfully.');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    console.error('💡 Make sure PostgreSQL is running and database exists');
    process.exit(1);
  }
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;
