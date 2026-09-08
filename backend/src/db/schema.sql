-- Spend Analysis SQLite Database Schema
-- Master Specification: DESIGN-v3.md / AGENTS.md

PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    monthly_income DECIMAL(10, 2) DEFAULT 0.00,
    savings_target DECIMAL(10, 2) DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Connected Accounts Table (Account Aggregator Integration & Consent Lifecycle)
CREATE TABLE IF NOT EXISTS connected_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    institution_name TEXT NOT NULL,
    account_number_masked TEXT NOT NULL,
    account_type TEXT CHECK(account_type IN ('Savings', 'Credit Card')) NOT NULL DEFAULT 'Savings',
    consent_granted INTEGER CHECK(consent_granted IN (0, 1)) DEFAULT 1,
    consent_id TEXT UNIQUE NOT NULL,
    consent_expiry DATETIME NOT NULL,
    provider_id TEXT NOT NULL DEFAULT 'mock',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Transactions Table (Deterministic Categorization & Payment Source)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT CHECK(type IN ('Debit', 'Credit')) NOT NULL DEFAULT 'Debit',
    merchant TEXT NOT NULL,
    payment_source TEXT CHECK(payment_source IN ('Google Pay', 'PhonePe', 'Paytm', 'Unknown/Other')) NOT NULL DEFAULT 'Unknown/Other',
    category TEXT CHECK(category IN (
        'Food', 'Shopping', 'Transport', 'Bills', 'Education', 
        'Entertainment', 'Health', 'Investments', 'Subscriptions', 'Other'
    )) NOT NULL,
    external_transaction_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Budgets Table (Category Envelope Spending Plans)
CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT CHECK(category IN (
        'Food', 'Shopping', 'Transport', 'Bills', 'Education', 
        'Entertainment', 'Health', 'Investments', 'Subscriptions', 'Other'
    )) NOT NULL,
    limit_amount DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. AI Insights Table (Cached Grounded Heuristic Observations)
CREATE TABLE IF NOT EXISTS ai_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT CHECK(category IN (
        'Food', 'Shopping', 'Transport', 'Bills', 'Education', 
        'Entertainment', 'Health', 'Investments', 'Subscriptions', 'Other', 'General'
    )) DEFAULT 'General',
    insight_text TEXT NOT NULL,
    insight_type TEXT CHECK(insight_type IN ('Pattern', 'Recommendation', 'Alert')) NOT NULL,
    trigger_metric_value REAL,
    is_dismissed INTEGER CHECK(is_dismissed IN (0, 1)) DEFAULT 0,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
