import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', TransactionController.getTransactions);
router.get('/:id', TransactionController.getTransactionById);

export default router;
