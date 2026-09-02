import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import { TransactionDetailSheet } from '../../components/transactions/TransactionDetailSheet.js';
import type { Period, PaymentSource, Category, Transaction } from '../../types/index.js';

const PAYMENT_SOURCES: (PaymentSource | 'All Sources')[] = [
  'All Sources',
  'Google Pay',
  'PhonePe',
  'Paytm',
  'Unknown/Other',
];

const CATEGORIES: (Category | 'All Categories')[] = [
  'All Categories',
  'Food',
  'Shopping',
  'Transport',
  'Bills',
  'Entertainment',
  'Investments',
  'Subscriptions',
  'Health',
  'Education',
  'Other',
];

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('monthly');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<PaymentSource | 'All Sources'>('All Sources');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All Categories'>('All Categories');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getTransactions({
        period,
        date: '2026-08-31',
      });
      setTransactions(res.transactions || []);
    } catch {
      // Graceful error fallback
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Filter transactions dynamically
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Debit only for spending list
      if (tx.type !== 'Debit') return false;

      // Source filter
      if (selectedSource !== 'All Sources' && tx.payment_source !== selectedSource) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All Categories' && tx.category !== selectedCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMerchant = tx.merchant.toLowerCase().includes(q);
        const matchesDesc = tx.description.toLowerCase().includes(q);
        const matchesCat = tx.category.toLowerCase().includes(q);
        if (!matchesMerchant && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [transactions, selectedSource, selectedCategory, searchQuery]);

  // Total spent calculation for current filtered view
  const totalSpent = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

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

  const periodLabel =
    period === 'daily' ? 'TODAY' : period === 'weekly' ? 'THIS WEEK' : 'THIS MONTH';

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
        <div className="space-y-1">
          <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary">
            Transactions
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            See where your money went
          </p>
        </div>

        {/* Total Spent Card */}
        <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-6 shadow-sm">
          <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-1">
            Total spent this period
          </h3>
          <div className="font-display-currency-mobile md:font-display-currency text-display-currency-mobile md:text-display-currency font-bold text-on-surface">
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
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

        {/* Search Input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-container border border-border-subtle text-text-primary placeholder:text-text-secondary font-body-sm focus:outline-none focus:border-accent-insight-blue transition-colors"
          />
        </div>

        {/* Horizontal Filters: Payment Sources */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {PAYMENT_SOURCES.map((source) => {
            const isActive = selectedSource === source;
            const label = source === 'Unknown/Other' ? 'Other' : source;
            return (
              <button
                key={source}
                type="button"
                onClick={() => setSelectedSource(source)}
                className={`px-4 py-2 rounded-full font-body-sm text-body-sm whitespace-nowrap transition-colors border cursor-pointer ${
                  isActive
                    ? 'bg-surface-bright text-text-primary border-border-subtle font-medium shadow-sm'
                    : 'bg-surface-container text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Horizontal Filters: Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full font-body-sm text-body-sm whitespace-nowrap transition-colors border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-surface-bright text-text-primary border-border-subtle font-medium shadow-sm'
                    : 'bg-surface-container text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                {cat !== 'All Categories' && (
                  <span className="material-symbols-outlined text-sm">{getCategoryIcon(cat)}</span>
                )}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Transactions List Section */}
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center text-label-bold font-label-bold uppercase tracking-wider text-text-secondary">
            <span>{periodLabel}</span>
            <span>
              {filteredTransactions.length} transactions • ₹{totalSpent.toLocaleString('en-IN')} spent
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-secondary">
              <span className="material-symbols-outlined text-3xl animate-spin text-accent-insight-blue">
                progress_activity
              </span>
              <p className="text-body-sm">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface-container-low border border-border-subtle text-center text-text-secondary">
              <span className="material-symbols-outlined text-4xl mb-2 text-text-secondary opacity-50">
                receipt_long
              </span>
              <p className="font-body-md font-medium text-text-primary">No transactions found</p>
              <p className="text-body-sm mt-1">Try adjusting your search query or filter chips.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredTransactions.map((tx) => (
                <button
                  key={tx.id}
                  type="button"
                  onClick={() => setSelectedTransaction(tx)}
                  className="w-full bg-surface-container hover:bg-surface-container-high transition-colors p-4 rounded-2xl border border-border-subtle flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-surface-container-low flex items-center justify-center border border-border-subtle text-text-primary group-hover:border-accent-insight-blue/30 transition-colors">
                      <span className="material-symbols-outlined text-xl">
                        {getCategoryIcon(tx.category)}
                      </span>
                    </div>
                    <div>
                      <p className="font-body-lg text-body-lg text-text-primary font-semibold leading-tight">
                        {tx.merchant || tx.description}
                      </p>
                      <p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
                        {tx.description}
                      </p>
                      <p className="text-metadata text-metadata text-text-secondary mt-1">
                        {tx.category} •{' '}
                        <span className="text-accent-insight-blue">{tx.payment_source}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-body-lg text-body-lg text-text-primary font-bold">
                      -₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-metadata text-metadata text-text-secondary mt-1">
                      {tx.transaction_date}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Transaction Detail Sheet Modal */}
      <TransactionDetailSheet
        isOpen={selectedTransaction !== null}
        onClose={() => setSelectedTransaction(null)}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default TransactionsPage;
