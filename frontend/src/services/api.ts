/// <reference types="vite/client" />
import type {
  ApiResponse,
  AuthResponse,
  ConnectedAccount,
  Period,
  Transaction,
  UPISpendingAnalysisResponse,
  AIInsight,
  BudgetOverview,
  BudgetStatusItem,
  User,
  AnalyticsSummary,
  MonthlyTrendItem,
} from '../types/index.js';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const TOKEN_KEY = 'spend_analysis_token';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY);
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      const errorMessage =
        data.error || data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    return (data.data !== undefined ? data.data : (data as unknown as T)) as T;
  }

  // --- Auth Endpoints ---

  public async signup(params: {
    name: string;
    email: string;
    password: string;
    monthly_income?: number;
    savings_target?: number;
  }): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    this.setToken(result.token);
    return result;
  }

  public async login(params: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const result = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    this.setToken(result.token);
    return result;
  }

  public async logout(): Promise<void> {
    try {
      await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Proceed with local logout regardless of network error
    } finally {
      this.setToken(null);
    }
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me', {
      method: 'GET',
    });
  }

  public async updateProfile(params: {
    name?: string;
    monthly_income?: number;
    savings_target?: number;
  }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  // --- Accounts & Mock AA Endpoints ---

  public async getAccounts(): Promise<{ accounts: ConnectedAccount[] }> {
    return this.request<{ accounts: ConnectedAccount[] }>('/accounts', {
      method: 'GET',
    });
  }

  public async connectMockAccount(institution_name: string): Promise<{
    account: ConnectedAccount;
    message: string;
  }> {
    return this.request<{
      account: ConnectedAccount;
      message: string;
    }>('/accounts/connect-mock', {
      method: 'POST',
      body: JSON.stringify({ institution_name }),
    });
  }

  public async revokeConsent(accountId: number): Promise<{
    account: ConnectedAccount;
    message: string;
  }> {
    return this.request<{
      account: ConnectedAccount;
      message: string;
    }>(`/accounts/${accountId}/revoke-consent`, {
      method: 'POST',
    });
  }

  public async deleteFinancialData(): Promise<{
    success: boolean;
    deletedCount?: { transactions: number; accounts: number };
    message: string;
  }> {
    return this.request<{
      success: boolean;
      deletedCount?: { transactions: number; accounts: number };
      message: string;
    }>('/user/financial-data', {
      method: 'DELETE',
    });
  }

  // --- Analytics & UPI Drill-Down Endpoints ---

  public async getUPIAnalysis(
    period: Period = 'daily',
    date: string = '2026-08-31'
  ): Promise<UPISpendingAnalysisResponse> {
    return this.request<UPISpendingAnalysisResponse>(
      `/analytics/upi?period=${period}&date=${date}`,
      { method: 'GET' }
    );
  }

  public async getTransactions(params?: {
    period?: Period;
    date?: string;
    payment_source?: string;
    category?: string;
  }): Promise<{ transactions: Transaction[] }> {
    const query = new URLSearchParams();
    if (params?.period) query.append('period', params.period);
    if (params?.date) query.append('date', params.date);
    if (params?.payment_source) query.append('payment_source', params.payment_source);
    if (params?.category) query.append('category', params.category);

    const queryString = query.toString();
    const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
    return this.request<{ transactions: Transaction[] }>(endpoint, { method: 'GET' });
  }

  public async getBudgets(date: string = '2026-08-31'): Promise<BudgetOverview> {
    return this.request<BudgetOverview>(`/budgets?date=${date}`, {
      method: 'GET',
    });
  }

  public async updateBudget(category: string, limit_amount: number): Promise<{ budget: BudgetStatusItem; message: string }> {
    return this.request<{ budget: BudgetStatusItem; message: string }>(`/budgets/${encodeURIComponent(category)}`, {
      method: 'PUT',
      body: JSON.stringify({ limit_amount }),
    });
  }

  public async getAnalyticsSummary(
    period: Period = 'monthly',
    date: string = '2026-08-31'
  ): Promise<AnalyticsSummary> {
    return this.request<AnalyticsSummary>(
      `/analytics/summary?period=${period}&date=${date}`,
      { method: 'GET' }
    );
  }

  public async getTrends(): Promise<{ trends: MonthlyTrendItem[] }> {
    const res = await this.request<{ trends: MonthlyTrendItem[] }>('/analytics/trends', {
      method: 'GET',
    });
    const normalized = (res.trends || []).map((t) => ({
      ...t,
      month: t.month,
      month_name: t.month_name || (typeof t.month === 'string' ? t.month : ''),
      expenses: Number(t.total_expenses ?? t.expenses ?? 0),
      total_expenses: Number(t.total_expenses ?? t.expenses ?? 0),
      income: Number(t.total_income ?? t.income ?? 0),
      total_income: Number(t.total_income ?? t.income ?? 0),
      savings: Number(t.savings ?? 0),
    }));
    return { trends: normalized };
  }

  public async getInsights(): Promise<{ insights: AIInsight[] }> {
    return this.request<{ insights: AIInsight[] }>('/insights', {
      method: 'GET',
    });
  }

  public async dismissInsight(id: number): Promise<{ insight: AIInsight }> {
    return this.request<{ insight: AIInsight }>(`/insights/${id}/dismiss`, {
      method: 'POST',
    });
  }
}

export const api = new ApiService();

