# Deployment Guide

Comprehensive guide for deploying Mango OMS Backend to various platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Heroku Deployment](#heroku-deployment)
- [AWS Deployment](#aws-deployment)
- [DigitalOcean Deployment](#digitalocean-deployment)
- [Production Checklist](#production-checklist)
- [Monitoring & Logging](#monitoring--logging)

## Prerequisites

- Node.js 18+
- MongoDB 5.0+
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)
- Email service (Gmail, SendGrid, or Mailgun)

## Environment Variables

Create production `.env` file with secure values:

```env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mango-oms

# JWT (Generate strong secrets)
JWT_SECRET=<generate-strong-secret-key>
JWT_REFRESH_SECRET=<generate-strong-refresh-key>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=<your-sendgrid-api-key>
EMAIL_FROM=Mango OMS <noreply@yourdomain.com>

# Frontend
FRONTEND_URL=https://yourdomain.com

# Uploads
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=5

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<secure-password>
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Docker Deployment

### 1. Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/ipasmo/mango-oms-backend.git
cd mango-oms-backend

# Create .env file
cp .env.example .env
# Edit .env with production values

# Build and start services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Run database seed
docker-compose exec backend npm run seed
```

### 2. Using Docker Only

```bash
# Build image
docker build -t mango-oms-backend:latest .

# Run MongoDB
docker run -d \
  --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:7.0

# Run backend
docker run -d \
  --name mango-oms-backend \
  --link mongodb:mongodb \
  -p 5000:5000 \
  --env-file .env \
  -v ./uploads:/usr/src/app/uploads \
  mango-oms-backend:latest
```

## Heroku Deployment

### 1. Setup Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create mango-oms-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox
```

### 2. Configure Environment

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
heroku config:set JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
heroku config:set FRONTEND_URL=https://your-frontend.herokuapp.com
# Set other environment variables...
```

### 3. Deploy

```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/mango-oms-backend.git

# Deploy
git push heroku main

# Run migrations
heroku run npm run seed

# Check logs
heroku logs --tail
```

### 4. Scale

```bash
# Scale dynos
heroku ps:scale web=1

# Upgrade to hobby dyno for better performance
heroku ps:resize web=hobby
```

## AWS Deployment

### 1. EC2 Instance Setup

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/ipasmo/mango-oms-backend.git
cd mango-oms-backend

# Install dependencies
npm ci --only=production

# Create .env file
cp .env.example .env
nano .env  # Edit with production values

# Run database seed
npm run seed

# Start with PM2
pm2 start server.js --name mango-oms-backend
pm2 startup
pm2 save
```

### 3. Setup Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/mango-oms
```

Add configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mango-oms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## DigitalOcean Deployment

### 1. Create Droplet

1. Choose Ubuntu 22.04 LTS
2. Select appropriate size (Basic: $12/month recommended)
3. Add SSH key
4. Create droplet

### 2. Follow AWS EC2 Setup Steps

The deployment process is identical to AWS EC2.

### 3. Setup Firewall

```bash
# Enable firewall
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
```

## Production Checklist

### Security

- [ ] Use strong JWT secrets (64+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Use helmet for security headers

### Database

- [ ] Use MongoDB Atlas or managed MongoDB
- [ ] Enable authentication
- [ ] Create database backups
- [ ] Set up indexes
- [ ] Monitor database performance

### Application

- [ ] Set up process manager (PM2)
- [ ] Configure logging (Winston)
- [ ] Set up error tracking (Sentry)
- [ ] Enable health checks
- [ ] Configure proper CORS origins

### Infrastructure

- [ ] Use reverse proxy (Nginx)
- [ ] Enable SSL/TLS
- [ ] Set up load balancer (if needed)
- [ ] Configure CDN for static files
- [ ] Set up monitoring

### Email

- [ ] Use production email service
- [ ] Configure SPF/DKIM records
- [ ] Test email delivery
- [ ] Set up email templates

## Monitoring & Logging

### PM2 Monitoring

```bash
# View logs
pm2 logs mango-oms-backend

# Monitor processes
pm2 monit

# Generate startup script
pm2 startup
pm2 save
```

### Log Files

Logs are stored in `logs/` directory:
- `error.log`: Error logs
- `combined.log`: All logs

### Health Check

Monitor API health:
```bash
curl http://localhost:5000/api/health
```

### Sentry Integration (Optional)

```bash
npm install @sentry/node

# Add to server.js
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'your-sentry-dsn' });
```

## Backup Strategy

### Database Backup

```bash
# Manual backup
mongodump --uri="mongodb://username:password@host:port/database" --out=/backup/$(date +%Y%m%d)

# Automated backup (crontab)
0 2 * * * mongodump --uri="$MONGODB_URI" --out=/backup/$(date +\%Y\%m\%d)
```

### File Backup

```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs mango-oms-backend

# Check process status
pm2 status

# Restart application
pm2 restart mango-oms-backend
```

### Database Connection Issues

```bash
# Test MongoDB connection
mongosh "mongodb://username:password@host:port/database"

# Check MongoDB status
sudo systemctl status mongod
```

### High Memory Usage

```bash
# Check memory usage
pm2 monit

# Restart with memory limit
pm2 start server.js --name mango-oms-backend --max-memory-restart 500M
```

## Scaling

### Horizontal Scaling

Use PM2 cluster mode:
```bash
pm2 start server.js -i max --name mango-oms-backend
```

### Database Scaling

- Use MongoDB Atlas auto-scaling
- Enable sharding for large datasets
- Add read replicas

## Support

For deployment issues:
- Check logs: `pm2 logs`
- Review docs: `/api-docs`
- Contact support: support@mangooms.com
