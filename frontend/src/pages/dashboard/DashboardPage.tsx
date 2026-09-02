import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { EmptyDashboard } from '../../components/dashboard/EmptyDashboard.js';
import { PaymentSourceDrillDownSheet } from '../../components/dashboard/PaymentSourceDrillDownSheet.js';
import type {
  Period,
  PaymentSource,
  UPISpendingAnalysisResponse,
  AIInsight,
  BudgetPlanComparison,
} from '../../types/index.js';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#EF4444',
  Shopping: '#3B82F6',
  Transport: '#10B981',
  Bills: '#F59E0B',
  Subscriptions: '#8B5CF6',
  Entertainment: '#EC4899',
  Health: '#14B8A6',
  Investments: '#6366F1',
  Education: '#F97316',
  Other: '#8E9192',
};

export const DashboardPage: React.FC = () => {
  const { user, hasConnectedAccount, accounts } = useAuth();
  const [period, setPeriod] = useState<Period>('daily');
  const [analyticsData, setAnalyticsData] = useState<UPISpendingAnalysisResponse | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedPaymentSource, setSelectedPaymentSource] = useState<PaymentSource | null>(null);

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const loadDashboardData = useCallback(async () => {
    if (!hasConnectedAccount || accounts.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [upiResponse, insightsResponse] = await Promise.all([
        api.getUPIAnalysis(period, '2026-08-31'),
        api.getInsights(),
      ]);

      setAnalyticsData(upiResponse);
      setInsights(insightsResponse.insights.filter((i) => !i.is_dismissed));
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, [hasConnectedAccount, accounts.length, period]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // If no account connected, render empty state
  if (!hasConnectedAccount || accounts.length === 0) {
    return <EmptyDashboard />;
  }

  if (isLoading && !analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-text-secondary">
        <span className="material-symbols-outlined text-4xl animate-spin text-accent-insight-blue">
          progress_activity
        </span>
        <p className="text-body-sm">Loading your spending analysis...</p>
      </div>
    );
  }

  const totalSpending = analyticsData?.total_spending ?? 0;
  const upiSources = analyticsData?.upi_source_breakdown ?? {
    'Google Pay': 0,
    PhonePe: 0,
    Paytm: 0,
    'Unknown/Other': 0,
  };

  const categoryBreakdown = analyticsData?.category_breakdown ?? {};
  const contributingTransactions = analyticsData?.contributing_transactions ?? [];

  // Robust parsing of plan_comparison (handles array or Record)
  const planComparisonList: BudgetPlanComparison[] = Array.isArray(analyticsData?.plan_comparison)
    ? (analyticsData.plan_comparison as BudgetPlanComparison[])
    : Object.entries(analyticsData?.plan_comparison || {}).map(([category, details]) => {
        const d = details as Record<string, unknown>;
        return {
          category,
          limit_amount: (d.budget_limit ?? d.limit_amount ?? 0) as number,
          actual_month_to_date: (d.actual_month_to_date ?? 0) as number,
          variance: (d.variance ?? 0) as number,
          status: (d.over_budget ? 'over_budget' : (d.status ?? 'under_budget')) as
            | 'over_budget'
            | 'at_budget'
            | 'under_budget',
        };
      });

  // Dynamic Category Calculation & Percentage Formatting
  const categoriesEntries = Object.entries(categoryBreakdown).filter(([, amount]) => amount > 0);
  const totalCatSpend = categoriesEntries.reduce((sum, [, amount]) => sum + amount, 0);

  const formatPercentage = (amount: number, total: number): string => {
    if (total <= 0) return '0%';
    const pct = (amount / total) * 100;
    return pct % 1 === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;
  };

  // Generate Conic Gradient for Donut Chart dynamically from verified database amounts
  let gradientString = '#8E9192 0% 100%';
  if (totalCatSpend > 0) {
    let currentDeg = 0;
    const gradientParts: string[] = [];
    categoriesEntries.forEach(([cat, amount]) => {
      const color = CATEGORY_COLORS[cat] || '#8E9192';
      const pct = (amount / totalCatSpend) * 100;
      const nextDeg = currentDeg + pct;
      gradientParts.push(`${color} ${currentDeg.toFixed(2)}% ${nextDeg.toFixed(2)}%`);
      currentDeg = nextDeg;
    });
    gradientString = gradientParts.join(', ');
  }

  const periodTitle =
    period === 'daily'
      ? 'Daily Spending'
      : period === 'weekly'
      ? 'Weekly Spending'
      : 'Monthly Spending';

  return (
    <div className="flex flex-col flex-1 w-full antialiased pb-12">
      {/* Top App Bar */}
      <header className="flex justify-between items-center w-full px-margin-mobile py-4 bg-background top-0 z-40 sticky">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-border-subtle flex items-center justify-center font-semibold text-text-primary">
            {initial}
          </div>
          <div>
            <p className="text-label-bold font-label-bold text-on-surface-variant">
              Hello, {firstName}
            </p>
            <h1 className="text-headline-md font-headline-md font-bold text-on-surface">
              Spend Analysis
            </h1>
          </div>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-border-subtle text-on-surface scale-95 active:scale-90 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
      </header>

      <main className="px-margin-mobile space-y-6 max-w-4xl mx-auto w-full mt-2">
        {/* Period Selector Segmented Control */}
        <div className="flex bg-surface-container-low p-1 rounded-full border border-border-subtle w-full max-w-sm mx-auto">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`flex-1 text-center py-2 text-label-bold font-label-bold rounded-full transition-all capitalize cursor-pointer ${
                  isActive
                    ? 'text-on-surface bg-surface-container-highest shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Primary Card: Spending Overview */}
        <section className="bg-surface-container rounded-2xl p-6 border border-border-subtle relative overflow-hidden flex flex-col items-center justify-center text-center shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          <p className="text-body-sm font-body-sm text-on-surface-variant mb-2 z-10">
            {periodTitle}
          </p>
          <h2 className="text-display-currency-mobile md:text-display-currency font-display-currency-mobile md:font-display-currency font-bold text-on-surface z-10">
            ₹{totalSpending.toLocaleString('en-IN')}
          </h2>

          {period === 'daily' && (
            <div className="flex items-center gap-2 mt-4 bg-accent-insight-blue/10 px-3.5 py-1.5 rounded-full z-10 border border-accent-insight-blue/20">
              <span className="material-symbols-outlined text-accent-insight-blue text-sm">
                calendar_today
              </span>
              <span className="text-label-bold font-label-bold text-accent-insight-blue">
                August 31, 2026
              </span>
            </div>
          )}

          {period === 'weekly' && (
            <div className="flex items-center gap-2 mt-4 bg-status-error/10 px-3.5 py-1.5 rounded-full z-10 border border-status-error/20">
              <span className="material-symbols-outlined text-status-error text-sm">
                trending_up
              </span>
              <span className="text-label-bold font-label-bold text-status-error">
                ₹1,200 higher than last week
              </span>
            </div>
          )}

          {period === 'monthly' && (
            <div className="flex items-center gap-2 mt-4 bg-status-success/10 px-3.5 py-1.5 rounded-full z-10 border border-status-success/20">
              <span className="material-symbols-outlined text-status-success text-sm">
                savings
              </span>
              <span className="text-label-bold font-label-bold text-status-success">
                August 2026 Spending
              </span>
            </div>
          )}
        </section>

        {/* Where you paid (UPI Sources) - Bento Grid Style */}
        <section className="space-y-3">
          <h3 className="text-headline-md font-headline-md font-semibold text-on-surface">
            Where you paid
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Google Pay Card */}
            <button
              type="button"
              onClick={() => setSelectedPaymentSource('Google Pay')}
              className="bg-surface-container-high rounded-xl p-4 border border-accent-upi-blue border-l-4 text-left transition-transform active:scale-95 hover:bg-surface-bright relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-accent-upi-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent-upi-blue text-sm">
                    account_balance_wallet
                  </span>
                </div>
                <span className="text-label-bold font-label-bold text-on-surface">GPay</span>
              </div>
              <p className="text-headline-md font-headline-md font-bold text-on-surface">
                ₹{upiSources['Google Pay'].toLocaleString('en-IN')}
              </p>
            </button>

            {/* PhonePe Card */}
            <button
              type="button"
              onClick={() => setSelectedPaymentSource('PhonePe')}
              className="bg-surface-container rounded-xl p-4 border border-border-subtle border-l-4 border-l-accent-upi-purple text-left hover:bg-surface-bright transition-all active:scale-95 cursor-pointer relative overflow-hidden group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent-upi-purple text-sm">
                    payments
                  </span>
                </div>
                <span className="text-label-bold font-label-bold text-on-surface">PhonePe</span>
              </div>
              <p className="text-headline-md font-headline-md font-bold text-on-surface">
                ₹{upiSources['PhonePe'].toLocaleString('en-IN')}
              </p>
            </button>

            {/* Paytm Card */}
            <button
              type="button"
              onClick={() => setSelectedPaymentSource('Paytm')}
              className="bg-surface-container rounded-xl p-4 border border-border-subtle border-l-4 border-l-blue-400 text-left hover:bg-surface-bright transition-all active:scale-95 cursor-pointer relative overflow-hidden group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400 text-sm">
                    qr_code_scanner
                  </span>
                </div>
                <span className="text-label-bold font-label-bold text-on-surface">Paytm</span>
              </div>
              <p className="text-headline-md font-headline-md font-bold text-on-surface">
                ₹{upiSources['Paytm'].toLocaleString('en-IN')}
              </p>
            </button>

            {/* Unknown/Other Card (Rendered if amount > 0) */}
            {upiSources['Unknown/Other'] > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPaymentSource('Unknown/Other')}
                className="bg-surface-container rounded-xl p-4 border border-border-subtle border-l-4 border-l-outline text-left hover:bg-surface-bright transition-all active:scale-95 cursor-pointer relative overflow-hidden group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-sm">
                      help_outline
                    </span>
                  </div>
                  <span className="text-label-bold font-label-bold text-on-surface">Other</span>
                </div>
                <p className="text-headline-md font-headline-md font-bold text-on-surface">
                  ₹{upiSources['Unknown/Other'].toLocaleString('en-IN')}
                </p>
              </button>
            )}
          </div>
        </section>

        {/* Spending Categories & Plan Layout (Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Spending Categories Minimal Donut */}
          <section className="bg-surface-container rounded-2xl p-6 border border-border-subtle">
            <h3 className="text-headline-md font-headline-md font-semibold text-on-surface mb-6">
              Categories
            </h3>
            <div className="flex items-center justify-between">
              {/* CSS simulated donut chart */}
              <div
                className="relative w-32 h-32 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: `conic-gradient(${gradientString})` }}
              >
                <div className="absolute w-24 h-24 bg-surface-container rounded-full flex items-center justify-center border border-border-subtle">
                  <span className="text-label-bold font-label-bold text-on-surface">100%</span>
                </div>
              </div>

              {/* Legend with dynamically calculated percentages */}
              <div className="space-y-3 flex-1 ml-6">
                {categoriesEntries.length === 0 ? (
                  <p className="text-body-sm text-text-secondary">No category data for this period.</p>
                ) : (
                  categoriesEntries.slice(0, 4).map(([cat, amount]) => {
                    const color = CATEGORY_COLORS[cat] || '#8E9192';
                    const pctFormatted = formatPercentage(amount, totalCatSpend);
                    return (
                      <div
                        key={cat}
                        className="flex items-center justify-between text-body-sm font-body-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-text-primary">{cat}</span>
                        </div>
                        <span className="text-on-surface font-medium">{pctFormatted}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Spending Plan Progress Bars */}
          <section className="bg-surface-container rounded-2xl p-6 border border-border-subtle flex flex-col gap-5">
            <h3 className="text-headline-md font-headline-md font-semibold text-on-surface">
              Spending Plan
            </h3>
            {planComparisonList.length === 0 ? (
              <p className="text-body-sm text-text-secondary">No spending plans configured.</p>
            ) : (
              planComparisonList.slice(0, 3).map((plan) => {
                const isOver = plan.status === 'over_budget';
                const pct =
                  plan.limit_amount > 0
                    ? Math.min(100, Math.round((plan.actual_month_to_date / plan.limit_amount) * 100))
                    : 100;
                return (
                  <div key={plan.category}>
                    <div className="flex justify-between text-body-sm font-body-sm mb-2">
                      <span className="text-on-surface font-medium">{plan.category}</span>
                      <span
                        className={
                          isOver ? 'text-status-error font-semibold' : 'text-on-surface-variant'
                        }
                      >
                        ₹{plan.actual_month_to_date.toLocaleString('en-IN')} / ₹
                        {plan.limit_amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-bright rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-status-error' : 'bg-status-success'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>

        {/* AI Insights Carousel */}
        {insights.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-md font-headline-md font-semibold text-on-surface">
              Insights
            </h3>
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0 snap-x">
              {insights.map((insight) => {
                const isWarning =
                  insight.insight_type === 'Alert' || insight.category === 'Food_Plan_Exceeded';
                return (
                  <div
                    key={insight.id}
                    className={`min-w-[280px] max-w-[320px] rounded-xl p-4 border snap-center flex items-start gap-3 shadow-sm ${
                      isWarning
                        ? 'bg-status-warning/10 border-status-warning/20'
                        : 'bg-surface-container border-border-subtle'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isWarning ? 'bg-status-warning/20' : 'bg-accent-upi-blue/10'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-sm icon-filled ${
                          isWarning ? 'text-status-warning' : 'text-accent-upi-blue'
                        }`}
                      >
                        {isWarning ? 'warning' : 'lightbulb'}
                      </span>
                    </div>
                    <p
                      className={`text-body-sm leading-snug ${
                        isWarning ? 'text-status-warning' : 'text-on-surface-variant'
                      }`}
                    >
                      {insight.insight_text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Payment Source Drill-Down Bottom Sheet */}
      <PaymentSourceDrillDownSheet
        isOpen={selectedPaymentSource !== null}
        onClose={() => setSelectedPaymentSource(null)}
        paymentSource={selectedPaymentSource}
        period={period}
        totalSourceSpend={
          selectedPaymentSource ? upiSources[selectedPaymentSource] || 0 : 0
        }
        totalPeriodSpend={totalSpending}
        transactions={contributingTransactions}
      />
    </div>
  );
};

export default DashboardPage;
