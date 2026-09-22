import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest, getUserId } from '../middlewares/auth.middleware';
import { HttpError } from '../utils/http-error';

const TIPOS_VALIDOS = ['ingreso', 'egreso'] as const;
type Tipo = (typeof TIPOS_VALIDOS)[number];

const MAX_MONTO = 9_999_999_999.99; // Límite de DECIMAL(12,2)

interface TransactionInput {
  descripcion: string;
  monto: number;
  tipo: Tipo;
  categoria: string;
  fecha: Date;
}

type TransactionRecord = {
  id: number;
  descripcion: string;
  monto: { toNumber(): number };
  tipo: string;
  categoria: string;
  fecha: Date;
  createdAt: Date;
  updatedAt: Date;
};

/** Convierte el Decimal de Prisma a number para que el frontend reciba un número. */
function serialize(t: TransactionRecord) {
  return {
    id: t.id,
    descripcion: t.descripcion,
    monto: t.monto.toNumber(),
    tipo: t.tipo,
    categoria: t.categoria,
    fecha: t.fecha.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}

function parseId(raw: unknown): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Identificador de transacción inválido');
  }
  return id;
}

/**
 * Convierte "2026-09-22" en una fecha al mediodía UTC.
 * Así la fecha no se "corre" un día al mostrarse en zonas horarias como Guatemala (UTC-6).
 */
function parseFecha(raw: unknown): Date {
  if (raw === undefined || raw === null || raw === '') {
    return new Date();
  }
  if (typeof raw !== 'string') {
    throw new HttpError(400, 'La fecha no es válida');
  }
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(raw);
  const fecha = new Date(soloFecha ? `${raw}T12:00:00.000Z` : raw);
  if (Number.isNaN(fecha.getTime())) {
    throw new HttpError(400, 'La fecha no es válida');
  }
  return fecha;
}

function validateInput(body: unknown): TransactionInput {
  const data = (body ?? {}) as Record<string, unknown>;

  const descripcion = typeof data.descripcion === 'string' ? data.descripcion.trim() : '';
  const categoria = typeof data.categoria === 'string' ? data.categoria.trim() : '';
  const tipo = data.tipo;
  const monto = typeof data.monto === 'string' ? Number(data.monto) : data.monto;

  if (!descripcion) throw new HttpError(400, 'La descripción es obligatoria');
  if (descripcion.length > 120) {
    throw new HttpError(400, 'La descripción no puede superar los 120 caracteres');
  }
  if (!categoria) throw new HttpError(400, 'La categoría es obligatoria');
  if (categoria.length > 50) {
    throw new HttpError(400, 'La categoría no puede superar los 50 caracteres');
  }
  if (typeof tipo !== 'string' || !TIPOS_VALIDOS.includes(tipo as Tipo)) {
    throw new HttpError(400, 'El tipo debe ser "ingreso" o "egreso"');
  }
  if (typeof monto !== 'number' || !Number.isFinite(monto) || monto <= 0) {
    throw new HttpError(400, 'El monto debe ser un número mayor que cero');
  }
  if (monto > MAX_MONTO) {
    throw new HttpError(400, 'El monto es demasiado grande');
  }

  return {
    descripcion,
    categoria,
    tipo: tipo as Tipo,
    monto: Math.round(monto * 100) / 100,
    fecha: parseFecha(data.fecha),
  };
}

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const transactions = await prisma.transaction.findMany({
    where: { userId: getUserId(req) },
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
  });
  res.status(200).json(transactions.map(serialize));
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const input = validateInput(req.body);

  const transaction = await prisma.transaction.create({
    data: { ...input, userId: getUserId(req) },
  });

  res.status(201).json(serialize(transaction));
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseId(req.params.id);
  const input = validateInput(req.body);

  // updateMany con userId en el filtro garantiza que solo se edite
  // una transacción del propio usuario (en una sola consulta).
  const result = await prisma.transaction.updateMany({
    where: { id, userId: getUserId(req) },
    data: input,
  });

  if (result.count === 0) {
    throw new HttpError(404, 'Transacción no encontrada');
  }

  const updated = await prisma.transaction.findUniqueOrThrow({ where: { id } });
  res.status(200).json(serialize(updated));
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseId(req.params.id);

  const result = await prisma.transaction.deleteMany({
    where: { id, userId: getUserId(req) },
  });

  if (result.count === 0) {
    throw new HttpError(404, 'Transacción no encontrada');
  }

  res.status(200).json({ message: 'Transacción eliminada correctamente' });
};
