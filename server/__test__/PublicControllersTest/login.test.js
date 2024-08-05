// package
import { StatusCodes } from 'http-status-codes';

// Module
import User from '../../model/User.js';
import { login } from '../../controllers/publicControllers.js';
import { tokenService } from '../../utils/tokenService.js';

// Errors

import { UnauthenticatedError } from '../../errors/index.js';

jest.mock('../../model/User.js');

jest.mock('../../utils/tokenService.js', () => ({
  tokenService: jest.fn(() => ({
    accessToken: 456,
    refreshToken: 123,
  })),
}));

describe('Login Controller', () => {
  let mockRequest;
  let mockResponse;
  beforeEach(() => {
    mockRequest = {
      matchedData: {
        email: 'amanuelabera46@gmail.com',
        password: '!!Aman2208!!',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
  });
  it('It should throw un authenticated error when Email is not registered', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(login(mockRequest, mockResponse)).rejects.toThrow(
      UnauthenticatedError
    );
    await expect(login(mockRequest, mockResponse)).rejects.toThrowError(
      'Email address is not registered'
    );
  });

  it('It should throw un authenticated error when Password is Incorrect', async () => {
    User.findOne.mockResolvedValue({
      comparepassword: jest
        .fn(mockRequest.matchedData.password)
        .mockResolvedValue(false),
    });

    await expect(login(mockRequest, mockResponse)).rejects.toThrow(
      UnauthenticatedError
    );
    await expect(login(mockRequest, mockResponse)).rejects.toThrowError(
      'Incorrect Password'
    );
  });

  it('It should log in and create creditials', async () => {
    User.findOne.mockResolvedValue({
      _id: '123',
      firstname: 'Amanuel',
      lastname: 'Abera',
      comparepassword: jest.fn().mockResolvedValue(true),
    });
    await login(mockRequest, mockResponse);
    const payload = { userId: '123', firstname: 'Amanuel', lastname: 'Abera' };

    expect(tokenService).toHaveBeenCalledWith(payload);
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refreshToken',
      123,
      expect.objectContaining({
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 3000,
        secure: true,
        sameSite: 'None',
      })
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: true,
        message: 'Logged In successfully',
        userId: '123',
        firstname: 'Amanuel',
        lastname: 'Abera',
        accessToken: 456,
      })
    );
  });
});
