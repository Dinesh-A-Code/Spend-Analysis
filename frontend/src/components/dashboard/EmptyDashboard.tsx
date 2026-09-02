import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export const EmptyDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="flex flex-col flex-1 w-full">
      {/* HEADER */}
      <header className="px-margin-mobile pt-8 pb-4 flex justify-between items-start sticky top-0 bg-[#18191F]/90 backdrop-blur-sm z-40 border-b border-border-subtle">
        <div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-text-primary tracking-tight">
            Hello, {firstName}
          </h1>
          <p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
            Let's get your spending organized.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#202126] border border-border-subtle">
          <span className="w-2 h-2 rounded-full bg-outline-variant" />
          <span className="font-metadata text-metadata text-text-secondary">
            No account connected
          </span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-margin-mobile flex flex-col gap-6 mt-4">
        {/* EMPTY STATE SECTION */}
        <section className="flex flex-col items-center justify-center py-9 bg-[#202126] rounded-3xl border border-border-subtle text-center px-6 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#292A30] border border-border-subtle flex items-center justify-center mb-5 shadow-inner">
            <span
              className="material-symbols-outlined text-4xl text-text-secondary icon-filled"
              aria-hidden="true"
            >
              account_balance
            </span>
          </div>
          <h2 className="font-headline-md text-headline-md font-semibold text-text-primary mb-2">
            Connect your financial account
          </h2>
          <p className="font-body-sm text-body-sm text-text-secondary mb-7 max-w-xs mx-auto leading-relaxed">
            Connect an account through a consent-based connection to start analyzing your spending,
            budgets, and trends.
          </p>
          <button
            type="button"
            onClick={() => navigate('/onboarding/connect-account')}
            className="w-full max-w-xs bg-primary-fixed text-on-primary-fixed font-body-lg text-body-lg font-semibold py-3.5 rounded-2xl hover:opacity-90 transition-opacity active:scale-[0.98] shadow-md cursor-pointer"
          >
            Connect Account
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="mt-3.5 font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            Maybe later
          </button>
        </section>

        {/* PREVIEW SECTION */}
        <section className="flex flex-col gap-3">
          <h3 className="font-label-bold text-label-bold text-text-secondary uppercase tracking-wider px-1">
            Once connected, you'll see
          </h3>
          <div className="flex flex-col gap-3">
            {/* Preview Item 1 */}
            <div className="flex items-center gap-4 bg-[#292A30] p-4 rounded-2xl border border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-[#202126] flex items-center justify-center border border-border-subtle text-text-secondary">
                <span className="material-symbols-outlined icon-filled">pie_chart</span>
              </div>
              <div>
                <h4 className="font-body-lg text-body-lg text-text-primary font-medium">
                  Spending overview
                </h4>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  See where your money goes.
                </p>
              </div>
            </div>

            {/* Preview Item 2 */}
            <div className="flex items-center gap-4 bg-[#292A30] p-4 rounded-2xl border border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-[#202126] flex items-center justify-center border border-border-subtle text-text-secondary">
                <span className="material-symbols-outlined icon-filled">track_changes</span>
              </div>
              <div>
                <h4 className="font-body-lg text-body-lg text-text-primary font-medium">
                  Budget progress
                </h4>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Compare spending with your plans.
                </p>
              </div>
            </div>

            {/* Preview Item 3 */}
            <div className="flex items-center gap-4 bg-[#292A30] p-4 rounded-2xl border border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-[#202126] flex items-center justify-center border border-border-subtle text-text-secondary">
                <span className="material-symbols-outlined icon-filled">auto_awesome</span>
              </div>
              <div>
                <h4 className="font-body-lg text-body-lg text-text-primary font-medium">
                  AI insights
                </h4>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Get data-backed insights from your spending.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-2 mb-4 text-center px-4">
          <p className="font-metadata text-metadata text-text-secondary flex items-center justify-center gap-1.5 opacity-80">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span>You choose what financial information you allow us to access.</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default EmptyDashboard;
