import { db } from '../db/database.js';
import { type ConnectedAccount, type AccountType } from '../types/index.js';
import { AAProviderRegistry } from './aa/registry.js';
import { AAIngestionService } from './aa/ingestion.service.js';
import { type AAProviderType, type IngestionResult } from './aa/types.js';

export const SUPPORTED_INSTITUTIONS = [
  { name: 'HDFC Bank', maskedNumber: 'XXXX-XXXX-9876', type: 'Savings' as AccountType },
  { name: 'ICICI Bank', maskedNumber: 'XXXX-XXXX-4512', type: 'Savings' as AccountType },
  { name: 'State Bank of India (SBI)', maskedNumber: 'XXXX-XXXX-3341', type: 'Savings' as AccountType }
];

export class AccountService {
  /**
   * Retrieves all connected accounts for a given user.
   */
  public static async getAccounts(userId: number): Promise<ConnectedAccount[]> {
    const accounts = await db.queryAll<ConnectedAccount>(`
      SELECT id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, provider_id, created_at
      FROM connected_accounts
      WHERE user_id = $1
      ORDER BY id ASC
    `, [userId]);

    return accounts;
  }

  /**
   * Retrieves a specific connected account by ID for a user.
   */
  public static async getAccountById(userId: number, accountId: number): Promise<ConnectedAccount | undefined> {
    const account = await db.queryOne<ConnectedAccount>(`
      SELECT id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, provider_id, created_at
      FROM connected_accounts
      WHERE id = $1 AND user_id = $2
    `, [accountId, userId]);

    return account;
  }

  /**
   * Connects a financial institution account via the Account Aggregator provider architecture.
   */
  public static async connectAccount(
    userId: number,
    institutionName: string,
    providerType?: AAProviderType
  ): Promise<ConnectedAccount> {
    const provider = AAProviderRegistry.getProvider(providerType);

    // 1. Create Consent Artifact via AA Provider
    const consent = await provider.createConsent({
      userId,
      institutionName
    });

    // 2. Persist Connected Account with Consent Metadata & Provider Identity
    await db.query(`
      INSERT INTO connected_accounts (user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, provider_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      userId,
      consent.institutionName,
      consent.accountNumberMasked,
      consent.accountType,
      consent.consentGranted,
      consent.consentId,
      consent.consentExpiry,
      consent.provider || 'mock'
    ]);

    const newAccount = await db.queryOne<ConnectedAccount>(`
      SELECT id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, provider_id, created_at
      FROM connected_accounts
      WHERE consent_id = $1
    `, [consent.consentId]);

    if (!newAccount) {
      throw new Error('Failed to create connected account record.');
    }

    // 3. Initiate Financial Data Session & Fetch Data (Asynchronous AA Contract)
    const accountMeta = {
      accountId: newAccount.id,
      userId,
      institutionName: newAccount.institution_name,
      accountNumberMasked: newAccount.account_number_masked
    };

    const dataSession = await provider.requestFinancialData({
      consentId: consent.consentId,
      accountMeta
    });

    const rawData = await provider.fetchFinancialData({
      consentId: consent.consentId,
      sessionId: dataSession.sessionId,
      accountMeta
    });

    // 4. Normalize and Ingest Authorized Financial Data with Duplicate Protection
    const normalizedTxs = provider.normalizeFinancialData(rawData);
    await AAIngestionService.ingestTransactions(accountMeta, normalizedTxs);

    return newAccount;
  }

  /**
   * Connects a mock sandbox account (maintains 100% backward compatibility).
   */
  public static async connectMockAccount(userId: number, institutionName: string): Promise<ConnectedAccount> {
    return this.connectAccount(userId, institutionName, 'mock');
  }

  /**
   * Revokes user consent for an authorized connected account.
   * Stops future data synchronization while preserving historical financial transactions.
   */
  public static async revokeConsent(userId: number, accountId: number): Promise<ConnectedAccount> {
    const account = await this.getAccountById(userId, accountId);
    if (!account) {
      throw new Error('Connected account not found.');
    }

    // Notify the active AA provider of consent revocation
    try {
      const provider = AAProviderRegistry.getProvider((account.provider_id as AAProviderType) || 'mock');
      await provider.revokeConsent(account.consent_id);
    } catch {
      // Local revocation proceeds even if upstream notification has temporary network fault
    }

    await db.query(`
      UPDATE connected_accounts
      SET consent_granted = 0
      WHERE id = $1 AND user_id = $2
    `, [accountId, userId]);

    const updated = await this.getAccountById(userId, accountId);
    return updated!;
  }

  /**
   * Synchronizes latest financial data for an active connected account with duplicate protection.
   */
  public static async syncAccountData(userId: number, accountId: number): Promise<IngestionResult> {
    const account = await this.getAccountById(userId, accountId);
    if (!account) {
      throw new Error('Connected account not found.');
    }

    if (account.consent_granted !== 1) {
      throw new Error('Cannot synchronize: Consent for this account has been revoked.');
    }

    // Check expiry
    const expiryDate = new Date(account.consent_expiry);
    if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
      throw new Error('Cannot synchronize: Consent for this account has expired.');
    }

    const provider = AAProviderRegistry.getProvider((account.provider_id as AAProviderType) || 'mock');
    const accountMeta = {
      accountId: account.id,
      userId,
      institutionName: account.institution_name,
      accountNumberMasked: account.account_number_masked
    };

    const dataSession = await provider.requestFinancialData({
      consentId: account.consent_id,
      accountMeta
    });

    const rawData = await provider.fetchFinancialData({
      consentId: account.consent_id,
      sessionId: dataSession.sessionId,
      accountMeta
    });

    const normalizedTxs = provider.normalizeFinancialData(rawData);
    return AAIngestionService.ingestTransactions(accountMeta, normalizedTxs);
  }

  /**
   * Permanently deletes all stored financial records (transactions, accounts, budgets, insights) for a user.
   * Preserves user identity and authentication credentials.
   */
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
}
