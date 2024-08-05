import CustomAPIError from './custom-error.js';
import { StatusCodes } from 'http-status-codes';

class ConventionError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}

export default ConventionError;
