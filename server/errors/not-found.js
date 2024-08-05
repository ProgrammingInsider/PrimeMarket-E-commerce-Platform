import CustomAPIError from './custom-error.js';
import { StatusCodes } from 'http-status-codes';

class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NOT_FOUND; //statuscode = 404
  }
}

export default NotFoundError;
