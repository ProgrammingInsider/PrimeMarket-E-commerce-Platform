import express from 'express';
import { param } from 'express-validator';

const protectedRoutes = express.Router();

import {
  productDetail,
  userProfile,
} from '../controllers/protectedControllers.js';
import { validate } from '../middleware/validate.js';

const productId = [
  param('productid')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

const userId = [
  param('userid')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

// GET
protectedRoutes
  .route('/productdetails/:productid')
  .get(productId, validate, productDetail);
protectedRoutes
  .route('/userprofile/:userid')
  .get(userId, validate, userProfile);

export default protectedRoutes;
