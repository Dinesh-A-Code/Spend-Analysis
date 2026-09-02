import { db } from '../db/database.js';
import { type ConnectedAccount, type AccountType } from '../types/index.js';

export const SUPPORTED_INSTITUTIONS = [
  { name: 'HDFC Bank', maskedNumber: 'XXXX-XXXX-9876', type: 'Savings' as AccountType },
  { name: 'ICICI Bank', maskedNumber: 'XXXX-XXXX-4512', type: 'Savings' as AccountType },
  { name: 'State Bank of India (SBI)', maskedNumber: 'XXXX-XXXX-3341', type: 'Savings' as AccountType }
];

export class AccountService {
  public static async getAccounts(userId: number): Promise<ConnectedAccount[]> {
    const accounts = await db.queryAll<ConnectedAccount>(`
      SELECT id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, created_at
      FROM connected_accounts
      WHERE user_id = $1
      ORDER BY id ASC
    `, [userId]);

    return accounts;
  }

  public static async getAccountById(userId: number, accountId: number): Promise<ConnectedAccount | undefined> {
    const account = await db.queryOne<ConnectedAccount>(`
      SELECT id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, created_at
      FROM connected_accounts
      WHERE id = $1 AND user_id = $2
    `, [accountId, userId]);

    return account;
  }

  public static async connectMockAccount(userId: number, institutionName: string): Promise<ConnectedAccount> {
    const matchedInst = SUPPORTED_INSTITUTIONS.find(
      inst => inst.name.toLowerCase() === institutionName.trim().toLowerCase()
    ) || {
      name: institutionName.trim() || 'HDFC Bank (Mock)',
      maskedNumber: 'XXXX-XXXX-8899',
      type: 'Savings' as AccountType
    };

    const consentId = `CNS-MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const consentExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

    await db.query(`
      INSERT INTO connected_accounts (user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry)
      VALUES ($1, $2, $3, $4, 1, $5, $6)
    `, [
      userId,
      `${matchedInst.name} (Mock)`,
      matchedInst.maskedNumber,
      matchedInst.type,
      consentId,
      consentExpiry
    ]);

    const newAccount = await db.queryOne<ConnectedAccount>(`
      SELECT id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, created_at
      FROM connected_accounts
      WHERE consent_id = $1
    `, [consentId]);

    if (!newAccount) {
      throw new Error('Failed to create connected account.');
    }

    // Ingest sandbox transaction records for this connected account
    await this.ingestSandboxTransactions(userId, newAccount.id);

    return newAccount;
  }

  public static async revokeConsent(userId: number, accountId: number): Promise<ConnectedAccount> {
    const account = await this.getAccountById(userId, accountId);
    if (!account) {
      throw new Error('Connected account not found.');
    }

    await db.query(`
      UPDATE connected_accounts
      SET consent_granted = 0
      WHERE id = $1 AND user_id = $2
    `, [accountId, userId]);

    const updated = await this.getAccountById(userId, accountId);
    return updated!;
  }

  public static async deleteFinancialData(userId: number): Promise<{ success: boolean; deletedCount: { transactions: number; accounts: number } }> {
    const txCountRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [userId]);
    const accountCountRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM connected_accounts WHERE user_id = $1', [userId]);

    const txCount = Number(txCountRow?.c ?? 0);
    const accountCount = Number(accountCountRow?.c ?? 0);

    // Delete financial records
    await db.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM connected_accounts WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
    await db.query('DELETE FROM ai_insights WHERE user_id = $1', [userId]);

    return {
      success: true,
      deletedCount: {
        transactions: txCount,
        accounts: accountCount
      }
    };
  }

  private static async ingestSandboxTransactions(userId: number, accountId: number): Promise<void> {
    const existingTxRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [userId]);
    const existingTxCount = Number(existingTxRow?.c ?? 0);

    if (existingTxCount > 0) {
      // Sandbox transactions already exist for this user; do not duplicate
      return;
    }

    const txs = [
      // Income
      [accountId, userId, '2026-08-01', 'Monthly Salary Credit', 45000.00, 'Credit', 'Employer Inc', 'Unknown/Other', 'Other'],
      // Daily 2026-08-31 (Total: ₹1,240)
      [accountId, userId, '2026-08-31', 'UPI/Swiggy Delivery', 320.00, 'Debit', 'Swiggy', 'Google Pay', 'Food'],
      [accountId, userId, '2026-08-31', 'UPI/City Bus Ride', 80.00, 'Debit', 'City Bus', 'Google Pay', 'Transport'],
      [accountId, userId, '2026-08-31', 'UPI/Tea Shop payment', 20.00, 'Debit', 'Local Tea Shop', 'Google Pay', 'Food'],
      [accountId, userId, '2026-08-31', 'UPI/Amazon Store', 100.00, 'Debit', 'Amazon', 'Google Pay', 'Shopping'],
      [accountId, userId, '2026-08-31', 'UPI/Ola Cab fare', 430.00, 'Debit', 'Ola Cabs', 'PhonePe', 'Transport'],
      [accountId, userId, '2026-08-31', 'UPI/Groceries payment', 290.00, 'Debit', 'Local Grocer', 'Paytm', 'Food'],
      // Monthly Balancing Transactions (August 2026)
      [accountId, userId, '2026-08-05', 'Zomato order', 1870.00, 'Debit', 'Zomato', 'Google Pay', 'Food'],
      [accountId, userId, '2026-08-12', 'Weekly Groceries', 2000.00, 'Debit', 'Star Bazaar', 'PhonePe', 'Food'],
      [accountId, userId, '2026-08-15', 'Myntra shopping', 1800.00, 'Debit', 'Myntra', 'PhonePe', 'Shopping'],
      [accountId, userId, '2026-08-20', 'Amazon India apparel', 1300.00, 'Debit', 'Amazon', 'Google Pay', 'Shopping'],
      [accountId, userId, '2026-08-18', 'Uber trip summary', 1290.00, 'Debit', 'Uber', 'Google Pay', 'Transport'],
      [accountId, userId, '2026-08-03', 'Movie tickets', 1200.00, 'Debit', 'BookMyShow', 'Paytm', 'Entertainment'],
      [accountId, userId, '2026-08-02', 'Electricity Bill BESCOM', 2000.00, 'Debit', 'BESCOM', 'Unknown/Other', 'Bills'],
      // Historical trends (Jan - Apr 2026)
      [accountId, userId, '2026-01-15', 'Rent & Utility bills', 15000.00, 'Debit', 'Society Admin', 'Unknown/Other', 'Bills'],
      [accountId, userId, '2026-02-14', 'Tech purchase & medical care', 17500.00, 'Debit', 'Electronics shop', 'PhonePe', 'Shopping'],
      [accountId, userId, '2026-03-10', 'Investments & Insurance premiums', 14200.00, 'Debit', 'Zerodha', 'Unknown/Other', 'Investments'],
      [accountId, userId, '2026-04-20', 'Family travel expenses', 19100.00, 'Debit', 'MakeMyTrip', 'Google Pay', 'Transport']
    ];

    for (const tx of txs) {
      await db.query(`
        INSERT INTO transactions (account_id, user_id, transaction_date, description, amount, type, merchant, payment_source, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, tx);
    }

    // Default Budgets if not present
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
