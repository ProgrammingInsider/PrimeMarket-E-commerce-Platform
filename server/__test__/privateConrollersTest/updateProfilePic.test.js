import { StatusCodes } from 'http-status-codes';
import { updateProfilePic } from '../../controllers/privateControllers.js';
import User from '../../model/User.js';
import { NotFoundError, BadRequestError } from '../../errors/index.js';
import { uploadImage } from '../../utils/uploadImageLocally.js';

jest.mock('../../model/User.js');
jest.mock('../../utils/uploadImageLocally.js');

describe('Update Profile Controller', () => {
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
      profilePic: '456myimage.jpg',
      profilePublicId: '456myimage.jpg',
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

    await uploadImage.mockImplementation(() => '456myimage.jpg');

    await User.findOneAndUpdate.mockResolvedValue(updatedData);

    await updateProfilePic(mockRequest, mockResponse);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: mockRequest.user.userId,
        profilePublicId: mockRequest.matchedData.oldPublicId,
      },
      { profilePic: '456myimage.jpg', profilePublicId: '456myimage.jpg' },
      { new: true, runValidators: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Profile Picture updated',
    });
  });

  it('Should throw 404 Not found error when user not found', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        profilePublicId: '123myimage.jpg',
      }),
    }));

    await uploadImage.mockImplementation(() => '456myimage.jpg');

    await User.findOneAndUpdate.mockResolvedValue(null);

    await expect(updateProfilePic(mockRequest, mockResponse)).rejects.toThrow(
      NotFoundError
    );
    await expect(
      updateProfilePic(mockRequest, mockResponse)
    ).rejects.toThrowError('User Not Found');
  });

  it('Should throw 400 Bad request error when public Id mismatch', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        profilePublicId: '657myimage.jpg',
      }),
    }));

    await expect(updateProfilePic(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(
      updateProfilePic(mockRequest, mockResponse)
    ).rejects.toThrowError('User Not Found');
  });
});
