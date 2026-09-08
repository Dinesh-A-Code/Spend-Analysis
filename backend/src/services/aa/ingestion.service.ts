import { db } from '../../db/database.js';
import {
  type NormalizedTransaction,
  type IngestionResult,
  type AccountMetadata
} from './types.js';

export class AAIngestionService {
  /**
   * Safely ingests normalized transactions with duplicate protection based primarily on stable
   * external/provider transaction identifiers, falling back to content matching only when no external ID exists.
   */
  public static async ingestTransactions(
    accountMeta: AccountMetadata,
    transactions: NormalizedTransaction[]
  ): Promise<IngestionResult> {
    let insertedCount = 0;
    let skippedDuplicates = 0;
    const insertedTxs: NormalizedTransaction[] = [];

    for (const tx of transactions) {
      // 1. Validation Safeguards
      if (typeof tx.amount !== 'number' || isNaN(tx.amount) || tx.amount <= 0) {
        continue;
      }
      if (!tx.transaction_date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.transaction_date)) {
        continue;
      }

      // 2. Duplicate Detection:
      // Priority A: Check by stable external_transaction_id if available
      // Priority B: Content-based fallback when external_transaction_id is absent
      let existing: { id: number } | undefined;

      if (tx.external_transaction_id && tx.external_transaction_id.trim().length > 0) {
        existing = await db.queryOne<{ id: number }>(`
          SELECT id FROM transactions
          WHERE user_id = $1
            AND external_transaction_id = $2
          LIMIT 1
        `, [
          accountMeta.userId,
          tx.external_transaction_id.trim()
        ]);
      } else {
        existing = await db.queryOne<{ id: number }>(`
          SELECT id FROM transactions
          WHERE user_id = $1
            AND account_id = $2
            AND transaction_date = $3
            AND amount = $4
            AND type = $5
            AND merchant = $6
            AND payment_source = $7
            AND (external_transaction_id IS NULL OR external_transaction_id = '')
          LIMIT 1
        `, [
          accountMeta.userId,
          accountMeta.accountId,
          tx.transaction_date,
          tx.amount,
          tx.type,
          tx.merchant,
          tx.payment_source
        ]);
      }

      if (existing) {
        skippedDuplicates++;
        continue;
      }

      // 3. Insert new unique transaction
      await db.query(`
        INSERT INTO transactions (account_id, user_id, transaction_date, description, amount, type, merchant, payment_source, category, external_transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        accountMeta.accountId,
        accountMeta.userId,
        tx.transaction_date,
        tx.description,
        tx.amount,
        tx.type,
        tx.merchant,
        tx.payment_source,
        tx.category,
        tx.external_transaction_id?.trim() || null
      ]);

      insertedCount++;
      insertedTxs.push(tx);
    }

    // 4. Ensure default spending budgets exist for the user
    await this.ensureDefaultBudgets(accountMeta.userId);

    return {
      totalProcessed: transactions.length,
      insertedCount,
      skippedDuplicates,
      transactions: insertedTxs
    };
  }

  /**
   * Initializes standard budget envelopes if none are configured for the user.
   */
  private static async ensureDefaultBudgets(userId: number): Promise<void> {
    const existingBudget = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM budgets WHERE user_id = $1', [userId]);
    if (Number(existingBudget?.c ?? 0) === 0) {
      const defaultBudgets = [
        ['Food', 4000.00],
        ['Transport', 2000.00],
        ['Shopping', 2500.00],
        ['Bills', 2000.00],
        ['Entertainment', 1500.00]
      ];
      for (const [cat, limit] of defaultBudgets) {
        await db.query('INSERT INTO budgets (user_id, category, limit_amount) VALUES ($1, $2, $3)', [userId, cat, limit]);
      }
    }
  }
}
