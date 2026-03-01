const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const orderService = require('../services/orderService');
const productService = require('../services/productService');
const { successResponse, getPaginationMeta } = require('../utils/helpers');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../utils/constants');

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get system-wide statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const ordersWithTotal = await Order.find({ status: { $ne: 'cancelled' } });
    const totalRevenue = ordersWithTotal.reduce((sum, order) => sum + order.total, 0);

    const stats = {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };

    res.json(successResponse({ stats }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/dashboard/users:
 *   get:
 *     summary: Get recent users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const getRecentUsers = async (req, res, next) => {
  try {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

    const skip = (page - 1) * limit;
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments();

    res.json(
      successResponse({
        users,
        pagination: getPaginationMeta(page, limit, total),
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/dashboard/orders/recent:
 *   get:
 *     summary: Get recent orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const getRecentOrders = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;

    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(successResponse({ orders }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/dashboard/charts/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const getRevenueAnalytics = async (req, res, next) => {
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
      createdAt: { $gte: startDate },
      status: { $ne: 'cancelled' },
    }).sort({ createdAt: 1 });

    // Group by date
    const groupedData = {};
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!groupedData[date]) {
        groupedData[date] = 0;
      }
      groupedData[date] += order.total;
    });

    // Format for Chart.js
    const labels = Object.keys(groupedData);
    const data = labels.map((date) => groupedData[date]);

    res.json(successResponse({ labels, data }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/dashboard/charts/orders:
 *   get:
 *     summary: Get order analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const getOrderAnalytics = async (req, res, next) => {
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

    // Aggregate orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const labels = ordersByStatus.map((item) => item._id);
    const data = ordersByStatus.map((item) => item.count);

    res.json(successResponse({ labels, data }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const getAllOrders = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await orderService.getAllOrders(filters);

    res.json(
      successResponse({
        orders: result.orders,
        pagination: result.pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/orders/:id/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const order = await orderService.updateOrderStatus(req.params.id, status, {
      trackingNumber,
      estimatedDelivery,
    });

    res.json(successResponse({ order }, 'Order status updated'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/products:
 *   post:
 *     summary: Create new product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await productService.createProduct(productData);

    res.status(201).json(successResponse({ product }, 'Product created successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/products/:id:
 *   put:
 *     summary: Update product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const updateProduct = async (req, res, next) => {
  try {
    const updateData = req.body;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const product = await productService.updateProduct(req.params.id, updateData);

    res.json(successResponse({ product }, 'Product updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/products/:id:
 *   delete:
 *     summary: Delete product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);

    res.json(successResponse(null, 'Product deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/admin/products/:id/stock:
 *   patch:
 *     summary: Update product stock
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
const updateProductStock = async (req, res, next) => {
  try {
    const { stock } = req.body;

    const product = await productService.updateProductStock(req.params.id, stock);

    res.json(successResponse({ product }, 'Stock updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStats,
  getRecentUsers,
  getRecentOrders,
  getRevenueAnalytics,
  getOrderAnalytics,
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
};
