const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const { validate, body, param } = require('../utils/validators');
const { isValidOrderStatus } = require('../utils/validators');
const { USER_ROLES } = require('../utils/constants');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin endpoints
 */

// All routes require authentication and admin role
router.use(auth);
router.use(roleCheck(USER_ROLES.ADMIN));

// Dashboard routes
router.get('/dashboard/stats', adminController.getSystemStats);
router.get('/dashboard/users', adminController.getRecentUsers);
router.get('/dashboard/orders/recent', adminController.getRecentOrders);
router.get('/dashboard/charts/revenue', adminController.getRevenueAnalytics);
router.get('/dashboard/charts/orders', adminController.getOrderAnalytics);

// Order management routes
router.get('/orders', adminController.getAllOrders);

router.patch(
  '/orders/:id/status',
  validate([
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status')
      .custom(isValidOrderStatus)
      .withMessage(
        'Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled'
      ),
  ]),
  adminController.updateOrderStatus
);

// Product management routes
router.post(
  '/products',
  upload.array('images', 5),
  validate([
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isMongoId().withMessage('Valid category ID is required'),
    body('prices.3kg').isFloat({ min: 0 }).withMessage('Price for 3kg is required'),
    body('prices.5kg').isFloat({ min: 0 }).withMessage('Price for 5kg is required'),
    body('prices.10kg').isFloat({ min: 0 }).withMessage('Price for 10kg is required'),
    body('prices.20kg').isFloat({ min: 0 }).withMessage('Price for 20kg is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ]),
  adminController.createProduct
);

router.put(
  '/products/:id',
  upload.array('images', 5),
  validate([param('id').isMongoId().withMessage('Invalid product ID')]),
  adminController.updateProduct
);

router.delete(
  '/products/:id',
  validate([param('id').isMongoId().withMessage('Invalid product ID')]),
  adminController.deleteProduct
);

router.patch(
  '/products/:id/stock',
  validate([
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  ]),
  adminController.updateProductStock
);

module.exports = router;
