import { StatusCodes } from 'http-status-codes';
import { deleteProduct } from '../../controllers/privateControllers.js';
import Product from '../../model/Product.js';
import {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} from '../../errors/index.js';
import { deleteImage } from '../../utils/deleteImageLocally.js';

jest.mock('../../model/Product.js');
jest.mock('../../utils/deleteImageLocally.js');

describe('Delete Product Controller', () => {
  let mockRequest;
  let mockResponse;
  let deletedResponse;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        publicId: '1718696156459amo.JPG',
      },
      user: {
        userId: '66705e325a40560fa8f3a358',
      },
    };

    deletedResponse = {
      _id: '667133ca2a9f18f4a6d777f2',
      userId: '66705e325a40560fa8f3a358',
      publicId: '1718696156459amo.JPG',
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 200 status code when product deleted', async () => {
    await Product.findOne.mockImplementation(() => ({
      select: jest
        .fn()
        .mockResolvedValue({ publicId: mockRequest.matchedData.publicId }),
    }));

    await deleteImage.mockImplementation(() => true);

    await Product.findOneAndDelete.mockResolvedValue(deletedResponse);

    await deleteProduct(mockRequest, mockResponse);

    expect(Product.findOneAndDelete).toHaveBeenCalledWith({
      publicId: mockRequest.matchedData.publicId,
      userId: mockRequest.user.userId,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Product Deleted',
    });
  });

  it('Should throws 400 bad request error when product not found', async () => {
    await Product.findOne.mockImplementation(() => ({
      select: jest
        .fn()
        .mockResolvedValue({ publicId: mockRequest.matchedData.publicId }),
    }));

    await deleteImage.mockImplementation(() => true);

    await Product.findOneAndDelete.mockResolvedValue(null);

    await expect(deleteProduct(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(deleteProduct(mockRequest, mockResponse)).rejects.toThrowError(
      'Product Not Found'
    );
  });

  it('Should throws 400 bad request error when Product Image not deleted', async () => {
    await Product.findOne.mockImplementation(() => ({
      select: jest
        .fn()
        .mockResolvedValue({ publicId: mockRequest.matchedData.publicId }),
    }));

    await deleteImage.mockImplementation(() => false);

    await expect(deleteProduct(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(deleteProduct(mockRequest, mockResponse)).rejects.toThrowError(
      'Product Not Deleted, please try again'
    );
  });

  it('Should throws 400 bad request error when public Id is null', async () => {
    await Product.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ publicId: null }),
    }));

    await expect(deleteProduct(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(deleteProduct(mockRequest, mockResponse)).rejects.toThrowError(
      'Product Not Found'
    );
  });
});
