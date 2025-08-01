# SchedulaX Backend Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Environment Configuration](#environment-configuration)
8. [Database Setup](#database-setup)
9. [SSL Configuration](#ssl-configuration)
10. [Monitoring & Logging](#monitoring--logging)
11. [Backup & Recovery](#backup--recovery)
12. [Troubleshooting](#troubleshooting)

## Overview

This guide covers the deployment of the SchedulaX backend Node.js application in various environments, from development to production. The backend is built with Express.js and requires PostgreSQL database and proper environment configuration.

### Deployment Options
- **Development**: Local development with hot reload
- **Production**: Traditional server deployment with PM2
- **Docker**: Containerized deployment
- **Cloud**: Platform-as-a-Service deployment (Heroku, Railway, etc.)

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0.0 or higher
- **PostgreSQL**: Version 12.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: For code deployment
- **PM2**: For production process management (optional)

### Server Requirements
- **RAM**: Minimum 1GB, recommended 2GB+
- **CPU**: 1 core minimum, 2+ cores recommended
- **Storage**: 10GB minimum for application and logs
- **Network**: Stable internet connection

## Development Deployment

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd duty/backend
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Environment Configuration
Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duty_roster
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-development-jwt-secret
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email Configuration (optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="SchedulaX Dev <dev@schedulax.com>"
```

#### 4. Database Setup
```bash
# Create database
createdb duty_roster

# Run database setup
npm run db:setup

# Setup notification system
npm run notifications:setup
```

#### 5. Start Development Server
```bash
# Start with hot reload
npm run dev

# Or start normally
npm start
```

#### 6. Verify Installation
```bash
# Test API endpoint
curl http://localhost:3000/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

## Production Deployment

### Traditional Server Deployment

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install PM2 globally
sudo npm install -g pm2

# Create application user
sudo useradd -m -s /bin/bash schedulax
sudo usermod -aG sudo schedulax
```

#### 2. Database Setup
```bash
# Switch to postgres user
sudo -u postgres psql

-- Create database and user
CREATE DATABASE duty_roster;
CREATE USER schedulax_user WITH PASSWORD 'secure_production_password';
GRANT ALL PRIVILEGES ON DATABASE duty_roster TO schedulax_user;
\q
```

#### 3. Application Deployment
```bash
# Switch to application user
sudo su - schedulax

# Clone repository
git clone <repository-url> /home/schedulax/schedulax
cd /home/schedulax/schedulax/backend

# Install dependencies
npm ci --production

# Create production environment file
cp .env.example .env
```

#### 4. Production Environment Configuration
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duty_roster
DB_USER=schedulax_user
DB_PASSWORD=secure_production_password

# JWT Configuration
JWT_SECRET=super-secure-production-jwt-secret-key
JWT_EXPIRES_IN=1h

# Server Configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Email Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=secure_email_password
SMTP_FROM="SchedulaX <noreply@your-domain.com>"

# Security
CORS_ORIGIN=https://your-domain.com
```

#### 5. Database Migration
```bash
# Run database setup
npm run db:setup

# Setup notification system
npm run notifications:setup

# Verify database connection
node -e "
const { sequelize } = require('./src/models');
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database error:', err));
"
```

#### 6. PM2 Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'schedulax-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u schedulax --hp /home/schedulax
```

#### 7. Reverse Proxy Setup (Nginx)
```bash
# Install Nginx
sudo apt-get install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/schedulax << EOF
server {
    listen 80;
    server_name your-domain.com;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/schedulax /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Docker Deployment

### Dockerfile
Create `Dockerfile` in backend directory:
```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=duty_roster
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - postgres
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=duty_roster
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Docker Commands
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

## Cloud Deployment

### Heroku Deployment

#### 1. Prepare Application
```bash
# Create Procfile
echo "web: npm start" > Procfile

# Create package.json scripts
npm pkg set scripts.start="node src/server.js"
npm pkg set scripts.heroku-postbuild="npm run db:setup"
```

#### 2. Heroku Setup
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create application
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-jwt-secret
heroku config:set FRONTEND_URL=https://your-frontend-domain.com

# Deploy
git push heroku main
```

### Railway Deployment

#### 1. Railway Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### 2. Environment Variables
Set in Railway dashboard:
- `NODE_ENV=production`
- `JWT_SECRET=your-jwt-secret`
- `FRONTEND_URL=https://your-domain.com`
- Database variables (auto-configured with Railway PostgreSQL)

## Environment Configuration

### Environment Variables Reference
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duty_roster
DB_USER=postgres
DB_PASSWORD=password
DB_SSL=false
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
SMTP_FROM="SchedulaX <noreply@schedulax.com>"

# Features
ENABLE_WEBSOCKETS=true
ENABLE_EMAIL_NOTIFICATIONS=true
NOTIFICATION_RETENTION_DAYS=30
```

### Security Configuration
```env
# Security headers
HELMET_ENABLED=true
CORS_CREDENTIALS=true

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session security
SESSION_SECRET=your-session-secret
SECURE_COOKIES=true
```

## Database Setup

### Production Database Configuration

#### PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt-get install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib

# macOS
brew install postgresql
```

#### Database Security
```bash
# Secure PostgreSQL installation
sudo -u postgres psql

-- Change postgres user password
ALTER USER postgres PASSWORD 'secure_password';

-- Create application database and user
CREATE DATABASE duty_roster;
CREATE USER schedulax_user WITH PASSWORD 'secure_app_password';
GRANT ALL PRIVILEGES ON DATABASE duty_roster TO schedulax_user;

-- Restrict permissions
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO schedulax_user;
```

#### Connection Pool Configuration
```javascript
// config/database.js - Production settings
const sequelize = new Sequelize({
  // ... other config
  pool: {
    max: 20,        // Maximum connections
    min: 5,         // Minimum connections
    acquire: 60000, // Maximum time to get connection
    idle: 10000,    // Maximum idle time
    evict: 1000     // Check for idle connections interval
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});
```

### Database Migration in Production
```bash
# Backup before migration
pg_dump -h localhost -U schedulax_user duty_roster > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npm run db:migrate

# Verify migration
npm run db:migrate:status
```

## SSL Configuration

### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Logging

### Application Logging
```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'schedulax-backend' },
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: 'logs/combined.log'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs schedulax-backend

# Restart application
pm2 restart schedulax-backend

# Reload with zero downtime
pm2 reload schedulax-backend

# Show process information
pm2 show schedulax-backend
```

### Health Check Endpoint
```javascript
// routes/health.js
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();

    // Check memory usage
    const memUsage = process.memoryUsage();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
      },
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      error: error.message
    });
  }
});
```

### Log Rotation
```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/schedulax << EOF
/home/schedulax/schedulax/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 schedulax schedulax
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/schedulax/backups"
DB_NAME="duty_roster"
DB_USER="schedulax_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump -h localhost -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C /home/schedulax schedulax

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Backup Automation
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /home/schedulax/scripts/backup.sh >> /home/schedulax/logs/backup.log 2>&1
```

### Recovery Procedure
```bash
# Stop application
pm2 stop schedulax-backend

# Restore database
gunzip -c db_backup_YYYYMMDD_HHMMSS.sql.gz | psql -h localhost -U schedulax_user duty_roster

# Restore application files (if needed)
tar -xzf app_backup_YYYYMMDD_HHMMSS.tar.gz -C /home/schedulax

# Start application
pm2 start schedulax-backend
```

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U schedulax_user -d duty_roster

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs schedulax-backend

# Check application logs
tail -f logs/error.log

# Check port availability
netstat -tulpn | grep :3000

# Check environment variables
pm2 env 0
```

#### Memory Issues
```bash
# Check memory usage
free -h
pm2 monit

# Restart application
pm2 restart schedulax-backend

# Increase memory limit
pm2 delete schedulax-backend
pm2 start ecosystem.config.js --node-args="--max-old-space-size=2048"
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

### Performance Optimization

#### Database Optimization
```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyze tables
ANALYZE;

-- Vacuum database
VACUUM ANALYZE;
```

#### Application Optimization
```javascript
// Enable compression
app.use(compression());

// Set proper cache headers
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    res.set('Cache-Control', 'no-cache');
  }
  next();
});
```

### Monitoring Commands
```bash
# System monitoring
htop
iostat -x 1
df -h

# Application monitoring
pm2 monit
pm2 logs --lines 100

# Database monitoring
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

---

## Security Checklist

### Production Security
- [ ] Change default passwords
- [ ] Enable SSL/TLS encryption
- [ ] Configure firewall rules
- [ ] Set up fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Environment variable security
- [ ] Log monitoring and alerting

### Application Security
- [ ] JWT secret rotation
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation
- [ ] SQL injection protection
- [ ] XSS protection headers
- [ ] Regular dependency updates

For additional deployment support, refer to the platform-specific documentation and best practices guides.
```
