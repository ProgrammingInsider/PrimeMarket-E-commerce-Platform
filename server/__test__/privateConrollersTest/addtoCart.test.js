import { StatusCodes } from 'http-status-codes';
import { addtoCart } from '../../controllers/privateControllers.js';
import {
  BadRequestError,
  ConventionError,
  UnauthenticatedError,
} from '../../errors/index.js';
import Cart from '../../model/Cart.js';
import Product from '../../model/Product.js';
import User from '../../model/User.js';

jest.mock('../../model/Product.js');
jest.mock('../../model/User.js');
jest.mock('../../model/Cart.js');

describe('Add To Cart', () => {
  let mockRequest;
  let mockResponse;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        productid: '66619101e15d9d35c3ac5725',
      },
      user: {
        userId: '6659cfe1e6ab6334094287bf',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 201 status code when the Item added to cart', async () => {
    const userId = mockRequest.user.userId;
    const productid = mockRequest.matchedData.productid;

    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: userId,
      }),
    }));

    Product.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: productid,
      }),
    }));

    Cart.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));

    // Cart.findOne.mockImplementation(({userid:userId, productid:productid})=>({
    //     select: jest.fn("_id").mockResolvedValue({
    //         _id: "66619101e15d9d35c3ac5725"
    //     })
    // }));

    const savedMethod = jest.spyOn(Cart.prototype, 'save').mockResolvedValue({
      _id: '123',
    });

    await addtoCart(mockRequest, mockResponse);

    expect(User.findOne).toHaveBeenCalledWith({ _id: userId });
    expect(Product.findOne).toHaveBeenCalledWith({ _id: productid });
    expect(Cart.findOne).toHaveBeenCalledWith({
      userid: userId,
      productid: productid,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Added to cart',
    });
  });

  it('Should return Un authenticated error when user Id is not valid', async () => {
    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));

    await expect(addtoCart(mockRequest, mockResponse)).rejects.toThrow(
      UnauthenticatedError
    );
    await expect(addtoCart(mockRequest, mockResponse)).rejects.toThrowError(
      'Logged In First'
    );
  });

  it('Should throw bad request when product Id is not exist', async () => {
    const userId = mockRequest.user.userId;

    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: userId,
      }),
    }));

    Product.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null),
    }));

    await expect(addtoCart(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(addtoCart(mockRequest, mockResponse)).rejects.toThrowError(
      'Product Id Not Found'
    );
  });

  it('Should throw convention error when the Item is already in the cart', async () => {
    const userId = mockRequest.user.userId;
    const productid = mockRequest.matchedData.productid;

    User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: userId,
      }),
    }));

    Product.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: productid,
      }),
    }));

    Cart.findOne.mockImplementation(() => ({
      select: jest.fn('_id').mockResolvedValue({
        _id: '66619101e15d9d35c3ac5725',
      }),
    }));

    await expect(addtoCart(mockRequest, mockResponse)).rejects.toThrow(
      ConventionError
    );
    await expect(addtoCart(mockRequest, mockResponse)).rejects.toThrowError(
      'Item In Cart'
    );
  });
});
