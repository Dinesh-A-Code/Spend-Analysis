import { type Response } from 'express';
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { BudgetService } from '../services/budget.service.js';

export class BudgetController {
  public static async getBudgets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const anchorDate = (req.query.date as string) || '2026-08-31';
      const overview = await BudgetService.getBudgets(userId, anchorDate);

      res.status(200).json({
        success: true,
        data: overview
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve budgets.'
      });
    }
  }

  public static async setBudget(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const category = req.params.category;
      const { limit_amount } = req.body;

      if (limit_amount === undefined || isNaN(Number(limit_amount))) {
        res.status(400).json({
          success: false,
          error: 'limit_amount is required and must be a valid number.'
        });
        return;
      }

      const updated = await BudgetService.setBudget(userId, category, Number(limit_amount));

      res.status(200).json({
        success: true,
        data: {
          budget: updated,
          message: `Spending plan for ${category} updated to ₹${updated.limit_amount}.`
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set category spending plan.'
      });
    }
  }
}
