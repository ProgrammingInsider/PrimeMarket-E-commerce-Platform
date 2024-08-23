// Packages
import { StatusCodes } from 'http-status-codes';
import Jwt from 'jsonwebtoken';
import Category from '../model/Category.js';
import dotenv from 'dotenv';
import Product from '../model/Product.js';
import Rating from '../model/Rate.js';
dotenv.config();

// Models
import User from '../model/User.js';

// Errors
import {
  ConventionError,
  UnauthenticatedError,
  BadRequestError,
  ForbiddenError,
  CsrfNotProvideError,
  NoContentError,
} from '../errors/index.js';

// Utils
import { tokenService } from '../utils/tokenService.js';

// Fetch CSRF Token
export const csrfToken = async (req, res) => {
  if (!req.csrfToken()) {
    throw new CsrfNotProvideError('Invalid CSRF');
  }
  res.status(StatusCodes.OK).json({ csrfToken: req.csrfToken() });
};

// Controllers to SignUp or Register Users
export const signupUser = async (req, res) => {
  // Extract user data from request body
  const {
    firstname,
    lastname,
    email,
    phone,
    password,
    confirmpassword,
    street,
    city,
    state,
    postalcode,
    country,
  } = req.matchedData;
  const address = { street, city, state, postalcode, country };

  if (password !== confirmpassword) {
    throw new BadRequestError('Passwords do not match');
  }

  // Check wether there is a registeration with the email
  const checkUser = await User.findOne({ email });

  if (checkUser) {
    throw new ConventionError('Email address is already registered');
  }

  // Create a new user document
  const newUser = new User({
    firstname,
    lastname,
    email,
    phone,
    password,
    address,
  });

  // Save the user document to the database
  await newUser.save();

  res
    .status(StatusCodes.CREATED)
    .json({ status: true, message: 'User Registered Successfully' });
};

// Controller to login
export const login = async (req, res) => {
  const { email, password } = req.matchedData;

  const checkUser = await User.findOne({ email });

  if (!checkUser) {
    throw new UnauthenticatedError('Email address is not registered');
  }

  const isMatch = await checkUser.comparepassword(password);

  if (!isMatch) {
    throw new UnauthenticatedError('Incorrect Password');
  }

  const { _id, firstname, lastname } = checkUser;

  const payload = { userId: _id, firstname, lastname };

  // Generate Token
  const { accessToken, refreshToken } = tokenService(payload);

  await User.findOneAndUpdate(
    { _id },
    { refreshToken },
    { new: true, runValidators: true }
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 3000,
    sameSite: 'None',
    secure: true,
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Logged In successfully',
    userId: _id,
    firstname,
    lastname,
    accessToken,
  });
};

// Refresh Token

export const refreshToken = async (req, res) => {
  const { refreshToken: refreshTokenCookie } = req.cookies;

  if (!refreshTokenCookie) {
    throw new ForbiddenError('Forbidden Request');
  }

  // Check if the refresh token stored on database
  const user = await User.findOne({ refreshToken: refreshTokenCookie });

  if (!user) {
    throw new ForbiddenError('Forbidden Request');
  } else {
    try {
      const decode = Jwt.verify(
        refreshTokenCookie,
        process.env.REFRESH_TOKEN_SECRET
      );

      if (!decode) {
        throw new ForbiddenError('Forbidden Request');
      }

      const { _id, firstname, lastname } = user;
      const payload = { userId: _id, firstname, lastname };

      const accessToken = Jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      });

      res.status(StatusCodes.OK).json({
        status: true,
        userId: _id,
        firstname,
        lastname,
        accessToken,
      });
    } catch (error) {
      throw new ForbiddenError('Forbidden Request');
    }
  }
};

// LOGOUT
export const logout = async (req, res) => {
  const { refreshToken: refreshTokenCookie } = req.cookies;

  if (!refreshTokenCookie) {
    throw new NoContent('No Content to send back');
  }

  const checkRefreshToken = await User.findOne({
    refreshToken: refreshTokenCookie,
  });

  if (checkRefreshToken) {
    const updateRefreshToken = await User.findOneAndUpdate(
      { refreshToken: refreshTokenCookie },
      { refreshToken: null },
      { new: true, runValidators: true }
    );

    if (updateRefreshToken) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
      });
      throw new NoContent('No Content to send back');
    }
  } else {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    throw new NoContent('No Content to send back');
  }
};

// Get Product Category
export const getCategory = async (req, res) => {
  const results = await Category.find({}).sort('slug');

  res.status(StatusCodes.OK).json({ status: true, results });
};

// Filter Products
export const filterProducts = async (req, res) => {
  let {
    categoryid,
    rating,
    lowprice,
    highprice,
    sort,
    parentcategory,
    search,
  } = req.query;

  const queryFilters = { isActive: true };

  rating = Math.floor(rating); // Round down the rating number 3.9 -> 3

  if (categoryid) {
    queryFilters.category = categoryid;
  }

  if (parentcategory) {
    queryFilters.parent_category = parentcategory;
  }

  // It is only applicable if the rate is between 0 - 5
  if (rating && rating > 0 && rating <= 5) {
    queryFilters.averageRating = {
      $gte: Number(rating),
      $lte: rating === 5 ? Number(rating) : Number(rating) + 0.9,
    };
  }

  // It is only applicable if both low and high price are provided
  if (lowprice && highprice && Number(lowprice) <= Number(highprice)) {
    queryFilters.price = { $gte: Number(lowprice), $lte: Number(highprice) };
  }

  // Add search functionality to filter by name or description
  if (search) {
    queryFilters.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Predefined sort options
  const sortOptions = {
    recent: '-createdAt',
    expensive: '-price',
    cheapest: 'price',
    rate: '-averageRating',
  };

  // By default, the products are sorted based on recent posts
  const sortOption = sortOptions[sort] || sortOptions.recent;

  try {
    const products = await Product.find(queryFilters)
      .sort(sortOption)
      .select(
        'name description averageRating price ratingCount imageUrl publicId category'
      );

    res
      .status(StatusCodes.OK)
      .json({ length: products.length, status: true, results: products });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: false, message: 'Error fetching products', error });
  }
};

// Get Rating
export const getRate = async (req, res) => {
  const { id } = req.params;

  // Fetch ratings for the given product
  const fetchedRate = await Rating.find({ productId: id });

  if (!fetchedRate || fetchedRate.length === 0) {
    return res.status(StatusCodes.OK).json({
      status: true,
      length: fetchedRate.length,
      message: 'No Rate Found',
      result: [],
    });
  }

  // Extract user IDs from the fetched ratings
  const userIds = fetchedRate.map((rate) => rate.userId);

  // Fetch user information for the extracted user IDs
  const fetchedUserInfo = await User.find({ _id: { $in: userIds } }).select(
    'profilePic firstname lastname'
  );

  // Create a map of user information for easy lookup
  const userMap = fetchedUserInfo.reduce((acc, user) => {
    acc[user._id] = user;
    return acc;
  }, {});

  // Combine rating data with user data
  const combinedData = fetchedRate.map((rate) => ({
    ...rate.toObject(),
    user: userMap[rate.userId],
  }));

  // Respond with the combined data
  res.status(StatusCodes.OK).json({
    status: true,
    length: fetchedRate.length,
    result: combinedData,
  });
};
