export interface User {
  id: number;
  email: string;
  name: string;
  monthly_income: number | null;
  savings_target: number | null;
  created_at: string;
  updated_at: string;
}

export type PaymentSource = 'Google Pay' | 'PhonePe' | 'Paytm' | 'Unknown/Other';

export type Category =
  | 'Food'
  | 'Shopping'
  | 'Transport'
  | 'Bills'
  | 'Education'
  | 'Entertainment'
  | 'Health'
  | 'Investments'
  | 'Subscriptions'
  | 'Other';

export interface ConnectedAccount {
  id: number;
  user_id: number;
  institution_name: string;
  account_number_masked: string;
  account_type: 'Savings' | 'Credit Card';
  consent_granted: number;
  consent_id: string;
  consent_expiry: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  user_id: number;
  transaction_date: string;
  description: string;
  amount: number;
  type: 'Debit' | 'Credit';
  merchant: string;
  payment_source: PaymentSource;
  category: Category;
  created_at: string;
  account_name?: string;
  account_masked?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Period = 'daily' | 'weekly' | 'monthly';

export type NavTab = 'home' | 'analytics' | 'transactions' | 'budget' | 'settings';

export interface OnboardingState {
  fullName: string;
  monthlyIncome: string;
  savingsTarget: string;
  selectedPreferences: string[];
  selectedInstitution: string;
  consentGranted: boolean;
}

export interface BudgetPlanComparison {
  category: string;
  limit_amount: number;
  actual_month_to_date: number;
  variance: number;
  status: 'under_budget' | 'at_budget' | 'over_budget';
}

export interface BudgetStatusItem {
  id: number;
  category: Category;
  limit_amount: number;
  actual_spent: number;
  variance: number;
  remaining_amount: number;
  over_budget_amount: number;
  percentage_used: number;
  status: 'under_budget' | 'exact' | 'over_budget';
  created_at: string;
}

export interface BudgetOverview {
  total_budget: number;
  total_spent: number;
  total_variance: number;
  categories: BudgetStatusItem[];
}

export interface UPISpendingAnalysisResponse {
  period: Period;
  startDate: string;
  endDate: string;
  total_spending: number;
  upi_source_breakdown: Record<PaymentSource, number>;
  category_breakdown: Record<string, number>;
  merchant_breakdown: Record<string, number>;
  plan_comparison: BudgetPlanComparison[];
  contributing_transactions: Transaction[];
}

export interface MonthlyTrendItem {
  month: number | string;
  month_name?: string;
  year: number;
  total_expenses?: number;
  total_income?: number;
  expenses: number;
  income?: number;
  savings?: number;
}

export interface AnalyticsSummary {
  period: Period;
  startDate: string;
  endDate: string;
  total_spending: number;
  total_income: number;
  total_expenses: number;
  savings: number;
  savings_rate: number;
  category_breakdown: Record<Category, number>;
  upi_source_breakdown: Record<PaymentSource, number>;
}

export interface AIInsight {
  id: number;
  user_id: number;
  category: string;
  insight_text: string;
  insight_type: 'Pattern' | 'Recommendation' | 'Alert';
  trigger_metric_value: number;
  is_dismissed: number;
  generated_at: string;
}


