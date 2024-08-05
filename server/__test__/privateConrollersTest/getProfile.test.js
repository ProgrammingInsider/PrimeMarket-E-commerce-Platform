import { StatusCodes } from 'http-status-codes';
import { getProfile } from '../../controllers/privateControllers.js';
import User from '../../model/User.js';
import { ForbiddenError, UnauthenticatedError } from '../../errors/index.js';
jest.mock('../../model/User.js');

describe('Get Profile Controller', () => {
  let mockRequest;
  let mockResponse;
  let fetchedUser;

  beforeAll(() => {
    mockRequest = {
      user: {
        userId: '6659cfe1e6ab6334094287bf',
      },

      matchedData: {
        userId: '6659cfe1e6ab6334094287bf',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    fetchedUser = {
      address: {
        street: 'Africa Avenue Road',
        city: 'Addis Ababa',
        state: 'Addis Ababa',
        country: 'Ethiopia',
      },
      _id: '6659cfe1e6ab6334094287bf',
      firstname: 'Amanuel',
      lastname: 'Abera',
      email: 'amanuelabera47@gmail.com',
      phone: '0922112208',
      isVerified: false,
      createdAt: '2024-05-31T13:25:53.797Z',
      updatedAt: '2024-06-07T12:19:17.305Z',
      __v: 0,
    };
  });

  it('Should retrun 200 status codes when user profile fetched', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockResolvedValue(fetchedUser),
      })),
    }));

    await getProfile(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      result: fetchedUser,
    });
  });

  it('Should throw UnauthenticatedError when user not found', async () => {
    await User.findOne.mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockResolvedValue(null),
      })),
    }));

    await expect(getProfile(mockRequest, mockResponse)).rejects.toThrow(
      UnauthenticatedError
    );
    await expect(getProfile(mockRequest, mockResponse)).rejects.toThrowError(
      'No User Found'
    );
  });

  it('Should throw forbidden error if the user id from token does not match with the id for request params', async () => {
    mockRequest.user.userId = 'abc123';

    await expect(getProfile(mockRequest, mockResponse)).rejects.toThrow(
      ForbiddenError
    );
    await expect(getProfile(mockRequest, mockResponse)).rejects.toThrowError(
      'Forbidden Request'
    );
  });

  it('Should throw forbidden error if the user id from token does not match with the id for request params', async () => {
    mockRequest.user.userId = '6659cfe1e6ab6334094287bf';
    mockRequest.matchedData.userId = 'abc123';

    await expect(getProfile(mockRequest, mockResponse)).rejects.toThrow(
      ForbiddenError
    );
    await expect(getProfile(mockRequest, mockResponse)).rejects.toThrowError(
      'Forbidden Request'
    );
  });
});
