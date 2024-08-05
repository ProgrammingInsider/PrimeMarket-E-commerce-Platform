import CustomAPIError from './custom-error.js';
import { StatusCodes } from 'http-status-codes';

class CsrfNotProvideError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN; //statuscode = 403
  }
}

export default CsrfNotProvideError;
