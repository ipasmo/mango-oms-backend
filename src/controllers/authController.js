const authService = require('../services/authService');
const emailService = require('../services/emailService');
const User = require('../models/User');
const { successResponse } = require('../utils/helpers');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    const result = await authService.signup({
      firstName,
      lastName,
      email,
      phone,
      password,
    });

    // Send welcome email (don't wait for it)
    emailService.sendWelcomeEmail(result.user).catch(console.error);

    res.status(201).json(
      successResponse(
        {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        },
        'User registered successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.json(
      successResponse(
        {
          user: result.user,
          token: result.token,
          refreshToken: result.refreshToken,
        },
        'Login successful'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    res.json(successResponse(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    res.json(successResponse({ user }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const user = await User.findById(req.user._id);

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;

    await user.save();

    res.json(successResponse({ user }, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    await authService.changePassword(req.user._id, oldPassword, newPassword);

    res.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const { user, resetToken } = await authService.generatePasswordResetToken(email);

    // Send password reset email
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json(successResponse(null, 'Password reset email sent'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.json(successResponse(null, 'Password reset successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    const result = await authService.refreshAccessToken(token);

    res.json(successResponse(result, 'Token refreshed successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
};
