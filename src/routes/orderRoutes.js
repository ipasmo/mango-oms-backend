const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const { validate, body, param } = require('../utils/validators');
const { isValidLotSize, isValidPaymentMethod } = require('../utils/validators');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

// All routes require authentication
router.use(auth);

router.post(
  '/',
  validate([
    body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
    body('items.*.product').isMongoId().withMessage('Invalid product ID'),
    body('items.*.lotSize')
      .custom(isValidLotSize)
      .withMessage('Lot size must be one of: 3kg, 5kg, 10kg, 20kg'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
    body('shippingAddress.fullName')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('shippingAddress.addressLine1')
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
    body('shippingAddress.postalCode')
      .trim()
      .notEmpty()
      .withMessage('Postal code is required'),
    body('shippingAddress.country').trim().notEmpty().withMessage('Country is required'),
    body('shippingAddress.phone').trim().notEmpty().withMessage('Phone is required'),
    body('paymentMethod')
      .custom(isValidPaymentMethod)
      .withMessage('Payment method must be one of: card, paypal, cash_on_delivery'),
  ]),
  orderController.createOrder
);

router.get('/', orderController.getUserOrders);

router.get(
  '/:id',
  validate([param('id').isMongoId().withMessage('Invalid order ID')]),
  orderController.getOrderById
);

router.patch(
  '/:id/cancel',
  validate([
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('reason').optional().trim(),
  ]),
  orderController.cancelOrder
);

router.post(
  '/:id/reorder',
  validate([param('id').isMongoId().withMessage('Invalid order ID')]),
  orderController.reorderOrder
);

module.exports = router;
