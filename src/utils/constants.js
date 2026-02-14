module.exports = {
  // User roles
  USER_ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Order statuses
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
  },

  // Payment methods
  PAYMENT_METHODS: {
    CARD: 'card',
    PAYPAL: 'paypal',
    CASH_ON_DELIVERY: 'cash_on_delivery',
  },

  // Lot sizes
  LOT_SIZES: ['3kg', '5kg', '10kg', '20kg'],

  // Pagination defaults
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,

  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  // Tax and shipping
  TAX_RATE: 0.1, // 10%
  SHIPPING_COST: 10,
  FREE_SHIPPING_THRESHOLD: 100,
};
