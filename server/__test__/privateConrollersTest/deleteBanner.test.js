import { StatusCodes } from 'http-status-codes';
import { deleteBanner } from '../../controllers/privateControllers.js';
import User from '../../model/User.js';
import { BadRequestError } from '../../errors/index.js';
import { deleteImage } from '../../utils/deleteImageLocally.js';

jest.mock('../../model/User.js');
jest.mock('../../utils/deleteImageLocally.js');

describe('Delete Banner Controller', () => {
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

  it('Should return 200 status code when Banner Picture deleted', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        bannerPublicId: mockRequest.matchedData.publicId,
      }),
    }));

    await deleteImage.mockImplementation(() => true);

    await User.findOneAndUpdate.mockResolvedValue(deletedResponse);

    await deleteBanner(mockRequest, mockResponse);

    expect(deleteImage).toHaveBeenCalledWith(
      'banners',
      mockRequest.matchedData.publicId
    );

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      {
        bannerPublicId: mockRequest.matchedData.publicId,
        _id: mockRequest.user.userId,
      },
      { bannerPublicId: 'null', bannerPic: null },
      { new: true, runValidators: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Banner Image Deleted',
    });
  });

  it('Should throw 400 bad request error when user not found', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        bannerPublicId: mockRequest.matchedData.publicId,
      }),
    }));

    await deleteImage.mockImplementation(() => true);

    await User.findOneAndUpdate.mockResolvedValue(null);

    await expect(deleteBanner(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(deleteBanner(mockRequest, mockResponse)).rejects.toThrowError(
      'User Not Found'
    );
  });

  it('Should throw 400 bad request error when Banner Image not Deleted not found', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        bannerPublicId: mockRequest.matchedData.publicId,
      }),
    }));

    await deleteImage.mockImplementation(() => false);

    await expect(deleteBanner(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(deleteBanner(mockRequest, mockResponse)).rejects.toThrowError(
      'User Not Found'
    );
  });

  it('Should throw 400 bad request error when Banner public Id is null', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ bannerPublicId: null }),
    }));

    await expect(deleteBanner(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(deleteBanner(mockRequest, mockResponse)).rejects.toThrowError(
      'User Not Found'
    );
  });
});
