import { type Response } from 'express';
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { TransactionService, type TransactionFilters } from '../services/transaction.service.js';
import { type PaymentSource, type Category, type TransactionType, type Period } from '../types/index.js';

export class TransactionController {
  public static async getTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { period, date, startDate, endDate, payment_source, category, type, search, limit, offset } = req.query;

      const filters: TransactionFilters = {
        period: period as Period | 'all',
        date: date as string,
        startDate: startDate as string,
        endDate: endDate as string,
        payment_source: payment_source as PaymentSource | 'all',
        category: category as Category | 'all',
        type: type as TransactionType | 'all',
        search: search as string,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined
      };

      const result = await TransactionService.getTransactions(userId, filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve transactions.'
      });
    }
  }

  public static async getTransactionById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = Number(req.params.id);

      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          error: 'Valid transaction ID is required.'
        });
        return;
      }

      const tx = await TransactionService.getTransactionById(userId, id);
      if (!tx) {
        res.status(404).json({
          success: false,
          error: 'Transaction not found.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { transaction: tx }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve transaction details.'
      });
    }
  }
}
