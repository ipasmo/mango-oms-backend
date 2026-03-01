const User = require('../models/User');
const logger = require('../utils/logger');

const seedUsers = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@mangooms.com' });

    if (existingAdmin) {
      logger.info('Admin user already exists');
      return [existingAdmin];
    }

    // Create admin user
    const adminUser = await User.create({
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || 'User',
      email: process.env.ADMIN_EMAIL || 'admin@mangooms.com',
      phone: process.env.ADMIN_PHONE || '+1234567890',
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin',
      emailVerified: true,
    });

    logger.info(`Created admin user: ${adminUser.email}`);
    return [adminUser];
  } catch (error) {
    logger.error(`Error seeding users: ${error.message}`);
    throw error;
  }
};

module.exports = { seedUsers };
