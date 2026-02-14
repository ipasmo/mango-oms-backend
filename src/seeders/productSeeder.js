const Product = require('../models/Product');
const Category = require('../models/Category');
const { createSlug } = require('../utils/helpers');
const logger = require('../utils/logger');

const getProducts = (categories) => {
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.slug] = cat._id;
  });

  return [
    {
      name: 'Alphonso Mango - King of Mangoes',
      slug: 'alphonso-mango',
      description:
        'Premium Alphonso mangoes from Ratnagiri, known for their rich flavor, creamy texture, and golden-saffron color. Perfect for eating fresh or making desserts.',
      images: [
        'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500',
        'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500',
      ],
      category: categoryMap['premium-mangoes'],
      prices: {
        '3kg': 45.99,
        '5kg': 74.99,
        '10kg': 145.99,
        '20kg': 279.99,
      },
      stock: 150,
      featured: true,
      rating: 4.8,
      reviewCount: 127,
      available: true,
    },
    {
      name: 'Kesar Mango - Queen of Mangoes',
      slug: 'kesar-mango',
      description:
        'Delicious Kesar mangoes from Gujarat with a unique saffron aroma and sweet taste. Ideal for fresh consumption and traditional Indian desserts.',
      images: [
        'https://images.unsplash.com/photo-1605029739691-0b5c2c6e6d66?w=500',
        'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500',
      ],
      category: categoryMap['premium-mangoes'],
      prices: {
        '3kg': 42.99,
        '5kg': 69.99,
        '10kg': 135.99,
        '20kg': 259.99,
      },
      stock: 200,
      featured: true,
      rating: 4.7,
      reviewCount: 98,
      available: true,
    },
    {
      name: 'Dasheri Mango - North Indian Delight',
      slug: 'dasheri-mango',
      description:
        'Sweet and aromatic Dasheri mangoes from Uttar Pradesh. Known for their elongated shape and minimal fiber content.',
      images: ['https://images.unsplash.com/photo-1591206369811-4eeb2f04d734?w=500'],
      category: categoryMap['seasonal-mangoes'],
      prices: {
        '3kg': 35.99,
        '5kg': 58.99,
        '10kg': 114.99,
        '20kg': 219.99,
      },
      stock: 180,
      featured: false,
      rating: 4.5,
      reviewCount: 65,
      available: true,
    },
    {
      name: 'Langra Mango - Traditional Variety',
      slug: 'langra-mango',
      description:
        'Classic Langra mangoes with greenish skin and sweet-tangy flavor. A favorite for traditional mango lovers.',
      images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'],
      category: categoryMap['seasonal-mangoes'],
      prices: {
        '3kg': 32.99,
        '5kg': 54.99,
        '10kg': 106.99,
        '20kg': 204.99,
      },
      stock: 160,
      featured: false,
      rating: 4.3,
      reviewCount: 52,
      available: true,
    },
    {
      name: 'Banganapalli Mango - South Indian Favorite',
      slug: 'banganapalli-mango',
      description:
        'Large, golden-yellow Banganapalli mangoes from Andhra Pradesh. Mildly sweet with a pleasant aroma.',
      images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500'],
      category: categoryMap['value-pack'],
      prices: {
        '3kg': 29.99,
        '5kg': 49.99,
        '10kg': 96.99,
        '20kg': 185.99,
      },
      stock: 220,
      featured: true,
      rating: 4.6,
      reviewCount: 89,
      available: true,
    },
    {
      name: 'Totapuri Mango - Versatile Variety',
      slug: 'totapuri-mango',
      description:
        'Distinctive parrot-beak shaped Totapuri mangoes. Perfect for both eating fresh and making pickles.',
      images: ['https://images.unsplash.com/photo-1605029739691-0b5c2c6e6d66?w=500'],
      category: categoryMap['value-pack'],
      prices: {
        '3kg': 27.99,
        '5kg': 45.99,
        '10kg': 89.99,
        '20kg': 172.99,
      },
      stock: 250,
      featured: false,
      rating: 4.2,
      reviewCount: 71,
      available: true,
    },
    {
      name: 'Organic Alphonso Mango',
      slug: 'organic-alphonso-mango',
      description:
        'Certified organic Alphonso mangoes grown without chemicals. Premium quality with natural sweetness.',
      images: ['https://images.unsplash.com/photo-1591206369811-4eeb2f04d734?w=500'],
      category: categoryMap['organic-mangoes'],
      prices: {
        '3kg': 52.99,
        '5kg': 86.99,
        '10kg': 169.99,
        '20kg': 325.99,
      },
      stock: 100,
      featured: true,
      rating: 4.9,
      reviewCount: 43,
      available: true,
    },
    {
      name: 'Organic Kesar Mango',
      slug: 'organic-kesar-mango',
      description:
        'Organically grown Kesar mangoes with authentic flavor and no pesticide residues.',
      images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'],
      category: categoryMap['organic-mangoes'],
      prices: {
        '3kg': 49.99,
        '5kg': 81.99,
        '10kg': 159.99,
        '20kg': 306.99,
      },
      stock: 90,
      featured: false,
      rating: 4.8,
      reviewCount: 38,
      available: true,
    },
    {
      name: 'Chausa Mango - Aromatic Delight',
      slug: 'chausa-mango',
      description:
        'Intensely aromatic Chausa mangoes with sweet, juicy flesh. A summer favorite from North India.',
      images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500'],
      category: categoryMap['seasonal-mangoes'],
      prices: {
        '3kg': 38.99,
        '5kg': 63.99,
        '10kg': 124.99,
        '20kg': 239.99,
      },
      stock: 140,
      featured: false,
      rating: 4.6,
      reviewCount: 56,
      available: true,
    },
    {
      name: 'Badami Mango - Karnataka Special',
      slug: 'badami-mango',
      description:
        'Premium Badami mangoes with thin skin and sweet pulp. Excellent for eating fresh.',
      images: ['https://images.unsplash.com/photo-1605029739691-0b5c2c6e6d66?w=500'],
      category: categoryMap['premium-mangoes'],
      prices: {
        '3kg': 39.99,
        '5kg': 65.99,
        '10kg': 128.99,
        '20kg': 247.99,
      },
      stock: 130,
      featured: false,
      rating: 4.5,
      reviewCount: 47,
      available: true,
    },
    {
      name: 'Export Quality Alphonso',
      slug: 'export-alphonso',
      description:
        'Export-grade Alphonso mangoes meeting international standards. Hand-selected for perfection.',
      images: ['https://images.unsplash.com/photo-1591206369811-4eeb2f04d734?w=500'],
      category: categoryMap['export-quality'],
      prices: {
        '3kg': 55.99,
        '5kg': 91.99,
        '10kg': 179.99,
        '20kg': 345.99,
      },
      stock: 80,
      featured: true,
      rating: 5.0,
      reviewCount: 31,
      available: true,
    },
    {
      name: 'Export Quality Kesar',
      slug: 'export-kesar',
      description:
        'Premium export-grade Kesar mangoes. Perfect size, color, and flavor for international markets.',
      images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'],
      category: categoryMap['export-quality'],
      prices: {
        '3kg': 52.99,
        '5kg': 86.99,
        '10kg': 169.99,
        '20kg': 325.99,
      },
      stock: 75,
      featured: false,
      rating: 4.9,
      reviewCount: 28,
      available: true,
    },
    {
      name: 'Malgova Mango - Tamil Nadu Pride',
      slug: 'malgova-mango',
      description:
        'Large, sweet Malgova mangoes with golden-yellow flesh. A prized variety from Tamil Nadu.',
      images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500'],
      category: categoryMap['premium-mangoes'],
      prices: {
        '3kg': 36.99,
        '5kg': 60.99,
        '10kg': 118.99,
        '20kg': 228.99,
      },
      stock: 110,
      featured: false,
      rating: 4.4,
      reviewCount: 41,
      available: true,
    },
    {
      name: 'Neelam Mango - Small Wonder',
      slug: 'neelam-mango',
      description:
        'Small to medium-sized Neelam mangoes with sweet flavor. Great value for money.',
      images: ['https://images.unsplash.com/photo-1605029739691-0b5c2c6e6d66?w=500'],
      category: categoryMap['value-pack'],
      prices: {
        '3kg': 24.99,
        '5kg': 40.99,
        '10kg': 79.99,
        '20kg': 153.99,
      },
      stock: 280,
      featured: false,
      rating: 4.1,
      reviewCount: 63,
      available: true,
    },
    {
      name: 'Himsagar Mango - Bengal Treasure',
      slug: 'himsagar-mango',
      description:
        'Juicy Himsagar mangoes from West Bengal. Sweet and flavorful with minimal fiber.',
      images: ['https://images.unsplash.com/photo-1591206369811-4eeb2f04d734?w=500'],
      category: categoryMap['seasonal-mangoes'],
      prices: {
        '3kg': 34.99,
        '5kg': 57.99,
        '10kg': 112.99,
        '20kg': 216.99,
      },
      stock: 120,
      featured: false,
      rating: 4.4,
      reviewCount: 35,
      available: true,
    },
    {
      name: 'Sindhu Mango - Hybrid Excellence',
      slug: 'sindhu-mango',
      description:
        'Modern hybrid variety combining best traits. Disease-resistant and highly productive.',
      images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'],
      category: categoryMap['value-pack'],
      prices: {
        '3kg': 31.99,
        '5kg': 52.99,
        '10kg': 103.99,
        '20kg': 199.99,
      },
      stock: 170,
      featured: false,
      rating: 4.3,
      reviewCount: 44,
      available: true,
    },
    {
      name: 'Safeda Mango - Classic Choice',
      slug: 'safeda-mango',
      description:
        'Traditional Safeda mangoes with pale yellow skin. Mildly sweet and aromatic.',
      images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500'],
      category: categoryMap['value-pack'],
      prices: {
        '3kg': 28.99,
        '5kg': 47.99,
        '10kg': 93.99,
        '20kg': 180.99,
      },
      stock: 190,
      featured: false,
      rating: 4.0,
      reviewCount: 39,
      available: true,
    },
    {
      name: 'Organic Banganapalli',
      slug: 'organic-banganapalli',
      description:
        'Organically cultivated Banganapalli mangoes. Chemical-free with authentic taste.',
      images: ['https://images.unsplash.com/photo-1605029739691-0b5c2c6e6d66?w=500'],
      category: categoryMap['organic-mangoes'],
      prices: {
        '3kg': 36.99,
        '5kg': 60.99,
        '10kg': 118.99,
        '20kg': 228.99,
      },
      stock: 95,
      featured: false,
      rating: 4.6,
      reviewCount: 32,
      available: true,
    },
    {
      name: 'Amrapali Mango - Hybrid Favorite',
      slug: 'amrapali-mango',
      description:
        'Popular hybrid mango variety with rich flavor. Regular bearer with good fruit quality.',
      images: ['https://images.unsplash.com/photo-1591206369811-4eeb2f04d734?w=500'],
      category: categoryMap['seasonal-mangoes'],
      prices: {
        '3kg': 33.99,
        '5kg': 55.99,
        '10kg': 109.99,
        '20kg': 211.99,
      },
      stock: 155,
      featured: false,
      rating: 4.3,
      reviewCount: 48,
      available: true,
    },
    {
      name: 'Mankurad Mango - Goa Special',
      slug: 'mankurad-mango',
      description:
        'Rare Mankurad mangoes from Goa. Intensely sweet with unique flavor profile.',
      images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?w=500'],
      category: categoryMap['premium-mangoes'],
      prices: {
        '3kg': 47.99,
        '5kg': 78.99,
        '10kg': 154.99,
        '20kg': 297.99,
      },
      stock: 70,
      featured: true,
      rating: 4.9,
      reviewCount: 25,
      available: true,
    },
    {
      name: 'Mixed Mango Box - Value Pack',
      slug: 'mixed-mango-box',
      description:
        'Assorted mango varieties in one box. Experience different flavors and textures.',
      images: ['https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500'],
      category: categoryMap['value-pack'],
      prices: {
        '3kg': 30.99,
        '5kg': 50.99,
        '10kg': 99.99,
        '20kg': 192.99,
      },
      stock: 200,
      featured: false,
      rating: 4.5,
      reviewCount: 92,
      available: true,
    },
  ];
};

const seedProducts = async (categories) => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    logger.info('Cleared existing products');

    // Get products with category IDs
    const products = getProducts(categories);

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    logger.info(`Seeded ${createdProducts.length} products`);

    // Update category product counts
    for (const category of categories) {
      const count = await Product.countDocuments({ category: category._id });
      await Category.findByIdAndUpdate(category._id, { productCount: count });
    }
    logger.info('Updated category product counts');

    return createdProducts;
  } catch (error) {
    logger.error(`Error seeding products: ${error.message}`);
    throw error;
  }
};

module.exports = { seedProducts };
