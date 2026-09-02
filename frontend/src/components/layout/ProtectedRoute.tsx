import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl animate-spin text-accent-insight-blue">
            progress_activity
          </span>
          <p className="text-body-sm text-text-secondary">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const fromPath = location.pathname;
    const isExcluded = fromPath === '/settings' || fromPath === '/login' || fromPath === '/signup';
    const redirectState = isExcluded ? undefined : { from: location };
    return <Navigate to="/login" state={redirectState} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
