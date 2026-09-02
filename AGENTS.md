# Spend Analysis — Antigravity CLI Implementation Instructions

## 0. Purpose of this file

This file is the master implementation instruction for the Spend Analysis application.

The repository's `design/` directory contains the finalized Stitch visual references.
The file:

`design/charcoal_precision/DESIGN.md`

is the master DESIGN-v3 technical handover specification.

IMPORTANT:
- Implement the application from the requirements and finalized visual references.
- Do NOT redesign the product.
- Do NOT invent new screens, navigation items, financial figures, or product behavior unless required to make the specified application functional.
- Treat Stitch `code.html` and `screen.png` files as visual implementation references.
- Treat DESIGN-v3 as the requirements/technical source of truth.
- The project has intentionally moved from Claude Code to Antigravity CLI. References inside DESIGN-v3 that say "Claude Code" describe the originally planned implementation role; Antigravity CLI is now the implementation agent.
- Do not silently rewrite DESIGN-v3.

---

# 1. Product

## Product name

Current implementation name:

**Spend Analysis**

A final branding/name pass may happen later. Do not spend implementation time changing old branding strings inside visual references unless required by the current task.

## Product vision

Spend Analysis is an Indian personal-finance / spending-analysis application designed to help users understand their spending.

It is NOT merely an expense logger. Its purpose is to consolidate authorized financial transaction data and turn it into:
- spending analysis
- UPI/payment-source analysis
- category analysis
- merchant analysis
- daily/weekly/monthly trends
- personal spending-plan comparisons
- grounded AI spending insights

Primary market context:
- Indian users
- Indian Rupees (₹)
- Indian merchants and payment sources
- Google Pay, PhonePe, Paytm
- Account Aggregator consent model

---

# 2. Non-negotiable product/security rules

1. Financial data connection must be consent-first.
2. MVP uses a Mock/Sandbox Account Aggregator flow.
3. Never ask for or store banking passwords.
4. Never ask for or store UPI PINs.
5. Do not imply that the MVP has direct live bank/UPI access.
6. Payment source must only be shown when supported by transaction data.
7. If payment source is unavailable, use exactly:
   `Unknown/Other`
8. Never guess a payment source from a merchant name.
9. Keep personal and financial data collection minimal.
10. Implement clear consent revocation.
11. Implement clear financial-data deletion.
12. Consent revocation and data deletion are separate operations.
13. Deleting Spend Analysis financial data must not be represented as deleting records at the bank/UPI provider/AA.
14. Financial data must be protected with secure authentication, secure API communication, and appropriate database protection.
15. AI-generated numerical claims must be grounded in locally calculated data.
16. If a future LLM produces a number that does not match verified local calculations, suppress the insight rather than showing an unverified number.

---

# 3. Design source of truth

Use the following finalized design structure:

```text
design/
├── 01_landing/
│   ├── spend_analysis_refined_mobile_landing_page/
│   └── spend_analysis_refined_desktop_landing_page/
├── 02_authentication/
│   ├── login_mobile_app/
│   └── signup_premium_soft_charcoal_refinement/
├── 03_onboarding/
│   ├── profile_setup_mobile_app/
│   ├── connect_financial_account_refined_spacing/
│   ├── account_aggregator_consent_mobile/
│   └── account_connected_success_mobile_onboarding/
├── 04_dashboard/
│   ├── spend_analysis_dashboard/
│   └── spend_analysis_dashboard_empty_state/
├── 05_analytics/
│   ├── spend_analysis_analytics_mobile/
│   └── analytics_accurate_monthly_trend_bars/
├── 06_transactions/
│   ├── transactions_mobile_ledger/
│   ├── transactions_desktop_ledger/
│   └── transaction_detail_tea_shop_mobile/
├── 07_payment_source/
│   └── dashboard_google_pay_drill_down_sheet_mobile/
├── 08_budget/
│   ├── budget_mobile_spending_plan/
│   └── budget_desktop_spending_plan/
├── 09_ai_insights/
│   ├── ai_insights_mobile_feed/
│   └── ai_insights_desktop_dashboard/
├── 10_settings/
│   ├── settings_privacy_mobile_2/
│   ├── settings_privacy_data_privacy_state_desktop/
│   └── settings_privacy_security_state_desktop_2/
└── charcoal_precision/
    └── DESIGN.md
```

The uploaded source currently contains `DESIGN.md.md`. Rename it to `DESIGN.md` when copying it into the implementation repository. Its content is the DESIGN-v3 specification.

## Canonical visual references

Prefer these finalized folders when duplicate/older variants exist:

- Landing:
  - `spend_analysis_refined_mobile_landing_page`
  - `spend_analysis_refined_desktop_landing_page`
- Auth:
  - `login_mobile_app`
  - `signup_premium_soft_charcoal_refinement`
- Onboarding:
  - `profile_setup_mobile_app`
  - `connect_financial_account_refined_spacing`
  - `account_aggregator_consent_mobile`
  - `account_connected_success_mobile_onboarding`
- Dashboard:
  - `spend_analysis_dashboard`
  - `spend_analysis_dashboard_empty_state`
- Analytics:
  - `spend_analysis_analytics_mobile`
  - `analytics_accurate_monthly_trend_bars`
- Transactions:
  - `transactions_mobile_ledger`
  - `transactions_desktop_ledger`
  - `transaction_detail_tea_shop_mobile`
- Payment source:
  - `dashboard_google_pay_drill_down_sheet_mobile`
- Budget:
  - `budget_mobile_spending_plan`
  - `budget_desktop_spending_plan`
- AI:
  - `ai_insights_mobile_feed`
  - `ai_insights_desktop_dashboard`
- Settings:
  - `settings_privacy_mobile_2`
  - `settings_privacy_data_privacy_state_desktop`
  - `settings_privacy_security_state_desktop_2`

Do not use older duplicate folders as the primary implementation reference when a canonical folder above exists.

---

# 4. Visual system

The app uses a premium **Soft Dark** visual language.

Do NOT use:
- pure black / AMOLED black
- arbitrary bright gradients
- unrelated visual themes
- generic dashboard templates

Current visual baseline:

```text
Page background: approximately #18191F
Elevated surfaces: approximately #202126
Cards / inputs: approximately #292A30
Primary text: approximately #F5F5F5
Secondary text: approximately #A7A8AE
Primary navigation capsule: off-white / white
```

Use the exact values/tokens present in the design references where available. The values above describe the current lighter Soft Dark baseline agreed during visual refinement.

## Navigation

Primary app navigation:

```text
Home | Analytics | Transactions | Budget | Settings
```

There is NO primary "AI Insights" navigation item.

Rules:
- Floating off-white/white horizontal capsule.
- Large rounded corners.
- Subtle outer border.
- Soft 3D/neumorphic shadow.
- Active tab uses a raised white pill with subtle darker outline/shadow.
- Inactive tabs use simple gray icons and labels.
- Only the current primary section changes active state.
- On the dedicated AI Insights screen, no primary nav item should be treated as an AI Insights tab.
- Settings screen: Settings is active.
- Dashboard: Home is active.
- Analytics: Analytics is active.
- Transactions: Transactions is active.
- Budget: Budget is active.

## Safe area / mobile navigation

The floating bottom navigation must never cover page content.

Implement:
- sufficient bottom content padding
- mobile safe-area handling
- appropriate fixed/sticky positioning
- scrolling content that remains visible above the navigation capsule

This is an implementation concern and should be fixed globally rather than redesigning individual screens.

---

# 5. Product flows

## Flow 1 — Onboarding, Signup and Authentication

```text
Landing
  ↓
Signup / Login
  ↓
Profile Setup
  ↓
Dashboard
```

Signup:
- name
- email
- password
- confirm password
- terms/privacy acknowledgement

Profile setup:
- full name
- monthly income (optional)
- savings target (optional)
- INR context
- spending preferences
- Continue / Skip

---

## Flow 2 — Account connection and consent

```text
Dashboard empty state
  ↓
Connect Account
  ↓
Select financial institution
  ↓
Consent
  ↓
Mock/Sandbox AA transition
  ↓
Account Connected success
  ↓
Dashboard
```

MVP institutions shown in the finalized design include mock/demo choices such as:
- HDFC
- ICICI
- SBI

The selected connection must clearly indicate Demo/Sandbox where appropriate.

Consent screen must communicate:
- institution
- Demo/Sandbox context
- data requested
- purpose
- access control
- consent duration
- revocation/control
- privacy information
- explicit approval/decline

---

# 6. Dashboard

Two primary states:

## Empty state

When no account is connected:
- do not show fake financial totals as real user data
- show "No account connected"
- provide Connect Account CTA
- allow a "Maybe later" path
- show non-deceptive previews of what becomes available after connection

## Populated state

Use the canonical dashboard design.

Core dashboard data:
- Total Balance
- Spending for selected period
- Savings / relevant indicators
- Daily / Weekly / Monthly period tabs
- UPI/payment source breakdown
- Category breakdown
- AI insight
- Budget progress
- Recent transactions

Canonical daily example:

```text
Total daily spending = ₹1,240

Google Pay = ₹520
PhonePe = ₹430
Paytm = ₹290
Unknown/Other = ₹0 when there is no unknown amount
```

The dashboard values must be calculated from the database rather than independently hardcoded.

---

# 7. UPI / Payment-source analysis

Core drill-down:

```text
Overall Spending
    ↓
UPI / Payment Source
    ↓
Merchant / Transaction
    ↓
Category
```

Payment sources:
- Google Pay
- PhonePe
- Paytm
- Unknown/Other

The payment-source attribution must be data-driven.

If source data is missing:

```text
Unknown/Other
```

Do not infer it.

## Google Pay canonical example

Google Pay total:

```text
₹520
```

Contributing transactions:

```text
Swiggy       ₹320   Food
City Bus      ₹80   Transport
Local Tea     ₹20   Food
Amazon       ₹100   Shopping
----------------------------
Total        ₹520
```

The mobile interaction is a bottom-sheet drill-down.

Desktop may use a side panel according to DESIGN-v3.

---

# 8. Transactions

Transaction ledger must support:

- date
- description
- amount
- debit/credit
- merchant
- category
- account
- payment source

Categories are strictly:

```text
Food
Shopping
Transport
Bills
Education
Entertainment
Health
Investments
Subscriptions
Other
```

Use deterministic categorization for MVP.

Do not allow arbitrary categories that conflict with the schema.

Transaction detail must expose enough context to understand:
- merchant
- amount
- date
- category
- payment source
- account context where appropriate

---

# 9. Analytics

Support:

```text
Daily
Weekly
Monthly
```

Calculations must be dynamic.

Required metrics:
- total spending
- total income
- total expenses
- savings
- savings rate
- category totals
- merchant totals
- payment-source totals
- month-on-month trends
- budget variance

Core formulas:

```text
Savings = Total Income - Total Expenses

Savings Rate = Savings / Total Income
```

Avoid division by zero.

Time buckets:
- Daily = current calendar date
- Weekly = ISO calendar week, Monday–Sunday
- Monthly = current calendar month

Required visualizations include:
- donut/pie charts
- bar charts
- line charts

Charts must use actual backend data.

---

# 10. Budget

Dedicated Budget screen.

Budget categories may include the specified core envelopes:
- Food
- Transport
- Entertainment
- Shopping

The database also supports all predefined categories.

Show:
- configured plan/limit
- actual spending
- remaining amount OR over-budget amount
- progress indicator

Variance must be dynamically calculated.

```text
Variance = Budget Limit - Actual Spend
```

For an over-budget category, clearly communicate the excess.

Do not hardcode variance independently of transaction data.

---

# 11. AI Insights — MVP

The MVP AI system is deterministic.

Do NOT introduce an external LLM as a dependency for the initial implementation unless explicitly requested.

Generate insights from verified local calculations.

Insight types:

```text
Pattern
Recommendation
Alert
```

## Rule A — Month-on-month category spike

Trigger when:

```text
percentage change > 15%
```

Formula:

```text
((CurrentMonthCategorySpend - PreviousMonthCategorySpend)
 / PreviousMonthCategorySpend) * 100
```

Template:

```text
Your [category] spending increased [X]% compared with last month.
```

Only run when a valid previous-month comparison exists.

---

## Rule B — Weekend concentration

Requirements:
- at least 14 days of transaction history
- weekend share of a category > 55% over the relevant 30-day period

Formula:

```text
Weekend Ratio =
Weekend category spend / Total category spend
```

Template:

```text
Weekend [category] spending is significantly higher than weekday spending.
```

---

## Rule C — Recurring subscriptions

For current month:

```text
Subscription Cost =
sum of debit transactions where category = Subscriptions
```

If > ₹0:

```text
Subscriptions account for ₹[Sum]/month.
```

---

## Rule D — Food-delivery savings recommendation

Trigger when:
- food-delivery/dining merchants such as Swiggy/Zomato exceed 30% of food spending
- user is over budget in Food

Suggested savings:

```text
Food-delivery spend * 0.30
```

Template:

```text
You could reduce monthly spending by approximately ₹[Suggested Savings] by reducing your food-delivery expenses.
```

---

## Rule E — Budget violation

Trigger when:

```text
Actual category spend > configured monthly budget
```

Formula:

```text
Overage = Actual Spend - Budget Limit
```

Template:

```text
You have exceeded your [category] spending plan by ₹[Overage].
```

---

## Rule F — UPI/payment-source distribution

Trigger when a single payment source exceeds:

```text
30% of total period UPI/payment-source spending
```

Formula:

```text
UPI Share =
Source spend / Total UPI source spend
```

Template:

```text
[Payment Source] accounted for [Share]% of your UPI spending this month.
```

Also support grounded daily/source observations such as:

```text
You spent ₹520 through Google Pay today.
```

Every displayed numerical claim must be calculated from the same transaction dataset used by the analytics layer.

---

# 12. AI Insight UI

Dashboard:
- insight carousel / priority stack
- clear icon
- high-contrast text
- context-aware action
- optional dismiss behavior

Dedicated AI Insights screen:
- filter by All Insights / Patterns / Recommendations / Alerts
- insight feed
- detail context
- supporting transactions where relevant
- budget adjustment route/action where relevant

No fake AI claims.

MVP wording should make it clear through product behavior that insights are generated from analyzed transaction data.

---

# 13. Database

Use a relational database suitable for SQLite in MVP.

Core tables:

```text
users
connected_accounts
transactions
budgets
ai_insights
```

## users

```text
id
email
password_hash
name
created_at
updated_at
```

Never store raw passwords.

## connected_accounts

```text
id
user_id
institution_name
account_number_masked
account_type
consent_granted
consent_id
consent_expiry
created_at
```

Account types specified by DESIGN-v3:
- Savings
- Credit Card

## transactions

```text
id
account_id
user_id
transaction_date
description
amount
type
merchant
payment_source
category
created_at
```

`type`:
- Debit
- Credit

`payment_source`:
- Google Pay
- PhonePe
- Paytm
- Unknown/Other

Default:

```text
Unknown/Other
```

## budgets

```text
id
user_id
category
limit_amount
created_at
```

Unique per user/category.

## ai_insights

The DESIGN-v3 AI section expands the AI table with:

```text
id
user_id
category
insight_text
insight_type
trigger_metric_value
is_dismissed
generated_at
```

Insight type:
- Pattern
- Recommendation
- Alert

---

# 14. Seed/demo dataset

Implement a deterministic demo/sandbox dataset so the UI can be fully exercised.

Important daily example date:

```text
2026-08-31
```

Daily total:

```text
₹1,240
```

UPI/payment source totals:

```text
Google Pay  ₹520
PhonePe     ₹430
Paytm       ₹290
```

Google Pay:

```text
Swiggy       ₹320  Food
City Bus      ₹80  Transport
Local Tea     ₹20  Food
Amazon       ₹100  Shopping
```

PhonePe:

```text
Ola Cabs     ₹430  Transport
```

Paytm:

```text
Local Grocer ₹290  Food
```

Monthly target examples from DESIGN-v3 include:

```text
Food          ₹4,500
Shopping      ₹3,200
Transport     ₹1,800
Entertainment ₹1,200
Bills         ₹2,000
```

Historical trend examples:

```text
January  ₹15,000
February ₹17,500
March    ₹14,200
April    ₹19,100
```

Budget examples:

```text
Food          ₹4,000
Transport     ₹2,000
Entertainment ₹1,500
Shopping      ₹2,500
```

Use the full seed dataset in DESIGN-v3 when implementing the database seed.

IMPORTANT:
- Seed data is demo/sandbox data.
- Do not present it as live bank data.
- All dashboard/analytics/AI calculations should derive from the seeded records.

---

# 15. API structure

Implement a clean backend API.

The DESIGN-v3 specification explicitly defines:

```text
GET /api/analytics/upi?period=daily
```

Supported period values:

```text
daily
weekly
monthly
```

The response should provide:
- total spending
- UPI/payment-source breakdown
- category breakdown
- merchant breakdown
- plan comparison
- contributing transactions

Also implement an insights endpoint:

```text
GET /api/insights
```

And the corresponding dismiss behavior where the UI supports dismissing an insight:

```text
POST /api/insights/:id/dismiss
```

Use consistent JSON responses.

Do not expose sensitive authentication information.

---

# 16. Authentication

Implement:
- signup
- login
- authenticated session
- logout
- profile/account configuration

Passwords must be hashed securely.

Do not use demo passwords in production-like code.

For the MVP/demo, make authentication functional rather than relying on hardcoded frontend-only login state.

---

# 17. Account Aggregator mock behavior

The MVP is a simulated AA/Sandbox integration.

Expected behavior:

```text
Select institution
→ review consent
→ approve
→ create connected account
→ import sandbox transactions
→ calculate analytics
→ display populated dashboard
```

Revoke:

```text
Settings
→ Manage Consent
→ Revoke Consent
```

Revoking consent should stop future access/sync behavior for that connected account.

Data deletion:

```text
Settings
→ Delete/Clear Financial Data
→ confirmation
→ delete Spend Analysis-stored financial records
→ log user out / return to appropriate initial state
```

Keep consent revocation logically separate from data deletion.

---

# 18. Implementation architecture

Antigravity should choose a clean, maintainable architecture consistent with the repository and current tooling.

Preferred separation:

```text
frontend/
backend/
```

Responsibilities:

### Frontend
- React UI
- routing
- reusable components
- API client
- state management
- responsive/mobile-first presentation
- charts
- navigation
- loading/error/empty states

### Backend
- authentication
- authorization
- SQLite persistence
- mock AA service
- transaction ingestion
- deterministic categorization
- analytics aggregation
- budget calculations
- AI heuristic engine
- consent state
- data deletion
- API validation

Keep financial calculations in the backend/domain layer rather than duplicating business logic in many UI components.

---

# 19. Calculation integrity

This is critical.

There must be a single source of truth for transaction calculations.

For example:

```text
Google Pay
320 + 80 + 20 + 100 = 520

PhonePe
430 = 430

Paytm
290 = 290

Total
520 + 430 + 290 = 1240
```

If a screen says ₹520, it should come from the same calculation used by:
- dashboard
- analytics
- payment-source drill-down
- transactions
- AI insights

Do not manually hardcode the same number in multiple components.

Create reusable backend/domain calculation functions.

---

# 20. Responsive behavior

This is a mobile-first application.

Priority:
1. Mobile
2. Desktop where a finalized desktop reference exists

Use the exact visual references for each viewport.

Do not create a browser-style desktop dashboard when the reference is mobile.

Do not shrink the desktop UI into an unusable mobile layout.

The landing page has both mobile and desktop references.

Most app screens are mobile-first, with desktop references where included.

---

# 21. Component strategy

Build reusable components rather than duplicating markup.

Likely reusable areas:
- app shell
- floating bottom navigation
- desktop navigation
- page header
- KPI card
- period selector
- payment-source card
- category breakdown
- transaction row
- transaction detail
- budget progress
- insight card
- modal/bottom sheet
- consent section
- settings section
- empty state
- loading state
- error state

Use shared tokens/components so visual refinements can be applied globally.

---

# 22. Do not over-engineer

This is an MVP/demo implementation.

Do not introduce:
- unnecessary microservices
- unnecessary cloud infrastructure
- real bank integrations
- real AA production integrations
- unnecessary external AI services
- complex event buses
- needless dependencies

The first goal is a polished, functional local MVP.

Future production integrations can be added later.

---

# 23. Testing requirements

Before declaring implementation complete, test:

## Authentication
- signup
- duplicate email handling
- login
- invalid credentials
- logout

## Onboarding
- profile setup
- connect account
- consent approval
- consent decline
- successful mock connection

## Financial data
- seed data imports correctly
- transaction totals reconcile
- Unknown/Other fallback works
- no guessed payment source

## Analytics
- daily
- weekly
- monthly
- category aggregation
- merchant aggregation
- payment-source aggregation
- income/expense/savings
- savings rate
- trend data

## Budget
- under budget
- exactly at budget
- over budget
- correct variance

## AI
- each heuristic trigger
- no false insight when prerequisites are missing
- numerical values match local calculations
- insight types valid
- dismiss works

## Privacy
- revoke consent
- blocked future access after revocation
- financial data deletion
- session/logout after deletion
- no banking passwords stored

## UI
- all canonical screens load
- routes work
- bottom nav never covers content
- mobile safe area
- responsive desktop screens
- loading/error/empty states
- no horizontal overflow
- no clipped important content

---

# 24. Implementation order

Follow this order unless there is a technical reason not to:

### Phase 1 — Foundation
1. Inspect repository.
2. Inspect `design/` completely.
3. Read `design/charcoal_precision/DESIGN.md`.
4. Set up project architecture.
5. Set up environment configuration.
6. Set up SQLite.
7. Create schema/migrations.
8. Create seed/demo data.

### Phase 2 — Backend
9. Authentication API.
10. User/profile API.
11. Mock AA connection and consent API.
12. Transaction API.
13. Categorization service.
14. Analytics aggregation service.
15. Budget service.
16. AI heuristic engine.
17. Insights API.
18. Consent revocation.
19. Financial data deletion.

### Phase 3 — Frontend foundation
20. App routing.
21. Auth screens.
22. Shared design tokens.
23. Shared navigation.
24. Shared cards/components.
25. Mobile safe-area handling.

### Phase 4 — Product screens
26. Landing.
27. Login.
28. Signup.
29. Profile setup.
30. Connect Account.
31. Consent.
32. Account Connected.
33. Dashboard empty state.
34. Dashboard populated.
35. Analytics.
36. Transactions.
37. Transaction detail.
38. Payment-source drill-down.
39. Budget.
40. AI Insights.
41. Settings.
42. Settings security/data privacy states.

### Phase 5 — Integration
43. Connect every screen to real backend data.
44. Remove duplicate hardcoded financial values.
45. Validate all calculations.
46. Validate navigation.
47. Validate consent state transitions.

### Phase 6 — QA
48. Run automated tests.
49. Run API tests.
50. Run UI/manual tests.
51. Check responsive behavior.
52. Fix safe-area/navigation overlap.
53. Check accessibility basics.
54. Check security/privacy behavior.
55. Final visual comparison against Stitch references.

### Phase 7 — Final polish
56. Fix only verified mismatches.
57. Do not redesign without a requirement.
58. Perform final branding pass only when explicitly requested.
59. Produce a concise implementation/status report.

---

# 25. Antigravity working rules

When implementing a screen:

1. Find its canonical folder in `design/`.
2. Inspect both `screen.png` and `code.html`.
3. Read the related section in `DESIGN.md`.
4. Implement the visual structure.
5. Connect it to actual application data.
6. Test the interaction.
7. Compare the rendered result to the Stitch reference.
8. Fix implementation differences.
9. Do not alter unrelated screens.

When modifying a shared component:
- check all screens using it
- avoid regressions
- especially check floating navigation on mobile

When requirements conflict:
1. Explicit user instruction in the current task
2. DESIGN-v3 requirements
3. Canonical finalized Stitch screen
4. Existing implementation
5. General engineering convention

If a requirement is genuinely ambiguous, inspect the relevant source files before deciding.

---

# 26. Completion standard

Do NOT report "complete" merely because files compile.

The app is complete only when:
- the specified flows work end-to-end
- the database is functional
- mock AA consent works
- transactions are real database records
- analytics are dynamically calculated
- budgets are dynamically calculated
- AI insights are dynamically calculated
- privacy controls work
- mobile navigation does not cover content
- the implementation visually follows the finalized Stitch references
- tests pass
- no major hardcoded financial calculations remain

At the end, provide:
- architecture summary
- implemented flows
- database summary
- API summary
- tests run/results
- known limitations
- next recommended steps

Do not claim production AA integration, live bank access, or production-grade LLM intelligence unless those have actually been implemented and verified.

---

# 27. First Antigravity task

Before writing application code, perform a repository/design audit.

Tasks:
1. Inspect the current repository.
2. Inspect every directory under `design/`.
3. Read the complete `design/charcoal_precision/DESIGN.md`.
4. Identify the canonical screen reference for every required route/state.
5. Identify duplicate/older visual references and do not use them as canonical.
6. Produce an implementation plan based on this file.
7. Identify any missing technical information that is genuinely required.
8. Do not start large-scale implementation until the audit and plan are complete.

After the audit, proceed through the implementation phases above.

