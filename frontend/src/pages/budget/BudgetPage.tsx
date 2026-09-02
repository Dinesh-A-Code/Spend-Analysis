import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import type { BudgetOverview, BudgetStatusItem, AIInsight } from '../../types/index.js';

export const BudgetPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [editingCategory, setEditingCategory] = useState<BudgetStatusItem | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const loadBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      const [budgetRes, insightsRes] = await Promise.all([
        api.getBudgets('2026-08-31'),
        api.getInsights(),
      ]);

      setBudgetOverview(budgetRes);
      setInsights(insightsRes.insights.filter((i) => !i.is_dismissed));
    } catch {
      // Graceful error fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleOpenEdit = (item: BudgetStatusItem) => {
    setEditingCategory(item);
    setNewLimitInput(String(item.limit_amount));
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const num = Number(newLimitInput);
    if (isNaN(num) || num < 0) return;

    try {
      setIsUpdating(true);
      await api.updateBudget(editingCategory.category, num);
      await loadBudgets();
      setEditingCategory(null);
    } catch {
      // Handle error
    } finally {
      setIsUpdating(false);
    }
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

  const totalBudget = budgetOverview?.total_budget ?? 0;
  const totalSpent = budgetOverview?.total_spent ?? 0;
  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const isTotalOver = totalSpent > totalBudget;
  const totalOverAmount = Math.max(0, totalSpent - totalBudget);

  const totalPct = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;

  // Find top alert insight
  const alertInsight = insights.find(
    (i) => i.insight_type === 'Alert' || i.category.toLowerCase().includes('plan')
  );

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

      <main className="px-margin-mobile md:px-margin-desktop py-6 max-w-4xl mx-auto space-y-6 w-full">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">Budget</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Plan your spending before you spend it
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container border border-border-subtle text-body-sm text-text-primary">
            <span className="material-symbols-outlined text-base text-accent-insight-blue">
              calendar_month
            </span>
            <span className="font-medium">August 2026</span>
          </div>
        </div>

        {/* Monthly Spending Plan Overall Card */}
        <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-6 space-y-5 shadow-sm">
          <div>
            <span className="font-label-bold text-label-bold uppercase tracking-wider text-text-secondary">
              Monthly Spending Plan
            </span>
            <div className="font-display-currency-mobile md:font-display-currency text-display-currency-mobile md:text-display-currency font-bold text-on-surface mt-1">
              ₹{totalBudget.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isTotalOver ? 'bg-status-error' : 'bg-status-success'
              }`}
              style={{ width: `${totalPct}%` }}
            />
          </div>

          {/* Row Metrics */}
          <div className="flex justify-between items-center pt-1 border-t border-border-subtle">
            <div>
              <p className="text-body-sm text-text-secondary">Spent so far</p>
              <p className="text-body-lg font-bold text-text-primary mt-0.5">
                ₹{totalSpent.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-body-sm text-text-secondary">
                {isTotalOver ? 'Over plan' : 'Remaining'}
              </p>
              <p
                className={`text-body-lg font-bold mt-0.5 ${
                  isTotalOver ? 'text-status-error' : 'text-status-success'
                }`}
              >
                {isTotalOver
                  ? `-₹${totalOverAmount.toLocaleString('en-IN')}`
                  : `₹${totalRemaining.toLocaleString('en-IN')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Insight Banner */}
        {alertInsight && (
          <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-status-error/10 text-status-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg icon-filled">warning</span>
              </div>
              <p className="font-body-sm text-body-sm text-text-primary leading-snug">
                {alertInsight.insight_text}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/insights')}
              className="text-body-sm font-medium text-accent-insight-blue whitespace-nowrap hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View insight</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Categories Section */}
        <div className="space-y-4 pt-2">
          <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
            Categories
          </h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
              <span className="material-symbols-outlined text-3xl animate-spin text-accent-insight-blue">
                progress_activity
              </span>
              <p className="text-body-sm">Loading spending envelopes...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {budgetOverview?.categories.map((cat) => {
                const isOver = cat.status === 'over_budget';
                const pct =
                  cat.limit_amount > 0
                    ? Math.min(100, Math.round((cat.actual_spent / cat.limit_amount) * 100))
                    : 100;
                return (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => handleOpenEdit(cat)}
                    className={`w-full bg-surface-container-low hover:bg-surface-container transition-colors p-5 rounded-2xl border text-left cursor-pointer space-y-3.5 ${
                      isOver ? 'border-status-error/30' : 'border-border-subtle'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isOver
                              ? 'bg-status-error/10 text-status-error'
                              : 'bg-surface-container text-text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">
                            {getCategoryIcon(cat.category)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-headline-md text-headline-md font-semibold text-text-primary leading-tight">
                            {cat.category}
                          </h4>
                          <p className="font-body-lg text-body-lg font-bold text-text-primary mt-1">
                            ₹{cat.actual_spent.toLocaleString('en-IN')}{' '}
                            <span className="font-normal text-text-secondary text-body-sm">
                              of ₹{cat.limit_amount.toLocaleString('en-IN')}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-label-bold text-label-bold px-3 py-1 rounded-full ${
                            isOver
                              ? 'bg-status-error/15 text-status-error'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {isOver
                            ? `₹${cat.over_budget_amount.toLocaleString('en-IN')} over`
                            : `₹${cat.remaining_amount.toLocaleString('en-IN')} left`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-status-error' : 'bg-status-success'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Edit Budget Modal */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
          onClick={() => setEditingCategory(null)}
        >
          <div
            className="bg-surface-container-high w-full max-w-md rounded-3xl p-6 border border-border-subtle shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md font-bold text-text-primary">
                Edit {editingCategory.category} Budget
              </h3>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-text-secondary">
              Current month actual spend:{' '}
              <span className="font-semibold text-text-primary">
                ₹{editingCategory.actual_spent.toLocaleString('en-IN')}
              </span>
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label
                  htmlFor="budgetLimit"
                  className="block font-label-bold text-label-bold text-text-secondary uppercase mb-2"
                >
                  Monthly Limit (₹)
                </label>
                <input
                  id="budgetLimit"
                  type="number"
                  min="0"
                  step="100"
                  value={newLimitInput}
                  onChange={(e) => setNewLimitInput(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-surface-container border border-border-subtle text-text-primary font-body-lg focus:outline-none focus:border-accent-insight-blue"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-bright text-text-secondary hover:text-text-primary font-body-sm font-medium border border-border-subtle transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary-fixed text-on-primary-fixed font-body-sm font-semibold hover:opacity-90 transition-opacity active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? 'Saving...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
