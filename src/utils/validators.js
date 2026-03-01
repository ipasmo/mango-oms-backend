const { body, param, query, validationResult } = require('express-validator');

/**
 * Custom validator middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        statusCode: 400,
        errors: extractedErrors,
      },
    });
  };
};

/**
 * Custom validators
 */
const isValidObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};

const isValidLotSize = (value) => {
  return ['3kg', '5kg', '10kg', '20kg'].includes(value);
};

const isValidOrderStatus = (value) => {
  return ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(value);
};

const isValidPaymentMethod = (value) => {
  return ['card', 'paypal', 'cash_on_delivery'].includes(value);
};

module.exports = {
  validate,
  body,
  param,
  query,
  isValidObjectId,
  isValidLotSize,
  isValidOrderStatus,
  isValidPaymentMethod,
};
