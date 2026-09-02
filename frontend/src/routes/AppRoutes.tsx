import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute } from '../components/layout/ProtectedRoute.js';
import { AppLayout } from '../components/layout/AppLayout.js';
import { LoginPage } from '../pages/auth/LoginPage.js';
import { SignupPage } from '../pages/auth/SignupPage.js';
import { ProfileSetupPage } from '../pages/onboarding/ProfileSetupPage.js';
import { ConnectAccountPage } from '../pages/onboarding/ConnectAccountPage.js';
import { ConsentPage } from '../pages/onboarding/ConsentPage.js';
import { AccountConnectedPage } from '../pages/onboarding/AccountConnectedPage.js';
import { DashboardPage } from '../pages/dashboard/DashboardPage.js';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage.js';
import { TransactionsPage } from '../pages/transactions/TransactionsPage.js';
import { BudgetPage } from '../pages/budget/BudgetPage.js';
import { AIInsightsPage } from '../pages/insights/AIInsightsPage.js';
import { SettingsPage } from '../pages/settings/SettingsPage.js';
import { LandingPage } from '../pages/landing/LandingPage.js';
import { useAuth } from '../context/AuthContext.js';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl animate-spin text-accent-insight-blue">
            progress_activity
          </span>
          <p className="text-body-sm text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root public landing page or redirect if authenticated */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        }
      />

      {/* Auth Public Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />

      {/* Onboarding Routes */}
      <Route
        path="/onboarding/profile-setup"
        element={
          <ProtectedRoute>
            <ProfileSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/connect-account"
        element={
          <ProtectedRoute>
            <ConnectAccountPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/consent"
        element={
          <ProtectedRoute>
            <ConsentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/success"
        element={
          <ProtectedRoute>
            <AccountConnectedPage />
          </ProtectedRoute>
        }
      />

      {/* Primary App Shell with Floating Bottom Navigation */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/insights" element={<AIInsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
