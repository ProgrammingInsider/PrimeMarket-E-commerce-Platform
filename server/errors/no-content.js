import CustomAPIError from './custom-error.js';
import { StatusCodes } from 'http-status-codes';

class NoContentError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.NO_CONTENT; //statuscode = 204
  }
}

export default NoContentError;
