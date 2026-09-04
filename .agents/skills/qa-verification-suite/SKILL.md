---
name: qa-verification-suite
description: >-
  Provides the Spend Analysis project's regression-testing and verification
  procedures, preserving the established 79-test backend suite, 79-point E2E
  QA suite, frontend checks, production builds, financial reconciliation,
  security checks, and deployment verification gates.
---

# QA Verification Suite Runbook

## 1. Quality Gates & Regression Standards

The Spend Analysis application enforces strict quality gates across all modifications. Every phase must achieve a 100% pass rate before work is considered complete.

```text
+-------------------------------------------------------------------------------+
| Spend Analysis Verification Pipeline                                          |
|                                                                               |
|  [1. Frontend Typecheck]  -->  tsc --noEmit (0 errors)                        |
|  [2. Frontend Build]      -->  vite build (dist/ generated, clean assets)     |
|  [3. Backend Unit Tests]  -->  run_tests.ts (79/79 Passed)                    |
|  [4. E2E QA Suite]        -->  e2e_qa_verification.ts (79/79 Passed)          |
|  [5. Financial Reconcil]  -->  Deterministic calculations match database     |
|  [6. Security Audit]      -->  Zero secret leakage & strict RLS validation    |
+-------------------------------------------------------------------------------+
```

### Regression Policy:
- **Zero-Tolerance on Regressions**: Any failure in the established test suites is an immediate **STOP** condition.
- **Root-Cause Resolution**: Never modify or weaken test assertions simply to make a failing test pass. The underlying bug must be diagnosed and resolved cleanly.

---

## 2. Core Test Commands

### A. Frontend Verification
```bash
# Strict TypeScript compilation check across all modules
npm run typecheck --prefix frontend

# Production Vite bundle generation
npm run build --prefix frontend
```
**Passing Criteria**: 0 compiler errors, production bundle generated in `frontend/dist/` with valid asset hashes.

### B. Backend Domain & Integration Tests
```bash
# Runs the 79 comprehensive backend service tests
npm run test --prefix backend
```
**Passing Criteria**: `TEST RESULTS: 79 PASSED, 0 FAILED` across all 7 domains:
1. Authentication & Profile (8 tests)
2. Connected Accounts & Mock AA (12 tests)
3. Deterministic Categorization (11 tests)
4. Transaction Management (11 tests)
5. Analytics & Calculation Integrity (16 tests)
6. Budget Service (10 tests)
7. AI Insights Engine Heuristics (7 tests)

### C. End-to-End Functional QA Suite
```bash
# Runs the 79 end-to-end integration and reconciliation assertions
npx tsx src/tests/e2e_qa_verification.ts
```
**Passing Criteria**: `QA RESULTS: 79 PASSED, 0 FAILED`.

---

## 3. Financial Reconciliation Ground Truth

All calculations across the Dashboard, Analytics, Transactions, Budgets, Payment-Source drill-downs, and AI Insights must reconcile to the single source of truth:

| Metric / Dimension | Ground Truth Value | Reconciled Breakdown |
| :--- | :--- | :--- |
| **Daily Total Spending (2026-08-31)** | **₹1,240** | Google Pay (₹520) + PhonePe (₹430) + Paytm (₹290) + Unknown (₹0) = ₹1,240 |
| **Google Pay Daily Total** | **₹520** | Swiggy (₹320) + City Bus (₹80) + Local Tea (₹20) + Amazon (₹100) = ₹520 |
| **PhonePe Daily Total** | **₹430** | Ola Cabs (₹430) |
| **Paytm Daily Total** | **₹290** | Local Grocer (₹290) |
| **Daily Category Spending** | **₹1,240** | Food (₹630) + Transport (₹510) + Shopping (₹100) = ₹1,240 |
| **August 2026 Total Expenses** | **₹12,700** | 13 debit records summing to ₹12,700 |
| **August 2026 Monthly Income** | **₹45,000** | Primary salary credit |
| **August 2026 Monthly Savings** | **₹32,300** | ₹45,000 income - ₹12,700 expenses (71.8% savings rate) |
| **Budget Envelope Plan** | **₹12,000** | Food (₹4,000), Transport (₹2,000), Entertainment (₹1,500), Shopping (₹2,500), Bills (₹2,000) |
| **Budget Variance (August)** | **-₹700** | ₹12,000 plan vs ₹12,700 actual spend (Over budget by ₹700) |

---

## 4. Production Database Baseline Counts

The production Supabase PostgreSQL instance maintains the frozen deterministic baseline dataset:

- **`users`**: `1` (Amit Sharma / `demo.user@finance.in`)
- **`connected_accounts`**: `1` (Mock HDFC Bank, Savings)
- **`transactions`**: `18` (6 daily for 2026-08-31, 7 historical August, 4 Jan-Apr 2026)
- **`budgets`**: `5` (Food, Transport, Entertainment, Shopping, Bills)
- **`ai_insights`**: `6` (Grounded deterministic insights)

---

## 5. Security & Isolation Verification Checklist

- [ ] **Frontend Artifact Cleanliness**: Ensure `dist/` contains zero database passwords, JWT secrets, or Supabase service-role keys.
- [ ] **Environment Isolation**: `DATABASE_URL` and `JWT_SECRET` must exist exclusively in backend runtime environments.
- [ ] **Row-Level Security (RLS)**: RLS enabled on all 5 Supabase tables (`users`, `connected_accounts`, `transactions`, `budgets`, `ai_insights`) with zero open/permissive policies.
- [ ] **Password Security**: Zero plaintext passwords stored; all user passwords hashed via `bcrypt` (salt rounds >= 10).
- [ ] **Sensitive Banking Data**: Zero storage or collection of banking passwords or UPI PINs.
- [ ] **Data Isolation**: Deleting or modifying data for User A must never alter or expose records for User B.
- [ ] **Route Protection**: Protected backend routes return HTTP 401 Unauthorized when requested without a valid Bearer JWT.

---

## 6. Android Mobile Application QA Checklist

When verifying the native Android build:

1. **Launch & Packaging**:
   - App launches cleanly without crashing.
   - Package ID matches `in.spendanalysis.app`.
   - App title displayed in launcher matches `Spend Analysis`.
2. **Network & Backend Communication**:
   - Web assets load from local package (`capacitor://localhost`).
   - API calls reach `https://spend-analysis-fhs9.onrender.com/api` over HTTPS.
   - Login, registration, and session token persistence function properly.
3. **UI & Viewport Layout**:
   - Floating bottom navigation capsule is fully visible and elevated.
   - Page content has sufficient bottom padding and does not hide behind the navigation bar.
   - Responsive layout matches the Soft Dark charcoal precision design reference.
4. **Resilience & State Handling**:
   - Offline or network-error states display graceful fallbacks without crashing the WebView.
   - Token expiration cleanly redirects to the login screen.

---

## 7. Phase Completion Report Format

Every task phase must conclude with a standardized summary:

```markdown
### Verification Summary
- **Status**: PASS / FAIL
- **Changed Files**: List of modified / created paths
- **Frontend Typecheck**: 0 errors
- **Frontend Build**: PASS
- **Backend Test Suite**: 79/79 Passed
- **E2E QA Suite**: 79/79 Passed
- **Financial Reconciliation**: Verified (₹1,240 Daily / ₹12,700 Monthly)
- **Security Audit**: Clean (Zero leaked credentials, RLS active)
- **Next Recommended Step**: Explicit transition to next approved phase
```
