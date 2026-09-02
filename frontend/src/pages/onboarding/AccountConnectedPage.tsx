import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export const AccountConnectedPage: React.FC = () => {
  const { onboardingState, accounts } = useAuth();
  const navigate = useNavigate();

  // Pick the latest connected institution or from onboarding state
  const latestAccount = accounts[accounts.length - 1];
  const institutionName =
    latestAccount?.institution_name || onboardingState.selectedInstitution || 'ICICI Bank';

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-background text-primary font-body-sm min-h-screen flex flex-col antialiased selection:bg-primary selection:text-on-primary max-w-[600px] mx-auto pb-6">
      {/* Top Wordmark */}
      <header className="w-full flex justify-center py-6 px-margin-mobile">
        <h1 className="font-headline-md text-headline-md text-text-primary tracking-tight font-bold">
          Spend Analysis
        </h1>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow flex flex-col overflow-y-auto px-margin-mobile">
        {/* Success Indicator & Header */}
        <section className="flex flex-col items-center mt-4 mb-8 text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-status-success/10 flex items-center justify-center mb-5 ring-1 ring-status-success/20 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <span
              className="material-symbols-outlined text-status-success text-[40px] icon-filled"
              aria-hidden="true"
            >
              check_circle
            </span>
          </div>
          <h2 className="text-headline-lg font-headline-lg font-semibold text-text-primary mb-2">
            Account connected
          </h2>
          <p className="font-body-lg text-body-lg text-text-secondary max-w-[280px]">
            Your authorized financial account is now connected to Spend Analysis.
          </p>
        </section>

        {/* Connected State Card */}
        <section className="mb-8">
          <div className="bg-surface-container-high border border-border-subtle rounded-xl p-5 flex justify-between items-center shadow-lg shadow-black/20">
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-semibold text-text-primary">
                {institutionName}
              </span>
              <span className="font-metadata text-metadata text-text-secondary mt-1 tracking-wide">
                Demo / Sandbox
              </span>
            </div>
            <div className="flex items-center gap-2 bg-status-success/15 px-3 py-1.5 rounded-full border border-status-success/20">
              <span className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="font-label-bold text-label-bold text-status-success uppercase tracking-wider">
                Connected
              </span>
            </div>
          </div>
        </section>

        {/* Data Access Summary */}
        <section className="mb-8">
          <h3 className="font-label-bold text-label-bold text-text-secondary uppercase tracking-widest mb-5 px-1">
            What happens next
          </h3>
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-border-subtle text-text-primary">
                <span className="material-symbols-outlined text-xl">analytics</span>
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="font-body-lg text-body-lg text-text-primary font-medium mb-0.5">
                  Analyze your transactions
                </span>
                <span className="font-body-sm text-body-sm text-text-secondary">
                  Review your spending patterns.
                </span>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-border-subtle text-text-primary">
                <span className="material-symbols-outlined text-xl">track_changes</span>
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="font-body-lg text-body-lg text-text-primary font-medium mb-0.5">
                  Track your budgets
                </span>
                <span className="font-body-sm text-body-sm text-text-secondary">
                  Compare your spending with your plans.
                </span>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 border border-border-subtle text-text-primary">
                <span className="material-symbols-outlined text-xl">lightbulb</span>
              </div>
              <div className="flex flex-col pt-0.5">
                <span className="font-body-lg text-body-lg text-text-primary font-medium mb-0.5">
                  Get personalized insights
                </span>
                <span className="font-body-sm text-body-sm text-text-secondary">
                  See data-backed spending insights.
                </span>
              </div>
            </li>
          </ul>
        </section>

        {/* User Control & Privacy */}
        <section className="mb-8 mt-auto">
          <div className="bg-surface-container border border-border-subtle rounded-xl p-4 shadow-inner shadow-white/5">
            <div className="flex items-center gap-3 mb-1.5">
              <span className="material-symbols-outlined text-text-primary text-xl icon-filled">
                shield_person
              </span>
              <h4 className="font-body-lg text-body-lg text-text-primary font-semibold">
                You're in control
              </h4>
            </div>
            <p className="font-body-sm text-body-sm text-text-secondary pl-8">
              You can review or revoke your consent anytime from Settings.
            </p>
          </div>
        </section>
      </main>

      {/* Pinned Footer Action */}
      <footer className="px-margin-mobile pt-2 bg-gradient-to-t from-background via-background/95 to-transparent sticky bottom-0 z-10">
        <button
          type="button"
          onClick={handleGoToDashboard}
          className="w-full h-14 bg-primary text-on-primary font-headline-md text-headline-md font-semibold rounded-xl shadow-[0_8px_20px_rgba(199,198,206,0.15)] active:scale-[0.98] transition-all duration-200 mb-3 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
        >
          <span>Go to Dashboard</span>
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </button>
        <p className="font-metadata text-metadata text-text-secondary text-center px-4">
          Spend Analysis only uses the financial information you authorized.
        </p>
      </footer>
    </div>
  );
};

export default AccountConnectedPage;
