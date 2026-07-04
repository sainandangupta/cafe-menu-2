import jwt from 'jsonwebtoken';
import env from '../config/environment';
import { UnauthorizedError } from './errors';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  cafeId: string | null;
}

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
};
