import { useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: 'home', path: '/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: 'insights', path: '/analytics' },
  { id: 'transactions', label: 'Transactions', icon: 'receipt_long', path: '/transactions' },
  { id: 'budget', label: 'Budget', icon: 'account_balance_wallet', path: '/budget' },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): string => {
    const currentPath = location.pathname;
    if (currentPath === '/dashboard' || currentPath === '/') return 'home';
    if (currentPath.startsWith('/analytics')) return 'analytics';
    if (currentPath.startsWith('/transactions')) return 'transactions';
    if (currentPath.startsWith('/budget')) return 'budget';
    if (currentPath.startsWith('/settings')) return 'settings';
    // AI insights page does NOT activate any primary tab as per AGENTS.md
    return '';
  };

  const activeTab = getActiveTab();

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center items-center px-4 pointer-events-none"
    >
      <div className="pointer-events-auto w-full max-w-[390px] md:max-w-md rounded-[2rem] bg-nav-surface/95 backdrop-blur-xl shadow-2xl shadow-black/30 border border-white/20 flex justify-around items-center px-2.5 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              className={`flex flex-col items-center justify-center transition-all duration-200 relative cursor-pointer ${
                isActive
                  ? 'bg-background text-text-primary rounded-full px-5 py-2 shadow-md border border-border-subtle'
                  : 'text-on-tertiary-fixed-variant hover:text-text-primary px-3 py-2'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] transition-transform ${
                  isActive ? 'icon-filled text-text-primary scale-105' : 'text-neutral-500'
                }`}
              >
                {item.icon}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
