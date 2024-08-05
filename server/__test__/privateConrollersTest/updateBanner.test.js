import { StatusCodes } from 'http-status-codes';
import { updateBanner } from '../../controllers/privateControllers.js';
import User from '../../model/User.js';
import { NotFoundError, BadRequestError } from '../../errors/index.js';
import { uploadImage } from '../../utils/uploadImageLocally.js';

jest.mock('../../model/User.js');
jest.mock('../../utils/uploadImageLocally.js');

describe('Update Banner Controller', () => {
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
      bannerPic: '456myimage.jpg',
      bannerPublicId: '456myimage.jpg',
      profilePic: null,
      profilePublicId: 'null',
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

  it('Should return 200 status code when the Banner is updated', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        bannerPublicId: '123myimage.jpg',
      }),
    }));

    await uploadImage.mockImplementation(() => '456myimage.jpg');

    await User.findOneAndUpdate.mockResolvedValue(updatedData);

    await updateBanner(mockRequest, mockResponse);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: mockRequest.user.userId,
        bannerPublicId: mockRequest.matchedData.oldPublicId,
      },
      { bannerPic: '456myimage.jpg', bannerPublicId: '456myimage.jpg' },
      { new: true, runValidators: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'Banner Picture updated',
    });
  });

  it('Should throw 404 Not found error when user not found', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        bannerPublicId: '123myimage.jpg',
      }),
    }));

    await uploadImage.mockImplementation(() => '456myimage.jpg');

    await User.findOneAndUpdate.mockResolvedValue(null);

    await expect(updateBanner(mockRequest, mockResponse)).rejects.toThrow(
      NotFoundError
    );
    await expect(updateBanner(mockRequest, mockResponse)).rejects.toThrowError(
      'User Not Found'
    );
  });

  it('Should throw 40o Bad request error when public Id mismatch', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        _id: '666c8fa922ae3ccb2f7da512',
        bannerPublicId: '657myimage.jpg',
      }),
    }));

    await expect(updateBanner(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(updateBanner(mockRequest, mockResponse)).rejects.toThrowError(
      'User Not Found'
    );
  });
});
