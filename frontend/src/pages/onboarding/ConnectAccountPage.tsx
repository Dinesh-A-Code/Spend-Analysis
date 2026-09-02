import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

const INSTITUTIONS = [
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'axis', name: 'Axis Bank' },
];

export const ConnectAccountPage: React.FC = () => {
  const { onboardingState, setOnboardingState } = useAuth();
  const [selectedInstitution, setSelectedInstitution] = useState(
    onboardingState.selectedInstitution || 'ICICI Bank'
  );
  const navigate = useNavigate();

  const handleSelectInstitution = (instName: string) => {
    setSelectedInstitution(instName);
    setOnboardingState((prev) => ({
      ...prev,
      selectedInstitution: instName,
    }));
  };

  const handleContinue = () => {
    setOnboardingState((prev) => ({
      ...prev,
      selectedInstitution,
    }));
    navigate('/onboarding/consent');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-sm antialiased selection:bg-accent-insight-blue selection:text-white pb-[160px] md:pb-[140px]">
      {/* TopAppBar */}
      <header className="bg-background flex justify-between items-center w-full px-margin-mobile h-16 sticky top-0 z-10">
        <div className="flex items-center gap-3 w-full justify-center relative">
          <span
            className="material-symbols-outlined text-primary font-variation-settings-'FILL' 1 absolute left-0 cursor-pointer icon-filled text-2xl"
            aria-hidden="true"
          >
            shield_with_heart
          </span>
          <h1 className="font-headline-md text-headline-md tracking-tight text-on-surface font-bold">
            Spend Analysis
          </h1>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow px-margin-mobile flex flex-col gap-6 pt-2 max-w-[600px] mx-auto w-full">
        {/* Header Section */}
        <section className="flex flex-col gap-2">
          <h2 className="text-headline-lg font-headline-lg font-semibold text-text-primary">
            Connect your financial account
          </h2>
          <p className="font-body-lg text-body-lg text-text-secondary">
            Connect an account to securely analyze your transactions, spending patterns, and budgets.
          </p>
        </section>

        {/* Trust Card */}
        <section className="bg-[#202126] rounded-xl p-5 border border-border-subtle flex flex-col gap-3 relative overflow-hidden shadow-sm">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-insight-purple/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4 z-10">
            <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 border border-border-subtle">
              <span className="material-symbols-outlined text-status-success">verified_user</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-body-lg text-body-lg text-text-primary font-medium">
                Your data stays under your control
              </h3>
              <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                This is a secure, consent-based Account Aggregator connection.{' '}
                <span className="text-text-primary font-medium">
                  We never ask for your bank password or UPI PIN.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Institution Selection */}
        <section className="flex flex-col gap-4 mt-2">
          <div className="flex items-center justify-between">
            <h3 className="font-body-lg text-body-lg text-text-primary font-medium">
              Choose your financial institution
            </h3>
            <span className="bg-surface-container-high border border-border-subtle text-text-secondary px-2.5 py-1 rounded-md font-metadata text-metadata uppercase tracking-wider">
              Demo / Sandbox
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {INSTITUTIONS.map((inst) => {
              const isSelected = selectedInstitution === inst.name;
              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => handleSelectInstitution(inst.name)}
                  className={`border rounded-xl p-4 flex items-center justify-between transition-all group text-left w-full focus:outline-none cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#292A30] border-accent-insight-blue/50 ring-1 ring-accent-insight-blue shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                      : 'bg-[#292A30] border-border-subtle hover:bg-surface-container-highest'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-accent-insight-blue/5 pointer-events-none" />
                  )}
                  <div className="flex items-center gap-4 z-10">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-accent-insight-blue/10 border-accent-insight-blue/30 text-accent-insight-blue'
                          : 'bg-surface-container border-border-subtle text-text-secondary group-hover:border-outline-variant group-hover:text-text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">account_balance</span>
                    </div>
                    <span className="font-body-lg text-body-lg text-text-primary font-medium">
                      {inst.name}
                    </span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center z-10 transition-colors ${
                      isSelected
                        ? 'bg-accent-insight-blue'
                        : 'border border-outline-variant group-hover:border-text-secondary'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-white text-[14px] font-bold">
                        check
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bottom Actions Container */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border-subtle p-margin-mobile flex flex-col gap-3 z-40 max-w-[600px] mx-auto pb-8">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full bg-text-primary text-background font-headline-md text-headline-md py-4 rounded-full flex items-center justify-center gap-2 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.98] font-semibold cursor-pointer"
        >
          <span>Continue to consent</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>

        <div className="flex flex-col items-center gap-1 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="font-body-sm text-body-sm text-text-primary font-medium hover:text-white transition-colors py-1 cursor-pointer"
          >
            Skip for now
          </button>
          <p className="font-metadata text-metadata text-text-metadata">
            You can connect an account later from the app.
          </p>
        </div>

        <p className="font-metadata text-metadata text-text-metadata text-center flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          <span>You choose what financial information you allow us to access.</span>
        </p>
      </div>
    </div>
  );
};

export default ConnectAccountPage;
