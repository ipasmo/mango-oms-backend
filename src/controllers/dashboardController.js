const orderService = require('../services/orderService');
const Order = require('../models/Order');
const { successResponse } = require('../utils/helpers');

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get user dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
const getUserStats = async (req, res, next) => {
  try {
    const stats = await orderService.getUserDashboardStats(req.user._id);

    res.json(successResponse({ stats }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/dashboard/orders/recent:
 *   get:
 *     summary: Get recent orders
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
const getRecentOrders = async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;

    const orders = await orderService.getRecentUserOrders(req.user._id, limit);

    res.json(successResponse({ orders }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/dashboard/charts/orders:
 *   get:
 *     summary: Get order trends data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
const getOrderTrends = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get orders in date range
    const orders = await Order.find({
      user: req.user._id,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    // Group by date
    const groupedData = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = { count: 0, total: 0 };
      }
      groupedData[date].count += 1;
      groupedData[date].total += order.total;
    });

    // Format for Chart.js
    const labels = Object.keys(groupedData);
    const datasets = [
      {
        label: 'Orders',
        data: labels.map((date) => groupedData[date].count),
      },
      {
        label: 'Total Amount',
        data: labels.map((date) => groupedData[date].total),
      },
    ];

    res.json(successResponse({ labels, datasets }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/dashboard/charts/spending:
 *   get:
 *     summary: Get spending overview by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 */
const getSpendingByCategory = async (req, res, next) => {
  try {
    // Aggregate spending by category
    const spendingData = await Order.aggregate([
      {
        $match: {
          user: req.user._id,
          status: { $ne: 'cancelled' },
        },
      },
      {
        $unwind: '$items',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      {
        $unwind: '$productInfo',
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $group: {
          _id: '$categoryInfo.name',
          total: { $sum: '$items.total' },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    const labels = spendingData.map((item) => item._id);
    const values = spendingData.map((item) => item.total);

    res.json(successResponse({ labels, values }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserStats,
  getRecentOrders,
  getOrderTrends,
  getSpendingByCategory,
};
