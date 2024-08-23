import { StatusCodes } from 'http-status-codes';
import Category from '../model/Category.js';
import Product from '../model/Product.js';
import User from '../model/User.js';
import Cart from '../model/Cart.js';
import Rating from '../model/Rate.js';
import { startSession } from 'mongoose';

import {
  BadRequestError,
  ForbiddenError,
  ConventionError,
  UnauthenticatedError,
  NotFoundError,
} from '../errors/index.js';

import { uploadImage } from '../utils/uploadImageLocally.js';
import { deleteImage } from '../utils/deleteImageLocally.js';
import { calculateNewAverageRating } from '../utils/calculateNewAverageRating.js';
import { updateAverageRating } from '../utils/updateAverageRating.js';

// ======= POST METHOD CONTROLLERS ========
// Create new Category Controller
export const addCategory = async (req, res) => {
  const { slug } = req.matchedData;
  const checkSlugExistance = await Category.findOne({ slug });

  if (checkSlugExistance) {
    throw new BadRequestError('This Category Already Registered');
  }

  const newCategory = new Category(req.matchedData);

  newCategory.save();

  res
    .status(StatusCodes.CREATED)
    .json({ status: true, message: 'Category added successfully' });
};

// Post Product Local
export const postProduct = async (req, res) => {
  const { userId } = req.user;
  const { sku, category } = req.matchedData;

  if (!userId) {
    throw new ForbiddenError('Forbidden Request');
  }

  // Check If the User is Already Registered
  const fetchedUser = await User.findOne({ _id: userId }).select('_id');

  if (!fetchedUser) {
    throw new UnauthenticatedError('Logged In First');
  }

  // Check If category is exists
  const fetchedCategory = await Category.findOne({ _id: category }).select(
    '_id'
  );

  if (!fetchedCategory) {
    throw new BadRequestError('Category Not Found');
  }

  // checkSKU duplication
  if (sku) {
    const checkSKU = await Product.findOne({ sku });

    if (checkSKU) {
      throw new BadRequestError('Sku is taken');
    }
  }

  const imageName = await uploadImage(req, 'imageUrl', 'products');

  const newProduct = new Product({
    imageUrl: imageName,
    userId,
    publicId: imageName,
    ...req.matchedData,
  });

  newProduct.save();

  res
    .status(StatusCodes.CREATED)
    .json({ status: true, message: 'Product Uploaded' });
};

// rateProduct
export const rateProduct = async (req, res, next) => {
  const { userId } = req.user;
  const { productId, rating, comment } = req.matchedData;

  const session = await startSession();
  session.startTransaction();

  try {
    const fetchedProduct = await Product.findOne({ _id: productId })
      .select('averageRating ratingCount')
      .session(session);

    if (!fetchedProduct) {
      throw new BadRequestError('Product Not Found');
    }

    const { averageRating, ratingCount } = fetchedProduct;
    let oldAverageRating = averageRating;
    let numberOfRatings = ratingCount;
    let newUserRating = rating;
    let newAverageRating;

    // Check for existing rating
    const existingRating = await Rating.findOne({
      productId: productId,
      userId: userId,
    }).session(session);

    if (!existingRating) {
      newAverageRating = calculateNewAverageRating(
        oldAverageRating,
        numberOfRatings,
        newUserRating
      );
      numberOfRatings += 1; // Increase the count of ratings

      const newRate = new Rating({
        productId: productId,
        userId: userId,
        rating: rating,
        comment: comment,
      });

      await newRate.save({ session });
    } else {
      const oldUserRating = existingRating.rating;
      newAverageRating = updateAverageRating(
        oldAverageRating,
        numberOfRatings,
        oldUserRating,
        newUserRating
      );

      await Rating.findOneAndUpdate(
        { productId: productId, userId: userId },
        { rating: rating, comment: comment },
        { session }
      );
    }

    // Update product with new average rating and rating count
    await Product.findOneAndUpdate(
      { _id: productId },
      { averageRating: newAverageRating, ratingCount: numberOfRatings },
      { new: true, runValidators: true, session }
    );

    const ratedUser = await User.findOne({ _id: userId })
      .select('_id firstname lastname profilePic')
      .lean();

    await session.commitTransaction();

    res.status(StatusCodes.OK).json({
      status: true,
      rating: rating,
      user: ratedUser,
      message: `You Rated ${rating} out 5`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  } finally {
    await session.endSession();
  }
};

// Add to cart
export const addtoCart = async (req, res) => {
  const { userId } = req.user;
  const { productid } = req.matchedData;

  // Check If the User is Already Registered
  const fetchedUser = await User.findOne({ _id: userId }).select('_id');

  if (!fetchedUser) {
    throw new UnauthenticatedError('Logged In First');
  }

  // Check If the Product is Exist
  const fetchedProduct = await Product.findOne({ _id: productid }).select(
    '_id'
  );

  if (!fetchedProduct) {
    throw new BadRequestError('Product Id Not Found');
  }

  // Check If the Item is added to the cart with the same user id
  const checkCart = await Cart.findOne({
    userid: userId,
    productid: productid,
  }).select('_id');

  if (checkCart) {
    throw new ConventionError('Item In Cart');
  }

  const newCart = new Cart({ userid: userId, productid: productid });

  await newCart.save();

  res
    .status(StatusCodes.CREATED)
    .json({ status: true, message: 'Added to cart' });
};

// Get Cart Items
export const getCart = async (req, res) => {
  const { userId } = req.user;

  // Fetch items in cart with user ID
  const fetchedCarts = await Cart.find({ userid: userId }).lean();

  if (!fetchedCarts || fetchedCarts.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: true,
      message: 'No items in cart',
      length: 0,
      result: [],
    });
  }

  // Extract product IDs from cart items
  const idArray = fetchedCarts.map((item) => item.productid.toString());

  // Fetch product data based on product IDs in the cart
  const fetchedProducts = await Product.find({ _id: { $in: idArray } })
    .select('name price ratingCount averageRating imageUrl stock isActive')
    .lean();

  // Combine cart items with their respective product details
  const result = fetchedCarts.map((cartItem) => {
    const product = fetchedProducts.find(
      (product) => product._id.toString() === cartItem.productid.toString()
    );

    return { ...cartItem, product };
  });

  res
    .status(StatusCodes.OK)
    .json({ length: result.length, status: true, result });
};

// Get User Profile
export const getProfile = async (req, res) => {
  const { userId } = req.user;
  const { userId: id } = req.matchedData;

  // Check If the token userId and Id from request params is Match
  if (id !== userId) {
    throw new ForbiddenError('Forbidden Request');
  }

  // Fetch the User Info with UserId from
  const fetchedUser = await User.findOne({ _id: userId })
    .select('-password -refreshToken')
    .lean();

  if (!fetchedUser) {
    throw new UnauthenticatedError('No User Found');
  }

  res.status(StatusCodes.OK).json({ status: true, result: fetchedUser });
};

// Get User Profile
export const getProduct = async (req, res) => {
  const { userId } = req.user;
  const { productId } = req.matchedData;

  // Fetch the User Info with UserId from
  const fetchedProduct = await Product.findOne({
    userId: userId,
    _id: productId,
  }).lean();

  if (!fetchedProduct) {
    throw new ForbiddenError('Forbidden Request');
  }
  res.status(StatusCodes.OK).json({ status: true, result: fetchedProduct });
};

// ======= PUT METHOD CONTROLLERS ========

// Update Profile
export const updateProfile = async (req, res) => {
  // Logged In user ID
  const { userId } = req.user;

  // Validated Inputs
  const {
    _id,
    firstname,
    lastname,
    email,
    phone,
    street,
    city,
    state,
    postalCode,
    country,
  } = req.matchedData;

  // To check the match of IDs
  if (userId !== _id) {
    throw new ForbiddenError('Forbidden Request');
  }

  const address = { street, city, state, postalCode, country };

  const updatedData = { firstname, lastname, email, phone, address };

  const checkEmail = await User.findOne({ _id: { $ne: userId }, email: email });

  if (checkEmail) {
    throw new BadRequestError('Email already taken');
  }

  const updatedProfile = await User.findOneAndUpdate(
    { _id: userId },
    updatedData,
    { new: true, runValidators: true }
  );

  if (!updatedProfile) {
    throw new NotFoundError('User Not Found');
  }

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'User Profile Updated' });
};

// Update Banner
export const updateBanner = async (req, res) => {
  const { userId } = req.user;
  const { oldPublicId } = req.matchedData;

  const fetchedUser = await User.findOne({
    _id: userId,
    bannerPublicId: oldPublicId,
  }).select('bannerPublicId');

  if (!fetchedUser || fetchedUser?.bannerPublicId !== oldPublicId) {
    throw new BadRequestError('User Not Found');
  }

  const imageName = await uploadImage(req, 'bannerPic', 'banners');

  const updatedBanner = await User.findOneAndUpdate(
    { _id: userId, bannerPublicId: oldPublicId },
    { bannerPic: imageName, bannerPublicId: imageName },
    { new: true, runValidators: true }
  );

  if (!updatedBanner) {
    throw new NotFoundError('User Not Found');
  }

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Banner Picture updated' });
};

// Update Profile Picture
export const updateProfilePic = async (req, res) => {
  const { userId } = req.user;
  const { oldPublicId } = req.matchedData;

  const fetchedUser = await User.findOne({
    _id: userId,
    profilePublicId: oldPublicId,
  }).select('profilePublicId');

  if (!fetchedUser || fetchedUser?.profilePublicId !== oldPublicId) {
    throw new BadRequestError('User Not Found');
  }

  const imageName = await uploadImage(req, 'profilePic', 'profiles');

  const updatedProfilePic = await User.findOneAndUpdate(
    { _id: userId, profilePublicId: oldPublicId },
    { profilePic: imageName, profilePublicId: imageName },
    { new: true, runValidators: true }
  );

  if (!updatedProfilePic) {
    throw new NotFoundError('User Not Found');
  }

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Profile Picture updated' });
};

// Update Products
export const updateProduct = async (req, res) => {
  const { userId } = req.user;
  const { _id, sku, category, oldPublicId } = req.matchedData;

  // Check If category is exists
  const fetchedCategory = await Category.findOne({ _id: category }).select(
    '_id'
  );

  if (!fetchedCategory) {
    throw new BadRequestError('Category Not Found');
  }

  // checkSKU duplication
  if (sku) {
    const checkSKU = await Product.findOne({ sku }).select('sku');

    if (checkSKU) {
      throw new BadRequestError('Sku is taken');
    }
  }

  if (req.files) {
    if (!oldPublicId) {
      throw new BadRequestError('Product Not Found');
    }

    // Check If Image Url is exists
    const fetchedProduct = await Product.findOne({ _id: _id }).select(
      'publicId'
    );

    if (fetchedProduct?.publicId !== oldPublicId) {
      throw new BadRequestError('Product Not Found');
    }

    const imageName = await uploadImage(req, 'imageUrl', 'products');

    req.matchedData.imageUrl = imageName;
    req.matchedData.publicId = imageName;

    await deleteImage('products', oldPublicId);
  }

  const updatedData = { ...req.matchedData };
  delete updatedData._id;

  const updatedProduct = await Product.findOneAndUpdate(
    { _id: _id, userId: userId },
    updatedData,
    { new: true, runValidators: true }
  );

  if (!updatedProduct) {
    throw new NotFoundError('Product Not Found');
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Product Information Updated',
  });
};

// Increase Quantity in a cart
export const updateCart = async (req, res) => {
  const { userId } = req.user;
  const { _id, quantity } = req.matchedData;

  if (!userId) {
    throw new UnauthenticatedError('Login first');
  }

  const updatedCart = await Cart.findOneAndUpdate(
    { _id: _id, userid: userId },
    { quantity: quantity },
    { new: true, runValidators: true }
  );

  if (!updatedCart) {
    throw new BadRequestError('Item not found');
  }

  res.status(StatusCodes.OK).json({ status: true, message: 'Item Updated' });
};

// ======= DELETE METHOD CONTROLLERS ========

// Delete Product
export const deleteProduct = async (req, res, next) => {
  const { publicId } = req.matchedData;
  const { userId } = req.user;

  const fetchedPublicId = await Product.findOne({
    publicId: publicId,
    userId: userId,
  }).select('publicId');

  if (!fetchedPublicId?.publicId) {
    throw new BadRequestError('Product Not Found');
  }

  const isDeleted = await deleteImage('products', publicId);

  if (!isDeleted) {
    throw new BadRequestError('Product Not Deleted, please try again');
  }
  // Delete Product
  const fetchedProduct = await Product.findOneAndDelete({
    publicId: publicId,
    userId: userId,
  });

  if (!fetchedProduct) {
    throw new BadRequestError('Product Not Found');
  }

  res.status(StatusCodes.OK).json({ status: true, message: 'Product Deleted' });
};

// Delete Cart
export const deleteCart = async (req, res) => {
  const { id } = req.matchedData;
  const { userId } = req.user;

  // Delete Product
  const fetchedCart = await Cart.findOneAndDelete({ _id: id, userid: userId });

  if (!fetchedCart) {
    throw new BadRequestError('Cart Item Not Found');
  }
  res.status(StatusCodes.OK).json({ status: true, message: 'Item Removed' });
};

// Delete Banner Image
export const deleteBanner = async (req, res) => {
  const { publicId } = req.matchedData;
  const { userId } = req.user;

  const fetchedPublicId = await User.findOne({
    bannerPublicId: publicId,
    _id: userId,
  }).select('bannerPublicId');

  if (!fetchedPublicId?.bannerPublicId) {
    throw new BadRequestError('User Not Found');
  }

  const isDeleted = await deleteImage('banners', publicId);

  if (!isDeleted) {
    throw new BadRequestError('User Not Found');
  }

  // Delete Product
  const fetchedUser = await User.findOneAndUpdate(
    { bannerPublicId: publicId, _id: userId },
    { bannerPublicId: 'null', bannerPic: null },
    { new: true, runValidators: true }
  );

  if (!fetchedUser) {
    throw new BadRequestError('User Not Found');
  }
  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Banner Image Deleted' });
};

// Delete Profile Pic
export const deleteProfilePic = async (req, res) => {
  const { publicId } = req.matchedData;
  const { userId } = req.user;

  // Step 1: Check if user and image exist
  const fetchedPublicId = await User.findOne({
    profilePublicId: publicId,
    _id: userId,
  }).select('profilePublicId');

  if (!fetchedPublicId?.profilePublicId) {
    throw new BadRequestError('User Not Found');
  }

  const isDeleted = await deleteImage('profiles', publicId);

  if (!isDeleted) {
    throw new BadRequestError('User Not Found');
  }

  // Step 3: Update User in MongoDB
  const fetchedUser = await User.findOneAndUpdate(
    { profilePublicId: publicId, _id: userId },
    { profilePublicId: 'null', profilePic: null },
    { new: true, runValidators: true }
  );

  if (!fetchedUser) {
    throw new BadRequestError('User Not Found');
  }

  // Step 6: Respond to client indicating successful deletion
  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Profile Picture Deleted' });
};
