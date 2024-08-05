import { StatusCodes } from 'http-status-codes';
import Product from '../../model/Product.js';
import { BadRequestError } from '../../errors/index.js';
import { deleteCloudinaryImage } from '../../utils/deleteCloudinaryImage.js';
import { deleteProductFromCloudinary } from '../../controllers/cloudinaryControllers.js';

jest.mock('../../model/Product.js');
jest.mock('../../utils/deleteCloudinaryImage.js');

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

    await deleteCloudinaryImage.mockImplementation(() => true);

    await Product.findOneAndDelete.mockResolvedValue(deletedResponse);

    await deleteProductFromCloudinary(mockRequest, mockResponse);

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

    await deleteCloudinaryImage.mockImplementation(() => true);

    await Product.findOneAndDelete.mockResolvedValue(null);

    await expect(
      deleteProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      deleteProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('Product Not Found in Database');
  });

  it('Should throws 400 bad request error when Product Image not deleted', async () => {
    await Product.findOne.mockImplementation(() => ({
      select: jest
        .fn()
        .mockResolvedValue({ publicId: mockRequest.matchedData.publicId }),
    }));

    await deleteCloudinaryImage.mockImplementation(() => false);

    await expect(
      deleteProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      deleteProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError(
      'Product Image Not Deleted from Cloudinary, please try again'
    );
  });

  it('Should throws 400 bad request error when public Id is null', async () => {
    await Product.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ publicId: null }),
    }));

    await expect(
      deleteProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      deleteProductFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError(
      'Product Image Not Deleted from Cloudinary, please try again'
    );
  });
});
