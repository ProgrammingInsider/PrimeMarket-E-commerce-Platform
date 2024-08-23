import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      required: true,
      default: 'active',
      enum: ['active', 'inactive', 'checkout'],
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ user_id: 1 });
cartSchema.index({ product_id: 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
