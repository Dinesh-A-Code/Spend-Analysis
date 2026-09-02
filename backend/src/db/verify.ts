import { db } from './database.js';

async function verify(): Promise<void> {
  console.log('=== Database Verification ===');
  console.log(`Engine: ${db.isPostgres() ? 'Supabase PostgreSQL' : 'SQLite'}`);

  // Check user
  const user = await db.queryOne('SELECT id, email, name, monthly_income, savings_target FROM users');
  console.log('Demo User:', user);

  // Check connected account
  const account = await db.queryOne('SELECT id, institution_name, account_number_masked, consent_granted FROM connected_accounts');
  console.log('Connected Account:', account);

  // Check transaction counts
  const txCountRow = await db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM transactions');
  const txCount = Number(txCountRow?.count ?? 0);
  console.log('Total Transactions Count:', txCount);

  // Verify Daily Calculations (2026-08-31)
  const dailyTx = await db.queryAll<{ merchant: string; amount: number; payment_source: string; category: string }>(
    "SELECT merchant, amount, payment_source, category FROM transactions WHERE transaction_date = $1",
    ['2026-08-31']
  );
  console.log('\nDaily Transactions (2026-08-31):');
  dailyTx.forEach(tx => console.log(`  - ${tx.merchant} | ₹${tx.amount} | ${tx.payment_source} | ${tx.category}`));

  const dailyTotalRow = await db.queryOne<{ total: number }>("SELECT SUM(amount) as total FROM transactions WHERE transaction_date = $1 AND type = 'Debit'", ['2026-08-31']);
  const gpayTotalRow = await db.queryOne<{ total: number }>("SELECT SUM(amount) as total FROM transactions WHERE transaction_date = $1 AND payment_source = 'Google Pay'", ['2026-08-31']);
  const phonePeTotalRow = await db.queryOne<{ total: number }>("SELECT SUM(amount) as total FROM transactions WHERE transaction_date = $1 AND payment_source = 'PhonePe'", ['2026-08-31']);
  const paytmTotalRow = await db.queryOne<{ total: number }>("SELECT SUM(amount) as total FROM transactions WHERE transaction_date = $1 AND payment_source = 'Paytm'", ['2026-08-31']);

  const dailyTotal = Number(dailyTotalRow?.total ?? 0);
  const gpayTotal = Number(gpayTotalRow?.total ?? 0);
  const phonePeTotal = Number(phonePeTotalRow?.total ?? 0);
  const paytmTotal = Number(paytmTotalRow?.total ?? 0);

  console.log(`\nCalculation Integrity Checks (Daily 2026-08-31):`);
  console.log(`  - Total Daily Spend : ₹${dailyTotal} (Expected: ₹1240) -> ${dailyTotal === 1240 ? 'MATCH' : 'MISMATCH'}`);
  console.log(`  - Google Pay Total  : ₹${gpayTotal} (Expected: ₹520)  -> ${gpayTotal === 520 ? 'MATCH' : 'MISMATCH'}`);
  console.log(`  - PhonePe Total     : ₹${phonePeTotal} (Expected: ₹430)  -> ${phonePeTotal === 430 ? 'MATCH' : 'MISMATCH'}`);
  console.log(`  - Paytm Total       : ₹${paytmTotal} (Expected: ₹290)  -> ${paytmTotal === 290 ? 'MATCH' : 'MISMATCH'}`);
  console.log(`  - Sum Verification  : ${gpayTotal} + ${phonePeTotal} + ${paytmTotal} = ${gpayTotal + phonePeTotal + paytmTotal} (Expected: ${dailyTotal}) -> ${gpayTotal + phonePeTotal + paytmTotal === dailyTotal ? 'RECONCILED' : 'FAILED'}`);

  // Check Budgets
  const budgets = await db.queryAll<{ category: string; limit_amount: number }>('SELECT category, limit_amount FROM budgets');
  console.log('\nBudgets Configured:');
  budgets.forEach(b => console.log(`  - ${b.category}: ₹${b.limit_amount}`));

  // Check AI Insights
  const insights = await db.queryAll<{ id: number; category: string; insight_type: string; insight_text: string }>('SELECT id, category, insight_type, insight_text FROM ai_insights');
  console.log('\nAI Insights Seeded:');
  insights.forEach(i => console.log(`  - [${i.insight_type}] (${i.category}): "${i.insight_text}"`));
}

verify().catch(console.error);
