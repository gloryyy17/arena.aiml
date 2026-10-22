import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getErrorMessage, getServerUrl } from '../api/axios';
import ServerConfigModal from '../components/ServerConfigModal';
import { Sparkles, ArrowLeft, RefreshCw, KeyRound, Mail, Server, Sun, Moon, AlertTriangle, Wifi, Smartphone } from 'lucide-react';

const LoginScreen = () => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const msg = getErrorMessage(err, 'Invalid credentials.');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoStudent = () => {
    setEmail('student@arena.aiml');
    setPassword('password123');
  };

  const handleInstantDemoLogin = async () => {
    setSubmitting(true);
    try {
      await login('student@arena.aiml', 'password123');
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Demo sign-in failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const isNetworkErr = error && (
    error.toLowerCase().includes('network') ||
    error.toLowerCase().includes('connect') ||
    error.toLowerCase().includes('timeout') ||
    error.toLowerCase().includes('unreachable')
  );

  return (
    <div className="min-h-screen theme-bg theme-text p-6 flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full theme-card flex items-center justify-center text-zinc-500 hover:theme-text active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-2">
            {/* Server Settings button */}
            <button
              onClick={() => setShowServerModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full theme-card text-[11px] font-mono text-zinc-600 dark:text-zinc-300 shadow-sm active:scale-95 transition-all"
            >
              <Server size={12} className="text-[#5B47FB]" />
              <span className="truncate max-w-[130px]">
                {getServerUrl().replace(/^https?:\/\//, '').replace(/\/api$/, '')}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full theme-card flex items-center justify-center text-zinc-600 dark:text-zinc-300 active:scale-95 transition-all shadow-sm"
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[#5B47FB]" />}
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5B47FB]/15 border border-[#5B47FB]/30 text-[#5B47FB] dark:text-[#A5B4FC] text-xs font-mono font-bold">
            <Sparkles size={12} /> Student Access
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight theme-text">
            Sign In to Arena
          </h1>
          <p className="text-xs theme-text-secondary">
            Access campus hackathons, event passes, and AI concierge assistant.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 font-mono mb-4 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
            {isNetworkErr && (
              <div className="pt-2 border-t border-red-500/20 space-y-2">
                <p className="text-[10px] opacity-80 leading-snug">
                  If your phone is on 5G mobile data, local IP (10.18.157.15) cannot be reached. You can sign in using Demo mode or connect phone & laptop to the same Wi-Fi.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    className="px-3 py-1.5 rounded-xl bg-[#5B47FB] text-white text-[11px] font-semibold active:scale-95 transition-all shadow-sm"
                  >
                    Enter as Demo Student 🚀
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowServerModal(true)}
                    className="px-3 py-1.5 rounded-xl theme-card theme-text text-[11px] font-semibold active:scale-95 transition-all shadow-sm flex items-center gap-1"
                  >
                    <Server size={11} /> Change IP
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider theme-text-secondary mb-1.5">
              Student Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@arena.aiml"
                className="w-full pl-10 pr-4 py-3 rounded-2xl theme-input text-xs outline-none focus:border-[#5B47FB] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider theme-text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl theme-input text-xs outline-none focus:border-[#5B47FB] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-full bg-[#5B47FB] hover:bg-[#4F3DDB] text-white font-semibold text-xs shadow-lg shadow-[#5B47FB]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
          >
            {submitting && <RefreshCw size={14} className="animate-spin" />}
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Sign-in helper */}
        <div className="mt-5 pt-4 border-t theme-border flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleInstantDemoLogin}
            className="w-full py-2.5 rounded-2xl theme-card border-[#5B47FB]/30 theme-text text-xs font-semibold hover:border-[#5B47FB] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles size={13} className="text-[#5B47FB]" />
            <span>1-Tap Demo Student Login</span>
          </button>

          <button
            type="button"
            onClick={handleDemoStudent}
            className="text-[11px] font-mono text-[#5B47FB] dark:text-[#A5B4FC] hover:underline"
          >
            Fill Demo Student Account Credentials
          </button>
        </div>
      </div>

      <div className="text-center py-4">
        <button
          type="button"
          onClick={() => setShowServerModal(true)}
          className="text-[11px] theme-text-muted font-mono hover:theme-text transition-colors"
        >
          Server Settings ⚙️
        </button>
      </div>

      <ServerConfigModal
        isOpen={showServerModal}
        onClose={() => setShowServerModal(false)}
      />
    </div>
  );
};

export default LoginScreen;
