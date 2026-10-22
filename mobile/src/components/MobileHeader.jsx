import { Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const MobileHeader = ({ title, subtitle, showBadge = true }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 pt-[max(env(safe-area-inset-top),12px)] pb-3 px-5 glass-panel border-b">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight theme-text">
              {title || 'Arena AIML'}
            </span>
            {showBadge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#5B47FB]/15 text-[#5B47FB] dark:text-[#A5B4FC] border border-[#5B47FB]/25">
                <Sparkles size={10} /> AI
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] theme-text-secondary font-mono tracking-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-8 h-8 rounded-full theme-card flex items-center justify-center text-zinc-600 dark:text-zinc-300 active:scale-95 transition-all shadow-sm"
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-[#5B47FB]" />}
          </button>

          {/* User Avatar or Sign In */}
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5B47FB] to-[#06B6D4] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#5B47FB]/20 border border-white/20 active:scale-95 transition-transform"
            >
              {user.name?.[0]?.toUpperCase() || 'S'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1 rounded-full bg-[#5B47FB] text-white text-xs font-medium shadow-sm hover:opacity-95 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
