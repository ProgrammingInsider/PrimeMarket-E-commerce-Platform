import { StatusCodes } from 'http-status-codes';
import { getCart } from '../../controllers/privateControllers.js';
import Cart from '../../model/Cart.js';
import Product from '../../model/Product.js';

jest.mock('../../model/Cart.js');
jest.mock('../../model/Product.js');

describe('Get Items In Cart Controller', () => {
  let mockRequest;
  let mockResponse;
  let fetchedCarts;
  let fetchedProducts;
  let result;

  beforeAll(() => {
    mockRequest = {
      user: {
        userId: '6659cfe1e6ab6334094287bf',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    fetchedCarts = [
      {
        _id: '6661b3781414549dab91840e',
        userid: '6659cfe1e6ab6334094287bf',
        productid: '665dff7920ecd7c0cddf549b',
        quantity: 1,
        status: 'active',
        createdAt: '2024-06-06T13:02:48.971Z',
        updatedAt: '2024-06-06T13:02:48.971Z',
        __v: 0,
      },

      {
        _id: '6661b46ba3b5e69612aeff85',
        userid: '6659cfe1e6ab6334094287bf',
        productid: '66619254965456da5c727e41',
        quantity: 1,
        status: 'active',
        createdAt: '2024-06-06T13:06:51.850Z',
        updatedAt: '2024-06-06T13:06:51.850Z',
        __v: 0,
      },
    ];

    fetchedProducts = [
      {
        _id: '665dff7920ecd7c0cddf549b',
        name: '"Iphone 15 pro max"',
        price: 49.99,
        stock: 100,
        averageRating: 4.5,
        ratingCount: 100,
        imageUrl: '1717436281317amo crop.JPG',
        isActive: true,
      },

      {
        _id: '66619254965456da5c727e41',
        name: '"Vivo 20 pro max"',
        price: 699.99,
        stock: 100,
        averageRating: 1.5,
        ratingCount: 100,
        imageUrl: '1717670484156portfolio.jpg',
        isActive: true,
      },
    ];

    result = [
      {
        _id: '6661b3781414549dab91840e',
        userid: '6659cfe1e6ab6334094287bf',
        productid: '665dff7920ecd7c0cddf549b',
        quantity: 1,
        status: 'active',
        createdAt: '2024-06-06T13:02:48.971Z',
        updatedAt: '2024-06-06T13:02:48.971Z',
        __v: 0,
        product: {
          _id: '665dff7920ecd7c0cddf549b',
          name: '"Iphone 15 pro max"',
          price: 49.99,
          stock: 100,
          averageRating: 4.5,
          ratingCount: 100,
          imageUrl: '1717436281317amo crop.JPG',
          isActive: true,
        },
      },
      {
        _id: '6661b46ba3b5e69612aeff85',
        userid: '6659cfe1e6ab6334094287bf',
        productid: '66619254965456da5c727e41',
        quantity: 1,
        status: 'active',
        createdAt: '2024-06-06T13:06:51.850Z',
        updatedAt: '2024-06-06T13:06:51.850Z',
        __v: 0,
        product: {
          _id: '66619254965456da5c727e41',
          name: '"Vivo 20 pro max"',
          price: 699.99,
          stock: 100,
          averageRating: 1.5,
          ratingCount: 100,
          imageUrl: '1717670484156portfolio.jpg',
          isActive: true,
        },
      },
    ];
  });

  it('Should return 200 status codes when get Items in cart that belongs to the user ID', async () => {
    await Cart.find.mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue(fetchedCarts),
    }));

    await Product.find.mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockResolvedValue(fetchedProducts),
      })),
    }));

    await getCart(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      length: result.length,
      status: true,
      result: result,
    });
  });

  it("Should return 200 status codes with 'No items in cart' when there is no Items in cart that belongs to the user ID", async () => {
    await Cart.find.mockImplementation(() => ({
      lean: jest.fn().mockResolvedValue([]),
    }));

    await getCart(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'No items in cart',
      length: 0,
      result: [],
    });
  });
});
