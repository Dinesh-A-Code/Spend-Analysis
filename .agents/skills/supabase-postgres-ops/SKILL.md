---
name: supabase-postgres-ops
description: >-
  Provides safe operational procedures for Spend Analysis Supabase PostgreSQL,
  including schema inspection, migrations, RLS verification, connection
  diagnostics, financial reconciliation, backups/checkpoints, and production
  database safety while preserving the application's approved data model.
---

# Supabase PostgreSQL Operations Runbook

## 1. Production Architecture Overview

The Spend Analysis production database is hosted on Supabase PostgreSQL, operating in direct connection with the Node.js/Express backend hosted on Render.

```text
+-------------------------------------------------------------------+
| Node.js / Express Backend (Render Production)                     |
| src/db/database.ts -> pg.Pool (SSL: rejectUnauthorized: false)    |
+---------------------------------+---------------------------------+
                                  | Encrypted TCP (Port 5432 / 6543)
                                  v
+-------------------------------------------------------------------+
| Supabase PostgreSQL (Managed Cloud Instance)                      |
|                                                                   |
| Tables:                                                           |
|  - users                 (Primary identity & auth credentials)    |
|  - connected_accounts    (Account Aggregator mock consent state)  |
|  - transactions          (Debit/Credit transaction ledger)        |
|  - budgets               (Monthly spending envelope limits)       |
|  - ai_insights           (Deterministic heuristic insights)       |
+-------------------------------------------------------------------+
```

---

## 2. Approved Database Schema & Types

| Table Name | Primary Key | Key Columns & Types | Constraints & Foreign Keys |
| :--- | :--- | :--- | :--- |
| **`users`** | `id BIGINT GENERATED ALWAYS AS IDENTITY` | `email TEXT UNIQUE`, `password_hash TEXT`, `name TEXT`, `monthly_income NUMERIC`, `savings_target NUMERIC`, `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ` | Email unique index, valid password hash |
| **`connected_accounts`** | `id BIGINT GENERATED ALWAYS AS IDENTITY` | `user_id BIGINT`, `institution_name TEXT`, `account_number_masked TEXT`, `account_type TEXT`, `consent_granted INTEGER`, `consent_id TEXT`, `consent_expiry TIMESTAMPTZ`, `created_at TIMESTAMPTZ` | `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` |
| **`transactions`** | `id BIGINT GENERATED ALWAYS AS IDENTITY` | `account_id BIGINT`, `user_id BIGINT`, `transaction_date DATE`, `description TEXT`, `amount NUMERIC(12,2)`, `type TEXT`, `merchant TEXT`, `payment_source TEXT`, `category TEXT`, `created_at TIMESTAMPTZ` | `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`, `FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE SET NULL` |
| **`budgets`** | `id BIGINT GENERATED ALWAYS AS IDENTITY` | `user_id BIGINT`, `category TEXT`, `limit_amount NUMERIC(12,2)`, `created_at TIMESTAMPTZ` | `UNIQUE(user_id, category)`, `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` |
| **`ai_insights`** | `id BIGINT GENERATED ALWAYS AS IDENTITY` | `user_id BIGINT`, `category TEXT`, `insight_text TEXT`, `insight_type TEXT`, `trigger_metric_value NUMERIC(12,2)`, `is_dismissed INTEGER`, `generated_at TIMESTAMPTZ` | `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` |

---

## 3. Strict Safety & Production Governance

1. **No Credentials in Code**:
   - `DATABASE_URL` must reside exclusively in backend environment variables.
   - Never print database connection strings, passwords, or hostnames in logs or client-facing responses.
2. **Row-Level Security (RLS) Mandate**:
   - RLS is permanently enabled on all five tables.
   - Direct anonymous access is rejected (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
   - The Express backend interacts with the database via authenticated pool connections.
3. **No Destructive Operations**:
   - Never run `DROP TABLE`, `TRUNCATE`, or unconstrained `DELETE` commands against the production database without formal approval.
   - Revoking consent (`consent_granted = 0`) must never delete historical transactions.
   - Financial data deletion (`deleteFinancialData`) purges financial records for the requesting user while preserving their user record and never affecting other users.
4. **Deterministic Calculation Reconciliations**:
   - Database operations must preserve the established Spend Analysis dataset:
     - Row counts: 1 user, 1 account, 18 transactions, 5 budgets, 6 AI insights.
     - Daily spend (2026-08-31): `₹1,240`
     - August debits total: `₹12,700` (13 records)
     - August budget total: `₹12,000`

---

## 4. Schema Migration & Maintenance Runbook

When applying database schema updates, follow this phased protocol:

```text
[1. Inspect Schema] -> [2. Plan Minimal DDL] -> [3. Execute DDL] -> [4. Verify Constraints & RLS] -> [5. Reconcile Totals] -> [6. Run Test Suite]
```

### Procedure:
1. **Inspect Current Schema**: Verify existing tables, indexes, and column types.
2. **Prepare Migration Script**: Write reversible, explicit SQL statements using standard PostgreSQL DDL.
3. **Execute via Backend Client**: Run migration using the secure database adapter (`backend/src/db/database.ts`).
4. **Verify RLS & Indices**: Ensure any new tables have RLS enabled and required foreign keys/indices configured.
5. **Reconcile Row Counts**: Verify that user accounts, transactions, and budgets match ground-truth assertions.
6. **Run Full Regression Suite**:
   ```bash
   npm run test --prefix backend
   npx tsx src/tests/e2e_qa_verification.ts
   ```

---

## 5. Connection Diagnostics & Troubleshooting

| Diagnostic Area | Common Symptom | Investigation & Remediation |
| :--- | :--- | :--- |
| **Authentication / Access** | `password authentication failed` | Verify database credentials configured in Render dashboard / backend environment variables. Do not log plaintext passwords. |
| **SSL / TLS Termination** | `self-signed certificate in certificate chain` | Ensure connection pool uses `{ ssl: { rejectUnauthorized: false } }` for cloud PostgreSQL compatibility. |
| **Connection Pooling** | `remaining connection slots are reserved` | Verify `pg.Pool` configuration (`max: 10`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`). |
| **Missing Tables / Schema** | `relation "..." does not exist` | Run schema verification query. Ensure initial schema migration (`CREATE TABLE IF NOT EXISTS`) was applied. |
| **RLS Policy Rejections** | Query returns 0 rows unexpectedly | Check table RLS status and verify queries are executed with appropriate role/permissions. |
| **Health Check Endpoint** | `/api/health` returns `connected: false` | Check database connectivity logs and verify host reachability. |
