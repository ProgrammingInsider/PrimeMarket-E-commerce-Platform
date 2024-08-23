import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    parent_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    ratingCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    sku: {
      type: String,
      trim: true,
      unique: true,
      maxlength: 50,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to handle SKU generation
productSchema.pre('save', function (next) {
  if (!this.sku || this.sku.trim() === '') {
    this.sku = `SKU-${uuidv4()}`;
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
