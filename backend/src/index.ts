import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import prisma from './config/database';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import { HttpError } from './utils/http-error';

const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Ruta no encontrada
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejador global de errores. Express 5 captura automáticamente los errores
// de los controladores async, así que no hace falta try/catch en cada uno.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  // JSON mal formado en el body
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'El cuerpo de la petición no es un JSON válido' });
    return;
  }

  // Se registra el detalle en el servidor, pero no se envía al cliente
  console.error('Error no controlado:', err);
  res.status(500).json({ message: 'Ocurrió un error inesperado en el servidor' });
});

const server = app.listen(env.port, () => {
  console.log(`Servidor SpendWise corriendo en http://localhost:${env.port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
