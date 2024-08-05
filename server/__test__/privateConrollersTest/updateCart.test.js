import { StatusCodes } from 'http-status-codes';
import { updateCart } from '../../controllers/privateControllers.js';
import Cart from '../../model/Cart.js';
import {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} from '../../errors/index.js';

jest.mock('../../model/Cart.js');

describe('Update Profile Controller', () => {
  let mockRequest;
  let mockResponse;
  let updatedData;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        _id: '667133ca2a9f18f4a6d777f2',
        quantity: 2,
      },
      user: {
        userId: '66705e325a40560fa8f3a358',
      },
    };

    updatedData = {
      _id: '667133ca2a9f18f4a6d777f2',
      userid: '66705e325a40560fa8f3a358',
      quantity: 2,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 200 status code when the cart Item updated', async () => {
    await Cart.findOneAndUpdate.mockResolvedValue(updatedData);

    await updateCart(mockRequest, mockResponse);

    expect(Cart.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockRequest.matchedData._id, userid: mockRequest.user.userId },
      { quantity: mockRequest.matchedData.quantity },
      { new: true, runValidators: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Item Updated',
    });
  });

  it('Should throw 400 bad request error when Item not found', async () => {
    await Cart.findOneAndUpdate.mockResolvedValue(null);

    await expect(updateCart(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(updateCart(mockRequest, mockResponse)).rejects.toThrowError(
      'Item not found'
    );
  });

  it('Should throw 401 un authenticated error when user not Logged in', async () => {
    mockRequest.user.userId = null;

    await expect(updateCart(mockRequest, mockResponse)).rejects.toThrow(
      UnauthenticatedError
    );
    await expect(updateCart(mockRequest, mockResponse)).rejects.toThrowError(
      'Login first'
    );
  });
});
