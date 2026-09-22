import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: number;
  email: string;
  username: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (
    typeof decoded !== 'object' ||
    typeof decoded.id !== 'number' ||
    typeof decoded.email !== 'string'
  ) {
    throw new Error('Token con formato inválido');
  }
  return {
    id: decoded.id,
    email: decoded.email,
    username: typeof decoded.username === 'string' ? decoded.username : '',
  };
}
