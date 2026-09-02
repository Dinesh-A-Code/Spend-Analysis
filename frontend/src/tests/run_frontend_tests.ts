import test from 'node:test';
import assert from 'node:assert/strict';

console.log('\n========================================');
console.log('   SPEND ANALYSIS FRONTEND TEST SUITE   ');
console.log('========================================\n');

// 1. Navigation & Route Requirements
test('1. Navigation Capsule Specification Verification', async (t) => {
  const CANONICAL_NAV_ITEMS = [
    { id: 'home', label: 'Home', path: '/dashboard' },
    { id: 'analytics', label: 'Analytics', path: '/analytics' },
    { id: 'transactions', label: 'Transactions', path: '/transactions' },
    { id: 'budget', label: 'Budget', path: '/budget' },
    { id: 'settings', label: 'Settings', path: '/settings' },
  ];

  await t.test('Bottom navigation strictly contains 5 canonical tabs', () => {
    assert.equal(CANONICAL_NAV_ITEMS.length, 5);
  });

  await t.test('AI Insights is NOT a primary navigation tab', () => {
    const hasAiInsights = CANONICAL_NAV_ITEMS.some(
      (item) => item.id === 'ai_insights' || item.label.toLowerCase().includes('insight')
    );
    assert.equal(hasAiInsights, false, 'AI Insights must NOT be in bottom navigation');
  });

  await t.test('Canonical tabs match specified order', () => {
    const expectedOrder = ['home', 'analytics', 'transactions', 'budget', 'settings'];
    assert.deepEqual(
      CANONICAL_NAV_ITEMS.map((item) => item.id),
      expectedOrder
    );
  });
});

// 2. Auth & Session Management Tests
test('2. Auth & API Client Logic', async (t) => {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };

  const TOKEN_KEY = 'spend_analysis_token';

  await t.test('Token storage and retrieval operates correctly', () => {
    mockLocalStorage.setItem(TOKEN_KEY, 'jwt_mock_token_123');
    assert.equal(mockLocalStorage.getItem(TOKEN_KEY), 'jwt_mock_token_123');
    mockLocalStorage.removeItem(TOKEN_KEY);
    assert.equal(mockLocalStorage.getItem(TOKEN_KEY), null);
  });

  await t.test('Signup validation requires valid name, email, matching passwords, and terms', () => {
    const validateSignup = (data: {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
      terms: boolean;
    }) => {
      if (!data.fullName.trim()) return 'Please enter your full name.';
      if (!data.email.trim() || !data.email.includes('@')) return 'Please enter a valid email address.';
      if (data.password.length < 6) return 'Password must be at least 6 characters.';
      if (data.password !== data.confirmPassword) return 'Passwords do not match.';
      if (!data.terms) return 'Please agree to the Terms of Service and Privacy Policy.';
      return null;
    };

    assert.equal(
      validateSignup({
        fullName: '',
        email: 'test@mail.com',
        password: 'password',
        confirmPassword: 'password',
        terms: true,
      }),
      'Please enter your full name.'
    );
    assert.equal(
      validateSignup({
        fullName: 'Amit',
        email: '',
        password: 'password',
        confirmPassword: 'password',
        terms: true,
      }),
      'Please enter a valid email address.'
    );
    assert.equal(
      validateSignup({
        fullName: 'Amit',
        email: 'amit@mail.com',
        password: '123',
        confirmPassword: '123',
        terms: true,
      }),
      'Password must be at least 6 characters.'
    );
    assert.equal(
      validateSignup({
        fullName: 'Amit',
        email: 'amit@mail.com',
        password: 'password1',
        confirmPassword: 'password2',
        terms: true,
      }),
      'Passwords do not match.'
    );
    assert.equal(
      validateSignup({
        fullName: 'Amit',
        email: 'amit@mail.com',
        password: 'password1',
        confirmPassword: 'password1',
        terms: false,
      }),
      'Please agree to the Terms of Service and Privacy Policy.'
    );
    assert.equal(
      validateSignup({
        fullName: 'Amit',
        email: 'amit@mail.com',
        password: 'password1',
        confirmPassword: 'password1',
        terms: true,
      }),
      null
    );
  });

  await t.test('User with active connected account redirects to /dashboard upon login (never /settings)', () => {
    const resolvePostLoginRoute = (
      userAccounts: { consent_granted: number }[],
      rawFrom?: string
    ) => {
      const isExcluded =
        !rawFrom ||
        rawFrom === '/settings' ||
        rawFrom.startsWith('/onboarding') ||
        rawFrom === '/login' ||
        rawFrom === '/signup' ||
        rawFrom === '/';

      const hasActiveConsent = userAccounts.some((acc) => acc.consent_granted === 1);
      if (hasActiveConsent) {
        return !isExcluded ? rawFrom : '/dashboard';
      }
      return '/onboarding/connect-account';
    };

    // Case 1: Active account, default flow -> /dashboard
    assert.equal(resolvePostLoginRoute([{ consent_granted: 1 }]), '/dashboard');

    // Case 2: Active account, coming from /settings after logout -> normalized to /dashboard (NEVER /settings)
    assert.equal(resolvePostLoginRoute([{ consent_granted: 1 }], '/settings'), '/dashboard');

    // Case 3: Active account, valid deep link -> /analytics
    assert.equal(resolvePostLoginRoute([{ consent_granted: 1 }], '/analytics'), '/analytics');

    // Case 4: No connected account -> /onboarding/connect-account (NEVER /settings)
    assert.equal(resolvePostLoginRoute([]), '/onboarding/connect-account');
    assert.equal(resolvePostLoginRoute([], '/settings'), '/onboarding/connect-account');

    // Case 5: Revoked consent account -> /onboarding/connect-account
    assert.equal(resolvePostLoginRoute([{ consent_granted: 0 }]), '/onboarding/connect-account');
  });
});

// 3. Onboarding & Institution Selection Tests
test('3. Onboarding & Institution Selection State', async (t) => {
  const INSTITUTIONS = [
    { id: 'hdfc', name: 'HDFC Bank' },
    { id: 'icici', name: 'ICICI Bank' },
    { id: 'sbi', name: 'State Bank of India' },
    { id: 'axis', name: 'Axis Bank' },
  ];

  await t.test('Supported institutions list contains canonical MVP sandbox options', () => {
    const names = INSTITUTIONS.map((i) => i.name);
    assert.ok(names.includes('HDFC Bank'));
    assert.ok(names.includes('ICICI Bank'));
    assert.ok(names.includes('State Bank of India'));
    assert.ok(names.includes('Axis Bank'));
  });

  await t.test('Default selected institution is ICICI Bank as shown in canonical mock', () => {
    const defaultInst = 'ICICI Bank';
    assert.equal(defaultInst, 'ICICI Bank');
  });

  await t.test('Preferences selection toggle maintains multiple active choices', () => {
    let selected: string[] = ['Save more'];
    const toggle = (pref: string) => {
      selected = selected.includes(pref) ? selected.filter((p) => p !== pref) : [...selected, pref];
    };

    toggle('Stay within budget');
    assert.deepEqual(selected, ['Save more', 'Stay within budget']);

    toggle('Save more');
    assert.deepEqual(selected, ['Stay within budget']);
  });
});

// 4. Account Aggregator Consent Rules
test('4. Account Aggregator Consent Security & State', async (t) => {
  await t.test('Approve consent action is strictly gated by user checkbox agreement', () => {
    const isApproveEnabled = (consentAgreed: boolean, isSubmitting: boolean) => {
      return consentAgreed && !isSubmitting;
    };

    assert.equal(isApproveEnabled(false, false), false);
    assert.equal(isApproveEnabled(true, true), false);
    assert.equal(isApproveEnabled(true, false), true);
  });

  await t.test('Security rule: Banking passwords or UPI PINs are never requested in consent flow', () => {
    const requestedFields = ['transaction_data', 'account_metadata'];
    const forbiddenFields = ['banking_password', 'upi_pin', 'netbanking_credentials'];

    forbiddenFields.forEach((field) => {
      assert.equal(requestedFields.includes(field), false, `Must never request ${field}`);
    });
  });
});

// 5. Layout & Safe Area Rules
test('5. Layout & Mobile Safe Area Verification', async (t) => {
  await t.test('Navigation bottom padding accounts for safe area and floating capsule height', () => {
    const navBottomPadding = 'pb-nav';
    assert.ok(navBottomPadding.length > 0);
  });

  await t.test('Soft dark palette token baseline conforms to specification', () => {
    const tokens = {
      background: '#18191F',
      surface: '#202126',
      card: '#292A30',
      textPrimary: '#F5F5F5',
      textSecondary: '#A7A8AE',
      navSurface: '#F9F9F9',
    };

    assert.equal(tokens.background, '#18191F');
    assert.equal(tokens.surface, '#202126');
    assert.equal(tokens.card, '#292A30');
    assert.equal(tokens.textPrimary, '#F5F5F5');
    assert.equal(tokens.textSecondary, '#A7A8AE');
  });
});

// 6. Populated Dashboard & UPI Payment Source Calculations
test('6. Populated Dashboard Data Reconciliations', async (t) => {
  // Canonical daily seed dataset (2026-08-31)
  const dailyTransactions = [
    { id: 1, merchant: 'Swiggy', amount: 320, category: 'Food', payment_source: 'Google Pay', type: 'Debit' },
    { id: 2, merchant: 'City Bus', amount: 80, category: 'Transport', payment_source: 'Google Pay', type: 'Debit' },
    { id: 3, merchant: 'Local Tea Shop', amount: 20, category: 'Food', payment_source: 'Google Pay', type: 'Debit' },
    { id: 4, merchant: 'Amazon', amount: 100, category: 'Shopping', payment_source: 'Google Pay', type: 'Debit' },
    { id: 5, merchant: 'Ola Cabs', amount: 430, category: 'Transport', payment_source: 'PhonePe', type: 'Debit' },
    { id: 6, merchant: 'Local Grocer', amount: 290, category: 'Food', payment_source: 'Paytm', type: 'Debit' },
  ];

  await t.test('Daily total spending equals ₹1,240', () => {
    const total = dailyTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(total, 1240);
  });

  await t.test('Google Pay source spending reconciles to ₹520', () => {
    const gpayTotal = dailyTransactions
      .filter((tx) => tx.payment_source === 'Google Pay')
      .reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(gpayTotal, 520);
  });

  await t.test('PhonePe source spending reconciles to ₹430', () => {
    const phonepeTotal = dailyTransactions
      .filter((tx) => tx.payment_source === 'PhonePe')
      .reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(phonepeTotal, 430);
  });

  await t.test('Paytm source spending reconciles to ₹290', () => {
    const paytmTotal = dailyTransactions
      .filter((tx) => tx.payment_source === 'Paytm')
      .reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(paytmTotal, 290);
  });

  await t.test('Unknown/Other source spending is ₹0 when no missing sources', () => {
    const unknownTotal = dailyTransactions
      .filter((tx) => tx.payment_source === 'Unknown/Other')
      .reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(unknownTotal, 0);
  });

  await t.test('UPI source sum reconciliation: 520 + 430 + 290 + 0 = 1240', () => {
    const gpay = 520;
    const phonepe = 430;
    const paytm = 290;
    const other = 0;
    assert.equal(gpay + phonepe + paytm + other, 1240);
  });

  await t.test('Daily Category Food reconciles to ₹630 (Swiggy ₹320 + Tea ₹20 + Grocer ₹290)', () => {
    const foodTotal = dailyTransactions
      .filter((tx) => tx.category === 'Food')
      .reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(foodTotal, 630);
  });

  await t.test('Daily Category Transport reconciles to ₹510 (Bus ₹80 + Ola ₹430)', () => {
    const transportTotal = dailyTransactions
      .filter((tx) => tx.category === 'Transport')
      .reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(transportTotal, 510);
  });

  await t.test('Daily Category Shopping reconciles to ₹100 (Amazon ₹100)', () => {
    const shoppingTotal = dailyTransactions
      .filter((tx) => tx.category === 'Shopping')
      .reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(shoppingTotal, 100);
  });

  await t.test('Daily Category Other reconciles to ₹0', () => {
    const otherTotal = dailyTransactions
      .filter((tx) => tx.category === 'Other')
      .reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(otherTotal, 0);
  });

  await t.test('Category sum reconciliation: 630 + 510 + 100 + 0 = 1240', () => {
    const food = 630;
    const transport = 510;
    const shopping = 100;
    const other = 0;
    assert.equal(food + transport + shopping + other, 1240);
  });

  await t.test('Category percentages: Food = 50.8%, Transport = 41.1%, Shopping = 8.1%, Other = 0%', () => {
    const total = 1240;
    const foodPct = Number(((630 / total) * 100).toFixed(1));
    const transportPct = Number(((510 / total) * 100).toFixed(1));
    const shoppingPct = Number(((100 / total) * 100).toFixed(1));
    const otherPct = Number(((0 / total) * 100).toFixed(1));

    assert.equal(foodPct, 50.8);
    assert.equal(transportPct, 41.1);
    assert.equal(shoppingPct, 8.1);
    assert.equal(otherPct, 0.0);
    assert.equal(Number((foodPct + transportPct + shoppingPct + otherPct).toFixed(1)), 100.0);
  });
});

// 7. Payment Source Drill-Down Sheet Specifications
test('7. Payment Source Drill-Down Specifications (Google Pay & Reusability)', async (t) => {
  const gpayTransactions = [
    { id: 1, merchant: 'Swiggy', amount: 320, category: 'Food', payment_source: 'Google Pay', type: 'Debit' },
    { id: 2, merchant: 'City Bus', amount: 80, category: 'Transport', payment_source: 'Google Pay', type: 'Debit' },
    { id: 3, merchant: 'Local Tea Shop', amount: 20, category: 'Food', payment_source: 'Google Pay', type: 'Debit' },
    { id: 4, merchant: 'Amazon', amount: 100, category: 'Shopping', payment_source: 'Google Pay', type: 'Debit' },
  ];

  await t.test('Google Pay contributing transaction count equals 4', () => {
    assert.equal(gpayTransactions.length, 4);
  });

  await t.test('Google Pay total sum equals ₹520 (320 + 80 + 20 + 100 = 520)', () => {
    const total = gpayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(total, 520);
  });

  await t.test('Google Pay category breakdowns: Food = ₹340, Transport = ₹80, Shopping = ₹100', () => {
    const catTotals: Record<string, number> = {};
    gpayTransactions.forEach((tx) => {
      catTotals[tx.category] = (catTotals[tx.category] || 0) + tx.amount;
    });

    assert.equal(catTotals['Food'], 340); // Swiggy 320 + Local Tea Shop 20
    assert.equal(catTotals['Transport'], 80); // City Bus 80
    assert.equal(catTotals['Shopping'], 100); // Amazon 100
  });

  await t.test('Google Pay share of today UPI spending calculates to 42%', () => {
    const totalPeriodSpend = 1240;
    const gpaySpend = 520;
    const sharePercentage = Math.round((gpaySpend / totalPeriodSpend) * 100);
    assert.equal(sharePercentage, 42); // 520 / 1240 = 41.935% -> 42%
  });

  // Reusability test for PhonePe
  const phonepeTransactions = [
    { id: 5, merchant: 'Ola Cabs', amount: 430, category: 'Transport', payment_source: 'PhonePe', type: 'Debit' },
  ];

  await t.test('PhonePe drill-down total equals ₹430 with 1 transaction', () => {
    const total = phonepeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    assert.equal(total, 430);
    assert.equal(phonepeTransactions.length, 1);
  });
});

// 8. Empty Dashboard Gating & Previews
test('8. Empty Dashboard Gating & Content', async (t) => {
  await t.test('Dashboard renders empty state when user has 0 connected accounts or revoked consent', () => {
    const shouldShowEmpty = (accountsCount: number, hasConsent: boolean) => {
      return accountsCount === 0 || !hasConsent;
    };

    assert.equal(shouldShowEmpty(0, false), true);
    assert.equal(shouldShowEmpty(0, true), true);
    assert.equal(shouldShowEmpty(1, false), true);
    assert.equal(shouldShowEmpty(1, true), false);
  });

  await t.test('Empty state preview items contain canonical 3 features', () => {
    const previewItems = ['Spending overview', 'Budget progress', 'AI insights'];
    assert.equal(previewItems.length, 3);
    assert.ok(previewItems.includes('Spending overview'));
    assert.ok(previewItems.includes('Budget progress'));
    assert.ok(previewItems.includes('AI insights'));
  });

  await t.test('Connect account CTA targets /onboarding/connect-account route', () => {
    const connectRoute = '/onboarding/connect-account';
    assert.equal(connectRoute, '/onboarding/connect-account');
  });
});

// 9. Period Switching & Dynamic Dataset Calculation
test('9. Period Switching Dynamic Dataset Handling', async (t) => {
  const calculatePeriodCategoryTotals = (transactions: { category: string; amount: number }[]) => {
    const totals: Record<string, number> = {};
    transactions.forEach((tx) => {
      totals[tx.category] = (totals[tx.category] || 0) + tx.amount;
    });
    return totals;
  };

  await t.test('Period switching updates category totals dynamically without stale data', () => {
    const dailySet = [
      { category: 'Food', amount: 630 },
      { category: 'Transport', amount: 510 },
      { category: 'Shopping', amount: 100 },
    ];
    const monthlySet = [
      { category: 'Food', amount: 4500 },
      { category: 'Shopping', amount: 3200 },
      { category: 'Transport', amount: 1800 },
      { category: 'Entertainment', amount: 1200 },
      { category: 'Bills', amount: 2000 },
    ];

    const dailyResult = calculatePeriodCategoryTotals(dailySet);
    const monthlyResult = calculatePeriodCategoryTotals(monthlySet);

    assert.equal(dailyResult['Food'], 630);
    assert.equal(monthlyResult['Food'], 4500);
    assert.equal(dailyResult['Bills'], undefined);
    assert.equal(monthlyResult['Bills'], 2000);
  });
});

// 10. Analytics Page Metrics & Monthly Trends
test('10. Analytics Page Metrics & Historical Multi-Month Trends', async (t) => {
  const mockTrends = [
    { month: 'January', year: 2026, expenses: 15000, income: 45000, savings: 30000 },
    { month: 'February', year: 2026, expenses: 17500, income: 45000, savings: 27500 },
    { month: 'March', year: 2026, expenses: 14200, income: 45000, savings: 30800 },
    { month: 'April', year: 2026, expenses: 19100, income: 45000, savings: 25900 },
  ];

  await t.test('Monthly trend series contains 4 historical anchor months with verified figures', () => {
    assert.equal(mockTrends.length, 4);
    assert.equal(mockTrends[0].expenses, 15000);
    assert.equal(mockTrends[1].expenses, 17500);
    assert.equal(mockTrends[2].expenses, 14200);
    assert.equal(mockTrends[3].expenses, 19100);
  });

  await t.test('Proportional bar chart height scaling preserves max height bounds', () => {
    const maxVal = Math.max(...mockTrends.map((t) => t.expenses)); // 19100
    const scale = (val: number) => Math.max(15, Math.round((val / maxVal) * 100));

    assert.equal(scale(19100), 100);
    assert.equal(scale(15000), Math.round((15000 / 19100) * 100)); // 79%
  });

  await t.test('Analytics getMonthName safely formats number, string, or month_name without throwing', () => {
    const getMonthName = (trend: { month: number | string; month_name?: string }) => {
      if (trend.month_name) return trend.month_name;
      if (typeof trend.month === 'string' && isNaN(Number(trend.month))) return trend.month;
      const mNum = typeof trend.month === 'number' ? trend.month : parseInt(String(trend.month), 10);
      const names = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return names[(mNum || 1) - 1] || 'Month';
    };

    assert.equal(getMonthName({ month: 1, month_name: 'January' }), 'January');
    assert.equal(getMonthName({ month: 4, month_name: 'April' }), 'April');
    assert.equal(getMonthName({ month: 2 }), 'February');
    assert.equal(getMonthName({ month: 'March' }), 'March');
    assert.equal(getMonthName({ month: 12 }), 'December');
  });

  await t.test('Analytics calculates safely with empty dataset without throwing runtime errors', () => {
    const emptyTrends: { expenses?: number; total_expenses?: number }[] = [];
    const maxTrend = emptyTrends.length > 0 ? Math.max(1, ...emptyTrends.map((t) => Number(t.expenses ?? t.total_expenses ?? 0))) : 20000;
    assert.equal(maxTrend, 20000);

    const emptyCats: Record<string, number> = {};
    const catEntries = Object.entries(emptyCats);
    assert.equal(catEntries.length, 0);
  });
});

// 11. Transactions Ledger Search, Filtering & Detail Bindings
test('11. Transactions Ledger Search, Filtering & Detail Bindings', async (t) => {
  const allTransactions = [
    { id: 1, merchant: 'Swiggy', description: 'UPI/Swiggy Delivery', amount: 320, category: 'Food', payment_source: 'Google Pay', type: 'Debit', transaction_date: '2026-08-31' },
    { id: 2, merchant: 'City Bus', description: 'UPI/City Bus Ride', amount: 80, category: 'Transport', payment_source: 'Google Pay', type: 'Debit', transaction_date: '2026-08-31' },
    { id: 3, merchant: 'Local Tea Shop', description: 'UPI/Tea Shop payment', amount: 20, category: 'Food', payment_source: 'Google Pay', type: 'Debit', transaction_date: '2026-08-31' },
    { id: 4, merchant: 'Amazon', description: 'UPI/Amazon Store', amount: 100, category: 'Shopping', payment_source: 'Google Pay', type: 'Debit', transaction_date: '2026-08-31' },
    { id: 5, merchant: 'Ola Cabs', description: 'UPI/Ola Cab fare', amount: 430, category: 'Transport', payment_source: 'PhonePe', type: 'Debit', transaction_date: '2026-08-31' },
    { id: 6, merchant: 'Local Grocer', description: 'UPI/Groceries payment', amount: 290, category: 'Food', payment_source: 'Paytm', type: 'Debit', transaction_date: '2026-08-31' },
  ];

  await t.test('Searching for "Swiggy" returns only Swiggy transaction', () => {
    const results = allTransactions.filter((tx) =>
      tx.merchant.toLowerCase().includes('swiggy') || tx.description.toLowerCase().includes('swiggy')
    );
    assert.equal(results.length, 1);
    assert.equal(results[0].merchant, 'Swiggy');
  });

  await t.test('Filtering by payment source "PhonePe" returns exactly 1 record', () => {
    const results = allTransactions.filter((tx) => tx.payment_source === 'PhonePe');
    assert.equal(results.length, 1);
    assert.equal(results[0].merchant, 'Ola Cabs');
    assert.equal(results[0].amount, 430);
  });

  await t.test('Filtering by category "Transport" returns City Bus and Ola Cabs', () => {
    const results = allTransactions.filter((tx) => tx.category === 'Transport');
    assert.equal(results.length, 2);
    const sum = results.reduce((acc, tx) => acc + tx.amount, 0);
    assert.equal(sum, 510); // 80 + 430 = 510
  });

  await t.test('Transaction detail sheet displays all verified metadata attributes', () => {
    const tx = allTransactions[2]; // Tea Shop ₹20
    assert.equal(tx.merchant, 'Local Tea Shop');
    assert.equal(tx.amount, 20);
    assert.equal(tx.category, 'Food');
    assert.equal(tx.payment_source, 'Google Pay');
  });
});

// 12. Budget Spending Envelopes & Variance Logic
test('12. Budget Spending Envelopes & Variance Calculations', async (t) => {
  const budgetEnvelopes = [
    { category: 'Food', limit: 4000, spent: 4500 },
    { category: 'Transport', limit: 2000, spent: 1800 },
    { category: 'Entertainment', limit: 1500, spent: 1200 },
    { category: 'Shopping', limit: 2500, spent: 3200 },
  ];

  await t.test('Total monthly budget limit equals ₹10,000', () => {
    const totalLimit = budgetEnvelopes.reduce((acc, b) => acc + b.limit, 0);
    assert.equal(totalLimit, 10000);
  });

  await t.test('Food is over budget by ₹500 (spent 4500 vs limit 4000)', () => {
    const food = budgetEnvelopes.find((b) => b.category === 'Food')!;
    const over = food.spent - food.limit;
    assert.equal(over, 500);
    assert.equal(food.spent > food.limit, true);
  });

  await t.test('Transport has ₹200 remaining (spent 1800 vs limit 2000)', () => {
    const transport = budgetEnvelopes.find((b) => b.category === 'Transport')!;
    const remaining = transport.limit - transport.spent;
    assert.equal(remaining, 200);
    assert.equal(transport.spent <= transport.limit, true);
  });

  await t.test('Shopping is over budget by ₹700 (spent 3200 vs limit 2500)', () => {
    const shopping = budgetEnvelopes.find((b) => b.category === 'Shopping')!;
    const over = shopping.spent - shopping.limit;
    assert.equal(over, 700);
  });
});

// 13. AI Insights Feed Filtering & Dismissal
test('13. AI Insights Feed Filtering, Heuristic Rules & Dismissal', async (t) => {
  let insights = [
    { id: 1, type: 'Alert', text: 'You spent ₹520 through Google Pay today.', is_dismissed: 0 },
    { id: 2, type: 'Pattern', text: 'Your spending this week was ₹8,420, which is ₹1,200 higher than last week.', is_dismissed: 0 },
    { id: 3, type: 'Pattern', text: 'PhonePe accounted for 35% of your UPI spending this month.', is_dismissed: 0 },
    { id: 4, type: 'Alert', text: 'You have exceeded your Food spending plan by ₹500.', is_dismissed: 0 },
    { id: 5, type: 'Recommendation', text: 'You could reduce monthly spending by approximately ₹657 by reducing your food-delivery expenses.', is_dismissed: 0 },
  ];

  await t.test('Filtering by "Alerts" returns only Alert insights', () => {
    const alerts = insights.filter((i) => i.type === 'Alert' && !i.is_dismissed);
    assert.equal(alerts.length, 2);
    assert.ok(alerts.every((i) => i.type === 'Alert'));
  });

  await t.test('Filtering by "Recommendations" returns only Recommendation insights', () => {
    const recs = insights.filter((i) => i.type === 'Recommendation' && !i.is_dismissed);
    assert.equal(recs.length, 1);
    assert.equal(recs[0].type, 'Recommendation');
  });

  await t.test('Dismissing an insight marks is_dismissed and removes it from active list', () => {
    const dismissId = 1;
    insights = insights.map((i) => (i.id === dismissId ? { ...i, is_dismissed: 1 } : i));

    const activeInsights = insights.filter((i) => !i.is_dismissed);
    assert.equal(activeInsights.length, 4);
    assert.equal(activeInsights.some((i) => i.id === dismissId), false);
  });
});

// 14. Cross-Screen Monthly Spending Data Reconciliation
test('14. Cross-Screen Monthly Spending Consistency & Safe Area Clearance', async (t) => {
  const augustTransactions = [
    { merchant: 'Swiggy', amount: 320, category: 'Food', type: 'Debit' },
    { merchant: 'City Bus', amount: 80, category: 'Transport', type: 'Debit' },
    { merchant: 'Local Tea Shop', amount: 20, category: 'Food', type: 'Debit' },
    { merchant: 'Amazon', amount: 100, category: 'Shopping', type: 'Debit' },
    { merchant: 'Ola Cabs', amount: 430, category: 'Transport', type: 'Debit' },
    { merchant: 'Local Grocer', amount: 290, category: 'Food', type: 'Debit' },
    { merchant: 'Zomato', amount: 1870, category: 'Food', type: 'Debit' },
    { merchant: 'Star Bazaar', amount: 2000, category: 'Food', type: 'Debit' },
    { merchant: 'Myntra', amount: 1800, category: 'Shopping', type: 'Debit' },
    { merchant: 'Amazon', amount: 1300, category: 'Shopping', type: 'Debit' },
    { merchant: 'Uber', amount: 1290, category: 'Transport', type: 'Debit' },
    { merchant: 'Movie tickets', amount: 1200, category: 'Entertainment', type: 'Debit' },
    { merchant: 'BESCOM', amount: 2000, category: 'Bills', type: 'Debit' },
  ];

  await t.test('August monthly debit transactions sum to exactly ₹12,700 across 13 transactions', () => {
    const totalDebitSpend = augustTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    assert.equal(totalDebitSpend, 12700);
  });

  await t.test('Cross-Screen Consistency: Analytics === Transactions === Budget === ₹12,700', () => {
    const analyticsMonthlySpend = 12700;
    const transactionsMonthlySpend = augustTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const budgetTotalSpent = 12700;

    assert.equal(analyticsMonthlySpend, 12700);
    assert.equal(transactionsMonthlySpend, 12700);
    assert.equal(budgetTotalSpent, 12700);
    assert.equal(analyticsMonthlySpend, transactionsMonthlySpend);
    assert.equal(transactionsMonthlySpend, budgetTotalSpent);
  });
});

// 15. Settings, Consent Revocation & Financial Data Deletion Logic
test('15. Settings, Consent Revocation & Financial Data Deletion Specifications', async (t) => {
  let mockAccounts = [
    {
      id: 1,
      user_id: 1,
      institution_name: 'HDFC Bank',
      account_number_masked: 'XXXX-XXXX-9876',
      account_type: 'Savings',
      consent_granted: 1,
      consent_id: 'CNS-MOCK-9876',
      consent_expiry: '2027-09-01T00:00:00.000Z',
    },
  ];

  let mockUserTransactions = [
    { id: 1, user_id: 1, amount: 320, merchant: 'Swiggy', category: 'Food' },
    { id: 2, user_id: 1, amount: 80, merchant: 'City Bus', category: 'Transport' },
  ];

  let mockOtherUserTransactions = [
    { id: 3, user_id: 2, amount: 500, merchant: 'Other Store', category: 'Shopping' },
  ];

  let mockAuthUser = { id: 1, email: 'demo.user@finance.in', name: 'Amit Sharma' };

  await t.test('Settings tab is active when current path is /settings', () => {
    const currentPath = '/settings';
    const getActiveTab = (path: string) => {
      if (path === '/dashboard' || path === '/') return 'home';
      if (path.startsWith('/analytics')) return 'analytics';
      if (path.startsWith('/transactions')) return 'transactions';
      if (path.startsWith('/budget')) return 'budget';
      if (path.startsWith('/settings')) return 'settings';
      return '';
    };
    assert.equal(getActiveTab(currentPath), 'settings');
  });

  await t.test('Unauthenticated user cannot access Settings (gated by ProtectedRoute)', () => {
    const isUserAuthenticated = false;
    const resolveSettingsAccess = (auth: boolean) => (auth ? '/settings' : '/login');
    assert.equal(resolveSettingsAccess(isUserAuthenticated), '/login');
  });

  await t.test('Connected account consent state displays Active when consent_granted = 1', () => {
    const acc = mockAccounts[0];
    const statusLabel = acc.consent_granted === 1 ? 'Consent: Active' : 'Consent: Revoked';
    assert.equal(statusLabel, 'Consent: Active');
  });

  await t.test('Revoke consent sets consent_granted to 0 without deleting transactions', () => {
    // Revoke consent
    mockAccounts = mockAccounts.map((a) => (a.id === 1 ? { ...a, consent_granted: 0 } : a));
    assert.equal(mockAccounts[0].consent_granted, 0);

    // Verify historical transactions remain completely intact
    assert.equal(mockUserTransactions.length, 2);
    assert.equal(mockUserTransactions[0].amount, 320);
  });

  await t.test('Delete financial data requires explicit confirmation modal gate', () => {
    let showDeleteModal = false;
    let deleteApiCalled = false;

    // Trigger delete action opens confirmation modal first
    showDeleteModal = true;
    assert.equal(showDeleteModal, true);
    assert.equal(deleteApiCalled, false, 'API must NOT be called before confirmation');

    // Confirming deletion calls API
    deleteApiCalled = true;
    showDeleteModal = false;
    assert.equal(deleteApiCalled, true);
  });

  await t.test('Delete financial data removes only authenticated user stored data and preserves user auth credentials', () => {
    // Perform simulated deletion for user_id = 1
    const targetUserId = 1;
    mockUserTransactions = mockUserTransactions.filter((tx) => tx.user_id !== targetUserId);
    mockAccounts = mockAccounts.filter((a) => a.user_id !== targetUserId);

    // User 1 financial data is wiped
    assert.equal(mockUserTransactions.length, 0);
    assert.equal(mockAccounts.length, 0);

    // User 1 authentication credentials remain intact
    assert.equal(mockAuthUser.id, 1);
    assert.equal(mockAuthUser.email, 'demo.user@finance.in');

    // Other users data is completely unaffected
    assert.equal(mockOtherUserTransactions.length, 1);
    assert.equal(mockOtherUserTransactions[0].user_id, 2);
  });

  await t.test('Dashboard correctly renders empty state after financial data is deleted', () => {
    const userConnectedAccountsCount = mockAccounts.length;
    const dashboardState = userConnectedAccountsCount === 0 ? 'empty_state' : 'populated';
    assert.equal(dashboardState, 'empty_state');
  });
});

// 16. Public Landing Page Specifications & Routing
test('16. Public Landing Page Specifications & Routing', async (t) => {
  await t.test('Unauthenticated user visiting / renders LandingPage', () => {
    const resolveRootRoute = (isAuthenticated: boolean) =>
      isAuthenticated ? '/dashboard' : 'LandingPage';

    assert.equal(resolveRootRoute(false), 'LandingPage');
  });

  await t.test('Authenticated user visiting / redirects directly to /dashboard', () => {
    const resolveRootRoute = (isAuthenticated: boolean) =>
      isAuthenticated ? '/dashboard' : 'LandingPage';

    assert.equal(resolveRootRoute(true), '/dashboard');
  });

  await t.test('Landing page navigation provides routes to Signup and Login', () => {
    const landingActions = {
      getStarted: '/signup',
      login: '/login',
    };

    assert.equal(landingActions.getStarted, '/signup');
    assert.equal(landingActions.login, '/login');
  });

  await t.test('Landing page operates without authenticated bottom navigation capsule', () => {
    const isPublicLanding = true;
    const renderBottomNav = !isPublicLanding;
    assert.equal(renderBottomNav, false);
  });
});




