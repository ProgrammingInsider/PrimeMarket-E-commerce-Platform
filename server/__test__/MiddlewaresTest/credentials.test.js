import allowedOrigins from '../../config/allowedOrigins.js';
import credentials from '../../middleware/credentials.js';

describe('Credentials Middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {
      headers: {
        origin: '',
      },
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should set headers if the origin is among allowed origins', () => {
    const allowedOrigin = allowedOrigins[0];
    mockRequest.headers.origin = allowedOrigin;

    credentials(mockRequest, mockResponse, mockNext);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Credentials',
      'true'
    );
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should not set headers if the origin is not among allowed origins', () => {
    const disallowedOrigin = 'http://www.aman2.com';
    mockRequest.headers.origin = disallowedOrigin;

    credentials(mockRequest, mockResponse, mockNext);
    expect(mockResponse.setHeader).not.toHaveBeenCalledWith(
      'Access-Control-Allow-Credentials',
      'true'
    );
    expect(mockResponse.setHeader).not.toHaveBeenCalledWith(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
