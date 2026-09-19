import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border-light/40 dark:border-border-dark/40 bg-bg-light/80 dark:bg-bg-dark/80 backdrop-blur-md sticky top-0 z-40">
      <Link to="/" className="font-display text-xl font-semibold tracking-tight flex items-center gap-2">
        <span>AIML Arena</span>
      </Link>
      <div className="hidden md:flex items-center gap-8 font-body text-sm">
        <a href="/#events" className="hover:text-accent transition-colors">Events</a>
        <a href="/#about" className="hover:text-accent transition-colors">About</a>
        <a href="/#contact" className="hover:text-accent transition-colors">Contact</a>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        {user ? (
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
          >
            <span>Dashboard</span>
            <span className="font-mono text-[10px] uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
              {user.role}
            </span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 rounded-full bg-ink-light dark:bg-ink-dark text-bg-light dark:text-bg-dark text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;