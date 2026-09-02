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

export type TransactionType = 'Debit' | 'Credit';

export type AccountType = 'Savings' | 'Credit Card';

export type InsightType = 'Pattern' | 'Recommendation' | 'Alert';

export type Period = 'daily' | 'weekly' | 'monthly';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  monthly_income: number;
  savings_target: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  name: string;
  monthly_income: number;
  savings_target: number;
  created_at: string;
}

export interface ConnectedAccount {
  id: number;
  user_id: number;
  institution_name: string;
  account_number_masked: string;
  account_type: AccountType;
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
  type: TransactionType;
  merchant: string;
  payment_source: PaymentSource;
  category: Category;
  created_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category: Category;
  limit_amount: number;
  created_at: string;
}

export interface AIInsight {
  id: number;
  user_id: number;
  category: string;
  insight_text: string;
  insight_type: InsightType;
  trigger_metric_value: number | null;
  is_dismissed: number;
  generated_at: string;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
