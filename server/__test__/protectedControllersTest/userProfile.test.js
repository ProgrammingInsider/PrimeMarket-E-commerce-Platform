import { StatusCodes } from 'http-status-codes';
import { userProfile } from '../../controllers/protectedControllers.js';
import Product from '../../model/Product.js';
import User from '../../model/User.js';
import { roles } from '../../config/roles.js';
import { BadRequestError } from '../../errors';

jest.mock('../../model/Product.js');
jest.mock('../../model/User.js');

describe('User Profile Controller', () => {
  let mockRequest;
  let mockResponse;
  let fetchedUser;
  let fetchedProduct;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        userid: '6659cfe1e6ab6334094287bf',
      },
      user: {
        userId: '6659cfe1e6ab6334094287bf',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    fetchedUser = {
      address: {
        street: 'Africa Avenue Road',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
      },
      _id: '6659cfe1e6ab6334094287bf',
      firstname: 'Amanuel',
      lastname: 'Abera',
      email: 'amanuelabera47@gmail.com',
      phone: '0922112208',
      isVerified: false,
      createdAt: '2024-05-31T13:25:53.797Z',
      updatedAt: '2024-06-06T16:20:23.156Z',
      __v: 0,
    };

    fetchedProduct = [
      {
        _id: '66619254965456da5c727e41',
        name: '"Vivo 20 pro max"',
        description: '"Latest Iphone"',
        price: 699.99,
        averageRating: 1.5,
        ratingCount: 100,
        imageUrl: '1717670484156portfolio.jpg',
        userId: '6659cfe1e6ab6334094287bf',
      },
    ];
  });

  it('Should return 200 status code when user profile displayed', async () => {
    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(fetchedUser),
    }));

    Product.find.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(fetchedProduct),
    }));

    await userProfile(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      user: fetchedUser,
      productQuantity: fetchedProduct.length,
      products: fetchedProduct,
      role: roles['owner'],
    });
  });

  it('Should throw bad request when user not found', async () => {
    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));

    await expect(userProfile(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(userProfile(mockRequest, mockResponse)).rejects.toThrow(
      'User Not Found'
    );
  });
});
