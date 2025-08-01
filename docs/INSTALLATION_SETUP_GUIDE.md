# SchedulaX Installation and Setup Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Database Setup](#database-setup)
4. [Backend Installation](#backend-installation)
5. [Frontend Installation](#frontend-installation)
6. [Environment Configuration](#environment-configuration)
7. [Initial System Setup](#initial-system-setup)
8. [Running the Application](#running-the-application)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10, macOS 10.15, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for package downloads

### Recommended Requirements
- **RAM**: 16GB for development with multiple services
- **CPU**: Multi-core processor (4+ cores)
- **Storage**: SSD for better performance
- **Network**: Stable broadband connection

## Prerequisites

### Required Software
1. **Node.js 18.0.0 or higher**
   ```bash
   # Check version
   node --version
   npm --version
   
   # Download from: https://nodejs.org/
   ```

2. **PostgreSQL 12.0 or higher**
   ```bash
   # Check version
   psql --version
   
   # Download from: https://www.postgresql.org/download/
   ```

3. **Git**
   ```bash
   # Check version
   git --version
   
   # Download from: https://git-scm.com/
   ```

### Optional Tools
- **Docker & Docker Compose** (for containerized deployment)
- **pgAdmin** (PostgreSQL GUI management)
- **Postman** (API testing)
- **VS Code** (recommended IDE)

## Database Setup

### 1. Install PostgreSQL
Follow the official PostgreSQL installation guide for your operating system.

### 2. Create Database
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database
CREATE DATABASE duty_roster;

-- Create application user
CREATE USER schedulax_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE duty_roster TO schedulax_user;

-- Exit psql
\q
```

### 3. Initialize Database Schema
```bash
# Navigate to project root
cd duty

# Run database setup script
psql -U schedulax_user -d duty_roster -f database/schema.sql

# Run initial data seeds (optional)
psql -U schedulax_user -d duty_roster -f database/seeds/initial_data.sql
```

### 4. Verify Database Setup
```bash
# Connect to verify
psql -U schedulax_user -d duty_roster

# List tables
\dt

# Check sample data
SELECT * FROM users LIMIT 5;
```

## Backend Installation

### 1. Navigate to Backend Directory
```bash
cd duty/backend
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration
Create `.env` file in the backend directory:
```bash
# Copy example environment file
cp .env.example .env

# Edit with your settings
nano .env
```

Required environment variables:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duty_roster
DB_USER=schedulax_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@schedulax.com

# Notification Settings
NOTIFICATION_RETENTION_DAYS=30
CLEANUP_INTERVAL_HOURS=24
```

### 4. Database Connection Test
```bash
# Test database connection
npm run test:db

# Or manually test
node -e "
const { sequelize } = require('./src/models');
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection failed:', err));
"
```

### 5. Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Verify server is running
curl http://localhost:3000/api/health
```

## Frontend Installation

### 1. Navigate to Frontend Directory
```bash
cd duty/frontend
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration
Create `.env.local` file in the frontend directory:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# Application Configuration
VITE_APP_NAME=SchedulaX
VITE_APP_VERSION=1.0.0

# Feature Flags (optional)
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_WEBSOCKETS=true
```

### 4. Start Frontend Development Server
```bash
# Development mode with hot reload
npm run dev

# Verify frontend is running
# Open browser to http://localhost:5173
```

### 5. Build for Production (Optional)
```bash
# Type check and build
npm run build

# Preview production build
npm run preview
```

## Environment Configuration

### Development Environment
For development, ensure both backend and frontend are running:
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- Database: `localhost:5432`

### Production Environment
For production deployment, update environment variables:
```env
# Backend .env
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
DB_SSL=true

# Frontend .env.production
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_WS_URL=https://api.your-domain.com
```

## Initial System Setup

### 1. Create System Administrator
Access the special system admin creation endpoint:
```bash
# Open browser to:
http://localhost:5173/iamasystemadmin

# Or use the backend API directly:
curl -X POST http://localhost:3000/api/auth/create-system-admin \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "System Administrator",
    "email": "admin@system.com",
    "password": "secure_password_123"
  }'
```

### 2. Login and Configure System
1. Login with system administrator credentials
2. Navigate to Enterprise Management
3. Create your first enterprise
4. Set up departments and users
5. Configure notification preferences

### 3. Test User Accounts
Use the provided test accounts from `USER_CREDENTIALS.md`:
- **System Admin**: `admin@system.com` / `password123`
- **Manager**: `humanresourcemanager@gmail.com` / `password123`
- **Employee**: `eng2@dt.com` / `password123`

## Running the Application

### Development Mode
```bash
# Terminal 1: Start backend
cd duty/backend
npm run dev

# Terminal 2: Start frontend
cd duty/frontend
npm run dev

# Terminal 3: Monitor logs (optional)
cd duty/backend
npm run logs
```

### Production Mode
```bash
# Build frontend
cd duty/frontend
npm run build

# Start backend in production
cd duty/backend
NODE_ENV=production npm start

# Serve frontend (using nginx or similar)
# Point web server to duty/frontend/dist/
```

### Using Docker (Alternative)
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Production Deployment

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install nginx (for frontend)
sudo apt-get install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Database Setup
```bash
# Configure PostgreSQL
sudo -u postgres createdb duty_roster
sudo -u postgres createuser schedulax_user
sudo -u postgres psql -c "ALTER USER schedulax_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE duty_roster TO schedulax_user;"
```

### 3. Application Deployment
```bash
# Clone repository
git clone <repository-url> /var/www/schedulax
cd /var/www/schedulax

# Install backend dependencies
cd backend
npm ci --production

# Build and install frontend
cd ../frontend
npm ci
npm run build

# Copy built files to nginx directory
sudo cp -r dist/* /var/www/html/
```

### 4. Process Management
```bash
# Start backend with PM2
cd /var/www/schedulax/backend
pm2 start src/server.js --name "schedulax-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Nginx Configuration
```nginx
# /etc/nginx/sites-available/schedulax
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. SSL Configuration (Recommended)
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U schedulax_user -d duty_roster -h localhost

# Common fixes:
# 1. Verify credentials in .env file
# 2. Check PostgreSQL is running
# 3. Verify firewall settings
# 4. Check pg_hba.conf for authentication
```

#### Backend Server Issues
```bash
# Check server logs
npm run logs

# Common fixes:
# 1. Verify all environment variables are set
# 2. Check port 3000 is not in use
# 3. Verify database connection
# 4. Check file permissions
```

#### Frontend Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Common fixes:
# 1. Update Node.js version
# 2. Clear npm cache: npm cache clean --force
# 3. Check for conflicting global packages
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /var/www/schedulax
chmod -R 755 /var/www/schedulax

# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
```

### Getting Help
- Check application logs in `backend/logs/`
- Review browser console for frontend errors
- Verify all services are running: `pm2 status`
- Check system resources: `htop` or `top`
- Review nginx logs: `sudo tail -f /var/log/nginx/error.log`

For additional support, refer to the project documentation or create an issue in the repository.
