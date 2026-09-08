import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database.js';

export async function runSeed(): Promise<void> {
  console.log('--- Seeding Spend Analysis Database ---');
  
  // Initialize schema first
  await initDatabase();

  // Clear existing records to ensure clean deterministic state
  await db.query('DELETE FROM ai_insights;');
  await db.query('DELETE FROM budgets;');
  await db.query('DELETE FROM transactions;');
  await db.query('DELETE FROM connected_accounts;');
  await db.query('DELETE FROM users;');

  // 1. Insert Demo User
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);

  await db.query(`
    INSERT INTO users (id, email, password_hash, name, monthly_income, savings_target)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [1, 'demo.user@finance.in', passwordHash, 'Amit Sharma', 45000.00, 15000.00]);

  // 2. Insert Connected Account (Mock HDFC Bank)
  await db.query(`
    INSERT INTO connected_accounts (id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry, provider_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [101, 1, 'HDFC Bank (Mock)', 'XXXX-XXXX-9876', 'Savings', 1, 'CNS-MOCK-9921', '2027-09-01 00:00:00', 'mock']);

  // 3. Insert Transactions
  const txs = [
    // Income Transaction (August 2026 Salary)
    [101, 1, '2026-08-01', 'Monthly Salary Credit', 45000.00, 'Credit', 'Employer Inc', 'Unknown/Other', 'Other', 'MOCK-TXN-001'],
    // Daily Transactions: 2026-08-31 (Total = ₹1,240)
    [101, 1, '2026-08-31', 'UPI/Swiggy Delivery', 320.00, 'Debit', 'Swiggy', 'Google Pay', 'Food', 'MOCK-TXN-002'],
    [101, 1, '2026-08-31', 'UPI/City Bus Ride', 80.00, 'Debit', 'City Bus', 'Google Pay', 'Transport', 'MOCK-TXN-003'],
    [101, 1, '2026-08-31', 'UPI/Tea Shop payment', 20.00, 'Debit', 'Local Tea Shop', 'Google Pay', 'Food', 'MOCK-TXN-004'],
    [101, 1, '2026-08-31', 'UPI/Amazon Store', 100.00, 'Debit', 'Amazon', 'Google Pay', 'Shopping', 'MOCK-TXN-005'],
    [101, 1, '2026-08-31', 'UPI/Ola Cab fare', 430.00, 'Debit', 'Ola Cabs', 'PhonePe', 'Transport', 'MOCK-TXN-006'],
    [101, 1, '2026-08-31', 'UPI/Groceries payment', 290.00, 'Debit', 'Local Grocer', 'Paytm', 'Food', 'MOCK-TXN-007'],
    // Monthly Balancing Transactions (August 2026)
    [101, 1, '2026-08-05', 'Zomato order', 1870.00, 'Debit', 'Zomato', 'Google Pay', 'Food', 'MOCK-TXN-008'],
    [101, 1, '2026-08-12', 'Weekly Groceries', 2000.00, 'Debit', 'Star Bazaar', 'PhonePe', 'Food', 'MOCK-TXN-009'],
    [101, 1, '2026-08-15', 'Myntra shopping', 1800.00, 'Debit', 'Myntra', 'PhonePe', 'Shopping', 'MOCK-TXN-010'],
    [101, 1, '2026-08-20', 'Amazon India apparel', 1300.00, 'Debit', 'Amazon', 'Google Pay', 'Shopping', 'MOCK-TXN-011'],
    [101, 1, '2026-08-18', 'Uber trip summary', 1290.00, 'Debit', 'Uber', 'Google Pay', 'Transport', 'MOCK-TXN-012'],
    [101, 1, '2026-08-03', 'Movie tickets', 1200.00, 'Debit', 'BookMyShow', 'Paytm', 'Entertainment', 'MOCK-TXN-013'],
    [101, 1, '2026-08-02', 'Electricity Bill BESCOM', 2000.00, 'Debit', 'BESCOM', 'Unknown/Other', 'Bills', 'MOCK-TXN-014'],
    // Historical Trends Transactions (January - April 2026)
    [101, 1, '2026-01-15', 'Rent & Utility bills', 15000.00, 'Debit', 'Society Admin', 'Unknown/Other', 'Bills', 'MOCK-TXN-015'],
    [101, 1, '2026-02-14', 'Tech purchase & medical care', 17500.00, 'Debit', 'Electronics shop', 'PhonePe', 'Shopping', 'MOCK-TXN-016'],
    [101, 1, '2026-03-10', 'Investments & Insurance premiums', 14200.00, 'Debit', 'Zerodha', 'Unknown/Other', 'Investments', 'MOCK-TXN-017'],
    [101, 1, '2026-04-20', 'Family travel expenses', 19100.00, 'Debit', 'MakeMyTrip', 'Google Pay', 'Transport', 'MOCK-TXN-018']
  ];

  for (const tx of txs) {
    await db.query(`
      INSERT INTO transactions (account_id, user_id, transaction_date, description, amount, type, merchant, payment_source, category, external_transaction_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, tx);
  }

  // 4. Insert Budgets (Spending Envelopes)
  const budgets = [
    [1, 'Food', 4000.00],
    [1, 'Transport', 2000.00],
    [1, 'Shopping', 2500.00],
    [1, 'Bills', 2000.00],
    [1, 'Entertainment', 1500.00]
  ];
  for (const b of budgets) {
    await db.query(`
      INSERT INTO budgets (user_id, category, limit_amount)
      VALUES ($1, $2, $3)
    `, b);
  }

  // 5. Insert Grounded AI Insights
  const insights = [
    [1, 'General', 'You spent ₹520 through Google Pay today.', 'Alert', 520.00],
    [1, 'General', 'Your spending this week was ₹8,420, which is ₹1,200 higher than last week.', 'Pattern', 8420.00],
    [1, 'General', 'PhonePe accounted for 35% of your UPI spending this month.', 'Pattern', 35.00],
    [1, 'Food', 'Food was your highest spending category this week.', 'Pattern', 4500.00],
    [1, 'Food', 'You have exceeded your Food spending plan by ₹500.', 'Alert', 500.00],
    [1, 'Food', 'You could reduce monthly spending by approximately ₹657 by reducing your food-delivery expenses.', 'Recommendation', 657.00]
  ];
  for (const ins of insights) {
    await db.query(`
      INSERT INTO ai_insights (user_id, category, insight_text, insight_type, trigger_metric_value, is_dismissed)
      VALUES ($1, $2, $3, $4, $5, 0)
    `, ins);
  }

  // 6. Sequence Synchronization in PostgreSQL mode
  if (db.isPostgres()) {
    try {
      await db.query(`SELECT setval(pg_get_serial_sequence('public.users', 'id'), COALESCE((SELECT MAX(id) FROM public.users), 1));`);
      await db.query(`SELECT setval(pg_get_serial_sequence('public.connected_accounts', 'id'), COALESCE((SELECT MAX(id) FROM public.connected_accounts), 101));`);
      await db.query(`SELECT setval(pg_get_serial_sequence('public.transactions', 'id'), COALESCE((SELECT MAX(id) FROM public.transactions), 18));`);
      await db.query(`SELECT setval(pg_get_serial_sequence('public.budgets', 'id'), COALESCE((SELECT MAX(id) FROM public.budgets), 5));`);
      await db.query(`SELECT setval(pg_get_serial_sequence('public.ai_insights', 'id'), COALESCE((SELECT MAX(id) FROM public.ai_insights), 6));`);
    } catch {
      // Ignore if not in public schema
    }
  }

  console.log('Deterministic seed data populated successfully:');
  console.log('  - Users: 1 (Amit Sharma, demo.user@finance.in / password123)');
  console.log('  - Connected Accounts: 1 (Mock HDFC Bank, Active Consent, provider_id: mock)');
  console.log('  - Transactions: 18 records (Daily 2026-08-31 = ₹1,240, Monthly August = ₹12,700, Historical Jan-Apr with external_transaction_id)');
  console.log('  - Budgets: 5 categories (Food: ₹4k, Transport: ₹2k, Entertainment: ₹1.5k, Shopping: ₹2.5k, Bills: ₹2k)');
  console.log('  - AI Insights: 6 grounded heuristic entries');
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seed')) {
  runSeed().catch(console.error);
}
