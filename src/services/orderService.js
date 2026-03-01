const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { generateOrderNumber, getPaginationMeta } = require('../utils/helpers');
const { TAX_RATE, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } = require('../utils/constants');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../utils/constants');
const emailService = require('./emailService');

/**
 * Create new order
 */
const createOrder = async (userId, orderData) => {
  const { items, shippingAddress, paymentMethod, notes } = orderData;

  // Validate and process items
  const processedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw {
        statusCode: 404,
        message: `Product ${item.product} not found`,
      };
    }

    if (!product.available) {
      throw {
        statusCode: 400,
        message: `Product ${product.name} is not available`,
      };
    }

    if (product.stock < item.quantity) {
      throw {
        statusCode: 400,
        message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
      };
    }

    const price = product.prices[item.lotSize];
    if (!price) {
      throw {
        statusCode: 400,
        message: `Invalid lot size for ${product.name}`,
      };
    }

    const itemTotal = price * item.quantity;

    processedItems.push({
      product: product._id,
      productName: product.name,
      productImage: product.images[0] || '',
      lotSize: item.lotSize,
      quantity: item.quantity,
      price,
      total: itemTotal,
    });

    subtotal += itemTotal;

    // Reduce product stock
    product.stock -= item.quantity;
    await product.save();
  }

  // Calculate totals
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + tax + shipping;

  // Generate order number
  const orderNumber = generateOrderNumber();

  // Create order
  const order = await Order.create({
    orderNumber,
    user: userId,
    items: processedItems,
    shippingAddress,
    paymentMethod,
    subtotal,
    tax,
    shipping,
    total,
    notes,
  });

  // Send confirmation email
  const user = await User.findById(userId);
  try {
    await emailService.sendOrderConfirmationEmail(user, order);
  } catch (error) {
    // Log error but don't fail the order
    console.error('Failed to send order confirmation email:', error);
  }

  return await order.populate('user', 'firstName lastName email phone');
};

/**
 * Get user's orders
 */
const getUserOrders = async (userId, filters = {}) => {
  const {
    status,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const query = { user: userId };

  if (status) {
    query.status = status;
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;
  const orders = await Order.find(query)
    .populate('items.product', 'name slug images')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: getPaginationMeta(page, limit, total),
  };
};

/**
 * Get order by ID
 */
const getOrderById = async (orderId, userId = null, isAdmin = false) => {
  const order = await Order.findById(orderId)
    .populate('user', 'firstName lastName email phone')
    .populate('items.product', 'name slug images');

  if (!order) {
    throw {
      statusCode: 404,
      message: 'Order not found',
    };
  }

  // Check authorization (user can only see own orders unless admin)
  if (!isAdmin && userId && order.user._id.toString() !== userId.toString()) {
    throw {
      statusCode: 403,
      message: 'Access denied',
    };
  }

  return order;
};

/**
 * Cancel order
 */
const cancelOrder = async (orderId, userId, cancellationReason = '') => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw {
      statusCode: 404,
      message: 'Order not found',
    };
  }

  // Check authorization
  if (order.user.toString() !== userId.toString()) {
    throw {
      statusCode: 403,
      message: 'Access denied',
    };
  }

  // Only allow cancellation if order is pending
  if (order.status !== 'pending') {
    throw {
      statusCode: 400,
      message: 'Only pending orders can be cancelled',
    };
  }

  // Restore product stock
  for (const item of order.items) {
    if (item.product) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  // Update order status
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.cancellationReason = cancellationReason;
  await order.save();

  // Send cancellation email
  const user = await User.findById(userId);
  try {
    await emailService.sendOrderCancellationEmail(user, order);
  } catch (error) {
    console.error('Failed to send order cancellation email:', error);
  }

  return order;
};

/**
 * Reorder (create new order from existing order)
 */
const reorderOrder = async (orderId, userId) => {
  const existingOrder = await Order.findById(orderId);

  if (!existingOrder) {
    throw {
      statusCode: 404,
      message: 'Order not found',
    };
  }

  // Check authorization
  if (existingOrder.user.toString() !== userId.toString()) {
    throw {
      statusCode: 403,
      message: 'Access denied',
    };
  }

  // Prepare items for new order
  const items = existingOrder.items.map((item) => ({
    product: item.product,
    lotSize: item.lotSize,
    quantity: item.quantity,
  }));

  // Create new order with same items and shipping address
  const newOrderData = {
    items,
    shippingAddress: existingOrder.shippingAddress,
    paymentMethod: existingOrder.paymentMethod,
    notes: 'Reorder from ' + existingOrder.orderNumber,
  };

  return await createOrder(userId, newOrderData);
};

/**
 * Get all orders (Admin)
 */
const getAllOrders = async (filters = {}) => {
  const {
    status,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
    ];
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;
  const orders = await Order.find(query)
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  return {
    orders,
    pagination: getPaginationMeta(page, limit, total),
  };
};

/**
 * Update order status (Admin)
 */
const updateOrderStatus = async (orderId, status, additionalData = {}) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw {
      statusCode: 404,
      message: 'Order not found',
    };
  }

  const oldStatus = order.status;
  order.status = status;

  // Update additional fields based on status
  if (status === 'shipped') {
    order.trackingNumber = additionalData.trackingNumber;
    order.estimatedDelivery = additionalData.estimatedDelivery;
  }

  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }

  await order.save();

  // Send status update email
  const user = await User.findById(order.user);
  try {
    await emailService.sendOrderStatusEmail(user, order, oldStatus);
  } catch (error) {
    console.error('Failed to send order status email:', error);
  }

  return await order.populate('user', 'firstName lastName email phone');
};

/**
 * Get user dashboard statistics
 */
const getUserDashboardStats = async (userId) => {
  const totalOrders = await Order.countDocuments({ user: userId });
  const pendingOrders = await Order.countDocuments({ user: userId, status: 'pending' });
  const deliveredOrders = await Order.countDocuments({ user: userId, status: 'delivered' });

  const ordersWithTotal = await Order.find({ user: userId });
  const totalSpent = ordersWithTotal.reduce((sum, order) => sum + order.total, 0);

  return {
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalSpent: Math.round(totalSpent * 100) / 100,
  };
};

/**
 * Get recent orders for user dashboard
 */
const getRecentUserOrders = async (userId, limitCount = 5) => {
  const orders = await Order.find({ user: userId })
    .populate('items.product', 'name slug images')
    .sort({ createdAt: -1 })
    .limit(parseInt(limitCount));

  return orders;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  reorderOrder,
  getAllOrders,
  updateOrderStatus,
  getUserDashboardStats,
  getRecentUserOrders,
};
