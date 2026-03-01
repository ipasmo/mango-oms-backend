require('dotenv').config();
const connectDB = require('../config/database');
const { seedCategories } = require('./categorySeeder');
const { seedProducts } = require('./productSeeder');
const { seedUsers } = require('./userSeeder');
const logger = require('../utils/logger');

const runSeeders = async () => {
  try {
    // Connect to database
    await connectDB();

    logger.info('Starting database seeding...');

    // Check if --undo flag is provided
    const isUndo = process.argv.includes('--undo');

    if (isUndo) {
      logger.info('Undoing seeders - clearing all data...');
      const Category = require('../models/Category');
      const Product = require('../models/Product');
      const User = require('../models/User');
      const Order = require('../models/Order');
      const Review = require('../models/Review');
      const RefreshToken = require('../models/RefreshToken');

      await Promise.all([
        Category.deleteMany({}),
        Product.deleteMany({}),
        User.deleteMany({}),
        Order.deleteMany({}),
        Review.deleteMany({}),
        RefreshToken.deleteMany({}),
      ]);

      logger.info('All data cleared successfully');
      process.exit(0);
    }

    // Seed categories
    const categories = await seedCategories();

    // Seed products
    await seedProducts(categories);

    // Seed users (admin)
    await seedUsers();

    logger.info('Database seeding completed successfully!');
    logger.info('Admin credentials:');
    logger.info(`Email: ${process.env.ADMIN_EMAIL || 'admin@mangooms.com'}`);
    logger.info(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Run seeders
runSeeders();
