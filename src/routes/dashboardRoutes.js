const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: User dashboard endpoints
 */

// All routes require authentication
router.use(auth);

router.get('/stats', dashboardController.getUserStats);
router.get('/orders/recent', dashboardController.getRecentOrders);
router.get('/charts/orders', dashboardController.getOrderTrends);
router.get('/charts/spending', dashboardController.getSpendingByCategory);

module.exports = router;
