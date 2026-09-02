import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = (location.state as { from?: { pathname?: string } })?.from?.pathname;
  // Settings and auth routes must NEVER be a post-login redirect destination
  const isExcludedDestination =
    !rawFrom ||
    rawFrom === '/settings' ||
    rawFrom.startsWith('/onboarding') ||
    rawFrom === '/login' ||
    rawFrom === '/signup' ||
    rawFrom === '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userAccounts = await login({ email: email.trim(), password });
      const hasActiveConsent = userAccounts.some((acc) => acc.consent_granted === 1);

      if (hasActiveConsent) {
        // Authenticated user with connected account lands on Dashboard (or valid deep link)
        const target = !isExcludedDestination ? rawFrom : '/dashboard';
        navigate(target, { replace: true });
      } else {
        // Authenticated user without connected account lands on connect-account onboarding
        navigate('/onboarding/connect-account', { replace: true });
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-text-primary antialiased min-h-screen flex flex-col items-center justify-center font-body-sm relative overflow-hidden px-4">
      {/* Atmospheric background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-accent-insight-blue/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[390px] px-margin-mobile flex flex-col min-h-[780px] justify-between relative z-10 py-10">
        <div className="pt-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-2 mb-10">
            <h1 className="font-headline-md text-headline-md font-bold tracking-tight text-text-primary">
              Spend Analysis
            </h1>
          </div>

          {/* Welcome Header */}
          <div className="mb-8">
            <h2 className="font-headline-lg text-headline-lg font-semibold mb-2">Welcome back</h2>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Sign in to continue managing your spending.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                className="block font-label-bold text-label-bold text-text-secondary mb-2 uppercase tracking-wider"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-12 pl-12 pr-4 rounded-lg bg-[#292A30] border border-border-subtle text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-insight-blue focus:border-accent-insight-blue transition-colors text-body-lg"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block font-label-bold text-label-bold text-text-secondary mb-2 uppercase tracking-wider"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full h-12 pl-12 pr-12 rounded-lg bg-[#292A30] border border-border-subtle text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent-insight-blue focus:border-accent-insight-blue transition-colors text-body-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => alert('Password reset is simulated in MVP. Use your registered password or create a new account.')}
                  className="font-metadata text-metadata text-accent-insight-blue hover:text-accent-insight-blue/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-full border border-border-subtle text-text-primary font-label-bold text-label-bold hover:bg-surface-container-highest active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm bg-surface-container-high disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span>Signing in...</span>
                  <span className="material-symbols-outlined animate-spin text-sm">
                    progress_activity
                  </span>
                </>
              ) : (
                <span>Log in</span>
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center mt-6">
              <p className="font-body-sm text-body-sm text-text-secondary">
                Don't have an account?{' '}
                <Link to="/signup" className="text-text-primary font-medium hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer Trust Note */}
        <div className="pb-6 text-center px-4">
          <p className="font-metadata text-metadata text-text-metadata leading-relaxed">
            Your financial information is accessed through consent-based connections. We never ask for your bank password or UPI PIN.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
