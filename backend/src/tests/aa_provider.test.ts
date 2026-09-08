import { AAProviderRegistry } from '../services/aa/registry.js';
import { MockAAProvider } from '../services/aa/mock.provider.js';
import { AAIngestionService } from '../services/aa/ingestion.service.js';
import { AccountService } from '../services/account.service.js';
import { AuthService } from '../services/auth.service.js';
import { db } from '../db/database.js';
import { runSeed } from '../db/seed.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runAATests() {
  console.log('\n========================================');
  console.log('   ACCOUNT AGGREGATOR FOUNDATION TESTS  ');
  console.log('========================================\n');

  // Reset database to deterministic state
  await runSeed();

  // Setup a test user for AA tests
  const testEmail = `aa.test.${Date.now()}@finance.in`;
  const { user: testUser } = await AuthService.signup({
    name: 'AA Test User',
    email: testEmail,
    password: 'password123'
  });

  console.log('\n--- 1. Provider Abstraction & Registry ---');
  {
    const activeProvider = AAProviderRegistry.getActiveProvider();
    assert(activeProvider !== null && activeProvider !== undefined, 'Active AA provider is resolvable');
    assert(activeProvider.getProviderId() === 'mock', 'Default active provider is mock');

    const mockProvider = AAProviderRegistry.getProvider('mock');
    assert(mockProvider instanceof MockAAProvider, 'ProviderRegistry retrieves MockAAProvider');

    const providersList = AAProviderRegistry.listSupportedProviders();
    assert(providersList.length >= 4, `Provider registry lists supported providers (Found: ${providersList.length})`);
    assert(providersList.some(p => p.id === 'mock' && p.isAvailable && p.isSandbox), 'Mock provider is listed as sandbox and available');
    assert(providersList.some(p => p.id === 'setu' && !p.isAvailable), 'Setu placeholder correctly marked unavailable until credentials provided');
    assert(providersList.some(p => p.id === 'finvu' && !p.isAvailable), 'Finvu placeholder correctly marked unavailable until credentials provided');
    assert(providersList.some(p => p.id === 'onemoney' && !p.isAvailable), 'OneMoney placeholder correctly marked unavailable until credentials provided');
    assert(providersList.some(p => p.id === 'rebit_direct' && !p.isAvailable), 'ReBIT Direct placeholder correctly marked unavailable until credentials provided');
  }

  console.log('\n--- 2. Consent Creation Lifecycle & Provider Identity ---');
  {
    const provider = AAProviderRegistry.getActiveProvider();
    const consent = await provider.createConsent({
      userId: testUser.id,
      institutionName: 'HDFC Bank',
      durationDays: 180
    });

    assert(Boolean(consent.consentId && consent.consentId.startsWith('CNS-MOCK-')), 'Consent ID is formatted properly');
    assert(consent.provider === 'mock', 'Consent record attributes correct provider');
    assert(consent.consentGranted === 1, 'Consent granted status initialized to 1');
    assert(consent.status === 'ACTIVE', 'Consent lifecycle status is ACTIVE');
    assert(Boolean(consent.consentExpiry), 'Consent expiry date is calculated');
    assert(consent.institutionName.includes('HDFC Bank'), 'Institution name captured accurately');
    assert(consent.accountNumberMasked.includes('XXXX'), 'Account number is masked in consent output');

    // Connect account via AccountService and verify provider_id is persisted
    const connectedAccount = await AccountService.connectAccount(testUser.id, 'HDFC Bank', 'mock');
    assert(connectedAccount.provider_id === 'mock', `Connected account persists provider_id: ${connectedAccount.provider_id}`);

    const dbAccount = await db.queryOne<{ provider_id: string }>('SELECT provider_id FROM connected_accounts WHERE id = $1', [connectedAccount.id]);
    assert(dbAccount?.provider_id === 'mock', 'Database record explicitly stores provider_id column value');
  }

  console.log('\n--- 3. Asynchronous Data Session Lifecycle ---');
  {
    const provider = AAProviderRegistry.getActiveProvider();
    const accountMeta = {
      accountId: 101,
      userId: testUser.id,
      institutionName: 'HDFC Bank',
      accountNumberMasked: 'XXXX-XXXX-9876'
    };

    // 1. Request Session
    const dataSession = await provider.requestFinancialData({
      consentId: 'CNS-TEST-ASYNC',
      accountMeta
    });
    assert(Boolean(dataSession.sessionId && dataSession.sessionId.startsWith('SESSION-MOCK-')), 'requestFinancialData issues data session identifier');
    assert(dataSession.status === 'READY', 'Mock provider data session status is READY');

    // 2. Check Data Ready
    const readyStatus = await provider.checkDataReady('CNS-TEST-ASYNC', dataSession.sessionId);
    assert(readyStatus.isReady && readyStatus.status === 'READY', 'checkDataReady verifies data readiness');

    // 3. Fetch Data
    const rawData = await provider.fetchFinancialData({
      consentId: 'CNS-TEST-ASYNC',
      sessionId: dataSession.sessionId,
      accountMeta
    });
    assert(rawData.transactions.length === 18, `fetchFinancialData returns raw data records (Got: ${rawData.transactions.length})`);
  }

  console.log('\n--- 4. Consent Status & Revocation ---');
  {
    const provider = AAProviderRegistry.getActiveProvider();
    const consent = await provider.createConsent({
      userId: testUser.id,
      institutionName: 'ICICI Bank'
    });

    const statusResult = await provider.getConsentStatus(consent.consentId);
    assert(statusResult.status === 'ACTIVE', 'getConsentStatus reports ACTIVE for valid consent');
    assert(statusResult.consentGranted === 1, 'getConsentStatus reports granted = 1');

    const revokeResult = await provider.revokeConsent(consent.consentId);
    assert(revokeResult.status === 'REVOKED', 'revokeConsent marks status as REVOKED');
    assert(revokeResult.consentGranted === 0, 'revokeConsent sets consentGranted to 0');
    assert(Boolean(revokeResult.revokedAt), 'revokeConsent records revocation timestamp');
  }

  console.log('\n--- 5. Financial Data Normalization with External Transaction IDs ---');
  {
    const provider = AAProviderRegistry.getActiveProvider();
    const rawData = await provider.fetchFinancialData({
      consentId: 'CNS-TEST-1',
      accountMeta: {
        accountId: 999,
        userId: testUser.id,
        institutionName: 'HDFC Bank',
        accountNumberMasked: 'XXXX-XXXX-9876'
      }
    });

    const normalized = provider.normalizeFinancialData(rawData);
    assert(normalized.length === 18, 'normalizeFinancialData transforms all raw records');
    assert(normalized.every(t => Boolean(t.external_transaction_id)), 'All mock normalized transactions contain external_transaction_id');

    const swiggy = normalized.find(t => t.description.includes('Swiggy'));
    assert(Boolean(swiggy && swiggy.external_transaction_id === 'MOCK-TXN-002' && swiggy.merchant === 'Swiggy' && swiggy.amount === 320 && swiggy.payment_source === 'Google Pay' && swiggy.category === 'Food'),
      'Swiggy normalizes to Food, Google Pay, ₹320, MOCK-TXN-002');
  }

  console.log('\n--- 6. Transaction Idempotency Tests (A, B, C, D) ---');
  {
    const accountMeta = {
      accountId: 501,
      userId: testUser.id,
      institutionName: 'Test Bank',
      accountNumberMasked: 'XXXX-5001'
    };

    // Insert connected account row for foreign key
    await db.query(`
      INSERT INTO connected_accounts (id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, provider_id)
      VALUES (501, $1, 'Test Bank', 'XXXX-5001', 'Savings', 1, 'CNS-TEST-501', '2027-01-01', 'mock')
    `, [testUser.id]);

    // Test A: Same external transaction ID is rejected as duplicate
    const testATxs = [
      { external_transaction_id: 'TXN-UNIQUE-001', transaction_date: '2026-08-31', description: 'Tea 1', amount: 20, type: 'Debit' as const, merchant: 'Tea Shop', payment_source: 'Google Pay' as const, category: 'Food' as const }
    ];
    const resA1 = await AAIngestionService.ingestTransactions(accountMeta, testATxs);
    assert(resA1.insertedCount === 1, 'Test A1: Initial transaction with external ID inserted');

    const resA2 = await AAIngestionService.ingestTransactions(accountMeta, testATxs);
    assert(resA2.insertedCount === 0 && resA2.skippedDuplicates === 1, 'Test A2: Re-ingesting same external transaction ID is rejected as duplicate');

    // Test B: Different external transaction IDs with identical financial values are BOTH retained
    const testBTx1 = { external_transaction_id: 'TXN-LEGIT-A', transaction_date: '2026-08-31', description: 'Tea Shop', amount: 20, type: 'Debit' as const, merchant: 'Tea Shop', payment_source: 'Google Pay' as const, category: 'Food' as const };
    const testBTx2 = { external_transaction_id: 'TXN-LEGIT-B', transaction_date: '2026-08-31', description: 'Tea Shop', amount: 20, type: 'Debit' as const, merchant: 'Tea Shop', payment_source: 'Google Pay' as const, category: 'Food' as const };

    const resB = await AAIngestionService.ingestTransactions(accountMeta, [testBTx1, testBTx2]);
    assert(resB.insertedCount === 2, 'Test B: Two legitimate identical transactions with different external IDs are both retained');

    // Test C: Fallback duplicate handling works when no external ID exists
    const testCTx = { transaction_date: '2026-08-31', description: 'Cash Coffee', amount: 150, type: 'Debit' as const, merchant: 'Coffee Corner', payment_source: 'Unknown/Other' as const, category: 'Food' as const };
    const resC1 = await AAIngestionService.ingestTransactions(accountMeta, [testCTx]);
    assert(resC1.insertedCount === 1, 'Test C1: Fallback transaction without external ID inserted');

    const resC2 = await AAIngestionService.ingestTransactions(accountMeta, [testCTx]);
    assert(resC2.insertedCount === 0 && resC2.skippedDuplicates === 1, 'Test C2: Duplicate fallback transaction without external ID correctly skipped');

    // Test D: Repeated synchronization is idempotent
    const allTxs = [testATxs[0], testBTx1, testBTx2, testCTx];
    const resD = await AAIngestionService.ingestTransactions(accountMeta, allTxs);
    assert(resD.insertedCount === 0 && resD.skippedDuplicates === 4, 'Test D: Full repeated synchronization inserts 0 and skips all duplicates');
  }

  console.log('\n--- 7. Ingestion Failure & Invalid Data Safeguards ---');
  {
    const invalidResult = await AAIngestionService.ingestTransactions({
      accountId: 9999,
      userId: testUser.id,
      institutionName: 'Test Bank',
      accountNumberMasked: 'XXXX-9999'
    }, [
      { transaction_date: 'invalid-date', description: 'Bad date', amount: 100, type: 'Debit', merchant: 'Test', payment_source: 'Unknown/Other', category: 'Other' },
      { transaction_date: '2026-08-31', description: 'Zero amount', amount: 0, type: 'Debit', merchant: 'Test', payment_source: 'Unknown/Other', category: 'Other' },
      { transaction_date: '2026-08-31', description: 'Negative amount', amount: -50, type: 'Debit', merchant: 'Test', payment_source: 'Unknown/Other', category: 'Other' }
    ]);

    assert(invalidResult.insertedCount === 0, 'Invalid transactions (bad dates, non-positive amounts) are safely rejected');
  }

  console.log('\n--- 8. Revoked / Expired Consent Gating ---');
  {
    const account = await db.queryOne<{ id: number }>('SELECT id FROM connected_accounts WHERE user_id = $1 LIMIT 1', [testUser.id]);
    await AccountService.revokeConsent(testUser.id, account!.id);

    let threwOnRevoked = false;
    try {
      await AccountService.syncAccountData(testUser.id, account!.id);
    } catch (err) {
      threwOnRevoked = true;
      assert((err as Error).message.includes('revoked'), 'Sync fails with explicit error when consent is revoked');
    }
    assert(threwOnRevoked, 'Sync strictly blocked for revoked consent');
  }

  console.log('\n--- 9. Security & Credential Cleanliness ---');
  {
    const accounts = await db.queryAll('SELECT * FROM connected_accounts WHERE user_id = $1', [testUser.id]);
    for (const acc of accounts) {
      assert(!('password' in acc || 'pin' in acc || 'banking_password' in acc), 'No banking password or PIN columns in connected_accounts');
      assert(!('otp' in acc), 'No OTP storage in database schema');
    }
  }

  console.log('\n--- 10. User Data Isolation ---');
  {
    const user2Email = `aa.user2.${Date.now()}@finance.in`;
    const { user: user2 } = await AuthService.signup({
      name: 'AA User 2',
      email: user2Email,
      password: 'password123'
    });
    const user2Account = await AccountService.connectAccount(user2.id, 'HDFC Bank', 'mock');

    const user1Accounts = await AccountService.getAccounts(testUser.id);
    const user2Accounts = await AccountService.getAccounts(user2.id);

    assert(!user1Accounts.some(a => a.user_id === user2.id), 'User 1 cannot view User 2 connected accounts');
    assert(!user2Accounts.some(a => a.user_id === testUser.id), 'User 2 cannot view User 1 connected accounts');

    // Deleting User 2 financial data
    await AccountService.deleteFinancialData(user2.id);
    const user1TxAfter = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [testUser.id]);
    assert(Number(user1TxAfter?.c ?? 0) > 0, 'Deleting User 2 financial data preserves User 1 transactions');
  }

  // Restore seed for baseline consistency
  await runSeed();

  console.log('\n========================================');
  console.log(`AA TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('========================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAATests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
