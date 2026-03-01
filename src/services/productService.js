const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { getPaginationMeta, createSlug } = require('../utils/helpers');
const { DEFAULT_PAGE, DEFAULT_LIMIT } = require('../utils/constants');

/**
 * Get all products with filters
 */
const getAllProducts = async (filters) => {
  const {
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
    category,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search,
  } = filters;

  const query = { available: true };

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.$or = [];
    const priceConditions = {};
    
    if (minPrice) {
      priceConditions.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      priceConditions.$lte = parseFloat(maxPrice);
    }

    ['3kg', '5kg', '10kg', '20kg'].forEach((size) => {
      query.$or.push({ [`prices.${size}`]: priceConditions });
    });
  }

  // Search filter
  if (search) {
    query.$text = { $search: search };
  }

  // Sort options
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Execute query
  const skip = (page - 1) * limit;
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  return {
    products,
    pagination: getPaginationMeta(page, limit, total),
  };
};

/**
 * Get product by ID
 */
const getProductById = async (productId) => {
  const product = await Product.findById(productId)
    .populate('category', 'name slug')
    .populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'firstName lastName',
      },
    });

  if (!product) {
    throw {
      statusCode: 404,
      message: 'Product not found',
    };
  }

  return product;
};

/**
 * Get featured products
 */
const getFeaturedProducts = async (limitCount = 6) => {
  const products = await Product.find({ featured: true, available: true })
    .populate('category', 'name slug')
    .limit(parseInt(limitCount))
    .sort({ rating: -1 });

  return products;
};

/**
 * Search products
 */
const searchProducts = async (searchQuery, filters = {}) => {
  const query = {
    $text: { $search: searchQuery },
    available: true,
  };

  if (filters.category) {
    query.category = filters.category;
  }

  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort({ score: { $meta: 'textScore' } });

  return products;
};

/**
 * Get product reviews
 */
const getProductReviews = async (productId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const reviews = await Review.find({ product: productId })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ product: productId });

  return {
    reviews,
    pagination: getPaginationMeta(page, limit, total),
  };
};

/**
 * Add product review
 */
const addProductReview = async (productId, userId, rating, comment) => {
  // Check if user already reviewed this product
  const existingReview = await Review.findOne({ product: productId, user: userId });

  if (existingReview) {
    throw {
      statusCode: 400,
      message: 'You have already reviewed this product',
    };
  }

  // Create review
  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    comment,
  });

  // Update product rating and review count
  const product = await Product.findById(productId);
  product.reviews.push(review._id);
  product.reviewCount = product.reviews.length;

  // Calculate average rating
  const allReviews = await Review.find({ product: productId });
  const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  product.rating = Math.round(avgRating * 10) / 10;

  await product.save();

  return await review.populate('user', 'firstName lastName');
};

/**
 * Get all categories
 */
const getAllCategories = async () => {
  const categories = await Category.find().sort({ name: 1 });
  return categories;
};

/**
 * Get products by category
 */
const getProductsByCategory = async (categoryId, page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc') => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw {
      statusCode: 404,
      message: 'Category not found',
    };
  }

  const skip = (page - 1) * limit;
  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const products = await Product.find({ category: categoryId, available: true })
    .populate('category', 'name slug')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments({ category: categoryId, available: true });

  return {
    category,
    products,
    pagination: getPaginationMeta(page, limit, total),
  };
};

/**
 * Check product availability
 */
const checkProductAvailability = async (productId, quantity = 1) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw {
      statusCode: 404,
      message: 'Product not found',
    };
  }

  return {
    available: product.available && product.stock >= quantity,
    stock: product.stock,
  };
};

/**
 * Get related products
 */
const getRelatedProducts = async (productId, limitCount = 4) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw {
      statusCode: 404,
      message: 'Product not found',
    };
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: productId },
    available: true,
  })
    .populate('category', 'name slug')
    .limit(parseInt(limitCount))
    .sort({ rating: -1 });

  return relatedProducts;
};

/**
 * Create product (Admin)
 */
const createProduct = async (productData) => {
  // Generate slug from name
  if (!productData.slug) {
    productData.slug = createSlug(productData.name);
  }

  const product = await Product.create(productData);

  // Update category product count
  await Category.findByIdAndUpdate(productData.category, {
    $inc: { productCount: 1 },
  });

  return await product.populate('category', 'name slug');
};

/**
 * Update product (Admin)
 */
const updateProduct = async (productId, updateData) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw {
      statusCode: 404,
      message: 'Product not found',
    };
  }

  // Update slug if name changed
  if (updateData.name && updateData.name !== product.name) {
    updateData.slug = createSlug(updateData.name);
  }

  // If category changed, update category counts
  if (updateData.category && updateData.category.toString() !== product.category.toString()) {
    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 },
    });
    await Category.findByIdAndUpdate(updateData.category, {
      $inc: { productCount: 1 },
    });
  }

  Object.assign(product, updateData);
  await product.save();

  return await product.populate('category', 'name slug');
};

/**
 * Delete product (Admin)
 */
const deleteProduct = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw {
      statusCode: 404,
      message: 'Product not found',
    };
  }

  // Update category product count
  await Category.findByIdAndUpdate(product.category, {
    $inc: { productCount: -1 },
  });

  // Delete all reviews
  await Review.deleteMany({ product: productId });

  await Product.findByIdAndDelete(productId);
};

/**
 * Update product stock (Admin)
 */
const updateProductStock = async (productId, stock) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw {
      statusCode: 404,
      message: 'Product not found',
    };
  }

  product.stock = stock;
  await product.save();

  return product;
};

module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  searchProducts,
  getProductReviews,
  addProductReview,
  getAllCategories,
  getProductsByCategory,
  checkProductAvailability,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
};
