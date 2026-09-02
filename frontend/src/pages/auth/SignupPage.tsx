import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: fullName.trim(),
        email: email.trim(),
        password,
      });
      // Navigate to onboarding profile setup flow
      navigate('/onboarding/profile-setup');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col items-center justify-start overflow-x-hidden pt-8 pb-12 px-margin-mobile selection:bg-accent-insight-purple selection:text-white">
      {/* Header Section */}
      <header className="w-full max-w-[390px] flex flex-col items-start mb-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-text-primary text-2xl icon-filled">
            analytics
          </span>
          <span className="text-headline-md font-headline-md font-bold text-text-primary">
            Spend Analysis
          </span>
        </div>
        <h1 className="text-headline-lg font-headline-lg font-semibold text-text-primary mb-2">
          Create your account
        </h1>
        <p className="text-body-lg font-body-lg text-text-secondary">
          Set up your account to start understanding your spending.
        </p>
      </header>

      {/* Main Form Section */}
      <main className="w-full max-w-[390px] flex-1 flex flex-col gap-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-bold font-label-bold text-on-surface uppercase" htmlFor="fullName">
              Full name
            </label>
            <div className="relative rounded-lg bg-surface-container border border-border-subtle input-glow transition-all duration-200">
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full bg-transparent border-none text-body-lg font-body-lg text-text-primary placeholder:text-text-secondary focus:ring-0 py-3.5 px-4 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-bold font-label-bold text-on-surface uppercase" htmlFor="email">
              Email
            </label>
            <div className="relative rounded-lg bg-surface-container border border-border-subtle input-glow transition-all duration-200">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-transparent border-none text-body-lg font-body-lg text-text-primary placeholder:text-text-secondary focus:ring-0 py-3.5 px-4 rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-label-bold font-label-bold text-on-surface uppercase" htmlFor="password">
              Password
            </label>
            <div className="relative rounded-lg bg-surface-container border border-border-subtle input-glow transition-all duration-200 flex items-center pr-3">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                className="w-full bg-transparent border-none text-body-lg font-body-lg text-text-primary placeholder:text-text-secondary focus:ring-0 py-3.5 pl-4 pr-2 rounded-lg outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                className="p-1 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
            <span className="text-metadata font-metadata text-text-metadata mt-1">
              Use at least 6 characters.
            </span>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-label-bold font-label-bold text-on-surface uppercase" htmlFor="confirmPassword">
              Confirm password
            </label>
            <div className="relative rounded-lg bg-surface-container border border-border-subtle input-glow transition-all duration-200 flex items-center pr-3">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="w-full bg-transparent border-none text-body-lg font-body-lg text-text-primary placeholder:text-text-secondary focus:ring-0 py-3.5 pl-4 pr-2 rounded-lg outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Toggle password visibility"
                className="p-1 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3 mt-2">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-5 h-5 bg-surface-container border-border-subtle rounded text-accent-insight-purple focus:ring-accent-insight-purple focus:ring-2 focus:ring-offset-surface-dim focus:ring-offset-2 cursor-pointer"
              />
            </div>
            <label htmlFor="terms" className="text-body-sm font-body-sm text-text-secondary leading-tight pt-[2px] cursor-pointer">
              I agree to the{' '}
              <span className="text-text-primary font-medium">Terms of Service</span> and{' '}
              <span className="text-text-primary font-medium">Privacy Policy</span>.
            </label>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-fixed-dim hover:bg-primary-fixed text-on-primary-fixed text-body-lg font-semibold py-4 rounded-xl shadow-lg shadow-black/20 transition-all active:scale-[0.98] flex justify-center items-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
            <p className="text-center text-body-sm font-body-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-insight-purple hover:text-white transition-colors font-medium ml-1">
                Log in
              </Link>
            </p>
          </div>
        </form>
      </main>

      {/* Trust Footer */}
      <footer className="w-full max-w-[390px] mt-10 mb-4 border-border-subtle flex flex-col items-center justify-center opacity-80">
        <p className="text-metadata font-metadata text-text-metadata text-center max-w-[300px] leading-relaxed">
          Your financial information is accessed through consent-based connections. We never ask for your bank password or UPI PIN.
        </p>
      </footer>
    </div>
  );
};

export default SignupPage;
