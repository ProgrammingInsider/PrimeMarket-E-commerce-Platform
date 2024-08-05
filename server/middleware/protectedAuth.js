import Jwt from 'jsonwebtoken';

export const protectedAuth = async (req, res, next) => {
  const authHeader = req?.headers?.authorization;

  if (!authHeader && !authHeader?.startsWith('Bearer')) {
    req.user = null;
    return next();
  }

  const token = authHeader?.split(' ')[1];

  try {
    const decode = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decode;
  } catch (err) {
    req.user = null;
  }
  next();
};
