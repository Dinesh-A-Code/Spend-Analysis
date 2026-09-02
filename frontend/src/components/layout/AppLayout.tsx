import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '../navigation/BottomNav.js';

interface AppLayoutProps {
  children?: ReactNode;
  showNav?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-start overflow-x-hidden relative selection:bg-accent-insight-blue selection:text-white">
      {/* Centered responsive container */}
      <div className="w-full max-w-[600px] md:max-w-5xl flex flex-col flex-1 pb-nav">
        {children || <Outlet />}
      </div>
      {showNav && <BottomNav />}
    </div>
  );
};

export default AppLayout;
