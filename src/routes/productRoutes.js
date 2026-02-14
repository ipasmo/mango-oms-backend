const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const { validate, body, param } = require('../utils/validators');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

// Public routes
router.get('/', productController.getAllProducts);

router.get('/featured', productController.getFeaturedProducts);

router.get('/search', productController.searchProducts);

router.get('/categories', productController.getAllCategories);

router.get(
  '/category/:categoryId',
  validate([param('categoryId').isMongoId().withMessage('Invalid category ID')]),
  productController.getProductsByCategory
);

router.get(
  '/:id',
  validate([param('id').isMongoId().withMessage('Invalid product ID')]),
  productController.getProductById
);

router.get(
  '/:id/reviews',
  validate([param('id').isMongoId().withMessage('Invalid product ID')]),
  productController.getProductReviews
);

router.get(
  '/:id/availability',
  validate([param('id').isMongoId().withMessage('Invalid product ID')]),
  productController.checkProductAvailability
);

router.get(
  '/:id/related',
  validate([param('id').isMongoId().withMessage('Invalid product ID')]),
  productController.getRelatedProducts
);

// Protected routes
router.post(
  '/:id/reviews',
  auth,
  validate([
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ]),
  productController.addProductReview
);

module.exports = router;
