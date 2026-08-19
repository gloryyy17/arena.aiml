import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LogOut } from 'lucide-react';

const DashboardLayout = ({ children, navItems }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-light dark:border-border-dark px-6 py-8 hidden md:flex flex-col justify-between">
        <div>
          <Link to="/dashboard" className="font-display text-xl font-semibold block mb-10">
            AIML Arena
          </Link>
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="px-3 py-2 rounded-lg text-sm hover:bg-accent/10 hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-border-light dark:border-border-dark">
          <div>
            <p className="text-sm opacity-60">Welcome back,</p>
            <p className="font-display text-lg font-semibold">{user.name}</p>
          </div>
          <ThemeToggle />
        </header>
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;