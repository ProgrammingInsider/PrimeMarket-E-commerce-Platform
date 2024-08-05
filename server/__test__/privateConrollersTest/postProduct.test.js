import Product from '../../model/Product.js';
import { StatusCodes } from 'http-status-codes';
import { uploadImage } from '../../utils/uploadImageLocally.js';
import { postProduct } from '../../controllers/privateControllers.js';
import {
  BadRequestError,
  ForbiddenError,
  UnauthenticatedError,
} from '../../errors/index.js';
import User from '../../model/User.js';
import Category from '../../model/Category.js';

jest.mock('../../model/Product.js');
jest.mock('../../model/User.js');
jest.mock('../../model/Category.js');
jest.mock('../../utils/uploadImageLocally.js');

describe('Post Product Controller', () => {
  let mockRequest;
  let mockResponse;
  beforeAll(() => {
    mockRequest = {
      matchedData: {
        name: 'Iphone 15 pro max',
        description: 'Latest Iphone',
        price: 49.99,
        stock: 100,
        category: '665aeda3446847bd5644edcc',
        brand: 'Iphone',
        averageRating: 4.5,
        ratingCount: 100,
        sku: 'ABC125',
        weight: 1.5,
        dimensions: '10x5x2',
        isActive: true,
        _csrf: '{{csrfToken}}',
      },
      user: {
        userId: '6659be79e4d7096e0dd85b1f',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 201 status code when new product created', async () => {
    Product.findOne.mockResolvedValue(null);
    uploadImage.mockResolvedValue('myImage.jpg');
    const savedMethod = jest
      .spyOn(Product.prototype, 'save')
      .mockResolvedValue({
        _id: '123',
        ...mockRequest.matchedData,
      });

    User.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue({
        _id: '6659be79e4d7096e0dd85b1f',
      }),
    }));

    Category.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue({
        _id: '665aeda3446847bd5644edcc',
      }),
    }));

    User.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue({
        _id: '6659be79e4d7096e0dd85b1f',
      }),
    }));

    await postProduct(mockRequest, mockResponse);

    expect(Product).toHaveBeenCalledWith({
      publicId: 'myImage.jpg',
      imageUrl: 'myImage.jpg',
      userId: mockRequest.user.userId,
      ...mockRequest.matchedData,
    });
    expect(savedMethod).toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Product Uploaded',
    });
  });

  it('It should throw bad request if there is duplicate SKU', async () => {
    mockRequest.user.userId = '6659be79e4d7096e0dd85b1f';
    Product.findOne.mockResolvedValue({});

    User.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue({
        _id: '6659be79e4d7096e0dd85b1f',
      }),
    }));

    Category.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue({
        _id: '665aeda3446847bd5644edcc',
      }),
    }));

    await expect(postProduct(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(postProduct(mockRequest, mockResponse)).rejects.toThrowError(
      'Sku is taken'
    );
  });

  it('Should throw forbidden error if user Id is invalid or null', async () => {
    mockRequest.user.userId = null;

    await expect(postProduct(mockRequest, mockResponse)).rejects.toThrow(
      ForbiddenError
    );
    await expect(postProduct(mockRequest, mockResponse)).rejects.toThrowError(
      'Forbidden Request'
    );
  });

  it('Should throw Unauthenticated error if user Id is not registered', async () => {
    mockRequest.user.userId = '1234';

    User.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue(null),
    }));

    Category.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue({
        _id: '665aeda3446847bd5644edcc',
      }),
    }));

    await expect(postProduct(mockRequest, mockResponse)).rejects.toThrow(
      UnauthenticatedError
    );
    await expect(postProduct(mockRequest, mockResponse)).rejects.toThrowError(
      'Logged In First'
    );
  });

  it('Should throw bad request error if category Id is not registered', async () => {
    mockRequest.user.userId = '1234';

    User.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue({
        _id: '6659be79e4d7096e0dd85b1f',
      }),
    }));

    Category.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue(null),
    }));

    await expect(postProduct(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(postProduct(mockRequest, mockResponse)).rejects.toThrowError(
      'Category Not Found'
    );
  });
});
