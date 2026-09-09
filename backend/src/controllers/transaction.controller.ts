import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../config/database';

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user.id);
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { fecha: 'desc' }
    });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ message: 'Error al obtener transacciones', error });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user.id);
    const { descripcion, monto, tipo, categoria, fecha } = req.body;

    const newTransaction = await prisma.transaction.create({
      data: {
        userId,
        descripcion,
        monto: Math.abs(parseFloat(monto)),
        tipo,
        categoria,
        fecha: fecha ? new Date(fecha) : new Date()
      }
    });

    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ message: 'Error al crear la transacción', error });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const userId = Number(req.user.id);

    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction || transaction.userId !== userId) {
      res.status(404).json({ message: 'Transacción no encontrada o no autorizada' });
      return;
    }

    await prisma.transaction.delete({ where: { id } });

    res.status(200).json({ message: 'Transacción eliminada correctamente' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'La transacción ya no existe en la base de datos' });
      return;
    }
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ message: 'Error al eliminar la transacción', error });
  }
};