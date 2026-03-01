const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtConfig = require('../config/jwt');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { validatePassword, generateToken } = require('../utils/helpers');

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, jwtConfig.secret, {
    expiresIn: jwtConfig.expire,
  });
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = async (userId) => {
  const token = jwt.sign({ userId }, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpire,
  });

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Save refresh token to database
  await RefreshToken.create({
    token,
    user: userId,
    expiresAt,
  });

  return token;
};

/**
 * Register new user
 */
const signup = async (userData) => {
  const { firstName, lastName, email, phone, password } = userData;

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw {
      statusCode: 400,
      message: 'Password validation failed',
      errors: passwordValidation.errors.map((err) => ({
        field: 'password',
        message: err,
      })),
    };
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw {
      statusCode: 400,
      message: 'User already exists with this email',
    };
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);

  return {
    user,
    token: accessToken,
    refreshToken,
  };
};

/**
 * Login user
 */
const login = async (email, password) => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw {
      statusCode: 401,
      message: 'Invalid email or password',
    };
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw {
      statusCode: 401,
      message: 'Invalid email or password',
    };
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = await generateRefreshToken(user._id);

  // Remove password from response
  user.password = undefined;

  return {
    user,
    token: accessToken,
    refreshToken,
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  // Verify refresh token
  const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret);

  // Check if refresh token exists in database
  const tokenDoc = await RefreshToken.findOne({
    token: refreshToken,
    user: decoded.userId,
  });

  if (!tokenDoc) {
    throw {
      statusCode: 401,
      message: 'Invalid refresh token',
    };
  }

  // Check if token is expired
  if (new Date() > tokenDoc.expiresAt) {
    await RefreshToken.deleteOne({ _id: tokenDoc._id });
    throw {
      statusCode: 401,
      message: 'Refresh token expired',
    };
  }

  // Generate new access token
  const accessToken = generateAccessToken(decoded.userId);

  return { token: accessToken };
};

/**
 * Logout user (remove refresh token)
 */
const logout = async (refreshToken) => {
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }
};

/**
 * Generate password reset token
 */
const generatePasswordResetToken = async (email) => {
  const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw {
      statusCode: 404,
      message: 'No user found with this email',
    };
  }

  // Generate reset token
  const resetToken = generateToken();
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

  await user.save();

  return { user, resetToken };
};

/**
 * Reset password with token
 */
const resetPassword = async (token, newPassword) => {
  // Hash token to compare with database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    throw {
      statusCode: 400,
      message: 'Invalid or expired reset token',
    };
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw {
      statusCode: 400,
      message: 'Password validation failed',
      errors: passwordValidation.errors.map((err) => ({
        field: 'password',
        message: err,
      })),
    };
  }

  // Update password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  return user;
};

/**
 * Change password
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw {
      statusCode: 404,
      message: 'User not found',
    };
  }

  // Verify old password
  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    throw {
      statusCode: 401,
      message: 'Current password is incorrect',
    };
  }

  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.isValid) {
    throw {
      statusCode: 400,
      message: 'Password validation failed',
      errors: passwordValidation.errors.map((err) => ({
        field: 'password',
        message: err,
      })),
    };
  }

  // Update password
  user.password = newPassword;
  await user.save();

  return user;
};

module.exports = {
  signup,
  login,
  refreshAccessToken,
  logout,
  generatePasswordResetToken,
  resetPassword,
  changePassword,
  generateAccessToken,
  generateRefreshToken,
};
