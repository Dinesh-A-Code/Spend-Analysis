import { useAuth } from '../../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';

interface PlaceholderProps {
  title: string;
  icon: string;
  phase: string;
  description: string;
}

const GenericPlaceholder: React.FC<PlaceholderProps> = ({ title, icon, phase, description }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-start w-full px-margin-mobile pt-10 text-center">
      {/* Top bar */}
      <div className="flex justify-between items-center w-full mb-8">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-text-primary text-2xl icon-filled">
            analytics
          </span>
          <span className="font-headline-md font-bold text-text-primary">Spend Analysis</span>
        </div>
        <button
          onClick={() => logout()}
          className="text-metadata text-text-secondary hover:text-status-error transition-colors px-2 py-1 rounded border border-border-subtle cursor-pointer"
        >
          Sign out
        </button>
      </div>

      <div className="w-full bg-[#202126] border border-border-subtle rounded-2xl p-8 flex flex-col items-center gap-4 max-w-md shadow-lg">
        <div className="w-14 h-14 rounded-full bg-[#292A30] border border-border-subtle flex items-center justify-center text-accent-insight-blue">
          <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>

        <h2 className="text-headline-lg font-bold text-text-primary">{title}</h2>
        <p className="text-body-sm text-text-secondary">{description}</p>

        <div className="inline-flex items-center gap-2 bg-accent-insight-blue/10 text-accent-insight-blue border border-accent-insight-blue/20 px-3.5 py-1.5 rounded-full text-label-bold">
          <span className="w-2 h-2 rounded-full bg-accent-insight-blue animate-pulse" />
          <span>{phase}</span>
        </div>

        {user && (
          <div className="mt-4 pt-4 border-t border-border-subtle w-full text-left">
            <p className="text-metadata text-text-secondary">Logged in as:</p>
            <p className="text-body-sm text-text-primary font-medium">{user.name}</p>
            <p className="text-metadata text-text-secondary">{user.email}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/onboarding/connect-account')}
          className="mt-2 text-body-sm text-accent-insight-purple hover:underline cursor-pointer"
        >
          Manage / Connect Account &rarr;
        </button>
      </div>
    </div>
  );
};

export const DashboardPlaceholderPage: React.FC = () => (
  <GenericPlaceholder
    title="Dashboard"
    icon="home"
    phase="Ready for Phase 4 Implementation"
    description="Your spending overview, UPI source breakdown, and AI insights feed will be rendered here."
  />
);

export const AnalyticsPlaceholderPage: React.FC = () => (
  <GenericPlaceholder
    title="Analytics"
    icon="insights"
    phase="Scheduled for Phase 5"
    description="Multi-period trends, category distributions, and payment source analytics."
  />
);

export const TransactionsPlaceholderPage: React.FC = () => (
  <GenericPlaceholder
    title="Transactions"
    icon="receipt_long"
    phase="Scheduled for Phase 5"
    description="Deterministic transaction ledger, search filters, and transaction details."
  />
);

export const BudgetPlaceholderPage: React.FC = () => (
  <GenericPlaceholder
    title="Budget"
    icon="account_balance_wallet"
    phase="Scheduled for Phase 5"
    description="Category spending plans, budget envelope tracking, and variance metrics."
  />
);

export const SettingsPlaceholderPage: React.FC = () => (
  <GenericPlaceholder
    title="Settings"
    icon="settings"
    phase="Scheduled for Phase 5"
    description="Consent management, privacy controls, and financial data deletion."
  />
);
