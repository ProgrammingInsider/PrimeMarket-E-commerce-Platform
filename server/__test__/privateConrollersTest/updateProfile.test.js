import { StatusCodes } from 'http-status-codes';
import { updateProfile } from '../../controllers/privateControllers.js';
import User from '../../model/User.js';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../errors/index.js';

jest.mock('../../model/User.js');

describe('Update Profile Controller', () => {
  let mockRequest;
  let mockResponse;
  let updatedData;

  beforeAll(() => {
    mockRequest = {
      matchedData: {
        _id: '6666abdb0944a601b7b5f385',
        firstname: 'Amanuel',
        lastname: 'Abera',
        email: 'amanuelabera46@gmail.com',
        phone: '0922112208',
        street: 'Africa Avenue Road',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        postalCode: '23035', // Changed to postalCode
        country: 'Ethiopia',
      },
      user: {
        userId: '6666abdb0944a601b7b5f385',
      },
    };

    updatedData = {
      firstname: 'Amanuel',
      lastname: 'Abera',
      email: 'amanuelabera46@gmail.com',
      phone: '0922112208',
      address: {
        street: 'Africa Avenue Road',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        postalCode: '23035', // Changed to postalCode
        country: 'Ethiopia',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('Should return 200 status code when the profile is updated', async () => {
    await User.findOneAndUpdate.mockResolvedValue(updatedData);
    await User.findOne.mockResolvedValue(null);

    await updateProfile(mockRequest, mockResponse);

    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: mockRequest.user.userId },
      updatedData,
      { new: true, runValidators: true }
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      message: 'User Profile Updated',
    });
  });

  it('Should return 404 status code when user not found', async () => {
    await User.findOneAndUpdate.mockResolvedValue(null);
    await User.findOne.mockResolvedValue(null);

    await expect(updateProfile(mockRequest, mockResponse)).rejects.toThrow(
      NotFoundError
    );
    await expect(updateProfile(mockRequest, mockResponse)).rejects.toThrowError(
      'User Not Found'
    );
  });

  it('Should return 400 status code when email is already taken', async () => {
    // Mock the findOne method to simulate an existing user with the same email
    await User.findOneAndUpdate.mockResolvedValue(updatedData);
    await User.findOne.mockResolvedValue({ email: 'amanuelabera46@gmail.com' });

    await expect(updateProfile(mockRequest, mockResponse)).rejects.toThrow(
      BadRequestError
    );
    await expect(updateProfile(mockRequest, mockResponse)).rejects.toThrowError(
      'Email already taken'
    );
  });

  it('Should return 403 status code when Id mismatch', async () => {
    mockRequest.matchedData._id = '123';

    await expect(updateProfile(mockRequest, mockResponse)).rejects.toThrow(
      ForbiddenError
    );
    await expect(updateProfile(mockRequest, mockResponse)).rejects.toThrowError(
      'Forbidden Request'
    );
  });
});
