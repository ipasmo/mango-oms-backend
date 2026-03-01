/**
 * Middleware to check if user has required role
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          statusCode: 401,
          errors: [],
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied. Insufficient permissions.',
          statusCode: 403,
          errors: [],
        },
      });
    }

    next();
  };
};

module.exports = roleCheck;
