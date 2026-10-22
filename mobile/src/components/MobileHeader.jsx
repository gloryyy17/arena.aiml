import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MobileHeader = ({ title, subtitle, showBadge = true }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 pt-[max(env(safe-area-inset-top),12px)] pb-3 px-5 glass-panel border-b border-white/5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-white">
              {title || 'Arena AIML'}
            </span>
            {showBadge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#5B47FB]/20 text-[#A5B4FC] border border-[#5B47FB]/30">
                <Sparkles size={10} /> AI
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-zinc-400 font-mono tracking-tight mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

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
            className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
