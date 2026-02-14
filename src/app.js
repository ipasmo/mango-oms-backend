const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// HTTP request logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Rate limiting
app.use('/api', apiLimiter);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Mango OMS API',
    version: '1.0.0',
    docs: '/api-docs',
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
