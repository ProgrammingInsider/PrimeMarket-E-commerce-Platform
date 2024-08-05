import CustomAPIError from './custom-error.js';
import { StatusCodes } from 'http-status-codes';

class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.BAD_REQUEST; //statuscode = 400
  }
}

export default BadRequestError;
