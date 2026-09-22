import 'dotenv/config';

/**
 * Lee una variable de entorno obligatoria.
 * Si falta, el servidor se detiene al arrancar con un mensaje claro,
 * en lugar de fallar más tarde con un error difícil de rastrear.
 */
function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copie backend/.env.example como backend/.env y complétela.`
    );
  }
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || '24h',
  googleClientId: required('GOOGLE_CLIENT_ID'),
  port: Number(process.env.PORT) || 3000,
  frontendUrl: process.env.FRONTEND_URL?.trim() || 'http://localhost:4200',
};
