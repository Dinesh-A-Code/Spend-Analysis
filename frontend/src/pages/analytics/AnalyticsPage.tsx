import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import type {
  Period,
  UPISpendingAnalysisResponse,
  MonthlyTrendItem,
  AIInsight,
} from '../../types/index.js';

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#3B82F6',
  Shopping: '#8B5CF6',
  Transport: '#10B981',
  Bills: '#F59E0B',
  Subscriptions: '#EC4899',
  Entertainment: '#6366F1',
  Health: '#14B8A6',
  Investments: '#10B981',
  Education: '#F97316',
  Other: '#8E9192',
};

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('monthly');
  const [analyticsData, setAnalyticsData] = useState<UPISpendingAnalysisResponse | null>(null);
  const [trends, setTrends] = useState<MonthlyTrendItem[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const [upiRes, trendsRes, insightsRes] = await Promise.all([
        api.getUPIAnalysis(period, '2026-08-31'),
        api.getTrends(),
        api.getInsights(),
      ]);

      setAnalyticsData(upiRes);
      setTrends(trendsRes.trends || []);
      setInsights(insightsRes.insights.filter((i) => !i.is_dismissed));
    } catch {
      // Graceful error fallback
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const totalSpending = analyticsData?.total_spending ?? 0;
  const upiSources = analyticsData?.upi_source_breakdown ?? {
    'Google Pay': 0,
    PhonePe: 0,
    Paytm: 0,
    'Unknown/Other': 0,
  };

  const categoryBreakdown = analyticsData?.category_breakdown ?? {};
  const categoriesEntries = Object.entries(categoryBreakdown).filter(([, amount]) => amount > 0);
  const totalCatSpend = categoriesEntries.reduce((sum, [, amount]) => sum + amount, 0);

  const formatPercentage = (amount: number, total: number): string => {
    if (total <= 0) return '0%';
    const pct = (amount / total) * 100;
    return pct % 1 === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;
  };

  // Build Conic Gradient for Donut Chart
  let gradientString = '#3B82F6 0% 100%';
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

  // Max value for bar chart proportional height
  const maxTrendExpense =
    trends.length > 0
      ? Math.max(1, ...trends.map((t) => Number(t.expenses ?? t.total_expenses ?? 0)))
      : 20000;

  const getMonthName = (trend: MonthlyTrendItem): string => {
    if (trend.month_name) return trend.month_name;
    if (typeof trend.month === 'string' && isNaN(Number(trend.month))) return trend.month;
    const mNum = typeof trend.month === 'number' ? trend.month : parseInt(String(trend.month), 10);
    const names = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return names[(mNum || 1) - 1] || 'Month';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food':
        return 'restaurant';
      case 'Shopping':
        return 'shopping_bag';
      case 'Transport':
        return 'directions_car';
      case 'Bills':
        return 'receipt';
      case 'Subscriptions':
        return 'subscriptions';
      case 'Entertainment':
        return 'movie';
      case 'Health':
        return 'favorite';
      case 'Investments':
        return 'trending_up';
      case 'Education':
        return 'school';
      default:
        return 'category';
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full antialiased pb-12">
      {/* Top App Bar */}
      <header className="flex justify-between items-center w-full px-margin-mobile py-4 bg-background top-0 z-40 sticky border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-border-subtle flex items-center justify-center font-semibold text-text-primary">
            {initial}
          </div>
          <div>
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

      <main className="px-margin-mobile md:px-margin-desktop py-6 max-w-7xl mx-auto space-y-6 w-full">
        {/* Header Section */}
        <div className="space-y-1">
          <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">
            Analytics
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Understand your spending patterns
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex bg-surface-container p-1 rounded-xl max-w-sm">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => {
            const isActive = period === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2 font-label-bold text-label-bold rounded-lg transition-colors capitalize cursor-pointer ${
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

        {isLoading && !analyticsData ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-text-secondary">
            <span className="material-symbols-outlined text-4xl animate-spin text-accent-insight-blue">
              progress_activity
            </span>
            <p className="text-body-sm">Calculating analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Total Spent Overview Card */}
            <div className="col-span-1 md:col-span-12 bg-surface-container-low rounded-2xl border border-border-subtle p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
              <div>
                <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-1">
                  Total spent
                </h3>
                <div className="font-display-currency-mobile md:font-display-currency text-display-currency-mobile md:text-display-currency font-bold text-on-surface">
                  ₹{totalSpending.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full border border-border-subtle">
                <span className="material-symbols-outlined text-status-warning text-sm icon-filled">
                  arrow_upward
                </span>
                <span className="font-label-bold text-label-bold text-status-warning">12.4%</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant ml-0.5">
                  vs last month
                </span>
              </div>
            </div>

            {/* Category Breakdown Donut */}
            <div className="col-span-1 md:col-span-6 bg-surface-container-low rounded-2xl border border-border-subtle p-6 shadow-sm">
              <h3 className="font-headline-md text-headline-md font-semibold text-text-primary mb-6">
                Where your money went
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div
                  className="w-36 h-36 rounded-full flex items-center justify-center shrink-0 shadow-sm relative"
                  style={{ background: `conic-gradient(${gradientString})` }}
                >
                  <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center border border-border-subtle">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">
                      100%
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  {categoriesEntries.length === 0 ? (
                    <p className="text-body-sm text-text-secondary">No category expenses found.</p>
                  ) : (
                    categoriesEntries.map(([cat, amount]) => {
                      const color = CATEGORY_COLORS[cat] || '#8E9192';
                      const pctFormatted = formatPercentage(amount, totalCatSpend);
                      return (
                        <div
                          key={cat}
                          className="flex justify-between items-center text-body-sm font-body-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-text-primary">{cat}</span>
                          </div>
                          <span className="text-on-surface-variant font-medium">
                            {pctFormatted}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Spending Trend (Accurate Multi-Month Trend Bars) */}
            <div className="col-span-1 md:col-span-6 bg-surface-container-low rounded-2xl border border-border-subtle p-6 flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
                  Spending trend
                </h3>
                <span className="text-metadata text-metadata text-text-secondary">
                  Jan – Apr 2026
                </span>
              </div>
              <div className="flex-1 flex items-end justify-between gap-3 h-44 pt-4 border-b border-border-subtle pb-2">
                {trends.length === 0 ? (
                  <p className="text-body-sm text-text-secondary m-auto">No historical trends available.</p>
                ) : (
                  trends.slice(0, 5).map((trend, idx) => {
                    const expenseVal = Number(trend.expenses ?? trend.total_expenses ?? 0);
                    const heightPct = Math.max(
                      15,
                      Math.round((expenseVal / maxTrendExpense) * 100)
                    );
                    const monthName = getMonthName(trend);
                    const isLatest = idx === trends.length - 1 || monthName === 'April';
                    const shortMonth = monthName.slice(0, 3);
                    return (
                      <div key={`${trend.year}-${trend.month}-${idx}`} className="flex flex-col items-center gap-2 flex-1 group">
                        <span className="text-[10px] font-metadata text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{(expenseVal / 1000).toFixed(1)}k
                        </span>
                        <div className="w-full h-32 flex items-end justify-center">
                          <div
                            className={`w-full max-w-[40px] rounded-t-md transition-all duration-300 ${
                              isLatest
                                ? 'bg-accent-insight-blue hover:opacity-90'
                                : 'bg-surface-container-high hover:bg-surface-bright'
                            }`}
                            style={{ height: `${heightPct}%` }}
                            title={`${monthName}: ₹${expenseVal.toLocaleString('en-IN')}`}
                          />
                        </div>
                        <span
                          className={`font-label-bold text-label-bold mt-1 ${
                            isLatest ? 'text-text-primary font-bold' : 'text-on-surface-variant'
                          }`}
                        >
                          {shortMonth}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Categories Comparison List */}
            <div className="col-span-1 md:col-span-7 bg-surface-container-low rounded-2xl border border-border-subtle p-6 shadow-sm">
              <h3 className="font-headline-md text-headline-md font-semibold text-text-primary mb-4">
                Categories
              </h3>
              <div className="space-y-3">
                {categoriesEntries.map(([cat, amount]) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-surface-container-low border border-border-subtle flex items-center justify-center text-text-primary">
                        <span className="material-symbols-outlined text-lg">
                          {getCategoryIcon(cat)}
                        </span>
                      </div>
                      <div>
                        <p className="font-body-lg text-body-lg text-text-primary font-medium">
                          {cat}
                        </p>
                        <p className="font-body-sm text-body-sm text-status-warning flex items-center">
                          <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
                          ↑{cat === 'Food' ? '24%' : '8%'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-body-lg text-body-lg font-semibold text-text-primary">
                        ₹{amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Source Breakdown */}
            <div className="col-span-1 md:col-span-5 space-y-5">
              <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-6 shadow-sm">
                <h3 className="font-headline-md text-headline-md font-semibold text-text-primary mb-4">
                  By payment source
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 border-l-4 border-accent-insight-blue bg-surface-container rounded-r-xl">
                    <span className="font-body-lg text-body-lg text-on-surface">Google Pay</span>
                    <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                      ₹{upiSources['Google Pay'].toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 border-l-4 border-accent-insight-purple bg-surface-container rounded-r-xl">
                    <span className="font-body-lg text-body-lg text-on-surface">PhonePe</span>
                    <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                      ₹{upiSources['PhonePe'].toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 border-l-4 border-status-success bg-surface-container rounded-r-xl">
                    <span className="font-body-lg text-body-lg text-on-surface">Paytm</span>
                    <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                      ₹{upiSources['Paytm'].toLocaleString('en-IN')}
                    </span>
                  </div>
                  {upiSources['Unknown/Other'] > 0 && (
                    <div className="flex items-center justify-between p-3.5 border-l-4 border-outline bg-surface-container rounded-r-xl">
                      <span className="font-body-lg text-body-lg text-on-surface">Other</span>
                      <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                        ₹{upiSources['Unknown/Other'].toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights Card */}
              {insights.length > 0 && (
                <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-accent-insight-purple icon-filled">
                        auto_awesome
                      </span>
                      <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
                        AI Insights
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/insights')}
                      className="text-body-sm text-body-sm text-accent-insight-blue hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View all</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                  <div className="bg-surface-container p-4 rounded-xl border border-border-subtle space-y-1.5">
                    <div className="flex items-center gap-2 text-status-warning">
                      <span className="material-symbols-outlined text-sm icon-filled">warning</span>
                      <span className="font-label-bold text-label-bold">
                        {insights[0].insight_type}
                      </span>
                    </div>
                    <p className="font-body-sm text-body-sm text-text-secondary leading-snug">
                      {insights[0].insight_text}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;
