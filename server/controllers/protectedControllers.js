import { StatusCodes } from 'http-status-codes';
import { roles } from '../config/roles.js';
import Product from '../model/Product.js';
import User from '../model/User.js';
import { BadRequestError } from '../errors/index.js';

// Product Detail Controllers
export const productDetail = async (req, res) => {
  const { productid } = req.matchedData;
  let position = 'user';

  const fetchedProduct = await Product.findOne({
    _id: productid,
    isActive: true,
    stock: { $gt: 0 },
  }).lean();

  if (!fetchedProduct) {
    throw new BadRequestError('Product Not Found');
  }

  if (req.user && fetchedProduct.userId.toString() === req.user.userId) {
    position = 'owner';
  }

  const fetchedUser = await User.findOne({
    _id: fetchedProduct.userId,
  })
    .select('profilePic firstname lastname')
    .lean();

  if (!fetchedUser) {
    throw new BadRequestError('User Not Found');
  }

  res.status(StatusCodes.OK).json({
    status: true,
    result: { ...fetchedProduct, ...fetchedUser },
    role: roles[position],
  });
};

export const userProfile = async (req, res) => {
  const { userid } = req.matchedData;

  let position = 'user';

  const fetchedUser = await User.findOne({ _id: userid }).select(
    '-password -refreshToken'
  );

  if (!fetchedUser) {
    throw new BadRequestError('User Not Found');
  }

  if (req.user && fetchedUser._id.toString() === req.user.userId) {
    position = 'owner';
  }

  const fetchedProduct = await Product.find({ userId: fetchedUser._id }).select(
    'name description averageRating price ratingCount imageUrl publicId'
  );

  res.status(StatusCodes.OK).json({
    status: true,
    user: fetchedUser,
    productQuantity: fetchedProduct.length,
    products: fetchedProduct,
    role: roles[position],
  });
};
