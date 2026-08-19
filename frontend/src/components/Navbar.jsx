import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 md:px-12 py-6">
      <Link to="/" className="font-display text-xl font-semibold tracking-tight">
        AIML Arena
      </Link>
      <div className="hidden md:flex items-center gap-8 font-body text-sm">
        <Link to="/events" className="hover:text-accent transition-colors">Events</Link>
        <Link to="/about" className="hover:text-accent transition-colors">About</Link>
        <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link
          to="/login"
          className="px-4 py-2 rounded-full bg-ink-light dark:bg-ink-dark text-bg-light dark:text-bg-dark text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;