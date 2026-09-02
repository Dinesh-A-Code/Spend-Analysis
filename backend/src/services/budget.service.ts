import { db } from '../db/database.js';
import { type Category } from '../types/index.js';
import { CategorizationService } from './categorization.service.js';
import { TransactionService } from './transaction.service.js';

export interface BudgetStatusItem {
  id: number;
  category: Category;
  limit_amount: number;
  actual_spent: number;
  variance: number;
  remaining_amount: number;
  over_budget_amount: number;
  percentage_used: number;
  status: 'under_budget' | 'exact' | 'over_budget';
  created_at: string;
}

export interface BudgetOverview {
  total_budget: number;
  total_spent: number;
  total_variance: number;
  categories: BudgetStatusItem[];
}

export class BudgetService {
  public static async getBudgets(userId: number, anchorDate: string = '2026-08-31'): Promise<BudgetOverview> {
    const { startDate = '2026-08-01', endDate = '2026-08-31' } = TransactionService.getDateRangeForPeriod('monthly', anchorDate);

    const rows = await db.queryAll<{
      id: number;
      category: Category;
      limit_amount: number;
      actual_spent: number;
      created_at: string;
    }>(`
      SELECT b.id, b.category, b.limit_amount, b.created_at,
             COALESCE((
               SELECT SUM(t.amount)
               FROM transactions t
               WHERE t.user_id = b.user_id
                 AND t.category = b.category
                 AND t.type = 'Debit'
                 AND t.transaction_date >= $1
                 AND t.transaction_date <= $2
             ), 0) as actual_spent
      FROM budgets b
      WHERE b.user_id = $3
      ORDER BY b.category ASC
    `, [startDate, endDate, userId]);

    let totalBudget = 0;
    let totalEnvelopesSpent = 0;

    const categories: BudgetStatusItem[] = rows.map(r => {
      const limit = Number(Number(r.limit_amount).toFixed(2));
      const spent = Number(Number(r.actual_spent).toFixed(2));
      const variance = Number((limit - spent).toFixed(2));
      const remaining = Number(Math.max(0, limit - spent).toFixed(2));
      const overBudget = Number(Math.max(0, spent - limit).toFixed(2));
      const percentageUsed = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;

      let status: 'under_budget' | 'exact' | 'over_budget' = 'under_budget';
      if (spent > limit) {
        status = 'over_budget';
      } else if (spent === limit) {
        status = 'exact';
      }

      totalBudget += limit;
      totalEnvelopesSpent += spent;

      return {
        id: r.id,
        category: r.category,
        limit_amount: limit,
        actual_spent: spent,
        variance,
        remaining_amount: remaining,
        over_budget_amount: overBudget,
        percentage_used: percentageUsed,
        status,
        created_at: r.created_at
      };
    });

    // Query total month debit expenses across all categories for user
    const monthExpensesRow = await db.queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
    `, [userId, startDate, endDate]);
    const totalMonthSpent = Number(Number(monthExpensesRow?.total ?? 0).toFixed(2));

    const totalSpent = totalMonthSpent > 0 ? totalMonthSpent : totalEnvelopesSpent;

    return {
      total_budget: Number(totalBudget.toFixed(2)),
      total_spent: Number(totalSpent.toFixed(2)),
      total_variance: Number((totalBudget - totalSpent).toFixed(2)),
      categories
    };
  }

  public static async setBudget(userId: number, category: string, limitAmount: number): Promise<BudgetStatusItem> {
    if (!CategorizationService.isValidCategory(category)) {
      throw new Error(`Invalid budget category: "${category}". Must be one of the 10 approved categories.`);
    }

    if (isNaN(limitAmount) || limitAmount < 0) {
      throw new Error('Limit amount must be a positive number.');
    }

    await db.query(`
      INSERT INTO budgets (user_id, category, limit_amount)
      VALUES ($1, $2, $3)
      ON CONFLICT(user_id, category)
      DO UPDATE SET limit_amount = EXCLUDED.limit_amount
    `, [userId, category, limitAmount]);

    const overview = await this.getBudgets(userId);
    const updatedItem = overview.categories.find(c => c.category === category);
    if (!updatedItem) {
      throw new Error('Failed to retrieve updated budget item.');
    }

    return updatedItem;
  }
}
