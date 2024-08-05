// Package
import { StatusCodes } from 'http-status-codes';
// Modules
import { csrfToken } from '../../controllers/publicControllers';
// Errors
import { CsrfNotProvideError } from '../../errors/index.js';

describe('CSRF TOken controller', () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      csrfToken: jest.fn(),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });
  it('It shoud throw Invalid CSRF error if csrfToken is not set on cookie', async () => {
    mockRequest.csrfToken.mockImplementation(() => null);
    await expect(csrfToken(mockRequest, mockResponse)).rejects.toThrow(
      CsrfNotProvideError
    );
    await expect(csrfToken(mockRequest, mockResponse)).rejects.toThrowError(
      'Invalid CSRF'
    );
  });

  it('It should return CSRF token stored on cookie', async () => {
    mockRequest.csrfToken.mockImplementation(() => 123);
    await csrfToken(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(mockResponse.json).toHaveBeenCalledWith({ csrfToken: 123 });
  });
});
