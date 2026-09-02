import { Router } from 'express';
import authRoutes from './auth.routes.js';
import accountRoutes from './account.routes.js';
import transactionRoutes from './transaction.routes.js';
import analyticsRoutes from './analytics.routes.js';
import budgetRoutes from './budget.routes.js';
import insightsRoutes from './insights.routes.js';
import { AuthController } from '../controllers/auth.controller.js';
import { AccountController } from '../controllers/account.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Authentication
router.use('/auth', authRoutes);

// User Profile & Destructive Data Clear
router.get('/user/profile', authenticateToken, AuthController.getMe);
router.put('/user/profile', authenticateToken, AuthController.updateProfile);
router.delete('/user/financial-data', authenticateToken, AccountController.deleteFinancialData);

// Financial Accounts & Mock Account Aggregator
router.use('/accounts', accountRoutes);

// Transactions Ledger
router.use('/transactions', transactionRoutes);

// Analytics & UPI Drill-downs
router.use('/analytics', analyticsRoutes);

// Spending Budgets
router.use('/budgets', budgetRoutes);

// AI Insights Engine
router.use('/insights', insightsRoutes);

export default router;
