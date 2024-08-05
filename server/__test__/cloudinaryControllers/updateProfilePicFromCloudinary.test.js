import { StatusCodes } from 'http-status-codes';
import User from '../../model/User.js';
import { NotFoundError, BadRequestError } from '../../errors/index.js';
import { updateCloudinaryImage } from '../../utils/updateCloudinaryImage.js';
import { updateProfilePicFromCloudinary } from '../../controllers/cloudinaryControllers.js';

jest.mock('../../model/User.js');
jest.mock('../../utils/updateCloudinaryImage.js');

describe('Update Profile Pic Controller', () => {
  let mockRequest;
  let mockResponse;
  let updatedData;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        oldPublicId: '123myimage.jpg',
      },
      user: {
        userId: '666c8fa922ae3ccb2f7da512',
      },
    };

    updatedData = {
      address: {
        street: 'Africa Avenue Road',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
      },
      _id: '666c8fa922ae3ccb2f7da512',
      firstname: 'Amanuel',
      lastname: 'Abera',
      email: 'amanuelabera@gmail.com',
      phone: '0922112208',
      bannerPic: null,
      bannerPublicId: 'null',
      profilePic:
        'https://res.cloudinary.com/dahgxnpog/image/upload/v1718814458/profiles/vvjt2yuxt82embinbgxj.jpg',
      profilePublicId: 'profiles/vvjt2yuxt82embinbgxj',
      isVerified: false,
      createdAt: '2024-06-14T18:44:57.512Z',
      updatedAt: '2024-06-17T13:53:00.243Z',
      __v: 0,
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 200 status code when the Profile Pic is updated', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        profilePublicId: '123myimage.jpg',
      }),
    }));

    await updateCloudinaryImage.mockImplementation(() => ({
      imageUrl:
        'https://res.cloudinary.com/dahgxnpog/image/upload/v1718814458/profiles/vvjt2yuxt82embinbgxj.jpg',
      publicId: 'profiles/vvjt2yuxt82embinbgxj',
    }));

    await User.findOneAndUpdate.mockResolvedValue(updatedData);

    await updateProfilePicFromCloudinary(mockRequest, mockResponse);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: mockRequest.user.userId,
        profilePublicId: mockRequest.matchedData.oldPublicId,
      },
      {
        profilePic:
          'https://res.cloudinary.com/dahgxnpog/image/upload/v1718814458/profiles/vvjt2yuxt82embinbgxj.jpg',
        profilePublicId: 'profiles/vvjt2yuxt82embinbgxj',
      },
      { new: true, runValidators: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Profile Picture updated',
      url: 'https://res.cloudinary.com/dahgxnpog/image/upload/v1718814458/profiles/vvjt2yuxt82embinbgxj.jpg',
      publicId: 'profiles/vvjt2yuxt82embinbgxj',
    });
  });

  it('Should throw 404 Not found error when user not found', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        profilePublicId: '123myimage.jpg',
      }),
    }));

    await updateCloudinaryImage.mockImplementation(() => ({
      imageUrl:
        'https://res.cloudinary.com/dahgxnpog/image/upload/v1718814458/profiles/vvjt2yuxt82embinbgxj.jpg',
      publicId: 'profiles/vvjt2yuxt82embinbgxj',
    }));

    await User.findOneAndUpdate.mockResolvedValue(null);

    await expect(
      updateProfilePicFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(NotFoundError);
    await expect(
      updateProfilePicFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('User Not Found');
  });

  it('Should throw 400 Bad request error when public Id mismatch', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        profilePublicId: '657myimage.jpg',
      }),
    }));

    await expect(
      updateProfilePicFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrow(BadRequestError);
    await expect(
      updateProfilePicFromCloudinary(mockRequest, mockResponse)
    ).rejects.toThrowError('User Not Found');
  });
});
