import express from 'express';
import { body, param } from 'express-validator';

// Import the controller
import {
  addCategory,
  postProduct,
  addtoCart,
  rateProduct,
  getCart,
  getProfile,
  getProduct,
  updateProfile,
  updateBanner,
  updateProfilePic,
  updateProduct,
  updateCart,
  deleteProduct,
  deleteCart,
  deleteBanner,
  deleteProfilePic,
} from '../controllers/privateControllers.js';

// Cloudinary Controllers
import {
  postProductToClouldinary,
  updateBannerFromCloudinary,
  updateProfilePicFromCloudinary,
  updateProductFromCloudinary,
  deleteProductFromCloudinary,
  deleteBannerFromCloudinary,
  deleteProfilePicFromCloudinary,
} from '../controllers/cloudinaryControllers.js';

// Middleware
import { validate } from '../middleware/validate.js';
import { categoryValidation } from '../validationInputs/categoryValidation.js';
import { productValidator } from '../validationInputs/productValidation.js';
import { cartValidation } from '../validationInputs/cartValidation.js';
import { signupUpdateValidation } from '../validationInputs/signupUpdateValidation.js';
import { idValidation } from '../validationInputs/idValidation.js';
import { oldPublicIdValidation } from '../validationInputs/oldPublicIdValidation.js';
import { updateCartValidation } from '../validationInputs/updateCartValidation.js';
import { ratingValidation } from '../validationInputs/rateValidation.js';

const privateRoutes = express.Router();

const productId = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

const userId = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

// GET method
privateRoutes.route('/getcart').get(getCart);

privateRoutes.route('/getprofile/:userId').get(userId, validate, getProfile);

privateRoutes
  .route('/getproduct/:productId')
  .get(productId, validate, getProduct);

// POST method
privateRoutes
  .route('/addcategory')
  .post(categoryValidation, validate, addCategory);

privateRoutes
  .route('/postproduct')
  .post(productValidator, validate, postProduct);

privateRoutes
  .route('/rateproduct')
  .post(ratingValidation, validate, rateProduct);

privateRoutes.route('/addtocart').post(cartValidation, validate, addtoCart);

// PUT method
privateRoutes
  .route('/updateprofile')
  .put(signupUpdateValidation, validate, updateProfile);

privateRoutes
  .route('/updatebanner')
  .put(oldPublicIdValidation, validate, updateBanner);

privateRoutes
  .route('/updateprofilepic')
  .put(oldPublicIdValidation, validate, updateProfilePic);

privateRoutes
  .route('/updateproduct')
  .put(
    idValidation,
    oldPublicIdValidation,
    productValidator,
    validate,
    updateProduct
  );

privateRoutes
  .route('/updatecart')
  .put(updateCartValidation, validate, updateCart);

//  DELETE Methods
const publicId = [
  body('publicId').isString().notEmpty().withMessage('Invalid Public ID'),
];

const id = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isMongoId()
    .withMessage('ID must be Invalid ID'),
];

privateRoutes.route('/deleteproduct').delete(publicId, validate, deleteProduct);

privateRoutes.route('/removeitem/:id').delete(id, validate, deleteCart);

privateRoutes.route('/deletebanner').delete(publicId, validate, deleteBanner);

privateRoutes
  .route('/deleteprofilepic')
  .delete(publicId, validate, deleteProfilePic);

// Cloudinary Routes

// POST Methods
privateRoutes
  .route('/postproducttocloudinary')
  .post(productValidator, validate, postProductToClouldinary);

// PUT Methods
privateRoutes
  .route('/updateproductfromcloudinary')
  .put(
    idValidation,
    oldPublicIdValidation,
    productValidator,
    validate,
    updateProductFromCloudinary
  );

privateRoutes
  .route('/updatebannerfromcloudinary')
  .put(oldPublicIdValidation, validate, updateBannerFromCloudinary);

privateRoutes
  .route('/updateprofilepicfromcloudinary')
  .put(oldPublicIdValidation, validate, updateProfilePicFromCloudinary);

// DELETE Methods

privateRoutes
  .route('/deleteproductfromcloudinary')
  .delete(publicId, validate, deleteProductFromCloudinary);

privateRoutes
  .route('/deletebannerfromcloudinary')
  .delete(publicId, validate, deleteBannerFromCloudinary);

privateRoutes
  .route('/deleteprofilepicfromcloudinary')
  .delete(publicId, validate, deleteProfilePicFromCloudinary);

export default privateRoutes;
