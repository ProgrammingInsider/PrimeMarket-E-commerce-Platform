import { StatusCodes } from 'http-status-codes';
import errorHandler from '../../middleware/errorHandler.js';
import {
  BadRequestError,
  ConventionError,
  ForbiddenError,
  NoContentError,
  UnauthenticatedError,
} from '../../errors/index.js';

describe('Error Handler Middleware', () => {
  let mockError;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeAll(() => {
    mockError = {};
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = {};
  });
  it('Should throw 400 status code with Bad request message when Bad Request error occurs', async () => {
    const err = new BadRequestError('Bad Request');
    errorHandler(err, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: false,
      message: 'Bad Request',
    });
  });

  it('Should throw 409 status code with convention error message when Convention error occurs', async () => {
    const err = new ConventionError('Convention Error');
    errorHandler(err, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: false,
      message: 'Convention Error',
    });
  });

  it('Should throw 403 status code with Forbidden error message when Forbidden error occurs', async () => {
    const err = new ForbiddenError('Forbidden Error');
    errorHandler(err, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: false,
      message: 'Forbidden Error',
    });
  });

  it('Should throw 201 status code when No Content error occurs', async () => {
    const err = new NoContentError();
    errorHandler(err, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
  });

  it('Should throw 401 status code with Un Authorized message when Un Authenticated error occurs', async () => {
    const err = new UnauthenticatedError('Un Authorized Error');
    errorHandler(err, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: false,
      message: 'Un Authorized Error',
    });
  });

  it('Should throw 500 status code with something went wrong try again later message When Un intended error occurs', async () => {
    const err = new Error('something went wrong try again later');
    errorHandler(err, mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      status: false,
      message: 'something went wrong try again later',
    });
  });
});
