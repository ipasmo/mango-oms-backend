const productService = require('../services/productService');
const { successResponse } = require('../utils/helpers');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with filters
 *     tags: [Products]
 */
const getAllProducts = async (req, res, next) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      category: req.query.category,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      search: req.query.search,
    };

    const result = await productService.getAllProducts(filters);

    res.json(
      successResponse({
        products: result.products,
        pagination: result.pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/:id:
 *   get:
 *     summary: Get single product by ID
 *     tags: [Products]
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);

    res.json(successResponse({ product }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 */
const searchProducts = async (req, res, next) => {
  try {
    const { q, category } = req.query;

    const products = await productService.searchProducts(q, { category });

    res.json(
      successResponse({
        products,
        count: products.length,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/featured:
 *   get:
 *     summary: Get featured products
 *     tags: [Products]
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit || 6;

    const products = await productService.getFeaturedProducts(limit);

    res.json(successResponse({ products }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/:id/reviews:
 *   get:
 *     summary: Get product reviews
 *     tags: [Products]
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await productService.getProductReviews(req.params.id, page, limit);

    res.json(
      successResponse({
        reviews: result.reviews,
        pagination: result.pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/:id/reviews:
 *   post:
 *     summary: Add product review
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
const addProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const review = await productService.addProductReview(
      req.params.id,
      req.user._id,
      rating,
      comment
    );

    res.status(201).json(successResponse({ review }, 'Review added successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Products]
 */
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await productService.getAllCategories();

    res.json(successResponse({ categories }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/category/:categoryId:
 *   get:
 *     summary: Get products by category
 *     tags: [Products]
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { page, limit, sortBy, sortOrder } = req.query;

    const result = await productService.getProductsByCategory(
      req.params.categoryId,
      page,
      limit,
      sortBy,
      sortOrder
    );

    res.json(
      successResponse({
        category: result.category,
        products: result.products,
        pagination: result.pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/:id/availability:
 *   get:
 *     summary: Check product availability
 *     tags: [Products]
 */
const checkProductAvailability = async (req, res, next) => {
  try {
    const { quantity } = req.query;

    const result = await productService.checkProductAvailability(req.params.id, quantity);

    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/:id/related:
 *   get:
 *     summary: Get related products
 *     tags: [Products]
 */
const getRelatedProducts = async (req, res, next) => {
  try {
    const limit = req.query.limit || 4;

    const products = await productService.getRelatedProducts(req.params.id, limit);

    res.json(successResponse({ products }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
  getFeaturedProducts,
  getProductReviews,
  addProductReview,
  getAllCategories,
  getProductsByCategory,
  checkProductAvailability,
  getRelatedProducts,
};
