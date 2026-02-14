const orderService = require('../services/orderService');
const { successResponse } = require('../utils/helpers');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order (checkout)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
const createOrder = async (req, res, next) => {
  try {
    const orderData = {
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes,
    };

    const order = await orderService.createOrder(req.user._id, orderData);

    res.status(201).json(successResponse({ order }, 'Order created successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get user's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
const getUserOrders = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };

    const result = await orderService.getUserOrders(req.user._id, filters);

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
 * /api/orders/:id:
 *   get:
 *     summary: Get single order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user._id);

    res.json(successResponse({ order }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders/:id/cancel:
 *   patch:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await orderService.cancelOrder(req.params.id, req.user._id, reason);

    res.json(successResponse({ order }, 'Order cancelled successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders/:id/reorder:
 *   post:
 *     summary: Create new order from existing order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 */
const reorderOrder = async (req, res, next) => {
  try {
    const order = await orderService.reorderOrder(req.params.id, req.user._id);

    res.status(201).json(successResponse({ order }, 'Order created successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  reorderOrder,
};
