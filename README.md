# Mango Order Management System - Backend API

A complete, production-ready Node.js/Express backend API for the Mango Order Management System. This API supports a full-featured e-commerce platform for selling mango products with user authentication, product management, order processing, and admin dashboard.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (User, Admin)
  - Password reset via email
  - Secure password hashing with bcrypt
  
- **Product Management**
  - CRUD operations for products
  - Product categories and filtering
  - Product search functionality
  - Product reviews and ratings
  - Featured products
  - Related products suggestions
  
- **Order Management**
  - Complete checkout process
  - Order history for users
  - Order status tracking
  - Order cancellation
  - Reorder functionality
  - Email notifications for order updates
  
- **Dashboard & Analytics**
  - User dashboard with order statistics
  - Admin dashboard with system-wide analytics
  - Revenue and order trend charts
  - Spending by category visualization
  
- **Security**
  - Helmet for security headers
  - CORS protection
  - Rate limiting
  - NoSQL injection prevention
  - Input validation and sanitization
  
- **Additional Features**
  - File upload for product images
  - Email notifications (order confirmation, status updates, etc.)
  - Mock payment processing
  - Comprehensive API documentation (Swagger)
  - Health check endpoint
  - Winston logging
  - Jest testing setup

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/ipasmo/mango-oms-backend.git
cd mango-oms-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory by copying from `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Application
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/mango-oms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=Mango OMS <noreply@mangooms.com>

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin Credentials (for seeding)
ADMIN_EMAIL=admin@mangooms.com
ADMIN_PASSWORD=Admin@123
```

### 4. Start MongoDB

#### 4.1 Install MongoDB & Studio 3T Community Edition
- Link to download MongoDB Community Edition: https://www.mongodb.com/try/download/community-edition/releases
- Link to download Studio 3T Community Edition: https://robomongo.org/download


#### 4.2 Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
CMD\>mongod --dbpath D:\\Mone\\installations\\mongodb-win32-x86_64-windows-8.2.5\\data\\db --port 27017 --logpath D:\\Mone\\installations\\mongodb-win32-x86_64-windows-8.2.5\\logs\\mongod.log

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### 5. Seed the Database

Populate the database with initial data (categories, products, admin user):

```bash
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@ipasmo.com`
- Password: `Admin@123`

### 6. Start the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm run start        # Start production server

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Database
npm run seed         # Seed database with initial data
npm run seed:undo    # Clear all seeded data

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🔗 API Documentation

Once the server is running, access the interactive API documentation:

**Swagger UI:** `http://localhost:5000/api-docs`

### Main API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh` - Refresh access token

#### Products (`/api/products`)
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products
- `GET /api/products/categories` - Get all categories
- `GET /api/products/category/:categoryId` - Get products by category
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Add product review
- `GET /api/products/:id/availability` - Check product availability
- `GET /api/products/:id/related` - Get related products

#### Orders (`/api/orders`)
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/reorder` - Reorder from existing order

#### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Get user statistics
- `GET /api/dashboard/orders/recent` - Get recent orders
- `GET /api/dashboard/charts/orders` - Get order trends
- `GET /api/dashboard/charts/spending` - Get spending by category

#### Admin (`/api/admin`)
- `GET /api/admin/dashboard/stats` - Get system statistics
- `GET /api/admin/dashboard/users` - Get users list
- `GET /api/admin/dashboard/orders/recent` - Get recent orders
- `GET /api/admin/dashboard/charts/revenue` - Get revenue analytics
- `GET /api/admin/dashboard/charts/orders` - Get order analytics
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/status` - Update order status
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `PATCH /api/admin/products/:id/stock` - Update product stock

#### Health Check
- `GET /api/health` - Check API health status

## 🗄️ Database Schema

### Models

- **User** - User accounts with authentication
- **Category** - Product categories
- **Product** - Mango products with pricing and inventory
- **Order** - Customer orders with items and shipping
- **Review** - Product reviews and ratings
- **RefreshToken** - JWT refresh tokens for authentication

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Using Docker

```bash
# Build image
docker build -t mango-oms-backend .

# Run container
docker run -p 5000:5000 --env-file .env mango-oms-backend
```

## 🚀 Production Deployment

### Heroku

```bash
# Create Heroku app
heroku create mango-oms-backend

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
# Set other environment variables...

# Deploy
git push heroku main

# Seed database
heroku run npm run seed
```

### AWS/DigitalOcean/VPS

1. **Setup Server**
   ```bash
   # Install Node.js and MongoDB
   # Clone repository
   # Install dependencies
   npm ci --only=production
   ```

2. **Use PM2 for Process Management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name mango-oms-backend
   pm2 startup
   pm2 save
   ```

3. **Setup Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## 📊 Project Structure

```
mango-oms-backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── seeders/         # Database seeders
│   └── utils/           # Utility functions
├── tests/              # Test files
├── uploads/            # Uploaded files
├── logs/              # Log files
├── .env.example       # Environment variables template
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
└── server.js         # Application entry point
```

## 🔒 Security Features

- **Password Security**: Bcrypt hashing with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent brute force attacks
- **Input Validation**: Comprehensive request validation
- **NoSQL Injection Prevention**: MongoDB sanitization
- **Security Headers**: Helmet middleware
- **CORS Protection**: Configurable CORS policy

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features

## 📝 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Create an issue on GitHub
- Email: support@mangooms.com

## 🙏 Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- All open-source contributors

---

**Made with ❤️ for Mango Lovers**
