import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AuthRequest, getUserId } from '../middlewares/auth.middleware';
import { verifyGoogleCredential } from '../services/google.service';
import { signToken } from '../services/token.service';
import { HttpError } from '../utils/http-error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9._-]{3,30}$/;
const MIN_PASSWORD_LENGTH = 8;

interface PublicUser {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
}

type UserRecord = {
  id: number;
  username: string;
  email: string;
  password: string | null;
  googleId: string | null;
  avatarUrl: string | null;
};

function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    hasPassword: user.password !== null,
    hasGoogle: user.googleId !== null,
  };
}

function sessionResponse(user: UserRecord) {
  return {
    token: signToken({ id: user.id, email: user.email, username: user.username }),
    user: toPublicUser(user),
  };
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * Crea un nombre de usuario único a partir del nombre o correo de Google.
 * Ejemplo: "Juan Pérez" -> "juanperez", y si ya existe -> "juanperez2", "juanperez3"...
 */
async function generateUniqueUsername(base: string): Promise<string> {
  const cleaned =
    base
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 24) || 'usuario';

  const candidate = cleaned.length >= 3 ? cleaned : `${cleaned}user`;

  let username = candidate;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${candidate}${suffix}`;
  }
  return username;
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const username = readString(req.body?.username).trim();
  const email = readString(req.body?.email).trim().toLowerCase();
  const password = readString(req.body?.password);

  if (!username || !email || !password) {
    throw new HttpError(400, 'Todos los campos son obligatorios');
  }
  if (!USERNAME_REGEX.test(username)) {
    throw new HttpError(
      400,
      'El usuario debe tener entre 3 y 30 caracteres y solo puede usar letras, números, punto, guion o guion bajo'
    );
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new HttpError(400, 'Ingrese un correo electrónico válido');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    if (existing.email === email && existing.googleId && !existing.password) {
      throw new HttpError(
        409,
        'Este correo ya está registrado con Google. Use el botón "Iniciar sesión con Google".'
      );
    }
    throw new HttpError(409, 'El correo o el nombre de usuario ya están registrados');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, email, password: hashedPassword },
  });

  res.status(201).json({ message: 'Usuario registrado exitosamente', user: toPublicUser(user) });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const email = readString(req.body?.email).trim().toLowerCase();
  const password = readString(req.body?.password);

  if (!email || !password) {
    throw new HttpError(400, 'Ingrese su correo y contraseña');
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.password && user.googleId) {
    throw new HttpError(
      400,
      'Esta cuenta se creó con Google. Use el botón "Iniciar sesión con Google".'
    );
  }

  // Mismo mensaje si el correo no existe o la contraseña es incorrecta,
  // para no revelar qué correos están registrados.
  if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'Correo o contraseña incorrectos');
  }

  res.status(200).json({ message: 'Inicio de sesión exitoso', ...sessionResponse(user) });
};

/**
 * Inicio de sesión / registro con Google.
 * 1. Si ya existe un usuario con ese googleId -> inicia sesión.
 * 2. Si existe un usuario con ese correo (registrado con contraseña) -> vincula Google a esa cuenta.
 * 3. Si no existe -> crea la cuenta automáticamente.
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  const credential = readString(req.body?.credential);

  if (!credential) {
    throw new HttpError(400, 'Falta la credencial de Google');
  }

  const profile = await verifyGoogleCredential(credential);

  let user = await prisma.user.findUnique({ where: { googleId: profile.googleId } });

  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email: profile.email } });

    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: {
          googleId: profile.googleId,
          avatarUrl: byEmail.avatarUrl ?? profile.picture,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          username: await generateUniqueUsername(profile.name),
          email: profile.email,
          googleId: profile.googleId,
          avatarUrl: profile.picture,
          password: null,
        },
      });
    }
  }

  res.status(200).json({ message: 'Inicio de sesión con Google exitoso', ...sessionResponse(user) });
};

/** Devuelve los datos del usuario de la sesión actual. */
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: getUserId(req) } });

  if (!user) {
    throw new HttpError(401, 'La cuenta ya no existe. Inicie sesión de nuevo.');
  }

  res.status(200).json({ user: toPublicUser(user) });
};
