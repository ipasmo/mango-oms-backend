const Category = require('../models/Category');
const logger = require('../utils/logger');

const categories = [
  {
    name: 'Premium Mangoes',
    slug: 'premium-mangoes',
    description: 'Handpicked premium quality mangoes from the best orchards',
  },
  {
    name: 'Organic Mangoes',
    slug: 'organic-mangoes',
    description: 'Certified organic mangoes grown without chemical pesticides',
  },
  {
    name: 'Seasonal Mangoes',
    slug: 'seasonal-mangoes',
    description: 'Fresh seasonal varieties available during peak harvest',
  },
  {
    name: 'Export Quality',
    slug: 'export-quality',
    description: 'Export-grade mangoes meeting international quality standards',
  },
  {
    name: 'Value Pack',
    slug: 'value-pack',
    description: 'Economical mango packs perfect for families',
  },
];

const seedCategories = async () => {
  try {
    // Clear existing categories
    await Category.deleteMany({});
    logger.info('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    logger.info(`Seeded ${createdCategories.length} categories`);

    return createdCategories;
  } catch (error) {
    logger.error(`Error seeding categories: ${error.message}`);
    throw error;
  }
};

module.exports = { seedCategories, categories };
