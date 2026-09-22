import { NextFunction, Request, Response } from 'express';
import { TokenPayload, verifyToken } from '../services/token.service';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Exige un header "Authorization: Bearer <token>" válido.
 * Si es correcto, deja los datos del usuario en req.user.
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Debe iniciar sesión para continuar' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Su sesión expiró o no es válida. Inicie sesión de nuevo.' });
  }
};

/** Devuelve el id del usuario autenticado (solo usar después de requireAuth). */
export function getUserId(req: AuthRequest): number {
  if (!req.user) {
    throw new Error('getUserId se llamó sin pasar por requireAuth');
  }
  return req.user.id;
}
