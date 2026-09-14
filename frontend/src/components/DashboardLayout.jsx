import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LogOut, Sparkles, LayoutDashboard } from 'lucide-react';

const DashboardLayout = ({ children, navItems = [] }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Common quick links
  const defaultNav = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: '✨ AI Hub', to: '/ai-hub' },
  ];

  const combinedNav = navItems && navItems.length > 0 ? navItems : defaultNav;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-light dark:border-border-dark px-6 py-8 hidden md:flex flex-col justify-between shrink-0">
        <div>
          <Link to="/dashboard" className="font-display text-xl font-semibold flex items-center gap-2 mb-8">
            <span>AIML Arena</span>
            <span className="font-mono text-[10px] uppercase tracking-wider bg-sticker text-ink-light px-2 py-0.5 rounded-full font-bold">
              AI Hub
            </span>
          </Link>

          <nav className="flex flex-col gap-1.5">
            {combinedNav.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-accent text-white font-semibold shadow-sm'
                      : 'hover:bg-accent/10 hover:text-accent opacity-80 hover:opacity-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-4 pt-6 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-[11px] font-mono opacity-50 uppercase">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs opacity-60 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all text-left"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border-light dark:border-border-dark bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-md sticky top-0 z-30">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider opacity-60">
              {user?.department || 'Arena AIML Platform'} • {user?.role?.toUpperCase()}
            </p>
            <p className="font-display text-lg font-semibold">{user?.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-hub"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-white text-xs font-mono font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              <Sparkles size={13} /> Launch AI Hub
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="p-6 md:p-10 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;