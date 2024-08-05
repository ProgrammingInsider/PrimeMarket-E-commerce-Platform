// Packages
import { StatusCodes } from 'http-status-codes';
import Jwt from 'jsonwebtoken';

// modules
import { refreshToken } from '../../controllers/publicControllers.js';
import User from '../../model/User.js';

// Erros
import { ForbiddenError } from '../../errors/index.js';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

jest.mock('../../model/User.js');

describe('Refresh Token', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      cookies: {
        refreshToken: 123,
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('It should throw forbidden error if refresh token cookie not set', async () => {
    mockRequest.cookies.refreshToken = null;

    await expect(refreshToken(mockRequest, mockResponse)).rejects.toThrow(
      ForbiddenError
    );
    await expect(refreshToken(mockRequest, mockResponse)).rejects.toThrow(
      'Forbidden Request'
    );
  });

  it('It throws forbidden error if refresh token is not stored on database', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(refreshToken(mockRequest, mockResponse)).rejects.toThrow(
      ForbiddenError
    );
    await expect(refreshToken(mockRequest, mockResponse)).rejects.toThrow(
      'Forbidden Request'
    );
  });

  it('It should throw Forbidden Error if the access token is expired', async () => {
    jest.spyOn(Jwt, 'verify').mockResolvedValue(null);
    await expect(refreshToken(mockRequest, mockResponse)).rejects.toThrow(
      ForbiddenError
    );
    await expect(refreshToken(mockRequest, mockResponse)).rejects.toThrow(
      'Forbidden Request'
    );
  });

  it('It should Generate new accessToken if refresh token is not expired', async () => {
    const refreshCookie = mockRequest.cookies.refreshToken;
    User.findOne.mockResolvedValue({
      _id: '123',
      firstname: 'Amanuel',
      lastname: 'Abera',
    });

    // Mocking Jwt.sign function
    jest.spyOn(Jwt, 'sign').mockImplementation(() => 456);

    await refreshToken(mockRequest, mockResponse);
    const payload = { userId: '123', firstname: 'Amanuel', lastname: 'Abera' };

    expect(User.findOne).toHaveBeenCalledWith({
      refreshToken: mockRequest.cookies.refreshToken,
    });
    expect(Jwt.verify).toHaveBeenCalledWith(
      refreshCookie,
      process.env.REFRESH_TOKEN_SECRET
    );
    expect(Jwt.sign).toHaveBeenCalledWith(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      expect.objectContaining({ expiresIn: '1d' })
    );
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: true,
      userId: '123',
      firstname: 'Amanuel',
      lastname: 'Abera',
      accessToken: 456,
    });
  });
});
