import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { HttpError } from '../utils/http-error';

const client = new OAuth2Client(env.googleClientId);

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}

/**
 * Verifica el ID token (credential) que Google entrega al frontend.
 * Comprueba la firma con las claves públicas de Google, que no haya expirado
 * y que haya sido emitido para NUESTRO Client ID (audience).
 */
export async function verifyGoogleCredential(credential: string): Promise<GoogleProfile> {
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new HttpError(401, 'No se pudo verificar la cuenta de Google. Intente de nuevo.');
  }

  if (!payload?.sub || !payload.email) {
    throw new HttpError(401, 'La cuenta de Google no devolvió un correo.');
  }
  if (!payload.email_verified) {
    throw new HttpError(401, 'El correo de su cuenta de Google no está verificado.');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name ?? payload.email.split('@')[0],
    picture: payload.picture ?? null,
  };
}
