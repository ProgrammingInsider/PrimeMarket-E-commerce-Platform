import { validationResult, matchedData } from 'express-validator';

// error
import { BadRequestError } from '../errors/index.js';

export const validate = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    throw new BadRequestError(errorMessages);
  }

  // Extract the matched data and attach it to the request object
  req.matchedData = matchedData(req);

  next();
};
