import { db } from '../db/database.js';
import { type AIInsight, type InsightType, type PaymentSource } from '../types/index.js';
import { TransactionService } from './transaction.service.js';

interface GeneratedInsight {
  category: string;
  insight_text: string;
  insight_type: InsightType;
  trigger_metric_value: number | null;
}

export class InsightsEngineService {
  /**
   * Retrieves active (non-dismissed) insights for the user.
   */
  public static async getInsights(userId: number): Promise<AIInsight[]> {
    const rows = await db.queryAll<AIInsight>(`
      SELECT id, user_id, category, insight_text, insight_type, trigger_metric_value, is_dismissed, generated_at
      FROM ai_insights
      WHERE user_id = $1 AND is_dismissed = 0
      ORDER BY id DESC
    `, [userId]);

    return rows.map(r => ({
      ...r,
      trigger_metric_value: r.trigger_metric_value !== null ? Number(r.trigger_metric_value) : null
    }));
  }

  /**
   * Dismisses an insight by ID.
   */
  public static async dismissInsight(userId: number, insightId: number): Promise<boolean> {
    const result = await db.query(`
      UPDATE ai_insights
      SET is_dismissed = 1
      WHERE id = $1 AND user_id = $2
    `, [insightId, userId]);

    return result.rowCount > 0;
  }

  /**
   * Deterministically evaluates the 6 mathematical heuristic rules from records
   * and populates the ai_insights table.
   */
  public static async recalculateInsights(userId: number, anchorDate: string = '2026-08-31'): Promise<AIInsight[]> {
    const generated: GeneratedInsight[] = [];

    // Current Month range (M0)
    const { startDate: m0Start = '2026-08-01', endDate: m0End = '2026-08-31' } = TransactionService.getDateRangeForPeriod('monthly', anchorDate);

    // Prior Month range (M-1)
    const anchor = new Date(anchorDate);
    const prevMonthEnd = new Date(anchor.getFullYear(), anchor.getMonth(), 0); // last day of previous month
    const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
    const m1Start = prevMonthStart.toISOString().split('T')[0];
    const m1End = prevMonthEnd.toISOString().split('T')[0];

    // -------------------------------------------------------------
    // RULE A: Month-on-Month (MoM) Category Spikes (>15%)
    // -------------------------------------------------------------
    const m0CatSpends = await db.queryAll<{ category: string; spend: number }>(`
      SELECT category, SUM(amount) as spend
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
      GROUP BY category
    `, [userId, m0Start, m0End]);

    for (const item of m0CatSpends) {
      const prevRow = await db.queryOne<{ spend: number | null }>(`
        SELECT SUM(amount) as spend
        FROM transactions
        WHERE user_id = $1 AND type = 'Debit' AND category = $2 AND transaction_date >= $3 AND transaction_date <= $4
      `, [userId, item.category, m1Start, m1End]);

      const prevSpend = Number(prevRow?.spend ?? 0);
      const currentSpend = Number(item.spend);
      if (prevSpend > 0) {
        const deltaPct = ((currentSpend - prevSpend) / prevSpend) * 100;
        if (deltaPct > 15) {
          const roundedPct = Math.round(deltaPct);
          generated.push({
            category: item.category,
            insight_type: 'Pattern',
            insight_text: `Your ${item.category.toLowerCase()} spending increased ${roundedPct}% compared with last month.`,
            trigger_metric_value: roundedPct
          });
        }
      }
    }

    // -------------------------------------------------------------
    // RULE B: Weekend Concentration Heuristic (>55% over past 30 days)
    // -------------------------------------------------------------
    const historyCountRow = await db.queryOne<{ days: number }>(`
      SELECT COUNT(DISTINCT transaction_date) as days
      FROM transactions
      WHERE user_id = $1
    `, [userId]);
    const historyCount = Number(historyCountRow?.days ?? 0);

    if (historyCount >= 14) {
      // 30 day window ending on anchorDate
      const thirtyDaysAgo = new Date(anchor);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const windowStart = thirtyDaysAgo.toISOString().split('T')[0];

      const isPg = db.isPostgres();
      const cat30Query = isPg
        ? `
          SELECT category,
                 SUM(amount) as total_spend,
                 SUM(CASE WHEN EXTRACT(DOW FROM transaction_date)::INTEGER IN (0, 6) THEN amount ELSE 0 END) as weekend_spend
          FROM transactions
          WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
          GROUP BY category
        `
        : `
          SELECT category,
                 SUM(amount) as total_spend,
                 SUM(CASE WHEN CAST(strftime('%w', transaction_date) AS INTEGER) IN (0, 6) THEN amount ELSE 0 END) as weekend_spend
          FROM transactions
          WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
          GROUP BY category
        `;

      const cat30Spends = await db.queryAll<{ category: string; total_spend: number; weekend_spend: number }>(cat30Query, [userId, windowStart, anchorDate]);

      for (const item of cat30Spends) {
        const totalSpend = Number(item.total_spend);
        const weekendSpend = Number(item.weekend_spend);
        if (totalSpend > 0) {
          const ratio = (weekendSpend / totalSpend) * 100;
          if (ratio > 55) {
            generated.push({
              category: item.category,
              insight_type: 'Pattern',
              insight_text: `Weekend ${item.category.toLowerCase()} spending is significantly higher than weekday spending.`,
              trigger_metric_value: Math.round(ratio)
            });
          }
        }
      }
    }

    // -------------------------------------------------------------
    // RULE C: Recurring Subscription Summation
    // -------------------------------------------------------------
    const subRow = await db.queryOne<{ sub_total: number }>(`
      SELECT COALESCE(SUM(amount), 0) as sub_total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND category = 'Subscriptions' AND transaction_date >= $2 AND transaction_date <= $3
    `, [userId, m0Start, m0End]);

    const subTotal = Number(subRow?.sub_total ?? 0);
    if (subTotal > 0) {
      const formattedSum = Math.round(subTotal).toLocaleString('en-IN');
      generated.push({
        category: 'Subscriptions',
        insight_type: 'Pattern',
        insight_text: `Subscriptions account for ₹${formattedSum}/month.`,
        trigger_metric_value: subTotal
      });
    }

    // -------------------------------------------------------------
    // RULE D: Food-Delivery Savings Recommendation (30% rule when over budget)
    // -------------------------------------------------------------
    const foodBudget = await db.queryOne<{ limit_amount: number }>(`
      SELECT limit_amount FROM budgets WHERE user_id = $1 AND category = 'Food'
    `, [userId]);

    const foodSpendRow = await db.queryOne<{ total_food: number; delivery_food: number }>(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_food,
        COALESCE(SUM(CASE WHEN LOWER(merchant) IN ('swiggy', 'zomato') THEN amount ELSE 0 END), 0) as delivery_food
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND category = 'Food' AND transaction_date >= $2 AND transaction_date <= $3
    `, [userId, m0Start, m0End]);

    const totalFood = Number(foodSpendRow?.total_food ?? 0);
    const deliveryFood = Number(foodSpendRow?.delivery_food ?? 0);
    const limitAmount = Number(foodBudget?.limit_amount ?? 0);

    if (foodBudget && totalFood > limitAmount && totalFood > 0) {
      const deliveryRatio = deliveryFood / totalFood;
      if (deliveryRatio > 0.30) {
        const potentialSavings = Math.round(deliveryFood * 0.30);
        generated.push({
          category: 'Food',
          insight_type: 'Recommendation',
          insight_text: `You could reduce monthly spending by approximately ₹${potentialSavings.toLocaleString('en-IN')} by reducing your food-delivery expenses.`,
          trigger_metric_value: potentialSavings
        });
      }
    }

    // -------------------------------------------------------------
    // RULE E: Budget Envelope Violation Alert
    // -------------------------------------------------------------
    const budgets = await db.queryAll<{ category: string; limit_amount: number; actual_spend: number }>(`
      SELECT b.category, b.limit_amount,
             COALESCE(SUM(t.amount), 0) as actual_spend
      FROM budgets b
      LEFT JOIN transactions t ON t.user_id = b.user_id 
                               AND t.category = b.category 
                               AND t.type = 'Debit' 
                               AND t.transaction_date >= $1 
                               AND t.transaction_date <= $2
      WHERE b.user_id = $3
      GROUP BY b.id, b.category, b.limit_amount
    `, [m0Start, m0End, userId]);

    for (const b of budgets) {
      const actualSpend = Number(b.actual_spend);
      const limitAmt = Number(b.limit_amount);
      if (actualSpend > limitAmt) {
        const overage = Math.round(actualSpend - limitAmt);
        generated.push({
          category: b.category,
          insight_type: 'Alert',
          insight_text: `You have exceeded your ${b.category} spending plan by ₹${overage.toLocaleString('en-IN')}.`,
          trigger_metric_value: overage
        });
      }
    }

    // -------------------------------------------------------------
    // RULE F: UPI / Payment-Source Dominance (>30%) + Grounded Daily
    // -------------------------------------------------------------
    const upiSources = await db.queryAll<{ payment_source: PaymentSource; spend: number }>(`
      SELECT payment_source, SUM(amount) as spend
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND transaction_date >= $2 AND transaction_date <= $3
      GROUP BY payment_source
    `, [userId, m0Start, m0End]);

    const totalUpiSpend = upiSources.reduce((sum, item) => sum + Number(item.spend), 0);

    if (totalUpiSpend > 0) {
      for (const src of upiSources) {
        if (src.payment_source !== 'Unknown/Other') {
          const share = (Number(src.spend) / totalUpiSpend) * 100;
          if (share > 30) {
            const roundedShare = Math.round(share);
            generated.push({
              category: 'General',
              insight_type: 'Pattern',
              insight_text: `${src.payment_source} accounted for ${roundedShare}% of your UPI spending this month.`,
              trigger_metric_value: roundedShare
            });
          }
        }
      }
    }

    // Daily grounded observation for anchorDate (e.g. ₹520 through Google Pay today)
    const dailyGPayRow = await db.queryOne<{ total: number }>(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = $1 AND type = 'Debit' AND payment_source = 'Google Pay' AND transaction_date = $2
    `, [userId, anchorDate]);

    const dailyGPayTotal = Number(dailyGPayRow?.total ?? 0);
    if (dailyGPayTotal > 0) {
      const gpaySpend = Math.round(dailyGPayTotal);
      generated.push({
        category: 'General',
        insight_type: 'Alert',
        insight_text: `You spent ₹${gpaySpend.toLocaleString('en-IN')} through Google Pay today.`,
        trigger_metric_value: gpaySpend
      });
    }

    // Clean up old active non-dismissed items to prevent duplicates
    await db.query('DELETE FROM ai_insights WHERE user_id = $1 AND is_dismissed = 0', [userId]);

    for (const item of generated) {
      await db.query(`
        INSERT INTO ai_insights (user_id, category, insight_text, insight_type, trigger_metric_value, is_dismissed)
        VALUES ($1, $2, $3, $4, $5, 0)
      `, [
        userId,
        item.category,
        item.insight_text,
        item.insight_type,
        item.trigger_metric_value
      ]);
    }

    return this.getInsights(userId);
  }
}
