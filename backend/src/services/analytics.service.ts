import { db } from '../db/database.js';
import {
  type Period,
  type Transaction,
  type PaymentSource,
  type Category
} from '../types/index.js';
import { TransactionService } from './transaction.service.js';

export interface AnalyticsSummary {
  period: Period;
  startDate: string;
  endDate: string;
  total_spending: number;
  total_income: number;
  total_expenses: number;
  savings: number;
  savings_rate: number;
  category_breakdown: Record<Category, number>;
  upi_source_breakdown: Record<PaymentSource, number>;
}

export interface UPISpendingAnalysisResponse {
  period: Period;
  date: string;
  total_spending: number;
  upi_source_breakdown: Record<PaymentSource, number>;
  category_breakdown: Record<string, number>;
  merchant_breakdown: Record<string, number>;
  plan_comparison: Record<string, {
    budget_limit: number;
    actual_month_to_date: number;
    over_budget: boolean;
    variance: number;
  }>;
  contributing_transactions: Transaction[];
}

export interface MonthlyTrendItem {
  year: number;
  month: number;
  month_name: string;
  total_expenses: number;
  total_income: number;
  savings: number;
}

export class AnalyticsService {
  private static readonly MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  /**
   * Retrieves summary analytical metrics (Income, Expenses, Savings, Savings Rate, Category & UPI breakdown).
   */
  public static async getSummary(userId: number, period: Period = 'monthly', anchorDate: string = '2026-08-31'): Promise<AnalyticsSummary> {
    const { startDate = '2026-08-01', endDate = '2026-08-31' } = TransactionService.getDateRangeForPeriod(period, anchorDate);

    // 1. Expense (Debit) Total
    const expenseRow = await db.queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
    `, [userId, startDate, endDate]);
    const totalExpenses = Number(Number(expenseRow?.total ?? 0).toFixed(2));

    // 2. Income (Credit) Total
    const incomeRow = await db.queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Credit' AND transaction_date >= $2 AND transaction_date <= $3
    `, [userId, startDate, endDate]);
    const totalIncome = Number(Number(incomeRow?.total ?? 0).toFixed(2));

    // 3. Savings & Savings Rate
    const savings = Number((totalIncome - totalExpenses).toFixed(2));
    const savingsRate = totalIncome > 0 ? Number((savings / totalIncome).toFixed(4)) : 0.0;

    // 4. Category Breakdown
    const catRows = await db.queryAll<{ category: Category; total: number }>(`
      SELECT category, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
      GROUP BY category
    `, [userId, startDate, endDate]);

    const categoryBreakdown: Record<string, number> = {};
    catRows.forEach(row => {
      categoryBreakdown[row.category] = Number(Number(row.total).toFixed(2));
    });

    // 5. UPI / Payment Source Breakdown
    const paymentRows = await db.queryAll<{ payment_source: PaymentSource; total: number }>(`
      SELECT payment_source, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
      GROUP BY payment_source
    `, [userId, startDate, endDate]);

    const upiSourceBreakdown: Record<PaymentSource, number> = {
      'Google Pay': 0,
      'PhonePe': 0,
      'Paytm': 0,
      'Unknown/Other': 0
    };

    paymentRows.forEach(row => {
      const val = Number(Number(row.total).toFixed(2));
      if (row.payment_source in upiSourceBreakdown) {
        upiSourceBreakdown[row.payment_source] = val;
      } else {
        upiSourceBreakdown['Unknown/Other'] += val;
      }
    });

    return {
      period,
      startDate,
      endDate,
      total_spending: totalExpenses,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      savings,
      savings_rate: savingsRate,
      category_breakdown: categoryBreakdown as Record<Category, number>,
      upi_source_breakdown: upiSourceBreakdown
    };
  }

  /**
   * Dedicated DESIGN-v3 UPI analysis endpoint (GET /api/analytics/upi?period=daily).
   */
  public static async getUPIAnalysis(userId: number, period: Period = 'daily', anchorDate: string = '2026-08-31'): Promise<UPISpendingAnalysisResponse> {
    const { startDate = '2026-08-31', endDate = '2026-08-31' } = TransactionService.getDateRangeForPeriod(period, anchorDate);

    // 1. Total Spending
    const totalRow = await db.queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
    `, [userId, startDate, endDate]);
    const totalSpending = Number(Number(totalRow?.total ?? 0).toFixed(2));

    // 2. UPI Source Breakdown
    const paymentRows = await db.queryAll<{ payment_source: PaymentSource; total: number }>(`
      SELECT payment_source, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
      GROUP BY payment_source
    `, [userId, startDate, endDate]);

    const upiSourceBreakdown: Record<PaymentSource, number> = {
      'Google Pay': 0,
      'PhonePe': 0,
      'Paytm': 0,
      'Unknown/Other': 0
    };

    paymentRows.forEach(row => {
      const val = Number(Number(row.total).toFixed(2));
      if (row.payment_source in upiSourceBreakdown) {
        upiSourceBreakdown[row.payment_source] = val;
      } else {
        upiSourceBreakdown['Unknown/Other'] += val;
      }
    });

    // 3. Category Breakdown
    const catRows = await db.queryAll<{ category: string; total: number }>(`
      SELECT category, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
      GROUP BY category
      ORDER BY total DESC
    `, [userId, startDate, endDate]);

    const categoryBreakdown: Record<string, number> = {};
    catRows.forEach(row => {
      categoryBreakdown[row.category] = Number(Number(row.total).toFixed(2));
    });

    // 4. Merchant Breakdown
    const merchantRows = await db.queryAll<{ merchant: string; total: number }>(`
      SELECT merchant, COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
      GROUP BY merchant
      ORDER BY total DESC
    `, [userId, startDate, endDate]);

    const merchantBreakdown: Record<string, number> = {};
    merchantRows.forEach(row => {
      merchantBreakdown[row.merchant] = Number(Number(row.total).toFixed(2));
    });

    // 5. Plan Comparison (Month-to-date actual vs configured budget limit)
    const monthRange = TransactionService.getDateRangeForPeriod('monthly', anchorDate);
    const budgets = await db.queryAll<{
      category: string;
      limit_amount: number;
      actual_month_to_date: number;
    }>(`
      SELECT b.category, b.limit_amount,
             COALESCE((
               SELECT SUM(t.amount)
               FROM transactions t
               WHERE t.user_id = b.user_id
                 AND t.category = b.category
                 AND t.type = 'Debit'
                 AND t.transaction_date >= $1
                 AND t.transaction_date <= $2
             ), 0) as actual_month_to_date
      FROM budgets b
      WHERE b.user_id = $3
    `, [monthRange.startDate!, monthRange.endDate!, userId]);

    const planComparison: Record<string, {
      budget_limit: number;
      actual_month_to_date: number;
      over_budget: boolean;
      variance: number;
    }> = {};

    budgets.forEach(b => {
      const limit = Number(Number(b.limit_amount).toFixed(2));
      const actual = Number(Number(b.actual_month_to_date).toFixed(2));
      const variance = Number((limit - actual).toFixed(2));
      planComparison[b.category] = {
        budget_limit: limit,
        actual_month_to_date: actual,
        over_budget: actual > limit,
        variance
      };
    });

    // 6. Contributing Transactions
    const contributingTransactions = await db.queryAll<Transaction>(`
      SELECT id, account_id, user_id, transaction_date, description, amount, type, merchant, payment_source, category, created_at
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
      ORDER BY amount DESC, id ASC
    `, [userId, startDate, endDate]);

    return {
      period,
      date: anchorDate,
      total_spending: totalSpending,
      upi_source_breakdown: upiSourceBreakdown,
      category_breakdown: categoryBreakdown,
      merchant_breakdown: merchantBreakdown,
      plan_comparison: planComparison,
      contributing_transactions: contributingTransactions.map(t => ({
        ...t,
        amount: Number(t.amount),
        transaction_date: typeof t.transaction_date === 'string' ? t.transaction_date : (t.transaction_date as any).toISOString().split('T')[0]
      }))
    };
  }

  /**
   * Retrieves historical multi-month trends.
   */
  public static async getMonthlyTrends(userId: number): Promise<MonthlyTrendItem[]> {
    const isPg = db.isPostgres();
    const querySql = isPg
      ? `
        SELECT 
          EXTRACT(YEAR FROM transaction_date)::INTEGER as year,
          EXTRACT(MONTH FROM transaction_date)::INTEGER as month,
          COALESCE(SUM(CASE WHEN type = 'Debit' THEN amount ELSE 0 END), 0) as total_expenses,
          COALESCE(SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END), 0) as total_income
        FROM transactions
        WHERE user_id = $1
        GROUP BY EXTRACT(YEAR FROM transaction_date), EXTRACT(MONTH FROM transaction_date)
        ORDER BY year ASC, month ASC
      `
      : `
        SELECT 
          CAST(strftime('%Y', transaction_date) AS INTEGER) as year,
          CAST(strftime('%m', transaction_date) AS INTEGER) as month,
          COALESCE(SUM(CASE WHEN type = 'Debit' THEN amount ELSE 0 END), 0) as total_expenses,
          COALESCE(SUM(CASE WHEN type = 'Credit' THEN amount ELSE 0 END), 0) as total_income
        FROM transactions
        WHERE user_id = $1
        GROUP BY strftime('%Y-%m', transaction_date)
        ORDER BY year ASC, month ASC
      `;

    const rows = await db.queryAll<{
      year: number;
      month: number;
      total_expenses: number;
      total_income: number;
    }>(querySql, [userId]);

    return rows.map(r => {
      const expenses = Number(Number(r.total_expenses).toFixed(2));
      const income = Number(Number(r.total_income).toFixed(2));
      const savings = Number((income - expenses).toFixed(2));
      const monthName = this.MONTH_NAMES[Number(r.month) - 1] || `Month ${r.month}`;

      return {
        year: Number(r.year),
        month: Number(r.month),
        month_name: monthName,
        total_expenses: expenses,
        total_income: income,
        savings
      };
    });
  }
}
