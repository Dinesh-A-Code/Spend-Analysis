import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export const ConsentPage: React.FC = () => {
  const { onboardingState, connectAccount } = useAuth();
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const institutionName = onboardingState.selectedInstitution || 'ICICI Bank';

  const handleApprove = async () => {
    if (!consentAgreed) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await connectAccount(institutionName);
      navigate('/onboarding/success');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to connect institution. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    navigate('/onboarding/connect-account');
  };

  return (
    <div className="bg-background text-on-surface font-body-sm antialiased overflow-x-hidden w-full max-w-[600px] mx-auto relative min-h-screen pb-[240px]">
      {/* Top App Bar */}
      <header className="flex justify-between items-center w-full px-margin-mobile h-16 bg-background sticky top-0 z-50">
        <button
          type="button"
          onClick={() => navigate('/onboarding/connect-account')}
          aria-label="Back to connect account"
          className="text-on-surface hover:opacity-80 transition-opacity flex items-center justify-center p-2 -ml-2 rounded-full active:scale-95 duration-200 cursor-pointer"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <div className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
          Spend Analysis
        </div>
        <div className="w-10" />
      </header>

      {/* Main Content Area */}
      <main className="px-margin-mobile pt-2 flex flex-col gap-6">
        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Header Section */}
        <section className="flex flex-col gap-2">
          <span className="font-label-bold text-label-bold text-secondary uppercase tracking-wider">
            ACCOUNT AGGREGATOR CONSENT
          </span>
          <h1 className="font-headline-lg text-headline-lg font-semibold text-text-primary">
            Review your consent
          </h1>
          <p className="font-body-sm text-body-sm text-secondary">
            Choose what financial information you want to share with Spend Analysis.
          </p>
        </section>

        {/* Selected Institution Card */}
        <div className="bg-[#202126] rounded-xl p-4 border border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#292A30] flex items-center justify-center shrink-0 border border-border-subtle">
              <span className="material-symbols-outlined text-text-primary text-xl">
                account_balance
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-body-lg text-body-lg text-text-primary font-medium">
                {institutionName}
              </span>
              <span className="font-metadata text-metadata text-secondary">
                Selected for connection
              </span>
            </div>
          </div>
          <span className="bg-[#292A30] text-secondary font-metadata text-metadata px-2.5 py-1 rounded border border-border-subtle">
            Demo / Sandbox
          </span>
        </div>

        {/* Consent Details Section */}
        <section className="flex flex-col gap-4">
          {/* What you'll allow */}
          <div className="bg-[#202126] rounded-xl p-5 border border-border-subtle flex flex-col gap-4 shadow-sm">
            <h3 className="font-body-lg text-body-lg text-text-primary font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-insight-blue text-sm">
                data_check
              </span>
              <span>What you'll allow</span>
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 border-l-2 border-border-subtle pl-3">
                <span className="font-body-sm text-body-sm text-text-primary font-medium">
                  Transaction data
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Used to analyze your spending and identify spending patterns.
                </span>
              </div>
              <div className="flex flex-col gap-1 border-l-2 border-border-subtle pl-3">
                <span className="font-body-sm text-body-sm text-text-primary font-medium">
                  Account information
                </span>
                <span className="font-body-sm text-body-sm text-secondary">
                  Used to organize your connected financial account.
                </span>
              </div>
            </div>
          </div>

          {/* Why we need this */}
          <div className="bg-[#202126] rounded-xl p-5 border border-border-subtle flex flex-col gap-3 shadow-sm">
            <h3 className="font-body-lg text-body-lg text-text-primary font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-insight-purple text-sm">
                lightbulb
              </span>
              <span>Why we need this</span>
            </h3>
            <p className="font-body-sm text-body-sm text-secondary">
              Spend Analysis uses the authorized financial information to show your spending, budgets, trends, and personalized insights.
            </p>
          </div>

          {/* Access control */}
          <div className="bg-[#202126] rounded-xl p-5 border border-border-subtle flex flex-col gap-4 shadow-sm">
            <h3 className="font-body-lg text-body-lg text-text-primary font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-text-primary text-sm">tune</span>
              <span>Access control</span>
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <span className="font-body-sm text-body-sm text-text-primary font-medium shrink-0">
                  Access frequency
                </span>
                <span className="font-body-sm text-body-sm text-secondary text-right">
                  Only when authorized through your consent.
                </span>
              </div>
              <div className="h-[1px] w-full bg-border-subtle" />
              <div className="flex justify-between items-start gap-4">
                <span className="font-body-sm text-body-sm text-text-primary font-medium shrink-0">
                  Consent duration
                </span>
                <span className="font-body-sm text-body-sm text-secondary text-right">
                  Until you revoke or the consent period expires.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Control Card */}
        <section className="bg-[#202126] rounded-xl p-5 border border-border-subtle flex flex-col gap-3 mb-2">
          <h3 className="font-body-lg text-body-lg text-text-primary font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-status-success text-sm">
              verified_user
            </span>
            <span>You stay in control</span>
          </h3>
          <p className="font-body-sm text-body-sm text-secondary">
            You can revoke this consent later from Settings. Revoking consent stops future access. It does not automatically delete financial data already stored by Spend Analysis.
          </p>
          <div className="flex items-center gap-2 mt-2 bg-surface-container p-3 rounded-lg border border-border-subtle">
            <span className="material-symbols-outlined text-status-warning text-sm shrink-0">
              lock
            </span>
            <span className="font-metadata text-metadata text-text-primary">
              We never ask for your bank password or UPI PIN.
            </span>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Actions Area */}
      <div className="fixed bottom-0 left-0 right-0 glass-panel border-t border-border-subtle px-margin-mobile py-5 flex flex-col gap-3 z-50 max-w-[600px] mx-auto pb-8">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            <input
              id="consent-checkbox"
              type="checkbox"
              checked={consentAgreed}
              onChange={(e) => setConsentAgreed(e.target.checked)}
              className="peer appearance-none w-5 h-5 border-2 border-outline rounded bg-surface checked:bg-accent-insight-blue checked:border-accent-insight-blue transition-colors focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            {consentAgreed && (
              <span className="material-symbols-outlined absolute text-white text-[16px] pointer-events-none">
                check
              </span>
            )}
          </div>
          <span className="font-body-sm text-body-sm text-text-primary group-hover:text-white transition-colors select-none">
            I understand and agree to the above data access.
          </span>
        </label>

        <div className="flex flex-col gap-2 mt-1">
          <button
            type="button"
            disabled={!consentAgreed || isSubmitting}
            onClick={handleApprove}
            className="w-full bg-accent-insight-blue text-white font-headline-md text-headline-md py-3.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] font-semibold cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span>Connecting Account...</span>
                <span className="material-symbols-outlined animate-spin text-sm">
                  progress_activity
                </span>
              </>
            ) : (
              <span>Approve consent</span>
            )}
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="w-full text-secondary font-body-lg text-body-lg py-2 hover:text-text-primary transition-colors cursor-pointer"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPage;
