/**
 * Mock Payment Service
 * Simulates payment processing for development
 */

/**
 * Process payment
 * @returns {Promise<{success: boolean, transactionId: string}>}
 */
const processPayment = async (paymentData) => {
  const { amount, paymentMethod, cardDetails } = paymentData;

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock success/failure based on amount (for testing)
  // Amounts ending in .99 will fail
  const shouldFail = amount.toString().endsWith('.99');

  if (shouldFail) {
    return {
      success: false,
      error: 'Payment declined by bank',
    };
  }

  // Generate mock transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return {
    success: true,
    transactionId,
    amount,
    paymentMethod,
    timestamp: new Date(),
  };
};

/**
 * Refund payment
 * @returns {Promise<{success: boolean, refundId: string}>}
 */
const refundPayment = async (transactionId, amount) => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate mock refund ID
  const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  return {
    success: true,
    refundId,
    transactionId,
    amount,
    timestamp: new Date(),
  };
};

/**
 * Verify payment
 * @returns {Promise<{verified: boolean}>}
 */
const verifyPayment = async (transactionId) => {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    verified: true,
    transactionId,
    status: 'completed',
  };
};

module.exports = {
  processPayment,
  refundPayment,
  verifyPayment,
};
