import { Router } from 'express';
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from '../controllers/transaction.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas de transacciones requieren sesión iniciada
router.use(requireAuth);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
