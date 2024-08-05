import express from 'express';

const publicRoutes = express.Router();

// Middleware
import { validate } from '../middleware/validate.js';
import { param } from 'express-validator';

// Validation Input
import { signupValidation } from '../validationInputs/signupValidation.js';
import { signinValidation } from '../validationInputs/signinValidation.js';

// Public Controllers
import {
  signupUser,
  csrfToken,
  login,
  refreshToken,
  getCategory,
  getRate,
  filterProducts,
  logout,
} from '../controllers/publicControllers.js';

// GET Routes
publicRoutes.route('/csrftoken').get(csrfToken);
publicRoutes.route('/refreshtoken').get(refreshToken);
publicRoutes.route('/logout').get(logout);
publicRoutes.route('/productcategory').get(getCategory);
publicRoutes.route('/products').get(filterProducts);

const id = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('ID must be Invalid ID'),
];

publicRoutes.route('/getrate/:id').get(id, validate, getRate);

// POST Routes
publicRoutes.route('/signup').post(signupValidation, validate, signupUser);
publicRoutes.route('/signin').post(signinValidation, validate, login);

export default publicRoutes;
