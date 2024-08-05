import { StatusCodes } from 'http-status-codes';
import User from '../../model/User.js';
import { BadRequestError } from '../../errors/index.js';
import { deleteCloudinaryImage } from '../../utils/deleteCloudinaryImage.js';
import { deleteBannerFromCloudinary } from '../../controllers/cloudinaryControllers.js';

jest.mock('../../model/User.js');
jest.mock('../../utils/deleteCloudinaryImage.js');

describe('Delete Banner Controller From Cloudinary', () => {
  let mockRequest;
  let mockResponse;
  let deletedResponse;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        publicId: 'banners/vvjt2yuxt82embinbgxj',
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

    await deleteCloudinaryImage.mockImplementation(() => true);

    await User.findOneAndUpdate.mockResolvedValue(deletedResponse);

    await deleteBannerFromCloudinary(mockRequest, mockResponse);

    expect(deleteCloudinaryImage).toHaveBeenCalledWith(
      mockRequest.matchedData.publicId
    );

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      {
        bannerPublicId: mockRequest.matchedData.publicId,
        _id: mockRequest.user.userId,
      },
      { $set: { bannerPublicId: 'null', bannerPic: 'null' } },
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

    await deleteCloudinaryImage.mockImplementation(() => true);

    await User.findOneAndUpdate.mockResolvedValue(null);

    await expect(
      deleteBannerFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      deleteBannerFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('User Not Found');
  });

  it('Should throw 400 bad request error when Banner Image not Deleted not found', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        bannerPublicId: mockRequest.matchedData.publicId,
      }),
    }));

    await deleteCloudinaryImage.mockImplementation(() => false);

    await expect(
      deleteBannerFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      deleteBannerFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError(
      'Banner Image Not Deleted from Cloudinary, please try again'
    );
  });

  it('Should throw 400 bad request error when Banner public Id is null', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ bannerPublicId: null }),
    }));

    await expect(
      deleteBannerFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      deleteBannerFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError(
      'Banner Image Not Deleted from Cloudinary, please try again'
    );
  });
});
