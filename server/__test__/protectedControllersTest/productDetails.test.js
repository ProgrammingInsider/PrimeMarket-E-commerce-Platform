import { StatusCodes } from 'http-status-codes';
import { productDetail } from '../../controllers/protectedControllers.js';
import Product from '../../model/Product.js';
import User from '../../model/User.js'; // Add this import
import { roles } from '../../config/roles.js';
import { BadRequestError } from '../../errors/index.js';

jest.mock('../../model/Product.js');
jest.mock('../../model/User.js'); // Mock User model
jest.mock('../../config/roles.js');

describe('Product Details Controller', () => {
  let mockRequest;
  let mockResponse;
  let result;
  let userResult;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        productid: '665ec4fef89dad2855300df8',
      },

      user: {
        userId: '6659be79e4d7096e0dd85b1f',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    result = {
      _id: '665ec4fef89dad2855300df8',
      name: '"Iphone 15 pro max"',
      description: '"Latest Iphone"',
      price: 49.99,
      stock: 100,
      category: '665aede8446847bd5644edd0',
      brand: '"Iphone"',
      averageRating: 1.5,
      ratingCount: 100,
      imageUrl: '1717486846312amo crop.JPG',
      weight: 1.5,
      dimensions: '"10x5x2"',
      isActive: true,
      userId: '6659be79e4d7096e0dd85b1f',
      sku: 'SKU-8f6890e3-55ae-478d-be61-177395d950c6',
      createdAt: '2024-06-04T07:40:46.360Z',
      updatedAt: '2024-06-04T07:40:46.360Z',
      __v: 0,
    };

    userResult = {
      profilePic: 'profile-pic-url',
      firstname: 'John',
      lastname: 'Doe',
    };
  });

  it('Should return 200 status code when the products fetched and the user role is being owner', async () => {
    Product.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(result),
    });
    User.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(userResult),
    });

    await productDetail(mockRequest, mockResponse);

    expect(Product.findOne).toHaveBeenCalledWith({
      _id: mockRequest.matchedData.productid,
      isActive: true,
      stock: { $gt: 0 },
    });
    expect(User.findOne).toHaveBeenCalledWith({
      _id: result.userId,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      result: { ...result, ...userResult },
      role: roles['owner'],
    });
  });

  it('Should return 200 status code when the products fetched and the user role is being user', async () => {
    Product.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(result),
    });
    User.findOne.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(userResult),
    });
    mockRequest.user.userId = '6659cfe1e6ab6334094287bf';

    await productDetail(mockRequest, mockResponse);

    expect(Product.findOne).toHaveBeenCalledWith({
      _id: mockRequest.matchedData.productid,
      isActive: true,
      stock: { $gt: 0 },
    });
    expect(User.findOne).toHaveBeenCalledWith({
      _id: result.userId,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      result: { ...result, ...userResult },
      role: roles['user'],
    });
  });

  it('Should throw bad request if there is no product with that Id', async () => {
    Product.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    await expect(productDetail(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(productDetail(mockRequest, mockResponse)).rejects.toThrowError(
      'Product Not Found'
    );
  });
});
