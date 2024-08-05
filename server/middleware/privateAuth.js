import Jwt from 'jsonwebtoken';
import { UnauthenticatedError, ForbiddenError } from '../errors/index.js';

export const privateAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader && !authHeader?.startsWith('Bearer')) {
    throw new UnauthenticatedError('No token Provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decode = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decode;

    next();
  } catch (err) {
    throw new ForbiddenError('Forbidden Request');
  }
};
