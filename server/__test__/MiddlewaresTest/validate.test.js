// Package
import { validationResult, matchedData } from 'express-validator';
// Middleware
import { validate } from '../../middleware/validate.js';
// Error
import { BadRequestError } from '../../errors/index.js';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
  matchedData: jest.fn(),
}));

describe('validate Middleware', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn(() => mockResponse),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it('should call next function if no validate erros', async () => {
    validationResult.mockReturnValue({
      isEmpty: jest.fn(() => true),
    });

    await validate(mockRequest, mockResponse, mockNext);

    expect(validationResult).toHaveBeenCalledWith(mockRequest);
    expect(matchedData).toHaveBeenCalledWith(mockRequest);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should throw Bad request errors if there are validate errors', async () => {
    validationResult.mockReturnValue({
      isEmpty: jest.fn(() => false),
      array: jest.fn(() => [{ msg: 'Invalid Request' }]),
    });

    await expect(validate(mockRequest, mockResponse, mockNext)).rejects.toThrow(
      BadRequestError
    );
    await expect(
      validate(mockRequest, mockResponse, mockNext)
    ).rejects.toThrowError('Invalid Request');
  });
});
