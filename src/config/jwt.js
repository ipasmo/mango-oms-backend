module.exports = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
  expire: process.env.JWT_EXPIRE || '15m',
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};
