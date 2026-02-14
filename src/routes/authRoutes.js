const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate, body } = require('../utils/validators');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

// Public routes
router.post(
  '/signup',
  authLimiter,
  validate([
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ]),
  authController.signup
);

router.post(
  '/login',
  authLimiter,
  validate([
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  authController.login
);

router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  authLimiter,
  validate([body('email').isEmail().withMessage('Valid email is required').normalizeEmail()]),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  validate([
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ]),
  authController.resetPassword
);

router.post(
  '/refresh',
  validate([body('refreshToken').notEmpty().withMessage('Refresh token is required')]),
  authController.refreshToken
);

// Protected routes
router.get('/profile', auth, authController.getProfile);

router.put(
  '/profile',
  auth,
  validate([
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  ]),
  authController.updateProfile
);

router.post(
  '/change-password',
  auth,
  validate([
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long'),
  ]),
  authController.changePassword
);

module.exports = router;
