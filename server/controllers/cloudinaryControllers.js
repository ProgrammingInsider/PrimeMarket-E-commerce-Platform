import { StatusCodes } from 'http-status-codes';
import Category from '../model/Category.js';
import Product from '../model/Product.js';
import User from '../model/User.js';
import { startSession } from 'mongoose';

import { BadRequestError, NotFoundError } from '../errors/index.js';

import { uploadCloudinaryImage } from '../utils/uploadCloudinaryImage.js';
import { updateCloudinaryImage } from '../utils/updateCloudinaryImage.js';
import { deleteCloudinaryImage } from '../utils/deleteCloudinaryImage.js';

// Post Product on Cloudinary
export const postProductToClouldinary = async (req, res) => {
  const { userId } = req.user;
  const { sku, category } = req.matchedData;

  // Check If category is exists
  const fetchedCategory = await Category.findOne({ _id: category }).select(
    '_id parent_category'
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

  // Start a MongoDB session and transaction
  const session = await startSession();
  session.startTransaction();

  let cloudinaryImagePublicId;

  try {
    // Step 1: Upload the image to Cloudinary
    const { imageUrl, publicId } = await uploadCloudinaryImage(
      req,
      'imageUrl',
      'products'
    );

    cloudinaryImagePublicId = publicId;

    // Step 2: Create a new product and save it in MongoDB within the transaction
    const newProduct = new Product({
      imageUrl,
      userId,
      publicId,
      parent_category: fetchedCategory.parent_category,
      ...req.matchedData,
    });

    await newProduct.save({ session });

    // Step 3: Commit the transaction
    await session.commitTransaction();

    res
      .status(StatusCodes.CREATED)
      .json({ status: true, message: 'Product Uploaded' });
  } catch (error) {
    // Step 4: Abort the transaction if anything goes wrong
    await session.abortTransaction();

    // If the Cloudinary upload succeeded but MongoDB update failed, delete the uploaded image
    if (cloudinaryImagePublicId) {
      await deleteCloudinaryImage(cloudinaryImagePublicId);
    }

    throw error;
  } finally {
    session.endSession();
  }
};

// Update Products and Upload an Image on Cloudinary
export const updateProductFromCloudinary = async (req, res) => {
  const { userId } = req.user;
  const { _id, sku, category, oldPublicId } = req.matchedData;

  // Check If category is exists
  const fetchedCategory = await Category.findOne({ _id: category }).select(
    '_id parent_category'
  );

  if (!fetchedCategory) {
    throw new BadRequestError('Category Not Found');
  }

  // checkSKU duplication
  if (sku) {
    const checkSKU = await Product.findOne({ _id: { $ne: _id }, sku: sku });

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

    const { imageUrl, publicId } = await updateCloudinaryImage(
      req,
      'imageUrl',
      'products',
      oldPublicId
    );
    req.matchedData.imageUrl = imageUrl;
    req.matchedData.publicId = publicId;
  }

  const updatedData = {
    ...req.matchedData,
    parent_category: fetchedCategory.parent_category,
  };
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

// Update Banner and Upload Image on Cloudinary
export const updateBannerFromCloudinary = async (req, res) => {
  const { userId } = req.user;
  const { oldPublicId } = req.matchedData;

  const fetchedUser = await User.findOne({
    _id: userId,
    bannerPublicId: oldPublicId,
  }).select('bannerPublicId');

  if (!fetchedUser || fetchedUser?.bannerPublicId !== oldPublicId) {
    throw new BadRequestError('User Not Found');
  }

  const { imageUrl, publicId } = await updateCloudinaryImage(
    req,
    'bannerPic',
    'banners',
    oldPublicId
  );

  const updatedBanner = await User.findOneAndUpdate(
    { _id: userId, bannerPublicId: oldPublicId },
    { bannerPic: imageUrl, bannerPublicId: publicId },
    { new: true, runValidators: true }
  );

  if (!updatedBanner) {
    throw new NotFoundError('User Not Found');
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Banner Picture updated',
    url: imageUrl,
    publicId: publicId,
  });
};

// Update Profile Picture and Upload an Image on Cloudinary
export const updateProfilePicFromCloudinary = async (req, res) => {
  const { userId } = req.user;
  const { oldPublicId } = req.matchedData;

  const fetchedUser = await User.findOne({
    _id: userId,
    profilePublicId: oldPublicId,
  }).select('profilePublicId');

  if (!fetchedUser || fetchedUser?.profilePublicId !== oldPublicId) {
    throw new BadRequestError('User Not Found');
  }

  const { imageUrl, publicId } = await updateCloudinaryImage(
    req,
    'profilePic',
    'profiles',
    oldPublicId
  );

  const updatedProfilePic = await User.findOneAndUpdate(
    { _id: userId, profilePublicId: oldPublicId },
    { profilePic: imageUrl, profilePublicId: publicId },
    { new: true, runValidators: true }
  );

  if (!updatedProfilePic) {
    throw new NotFoundError('User Not Found');
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Profile Picture updated',
    url: imageUrl,
    publicId: publicId,
  });
};

// Delete Product From Cloudinary
export const deleteProductFromCloudinary = async (req, res, next) => {
  const { publicId } = req.matchedData;
  const { userId } = req.user;

  // Delete image from Cloudinary first
  const isDeletedFromCloudinary = await deleteCloudinaryImage(publicId);

  if (!isDeletedFromCloudinary) {
    throw new BadRequestError(
      'Product Image Not Deleted from Cloudinary, please try again'
    );
  }

  // Delete product from MongoDB
  const fetchedProduct = await Product.findOneAndDelete({
    publicId: publicId,
    userId: userId,
  });

  if (!fetchedProduct) {
    // If deletion from Cloudinary succeeded but product not found in MongoDB, handle accordingly
    // You can log this event for further investigation if needed
    throw new BadRequestError('Product Not Found in Database');
  }

  res.status(StatusCodes.OK).json({ status: true, message: 'Product Deleted' });
};

// Delete Banner Image From Cloudinary
export const deleteBannerFromCloudinary = async (req, res) => {
  const { publicId } = req.matchedData;
  const { userId } = req.user;

  // Delete image from Cloudinary
  const isDeletedFromCloudinary = await deleteCloudinaryImage(publicId);

  if (!isDeletedFromCloudinary) {
    throw new BadRequestError(
      'Banner Image Not Deleted from Cloudinary, please try again'
    );
  }

  // Update user document in MongoDB
  const fetchedUser = await User.findOneAndUpdate(
    { bannerPublicId: publicId, _id: userId },
    { $set: { bannerPublicId: 'null', bannerPic: 'null' } },
    { new: true, runValidators: true }
  );

  if (!fetchedUser) {
    // If image deletion succeeded but user document not found, handle accordingly
    throw new BadRequestError('User Not Found');
  }

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Banner Image Deleted' });
};

// Delete Profile Pic From Cloudinary
export const deleteProfilePicFromCloudinary = async (req, res) => {
  const { publicId } = req.matchedData;
  const { userId } = req.user;

  // Delete image from Cloudinary
  const isDeletedFromCloudinary = await deleteCloudinaryImage(publicId);

  if (!isDeletedFromCloudinary) {
    throw new BadRequestError(
      'Profile Picture Not Deleted from Cloudinary, please try again'
    );
  }

  // Update user document in MongoDB
  const fetchedUser = await User.findOneAndUpdate(
    { profilePublicId: publicId, _id: userId },
    { $set: { profilePublicId: 'null', profilePic: 'null' } },
    { new: true, runValidators: true }
  );

  if (!fetchedUser) {
    // If image deletion succeeded but user document not found, handle accordingly
    throw new BadRequestError('User Not Found');
  }

  res
    .status(StatusCodes.OK)
    .json({ status: true, message: 'Profile Picture Deleted' });
};
