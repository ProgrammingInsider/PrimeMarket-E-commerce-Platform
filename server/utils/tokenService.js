import Jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const tokenService = (payload) => {
  // Generate access token
  const accessToken = Jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '1d',
  });

  // Generate refresh token
  const refreshToken = Jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '3d',
  });

  return { accessToken, refreshToken };
};
