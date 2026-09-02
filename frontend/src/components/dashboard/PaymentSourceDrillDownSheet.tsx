import React from 'react';
import type { PaymentSource, Period, Transaction } from '../../types/index.js';

interface PaymentSourceDrillDownSheetProps {
  isOpen: boolean;
  onClose: () => void;
  paymentSource: PaymentSource | null;
  period: Period;
  totalSourceSpend: number;
  totalPeriodSpend: number;
  transactions: Transaction[];
}

export const PaymentSourceDrillDownSheet: React.FC<PaymentSourceDrillDownSheetProps> = ({
  isOpen,
  onClose,
  paymentSource,
  period,
  totalSourceSpend,
  totalPeriodSpend,
  transactions,
}) => {
  if (!isOpen || !paymentSource) return null;

  // Filter debit transactions for this payment source
  const sourceTransactions = transactions.filter(
    (tx) => tx.payment_source === paymentSource && tx.type === 'Debit'
  );

  // Group contributing transactions dynamically by category
  const categoryTotals: Record<string, number> = {};
  sourceTransactions.forEach((tx) => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const percentageOfTotal =
    totalPeriodSpend > 0 ? Math.round((totalSourceSpend / totalPeriodSpend) * 100) : 0;

  const periodLabel =
    period === 'daily' ? "Today's" : period === 'weekly' ? "This week's" : "This month's";

  const getMerchantIcon = (merchant: string, category: string) => {
    const m = (merchant || '').toLowerCase();
    if (m.includes('tea') || m.includes('coffee') || m.includes('cafe')) return 'local_cafe';
    if (m.includes('swiggy') || m.includes('zomato') || m.includes('restaurant')) return 'restaurant';
    if (m.includes('bus')) return 'directions_bus';
    if (m.includes('uber') || m.includes('ola') || m.includes('cab')) return 'directions_car';
    if (m.includes('amazon') || m.includes('myntra') || m.includes('store') || m.includes('shop')) return 'shopping_bag';
    if (m.includes('grocer') || m.includes('bazaar') || m.includes('supermarket')) return 'storefront';
    if (m.includes('movie') || m.includes('bookmyshow') || m.includes('netflix')) return 'movie';
    if (m.includes('bescom') || m.includes('bill') || m.includes('electricity')) return 'receipt';

    switch (category) {
      case 'Food':
        return 'restaurant';
      case 'Transport':
        return 'directions_car';
      case 'Shopping':
        return 'shopping_bag';
      case 'Bills':
        return 'receipt';
      case 'Entertainment':
        return 'movie';
      case 'Investments':
        return 'trending_up';
      default:
        return 'payments';
    }
  };

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case 'Food':
        return 'text-status-warning bg-status-warning/10';
      case 'Transport':
        return 'text-accent-insight-blue bg-accent-insight-blue/10';
      case 'Shopping':
        return 'text-accent-insight-purple bg-accent-insight-purple/10';
      case 'Bills':
        return 'text-status-error bg-status-error/10';
      default:
        return 'text-status-success bg-status-success/10';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col justify-end transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-high w-full max-w-xl mx-auto rounded-t-3xl shadow-2xl z-20 flex flex-col max-h-[85vh] transform transition-transform duration-300 border-t border-border-subtle"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle & Close Header */}
        <div className="w-full pt-4 pb-2 px-6 flex justify-between items-center">
          <div className="w-8" />
          <div className="w-12 h-1.5 bg-outline-variant rounded-full opacity-50 cursor-grab" />
          <button
            onClick={onClose}
            aria-label="Close sheet"
            className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-margin-mobile pb-[90px] flex-1 no-scrollbar">
          {/* Header Section */}
          <div className="text-center mt-2 mb-6">
            <h2 className="font-headline-lg text-headline-lg font-semibold text-text-primary mb-1">
              {paymentSource}
            </h2>
            <p className="font-body-sm text-body-sm text-text-secondary mb-3">
              {periodLabel} spending
            </p>
            <div className="font-display-currency-mobile text-display-currency-mobile font-bold text-text-primary mb-2">
              ₹{totalSourceSpend.toLocaleString('en-IN')}
            </div>
            <div className="inline-flex items-center gap-2 bg-surface-variant px-3.5 py-1.5 rounded-full border border-border-subtle">
              <span className="material-symbols-outlined text-[16px] text-accent-insight-purple icon-filled">
                pie_chart
              </span>
              <span className="font-metadata text-metadata text-text-secondary">
                {percentageOfTotal}% of {periodLabel.toLowerCase()} UPI spending
              </span>
            </div>
          </div>

          {/* Summary Bar */}
          <div className="flex items-center justify-between bg-surface-container py-3.5 px-4 rounded-xl border border-border-subtle mb-6">
            <div className="flex flex-col">
              <span className="font-body-sm text-body-sm text-text-primary font-medium">
                {sourceTransactions.length}{' '}
                {sourceTransactions.length === 1 ? 'Transaction' : 'Transactions'}
              </span>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div className="flex flex-col text-right">
              <span className="font-body-sm text-body-sm text-text-secondary">Payment Source</span>
              <span className="font-body-sm text-body-sm text-text-primary font-medium">
                {paymentSource}
              </span>
            </div>
          </div>

          {/* Category Breakdown Section */}
          {Object.keys(categoryTotals).length > 0 && (
            <div className="mb-6">
              <h3 className="font-headline-md text-headline-md font-semibold text-text-primary mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {Object.entries(categoryTotals).map(([cat, amount]) => (
                  <div
                    key={cat}
                    className="bg-surface-container px-3.5 py-2 rounded-lg border border-border-subtle flex items-center gap-2"
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        cat === 'Food'
                          ? 'text-status-warning'
                          : cat === 'Transport'
                          ? 'text-accent-insight-blue'
                          : 'text-accent-insight-purple'
                      }`}
                    >
                      {cat === 'Food'
                        ? 'restaurant'
                        : cat === 'Transport'
                        ? 'directions_bus'
                        : cat === 'Shopping'
                        ? 'shopping_bag'
                        : 'category'}
                    </span>
                    <span className="font-body-sm text-body-sm text-text-secondary">{cat}</span>
                    <span className="font-body-sm text-body-sm text-text-primary font-semibold ml-1">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contributing Transactions List */}
          <div>
            <h3 className="font-headline-md text-headline-md font-semibold text-text-primary mb-3">
              Transactions
            </h3>
            <div className="flex flex-col gap-2.5">
              {sourceTransactions.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-container border border-border-subtle text-center text-text-secondary">
                  No transactions found for {paymentSource} in this period.
                </div>
              ) : (
                sourceTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-surface-container hover:bg-surface-container-highest transition-colors p-4 rounded-xl border border-border-subtle flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryColorClass(
                          tx.category
                        )}`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {getMerchantIcon(tx.merchant, tx.category)}
                        </span>
                      </div>
                      <div>
                        <p className="font-body-lg text-body-lg text-text-primary font-medium leading-tight">
                          {tx.merchant || tx.description}
                        </p>
                        <p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
                          {tx.category} • {tx.payment_source}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-body-lg text-body-lg text-text-primary font-semibold">
                        -₹{tx.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSourceDrillDownSheet;
