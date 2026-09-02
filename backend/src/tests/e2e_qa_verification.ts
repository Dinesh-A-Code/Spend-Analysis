import { db } from '../db/database.js';
import { runSeed } from '../db/seed.js';
import { AuthService } from '../services/auth.service.js';
import { AccountService } from '../services/account.service.js';
import { TransactionService } from '../services/transaction.service.js';
import { CategorizationService } from '../services/categorization.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { BudgetService } from '../services/budget.service.js';
import { InsightsEngineService } from '../services/insights_engine.service.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string): void {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

export async function runFullE2EQASuite(): Promise<boolean> {
  console.log('\n======================================================');
  console.log('   FULL END-TO-END FUNCTIONAL QA VERIFICATION SUITE   ');
  console.log('======================================================\n');

  // Reset database to canonical seed state
  await runSeed();

  // -------------------------------------------------------------
  // 1. AUTHENTICATION FLOW QA
  // -------------------------------------------------------------
  console.log('\n--- 1. Authentication Flow QA ---');
  try {
    // 1.1 Signup with new test user
    const userAlice = await AuthService.signup({
      name: 'Alice QA',
      email: 'alice.qa@spendanalysis.in',
      password: 'strongPassword123',
      monthly_income: 75000,
      savings_target: 25000,
    });
    assert(userAlice.user.id > 0 && userAlice.token.length > 20, '1.1 Signup creates user and returns JWT token');
    assert(userAlice.user.email === 'alice.qa@spendanalysis.in', '1.2 User email matches signup parameter');

    // 1.3 Profile updates
    const updatedProfile = await AuthService.updateUserProfile(userAlice.user.id, {
      monthly_income: 80000,
      savings_target: 30000,
    });
    assert(updatedProfile.monthly_income === 80000 && updatedProfile.savings_target === 30000, '1.3 Profile setup & income/target updates persist');

    // 1.4 Valid login
    const loginRes = await AuthService.login({
      email: 'alice.qa@spendanalysis.in',
      password: 'strongPassword123',
    });
    assert(loginRes.token.length > 20, '1.4 Login succeeds with valid credentials');

    // 1.5 Invalid credentials rejection
    try {
      await AuthService.login({
        email: 'alice.qa@spendanalysis.in',
        password: 'wrongPassword999',
      });
      assert(false, '1.5 Invalid password must be rejected');
    } catch {
      assert(true, '1.5 Invalid password correctly rejected');
    }

    // 1.6 Duplicate email rejection
    try {
      await AuthService.signup({
        name: 'Alice Duplicate',
        email: 'alice.qa@spendanalysis.in',
        password: 'anotherPassword123',
      });
      assert(false, '1.6 Duplicate email must be rejected');
    } catch {
      assert(true, '1.6 Duplicate email registration correctly rejected');
    }

    // 1.7 Password hash security (verify plaintext password never in db)
    const dbUser = await db.queryOne<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1', [userAlice.user.id]);
    assert(dbUser !== undefined && dbUser.password_hash.startsWith('$2'), '1.7 Password is securely bcrypt-hashed; zero plaintext passwords stored');
  } catch (err) {
    assert(false, '1. Authentication QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 2. ACCOUNT CONNECTION / CONSENT FLOW QA
  // -------------------------------------------------------------
  console.log('\n--- 2. Account Connection & Consent Flow QA ---');
  try {
    // 2.1 Connect Mock Account with Consent
    const userBob = await AuthService.signup({
      name: 'Bob QA',
      email: 'bob.qa@spendanalysis.in',
      password: 'strongPassword123',
    });

    const bobInitialAccounts = await AccountService.getAccounts(userBob.user.id);
    assert(bobInitialAccounts.length === 0, '2.1 New user starts with zero connected accounts');

    // Connect HDFC
    const bobHdfc = await AccountService.connectMockAccount(userBob.user.id, 'HDFC Bank');
    assert(bobHdfc.consent_granted === 1, '2.2 Connected account has consent_granted = 1');
    assert(bobHdfc.consent_id.startsWith('CNS-MOCK-'), '2.3 Consent ID is explicitly formatted and stored');
    assert(bobHdfc.account_number_masked.includes('XXXX'), '2.4 Account number is appropriately masked');

    // Ingested transactions count
    const bobTxRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [userBob.user.id]);
    const bobTxCount = Number(bobTxRow?.c ?? 0);
    assert(bobTxCount === 18, `2.5 Sandbox transactions ingested upon authorized connection (Got: ${bobTxCount})`);

    // 2.6 Repeat connection idempotency check (connecting second bank does NOT duplicate existing transactions)
    await AccountService.connectMockAccount(userBob.user.id, 'ICICI Bank');
    const bobTxAfterSecondRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [userBob.user.id]);
    const bobTxCountAfterSecond = Number(bobTxAfterSecondRow?.c ?? 0);
    assert(bobTxCountAfterSecond === 18, '2.6 Repeated connection attempts do not duplicate transactions (idempotent)');
  } catch (err) {
    assert(false, '2. Account Connection QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 3. DASHBOARD FUNCTIONAL QA (Seeded User Amit)
  // -------------------------------------------------------------
  console.log('\n--- 3. Dashboard Functional QA ---');
  try {
    const userId = 1; // Amit Sharma (seeded)
    const anchorDate = '2026-08-31';

    // Daily summary
    const dailyUPI = await AnalyticsService.getUPIAnalysis(userId, 'daily', anchorDate);
    assert(dailyUPI.total_spending === 1240, `3.1 Daily total spending equals ₹1,240 (Got: ${dailyUPI.total_spending})`);
    assert(dailyUPI.upi_source_breakdown['Google Pay'] === 520, `3.2 Google Pay source total equals ₹520 (Got: ${dailyUPI.upi_source_breakdown['Google Pay']})`);
    assert(dailyUPI.upi_source_breakdown['PhonePe'] === 430, `3.3 PhonePe source total equals ₹430 (Got: ${dailyUPI.upi_source_breakdown['PhonePe']})`);
    assert(dailyUPI.upi_source_breakdown['Paytm'] === 290, `3.4 Paytm source total equals ₹290 (Got: ${dailyUPI.upi_source_breakdown['Paytm']})`);
    assert((dailyUPI.upi_source_breakdown['Unknown/Other'] || 0) === 0, '3.5 Unknown/Other total is ₹0 when no unknown sources');

    // Categories
    assert(dailyUPI.category_breakdown['Food'] === 630, `3.6 Daily Food category equals ₹630 (Got: ${dailyUPI.category_breakdown['Food']})`);
    assert(dailyUPI.category_breakdown['Transport'] === 510, `3.7 Daily Transport category equals ₹510 (Got: ${dailyUPI.category_breakdown['Transport']})`);
    assert(dailyUPI.category_breakdown['Shopping'] === 100, `3.8 Daily Shopping category equals ₹100 (Got: ${dailyUPI.category_breakdown['Shopping']})`);

    // Category sum reconciliation
    const catSum = (dailyUPI.category_breakdown['Food'] || 0) + (dailyUPI.category_breakdown['Transport'] || 0) + (dailyUPI.category_breakdown['Shopping'] || 0);
    assert(catSum === 1240, `3.9 Daily category sum reconciles to ₹1,240 (Got: ${catSum})`);
  } catch (err) {
    assert(false, '3. Dashboard QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 4. PAYMENT SOURCE DRILL-DOWN QA
  // -------------------------------------------------------------
  console.log('\n--- 4. Payment Source Drill-Down QA ---');
  try {
    const userId = 1;
    const gpayResult = await TransactionService.getTransactions(userId, {
      period: 'daily',
      date: '2026-08-31',
      payment_source: 'Google Pay',
    });
    const gpayTransactions = gpayResult.transactions;

    assert(gpayTransactions.length === 4, `4.1 Google Pay returns exactly 4 transactions (Got: ${gpayTransactions.length})`);
    const gpaySum = gpayTransactions.reduce((acc, t) => acc + t.amount, 0);
    assert(gpaySum === 520, `4.2 Google Pay sum equals ₹520 (Got: ${gpaySum})`);

    // Verify individual transactions
    const swiggy = gpayTransactions.find((t) => t.merchant === 'Swiggy');
    const bus = gpayTransactions.find((t) => t.merchant === 'City Bus');
    const tea = gpayTransactions.find((t) => t.merchant === 'Local Tea Shop');
    const amazon = gpayTransactions.find((t) => t.merchant === 'Amazon');

    assert(swiggy?.amount === 320 && swiggy?.category === 'Food', '4.3 Swiggy: ₹320 Food in GPay');
    assert(bus?.amount === 80 && bus?.category === 'Transport', '4.4 City Bus: ₹80 Transport in GPay');
    assert(tea?.amount === 20 && tea?.category === 'Food', '4.5 Local Tea Shop: ₹20 Food in GPay');
    assert(amazon?.amount === 100 && amazon?.category === 'Shopping', '4.6 Amazon: ₹100 Shopping in GPay');

    // Verify 0 bleed
    const phonePeInGpay = gpayTransactions.some((t) => t.payment_source !== 'Google Pay');
    assert(!phonePeInGpay, '4.7 No PhonePe/Paytm bleed inside Google Pay drill-down');
  } catch (err) {
    assert(false, '4. Payment Source Drill-Down QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 5. ANALYTICS QA
  // -------------------------------------------------------------
  console.log('\n--- 5. Analytics QA ---');
  try {
    const userId = 1;
    const monthlySummary = await AnalyticsService.getSummary(userId, 'monthly', '2026-08-31');
    assert(monthlySummary.total_expenses === 12700, `5.1 Monthly total expenses equal ₹12,700 (Got: ${monthlySummary.total_expenses})`);
    assert(monthlySummary.total_income === 45000, `5.2 Monthly income equals ₹45,000 (Got: ${monthlySummary.total_income})`);
    assert(monthlySummary.savings === 32300, `5.3 Monthly savings equal ₹32,300 (Got: ${monthlySummary.savings})`);
    assert(!isNaN(monthlySummary.savings_rate) && isFinite(monthlySummary.savings_rate), '5.4 Savings rate is a valid finite number');

    // Historical trends
    const trends = await AnalyticsService.getMonthlyTrends(userId);
    assert(trends.length >= 5, `5.5 Historical trends return 5 months (Got: ${trends.length})`);
    const jan = trends.find((t) => t.month_name?.includes('Jan') || t.month === 1);
    const feb = trends.find((t) => t.month_name?.includes('Feb') || t.month === 2);
    const mar = trends.find((t) => t.month_name?.includes('Mar') || t.month === 3);
    const apr = trends.find((t) => t.month_name?.includes('Apr') || t.month === 4);

    assert(jan?.total_expenses === 15000, `5.6 Jan 2026 trend equals ₹15,000 (Got: ${jan?.total_expenses})`);
    assert(feb?.total_expenses === 17500, `5.7 Feb 2026 trend equals ₹17,500 (Got: ${feb?.total_expenses})`);
    assert(mar?.total_expenses === 14200, `5.8 Mar 2026 trend equals ₹14,200 (Got: ${mar?.total_expenses})`);
    assert(apr?.total_expenses === 19100, `5.9 Apr 2026 trend equals ₹19,100 (Got: ${apr?.total_expenses})`);
  } catch (err) {
    assert(false, '5. Analytics QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 6. TRANSACTIONS LEDGER QA
  // -------------------------------------------------------------
  console.log('\n--- 6. Transactions Ledger QA ---');
  try {
    const userId = 1;
    // Search
    const searchRes = await TransactionService.getTransactions(userId, { search: 'Swiggy' });
    assert(searchRes.transactions.length === 1 && searchRes.transactions[0].merchant === 'Swiggy', '6.1 Search filters transactions by keyword');

    // Payment source filter (Daily PhonePe)
    const phonePeRes = await TransactionService.getTransactions(userId, { payment_source: 'PhonePe', period: 'daily', date: '2026-08-31' });
    assert(phonePeRes.transactions.length === 1 && phonePeRes.transactions[0].merchant === 'Ola Cabs', '6.2 Daily PhonePe filter returns Ola Cabs');

    // Category filter
    const transportRes = await TransactionService.getTransactions(userId, { category: 'Transport', period: 'monthly', date: '2026-08-31' });
    assert(transportRes.transactions.length === 3, `6.3 Transport filter returns 3 monthly transactions (Got: ${transportRes.transactions.length})`);
    const transportSum = transportRes.transactions.reduce((acc, t) => acc + t.amount, 0);
    assert(transportSum === 1800, `6.4 Transport monthly sum equals ₹1,800 (Got: ${transportSum})`);

    // Unknown/Other preservation
    const catOther = CategorizationService.categorize('NonExistentVendor99');
    assert(catOther === 'Other', '6.5 Unknown merchant defaults deterministically to Other (never guessed)');
  } catch (err) {
    assert(false, '6. Transactions QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 7. TRANSACTION DETAIL QA
  // -------------------------------------------------------------
  console.log('\n--- 7. Transaction Detail QA ---');
  try {
    const userId = 1;
    const searchResult = await TransactionService.getTransactions(userId, { search: 'Tea' });
    const teaTx = searchResult.transactions[0];
    assert(teaTx !== undefined, '7.1 Local Tea Shop transaction found');

    const detail = await TransactionService.getTransactionById(userId, teaTx.id);
    assert(detail !== undefined, '7.2 getTransactionById returns enriched transaction');
    assert(detail?.amount === 20, '7.3 Detail amount equals ₹20');
    assert(detail?.category === 'Food', '7.4 Detail category equals Food');
    assert(detail?.payment_source === 'Google Pay', '7.5 Detail payment source equals Google Pay');
    assert(Boolean(detail?.account_number_masked?.includes('XXXX')), '7.6 Account number in detail is masked');
  } catch (err) {
    assert(false, '7. Transaction Detail QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 8. BUDGET ENVELOPES QA
  // -------------------------------------------------------------
  console.log('\n--- 8. Budget Envelopes QA ---');
  try {
    const userId = 1;
    const budgets = await BudgetService.getBudgets(userId, '2026-08-31');

    assert(budgets.total_budget === 12000, `8.1 Total budget plan equals ₹12,000 (Got: ${budgets.total_budget})`);
    assert(budgets.total_spent === 12700, `8.2 Total actual spend equals ₹12,700 (Got: ${budgets.total_spent})`);
    assert(budgets.categories.length === 5, `8.3 Five spending categories configured (Got: ${budgets.categories.length})`);

    const food = budgets.categories.find((b) => b.category === 'Food');
    assert(food?.limit_amount === 4000 && food?.actual_spent === 4500, '8.4 Food: ₹4,000 limit vs ₹4,500 spend');
    assert(food?.variance === -500 && food?.status === 'over_budget', '8.5 Food status is over_budget by -₹500');

    const transport = budgets.categories.find((b) => b.category === 'Transport');
    assert(transport?.limit_amount === 2000 && transport?.actual_spent === 1800, '8.6 Transport: ₹2,000 limit vs ₹1,800 spend');
    assert(transport?.variance === 200 && transport?.status === 'under_budget', '8.7 Transport status is under_budget with ₹200 left');

    // Update budget limit
    const updated = await BudgetService.setBudget(userId, 'Food', 5000);
    assert(updated.limit_amount === 5000 && updated.status === 'under_budget', '8.8 Updating Food budget to ₹5,000 changes status to under_budget');

    // Reset back to 4000 for seed consistency
    await BudgetService.setBudget(userId, 'Food', 4000);
  } catch (err) {
    assert(false, '8. Budget QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 9. AI INSIGHTS HEURISTIC ENGINE QA
  // -------------------------------------------------------------
  console.log('\n--- 9. AI Insights Heuristic Engine QA ---');
  try {
    const userId = 1;
    const insights = await InsightsEngineService.recalculateInsights(userId, '2026-08-31');
    assert(insights.length >= 4, `9.1 Grounded insights generated (Got: ${insights.length})`);

    // Verify Rule E (Budget Violation Alert)
    const alertInsight = insights.find((i) => i.insight_type === 'Alert' && i.insight_text.includes('exceeded'));
    assert(alertInsight !== undefined, '9.2 Rule E: Budget violation alert generated');

    // Verify Rule D (Food delivery savings)
    const recInsight = insights.find((i) => i.insight_type === 'Recommendation' && i.insight_text.includes('food-delivery'));
    assert(recInsight !== undefined, '9.3 Rule D: Food-delivery savings recommendation generated');

    // Verify Rule F (UPI distribution observation)
    const patternInsight = insights.find((i) => i.insight_text.includes('Google Pay'));
    assert(patternInsight !== undefined, '9.4 Rule F: Grounded Google Pay insight generated');

    // Verify dismiss API
    if (insights.length > 0) {
      const dismissId = insights[0].id;
      const dismissed = await InsightsEngineService.dismissInsight(userId, dismissId);
      assert(dismissed, '9.5 Dismiss insight marks record as dismissed');
      const activeFeed = await InsightsEngineService.getInsights(userId);
      assert(!activeFeed.some((i) => i.id === dismissId), '9.6 Dismissed insight suppressed from active feed');
    }
  } catch (err) {
    assert(false, '9. AI Insights QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 10 & 11. SETTINGS & CONSENT REVOCATION QA
  // -------------------------------------------------------------
  console.log('\n--- 10 & 11. Settings & Consent Revocation QA ---');
  try {
    const userCharlie = await AuthService.signup({
      name: 'Charlie QA',
      email: 'charlie.qa@spendanalysis.in',
      password: 'password123',
    });

    const charlieAcc = await AccountService.connectMockAccount(userCharlie.user.id, 'ICICI Bank');
    assert(charlieAcc.consent_granted === 1, '10.1 Connected account has active consent');

    // Revoke consent
    const revoked = await AccountService.revokeConsent(userCharlie.user.id, charlieAcc.id);
    assert(revoked.consent_granted === 0, '11.1 Revoking consent sets consent_granted = 0');

    // Verify transactions remain intact after consent revocation
    const charlieTxRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [userCharlie.user.id]);
    const charlieTxCount = Number(charlieTxRow?.c ?? 0);
    assert(charlieTxCount === 18, `11.2 Historical transactions remain intact after consent revocation (Got: ${charlieTxCount})`);
  } catch (err) {
    assert(false, '10 & 11. Settings & Consent Revocation QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 12. DELETE FINANCIAL DATA QA
  // -------------------------------------------------------------
  console.log('\n--- 12. Delete Financial Data QA ---');
  try {
    const userDavid = await AuthService.signup({
      name: 'David QA',
      email: 'david.qa@spendanalysis.in',
      password: 'password123',
    });

    await AccountService.connectMockAccount(userDavid.user.id, 'State Bank of India');
    const davidTxBeforeRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [userDavid.user.id]);
    const davidTxBefore = Number(davidTxBeforeRow?.c ?? 0);
    assert(davidTxBefore === 18, '12.1 David has 18 financial records before deletion');

    // Execute deleteFinancialData
    const deleteRes = await AccountService.deleteFinancialData(userDavid.user.id);
    assert(deleteRes.success && deleteRes.deletedCount.transactions === 18, '12.2 deleteFinancialData removes all financial transactions');

    const davidTxAfterRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [userDavid.user.id]);
    const davidTxAfter = Number(davidTxAfterRow?.c ?? 0);
    assert(davidTxAfter === 0, '12.3 Stored transactions count is 0 after deletion');

    const davidAccountsAfter = await AccountService.getAccounts(userDavid.user.id);
    assert(davidAccountsAfter.length === 0, '12.4 Connected accounts count is 0 after deletion');

    // Verify David login credentials remain intact
    const davidUser = await db.queryOne<{ email: string }>('SELECT email FROM users WHERE id = $1', [userDavid.user.id]);
    assert(davidUser?.email === 'david.qa@spendanalysis.in', '12.5 User authentication account in users table remains active');

    // Verify User 1 (Amit) data was completely untouched
    const user1TxRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [1]);
    const user1Tx = Number(user1TxRow?.c ?? 0);
    assert(user1Tx === 18, '12.6 Deleting David data has zero effect on Amit data (Data Isolation)');
  } catch (err) {
    assert(false, '12. Delete Financial Data QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 13. SECURITY & DATA ISOLATION QA
  // -------------------------------------------------------------
  console.log('\n--- 13. Security & Data Isolation QA ---');
  try {
    // Verify unauthorized access prevention
    const user1TxFromUser2 = await TransactionService.getTransactions(99999, {});
    assert(user1TxFromUser2.transactions.length === 0, '13.1 Non-existent user query returns empty array');

    // Verify user cannot fetch other user transaction by ID
    const user1TxList = await TransactionService.getTransactions(1, {});
    const user1TxId = user1TxList.transactions[0].id;
    const crossUserTx = await TransactionService.getTransactionById(99999, user1TxId);
    assert(crossUserTx === undefined, '13.2 User 2 cannot access User 1 transaction by ID (Scoped query)');
  } catch (err) {
    assert(false, '13. Security & Data Isolation QA failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 17. DATABASE RECONCILIATION SUMMARY
  // -------------------------------------------------------------
  console.log('\n--- 17. Database Reconciliation Verification ---');
  try {
    const dailyTx = await db.queryOne<{ total: number; gpay: number; phonepe: number; paytm: number }>(`
      SELECT SUM(amount) as total,
             SUM(CASE WHEN payment_source = 'Google Pay' THEN amount ELSE 0 END) as gpay,
             SUM(CASE WHEN payment_source = 'PhonePe' THEN amount ELSE 0 END) as phonepe,
             SUM(CASE WHEN payment_source = 'Paytm' THEN amount ELSE 0 END) as paytm
      FROM transactions
      WHERE user_id = $1 AND transaction_date = $2 AND type = 'Debit'
    `, [1, '2026-08-31']);

    const gpay = Number(dailyTx?.gpay ?? 0);
    const phonepe = Number(dailyTx?.phonepe ?? 0);
    const paytm = Number(dailyTx?.paytm ?? 0);
    const total = Number(dailyTx?.total ?? 0);

    assert(gpay === 520, '17.1 Database: GPay (320 + 80 + 20 + 100) = ₹520');
    assert(phonepe === 430, '17.2 Database: PhonePe (430) = ₹430');
    assert(paytm === 290, '17.3 Database: Paytm (290) = ₹290');
    assert(total === 1240, '17.4 Database: Total (520 + 430 + 290) = ₹1,240');
    assert(gpay + phonepe + paytm === total, '17.5 Single source of truth mathematical integrity holds');
  } catch (err) {
    assert(false, '17. Database Reconciliation QA failed', (err as Error).message);
  }

  // Reseed at end to restore pristine demo state
  await runSeed();

  console.log('\n======================================================');
  console.log(`   QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  return failed === 0;
}

runFullE2EQASuite().catch((err) => {
  console.error('Fatal QA Runner Error:', err);
  process.exit(1);
});
