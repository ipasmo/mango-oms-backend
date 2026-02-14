const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         slug:
 *           type: string
 *         description:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         category:
 *           type: string
 *         prices:
 *           type: object
 *         stock:
 *           type: number
 *         featured:
 *           type: boolean
 *         rating:
 *           type: number
 *         reviewCount:
 *           type: number
 */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    prices: {
      '3kg': {
        type: Number,
        required: [true, '3kg price is required'],
        min: 0,
      },
      '5kg': {
        type: Number,
        required: [true, '5kg price is required'],
        min: 0,
      },
      '10kg': {
        type: Number,
        required: [true, '10kg price is required'],
        min: 0,
      },
      '20kg': {
        type: Number,
        required: [true, '20kg price is required'],
        min: 0,
      },
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
