import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

const PREFERENCE_OPTIONS = [
  'Save more',
  'Control daily spending',
  'Stay within budget',
  'Understand where my money goes',
];

export const ProfileSetupPage: React.FC = () => {
  const { user, updateProfile, onboardingState, setOnboardingState } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(onboardingState.fullName || user?.name || '');
  const [monthlyIncome, setMonthlyIncome] = useState(
    onboardingState.monthlyIncome || (user?.monthly_income ? String(user.monthly_income) : '')
  );
  const [savingsTarget, setSavingsTarget] = useState(
    onboardingState.savingsTarget || (user?.savings_target ? String(user.savings_target) : '')
  );
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(
    onboardingState.selectedPreferences.length > 0 ? onboardingState.selectedPreferences : ['Save more']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.name && !fullName) {
      setFullName(user.name);
    }
  }, [user, fullName]);

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      // Save updated profile info to backend
      const incomeNum = monthlyIncome ? Number(monthlyIncome) : undefined;
      const savingsNum = savingsTarget ? Number(savingsTarget) : undefined;

      await updateProfile({
        name: fullName.trim() || undefined,
        monthly_income: incomeNum,
        savings_target: savingsNum,
      });

      // Save to onboarding state
      setOnboardingState((prev) => ({
        ...prev,
        fullName,
        monthlyIncome,
        savingsTarget,
        selectedPreferences,
      }));

      navigate('/onboarding/connect-account');
    } catch {
      // If error, continue to connect account anyway
      navigate('/onboarding/connect-account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate('/onboarding/connect-account');
  };

  return (
    <div className="text-text-primary min-h-screen flex flex-col items-center justify-start py-8 px-4 bg-[#18191F] selection:bg-accent-insight-purple selection:text-white">
      {/* Mobile Container */}
      <main className="w-full max-w-md mx-auto flex flex-col min-h-[750px] relative pb-12">
        {/* Header Section */}
        <header className="w-full px-margin-mobile pt-4 pb-6 flex flex-col gap-6">
          <div className="flex items-center justify-center w-full">
            <span className="font-headline-md text-headline-md text-text-primary font-bold tracking-tight">
              Spend Analysis
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-headline-lg font-headline-lg font-semibold text-text-primary">
              Set up your profile
            </h1>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Tell us a little about your preferences so we can personalize your spending analysis.
            </p>
          </div>
        </header>

        {/* Form Section */}
        <section className="flex-1 px-margin-mobile flex flex-col gap-5">
          {/* Full Name */}
          <div className="flex flex-col gap-2">
            <label
              className="font-label-bold text-label-bold text-text-secondary uppercase tracking-wider"
              htmlFor="fullName"
            >
              Full name
            </label>
            <div className="relative w-full">
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-[#292A30] border border-border-subtle rounded-lg px-4 py-3 font-body-lg text-body-lg text-text-primary focus:outline-none focus:border-accent-insight-purple focus:ring-1 focus:ring-accent-insight-purple transition-colors placeholder:text-text-secondary/50"
              />
            </div>
          </div>

          {/* Monthly Income */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label
                className="font-label-bold text-label-bold text-text-secondary uppercase tracking-wider"
                htmlFor="monthlyIncome"
              >
                Monthly income
              </label>
              <span className="font-metadata text-metadata text-text-secondary/70 bg-[#292A30] px-2 py-0.5 rounded-full border border-border-subtle">
                Optional
              </span>
            </div>
            <div className="relative w-full flex items-center">
              <span className="absolute left-4 font-body-lg text-body-lg text-text-secondary">₹</span>
              <input
                id="monthlyIncome"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="Enter your monthly income"
                className="w-full bg-[#292A30] border border-border-subtle rounded-lg pl-8 pr-4 py-3 font-body-lg text-body-lg text-text-primary focus:outline-none focus:border-accent-insight-purple focus:ring-1 focus:ring-accent-insight-purple transition-colors placeholder:text-text-secondary/50"
              />
            </div>
          </div>

          {/* Monthly Savings Target */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label
                className="font-label-bold text-label-bold text-text-secondary uppercase tracking-wider"
                htmlFor="savingsTarget"
              >
                Monthly savings target
              </label>
              <span className="font-metadata text-metadata text-text-secondary/70 bg-[#292A30] px-2 py-0.5 rounded-full border border-border-subtle">
                Optional
              </span>
            </div>
            <div className="relative w-full flex items-center">
              <span className="absolute left-4 font-body-lg text-body-lg text-text-secondary">₹</span>
              <input
                id="savingsTarget"
                type="number"
                value={savingsTarget}
                onChange={(e) => setSavingsTarget(e.target.value)}
                placeholder="Set your savings target"
                className="w-full bg-[#292A30] border border-border-subtle rounded-lg pl-8 pr-4 py-3 font-body-lg text-body-lg text-text-primary focus:outline-none focus:border-accent-insight-purple focus:ring-1 focus:ring-accent-insight-purple transition-colors placeholder:text-text-secondary/50"
              />
            </div>
          </div>

          {/* Currency Selection (Static) */}
          <div className="flex flex-col gap-2 pt-1">
            <label className="font-label-bold text-label-bold text-text-secondary uppercase tracking-wider">
              Currency
            </label>
            <div className="w-full bg-[#202126] border border-border-subtle rounded-lg px-4 py-3 flex items-center justify-between cursor-default">
              <span className="font-body-lg text-body-lg text-text-primary">₹ INR</span>
              <span className="material-symbols-outlined text-text-secondary">keyboard_arrow_down</span>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="font-label-bold text-label-bold text-text-secondary uppercase tracking-wider">
              What's most important to you?
            </label>
            <div className="flex flex-wrap gap-2.5">
              {PREFERENCE_OPTIONS.map((pref) => {
                const isSelected = selectedPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePreference(pref)}
                    className={`px-4 py-2 rounded-full font-body-sm text-body-sm flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#292A30] border border-accent-insight-purple text-accent-insight-purple'
                        : 'bg-[#202126] border border-border-subtle text-text-secondary hover:bg-[#292A30]'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    )}
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Actions & Footer */}
        <div className="w-full px-margin-mobile pt-8 pb-4 flex flex-col items-center gap-3 mt-auto">
          <button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center font-semibold cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="font-body-sm text-body-sm text-text-secondary hover:text-text-primary transition-colors py-2 cursor-pointer"
          >
            Skip for now
          </button>
          <p className="font-metadata text-metadata text-text-secondary/60 text-center mt-2">
            You can update these preferences anytime in Settings.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProfileSetupPage;
