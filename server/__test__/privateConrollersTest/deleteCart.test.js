import { StatusCodes } from 'http-status-codes';
import { deleteCart } from '../../controllers/privateControllers.js';
import Cart from '../../model/Cart.js';
import { BadRequestError } from '../../errors/index.js';

jest.mock('../../model/Cart.js');

describe('Delete Cart Controller', () => {
  let mockRequest;
  let mockResponse;
  let deletedResponse;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        id: '667133ca2a9f18f4a6d777f2',
      },
      user: {
        userId: '66705e325a40560fa8f3a358',
      },
    };

    deletedResponse = {
      _id: '667133ca2a9f18f4a6d777f2',
      userId: '66705e325a40560fa8f3a358',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 200 status code when product deleted', async () => {
    await Cart.findOneAndDelete.mockResolvedValue(deletedResponse);

    await deleteCart(mockRequest, mockResponse);

    expect(Cart.findOneAndDelete).toHaveBeenCalledWith({
      _id: mockRequest.matchedData.id,
      userid: mockRequest.user.userId,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Item Removed',
    });
  });

  it('Should throw 400 bad request error when Item not found', async () => {
    await Cart.findOneAndDelete.mockResolvedValue(null);

    await expect(deleteCart(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(deleteCart(mockRequest, mockResponse)).rejects.toThrowError(
      'Cart Item Not Found'
    );
  });
});
