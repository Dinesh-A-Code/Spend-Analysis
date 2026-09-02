import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-lg flex flex-col selection:bg-accent-insight-blue selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-border-subtle">
        <div className="flex justify-between items-center h-16 md:h-20 px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-primary cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-2xl text-accent-insight-blue"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monitoring
            </span>
            <span className="font-headline-md md:font-headline-lg text-headline-md md:text-headline-lg font-bold tracking-tight">
              Spend Analysis
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-label-bold text-label-bold uppercase tracking-wider text-text-secondary">
            <a href="#features" className="hover:text-text-primary transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-text-primary transition-colors">
              How it Works
            </a>
            <a href="#security" className="hover:text-text-primary transition-colors">
              Security
            </a>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hover:text-text-primary transition-colors uppercase cursor-pointer"
            >
              Login
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="md:hidden text-text-secondary hover:text-text-primary font-label-bold text-label-bold px-3 py-1.5 rounded-full border border-border-subtle transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="font-label-bold text-label-bold bg-primary text-on-primary px-5 py-2.5 rounded-full hover:bg-surface-tint transition-all active:scale-95 duration-200 shadow-sm cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 md:pt-28 pb-20 md:pb-28 overflow-hidden bg-background">
          {/* Subtle Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-insight-blue/10 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-accent-insight-purple/10 blur-[140px] rounded-full pointer-events-none" />

          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop relative z-10">
            <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center">
              {/* Hero Text */}
              <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-subtle bg-surface-container text-metadata font-metadata text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span>Secure & Private Data Analysis</span>
                </div>

                <h1 className="font-display-currency-mobile md:font-display-currency text-display-currency-mobile md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight">
                  Understand Your Money.
                  <br />
                  <span className="text-primary font-bold">Spend Smarter.</span>
                </h1>

                <p className="font-body-lg text-body-lg text-text-secondary max-w-xl mx-auto md:mx-0 leading-relaxed">
                  Securely analyze your spending, track UPI payments, manage budgets, and get
                  intelligent, data-grounded insights from your financial transactions.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="font-label-bold text-label-bold bg-primary text-on-primary px-8 py-3.5 rounded-full hover:bg-surface-tint transition-all active:scale-95 duration-200 shadow-lg cursor-pointer"
                  >
                    Get Started
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-label-bold text-label-bold border border-border-subtle text-text-primary px-8 py-3.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              </div>

              {/* Hero Visual (Mockup Dashboard Preview) */}
              <div className="flex-1 w-full max-w-md md:max-w-none relative">
                <div className="relative w-full rounded-2xl border border-border-subtle bg-surface-container-low p-6 shadow-2xl space-y-5">
                  {/* Top Mock Window Bar */}
                  <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-border-subtle" />
                      <div className="w-3 h-3 rounded-full bg-border-subtle" />
                      <div className="w-3 h-3 rounded-full bg-border-subtle" />
                    </div>
                    <span className="text-xs font-metadata text-text-secondary">
                      Live Spending Preview
                    </span>
                  </div>

                  {/* Mock Spending Card */}
                  <div className="p-4 rounded-xl bg-surface-container border border-border-subtle space-y-2">
                    <span className="text-xs text-text-secondary font-label-bold uppercase">
                      August Spending
                    </span>
                    <div className="font-display-currency-mobile text-display-currency-mobile font-bold text-text-primary">
                      ₹12,700
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-status-success font-medium">
                      <span className="material-symbols-outlined text-sm">trending_down</span>
                      <span>12% less than last month</span>
                    </div>
                  </div>

                  {/* Mock UPI Source Breakdown */}
                  <div className="space-y-2.5">
                    <span className="text-xs text-text-secondary font-label-bold uppercase tracking-wider block">
                      Payment Source Breakdown
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-surface-container border border-accent-insight-blue/30 text-center">
                        <p className="text-xs text-text-secondary">Google Pay</p>
                        <p className="font-bold text-text-primary text-sm mt-0.5">₹520</p>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container border border-accent-insight-purple/30 text-center">
                        <p className="text-xs text-text-secondary">PhonePe</p>
                        <p className="font-bold text-text-primary text-sm mt-0.5">₹430</p>
                      </div>
                      <div className="p-3 rounded-xl bg-surface-container border border-status-success/30 text-center">
                        <p className="text-xs text-text-secondary">Paytm</p>
                        <p className="font-bold text-text-primary text-sm mt-0.5">₹290</p>
                      </div>
                    </div>
                  </div>

                  {/* Mock AI Insight Capsule */}
                  <div className="p-3.5 rounded-xl bg-surface-container border-l-4 border-l-accent-insight-purple border border-border-subtle flex items-center gap-3">
                    <span className="material-symbols-outlined text-accent-insight-purple text-lg">
                      auto_awesome
                    </span>
                    <p className="text-xs text-text-primary leading-snug">
                      Food spending is 24% of your total budget. You could save ₹657 on delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Section */}
        <section className="py-20 md:py-28 bg-surface-container-lowest border-y border-border-subtle" id="features">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop space-y-12">
            <div className="text-center md:text-left space-y-3">
              <h2 className="font-headline-lg md:text-4xl text-headline-lg font-bold text-text-primary">
                Intelligent Financial Analysis
              </h2>
              <p className="font-body-lg text-body-lg text-text-secondary max-w-2xl">
                Powerful tools to break down your spending habits without compromising privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Feature 1: Wide */}
              <div className="md:col-span-8 bg-surface-container-low rounded-2xl border border-border-subtle p-8 flex flex-col md:flex-row gap-6 items-center shadow-sm">
                <div className="flex-1 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-accent-insight-blue">
                    <span className="material-symbols-outlined text-2xl">lock</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
                    Secure Financial Data
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Connect financial accounts through consent-based access. Your banking passwords
                    and UPI PINs are never stored, ensuring complete data sovereignty.
                  </p>
                </div>
                <div className="w-full md:w-48 h-36 rounded-xl bg-surface-container border border-border-subtle flex items-center justify-center text-accent-insight-blue">
                  <span className="material-symbols-outlined text-5xl opacity-40">shield</span>
                </div>
              </div>

              {/* Feature 2: Square */}
              <div className="md:col-span-4 bg-surface-container-low rounded-2xl border border-border-subtle p-8 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-accent-insight-purple">
                  <span className="material-symbols-outlined text-2xl">payments</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
                    UPI Spending Analysis
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Understand where your money goes across Google Pay, PhonePe, Paytm, and other payment sources.
                  </p>
                </div>
              </div>

              {/* Feature 3: Square */}
              <div className="md:col-span-4 bg-surface-container-low rounded-2xl border border-border-subtle p-8 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-status-success">
                  <span className="material-symbols-outlined text-2xl">monitoring</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
                    Smart Analytics
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    See spending trends, categories, and payment patterns clearly with intuitive visual charts.
                  </p>
                </div>
              </div>

              {/* Feature 4: Wide */}
              <div className="md:col-span-8 bg-surface-container-low rounded-2xl border border-border-subtle p-8 flex flex-col justify-between space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
                    AI-Powered Insights
                  </h3>
                  <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
                    Turn transaction data into understandable recommendations. Get notified about
                    budget overages or recurring subscription opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 md:py-28 bg-background" id="how-it-works">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop space-y-12">
            <div className="text-center space-y-3">
              <h2 className="font-headline-lg md:text-4xl text-headline-lg font-bold text-text-primary">
                How It Works
              </h2>
              <p className="font-body-lg text-body-lg text-text-secondary">
                A simple, transparent flow to financial clarity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-6 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-full bg-surface-container border border-border-subtle flex items-center justify-center text-accent-insight-blue font-bold text-xl">
                  01
                </div>
                <h4 className="font-headline-md text-headline-md font-semibold text-text-primary">
                  Connect Securely
                </h4>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Authorize your financial institution through sandbox consent.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-6 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-full bg-surface-container border border-border-subtle flex items-center justify-center text-accent-insight-purple font-bold text-xl">
                  02
                </div>
                <h4 className="font-headline-md text-headline-md font-semibold text-text-primary">
                  Auto-Categorize
                </h4>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Transactions are deterministically organized into spending envelopes.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-6 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-full bg-surface-container border border-border-subtle flex items-center justify-center text-status-success font-bold text-xl">
                  03
                </div>
                <h4 className="font-headline-md text-headline-md font-semibold text-text-primary">
                  Review Analytics
                </h4>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Explore payment sources, daily trends, and month-on-month variance.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-2xl border border-border-subtle p-6 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 mx-auto rounded-full bg-surface-container border border-border-subtle flex items-center justify-center text-status-warning font-bold text-xl">
                  04
                </div>
                <h4 className="font-headline-md text-headline-md font-semibold text-text-primary">
                  Optimize Spending
                </h4>
                <p className="font-body-sm text-body-sm text-text-secondary">
                  Act on verified recommendations to meet your personal savings target.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-20 md:py-28 bg-surface-container-lowest border-y border-border-subtle" id="security">
          <div className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <span className="text-status-success font-label-bold text-label-bold uppercase tracking-wider block">
                  Bank-Grade Security
                </span>
                <h2 className="font-headline-lg md:text-4xl text-headline-lg font-bold text-text-primary">
                  Your financial data stays under your control.
                </h2>
                <p className="font-body-lg text-body-lg text-text-secondary">
                  We built Spend Analysis with consent and data privacy as the core foundation, not an
                  afterthought.
                </p>
                <ul className="space-y-4 pt-2">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-status-success/20 text-status-success flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                    <div>
                      <h4 className="font-body-lg font-medium text-text-primary">
                        Consent-based access
                      </h4>
                      <p className="text-body-sm text-text-secondary">
                        You explicitly grant access with full visibility into data scope.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-status-success/20 text-status-success flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                    <div>
                      <h4 className="font-body-lg font-medium text-text-primary">
                        No bank passwords or PINs
                      </h4>
                      <p className="text-body-sm text-text-secondary">
                        We never request or store your banking credentials or UPI PINs.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-status-success/20 text-status-success flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                    <div>
                      <h4 className="font-body-lg font-medium text-text-primary">
                        Clear revocation & data deletion
                      </h4>
                      <p className="text-body-sm text-text-secondary">
                        Revoke consent or delete all stored financial data at any time.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="flex-1 w-full max-w-sm">
                <div className="aspect-square rounded-3xl bg-surface-container-low border border-border-subtle p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                  <div className="w-24 h-24 rounded-full bg-status-success/10 border border-status-success/30 flex items-center justify-center text-status-success">
                    <span className="material-symbols-outlined text-5xl">verified_user</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md font-bold text-text-primary">
                    100% Consent First
                  </h3>
                  <p className="text-body-sm text-text-secondary">
                    Account Aggregator sandbox compliant architecture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 md:py-32 text-center bg-background">
          <div className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop space-y-6">
            <h2 className="font-display-currency-mobile md:font-display-currency text-display-currency-mobile md:text-5xl font-bold text-text-primary">
              Ready to understand your spending?
            </h2>
            <p className="font-body-lg text-body-lg text-text-secondary">
              Join Spend Analysis today and take control of your personal finances.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="font-label-bold text-label-bold bg-primary text-on-primary px-10 py-4 rounded-full hover:bg-surface-tint transition-all active:scale-95 duration-200 shadow-xl cursor-pointer"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-label-bold text-label-bold border border-border-subtle text-text-primary px-10 py-4 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-border-subtle bg-surface-container-lowest">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-margin-mobile md:px-margin-desktop max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 text-text-primary">
            <span className="material-symbols-outlined text-accent-insight-blue text-sm">
              monitoring
            </span>
            <span className="font-label-bold text-label-bold">Spend Analysis</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-text-secondary">
            <a href="#security" className="hover:text-text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#security" className="hover:text-text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#security" className="hover:text-text-primary transition-colors">
              Security
            </a>
          </div>
          <p className="text-xs text-text-metadata">
            © 2026 Spend Analysis. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
