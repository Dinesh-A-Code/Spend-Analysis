import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../services/api.js';
import type { ConnectedAccount } from '../../types/index.js';

type DesktopSection = 'all' | 'profile' | 'financial' | 'privacy' | 'security';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [txCount, setTxCount] = useState<number>(0);
  const [expandedConsentIds, setExpandedConsentIds] = useState<Record<number, boolean>>({});
  const [activeDesktopSection, setActiveDesktopSection] = useState<DesktopSection>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [accountToRevoke, setAccountToRevoke] = useState<ConnectedAccount | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [accountsRes, txRes] = await Promise.all([
        api.getAccounts(),
        api.getTransactions().catch(() => ({ transactions: [] })),
      ]);
      setAccounts(accountsRes.accounts || []);
      setTxCount(txRes.transactions?.length || 0);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleConsentExpand = (accountId: number) => {
    setExpandedConsentIds((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  };

  const handleRevokeConsent = async () => {
    if (!accountToRevoke) return;

    try {
      setIsRevoking(true);
      await api.revokeConsent(accountToRevoke.id);
      setActionMessage({
        type: 'success',
        text: `Consent for ${accountToRevoke.institution_name} has been revoked. Future data sync is disabled.`,
      });
      setAccountToRevoke(null);
      await loadData();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to revoke consent.',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDeleteFinancialData = async () => {
    try {
      setIsDeleting(true);
      const res = await api.deleteFinancialData();
      setShowDeleteModal(false);
      setActionMessage({
        type: 'success',
        text: res.message || 'All stored financial data has been permanently cleared.',
      });
      await loadData();
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to delete financial data.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col flex-1 w-full antialiased pb-12">
      {/* Top App Bar */}
      <header className="flex justify-between items-center w-full px-margin-mobile py-4 bg-background top-0 z-40 sticky border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border border-border-subtle flex items-center justify-center font-semibold text-text-primary">
            {initial}
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-headline-md font-headline-md font-bold text-on-surface">
              Spend Analysis
            </h1>
            <span className="text-on-surface-variant hidden md:inline">|</span>
            <span className="font-headline-md text-headline-md text-on-surface-variant hidden md:inline">
              Settings & Privacy
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Notifications"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container border border-border-subtle text-on-surface scale-95 active:scale-90 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
        </button>
      </header>

      {/* Main Canvas */}
      <main className="px-margin-mobile md:px-margin-desktop py-6 max-w-5xl mx-auto space-y-6 w-full">
        {/* Toast / Status Notification */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-body-sm transition-all ${
              actionMessage.type === 'success'
                ? 'bg-status-success/10 border-status-success/30 text-status-success'
                : 'bg-status-error/10 border-status-error/30 text-status-error'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-lg">
                {actionMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{actionMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionMessage(null)}
              className="p-1 hover:opacity-80 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Desktop Layout Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Desktop Left Sidebar (Navigation Panel) */}
          <aside className="hidden md:flex md:col-span-4 flex-col gap-1.5 border-r border-border-subtle pr-6">
            <button
              type="button"
              onClick={() => setActiveDesktopSection('all')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer font-body-sm ${
                activeDesktopSection === 'all'
                  ? 'bg-surface-container-high text-text-primary font-semibold border border-border-subtle'
                  : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xl">tune</span>
              <span>Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDesktopSection('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer font-body-sm ${
                activeDesktopSection === 'profile'
                  ? 'bg-surface-container-high text-text-primary font-semibold border border-border-subtle'
                  : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xl">person</span>
              <span>Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDesktopSection('financial')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer font-body-sm ${
                activeDesktopSection === 'financial'
                  ? 'bg-surface-container-high text-text-primary font-semibold border border-border-subtle'
                  : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xl">account_balance</span>
              <span>Financial Connections</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDesktopSection('privacy')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer font-body-sm ${
                activeDesktopSection === 'privacy'
                  ? 'bg-surface-container-high text-text-primary font-semibold border border-border-subtle'
                  : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xl">privacy_tip</span>
              <span>Data & Privacy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDesktopSection('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer font-body-sm ${
                activeDesktopSection === 'security'
                  ? 'bg-surface-container-high text-text-primary font-semibold border border-border-subtle'
                  : 'text-text-secondary hover:bg-surface-container hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xl">security</span>
              <span>Security</span>
            </button>
          </aside>

          {/* Right Content Area */}
          <div className="col-span-1 md:col-span-8 space-y-6">
            {/* Header Section */}
            {(activeDesktopSection === 'all' || activeDesktopSection === 'profile') && (
              <section className="space-y-4">
                <div>
                  <h2 className="font-headline-lg md:font-display-currency-mobile text-headline-lg md:text-display-currency-mobile font-bold text-text-primary mb-1">
                    Settings
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Manage your account, connections and data
                  </p>
                </div>

                {/* Profile Card */}
                <div className="bg-surface-container-low border border-border-subtle rounded-2xl p-5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-surface-container-highest border border-border-subtle flex items-center justify-center font-bold text-xl text-text-primary">
                      {initial}
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md font-semibold text-text-primary">
                        {user?.name || 'Amit Sharma'}
                      </h3>
                      <p className="font-body-sm text-body-sm text-text-secondary">
                        {user?.email || 'Personal Account'}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-label-bold text-text-secondary border border-border-subtle uppercase">
                    Active
                  </span>
                </div>
              </section>
            )}

            {/* Financial Connections Section */}
            {(activeDesktopSection === 'all' || activeDesktopSection === 'financial') && (
              <section className="space-y-3">
                <div className="flex justify-between items-center pl-1">
                  <h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider">
                    Financial Connections
                  </h3>
                  <button
                    type="button"
                    onClick={() => navigate('/onboarding/connect-account')}
                    className="text-xs font-label-bold text-accent-insight-blue hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Connect Account</span>
                  </button>
                </div>

                {isLoading ? (
                  <div className="p-6 bg-surface-container-low rounded-2xl border border-border-subtle text-center text-text-secondary">
                    <span className="material-symbols-outlined text-2xl animate-spin text-accent-insight-blue">
                      progress_activity
                    </span>
                  </div>
                ) : accounts.length === 0 ? (
                  <div className="bg-surface-container-low border border-border-subtle rounded-2xl p-6 text-center space-y-3">
                    <span className="material-symbols-outlined text-3xl text-text-secondary opacity-50">
                      account_balance
                    </span>
                    <p className="text-body-sm text-text-secondary">
                      No financial accounts currently connected.
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/onboarding/connect-account')}
                      className="px-4 py-2 bg-surface-container-highest hover:bg-surface-bright text-text-primary text-body-sm font-medium rounded-xl border border-border-subtle transition-colors cursor-pointer"
                    >
                      Connect Account
                    </button>
                  </div>
                ) : (
                  accounts.map((acc) => {
                    const isExpanded = !!expandedConsentIds[acc.id];
                    const hasActiveConsent = acc.consent_granted === 1;

                    return (
                      <div
                        key={acc.id}
                        className="bg-surface-container-low border border-border-subtle rounded-2xl p-5 relative overflow-hidden group shadow-sm"
                      >
                        {/* Subtle left accent line */}
                        <div
                          className={`absolute top-0 left-0 w-1 h-full ${
                            hasActiveConsent ? 'bg-accent-insight-blue' : 'bg-status-warning'
                          }`}
                        />

                        {/* Top Bank Info */}
                        <div className="flex justify-between items-start mb-3 pl-2">
                          <div>
                            <h4 className="font-headline-md text-headline-md font-semibold text-text-primary">
                              {acc.institution_name}
                            </h4>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {acc.account_type || 'Savings Account'} • {acc.account_number_masked}
                            </p>
                          </div>
                          <div className="p-2.5 bg-surface-container rounded-xl border border-border-subtle text-accent-insight-blue">
                            <span className="material-symbols-outlined text-lg icon-filled">
                              account_balance
                            </span>
                          </div>
                        </div>

                        {/* Connection & Consent Status Row */}
                        <div className="flex items-center gap-2 pl-2 mb-3">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              hasActiveConsent
                                ? 'bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                : 'bg-status-warning'
                            }`}
                          />
                          <span className="font-body-sm text-body-sm text-text-primary font-medium">
                            {hasActiveConsent ? 'Connected' : 'Disconnected'}
                          </span>
                          <span className="text-text-secondary">•</span>
                          <span
                            className={`font-body-sm text-body-sm ${
                              hasActiveConsent ? 'text-on-surface-variant' : 'text-status-warning'
                            }`}
                          >
                            Consent: {hasActiveConsent ? 'Active' : 'Revoked'}
                          </span>
                        </div>

                        {/* Expandable Consent Details Action */}
                        <div className="pl-2 border-t border-border-subtle pt-3 mt-1">
                          <button
                            type="button"
                            onClick={() => toggleConsentExpand(acc.id)}
                            className="flex items-center justify-between w-full text-accent-insight-blue hover:opacity-80 transition-opacity font-body-sm text-body-sm cursor-pointer"
                          >
                            <span>View consent details</span>
                            <span
                              className={`material-symbols-outlined text-lg transition-transform duration-300 ${
                                isExpanded ? 'rotate-90' : 'rotate-0'
                              }`}
                            >
                              arrow_forward
                            </span>
                          </button>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="mt-3 bg-surface-container border border-border-subtle rounded-xl p-4 space-y-3">
                              <div className="flex justify-between items-center text-body-sm">
                                <span className="text-text-secondary">Consent ID</span>
                                <span className="text-text-primary font-mono text-xs">
                                  {acc.consent_id || 'CNS-MOCK-ACTIVE'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-body-sm">
                                <span className="text-text-secondary">Valid until</span>
                                <span className="text-text-primary font-medium">
                                  {acc.consent_expiry ? acc.consent_expiry.slice(0, 10) : '01 Sep 2027'}
                                </span>
                              </div>

                              {hasActiveConsent ? (
                                <button
                                  type="button"
                                  onClick={() => setAccountToRevoke(acc)}
                                  className="w-full py-2.5 bg-status-warning/10 border border-status-warning/30 text-status-warning font-label-bold text-label-bold rounded-xl hover:bg-status-warning/20 transition-colors cursor-pointer"
                                >
                                  REVOKE CONSENT
                                </button>
                              ) : (
                                <div className="p-2.5 rounded-lg bg-surface-container-high border border-border-subtle text-center text-body-sm text-text-secondary">
                                  Consent has been revoked. Future data sync is stopped.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            )}

            {/* Data & Privacy Section */}
            {(activeDesktopSection === 'all' || activeDesktopSection === 'privacy') && (
              <section className="space-y-3">
                <h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider pl-1">
                  Data & Privacy
                </h3>
                <div className="bg-surface-container-low border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
                  {/* Row 1: Financial Data */}
                  <div className="flex items-center justify-between p-4 border-b border-border-subtle hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-secondary">database</span>
                      <div>
                        <p className="font-body-lg text-body-lg text-text-primary">Financial data</p>
                        <p className="text-xs text-text-secondary">
                          {txCount} stored transactions • Available for spending analysis
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/transactions')}
                      className="text-xs text-accent-insight-blue hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View</span>
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>

                  {/* Row 2: Connected Accounts */}
                  <div className="flex items-center justify-between p-4 border-b border-border-subtle hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-secondary">link</span>
                      <div>
                        <p className="font-body-lg text-body-lg text-text-primary">Connected accounts</p>
                        <p className="text-xs text-text-secondary">
                          {accounts.length}{' '}
                          {accounts.length === 1 ? 'account configured' : 'accounts configured'}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary text-sm">
                      chevron_right
                    </span>
                  </div>

                  {/* Row 3: Consent History */}
                  <div className="flex items-center justify-between p-4 hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-secondary">history</span>
                      <div>
                        <p className="font-body-lg text-body-lg text-text-primary">Consent history</p>
                        <p className="text-xs text-text-secondary">
                          {accounts.filter((a) => a.consent_granted === 1).length} active •{' '}
                          {accounts.filter((a) => a.consent_granted === 0).length} revoked
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary text-sm">
                      chevron_right
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* How your data is used info card */}
            {(activeDesktopSection === 'all' || activeDesktopSection === 'privacy') && (
              <section>
                <div className="bg-surface-container-highest border border-border-subtle rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
                  <span className="material-symbols-outlined text-accent-insight-blue mt-0.5">
                    info
                  </span>
                  <div>
                    <h4 className="font-headline-md text-headline-md font-semibold text-text-primary mb-1">
                      How your data is used
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Your transaction data is securely analyzed locally to generate spending insights,
                      categorize expenses, and detect recurring patterns. We do not sell your personal
                      financial data to third parties.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Security Section */}
            {(activeDesktopSection === 'all' || activeDesktopSection === 'security') && (
              <section className="space-y-3">
                <h3 className="font-label-bold text-label-bold text-on-surface-variant uppercase tracking-wider pl-1">
                  Security
                </h3>
                <div className="bg-surface-container-low border border-border-subtle rounded-2xl overflow-hidden shadow-sm">
                  {/* Password row */}
                  <div className="flex items-center justify-between p-4 border-b border-border-subtle hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-secondary">lock</span>
                      <div>
                        <p className="font-body-lg text-body-lg text-text-primary">Password</p>
                        <p className="text-xs text-text-secondary">••••••••••••</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary text-sm">
                      chevron_right
                    </span>
                  </div>

                  {/* Active Sessions */}
                  <div className="flex items-center justify-between p-4 border-b border-border-subtle hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-secondary">devices</span>
                      <div>
                        <p className="font-body-lg text-body-lg text-text-primary">Active sessions</p>
                        <p className="text-xs text-status-success">Current device (Active now)</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-text-secondary text-sm">
                      chevron_right
                    </span>
                  </div>

                  {/* Log Out Button */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-4 hover:bg-surface-container transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-status-error">logout</span>
                      <span className="font-body-lg text-body-lg text-status-error font-medium">
                        Log out
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-status-error text-sm">
                      chevron_right
                    </span>
                  </button>
                </div>
              </section>
            )}

            {/* Danger Zone: Delete Financial Data */}
            {(activeDesktopSection === 'all' || activeDesktopSection === 'privacy') && (
              <section className="pt-4 border-t border-border-subtle space-y-4">
                <div>
                  <h4 className="font-headline-md text-headline-md font-semibold text-status-error mb-1">
                    Danger Zone
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Deleting your financial data will permanently remove all categorized spend history,
                    insights, and budgets from the Spend Analysis app.{' '}
                    <strong className="text-text-primary font-medium">
                      This will not delete your actual bank records or UPI history.
                    </strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="px-5 py-2.5 bg-transparent border border-status-error text-status-error font-label-bold text-label-bold rounded-xl hover:bg-status-error/10 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">delete_forever</span>
                  <span>DELETE FINANCIAL DATA</span>
                </button>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Revoke Consent Confirmation Modal */}
      {accountToRevoke && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
          onClick={() => setAccountToRevoke(null)}
        >
          <div
            className="bg-surface-container-high w-full max-w-md rounded-2xl border border-border-subtle p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-status-warning">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="font-headline-md text-headline-md font-bold text-text-primary">
                Revoke Consent?
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to revoke consent for{' '}
              <strong className="text-text-primary font-medium">
                {accountToRevoke.institution_name}
              </strong>
              ? This will stop future transaction synchronization. Existing stored transactions will
              remain available until deleted.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAccountToRevoke(null)}
                disabled={isRevoking}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-text-secondary hover:text-text-primary text-body-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeConsent}
                disabled={isRevoking}
                className="px-4 py-2 rounded-xl bg-status-warning/20 border border-status-warning/40 text-status-warning hover:bg-status-warning/30 text-body-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isRevoking ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Financial Data Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-surface-container-high w-full max-w-md rounded-2xl border border-status-error/30 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-status-error">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
              <h3 className="font-headline-md text-headline-md font-bold text-text-primary">
                Delete All Financial Data?
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              This action will permanently delete all stored transactions, budgets, insights, and
              connected account configurations for your Spend Analysis profile.
            </p>
            <div className="p-3 bg-surface-container rounded-xl border border-border-subtle text-xs text-text-secondary space-y-1">
              <p>• Your user login account (email/password) will remain intact.</p>
              <p>• Your actual bank records and UPI apps are NOT affected.</p>
              <p>• This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-text-secondary hover:text-text-primary text-body-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFinancialData}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-status-error hover:bg-status-error/90 text-white text-body-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                {isDeleting ? 'Deleting...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
