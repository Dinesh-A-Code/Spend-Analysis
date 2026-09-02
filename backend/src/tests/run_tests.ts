import { db, initDatabase } from '../db/database.js';
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

async function runTestSuite(): Promise<void> {
  console.log('\n========================================');
  console.log('   SPEND ANALYSIS BACKEND TEST SUITE    ');
  console.log('========================================\n');

  // Reset and seed database
  await runSeed();

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & PROFILE TESTS
  // -------------------------------------------------------------
  console.log('\n--- 1. Authentication & Profile ---');
  
  // Test signup with new user
  try {
    const signupRes = await AuthService.signup({
      name: 'Rohan Mehta',
      email: 'rohan.mehta@finance.in',
      password: 'mypassword123',
      monthly_income: 60000,
      savings_target: 20000
    });
    assert(signupRes.user.id > 0 && signupRes.token.length > 20, 'AuthService.signup creates user and issues JWT');
    assert(signupRes.user.name === 'Rohan Mehta', 'AuthService.signup populates correct profile data');
  } catch (err) {
    assert(false, 'AuthService.signup should succeed', (err as Error).message);
  }

  // Test duplicate email rejection
  try {
    await AuthService.signup({
      name: 'Duplicate Rohan',
      email: 'rohan.mehta@finance.in',
      password: 'mypassword123'
    });
    assert(false, 'AuthService.signup duplicate email rejection failed');
  } catch (err) {
    assert((err as Error).message.includes('already exists'), 'AuthService.signup rejects duplicate email');
  }

  // Test short password rejection
  try {
    await AuthService.signup({
      name: 'Short Pass',
      email: 'short@finance.in',
      password: '123'
    });
    assert(false, 'AuthService.signup short password rejection failed');
  } catch (err) {
    assert((err as Error).message.includes('at least 6 characters'), 'AuthService.signup rejects password < 6 characters');
  }

  // Test valid login
  try {
    const loginRes = await AuthService.login({
      email: 'demo.user@finance.in',
      password: 'password123'
    });
    assert(loginRes.user.email === 'demo.user@finance.in' && loginRes.token.length > 20, 'AuthService.login authenticates demo user');
  } catch (err) {
    assert(false, 'AuthService.login should succeed', (err as Error).message);
  }

  // Test invalid login password
  try {
    await AuthService.login({
      email: 'demo.user@finance.in',
      password: 'wrongpassword'
    });
    assert(false, 'AuthService.login invalid password should fail');
  } catch (err) {
    assert((err as Error).message.includes('Invalid email or password'), 'AuthService.login rejects invalid password');
  }

  // Test profile retrieval and update
  try {
    const user = await AuthService.getUserProfile(1);
    assert(user.name === 'Amit Sharma', 'AuthService.getUserProfile returns correct name');

    const updated = await AuthService.updateUserProfile(1, { monthly_income: 50000 });
    assert(updated.monthly_income === 50000, 'AuthService.updateUserProfile updates income dynamically');
  } catch (err) {
    assert(false, 'Profile retrieval/update failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 2. CONNECTED ACCOUNTS & MOCK AA TESTS
  // -------------------------------------------------------------
  console.log('\n--- 2. Connected Accounts & Mock AA ---');

  // Sign up a dedicated second user for deleteFinancialData test
  let rohanUserId = 0;
  try {
    const rohanSignup = await AuthService.signup({
      name: 'Rohan Test',
      email: 'rohan.test.accounts@finance.in',
      password: 'password123'
    });
    rohanUserId = rohanSignup.user.id;
  } catch {
    // Rohan may already exist from a prior run — look up their ID
    const existing = await db.queryOne<{ id: number }>("SELECT id FROM users WHERE email = $1", ['rohan.test.accounts@finance.in']);
    rohanUserId = existing?.id ?? 0;
  }

  try {
    const accounts = await AccountService.getAccounts(1);
    assert(accounts.length >= 1, 'AccountService.getAccounts returns user accounts');
    assert(accounts[0].consent_granted === 1, 'AccountService initial account has consent_granted = 1');
    assert(accounts[0].consent_id.startsWith('CNS-MOCK'), 'AccountService consent_id is formatted properly');

    // Connect ICICI Bank for user 1
    const iciciAccount = await AccountService.connectMockAccount(1, 'ICICI Bank');
    assert(iciciAccount.institution_name.includes('ICICI Bank'), 'AccountService.connectMockAccount connects ICICI Bank');
    assert(iciciAccount.consent_granted === 1, 'AccountService.connectMockAccount sets consent_granted = 1');

    // Verify connecting a second account does not duplicate transactions (idempotent ingestion)
    const user1TxRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [1]);
    const user1TxCount = Number(user1TxRow?.c ?? 0);
    assert(user1TxCount === 18, `AccountService idempotency: user 1 retains exactly 18 transactions (Got: ${user1TxCount})`);

    // Revoke Consent
    const revoked = await AccountService.revokeConsent(1, iciciAccount.id);
    assert(revoked.consent_granted === 0, 'AccountService.revokeConsent sets consent_granted = 0');

    // Verify revoking consent does NOT delete financial data (user 1 still has 18 transactions)
    const user1TxAfterRevokeRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [1]);
    const user1TxCountAfterRevoke = Number(user1TxAfterRevokeRow?.c ?? 0);
    assert(user1TxCountAfterRevoke === 18, 'AccountService: Revoke consent does NOT delete historical financial transactions');

    // Clear Financial Data for Rohan test user (dynamic ID)
    assert(rohanUserId > 0, 'Test setup: Rohan test user exists for deleteFinancialData test');
    const rohanAccount = await AccountService.connectMockAccount(rohanUserId, 'State Bank of India (SBI)');
    assert(rohanAccount.institution_name.includes('State Bank'), 'AccountService: Rohan SBI account connected');
    const deleteRes = await AccountService.deleteFinancialData(rohanUserId);
    assert(deleteRes.success && deleteRes.deletedCount.transactions > 0, 'AccountService.deleteFinancialData purges user financial records');
    const rohanAccountsAfter = await AccountService.getAccounts(rohanUserId);
    assert(rohanAccountsAfter.length === 0, 'AccountService.deleteFinancialData leaves zero connected accounts');

    // Verify Rohan auth user still exists in database
    const rohanUserRecord = await db.queryOne<{ email: string }>('SELECT email FROM users WHERE id = $1', [rohanUserId]);
    assert(rohanUserRecord !== undefined && rohanUserRecord.email === 'rohan.test.accounts@finance.in', 'AccountService.deleteFinancialData preserves user authentication credentials in users table');

    // Verify User 1 data is completely untouched by Rohan deletion
    const user1TxAfterRohanRow = await db.queryOne<{ c: number }>('SELECT COUNT(*) as c FROM transactions WHERE user_id = $1', [1]);
    const user1TxCountAfterRohanDelete = Number(user1TxAfterRohanRow?.c ?? 0);
    assert(user1TxCountAfterRohanDelete === 18, 'Data isolation: Deleting one user data does NOT delete another user financial data');
  } catch (err) {
    assert(false, 'AccountService test failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 3. DETERMINISTIC CATEGORIZATION TESTS
  // -------------------------------------------------------------
  console.log('\n--- 3. Deterministic Categorization ---');
  
  assert(CategorizationService.categorize('Swiggy') === 'Food', 'Categorization: Swiggy -> Food');
  assert(CategorizationService.categorize('Zomato Order') === 'Food', 'Categorization: Zomato -> Food');
  assert(CategorizationService.categorize('Local Tea Shop') === 'Food', 'Categorization: Local Tea Shop -> Food');
  assert(CategorizationService.categorize('Uber Trip') === 'Transport', 'Categorization: Uber -> Transport');
  assert(CategorizationService.categorize('Ola Cabs') === 'Transport', 'Categorization: Ola Cabs -> Transport');
  assert(CategorizationService.categorize('Amazon India') === 'Shopping', 'Categorization: Amazon -> Shopping');
  assert(CategorizationService.categorize('Myntra Apparel') === 'Shopping', 'Categorization: Myntra -> Shopping');
  assert(CategorizationService.categorize('BESCOM Electricity') === 'Bills', 'Categorization: BESCOM -> Bills');
  assert(CategorizationService.categorize('Zerodha Broking') === 'Investments', 'Categorization: Zerodha -> Investments');
  assert(CategorizationService.categorize('Netflix Monthly') === 'Subscriptions', 'Categorization: Netflix -> Subscriptions');
  assert(CategorizationService.categorize('Random Merchant XYZ') === 'Other', 'Categorization: Unknown Merchant -> Other fallback');

  // -------------------------------------------------------------
  // 4. TRANSACTION QUERY & DETAIL TESTS
  // -------------------------------------------------------------
  console.log('\n--- 4. Transaction Management ---');
  
  try {
    // Re-seed to ensure demo user 1 has clean test dataset
    await runSeed();

    // Query Daily Transactions
    const dailyRes = await TransactionService.getTransactions(1, { period: 'daily', date: '2026-08-31' });
    assert(dailyRes.totalCount === 6, 'TransactionService daily filter returns 6 transactions for 2026-08-31');
    // Filter by Monthly Period (August 2026)
    const monthlyRes = await TransactionService.getTransactions(1, { period: 'monthly', date: '2026-08-31', type: 'Debit' });
    assert(monthlyRes.totalCount === 13, `TransactionService monthly filter returns 13 debit records (Got: ${monthlyRes.totalCount})`);
    assert(monthlyRes.totalAmount === 12700, `TransactionService monthly sum equals ₹12,700 (Got: ${monthlyRes.totalAmount})`);

    // Filter by Payment Source: Google Pay
    const gpayRes = await TransactionService.getTransactions(1, { payment_source: 'Google Pay', period: 'daily', date: '2026-08-31' });
    assert(gpayRes.totalCount === 4, 'TransactionService Google Pay filter returns 4 records');
    assert(gpayRes.totalAmount === 520, `TransactionService Google Pay sum equals ₹520 (Got: ${gpayRes.totalAmount})`);

    // Filter by Payment Source: PhonePe
    const phonePeRes = await TransactionService.getTransactions(1, { payment_source: 'PhonePe', period: 'daily', date: '2026-08-31' });
    assert(phonePeRes.totalCount === 1, 'TransactionService PhonePe filter returns 1 record');
    assert(phonePeRes.totalAmount === 430, `TransactionService PhonePe sum equals ₹430 (Got: ${phonePeRes.totalAmount})`);

    // Filter by Payment Source: Paytm
    const paytmRes = await TransactionService.getTransactions(1, { payment_source: 'Paytm', period: 'daily', date: '2026-08-31' });
    assert(paytmRes.totalCount === 1, 'TransactionService Paytm filter returns 1 record');
    assert(paytmRes.totalAmount === 290, `TransactionService Paytm sum equals ₹290 (Got: ${paytmRes.totalAmount})`);

    // Search filter
    const searchRes = await TransactionService.getTransactions(1, { search: 'Swiggy' });
    assert(searchRes.totalCount >= 1 && searchRes.transactions[0].merchant === 'Swiggy', 'TransactionService search filter finds Swiggy');

    // Transaction detail with joined account info
    const detail = await TransactionService.getTransactionById(1, dailyRes.transactions[0].id);
    assert(detail !== undefined && detail.institution_name !== undefined, 'TransactionService.getTransactionById enriches account metadata');
  } catch (err) {
    assert(false, 'TransactionService tests failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 5. ANALYTICS & CALCULATION INTEGRITY TESTS
  // -------------------------------------------------------------
  console.log('\n--- 5. Analytics & Calculation Integrity ---');
  
  try {
    // Test Daily UPI Analysis
    const upiDaily = await AnalyticsService.getUPIAnalysis(1, 'daily', '2026-08-31');
    assert(upiDaily.total_spending === 1240, `AnalyticsService Daily Total Spending: ₹${upiDaily.total_spending} (Expected: ₹1240)`);
    assert(upiDaily.upi_source_breakdown['Google Pay'] === 520, `AnalyticsService GPay Total: ₹${upiDaily.upi_source_breakdown['Google Pay']} (Expected: ₹520)`);
    assert(upiDaily.upi_source_breakdown['PhonePe'] === 430, `AnalyticsService PhonePe Total: ₹${upiDaily.upi_source_breakdown['PhonePe']} (Expected: ₹430)`);
    assert(upiDaily.upi_source_breakdown['Paytm'] === 290, `AnalyticsService Paytm Total: ₹${upiDaily.upi_source_breakdown['Paytm']} (Expected: ₹290)`);
    assert(upiDaily.upi_source_breakdown['Unknown/Other'] === 0, `AnalyticsService Unknown/Other Total: ₹${upiDaily.upi_source_breakdown['Unknown/Other']} (Expected: ₹0)`);

    // Mathematical Sum Reconcile
    const sum = upiDaily.upi_source_breakdown['Google Pay'] +
                upiDaily.upi_source_breakdown['PhonePe'] +
                upiDaily.upi_source_breakdown['Paytm'] +
                upiDaily.upi_source_breakdown['Unknown/Other'];
    assert(sum === 1240, `Reconciled Integrity: 520 + 430 + 290 + 0 = ${sum} === 1240`);

    // Test Monthly Summary
    const monthlySummary = await AnalyticsService.getSummary(1, 'monthly', '2026-08-31');
    assert(monthlySummary.total_income === 45000, `AnalyticsService Monthly Income: ₹${monthlySummary.total_income} (Expected: ₹45,000)`);
    assert(monthlySummary.total_expenses === 12700, `AnalyticsService Monthly Expenses: ₹${monthlySummary.total_expenses} (Expected: ₹12,700)`);
    assert(monthlySummary.savings === 32300, `AnalyticsService Monthly Savings: ₹${monthlySummary.savings} (Expected: ₹32,300)`);
    assert(monthlySummary.savings_rate > 0.70, `AnalyticsService Savings Rate: ${(monthlySummary.savings_rate * 100).toFixed(1)}%`);

    // Test Category Totals for August 2026
    assert(monthlySummary.category_breakdown['Food'] === 4500, `Category Food Total: ₹${monthlySummary.category_breakdown['Food']} (Expected: ₹4,500)`);
    assert(monthlySummary.category_breakdown['Shopping'] === 3200, `Category Shopping Total: ₹${monthlySummary.category_breakdown['Shopping']} (Expected: ₹3,200)`);
    assert(monthlySummary.category_breakdown['Transport'] === 1800, `Category Transport Total: ₹${monthlySummary.category_breakdown['Transport']} (Expected: ₹1,800)`);
    assert(monthlySummary.category_breakdown['Entertainment'] === 1200, `Category Entertainment Total: ₹${monthlySummary.category_breakdown['Entertainment']} (Expected: ₹1,200)`);
    assert(monthlySummary.category_breakdown['Bills'] === 2000, `Category Bills Total: ₹${monthlySummary.category_breakdown['Bills']} (Expected: ₹2,000)`);

    // Historical Trends
    const trends = await AnalyticsService.getMonthlyTrends(1);
    assert(trends.length >= 5, `AnalyticsService Monthly Trends returned ${trends.length} months`);
    const jan = trends.find(t => t.month === 1 && t.year === 2026);
    assert(jan?.total_expenses === 15000, `January 2026 expenses: ₹${jan?.total_expenses} (Expected: ₹15,000)`);
  } catch (err) {
    assert(false, 'AnalyticsService tests failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 6. BUDGET SERVICE TESTS
  // -------------------------------------------------------------
  console.log('\n--- 6. Budget Service ---');
  
  try {
    const budgetOverview = await BudgetService.getBudgets(1, '2026-08-31');
    assert(budgetOverview.categories.length === 5, `BudgetService returns 5 configured categories (Got: ${budgetOverview.categories.length})`);
    assert(budgetOverview.total_spent === 12700, `BudgetService total_spent reconciles to ₹12,700 (Got: ${budgetOverview.total_spent})`);

    const foodBudget = budgetOverview.categories.find(c => c.category === 'Food')!;
    assert(foodBudget.limit_amount === 4000, 'Food Budget Limit is ₹4,000');
    assert(foodBudget.actual_spent === 4500, `Food Actual Spent is ₹4,500 (Got: ${foodBudget.actual_spent})`);
    assert(foodBudget.variance === -500, `Food Variance is -₹500 (Got: ${foodBudget.variance})`);
    assert(foodBudget.status === 'over_budget', 'Food Status is over_budget');

    const transportBudget = budgetOverview.categories.find(c => c.category === 'Transport')!;
    assert(transportBudget.limit_amount === 2000, 'Transport Budget Limit is ₹2,000');
    assert(transportBudget.actual_spent === 1800, `Transport Actual Spent is ₹1,800 (Got: ${transportBudget.actual_spent})`);
    assert(transportBudget.variance === 200, `Transport Variance is ₹200 (Got: ${transportBudget.variance})`);
    assert(transportBudget.status === 'under_budget', 'Transport Status is under_budget');

    // Update budget limit
    const updatedFood = await BudgetService.setBudget(1, 'Food', 5000);
    assert(updatedFood.limit_amount === 5000 && updatedFood.status === 'under_budget', 'BudgetService.setBudget updates limit and recomputes status');
  } catch (err) {
    assert(false, 'BudgetService tests failed', (err as Error).message);
  }

  // -------------------------------------------------------------
  // 7. AI INSIGHTS ENGINE HEURISTICS TESTS
  // -------------------------------------------------------------
  console.log('\n--- 7. AI Insights Engine Heuristics ---');
  
  try {
    // Reset seed to test fresh deterministic calculations
    await runSeed();

    const freshInsights = await InsightsEngineService.recalculateInsights(1, '2026-08-31');
    assert(freshInsights.length > 0, `InsightsEngine generated ${freshInsights.length} grounded insights`);

    // Verify Rule E: Budget envelope violation alert
    const budgetAlert = freshInsights.find(i => i.insight_text.includes('exceeded your Food spending plan'));
    assert(budgetAlert !== undefined && budgetAlert.insight_type === 'Alert', 'Rule E: Exceeded Food spending plan alert generated');

    // Verify Rule D: Food delivery savings recommendation
    const foodRec = freshInsights.find(i => i.insight_text.includes('reducing your food-delivery expenses'));
    assert(foodRec !== undefined && foodRec.insight_type === 'Recommendation', 'Rule D: Food-delivery savings recommendation generated');

    // Verify Rule F: UPI App dominance (>30%)
    const upiDominance = freshInsights.find(i => i.insight_text.includes('accounted for') && i.insight_text.includes('UPI spending'));
    assert(upiDominance !== undefined && upiDominance.insight_type === 'Pattern', 'Rule F: UPI app dominance pattern generated');

    // Verify Rule F (Daily): Grounded Daily GPay observation (₹520)
    const dailyGPayInsight = freshInsights.find(i => i.insight_text.includes('₹520 through Google Pay today'));
    assert(dailyGPayInsight !== undefined && dailyGPayInsight.insight_type === 'Alert', 'Rule F (Daily): "You spent ₹520 through Google Pay today" generated');

    // Test Dismiss Insight
    if (freshInsights.length > 0) {
      const insightToDismiss = freshInsights[0];
      const dismissed = await InsightsEngineService.dismissInsight(1, insightToDismiss.id);
      assert(dismissed, 'InsightsEngineService.dismissInsight marks insight as dismissed');
      const activeAfter = await InsightsEngineService.getInsights(1);
      assert(!activeAfter.some(i => i.id === insightToDismiss.id), 'Dismissed insight suppressed from active feed');
    }
  } catch (err) {
    assert(false, 'InsightsEngineService tests failed', (err as Error).message);
  }

  console.log('\n========================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
