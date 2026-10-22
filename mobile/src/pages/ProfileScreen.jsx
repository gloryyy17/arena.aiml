import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { getServerUrl } from '../api/axios';
import ServerConfigModal from '../components/ServerConfigModal';
import { User, LogOut, ShieldCheck, Mail, BookOpen, Smartphone, Sun, Moon, Server } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showServerModal, setShowServerModal] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen pb-24 theme-bg theme-text transition-colors">
        <MobileHeader title="Profile" subtitle="Student Account" />
        <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full theme-card-subtle text-zinc-400 flex items-center justify-center mx-auto">
            <User size={28} />
          </div>
          <h2 className="font-display text-lg font-bold theme-text">No Profile Active</h2>
          <p className="text-xs theme-text-secondary">
            Sign in with your student credentials to view your profile and event passes.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-full bg-[#5B47FB] text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 theme-bg theme-text transition-colors">
      <MobileHeader title="Profile" subtitle="Student Account" />

      <main className="max-w-md mx-auto px-5 pt-4 space-y-5">
        {/* Student ID Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#5B47FB]/90 to-[#3B82F6] text-white shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-xl shadow-lg border border-white/30">
              {user.name?.[0]?.toUpperCase() || 'S'}
            </div>

            <div className="space-y-0.5 overflow-hidden">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white bg-black/20 px-2 py-0.5 rounded-full inline-block">
                STUDENT PASS
              </span>
              <h2 className="font-display text-lg font-bold text-white truncate">
                {user.name}
              </h2>
              <p className="text-xs text-white/80 truncate">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20 text-xs font-mono">
            <div>
              <p className="text-[10px] uppercase text-white/70">Department</p>
              <p className="font-semibold text-white mt-0.5 truncate">
                {user.department || 'AI & Data Science'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/70">Student Status</p>
              <p className="font-semibold text-emerald-200 mt-0.5 flex items-center gap-1">
                <ShieldCheck size={13} /> Active
              </p>
            </div>
          </div>
        </div>

        {/* Settings & Preferences */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-mono uppercase tracking-wider theme-text-secondary px-2">
            App Preferences
          </h3>

          <div className="rounded-3xl theme-card divide-y theme-border overflow-hidden">
            {/* Theme Toggle */}
            <div
              onClick={toggleTheme}
              className="p-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl theme-card-subtle flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                  {isDark ? <Moon size={16} className="text-[#5B47FB]" /> : <Sun size={16} className="text-amber-500" />}
                </div>
                <div>
                  <p className="text-xs font-semibold theme-text">Theme Appearance</p>
                  <p className="text-[11px] theme-text-secondary">Currently: {isDark ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#5B47FB] font-semibold">
                Switch to {isDark ? 'Light' : 'Dark'} →
              </span>
            </div>

            {/* Server Connection */}
            <div
              onClick={() => setShowServerModal(true)}
              className="p-4 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl theme-card-subtle flex items-center justify-center text-[#5B47FB]">
                  <Server size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold theme-text">Backend Server</p>
                  <p className="text-[11px] font-mono theme-text-secondary truncate max-w-[180px]">
                    {getServerUrl()}
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-[#5B47FB] font-semibold">Configure →</span>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full py-3.5 rounded-full theme-card border-red-500/30 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>

        <p className="text-[11px] text-center theme-text-muted font-mono pt-2">
          Arena AIML Mobile v1.0.2 • Student Portal
        </p>
      </main>

      <ServerConfigModal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
      />
    </div>
  );
};

export default ProfileScreen;
