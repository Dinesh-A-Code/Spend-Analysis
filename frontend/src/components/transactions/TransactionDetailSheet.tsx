import React from 'react';
import type { Transaction } from '../../types/index.js';

interface TransactionDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const TransactionDetailSheet: React.FC<TransactionDetailSheetProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food':
        return 'restaurant';
      case 'Transport':
        return 'directions_car';
      case 'Shopping':
        return 'shopping_bag';
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

  const formattedDate = transaction.transaction_date;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex flex-col justify-end transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-high w-full max-w-lg mx-auto rounded-t-3xl shadow-2xl z-20 flex flex-col max-h-[90vh] transform transition-transform duration-300 border-t border-border-subtle p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar with Close and Options */}
        <div className="flex justify-between items-center w-full mb-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
          <button
            type="button"
            aria-label="Options"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </button>
        </div>

        {/* Center Big Icon, Title, Amount */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center border border-border-subtle shadow-inner">
              <span className="material-symbols-outlined text-3xl text-text-primary">
                {getCategoryIcon(transaction.category)}
              </span>
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-status-success flex items-center justify-center border-2 border-surface-container-high">
              <span className="material-symbols-outlined text-white text-xs">check</span>
            </div>
          </div>

          <h2 className="font-headline-lg text-headline-lg font-bold text-text-primary mb-1">
            {transaction.merchant || transaction.description}
          </h2>
          <div className="font-display-currency-mobile text-display-currency-mobile font-bold text-text-primary mb-3">
            ₹{transaction.amount.toLocaleString('en-IN')}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container border border-border-subtle text-text-secondary text-label-bold font-label-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-sm">
              {getCategoryIcon(transaction.category)}
            </span>
            <span>{transaction.category}</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-surface-container rounded-2xl p-5 border border-border-subtle space-y-4 mb-6">
          {/* Row 1: Date & Time */}
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary">
                <span className="material-symbols-outlined text-base">schedule</span>
              </div>
              <span className="font-body-sm text-body-sm text-text-secondary">Date & Time</span>
            </div>
            <span className="font-body-sm text-body-sm text-text-primary font-medium">
              {formattedDate}
            </span>
          </div>

          {/* Row 2: Paid via */}
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-accent-insight-blue">
                <span className="material-symbols-outlined text-base">account_balance_wallet</span>
              </div>
              <span className="font-body-sm text-body-sm text-text-secondary">Paid via</span>
            </div>
            <div className="text-right">
              <p className="font-body-sm text-body-sm text-text-primary font-medium">
                {transaction.payment_source}
              </p>
              <p className="text-metadata text-metadata text-text-secondary">
                {transaction.account_masked || 'Mock Bank Account'}
              </p>
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary">
                <span className="material-symbols-outlined text-base">edit_note</span>
              </div>
              <span className="font-body-sm text-body-sm text-text-secondary">Description</span>
            </div>
            <span className="px-3 py-1 rounded-lg bg-surface-container-high text-body-sm text-text-primary border border-border-subtle">
              {transaction.description || transaction.merchant}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-4">
          <button
            type="button"
            className="flex-1 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-sm font-medium border border-border-subtle flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            <span>Split</span>
          </button>
          <button
            type="button"
            className="flex-1 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-body-sm font-medium border border-border-subtle flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">flag</span>
            <span>Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailSheet;
