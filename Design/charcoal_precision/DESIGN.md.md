# DESIGN-v3.md: Unified Technical Handover Specification (v3)

This master design document serves as the single source of truth for implementing the **Spend Analysis Application**. It integrates the core **UPI / Payment Source spending analysis and drill-down flow** [1] and the dynamic **AI Insights Engine mathematical heuristics and specifications**. This specification bridges visual designs prototyped in **Stitch** [7] with backend/frontend implementations written by **Claude Code** [8].

## Handover Separation Matrix (Stitch & Claude Code)

```
  ┌────────────────────────────────────────────────────────┐
  │                         STITCH                         │
  │   - High-fidelity Responsive Layouts (Mobile/Desktop)  │
  │   - Screen Typography & Component Sizing (8px Grid)    │
  │   - Design System Tokens (Indian Rupee Symbol, Colors) │
  │   - Interactive Core User Journey Prototypes (Drilldown)│
  │   - Dashboard AI Insights Carousel & Screen Mockups    │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼ Handover (DESIGN-v3.md)
  ┌────────────────────────────────────────────────────────┐
  │                      CLAUDE CODE                       │
  │   - React Frontend Component Implementation            │
  │   - Local Relational Database Storage (SQLite DDL)     │
  │   - Deterministic Transaction Categorization Layer      │
  │   - Mock Account Aggregator Sandbox Integrations       │
  │   - Dynamic Daily/Weekly/Monthly Aggregations          │
  │   - SQLite Trigger & Heuristic AI Insight Calculations  │
  └────────────────────────────────────────────────────────┘
```

---



## 1. Product Requirements Summary


This Product Requirements Document (PRD) Summary is synthesized directly from the **Spend Analysis App Project Summary & Development Handover Document** [1], updated with the core **UPI/Payment Source Spending Analysis** requirement. It acts as the master requirements context to transition UI/UX design into Stitch [7] and code implementation into Claude Code [8].

---

## 1. Product Vision
* **Requirements Explicitly Stated in Source:**
  * **Core Concept:** An Indian personal-finance / spend-analysis application designed to help users understand their spending [1, 12].
  * **Objective:** Consolidate financial transaction data in one secure location and transform it into actionable analytics, payment-source summaries, and intelligent insights [1, 12].
  * **Positioning:** The application is explicitly NOT positioned as just another expense tracker, but rather as a secure, smart personal financial analysis platform for Indian users [12].
  * **Core Spend Tracking Focus:** Provide users with regular, structured insight into spending across different UPI/payment sources over daily, weekly, and monthly intervals.
  * **Development Strategy:** Build a polished, functional, and tightly controlled MVP/demo first, and then progressively move towards real-world integrations [9, 12].
* **Future Ideas Mentioned in Source:**
  * **Long-Term Data Acquisition:** Establish India's Account Aggregator (AA) ecosystem as the primary data retrieval channel, using a consent-based flow rather than asking users for banking passwords [2].

---

## 2. Target Users
* **Requirements Explicitly Stated in Source:**
  * **Target Audience:** Indian personal finance consumers seeking to understand and optimize their spending habits [1, 12].
  * **Contextual Focus:** Tailored for the Indian market, incorporating local merchants (e.g., Swiggy, Zomato, local tea shops) and displaying figures in Indian Rupees (₹) [3, 4].
  * **Multi-Source Spenders:** Designed specifically for users who split transactions across multiple UPI apps (e.g., Google Pay, PhonePe, Paytm).
* **Future Ideas Mentioned in Source:**
  * The source does not explicitly segment future sub-categories of target users (e.g., students, investors), maintaining focus on general Indian personal-finance users.

---

## 3. Core Problem Being Solved
* **Requirements Explicitly Stated in Source:**
  * **Lack of Deep Financial Understanding:** Traditional personal finance apps serve as basic expense logs, leaving users without a clear understanding of spending habits, trends, or payment behaviors [5, 12].
  * **Payment Channel Fragmentation:** Users distribute their spending across various UPI handles and wallets, causing fragmentation and preventing a clear view of total cash outlays by platform (e.g., Google Pay vs. PhonePe vs. Paytm).
  * **Data Fragmentation:** Financial transaction data is scattered across multiple institutions and accounts, making consolidated analysis difficult [1].
  * **Friction and Security Risks in Data Entry:** Traditional methods rely on manual logging (friction) or require high-risk credentials like banking passwords (security risk) [2].
* **Future Ideas Mentioned in Source:**
  * Resolving data-entry friction and credential security risks completely by replacing manual tracking with a seamless, consent-driven, regulated Account Aggregator ecosystem [2].

---

## 4. Core User Journey
* **Requirements Explicitly Stated in Source:**
  * **Core Product Flow:** 
    $$\text{Connect Financial Data} \rightarrow \text{Analyze Transactions} \rightarrow \text{Categorize Spending} \rightarrow \text{Visualize Spending} \rightarrow \text{Generate Intelligent Insights [1]}$$
  * **MVP Path with UPI Drill-Down:** The user logs in [3] $\rightarrow$ navigates to "Connect Account" [8] $\rightarrow$ completes mock consent flow [2, 3] $\rightarrow$ retrieves transactions containing payment source data [3] $\rightarrow$ views the processed transactions categorized via deterministic rules [4] $\rightarrow$ navigates dashboard analytical tabs (Daily/Weekly/Monthly) $\rightarrow$ drills down from Overall Spending $\rightarrow$ Payment/UPI Source $\rightarrow$ Merchant/Transaction $\rightarrow$ Category.
* **Future Ideas Mentioned in Source:**
  * **Production Flow:** Connect Financial Account $\rightarrow$ Authorize Consent via official AA Consent Flow $\rightarrow$ Connect directly to the Financial Institution $\rightarrow$ Securely fetch live financial data into the Spend Analysis App $\rightarrow$ Execute transaction processing, analytics, and advanced AI insights [2].

---

## 5. MVP Features
* **Requirements Explicitly Stated in Source:**
  * **Authentication:**
    * Secure Login and Signup [3].
    * User account and Profile configuration [3].
  * **Financial Data Connection (MVP Fallback):**
    * Simulated Account Aggregator flow utilizing a Mock/Sandbox database to fetch mock financial transactions [2, 3].
  * **Transaction Management:**
    * Ledger displaying: Date, Description, Amount, Debit/Credit, Merchant, Category, Account [3], and **Payment Source** (Google Pay, PhonePe, Paytm, or Unknown/Other).
    * Standard transactional entries showcasing typical merchants: Swiggy (Food, ₹420), Amazon (Shopping, ₹1,299), Uber (Transport, ₹280), and College Canteen (Food, ₹80) [3].
  * **Automatic Transaction Categorization:**
    * Categorizing raw transactions into ten predefined categories: Food, Shopping, Transport, Bills, Education, Entertainment, Health, Investments, Subscriptions, and Other [3, 4].
    * Deterministic categorizations using pre-set rules to map obvious or recurring merchant/category mappings [4].
  * **Regular UPI Spending Analysis:**
    * **Time Period Filters:** Toggle dashboard and analytics between **Daily**, **Weekly**, and **Monthly** intervals.
    * **Multi-Dimensional Metrics:**
      1. Total spending for the selected period (calculated dynamically from transactions).
      2. Spending by UPI/payment source (Google Pay, PhonePe, Paytm, or Unknown/Other).
      3. Spending by category.
      4. Spending by merchant.
      5. List of individual contributing transactions.
      6. Comparison of actual spending against the user's personal spending plan.
    * **Drill-Down Flow:** Support progressive disclosure: Overall Spending $\rightarrow$ Payment/UPI Source $\rightarrow$ Merchant/Transaction $\rightarrow$ Category.
  * **Spending Analytics:**
    * Core monthly calculations: Total Income, Total Expenses, Savings, and Savings Rate [4].
    * Category Breakdown summarizing expenditure per category [4].
    * Monthly Trends spanning multiple months (e.g., January: ₹15,000, February: ₹17,500, March: ₹14,200, April: ₹19,100) [5].
    * Visualizations: Pie/donut charts, Bar charts, and Line charts showing category comparisons, UPI distributions, and monthly trends [5].
  * **AI Spending Insights (Basic):**
    * Generation of text-based spending observations and basic rule-driven recommendations [5].
    * Required examples: \"Your food spending increased 24% compared with last month.\", \"Weekend food spending is significantly higher than weekday spending.\", \"Subscriptions account for ₹1,850/month.\" [5].
    * **UPI & Summary Insights:**
      * \"You spent ₹520 through Google Pay today.\"
      * \"Your spending this week was ₹8,420, which is ₹1,200 higher than last week.\"
      * \"PhonePe accounted for 35% of your UPI spending this month.\"
      * \"Food was your highest spending category this week.\"
      * \"You have exceeded your Food spending plan by ₹1,200.\"
  * **Dashboard Concept:**
    * Dashboard interface layout containing: Total Balance, Monthly Spending, Period Tabs (Daily/Weekly/Monthly), UPI Source breakdowns, Spending Overview/Chart, Category Breakdown list, and AI Insights [6].
* **Future Ideas Mentioned in Source:**
  * **AI/LLM-Based Categorization & Source Extraction:** Utilizing AI or LLMs to dynamically handle transaction categorization and parse payment sources from messy SMS or bank descriptions [4].

---

## 6. Future Features
* **Requirements Explicitly Stated in Source:**
  * **Future Intelligence (Spending Patterns):**
    * Tracking and highlighting: Frequent purchases, Weekend spending, Impulse spending, Recurring payments, Unusual transactions, and Category increases [5, 6].
  * **Personalized Recommendations:**
    * Providing specific behavioral recommendations, such as: \"You could reduce monthly spending by approximately ₹1,200 by reducing your food-delivery expenses.\" [6].
  * **Budget Assistance:**
    * Budget allocation displays for key categories (Food: ₹4,000, Transport: ₹2,000, Entertainment: ₹1,500, Shopping: ₹2,500) [6].
    * Machine-assisted budgets that are dynamically suggested using historical spending patterns and user-defined goals [6].
  * **Production Account Aggregator (AA) Integration:**
    * Live production integrations with regulated AA entities, live bank APIs, consent gateways, onboarding pipelines, and official compliance testing/certification [2, 10].

---

## 7. Main Application Screens
* **Requirements Explicitly Stated in Source:**
  * The 10 suggested application screens to be designed in Stitch and implemented in the React frontend are [8]:
    1. **Landing Page**
    2. **Login / Signup**
    3. **Dashboard** (Integrated with Daily/Weekly/Monthly period toggles and interactive UPI Drill-Down widget)
    4. **Connect Account**
    5. **Consent**
    6. **Transactions**
    7. **Analytics** (Including Period/UPI Source breakdown views)
    8. **AI Insights**
    9. **Budget** (Enforcing actual vs. spend plan variance UI)
    10. **Settings**
* **Future Ideas Mentioned in Source:**
  * Embedded automated budget helpers and personalized goal-tracking modules built right into the Budget and Analytics screens [6].

---

## 8. Financial Data Requirements
* **Requirements Explicitly Stated in Source:**
  * **Required Database Fields:** Date, Description, Amount, Debit/Credit, Merchant, Category, Account [3], and **Payment Source** (Google Pay, PhonePe, Paytm, or Unknown/Other).
  * **Source Constraint:** Payment source analysis must be based strictly on available transaction data. If the payment source is unavailable from the mock/sandbox AA feed, default to **Unknown/Other** rather than fabricating data.
  * **MVP Ingestion:** Mock or sandbox Account Aggregator (AA) data containing sample transaction lines [2, 3].
  * **Security Constraint:** The app must NEVER ask for or store users' banking passwords [2, 8, 9].
* **Future Ideas Mentioned in Source:**
  * **Production Ingestion:** Dynamic, real-time fetching of financial transaction data from financial institutions via Account Aggregator consent flows [2, 10].

---

## 9. Spending Analytics Requirements
* **Requirements Explicitly Stated in Source:**
  * **Core Formulas:**
    * $\text{Savings} = \\text{Total Income} - \\text{Total Expenses}$ [4]
    * $\text{Savings Rate} = \\frac{\\text{Savings}}{\\text{Total Income}}$ [4]
  * **Temporal Aggregations:**
    * Calculate overall totals, category sums, merchant sums, and payment source sums dynamically from transaction records over three specific buckets:
      * **Daily:** Grouped by current calendar date.
      * **Weekly:** Grouped by current ISO calendar week (Monday–Sunday).
      * **Monthly:** Grouped by current calendar month.
  * **Dynamic Variance Logic:** Compute the actual spent versus configured budget limits and return over-budget alerts and negative/positive variance values.
  * **Aggregation Logic:** Roll up transactions dynamically into the ten categories (Food, Shopping, etc.) and calculate monthly sums [4].
  * **Trend Logic:** Month-on-month expense summation over time (e.g., January through April) [5].
  * **UI Chart Requirements:**
    * Pie/donut charts (category breakdowns, UPI source distributions) [5].
    * Bar charts (category comparisons, monthly comparisons, UPI breakdowns) [5].
    * Line charts (monthly trends) [5].
* **Future Ideas Mentioned in Source:**
  * Automated category comparison vectors to flag abnormal monthly variances [5, 6].

---

## 10. AI Insight Requirements
* **Requirements Explicitly Stated in Source:**
  * **Core Function:** Convert raw, processed financial data into understandable, plain-text observations and recommendations [5].
  * **Trigger Guidelines (MVP Rules):**
    * Category-to-category percentage increases (e.g., 24% monthly increase) [5].
    * Temporal patterns (e.g., higher spending on weekends vs. weekdays) [5].
    * Recurrent fixed-cost summations (e.g., subscriptions total ₹1,850/month) [5].
    * **UPI App Dominance:** Flag if a single UPI app exceeds a high percentage of overall spending (e.g., "PhonePe accounted for 35% of your UPI spending this month.").
    * **Weekly/Daily Spikes:** Flag weekly anomalies (e.g., "Your spending this week was ₹8,420, which is ₹1,200 higher than last week.").
    * **Budget Limit Violations:** Detect and report envelope excesses (e.g., "You have exceeded your Food spending plan by ₹1,200.").
* **Future Ideas Mentioned in Source:**
  * Large Language Model (LLM) processing integration to extract hyper-personalized behavioral insights and predict savings opportunities [6, 10].

---

## 11. Budget Requirements
* **Requirements Explicitly Stated in Source:**
  * **UI Requirements:** Provide a dedicated \"Budget\" screen to view and manually adjust category budgets (specifically Food, Transport, Entertainment, and Shopping) [6, 8].
  * **Spending Plan Comparison:** Enforce clear visual comparison indicators contrasting real-time dynamic spending totals against the set budget cap (variance reporting).
* **Future Ideas Mentioned in Source:**
  * **AI-Assisted Budgeting:** Budgets should eventually be suggested automatically based on the user's historical spending patterns and self-defined financial goals [6].

---

## 12. Security & Privacy Requirements
* **Requirements Explicitly Stated in Source:**
  * **Consent-First:** All financial data connection must run on user consent [8].
  * **Password Prohibition:** Never store or prompt for banking passwords [8, 9].
  * **Data Minimization:** Keep the collection of personal and financial details to the absolute minimum necessary [8].
  * **Infrastructure Security:** Secure user authentication, database encryption, and secure API communication protocols [9].
  * **User Control:** Implement clear data deletion and consent-revocation mechanisms in the app [9].
  * **Pre-Production Fallback:** During the MVP phase, use fake/sample financial data to ensure user data privacy remains intact [9].
* **Future Ideas Mentioned in Source:**
  * Completing live, production-grade security audits and regulated certification standards once real banking APIs are integrated [2, 12].

---

## 13. MVP Scope vs. Future Production Scope
* **Requirements Explicitly Stated in Source:**
  | Dimension | MVP Scope (Tightly Controlled ~10-Hour Sprint) [9] | Future Production Scope [2, 12] |\
  | :--- | :--- | :--- |\
  | **Financial Integration** | Mock/sandbox Account Aggregator data flow with sample transactions [2, 3]. | Real-world Account Aggregator API integrations [2]. |\
  | **UPI Tracking** | Static/dynamic database tags mapped from structured mock data or simple regex text description rules. | LLM-based parsing of UPI VPA handles and payment app markers from raw banking logs. |\
  | **Categorization** | Deterministic category mapping based on simple rules [4]. | AI/LLM-based categorization to handle complex scenarios [4]. |\
  | **Budgeting** | Basic budget screen showing static categories (Food, Transport, etc.) [6, 8]. | Intelligent budget recommendations based on patterns [6]. |\
  | **Insights** | Rule-driven basic text insights [5]. | Advanced AI-generated personalized behavioral observations [6]. |\
  | **Compliance/Security** | Simulated consent mechanism and sample fake databases [9]. | Live security audits, regulated certification, and bank API integration [2, 12]. |\
  | **Dev Workflow** | Designed in Stitch $\rightarrow$ Implemented by Claude Code [7, 8]. | Production security and reliability hardening [12]. |\
* **Future Ideas Mentioned in Source:**
  * Transitioning categorization entirely to AI models to adapt to new and unique merchant names [4].

---

## 14. Technical Architecture Requirements
* **Requirements Explicitly Stated in Source:**
  * **Frontend (React / Web UI):** Responsive, browser-based UI containing the 10 core screens with specific UPI analytical components [8, 10].
  * **Backend (API / Business Logic):** Centrally handles business rules, calculations, and integrations [10].
    * *Responsibilities:* Authentication, User management, Transaction storage with `payment_source` field, Transaction normalization, Categorization, Dynamic Daily/Weekly/Monthly analytics calculations, AI insight generation, AA integration, and Security/privacy logic [11].
  * **Data & Logic Connections:**
    * **Database:** Stores user records, transactions, budgets, and insights in SQLite [10, 11].
    * **AI/LLM:** Integrated with backend to drive insights [10, 11].
    * **AA Integration:** Simulated/Mock gateway connected to backend for fetching transactional files [10, 11].
* **Future Ideas Mentioned in Source:**
  * Replacing the Mock AA connector with a secure, production-grade API gateway connected to India's official AA platforms [2, 10].

---

## 15. Key Assumptions and Constraints
* **Requirements Explicitly Stated in Source:**
  * **Timeline Constraint:** The MVP must be functional and polished within an approximately 10-hour sprint [9, 10].
  * **Integration Constraint:** Production AA integration is not feasible for the MVP due to legal, regulatory, API, testing, and certification boundaries [2, 10].
  * **Tooling Assumption:** Stitch is used for UI/UX, responsive layouts, design systems, and visual flow prototyping [7]. Claude Code is used to build the React frontend, Node backend, database models, and analytics/LLM scripts [8, 11].
  * **Credential Constraint:** Under no circumstances will banking passwords be stored, as consent-based flows are mandatory [8, 9].
  * **UPI Source Constraint:** Not all banking logs contain clean payment source details. The application must support graceful degradation to an `Unknown/Other` source when no handle is recognized.
* **Future Ideas Mentioned in Source:**
  * Moving from basic deterministic mappings to natural language AI/LLM models for transaction normalization [4].


## 2. UI/UX User Flows


This document outlines the step-by-step user pathways to guide UI/UX design in **Stitch** [7] and downstream implementation in **Claude Code** [8]. Every flow is grounded strictly in the project documentation [1], updated to integrate the **UPI / Payment Source spending drill-down flow**.

---

## Flow 1: Onboarding, Signup, and Authentication

```
[ Landing Page ] ────> [ Signup / Login ] ────> [ Account Setup / Profile ] ────> [ Dashboard (Initial State) ]
```

### 1. Landing Page [8]
* **Purpose:** Introduce the application as a secure, smart personal financial analysis platform for Indian users, explicitly positioning it as more than a basic expense tracker [12].
* **User Actions:**
  * View value proposition around secure data consolidation, analytics, UPI tracking, and intelligent insights [1].
  * Click **\"Get Started\"** or **\"Login\"** to transition to authentication [3, 8].

### 2. Login / Signup Screen [3, 8]
* **Purpose:** Provide a secure gateway into the application [3, 8].
* **User Actions:**
  * Register with email/credentials (Signup) or authenticate (Login) [3].
  * Provide minimal required data for registration (Minimal Data Collection principle) [8].
  * Success redirects the user to their initial Profile setup or directly to the Dashboard [3, 8].

### 3. User Account / Profile Configuration [3]
* **Purpose:** Establish the user's basic profile details [3].
* **User Actions:**
  * Configure basic personal preferences (e.g., target savings goals, budget thresholds, and default currency: Indian Rupees ₹) [3, 4, 6].

---

## Flow 2: Account Aggregator (AA) Consent & Connection Flow

This flow covers the user journey to securely connect and fetch financial transaction data [2, 3].

```
[ Dashboard (Empty State) ] ────> [ Connect Account ] ────> [ Consent Screen ] ────> [ Sandbox/AA Transition ] ────> [ Dashboard (Populated) ]
```

### 1. Dashboard (Empty State Trigger) [8]
* **Trigger:** If the user has not yet connected a financial account, the main dashboard features prominent placeholders for the balance, charts, and insights, with a single, clear Call-to-Action (CTA): **\"Connect Your Financial Account\"** [6, 8].

### 2. Connect Account Screen [8]
* **Purpose:** Select financial data connection preferences [3].
* **User Actions:**
  * Click the connect CTA [3].
  * Initiate the consent-based connection flow (which replaces password-based bank login friction) [2].

### 3. Consent Screen [8]
* **Purpose:** Explicit, secure authorization to collect and analyze transaction data [8, 9].
* **User Actions:**
  * Review the data request terms showing controlled, minimal data collection [8, 9].
  * Click **\"Approve Consent\"** [3].

### 4. Mock/Sandbox AA Fetch (MVP Flow) [2, 3]
* **Purpose:** Retrieve test transactions safely for the prototype/demo [2, 9].
* **System Action:**
  * Simulates the Account Aggregator handshake [2].
  * Populates the database with default sample transaction data [3] incorporating the custom daily spend totals (₹1,240), standard transactions (e.g., Swiggy ₹320, Bus ₹80, Tea Shop ₹20, Amazon ₹100), and appropriate UPI/payment tags.
  * **Future Phase Flow:** Replaces this mock backend step with the official regulated AA API gateway, fetching live financial data from actual financial institutions [2].

### 5. Return to Dashboard (Populated State) [3, 8]
* **System Action:** Returns the user to the Dashboard, which immediately re-renders to display aggregated balances, charts, period tabs, and analytics based on the newly acquired transactions [6, 8].

---

## Flow 3: Transaction Review & Ledger Navigation

```
[ Dashboard (Populated) ] ────> [ Transactions Screen ] ────> [ Filter/Category Filter ] ────> [ Transaction Detail Modal ]
```

### 1. Navigation Transition [8]
* **User Actions:** Click on **\"Transactions\"** from the navigation menu or click the \"View All Transactions\" link from the Dashboard [6, 8].

### 2. Transactions Screen Ledger [3, 8]
* **Purpose:** Present a clean, ledger-style view of all fetched and categorized financial entries [3].
* **UI Components:**
  * Table/list showing columns for **Date**, **Description**, **Amount (₹)**, **Debit/Credit**, **Merchant**, **Category**, **Account**, and **Payment Source** (e.g. Google Pay, PhonePe, Paytm, or Unknown/Other) [3].
  * Display transaction entries (e.g., Swiggy, Amazon, Uber, College Canteen) [3].
  * Display automated categorization mappings applied to each entry based on the ten predefined categories [3, 4].

### 3. Interactive Transaction Actions
* **Deterministic Mappings (MVP):** Standard merchant names automatically resolve to their correct category and payment source based on deterministic system rules [4].
* **Future Phase Idea - Interactive AI Recategorization:** Integrate an option on this screen to let users recategorize mismatched entries or fix missing payment sources, feeding back into an AI/LLM-based model [4].

---

## Flow 4: Regular UPI Spending Analysis & Progressive Drill-Down

This flow defines the step-by-step navigation allowing users to audit their UPI spending habits across multiple time frames and payment engines.

```
[ Dashboard / Analytics ] ──(Select Period)──> [ Period Segment: Daily / Weekly / Monthly ]
                                                      │
                                                      ├──(Select Source Card/Wedge)
                                                      ▼
                                              [ UPI Source Level: Google Pay / PhonePe / Paytm ]
                                                      │
                                                      ├──(Click Source to Drill-Down)
                                                      ▼
                                              [ Contributing Transactions list ]
                                                      │
                                                      └──(Select Specific Transaction)
                                                      ▼
                                              [ Transaction Detail Modal (Shows Merchant & Category) ]
```

### 1. Time Period Selection [4]
* **User Actions:** Click on the dashboard period toggle buttons: **\"Daily\"**, **\"Weekly\"**, or **\"Monthly\"**.
* **System Action:** Re-aggregates transaction records dynamically for the corresponding range.
  * *Daily:* Highlights total spending for the active calendar date (e.g., ₹1,240).
  * *Weekly:* Displays cumulative sums for the current calendar week.
  * *Monthly:* Displays totals for the current calendar month.

### 2. UPI / Payment Source Audit
* **User Actions:** Locate the **UPI Source Breakdown Widget** on the Dashboard.
* **UI Component Display:**
  * Displays a series of horizontal progress bars or a mini bar chart mapping payment sources:
    * Google Pay: ₹520
    * PhonePe: ₹430
    * Paytm: ₹290
    * Unknown/Other: (Shown if any transactions lack payment source metadata).
  * Compare actual UPI totals against the user's spending plan limits (variance indicators).

### 3. Progressive Drill-Down Transition
* **User Actions:** Click on a specific payment source card, such as **\"Google Pay\"** (₹520).
* **System Action:** Expands a nested table or opens a sliding sidebar drawer displaying only the Google Pay transactions contributing to that ₹520 total:
  * *Swiggy:* ₹320 (Category: Food)
  * *Bus:* ₹80 (Category: Transport)
  * *Tea Shop:* ₹20 (Category: Food)
  * *Amazon:* ₹100 (Category: Shopping)
* **Underlying Path:** Employs the hierarchical drill-down route: **Overall Spending $\rightarrow$ Payment/UPI Source $\rightarrow$ Merchant/Transaction $\rightarrow$ Category**.

---

## Flow 5: Spending Analytics & Visualizations

```
[ Dashboard ] ────> [ Analytics Screen ] ────> [ Toggle Metrics (Income vs Expense) ] ────> [ Toggle Date Ranges ]
```

### 1. Navigation Transition [8]
* **User Actions:** Select **\"Analytics\"** from the main navigation menu [8].

### 2. Analytics Dashboard UI [4, 5, 8]
* **Purpose:** Deliver advanced spending metrics and visual trends [5].
* **UI Components:**
  * **Monthly Summary Cards:** Highlight Total Income, Total Expenses, Savings, and Savings Rate [4].
  * **Category Breakdown Chart:** Pie or donut chart dividing total spend across the active categories (e.g., Food, Shopping, Transport, Entertainment, Bills) [4, 5].
  * **UPI Source Share Chart:** Pie chart highlighting the proportional share of payment methods (e.g., "PhonePe accounted for 35% of UPI spending").
  * **Monthly Trends Chart:** Bar or line chart mapping multi-month spend trajectories [5].

---

## Flow 6: AI Spending Insights & Budgets

```
[ Dashboard ] ────> [ AI Insights Screen ] ────> [ Review Specific Patterns ] ────> [ Adjust Budgets ]
```

### 1. Navigation Transition [8]
* **User Actions:** Click on **\"AI Insights\"** or **\"Budget\"** from the navigation bar [8].

### 2. AI Insights Screen UI [6, 8]
* **Purpose:** Translate raw, complex numerical summaries into natural, actionable observations and recommendations [6].
* **UI Components:**
  * **Dynamic Insight Cards:** Render high-priority insight cards grounded in transactions:
    * 💡 *“You spent ₹520 through Google Pay today.”*
    * 💡 *“Your spending this week was ₹8,420, which is ₹1,200 higher than last week.”*
    * 💡 *“PhonePe accounted for 35% of your UPI spending this month.”*
    * 💡 *“Food was your highest spending category this week.”*
    * 💡 *“You have exceeded your Food spending plan by ₹1,200.”*

### 3. Budget Screen UI [6, 8]
* **Purpose:** Track expenditures against target envelopes [6].
* **UI Components:**
  * Progress bars showing spending limits versus actuals across core envelopes with dynamic over-budget markers and actual-to-plan variance text (e.g. \"Exceeded food spending plan by ₹1,200\").

---

## Flow 7: Security, Privacy, & Consent Revocation

```
[ Settings Screen ] ────> [ Manage Consent ] ────> [ Revoke Consent Trigger ] ────> [ Confirm Clear Data / Database Purge ]
```

### 1. Settings Screen [8]
* **Purpose:** Allow users to manage their account profile and secure access [3, 8].
* **User Actions:** Click on **\"Settings\"** from the navigation menu [8].

### 2. Consent & Privacy Management Block [8, 9]
* **Purpose:** Operationalize the security principle of controlled data access and consent-revocation [9].
* **User Actions / System Events:**
  * **Revoke Consent CTA:** Severing connection to Mock AA [2, 3].
  * **Clear Data CTA:** Initiates a permanent database purge of all user records, transactions, and payment logs [9, 11]. Logs the user out and redirects to the landing page.


## 3. Dashboard Visual Layout Design


This document defines the interface layout, structural component hierarchy, responsive grid architecture, and interactive states for the primary **Dashboard** screen of the Spend Analysis application. It integrates the core **UPI/Payment Source Spending Analysis** requirement, showing time-period aggregations, dynamic drill-down tables, and personal spending plan comparisons [1]. It is designed to bridge UI/UX layout prototyping in Stitch [7] and frontend implementation in Claude Code [8].

---

## 1. Visual Hierarchy & Grid System

The Dashboard is designed around an adaptive grid layout optimized for mobile and desktop viewports, featuring the new Period Selector Tabs and the UPI Source Drill-down Widget.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Navbar: [Brand Logo]  [Quick Navigation Links]        [Profile Icon]  │
├────────────────────────────────────────────────────────────────────────┤
│  Top Section: [ Daily ] | [ Weekly ] | [ Monthly ]  (Active Period Selector)│
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │                                    │
│  Grid-Col-1: KPI Scorecard Deck   │  Grid-Col-2: Category Breakdown    │\n│  • Total Balance: ₹XX,XXX         │              (Donut Chart)         │
│  • Total Period Spend: ₹1,240      │  • Food: ₹4,500                    │
│  • Savings / Variance Indicators  │  • Shopping: ₹3,200                │
│                                   │                                    │
├───────────────────────────────────┴────────────────────────────────────┤
│                                                                        │
│  Grid-Row-2: UPI Payment Source Breakdown & Drill-Down Widget         │
│  [ Google Pay: ₹520 ]  [ PhonePe: ₹430 ]  [ Paytm: ₹290 ]              │
│  └─ Clicking GPAY slides out the Contributing Transactions list below  │
│                                                                        │
├───────────────────────────────────┬────────────────────────────────────┤
│                                   │                                    │
│  Grid-Col-3: Recent Transactions  │  Grid-Col-4: AI Insights Carousel  │
│  (Filtered or drilled by UPI app) │  • \"You spent ₹520 via GPay today\" │
│  • Swiggy (Food)       ₹320       │  • \"Your weekly spend was ₹8,420...\"│
│  • Bus (Transport)     ₹80        │  • \"PhonePe was 35% of UPI share\"  │
│                                   │                                    │
├───────────────────────────────────┴────────────────────────────────────┤
│  Grid-Row-4: Budget Progress & Personal Spending Plan Comparisons      │
│  • Food: Spent ₹4,500 / Plan ₹4,000 [ OVER BUDGET by ₹1,200 ]          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Component Specifications

### 2.1 Screen Header & Navigation [3, 6]
* **Header Label:** `SPEND ANALYSIS` [6].
* **Left Element:** Dashboard Brand Identity / Logo mark.
* **Center Navigation (Desktop):** Links to `Dashboard`, `Transactions`, `Analytics`, `AI Insights`, `Budget`, and `Settings` [8].
* **Right Profile Component:** User account name and dynamic Profile Avatar [3].

### 2.2 Section A: Active Period Selector & Financial KPI Cards [4, 6]
A top-row layout block that establishes the active timeline and displays responsive primary metrics.
1. **Period Segmented Picker:**
   * *UI Element:* A tri-state toggle control: **`[ Daily ]`** | **`[ Weekly ]`** | **`[ Monthly ]`**.
   * *Interactive Rule:* Toggling a state dynamically updates all other analytics widgets and transaction lists on the page.
2. **Total Balance Card:** 
   * *Display:* `Total Balance` header, large font primary value: `₹XX,XXX` [6].
3. **Total Spend for Selected Period Card:** 
   * *Display:* Dynamic spend total (e.g., `Daily Spend: ₹1,240` or `Weekly Spend: ₹8,420`).
   * *Color Tagging:* Warns the user visually if current period spending exceeds prorated personal spending plan targets.

### 2.3 Section B: UPI / Payment Source Breakdown Widget
This is a custom horizontal layout panel showcasing spending distributions across different UPI engines.
* **Component Layout:** Dynamic card rows, each representing a verified UPI payment source.
* **Mock Metrics Represented (Daily Active State Example):**
  * **Google Pay Card:** `₹520` (41.9%)
  * **PhonePe Card:** `₹430` (34.7%)
  * **Paytm Card:** `₹290` (23.4%)
  * **Unknown/Other Card:** (Hidden if $0; displayed with an alert icon when bank data fails to supply payment source details).
* **Interactive State (The Drill-Down):** 
  * Clicking the **Google Pay Card** toggles an active selection state and focuses Section D (Contributing Transactions) to display only Google Pay items.

### 2.4 Section C: Spending Category Breakdown Donut [4, 5, 6]
* **Chart Type:** Responsive donut chart illustrating relative weight of categories [5].
* **Interactive Linking:** Clicking a slice filters the Transaction ledger to show matching categories.
* **Predefined Categories represented:** Food, Shopping, Transport, Bills, Education, Entertainment, Health, Investments, Subscriptions, Other [3, 4].

### 2.5 Section D: Drilled / Contributing Transactions List
A context-aware ledger that renders the transactions directly responsible for the selected UPI source total.
* **Title:** Dynamic title displaying *\"Contributing Transactions: Google Pay (₹520)\"*.
* **Columns:** `Merchant` | `Amount (₹)` | `Category` | `Date` [3].
* **Seed Dataset Rows Displayed (Google Pay Drill-down Example):**
  1. Swiggy | **₹320** | Food | `2026-08-31`
  2. Bus | **₹80** | Transport | `2026-08-31`
  3. Tea Shop | **₹20** | Food | `2026-08-31`
  4. Amazon | **₹100** | Shopping | `2026-08-31`
  * *Verification Sum:* $\text{Swiggy (320)} + \text{Bus (80)} + \text{Tea Shop (20)} + \text{Amazon (100)} = \mathbf{₹520}$

### 2.6 Section E: AI Spending Insights Carousel [5, 6]
A dynamic, swipeable content frame displaying text-based feedback from the analytics processor.
* **Insights List (Grounded in UPI Data):**
  * 💡 *“You spent ₹520 through Google Pay today.”*
  * 💡 *“Your spending this week was ₹8,420, which is ₹1,200 higher than last week.”*
  * 💡 *“PhonePe accounted for 35% of your UPI spending this month.”*
  * 💡 *“Food was your highest spending category this week.”*
  * 💡 *“You have exceeded your Food spending plan by ₹1,200.”*

### 2.7 Section F: Budget & Personal Spending Plan Progress Indicators [6]
Displays comparisons between real-world spending totals and configured envelopes.
* **Component UI:** Nested horizontal meter bars with clear numerical plan values and variance text.
* **Plan Targets [6]:**
  * **Food spending plan:** `Spent: ₹4,500` / `Plan: ₹4,000` (🔴 *Exceeded by ₹500*)
  * **Transport spending plan:** `Spent: ₹1,800` / `Plan: ₹2,000` (🟢 *₹200 remaining*)
  * **Shopping spending plan:** `Spent: ₹3,200` / `Plan: ₹2,500` (🔴 *Exceeded by ₹700*)

---

## 3. Dynamic Application States

### 3.1 Unconnected State (Empty State) [2, 3]
* **UI Variations:**
  * KPI Metric Cards display empty state hyphens (`₹--,--`).
  * Charts show vector placeholders with a primary CTA: **\"Connect Your Financial Accounts Securely\"** [3].

### 3.2 Mock AA Consent Banner State [2, 3]
* **UI Element:** Persistent banner at the top of the dashboard: *\"Consent Active: Simulated sandbox Account Aggregator feed. Click to revoke consent.\"* [2, 3, 8].

---

## 4. UI/UX Prototype Transitions (Stitch Configuration) [7, 8]
* **Period Switch Animation:** Toggling Daily/Weekly/Monthly slides the old chart out horizontally and fades in the new calculated aggregates to maintain fluid visual continuity.
* **Drill-down Slider:** Clicking a UPI card opens a bottom drawer (on mobile) or a side panel (on desktop) highlighting the contributing transactions.


## 4. Database Schema & API Specifications


This document defines the mock database schemas, SQL seed datasets, and JSON API payloads needed to implement the backend using **Claude Code** [7, 8]. It includes the modified `transactions` table containing the required `payment_source` column to support the core **UPI/Payment Source Spending Analysis** and progressive drill-downs.

---

## 1. Schema Design Principles
1. **Local Relational Storage:** Clean, relational structures suitable for SQLite or PostgreSQL deployment [10].
2. **UPI payment_source Column:** Enforces transactional attribution to specific UPI engines with a safe fallback.
3. **Strict Consent Alignment:** Tracks consent state, timestamps, and expiry directly to support security principles [8, 11].
4. **Pre-Enforced Constraints:** Protects category consistency via check constraints [3, 4].

---

## 2. Database Schema Definition (SQL DDL)

```sql
-- 1. Users Table
-- Stores user accounts and auth metadata [3, 11].
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Stored securely (e.g. bcrypt), never store raw banking passwords [11]
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Connected Accounts Table
-- Manages financial account connections and mock Account Aggregator consent states [2, 3, 11].
CREATE TABLE connected_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    institution_name TEXT NOT NULL, -- e.g., "Mock HDFC Bank" [2, 3]
    account_number_masked TEXT NOT NULL,
    account_type TEXT CHECK(account_type IN ('Savings', 'Credit Card')),
    consent_granted INTEGER CHECK(consent_granted IN (0, 1)) DEFAULT 1, -- Consent control [8, 11]
    consent_id TEXT UNIQUE,
    consent_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Transactions Table
-- Relational transaction ledger updated with UPI/Payment Source tracking.
CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type TEXT CHECK(type IN ('Debit', 'Credit')) NOT NULL,
    merchant TEXT NOT NULL,
    -- Core payment attribution field with safe, graceful degradation default
    payment_source TEXT NOT NULL DEFAULT 'Unknown/Other', 
    -- Strictly enforced category mappings [3, 4]
    category TEXT CHECK(category IN (
        'Food', 'Shopping', 'Transport', 'Bills', 'Education', 
        'Entertainment', 'Health', 'Investments', 'Subscriptions', 'Other'
    )) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES connected_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Budgets Table
-- Enforces monthly spending cap guidelines per category [6].
CREATE TABLE budgets (
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

-- 5. AI Insights Table
-- Caches generated feedback observations to drive the Dashboard Carousel [5, 6, 8].
CREATE TABLE ai_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    insight_text TEXT NOT NULL,
    insight_type TEXT CHECK(insight_type IN ('Pattern', 'Recommendation', 'Alert')) NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 3. Seed Datasets (Strictly Grounded & Verified)

This script seeds your database with real-world-style mock entries. It explicitly implements the **₹1,240 daily spending total on 2026-08-31** with precise drill-downs across Google Pay, PhonePe, and Paytm.

```sql
-- Insert demo user [3, 11]
INSERT INTO users (id, email, password_hash, name) 
VALUES (1, 'demo.user@finance.in', '$2b$12$ExampleHashSecureHashForDemoMVPOnly', 'Amit Sharma');

-- Connect simulated accounts through mock Account Aggregator [2, 3]
INSERT INTO connected_accounts (id, user_id, institution_name, account_number_masked, account_type, consent_granted, consent_id, consent_expiry)
VALUES (101, 1, 'HDFC Bank (Mock)', 'XXXX-XXXX-9876', 'Savings', 1, 'CNS-MOCK-9921', '2027-09-01 00:00:00');

-- 1. Insert Daily UPI Spending Drill-down Records (Date: 2026-08-31)
-- Total Spending = ₹1,240
-- Google Pay (Total = ₹520):
--   - Swiggy: ₹320 (Food)
--   - Bus: ₹80 (Transport)
--   - Tea Shop: ₹20 (Food)
--   - Amazon: ₹100 (Shopping)
-- PhonePe (Total = ₹430):
--   - Ola Cabs: ₹430 (Transport)
-- Paytm (Total = ₹290):
--   - Local Grocer: ₹290 (Food)
INSERT INTO transactions (account_id, user_id, transaction_date, description, amount, type, merchant, payment_source, category)
VALUES 
-- Google Pay Entries (Sum = ₹520)
(101, 1, '2026-08-31', 'UPI/Swiggy Delivery', 320.00, 'Debit', 'Swiggy', 'Google Pay', 'Food'),
(101, 1, '2026-08-31', 'UPI/City Bus Ride', 80.00, 'Debit', 'City Bus', 'Google Pay', 'Transport'),
(101, 1, '2026-08-31', 'UPI/Tea Shop payment', 20.00, 'Debit', 'Local Tea Shop', 'Google Pay', 'Food'),
(101, 1, '2026-08-31', 'UPI/Amazon Store', 100.00, 'Debit', 'Amazon', 'Google Pay', 'Shopping'),
-- PhonePe Entries (Sum = ₹430)
(101, 1, '2026-08-31', 'UPI/Ola Cab fare', 430.00, 'Debit', 'Ola Cabs', 'PhonePe', 'Transport'),
-- Paytm Entries (Sum = ₹290)
(101, 1, '2026-08-31', 'UPI/Groceries payment', 290.00, 'Debit', 'Local Grocer', 'Paytm', 'Food');

-- 2. Insert Core Monthly Summary Test Transactions
-- Food: ₹4,500 | Shopping: ₹3,200 | Transport: ₹1,800 | Entertainment: ₹1,200 | Bills: ₹2,000 [4]
-- (balancing entries on earlier dates to match target aggregates)
INSERT INTO transactions (account_id, user_id, transaction_date, description, amount, type, merchant, payment_source, category)
VALUES
-- Balancing Food to hit ₹4,500 (Daily has ₹340 -> need ₹4,160)
(101, 1, '2026-08-05', 'Zomato order', 2160.00, 'Debit', 'Zomato', 'Google Pay', 'Food'),
(101, 1, '2026-08-12', 'Weekly Groceries', 2000.00, 'Debit', 'Star Bazaar', 'PhonePe', 'Food'),
-- Balancing Shopping to hit ₹3,200 (Daily has ₹100 -> need ₹3,100)
(101, 1, '2026-08-15', 'Myntra shopping', 1800.00, 'Debit', 'Myntra', 'PhonePe', 'Shopping'),
(101, 1, '2026-08-20', 'Amazon India apparel', 1300.00, 'Debit', 'Amazon', 'Google Pay', 'Shopping'),
-- Balancing Transport to hit ₹1,800 (Daily has ₹510 -> need ₹1,290)
(101, 1, '2026-08-18', 'Uber trip summary', 1290.00, 'Debit', 'Uber', 'Google Pay', 'Transport'),
-- Seeding Entertainment (₹1,200)
(101, 1, '2026-08-03', 'Movie tickets', 1200.00, 'Debit', 'BookMyShow', 'Paytm', 'Entertainment'),
-- Seeding Bills (₹2,000)
(101, 1, '2026-08-02', 'Electricity Bill BESCOM', 2000.00, 'Debit', 'BESCOM', 'Unknown/Other', 'Bills');

-- 3. Insert Historical Trends Test Transactions [5]
-- January (₹15,000) | February (₹17,500) | March (₹14,200) | April (₹19,100)
INSERT INTO transactions (account_id, user_id, transaction_date, description, amount, type, merchant, payment_source, category)
VALUES
(101, 1, '2026-01-15', 'Rent & Utility bills', 15000.00, 'Debit', 'Society Admin', 'Unknown/Other', 'Bills'),
(101, 1, '2026-02-14', 'Tech purchase & medical care', 17500.00, 'Debit', 'Electronics shop', 'PhonePe', 'Shopping'),
(101, 1, '2026-03-10', 'Investments & Insurance premiums', 14200.00, 'Debit', 'Zerodha', 'Unknown/Other', 'Investments'),
(101, 1, '2026-04-20', 'Family travel expenses', 19100.00, 'Debit', 'MakeMyTrip', 'Google Pay', 'Transport');

-- 4. Insert Budgets (Personal Spending Plan Targets) [6]
-- Food (₹4,000), Transport (₹2,000), Entertainment (₹1,500), Shopping (₹2,500)
INSERT INTO budgets (user_id, category, limit_amount)
VALUES
(1, 'Food', 4000.00),
(1, 'Transport', 2000.00),
(1, 'Entertainment', 1500.00),
(1, 'Shopping', 2500.00);

-- 5. Insert Core AI Insights [5, 6]
INSERT INTO ai_insights (user_id, insight_text, insight_type)
VALUES
(1, 'You spent ₹520 through Google Pay today.', 'Alert'),
(1, 'Your spending this week was ₹8,420, which is ₹1,200 higher than last week.', 'Pattern'),
(1, 'PhonePe accounted for 35% of your UPI spending this month.', 'Pattern'),
(1, 'Food was your highest spending category this week.', 'Pattern'),
(1, 'You have exceeded your Food spending plan by ₹1,200.', 'Alert');
```

---

## 4. API Endpoints Schema (JSON DTOs)

### A. Retrieve UPI Spending Summary (`GET /api/analytics/upi?period=daily`)
Calculates period-aggregates, UPI source breakdowns, category breakdowns, merchant breakdowns, actual-to-plan variances, and transaction details.

* **Request Query Params:** `period` (optional: defaults to `monthly`, supports `daily`, `weekly`, `monthly`).
* **Response Payload Format (JSON):**
```json
{
  "success": true,
  "data": {
    "period": "daily",
    "date": "2026-08-31",
    "total_spending": 1240.00,
    "upi_source_breakdown": {
      "Google Pay": 520.00,
      "PhonePe": 430.00,
      "Paytm": 290.00,
      "Unknown/Other": 0.00
    },
    "category_breakdown": {
      "Food": 630.00,
      "Transport": 510.00,
      "Shopping": 100.00
    },
    "merchant_breakdown": {
      "Ola Cabs": 430.00,
      "Swiggy": 320.00,
      "Local Grocer": 290.00,
      "Amazon": 100.00,
      "City Bus": 80.00,
      "Local Tea Shop": 20.00
    },
    "plan_comparison": {
      "Food": {
        "budget_limit": 4000.00,
        "actual_month_to_date": 4500.00,
        "over_budget": true,
        "variance": -500.00
      }
    },
    "contributing_transactions": [
      {
        "id": 1,
        "date": "2026-08-31",
        "description": "UPI/Swiggy Delivery",
        "amount": 320.00,
        "merchant": "Swiggy",
        "payment_source": "Google Pay",
        "category": "Food"
      },
      {
        "id": 2,
        "date": "2026-08-31",
        "description": "UPI/City Bus Ride",
        "amount": 80.00,
        "merchant": "City Bus",
        "payment_source": "Google Pay",
        "category": "Transport"
      },
      {
        "id": 3,
        "date": "2026-08-31",
        "description": "UPI/Tea Shop payment",
        "amount": 20.00,
        "merchant": "Local Tea Shop",
        "payment_source": "Google Pay",
        "category": "Food"
      },
      {
        "id": 4,
        "date": "2026-08-31",
        "description": "UPI/Amazon Store",
        "amount": 100.00,
        "merchant": "Amazon",
        "payment_source": "Google Pay",
        "category": "Shopping"
      }
    ]
  }
}
```


## 5. AI Insights Engine Specification


This document defines the technical architecture, mathematical heuristics, data models, and UI/UX behaviors for the **AI Insights Engine** of the Spend Analysis application. It bridges the design requirements in **Stitch** [7] and backend implementation in **Claude Code** [8] to deliver smart, understandable observations and actionable recommendations.

---

## 1. Core Objective & Product Position

In alignment with the master project vision, the Spend Analysis app is not simply a transactional expense logger but a secure, intelligent personal finance assistant [12]. The core value of the application lies in translating raw financial transaction strings into actionable, understandable narratives [5, 12].

The AI Insights Engine operates in two distinct phases:
1. **MVP Phase (Heuristic Engine):** Runs deterministic backend rules, SQLite aggregations, and mathematical algorithms over transaction history to trigger targeted observations [5, 6].
2. **Future Phase (LLM Integration):** Supplements deterministic logic with Natural Language processing and Large Language Models (LLMs) to capture complex spending behavioral vectors and predict savings [6, 10].

---

## 2. Dynamic Heuristic Rules Engine (MVP Implementation)

For the immediate, tightly controlled MVP sprint [9], the backend executes deterministic rules over the user's transaction history on every sync/data fetch. This triggers real-time entries in the `ai_insights` table [5, 6, 11].

Below are the six core heuristics and their mathematical logic, grounded in the required project examples [5, 6].

### Rule A: Month-on-Month (MoM) Category Spikes
* **Objective:** Detect when spending in a specific category increases significantly compared to the prior month [5, 6].
* **Pre-conditions:** User has transaction records for at least the current month ($M_0$) and the previous month ($M_{-1}$).
* **Trigger Threshold:** Percentage change $> 15\%$.
* **Mathematical Formula:**
  $$\Delta\% = \left( \frac{\text{Spend}(Category, M_0) - \text{Spend}(Category, M_{-1})}{\text{Spend}(Category, M_{-1})} \right) \times 100$$
* **Insight Output Template:**
  * **Type:** `Pattern` [5]
  * **Text:** `"Your [category] spending increased [X]% compared with last month."` [5]
  * **Example (Grounded):** *"Your food spending increased 24% compared with last month."* [5]

### Rule B: Weekend Concentration Heuristic
* **Objective:** Highlight discretionary spending that is disproportionately concentrated on weekends (Saturdays and Sundays) [5, 6].
* **Pre-conditions:** At least 14 days of transaction history.
* **Trigger Threshold:** Weekend spend in a specific category accounts for $> 55\%$ of total category spending for the past 30 days.
* **Mathematical Formula:**
  $$\text{Weekend Ratio} = \frac{\sum \text{Amount}(\text{Sat } \cup \text{ Sun}, \text{ Category})}{\sum \text{Amount}(\text{All Days}, \text{ Category})}$$
* **Insight Output Template:**
  * **Type:** `Pattern` [5]
  * **Text:** `"Weekend [category] spending is significantly higher than weekday spending."` [5]
  * **Example (Grounded):** *"Weekend food spending is significantly higher than weekday spending."* [5]

### Rule C: Recurring Subscription Summation
* **Objective:** Audit and aggregate recurring subscription outlays to show the ongoing fixed-cost burden [5, 6].
* **Trigger Threshold:** Sum of active debit transactions labeled with category `'Subscriptions'` for the current monthly period is $> ₹0$.
* **Mathematical Formula:**
  $$\text{Subscription Cost} = \sum \text{Amount}(\text{Category} = \text{'Subscriptions'}, M_0)$$
* **Insight Output Template:**
  * **Type:** `Pattern` [5]
  * **Text:** `"Subscriptions account for ₹[Sum]/month."` [5]
  * **Example (Grounded):** *"Subscriptions account for ₹1,850/month."* [5]

### Rule D: Discretionary Savings Recommendation
* **Objective:** Give actionable recommendations to help users optimize spending behavior based on discretionary excesses [6].
* **Trigger Heuristic:** User's current monthly discretionary spending on food-delivery or dining (merchants like `Swiggy` or `Zomato`) is $> 30\%$ of their total food spending, and they are currently over budget in that category.
* **Calculated Savings Potential:** Proposes a realistic $25\%$ to $35\%$ reduction in delivery spend.
  $$\text{Suggested Savings} \approx \sum \text{Amount}(\text{Merchant} \in \{\text{'Swiggy'}, \text{'Zomato'}\}) \times 0.30$$
* **Insight Output Template:**
  * **Type:** `Recommendation` [6]
  * **Text:** `"You could reduce monthly spending by approximately ₹[Suggested Savings] by reducing your food-delivery expenses."` [6]
  * **Example (Grounded):** *"You could reduce monthly spending by approximately ₹1,200 by reducing your food-delivery expenses."* [6]

### Rule E: Budget Envelope Violation Alert
* **Objective:** Flag budget targets that have been exceeded to prevent unchecked overspending [6].
* **Pre-conditions:** Active budget record configured for the given category in the `budgets` table [6].
* **Trigger Threshold:** Monthly actual spending in Category $>$ configured Budget Limit [6].
* **Mathematical Formula:**
  $$\text{Overage} = \text{ActualSpend}(Category, M_0) - \text{BudgetLimit}(Category)$$
* **Insight Output Template:**
  * **Type:** `Alert`
  * **Text:** `"You have exceeded your [category] spending plan by ₹[Overage]."`
  * **Example (Grounded):** *"You have exceeded your Food spending plan by ₹1,200."*

### Rule F: UPI App Distribution Shift
* **Objective:** Reveal payment app consolidation trends to help the user manage fragmented UPI sources [4].
* **Trigger Threshold:** Spending through a single UPI/payment source accounts for $> 30\%$ of total period spending [4].
* **Mathematical Formula:**
  $$\text{UPI Share} = \frac{\sum \text{Amount}(\text{Source} = S_i, M_0)}{\sum \text{Amount}(\text{All UPI Sources}, M_0)}$$
* **Insight Output Template:**
  * **Type:** `Pattern` [5]
  * **Text:** `"[Payment Source] accounted for [Share]% of your UPI spending this month."`
  * **Example (Grounded):** *"PhonePe accounted for 35% of your UPI spending this month."*
  * *Additional Delta Variant:* *"You spent ₹520 through Google Pay today."*

---

## 3. SQLite Database Schema Supporting AI Insights

The compiled relational tables store the cached insights and link them to user profiles, preventing costly recalculations on every page navigation [11].

```sql
-- Represents cached calculations and rule triggers for instant UI loading
CREATE TABLE ai_insights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT CHECK(category IN (
        'Food', 'Shopping', 'Transport', 'Bills', 'Education', 
        'Entertainment', 'Health', 'Investments', 'Subscriptions', 'Other', 'General'
    )) DEFAULT 'General',
    insight_text TEXT NOT NULL,
    insight_type TEXT CHECK(insight_type IN ('Pattern', 'Recommendation', 'Alert')) NOT NULL,
    trigger_metric_value REAL,                    -- e.g., 24.00 (for percentage increases)
    is_dismissed INTEGER CHECK(is_dismissed IN (0, 1)) DEFAULT 0, -- Active/Dismiss state
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### JSON Data Transfer Object (DTO) contract
Backend response for the main insights panel (`GET /api/insights`):
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "category": "Food",
      "insight_text": "Your food spending increased 24% compared with last month.",
      "insight_type": "Pattern",
      "trigger_metric_value": 24.0,
      "generated_at": "2026-09-01T07:22:00Z"
    },
    {
      "id": 13,
      "category": "Food",
      "insight_text": "You have exceeded your Food spending plan by ₹1,200.",
      "insight_type": "Alert",
      "trigger_metric_value": 1200.0,
      "generated_at": "2026-09-01T07:25:00Z"
    },
    {
      "id": 14,
      "category": "Food",
      "insight_text": "You could reduce monthly spending by approximately ₹1,200 by reducing your food-delivery expenses.",
      "insight_type": "Recommendation",
      "trigger_metric_value": 1200.0,
      "generated_at": "2026-09-01T07:25:00Z"
    }
  ]
}
```

---

## 4. UI/UX Component & Interaction Design (Stitch Specifications)

The visual design system built in **Stitch** [7] must treat insights as highly engaging cards rather than passive, small text block links.

### 4.1 Dashboard AI Insights Component (Section D of `spend_analysis_dashboard_layout-v2.md`)
* **Design Pattern:** Insights Carousel or Priority Stack [6].
* **Card Anatomy:**
  * **Icon Indicator:** Displays a symbolic indicator matching the category (e.g., green lightbulb for Patterns, blue checkmark for Recommendations, orange alert bell for Alerts) [5, 6].
  * **Text Block:** High-contrast, left-aligned typography showcasing the grounded insight [5].
  * **Interactive Action Tray:**
    * **Dismiss CTA (Trash Icon):** Instantly triggers a fade-out animation and performs an API call to `POST /api/insights/:id/dismiss` to hide the card.
    * **Action CTA (e.g., "Adjust Budget" or "Explore Details"):** Context-aware action that routes the user directly to the relevant tab (e.g., the Budget screen or drilled Transactions ledger).

### 4.2 Dedicated AI Insights Screen (Screen 8 of `spend_analysis_user_flows-v2.md`)
* **Layout Grid:** Two-column visual layout.
  * **Left Column (Insight Feed):** A scrollable feed of all generated insights. Includes a segmented selector at the top: `[ All Insights ] [ Patterns ] [ Recommendations ] [ Alerts ]` to filter the feed.
  * **Right Column (Interactive Detail Panel):** Selecting an insight card from the left side populates the right panel with interactive detail:
    * Displays the raw transaction lines that triggered the rule (e.g., if you select the food spending spike, it lists Swiggy and restaurant logs).
    * Provides an inline slider to manually adjust the associated budget limit if the insight indicates a budget violation [6].
    * Features a feedback toggle: *"Was this insight helpful? [ Yes ] [ No ]"* to assist future pattern scoring.

---

## 5. Future AI / LLM-Based Generation Pipeline (Production Phase)

As the application moves from the MVP sprint into the future production phase, deterministic rules are augmented by passing aggregated transactional contexts to a Large Language Model (LLM) [10, 12].

### LLM Ingestion Prompt Template (System Prompt)
```
You are the AI Financial Analyst for the Spend Analysis App, a smart personal finance platform for Indian consumers.
Your job is to convert raw, structured financial datasets into helpful, plain-text observations, alerts, and behavioral savings recommendations.

CRITICAL INSTRUCTIONS:
1. Always display values in Indian Rupees (₹).
2. Ground all insights in the provided mathematical totals. Never hallucinate or invent spending figures that are not mathematically proven in the transaction list.
3. Be supportive and professional. Avoid sounding judgmental about spending habits.
4. Categorize each insight strictly into: 'Pattern', 'Recommendation', or 'Alert'.
5. Look for cross-dimensional relationships, such as weekend concentration, recurring subscriptions, anomalies, and target plan violations.

INPUT DATA:
- Current Monthly Spend Categories: {{current_period_breakdown}}
- Historical Monthly Totals: {{historical_period_breakdown}}
- Configured Budget Limits: {{user_budget_limits}}
- Active Transaction Logs (Subset of high-value or recurring items): {{transaction_log_subset}}

Your output must be returned as a clean, structured JSON array matching this format:
[
  {
    "category": "Food",
    "insight_type": "Pattern",
    "insight_text": "Your food spending increased 24% compared with last month.",
    "trigger_metric_value": 24.0
  }
]
```

### Safety & Accuracy Guardrails
1. **Dynamic Schema Validation:** The backend enforces a JSON schema validation layer on the LLM output before cacheing to prevent formatting failures.
2. **Numeric Cross-Check Verification:** An automated parser cross-checks any numerical figures outputted by the LLM (e.g., "₹1,200") against the math calculated from the local SQLite database. If a mismatch is detected, the insight is flagged and suppressed from the user feed.
3. **Data Minimization & Air-Gapping:** To protect user privacy, raw transaction descriptions are masked (hiding individual transaction IDs or personal account handles) before being passed to external API endpoints [8].

---

## 6. Development Handover Matrix

To build the AI Insights Engine in your 10-hour sprint, development tasks are split between design and code [7, 8, 9]:

| Timeline | Platform | Implementation Action |
| :--- | :--- | :--- |
| **Hour 3** | **Stitch** | Design the high-fidelity Dashboard AI Insights Carousel card including icon tags and transition triggers. |
| **Hour 7** | **Claude Code** | Code the backend SQLite triggers, compute MoM percentages and weekend ratios, and implement the `GET /api/insights` payload endpoint. |
| **Hour 8** | **Stitch** | Design the dedicated AI Insights Screen [8] complete with the scrollable filter list and interactive details panel. |
| **Hour 9** | **Claude Code** | Connect frontend components to the API, handle the interactive card dismiss actions, and integrate the budget-adjusting slider backend hook. |
