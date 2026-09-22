import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// DATABASE_URL se lee del archivo .env (ver .env.example).
// "prisma generate" no necesita conexión, por eso no se exige aquí;
// los comandos de migración sí fallarán con un mensaje claro si falta.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
