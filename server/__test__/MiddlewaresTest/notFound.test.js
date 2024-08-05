// Package
import { StatusCodes } from 'http-status-codes';
// Modules
import notFound from '../../middleware/notFound.js';

describe('Not Found Route', () => {
  let mockRequest = null;
  let mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  };
  it("should respond with a 404 status code and 'Route Does not exist' message", async () => {
    await notFound(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
    expect(mockResponse.send).toHaveBeenCalledWith('Route Does not exist');
  });
});
