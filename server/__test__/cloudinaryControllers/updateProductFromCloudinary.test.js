import { StatusCodes } from 'http-status-codes';
import { updateProductFromCloudinary } from '../../controllers/cloudinaryControllers.js';
import Product from '../../model/Product.js';
import Category from '../../model/Category.js';
import { NotFoundError, BadRequestError } from '../../errors/index.js';
import { updateCloudinaryImage } from '../../utils/updateCloudinaryImage.js';

jest.mock('../../model/Product.js');
jest.mock('../../model/Category.js');
jest.mock('../../utils/updateCloudinaryImage.js');

describe('Update Profile Controller', () => {
  let mockRequest;
  let mockResponse;
  let updatedData;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        name: 'Vivo 20 pro max',
        description: 'Latest Iphone',
        price: 1099.99,
        stock: 141,
        category: '666c2f5b16d36a7b4b5dbf26',
        brand: 'Vivo',
        weight: 2,
        dimensions: '10x5x2',
        isActive: true,
        _id: '667133ca2a9f18f4a6d777f2',
        oldPublicId: '123myimage.jpg',
      },
      user: {
        userId: '66705e325a40560fa8f3a358',
      },

      files: {
        imageUrl: {
          name: 'amo.JPG',
          size: 630375,
          encoding: '7bit',
          tempFilePath:
            'C:\\Users\\Amoo\\Desktop\\Portfolio\\Ecommerce\\server\\tmp\\tmp-1-1718695841755',
          truncated: false,
          mimetype: 'image/jpeg',
          md5: 'fa3bd879778eeb8fdf2877535b44ad6b',
          mv: jest.fn(),
        },
      },
    };

    updatedData = {
      _id: '667133ca2a9f18f4a6d777f2',
      name: 'Vivo 20 pro max',
      description: 'Latest Iphone',
      price: 1099.99,
      stock: 141,
      category: '666c2f5b16d36a7b4b5dbf26',
      brand: 'Vivo',
      averageRating: 0,
      ratingCount: 0,
      imageUrl:
        'https://res.cloudinary.com/dahgxnpog/image/upload/v1718814458/products/vvjt2yuxt82embinbgxj.jpg',
      publicId: 'products/vvjt2yuxt82embinbgxj',
      weight: 2,
      dimensions: '10x5x2',
      isActive: true,
      userId: '66705e325a40560fa8f3a358',
      sku: 'SKU-7582bab0-af3a-4b27-9e57-0d756c3e5fb9',
      createdAt: '2024-06-18T07:14:18.244+00:00',
      updatedAt: '2024-06-18T07:14:18.244+00:00',
      __v: '0',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 200 status code when the Profile Pic is updated', async () => {
    await Category.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ _id: '666c2f5b16d36a7b4b5dbf26' }),
    }));

    await Product.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        publicId: '123myimage.jpg',
      }),
    }));

    await updateCloudinaryImage.mockImplementation(() => ({
      imageUrl:
        'https://res.cloudinary.com/dahgxnpog/image/upload/v1718814458/products/vvjt2yuxt82embinbgxj.jpg',
      publicId: 'products/vvjt2yuxt82embinbgxj',
    }));

    await Product.findOneAndUpdate.mockResolvedValue(updatedData);

    await updateProductFromCloudinary(mockRequest, mockResponse);
    const { _id, ...requestWithoutId } = mockRequest.matchedData;

    expect(Product.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockRequest.matchedData._id, userId: mockRequest.user.userId },
      requestWithoutId,
      { new: true, runValidators: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Product Information Updated',
    });
  });

  it('Should return 404 status code when Product Not Found the Profile Pic is updated', async () => {
    await Category.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ _id: '666c2f5b16d36a7b4b5dbf26' }),
    }));

    await Product.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        publicId: '123myimage.jpg',
      }),
    }));

    await updateCloudinaryImage.mockImplementation(() => ({
      imageUrl:
        'https://res.cloudinary.com/dahgxnpog/image/upload/v1718814458/products/vvjt2yuxt82embinbgxj.jpg',
      publicId: 'products/vvjt2yuxt82embinbgxj',
    }));

    await Product.findOneAndUpdate.mockResolvedValue(null);

    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(NotFoundError);
    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('Product Not Found');
  });

  it('Should throw 400 bad request error when public Id mismatch', async () => {
    await Category.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ _id: '666c2f5b16d36a7b4b5dbf26' }),
    }));

    await Product.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        publicId: '456myimage.jpg',
      }),
    }));

    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('Product Not Found');
  });

  it('Should throw 400 bad request error when old public Id is not defined', async () => {
    await Category.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ _id: '666c2f5b16d36a7b4b5dbf26' }),
    }));

    mockRequest.matchedData.oldPublicId = null;

    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('Product Not Found');
  });

  it('Should throw 400 bad request error when sku is taken', async () => {
    await Category.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ _id: '666c2f5b16d36a7b4b5dbf26' }),
    }));

    mockRequest.matchedData.sku = 'SKU-7582bab0-af3a-4b27-9e57-0d756c3e5fb9';

    Product.findOne.mockImplementation(() => ({
      select: jest
        .fn()
        .mockResolvedValue({ sku: 'SKU-7582bab0-af3a-4b27-9e57-0d756c3e5fb9' }),
    }));

    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('Sku is taken');
  });

  it('Should throw 400 bad request error when category Id is invalid', async () => {
    await Category.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));

    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      updateProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('Category Not Found');
  });
});
